"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

function normalizeOption(option) {
  if (typeof option === "string") {
    return { value: option, label: option };
  }

  return {
    value: option.value,
    label: option.label ?? option.value,
    accountNumber: option.accountNumber ?? "",
    disabled: option.disabled ?? false,
  };
}

export default function Dropdown({
  options = [],
  value,
  defaultValue = "",
  onChange,
  placeholder = "Pilih opsi",
  showCheck = true,
  label,
  name,
  disabled = false,
  searchable = false,
  searchPlaceholder = "Cari...",
  className = "",
}) {
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [search, setSearch] = useState("");
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;
  const normalizedOptions = options.map(normalizeOption);
  const selectedOption = normalizedOptions.find(
    (option) => option.value === selectedValue
  );
  const filteredOptions = normalizedOptions.filter((option) =>
    `${option.label} ${option.accountNumber ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedTrigger = dropdownRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const updateMenuPosition = () => {
      const triggerBounds = triggerRef.current?.getBoundingClientRect();

      if (!triggerBounds) return;

      const gap = 6;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerBounds.bottom - gap;
      const spaceAbove = triggerBounds.top - gap;

      // Buka ke atas jika ruang di bawah sempit tapi ruang di atas lebih lega.
      const openUpward = spaceBelow < 200 && spaceAbove > spaceBelow;

      // Batasi tinggi panel ke ruang yang tersedia (maks 288px = max-h-72),
      // supaya panel tidak pernah keluar viewport / terlihat terpotong.
      const available = openUpward ? spaceAbove : spaceBelow;
      const maxHeight = Math.max(120, Math.min(288, available));

      setMenuPosition({
        left: triggerBounds.left,
        top: openUpward ? undefined : triggerBounds.bottom + gap,
        bottom: openUpward ? viewportHeight - triggerBounds.top + gap : undefined,
        width: triggerBounds.width,
        maxHeight,
      });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (option) => {
    if (option.disabled) return;

    if (!isControlled) {
      setInternalValue(option.value);
    }

    onChange?.(option.value, option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="mb-2 block font-poppins text-xs font-semibold text-[#475569]">
          {label}
        </label>
      )}

      {name && <input type="hidden" name={name} value={selectedValue ?? ""} />}

      {searchable && isOpen ? (
        <div
          ref={triggerRef}
          className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-[#38BDF8] bg-white px-4 text-left font-poppins text-sm outline-none"
        >
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={selectedOption?.label ?? placeholder}
            className="min-w-0 flex-1 bg-transparent font-poppins text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
          />
          <button
            type="button"
            aria-label="Tutup pilihan"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => setIsOpen(false)}
            className="shrink-0 text-[#64748B] hover:text-[#38BDF8]"
          >
            <ChevronDown size={17} className="rotate-180" />
          </button>
        </div>
      ) : (
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          setSearch("");
          setIsOpen((currentState) => !currentState);
        }}
        className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-[#DCE5EF] bg-white px-4 text-left font-poppins text-sm text-[#596275] outline-none transition hover:border-[#38BDF8] focus:border-[#38BDF8] disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-60"
      >
        <span className={selectedOption ? "text-[#475569]" : "text-[#94A3B8]"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={17}
          className={`shrink-0 text-[#64748B] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      )}

      {isOpen && !disabled && menuPosition && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={label ?? placeholder}
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
            bottom: menuPosition.bottom,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight,
          }}
          className="fixed z-[9999] overflow-y-auto rounded-xl border border-[#DCE5EF] bg-white p-2 shadow-lg"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 font-poppins text-sm text-[#94A3B8]">
              Tidak ada pilihan
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.value === selectedValue;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left font-poppins text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${isSelected ? "bg-[#EAF9FF] text-[#38BDF8]" : "text-[#8A8F9D] hover:bg-[#F0FBFF] hover:text-[#38BDF8]"}`}
                >
                  <span>{option.label}</span>
                  {showCheck && isSelected && (
                    <Check size={20} strokeWidth={3} className="shrink-0 text-[#38BDF8]" />
                  )}
                </button>
              );
            })
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
