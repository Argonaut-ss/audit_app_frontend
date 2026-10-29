"use client";

import { useState } from "react";

import { FileText } from "lucide-react";
import { useParams } from "next/navigation";

import BukuBesarAccountHeader from "@/components/layout/mahasiswa/audit/buku_besar/header/buku_besar_account_header";

import BukuBesarContent from "@/components/layout/mahasiswa/audit/buku_besar/content/buku_besar_content";

// Daftar akun Buku Besar
const BUKU_BESAR_ACCOUNTS = [
    { code: "A", name: "Kas dan Setara Kas" },
    { code: "B", name: "Piutang" },
    { code: "C", name: "Persediaan" },
    { code: "D", name: "Aset Lain-Lain" },
    { code: "E", name: "Aset Tetap" },
    { code: "F", name: "Utang Usaha" },
    { code: "G", name: "Utang Bank" },
    { code: "H", name: "Utang Pajak" },
    { code: "I", name: "Utang Pembiayaan" },
    { code: "J", name: "Utang Lain-Lain" },
    { code: "K", name: "Ekuitas" },
    { code: "L", name: "Penjualan" },
    { code: "M", name: "Beban Pokok Penjualan" },
    { code: "N", name: "Beban Usaha" },
    { code: "O", name: "Pendapatan (Beban) Lain-Lain" },
    { code: "P", name: "Pajak Penghasilan" },
];


export default function BukuBesarPage() {

    const params = useParams();
    const jwbKasusId = params.id;

    const [selectedAccountIndex, setSelectedAccountIndex] =
        useState(0);

    const selectedAccount =
        BUKU_BESAR_ACCOUNTS[selectedAccountIndex];


    // Pilih akun melalui dropdown
    const handleAccountChange = (code) => {
        const index = BUKU_BESAR_ACCOUNTS.findIndex(
            (account) => account.code === code
        );

        if (index !== -1) {
            setSelectedAccountIndex(index);
        }
    };


    // Navigasi akun sebelumnya
    const handlePrevious = () => {
        setSelectedAccountIndex((current) =>
            Math.max(current - 1, 0)
        );
    };


    // Navigasi akun berikutnya
    const handleNext = () => {
        setSelectedAccountIndex((current) =>
            Math.min(
                current + 1,
                BUKU_BESAR_ACCOUNTS.length - 1
            )
        );
    };


    return (
        <main className="w-full pr-6 pt-4 pb-4">

            <div className="mx-auto max-w-[1300px]">

                <section
                    className="
                        min-h-[calc(100vh-98px)]
                        overflow-hidden
                        rounded-xl
                        bg-white
                        shadow-sm
                    "
                >

                    {/* HEADER UTAMA */}
                    <div
                        className="
                            flex items-center gap-4 bg-[#51B7FF] px-8 py-6
                        "
                    >
                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-white/15
                            "
                        >
                            <FileText
                                size={22}
                                strokeWidth={1.8}
                                className="text-white"
                            />
                        </div>

                        <div>
                            <h1
                                className="
                                    font-poppins text-xl font-semibold text-white
                                "
                            >
                                Buku Besar
                            </h1>

                            <p
                                className="
                                    font-poppins text-xs text-white/80
                                "
                            >
                                Ringkasan akhir saldo tiap akun
                                sebagai dasar pemeriksaan
                            </p>
                        </div>
                    </div>


                    {/* CONTENT */}
                    <div className="px-5 pb-6 pt-10">

                        {/* HEADER NAVIGASI AKUN */}
                        <BukuBesarAccountHeader
                            accounts={BUKU_BESAR_ACCOUNTS}
                            selectedAccount={selectedAccount}
                            selectedAccountIndex={selectedAccountIndex}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onAccountChange={handleAccountChange}
                        />


                        {/* LABEL BUKU BESAR */}
                        <div
                            className="
                                mt-6
                                border-b
                                border-[#E2E8F0]
                                px-5
                                pb-4
                            "
                        >
                            <p
                                className="
                                    font-poppins
                                    text-xs
                                    font-medium
                                    text-[#94A3B8]
                                "
                            >
                                Buku Besar:

                                <span
                                    className="
                                        ml-2
                                        font-semibold
                                        text-[#0EA5E9]
                                    "
                                >
                                    {selectedAccount.code}
                                    {" — "}
                                    {selectedAccount.name}
                                </span>
                            </p>
                        </div>


                        {/* AREA KONTEN BUKU BESAR */}
                        <div
                            className="
                                mt-3
                                min-h-[316px]
                                rounded-xl
                                border
                                border-[#DCE5EF]
                                bg-white
                            "
                        >
                            <BukuBesarContent
                                accountCode={selectedAccount.code}
                                jwbKasusId={jwbKasusId}
                            />
                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
}