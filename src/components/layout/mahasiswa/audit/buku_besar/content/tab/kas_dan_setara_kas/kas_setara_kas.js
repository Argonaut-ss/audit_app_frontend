"use client";

import { useState } from "react";

import BukuBesarSectionForm from "@/components/layout/mahasiswa/audit/buku_besar/buku_besar_section/buku_besar_section";


// Data awal sementara berdasarkan screenshot.
// Nantinya bisa diganti dengan data dari backend.
const initialKasRows = [
    {
        id: "kas-1",
        account: "Kas di Bank",
        perBook: "10.003.512.720",
        ajeRje: "-263.869.270",
        auditedBerjalan: "9.739.643.450",
        auditedSebelum: "8.497.338.192",
    },
    {
        id: "kas-2",
        account: "Kas Kecil",
        perBook: "500.175.636",
        ajeRje: "-730.000",
        auditedBerjalan: "499.445.636",
        auditedSebelum: "424.866.910",
    },
];


const initialBankRows = [
    {
        id: "bank-1",
        account: "Bank XYZ",
        perBook: "4.169.008.480",
        ajeRje: "-58.000.000",
        auditedBerjalan: "4.111.008.480",
        auditedSebelum: "3.714.892.128",
    },
    {
        id: "bank-2",
        account: "Bank BCD",
        perBook: "3.334.504.240",
        ajeRje: "-51.500.000",
        auditedBerjalan: "3.283.004.240",
        auditedSebelum: "2.832.446.064",
    },
    {
        id: "bank-3",
        account: "Bank ABC",
        perBook: "2.500.000.000",
        ajeRje: "-154.369.270",
        auditedBerjalan: "2.345.630.730",
        auditedSebelum: "1.950.000.000",
    },
];


const initialDates = {
    perBook: "2022-12-31",
    auditedBerjalan: "2022-12-31",
    auditedSebelum: "",
};


export default function KasSetaraKas({
    onSave,
    isSaving = false,
}) {
    // =========================
    // STATE KAS DAN SETARA KAS
    // =========================

    const [kasRows, setKasRows] =
        useState(initialKasRows);

    const [kasDates, setKasDates] =
        useState(initialDates);


    // =========================
    // STATE RINCIAN BANK
    // =========================

    const [bankRows, setBankRows] =
        useState(initialBankRows);

    const [bankDates, setBankDates] =
        useState(initialDates);


    // =========================
    // HANDLE PERUBAHAN BARIS
    // =========================

    const handleRowChange = (
        setRows,
        rowId,
        field,
        value
    ) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === rowId
                    ? {
                        ...row,
                        [field]: value,
                    }
                    : row
            )
        );
    };


    // =========================
    // HANDLE PERUBAHAN TANGGAL
    // =========================

    const handleDateChange = (
        setDates,
        field,
        value
    ) => {
        setDates((prev) => ({
            ...prev,
            [field]: value,
        }));
    };


    // =========================
    // HANDLE TAMBAH BARIS
    // =========================

    const handleAddRow = (
        setRows,
        prefix,
        defaultAccount
    ) => {
        const newRow = {
            id: `${prefix}-${crypto.randomUUID()}`,
            account: defaultAccount,
            perBook: "",
            ajeRje: "",
            auditedBerjalan: "",
            auditedSebelum: "",
        };

        setRows((prev) => [
            ...prev,
            newRow,
        ]);
    };


    // =========================
    // HANDLE HAPUS BARIS
    // =========================

    const handleRemoveRow = (
        setRows,
        rowId
    ) => {
        setRows((prev) =>
            prev.filter(
                (row) => row.id !== rowId
            )
        );
    };


    // =========================
    // HANDLE SIMPAN
    // =========================

    const handleSave = async () => {
        if (!onSave) {
            console.warn(
                "Handler onSave belum dihubungkan ke API Buku Besar."
            );
            return;
        }

        const payload = {
            kasDates,
            bankDates,
            kasRows,
            bankRows,
        };

        await onSave(payload);
    };


    return (
        <div className="overflow-hidden rounded-xl bg-white">

            {/* =========================
                KELOMPOK 1:
                KAS DAN SETARA KAS
            ========================= */}

            <BukuBesarSectionForm
                title="Kas dan Setara Kas"
                accountOptions={[
                    "Kas di Bank",
                    "Kas Kecil",
                ]}
                rows={kasRows}
                dates={kasDates}
                onDateChange={(field, value) =>
                    handleDateChange(
                        setKasDates,
                        field,
                        value
                    )
                }
                onRowChange={(
                    rowId,
                    field,
                    value
                ) =>
                    handleRowChange(
                        setKasRows,
                        rowId,
                        field,
                        value
                    )
                }
                onAddRow={() =>
                    handleAddRow(
                        setKasRows,
                        "kas",
                        "Kas di Bank"
                    )
                }
                onRemoveRow={(rowId) =>
                    handleRemoveRow(
                        setKasRows,
                        rowId
                    )
                }
            />

            <div className="mx-5 h-px bg-[#E2E8F0]" />

            {/* =========================
                KELOMPOK 2:
                RINCIAN SETARA KAS - BANK
            ========================= */}

            <BukuBesarSectionForm
                title="Rincian Setara Kas – Bank"
                accountOptions={[
                    "Bank XYZ",
                    "Bank BCD",
                    "Bank ABC",
                ]}
                rows={bankRows}
                dates={bankDates}
                onDateChange={(field, value) =>
                    handleDateChange(
                        setBankDates,
                        field,
                        value
                    )
                }
                onRowChange={(
                    rowId,
                    field,
                    value
                ) =>
                    handleRowChange(
                        setBankRows,
                        rowId,
                        field,
                        value
                    )
                }
                onAddRow={() =>
                    handleAddRow(
                        setBankRows,
                        "bank",
                        "Bank XYZ"
                    )
                }
                onRemoveRow={(rowId) =>
                    handleRemoveRow(
                        setBankRows,
                        rowId
                    )
                }
            />


            {/* =========================
                TOMBOL SIMPAN
            ========================= */}

            <div className="flex justify-end px-5 py-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
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
                    {isSaving
                        ? "Menyimpan..."
                        : "Simpan"}
                </button>
            </div>

        </div>
    );
}