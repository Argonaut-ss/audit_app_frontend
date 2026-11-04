
"use client";

import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Search,
    Check,
} from "lucide-react";

import { useState, useRef, useEffect } from "react";

export default function BukuBesarAccountHeader({
    accounts,
    selectedAccount,
    selectedAccountIndex,
    onPrevious,
    onNext,
    onAccountChange,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const dropdownRef = useRef(null);

    // =========================
    // DETEKSI KLIK DI LUAR DROPDOWN
    // =========================
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    if (!selectedAccount) return null;

    // =========================
    // FILTER AKUN
    // =========================
    const filteredAccounts = accounts.filter((account) =>
        `${account.code} ${account.name}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // =========================
    // PILIH AKUN
    // =========================
    const handleSelect = (code) => {
        onAccountChange(code);
        setIsOpen(false);
        setSearch("");
    };

    // =========================
    // TOGGLE DROPDOWN
    // =========================
    const handleToggleDropdown = () => {
        setIsOpen((prev) => !prev);
        setSearch("");
    };

    return (
        <div className="flex flex-wrap items-center gap-2 px-5">
            {/* LABEL AKUN */}
            <span className="
                mr-1
                font-poppins
                text-sm
                font-semibold
                uppercase
                tracking-wide
                text-[#64748B]
            ">
                Akun:
            </span>

            {/* PREVIOUS BUTTON */}
            <button
                type="button"
                onClick={onPrevious}
                disabled={selectedAccountIndex === 0}
                className="
                    flex h-11 items-center gap-2
                    rounded-xl border border-[#CBD5E1]
                    bg-white px-4
                    font-poppins text-sm font-medium
                    text-[#334155] shadow-sm transition
                    hover:border-[#38BDF8]
                    disabled:opacity-50
                "
            >
                <ChevronLeft size={18} />
                Prev
            </button>

            {/* DROPDOWN AKUN */}
            <div
                ref={dropdownRef}
                className="relative w-[350px] max-w-full"
            >
                {/* SELECTED ACCOUNT */}
                <button
                    type="button"
                    onClick={handleToggleDropdown}
                    className={`
                        flex h-11 w-full items-center gap-3
                        rounded-xl border bg-white px-4
                        text-left shadow-sm transition
                        ${
                            isOpen
                                ? "border-[#38BDF8]"
                                : "border-[#DCE5EF]"
                        }
                    `}
                >
                    <span className="
                        flex h-7 w-7 shrink-0
                        items-center justify-center
                        rounded-md bg-[#E0F5FF]
                        font-poppins text-xs
                        font-semibold text-[#0EA5E9]
                    ">
                        {selectedAccount.code}
                    </span>

                    <span className="
                        min-w-0 flex-1 truncate
                        font-poppins text-sm
                        font-semibold text-[#334155]
                    ">
                        {selectedAccount.name}
                    </span>

                    <ChevronDown
                        size={18}
                        className={`
                            shrink-0 text-[#94A3B8]
                            transition-transform
                            ${isOpen ? "rotate-180" : ""}
                        `}
                    />
                </button>

                {/* DROPDOWN CONTENT */}
                {isOpen && (
                    <div className="
                        absolute left-0 top-[calc(100%+6px)]
                        z-50 w-full rounded-xl
                        border border-[#DCE5EF]
                        bg-white p-2 shadow-lg
                    ">
                        {/* SEARCH */}
                        <div className="
                            mb-2 flex h-10 items-center
                            gap-2 rounded-lg border
                            border-[#B8D9FF] px-3
                            focus-within:border-[#38BDF8]
                        ">
                            <Search
                                size={17}
                                className="shrink-0 text-[#94A3B8]"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Ketik nama akun / huruf (cth: piutang, HPP, E)..."
                                className="
                                    min-w-0 flex-1
                                    bg-transparent
                                    font-poppins text-xs
                                    text-[#334155]
                                    outline-none
                                    placeholder:text-[#94A3B8]
                                "
                                autoFocus
                            />
                        </div>

                        {/* ACCOUNT LIST */}
                        <div className="
                            max-h-64 space-y-1
                            overflow-y-auto
                        ">
                            {filteredAccounts.length === 0 ? (
                                <p className="
                                    px-3 py-4 text-center
                                    font-poppins text-sm
                                    text-[#94A3B8]
                                ">
                                    Tidak ada akun ditemukan
                                </p>
                            ) : (
                                filteredAccounts.map((account) => {
                                    const active =
                                        account.code === selectedAccount.code;

                                    return (
                                        <button
                                            key={account.code}
                                            type="button"
                                            onClick={() =>
                                                handleSelect(account.code)
                                            }
                                            className={`
                                                flex w-full items-center
                                                gap-3 rounded-lg px-3
                                                py-2.5 text-left
                                                transition
                                                ${
                                                    active
                                                        ? "bg-[#EAF9FF] text-[#38BDF8]"
                                                        : "text-[#64748B] hover:bg-[#F0FBFF]"
                                                }
                                            `}
                                        >
                                            <span
                                                className={`
                                                    flex h-6 w-6 shrink-0
                                                    items-center justify-center
                                                    rounded-md
                                                    font-poppins text-[10px]
                                                    font-semibold
                                                    ${
                                                        active
                                                            ? "bg-[#38BDF8] text-white"
                                                            : "bg-[#F1F5F9] text-[#64748B]"
                                                    }
                                                `}
                                            >
                                                {account.code}
                                            </span>

                                            <span className="
                                                min-w-0 flex-1 truncate
                                                font-poppins text-sm
                                            ">
                                                {account.name}
                                            </span>

                                            {active && (
                                                <Check
                                                    size={17}
                                                    className="shrink-0 text-[#38BDF8]"
                                                />
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* NEXT BUTTON */}
            <button
                type="button"
                onClick={onNext}
                disabled={
                    selectedAccountIndex === accounts.length - 1
                }
                className="
                    flex h-11 items-center gap-2
                    rounded-xl border border-[#CBD5E1]
                    bg-white px-4
                    font-poppins text-sm font-medium
                    text-[#334155] shadow-sm transition
                    hover:border-[#38BDF8]
                    disabled:opacity-50
                "
            >
                Next
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
