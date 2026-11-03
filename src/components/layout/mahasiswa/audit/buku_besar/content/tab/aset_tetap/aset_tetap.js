
"use client";

import { useAsetTetap } from "@/hooks/mahasiswa/tugas/audit/buku_besar/aset_tetap/use_aset_tetap";

import BukuBesarSectionForm from "@/components/layout/mahasiswa/audit/buku_besar/buku_besar_section/buku_besar_section";

import AlertSuccess from "@/components/alert/alert_success";

function TotalAmountField({ value }) {
    return (
        <div className="
            flex h-10 min-w-0 items-center overflow-hidden
            rounded-lg bg-[#F1F5F9]
        ">
            <span className="
                flex h-full items-center border-r border-white
                px-3 font-poppins text-sm text-[#64748B]
            ">
                Rp
            </span>

            <span className="
                min-w-0 flex-1 truncate px-2 text-right
                font-poppins text-sm text-[#334155]
            ">
                {value ?? "0"}
            </span>
        </div>
    );
}

function TotalAsetTetap({ totals }) {
    return (
        <div className="px-5 py-4">
            <div className="
                grid
                grid-cols-[minmax(150px,1.2fr)_minmax(120px,1fr)_minmax(115px,0.9fr)_16px_minmax(140px,1fr)_minmax(140px,1fr)_24px]
                items-center
                gap-2
            ">
                <p className="
                    font-poppins text-sm font-semibold text-[#0F172A]
                ">
                    Total Aset Bersih
                </p>

                <TotalAmountField value={totals.perBook} />
                <TotalAmountField value={totals.ajeRje} />

                <div />

                <TotalAmountField value={totals.auditedBerjalan} />
                <TotalAmountField value={totals.auditedSebelum} />

                <div />
            </div>
        </div>
    );
}

export default function AsetTetap({
    jwbKasusId,
}) {
    const {
        asetTetapRows,
        akumulasiRows,
        dates,
        totalAsetTetap,
        loading,
        saving,
        error,
        successMessage,
        setSuccessMessage,
        handleDateChange,
        handleSave,
    } = useAsetTetap({
        jwbKasusId,
        top: "E",
    });

    return (
        <>
            <AlertSuccess
                message={successMessage}
                onClose={() => setSuccessMessage("")}
            />

            {loading && (
                <p className="px-5 py-3 text-sm text-gray-500">
                    Memuat data Buku Besar...
                </p>
            )}

            {error && (
                <p className="px-5 py-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="overflow-hidden rounded-xl bg-white">
                {/* SECTION 1: ASET TETAP */}
                <BukuBesarSectionForm
                    title="Aset Tetap"
                    subtitle="Aset Tetap"
                    rows={asetTetapRows}
                    dates={dates}
                    onDateChange={handleDateChange}
                    totalTitle="Total Aset"
                />

                <div className="mx-5 h-px bg-[#E2E8F0]" />

                {/* SECTION 2: AKUMULASI PENYUSUTAN */}
                <BukuBesarSectionForm
                    title="Akumulasi Penyusutan Aset Tetap"
                    subtitle="Akumulasi Penyusutan Aset Tetap"
                    rows={akumulasiRows}
                    dates={dates}
                    onDateChange={handleDateChange}
                    totalTitle="Total Akumulasi Penyusutan"
                />

                <div className="mx-5 h-px bg-[#E2E8F0]" />

                {/* GRAND TOTAL: DIBUAT DI FILE INI */}
                <TotalAsetTetap totals={totalAsetTetap} />

                {/* TOMBOL SIMPAN */}
                <div className="flex justify-end px-5 py-4">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="
                            min-w-[100px]
                            rounded-lg
                            bg-[#05A80B]
                            px-5
                            py-2.5
                            font-poppins
                            text-xs
                            font-semibold
                            text-white
                            transition
                            hover:bg-[#04930A]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </>
    );
}
