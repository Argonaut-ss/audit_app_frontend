"use client";

import { useState } from "react";
import { CalendarDays, FileCheck } from "lucide-react";

import Wbs from "@/components/layout/mahasiswa/audit/kertas_kerja/wbs/wbs";
import Wpl from "@/components/layout/mahasiswa/audit/kertas_kerja/wpl/wpl";

const TABS = {
    WBS: "wbs",
    WPL: "wpl",
};

export default function KertasKerjaPage() {
    const [activeTab, setActiveTab] = useState(TABS.WBS);

    return (
        <main className="w-full pr-6 pt-4 pb-4">
            <section className="mx-auto min-h-[calc(100vh-98px)] max-w-[1300px] overflow-hidden rounded-xl bg-white shadow-sm">
                <header className="flex items-center gap-4 bg-[#51B7FF] px-8 py-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                        <FileCheck size={22} strokeWidth={1.8} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-poppins text-xl font-semibold text-white">
                            Kertas Kerja
                        </h1>
                        <p className="font-poppins text-xs text-white/80">
                            Ringkasan akhir saldo tiap akun sebagai dasar pemeriksaan
                        </p>
                    </div>
                </header>

                <div className="px-5 pb-8 pt-6">
                    <div className="relative -top-1 grid grid-cols-[1.4fr_repeat(4,1fr)] items-center border-b border-[#E2E8F0] py-4">
                        <div className="flex w-fit rounded-xl bg-[#EEF3F8] p-1.5">
                            {Object.entries(TABS).map(([label, value]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setActiveTab(value)}
                                    className={`min-w-[88px] rounded-lg px-6 py-2.5 font-poppins text-xs font-medium transition ${
                                        activeTab === value
                                            ? "bg-white text-[#1D9BEA] shadow-sm"
                                            : "text-[#64748B] hover:text-[#1D9BEA]"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {[
                            ["Per Book", "31 December 2022"],
                            ["AJE/RJE", ""],
                            ["Audited Berjalan", "31 December 2022"],
                            ["Audited Sebelum", "12 December 2022"],
                        ].map(([label, date]) => (
                            <div
                                key={label}
                                className="text-center font-poppins text-sm text-[#334155]"
                            >
                                <p className="font-semibold">{label}</p>
                                {date && (
                                    <p className="mt-2 flex items-center justify-center gap-1 text-sm text-[#475569]">
                                        <CalendarDays
                                            size={12}
                                            strokeWidth={1.8}
                                            className="text-[#94A3B8]"
                                        />
                                        {date}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-5">
                        {activeTab === TABS.WBS ? (
                            <Wbs />
                        ) : (
                            <Wpl />
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}