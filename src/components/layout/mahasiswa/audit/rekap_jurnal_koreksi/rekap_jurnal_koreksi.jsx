"use client";

import { FileText } from "lucide-react";
import { useState } from "react";

import Dropdown from "@/components/ui/dropdown/dropdown";

const JOURNAL_GROUPS = [
    {
        account: "Bahan Habis Pakai",
        accountNumber: "1-1410",
        debit: "Rp 410.000",
        credit: "Rp 0",
        counterpart: "Kas Kecil",
        counterpartNumber: "1-1120",
        counterpartDebit: "Rp 0",
        counterpartCredit: "Rp 410.000",
        description: "Pencatatan Pembelian ATK yang belum dicatat",
    },
    {
        account: "Kas di Bank",
        accountNumber: "1-0000",
        debit: "Rp 10.000.000",
        credit: "Rp 0",
        counterpart: "Bahan Habis Pakai",
        counterpartNumber: "1-1410",
        counterpartDebit: "Rp 0",
        counterpartCredit: "Rp 10.000.000",
        description: "Test",
    },
];

const SETARA_KAS_GROUPS = [
    {
        account: "Deposito Berjangka (≤ 3 Bulan)",
        accountNumber: "1-1130",
        debit: "Rp 25.000.000",
        credit: "Rp 0",
        counterpart: "Bank BCA Giro",
        counterpartNumber: "1-1111",
        counterpartDebit: "Rp 0",
        counterpartCredit: "Rp 25.000.000",
        description: "Koreksi reklasifikasi penempatan deposito jangka pendek sebagai setara kas",
    },
];

const PIUTANG_USAHA_GROUPS = [
    {
        account: "Beban Kerugian Piutang Tak Tertagih",
        accountNumber: "6-1200",
        debit: "Rp 15.500.000",
        credit: "Rp 0",
        counterpart: "Cadangan Kerugian Piutang",
        counterpartNumber: "1-1220",
        counterpartDebit: "Rp 0",
        counterpartCredit: "Rp 15.500.000",
        description: "Usulan penambahan cadangan penurunan nilai piutang PT Jaya Abadi (Aging > 90 hari)",
    },
];

function JournalSection({ title, entryCount, journals }) {
    return (
        <section className="mt-7 rounded-xl border border-[#DCE5EF] bg-white p-4">
            <div className="flex items-center justify-between border-b border-[#EEF2F7] pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7FE]">
                        <FileText size={18} strokeWidth={1.8} className="text-[#20A9E5]" />
                    </div>
                    <h2 className="font-poppins text-sm font-semibold text-[#334155]">
                        {title}
                    </h2>
                </div>
                <span className="rounded-lg bg-[#F1F5F9] px-3 py-1.5 font-poppins text-[10px] font-medium text-[#475569]">
                    {entryCount} entri
                </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-[#DCE5EF]">
                <div className="grid grid-cols-[2fr_1.7fr_1.5fr_1.3fr] bg-[#F8FAFC] px-4 py-3 font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                    <span>Nama Akun</span>
                    <span>Nomor Akun</span>
                    <span className="text-right">Debet</span>
                    <span className="text-right">Kredit</span>
                </div>

                {journals.map((journal) => (
                    <div key={journal.account}>
                        <div className="grid grid-cols-[2fr_1.7fr_1.5fr_1.3fr] items-center border-t border-[#E8EEF4] px-4 py-3 font-poppins text-sm text-[#334155]">
                            <span>{journal.account}</span>
                            <span className="text-[#64748B]">{journal.accountNumber}</span>
                            <span className="text-right font-medium">{journal.debit}</span>
                            <span className="text-right text-[#94A3B8]">{journal.credit}</span>
                        </div>
                        <div className="grid grid-cols-[2fr_1.7fr_1.5fr_1.3fr] items-center border-t border-[#EEF2F6] px-4 py-3 font-poppins text-sm text-[#334155]">
                            <span className="pl-8">{journal.counterpart}</span>
                            <span className="text-[#64748B]">{journal.counterpartNumber}</span>
                            <span className="text-right text-[#94A3B8]">{journal.counterpartDebit}</span>
                            <span className="text-right font-medium">{journal.counterpartCredit}</span>
                        </div>
                        <div className="border-t border-[#EEF2F6] bg-[#F8FAFC] px-4 py-3 font-poppins text-xs italic text-[#64748B]">
                            <span className="mr-3 not-italic text-[9px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                                Keterangan:
                            </span>
                            {journal.description}
                        </div>
                        <div className="grid grid-cols-[2fr_1.7fr_1.5fr_1.3fr] border-t border-[#DCE5EF] bg-[#F8FAFC] px-4 py-3 font-poppins text-sm font-semibold text-[#334155]">
                            <span>Total</span>
                            <span />
                            <span className="text-right">{journal.debit}</span>
                            <span className="text-right">{journal.counterpartCredit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function RekapJurnalKoreksi() {
    const [selectedAccount, setSelectedAccount] = useState("");

    return (
        <div className="px-5 pb-5 pt-8">
            <div className="ml-2 w-full max-w-[320px]">
                <Dropdown
                    options={[
                        { value: "kas", label: "Kas" },
                        { value: "setara-kas", label: "Setara Kas" },
                        { value: "piutang-usaha", label: "Piutang Usaha" },
                    ]}
                    value={selectedAccount}
                    onChange={setSelectedAccount}
                    placeholder="Filter berdasarkan akun"
                />
            </div>

            <div className="mt-8 border-b border-[#DCE5EF]" />

            <JournalSection title="Kas" entryCount={2} journals={JOURNAL_GROUPS} />
            <JournalSection title="Setara Kas" entryCount={1} journals={SETARA_KAS_GROUPS} />
            <JournalSection title="Piutang Usaha" entryCount={1} journals={PIUTANG_USAHA_GROUPS} />
        </div>
    );
}