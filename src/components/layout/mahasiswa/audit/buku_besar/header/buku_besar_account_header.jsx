"use client";

import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Search,
    Check,
} from "lucide-react";

import { useState } from "react";

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

    if (!selectedAccount) return null;

    const filteredAccounts = accounts.filter((account) =>
        `${account.code} ${account.name}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const handleSelect = (code) => {
        onAccountChange(code);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div className="flex flex-wrap items-center gap-2 px-5">
            <span className="mr-1 font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                Akun:
            </span>

            <button
                type="button"
                onClick={onPrevious}
                disabled={selectedAccountIndex === 0}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3 text-xs font-medium text-[#334155] shadow-sm transition hover:border-[#38BDF8] disabled:opacity-50"
            >
                <ChevronLeft size={15} />
                Prev
            </button>

            {/* Dropdown akun */}
            <div className="relative w-[360px] max-w-full">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={`
                        flex h-10 w-full items-center gap-2
                        rounded-xl border bg-white px-3 text-left
                        transition shadow-sm
                        ${isOpen ? "border-[#38BDF8]" : "border-[#DCE5EF]"}
                    `}
                >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E0F5FF] text-[10px] font-semibold text-[#0EA5E9]">
                        {selectedAccount.code}
                    </span>

                    <span className="min-w-0 flex-1 truncate font-poppins text-xs font-semibold text-[#334155]">
                        {selectedAccount.name}
                    </span>

                    <ChevronDown
                        size={15}
                        className={`shrink-0 text-[#94A3B8] transition-transform ${
                            isOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full rounded-xl border border-[#DCE5EF] bg-white p-2 shadow-lg">
                        {/* Pencarian */}
                        <div className="mb-2 flex h-9 items-center gap-2 rounded-lg border border-[#B8D9FF] px-2.5 focus-within:border-[#38BDF8]">
                            <Search
                                size={14}
                                className="shrink-0 text-[#94A3B8]"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Ketik nama akun / huruf (cth: piutang, HPP, E)..."
                                className="min-w-0 flex-1 bg-transparent font-poppins text-[10px] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                                autoFocus
                            />
                        </div>

                        {/* Daftar akun */}
                        <div className="max-h-56 space-y-1 overflow-y-auto">
                            {filteredAccounts.length === 0 ? (
                                <p className="px-3 py-4 text-center font-poppins text-xs text-[#94A3B8]">
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
                                                flex w-full items-center gap-2
                                                rounded-lg px-2 py-2
                                                text-left transition
                                                ${
                                                    active
                                                        ? "bg-[#EAF9FF] text-[#38BDF8]"
                                                        : "text-[#64748B] hover:bg-[#F0FBFF]"
                                                }
                                            `}
                                        >
                                            <span
                                                className={`
                                                    flex h-5 w-5 shrink-0
                                                    items-center justify-center
                                                    rounded-md text-[9px] font-semibold
                                                    ${
                                                        active
                                                            ? "bg-[#38BDF8] text-white"
                                                            : "bg-[#F1F5F9] text-[#64748B]"
                                                    }
                                                `}
                                            >
                                                {account.code}
                                            </span>

                                            <span className="min-w-0 flex-1 truncate font-poppins text-[11px]">
                                                {account.name}
                                            </span>

                                            {active && (
                                                <Check
                                                    size={15}
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

            <button
                type="button"
                onClick={onNext}
                disabled={selectedAccountIndex === accounts.length - 1}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3 text-xs font-medium text-[#334155] shadow-sm transition hover:border-[#38BDF8] disabled:opacity-50"
            >
                Next
                <ChevronRight size={15} />
            </button>
        </div>
    );
}