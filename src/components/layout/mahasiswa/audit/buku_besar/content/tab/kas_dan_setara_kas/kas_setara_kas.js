"use client";

import { useEffect, useState } from "react";

import { getBukuBesar, updateBukuBesar } from "@/services/mahasiswa/tugas/audit/buku_besar/buku_besar";

// import { useBukuBesar } from "@/hooks/mahasiswa/audit/buku_besar/useBukuBesar";

import BukuBesarSectionForm from "@/components/layout/mahasiswa/audit/buku_besar/buku_besar_section/buku_besar_section";

import { mapBukuBesarRows } from "@/utils/mahasiswa/tugas/audit/buku_besar/buku_besar_utils";

import AlertSuccess from "@/components/alert/alert_success";

export default function KasSetaraKas({
    jwbKasusId,
    onSave,
    isSaving = false,
}) {


    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const [kasRows, setKasRows] = useState([]);
    const [bankRows, setBankRows] = useState([]);

    const emptyDates = {
        perBook: "",
        auditedBerjalan: "",
        auditedSebelum: "",
    };

    const [kasDates, setKasDates] = useState(emptyDates);
    const [bankDates, setBankDates] = useState(emptyDates);


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


    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");


    const handleSave = async () => {
        if (saving) return;

        setSaving(true);
        setSuccessMessage("");

        try {
            const response = await updateBukuBesar({
                jwbKasusId,
                top: "A",
                tanggalPerBook: kasDates.perBook,
                tanggalAuditJln: kasDates.auditedBerjalan,
                tanggalAuditSblm: kasDates.auditedSebelum,
            });

            if (!response?.success) {
                throw new Error(
                    response?.message || "Gagal menyimpan tanggal."
                );
            }

            setSuccessMessage("Data Buku Besar berhasil disimpan.");
        } catch (error) {
            console.error("Gagal menyimpan tanggal:", error);

            setApiError(
                error.response?.data?.message ||
                error.message ||
                "Terjadi kesalahan saat menyimpan data."
            );
        } finally {
            setSaving(false);
        }
    };





    useEffect(() => {
        if (!jwbKasusId) return;

        let cancelled = false;

        const fetchBukuBesar = async () => {
            setIsLoading(true);
            setApiError("");

            try {
                const response = await getBukuBesar({
                    jwbKasusId,
                    top: "A",
                });

                if (cancelled) return;

                if (!response?.success || !response?.data) {
                    throw new Error(
                        "Data Buku Besar tidak ditemukan."
                    );
                }

                const data = response.data;

                const kasMapping = data.sub_mappings?.find(
                    (item) =>
                        item.SubMapping === "Kas dan Setara Kas"
                );

                const bankMapping = data.sub_mappings?.find(
                    (item) =>
                        item.SubMapping ===
                        "Rincian Setara Kas - Bank"
                );

                // Isi tabel Kas dan Setara Kas
                setKasRows(
                    mapBukuBesarRows(kasMapping?.rows)
                );

                // Isi tabel Rincian Setara Kas - Bank
                setBankRows(
                    mapBukuBesarRows(bankMapping?.rows)
                );

                // Tanggal berasal dari response tingkat atas
                const dates = {
                    perBook: data.TanggalPerBook ?? "",
                    auditedBerjalan:
                        data.TanggalAuditJln ?? "",
                    auditedSebelum:
                        data.TanggalAuditSblm ?? "",
                };

                setKasDates(dates);
                setBankDates(dates);
            } catch (error) {
                if (cancelled) return;

                console.error(
                    "Gagal mengambil Buku Besar:",
                    error
                );

                setApiError(
                    error.response?.data?.message ||
                    error.message ||
                    "Gagal mengambil data Buku Besar."
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchBukuBesar();

        return () => {
            cancelled = true;
        };
    }, [jwbKasusId]);


    return (

        <>
            <AlertSuccess
                message={successMessage}
                onClose={() => setSuccessMessage("")}
            />
            {isLoading && (
                <p className="px-5 py-3 text-sm text-gray-500">
                    Memuat data Buku Besar...
                </p>
            )}

            {apiError && (
                <p className="px-5 py-3 text-sm text-red-600">
                    {apiError}
                </p>
            )}
            <div className="overflow-hidden rounded-xl bg-white">

                {/* =========================
                KELOMPOK 1:
                KAS DAN SETARA KAS
            ========================= */}

                <BukuBesarSectionForm
                    title="Kas dan Setara Kas"
                    subtitle="Kas dan Setara Kas"
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
                    subtitle="Kas dan Setara Kas"
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
                        disabled={saving}
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