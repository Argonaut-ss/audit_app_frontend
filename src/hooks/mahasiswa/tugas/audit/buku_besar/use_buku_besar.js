
"use client";

import { useCallback, useEffect, useState } from "react";

import {
    getBukuBesar,
    updateBukuBesar,
} from "@/services/mahasiswa/tugas/audit/buku_besar/buku_besar";

import { mapBukuBesarRows } from "@/utils/mahasiswa/tugas/audit/buku_besar/buku_besar_utils";

const EMPTY_DATES = {
    perBook: "",
    auditedBerjalan: "",
    auditedSebelum: "",
};

export function useBukuBesar({ jwbKasusId, top }) {
    const [kasRows, setKasRows] = useState([]);
    const [bankRows, setBankRows] = useState([]);

    const [kasAccountOptions, setKasAccountOptions] = useState([]);
    const [bankAccountOptions, setBankAccountOptions] = useState([]);

    // Tanggal berlaku untuk kedua bagian tabel.
    const [dates, setDates] = useState({ ...EMPTY_DATES });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =========================
    // GET BUKU BESAR
    // =========================
    useEffect(() => {
        if (!jwbKasusId || !top) return;

        let cancelled = false;

        const fetchBukuBesar = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getBukuBesar({
                    jwbKasusId,
                    top,
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
                        item.SubMapping === "Rincian Setara Kas - Bank"
                );

                const mappedKasRows = mapBukuBesarRows(kasMapping?.rows);
                const mappedBankRows = mapBukuBesarRows(bankMapping?.rows);

                setKasRows(mappedKasRows);
                setBankRows(mappedBankRows);

                // Simpan data sumber untuk mengisi nominal berdasarkan akun
                setKasAccountOptions(mappedKasRows);
                setBankAccountOptions(mappedBankRows);

                setDates({
                    perBook: data.TanggalPerBook ?? "",
                    auditedBerjalan: data.TanggalAuditJln ?? "",
                    auditedSebelum: data.TanggalAuditSblm ?? "",
                });
            } catch (err) {
                if (cancelled) return;

                console.error("Gagal mengambil Buku Besar:", err);

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Gagal mengambil data Buku Besar."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchBukuBesar();

        return () => {
            cancelled = true;
        };
    }, [jwbKasusId, top]);

    // =========================
    // UBAH TANGGAL
    // =========================
    const handleDateChange = useCallback((field, value) => {
        setDates((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    // =========================
    // UBAH BARIS
    // =========================

    const handleRowChange = useCallback(
        (setRows, sourceRows, rowId, field, value) => {
            setRows((prev) =>
                prev.map((row) => {
                    if (row.id !== rowId) return row;

                    // Jika akun berubah, ambil seluruh data
                    // nominal dari sumber API.
                    if (field === "account") {
                        const selectedAccount = sourceRows.find(
                            (item) => item.account === value
                        );

                        if (!selectedAccount) {
                            return { ...row, account: value };
                        }

                        // Pertahankan ID baris agar identitas
                        // baris UI tetap stabil.
                        return {
                            ...selectedAccount,
                            id: row.id,
                        };
                    }

                    return {
                        ...row,
                        [field]: value,
                    };
                })
            );
        },
        []
    );


    // =========================
    // TAMBAH BARIS
    // =========================

    const handleAddRow = useCallback(
        (setRows, sourceRows, prefix, defaultAccount) => {
            const selectedAccount = sourceRows.find(
                (item) => item.account === defaultAccount
            );

            const newRow = selectedAccount
                ? {
                    ...selectedAccount,
                    id: `${prefix}-${crypto.randomUUID()}`,
                }
                : {
                    id: `${prefix}-${crypto.randomUUID()}`,
                    account: defaultAccount,
                    perBook: "",
                    ajeRje: "",
                    auditedBerjalan: "",
                    auditedSebelum: "",
                };

            setRows((prev) => [...prev, newRow]);
        },
        []
    );


    // =========================
    // HAPUS BARIS
    // =========================
    const handleRemoveRow = useCallback((setRows, rowId) => {
        setRows((prev) =>
            prev.filter((row) => row.id !== rowId)
        );
    }, []);

    // =========================
    // SIMPAN TANGGAL
    // =========================
    const handleSave = useCallback(async () => {
        if (saving) return;

        if (!jwbKasusId) {
            setError("ID kasus tidak ditemukan.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await updateBukuBesar({
                jwbKasusId,
                top,
                tanggalPerBook: dates.perBook,
                tanggalAuditJln: dates.auditedBerjalan,
                tanggalAuditSblm: dates.auditedSebelum,
            });

            if (!response?.success) {
                throw new Error(
                    response?.message || "Gagal menyimpan tanggal."
                );
            }

            setSuccessMessage(
                response.message || "Data Buku Besar berhasil disimpan."
            );
        } catch (err) {
            console.error("Gagal menyimpan Buku Besar:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Terjadi kesalahan saat menyimpan data."
            );
        } finally {
            setSaving(false);
        }
    }, [jwbKasusId, top, dates, saving]);

    return {
        kasRows,
        bankRows,
        setKasRows,
        setBankRows,
    
        kasAccountOptions,
        bankAccountOptions,
    
        dates,
        loading,
        saving,
        error,
        successMessage,
        setSuccessMessage,
    
        handleDateChange,
        handleRowChange,
        handleAddRow,
        handleRemoveRow,
        handleSave,
    };
}
