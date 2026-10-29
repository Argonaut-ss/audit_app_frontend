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

export function useKasSetaraKas({ jwbKasusId, top }) {
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

                const mappedKasRows = mapBukuBesarRows(
                    kasMapping?.rows,
                    "Kas dan Setara Kas"
                );
                const mappedBankRows = mapBukuBesarRows(
                    bankMapping?.rows,
                    "Rincian Setara Kas - Bank"
                );

                setKasRows(mappedKasRows);
                setBankRows(mappedBankRows);

                // Mengambil master akun yang tersedia (dari available_accounts atau dari baris yang ada)
                const allAvailable = data.available_accounts?.length
                    ? mapBukuBesarRows(data.available_accounts)
                    : [...mappedKasRows, ...mappedBankRows];

                const kasMaster = allAvailable.filter(
                    (acc) => acc.SubMapping === "Kas dan Setara Kas"
                );
                const bankMaster = allAvailable.filter(
                    (acc) => acc.SubMapping === "Rincian Setara Kas - Bank"
                );

                setKasAccountOptions(
                    kasMaster.length ? kasMaster : mappedKasRows
                );
                setBankAccountOptions(
                    bankMaster.length ? bankMaster : mappedBankRows
                );

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

                    // Jika akun berubah, ambil seluruh data nominal dari master sumber
                    if (field === "account") {
                        const selectedAccount = (sourceRows || []).find(
                            (item) => item.account === value
                        );

                        if (!selectedAccount) {
                            return { ...row, account: value };
                        }

                        // Pertahankan ID baris agar identitas baris UI tetap stabil
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
        (setRows, newRowOrSource, prefix, defaultAccount, subMapping = "") => {
            // Jika dipanggil dari format baru Sam (mengirimkan objek newRow langsung)
            if (newRowOrSource && typeof newRowOrSource === "object" && "id" in newRowOrSource) {
                setRows((prev) => [...prev, newRowOrSource]);
                return;
            }

            const sourceRows = newRowOrSource;
            const selectedAccount = (sourceRows || []).find(
                (item) => item.account === defaultAccount
            );

            const newRow = selectedAccount
                ? {
                    ...selectedAccount,
                    id: `${prefix}-${crypto.randomUUID()}`,
                    SubMapping: subMapping || selectedAccount.SubMapping || "",
                }
                : {
                    id: `${prefix}-${crypto.randomUUID()}`,
                    COAID: null,
                    account: defaultAccount,
                    SubMapping: subMapping,
                    perBook: "0",
                    ajeRje: "0",
                    auditedBerjalan: "0",
                    auditedSebelum: "0",
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
    // SIMPAN BUKU BESAR
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
            const items = [
                ...kasRows.map((row) => ({
                    COAID: row.COAID,
                    account: row.account,
                    SubMapping: row.SubMapping || "Kas dan Setara Kas",
                })),
                ...bankRows.map((row) => ({
                    COAID: row.COAID,
                    account: row.account,
                    SubMapping: row.SubMapping || "Rincian Setara Kas - Bank",
                })),
            ];

            const response = await updateBukuBesar({
                jwbKasusId,
                top,
                tanggalAuditSblm: dates.auditedSebelum,
                items,
            });

            if (!response?.success) {
                throw new Error(
                    response?.message || "Gagal menyimpan Buku Besar."
                );
            }

            if (response.data) {
                const data = response.data;
                const kasMapping = data.sub_mappings?.find(
                    (item) => item.SubMapping === "Kas dan Setara Kas"
                );
                const bankMapping = data.sub_mappings?.find(
                    (item) => item.SubMapping === "Rincian Setara Kas - Bank"
                );

                if (kasMapping?.rows) {
                    setKasRows(mapBukuBesarRows(kasMapping.rows, "Kas dan Setara Kas"));
                }
                if (bankMapping?.rows) {
                    setBankRows(mapBukuBesarRows(bankMapping.rows, "Rincian Setara Kas - Bank"));
                }

                setDates((prev) => ({
                    ...prev,
                    perBook: data.TanggalPerBook ?? prev.perBook,
                    auditedBerjalan: data.TanggalAuditJln ?? prev.auditedBerjalan,
                    auditedSebelum: data.TanggalAuditSblm ?? prev.auditedSebelum,
                }));
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
    }, [jwbKasusId, top, dates, kasRows, bankRows, saving]);

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
