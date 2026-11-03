
"use client";

import { useCallback, useEffect, useState } from "react";

import {
    getBukuBesar,
    updateBukuBesar,
} from "@/services/mahasiswa/tugas/audit/buku_besar/buku_besar";

const PENDAPATAN_MAPPING = "Pendapatan Lain-Lain";
const BEBAN_MAPPING = "Beban Lain-Lain";

const EMPTY_DATES = {
    perBook: "",
    auditedBerjalan: "",
    auditedSebelum: "",
};

const EMPTY_TOTALS = {
    perBook: "0",
    ajeRje: "0",
    auditedBerjalan: "0",
    auditedSebelum: "0",
};

const formatNominal = (value) =>
    Number(value ?? 0).toLocaleString("id-ID");

const mapRows = (rows = []) =>
    rows.map((item) => ({
        id: String(item.COAID),
        COAID: item.COAID,
        SubMapping: item.SubMapping,
        account: item.NamaAkun,
        perBook: formatNominal(item.PerBook),
        ajeRje: formatNominal(item.AJE_RJE),
        auditedBerjalan: formatNominal(
            item.AuditedBerjalan ?? item.AuditJln
        ),
        auditedSebelum: formatNominal(item.AuditSebelum),
    }));

const mapTotals = (totals = {}) => ({
    perBook: formatNominal(totals.PerBook),
    ajeRje: formatNominal(totals.AJE_RJE),
    auditedBerjalan: formatNominal(
        totals.AuditedBerjalan ?? totals.AuditJln
    ),
    auditedSebelum: formatNominal(totals.AuditSebelum),
});

export function usePendapatanBebanLainLain({
    jwbKasusId,
    top = "M",
}) {
    const [pendapatanRows, setPendapatanRows] = useState([]);
    const [bebanRows, setBebanRows] = useState([]);

    const [pendapatanAccountOptions, setPendapatanAccountOptions] =
        useState([]);

    const [bebanAccountOptions, setBebanAccountOptions] =
        useState([]);

    const [dates, setDates] = useState({ ...EMPTY_DATES });
    const [totalPendapatanBeban, setTotalPendapatanBeban] =
        useState({ ...EMPTY_TOTALS });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const applyResponseData = useCallback((data) => {
        const pendapatanMapping = data.sub_mappings?.find(
            (item) => item.SubMapping === PENDAPATAN_MAPPING
        );

        const bebanMapping = data.sub_mappings?.find(
            (item) => item.SubMapping === BEBAN_MAPPING
        );

        const mappedPendapatanRows = mapRows(
            pendapatanMapping?.rows ?? []
        );

        const mappedBebanRows = mapRows(
            bebanMapping?.rows ?? []
        );

        setPendapatanRows(mappedPendapatanRows);
        setBebanRows(mappedBebanRows);

        const availableAccounts = mapRows(
            data.available_accounts ?? []
        );

        setPendapatanAccountOptions(
            availableAccounts.filter(
                (item) => item.SubMapping === PENDAPATAN_MAPPING
            )
        );

        setBebanAccountOptions(
            availableAccounts.filter(
                (item) => item.SubMapping === BEBAN_MAPPING
            )
        );

        setTotalPendapatanBeban(mapTotals(data.totals));

        setDates({
            perBook: data.TanggalPerBook ?? "",
            auditedBerjalan: data.TanggalAuditJln ?? "",
            auditedSebelum: data.TanggalAuditSblm ?? "",
        });
    }, []);

    // =========================
    // GET BUKU BESAR TOP M
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
                        "Data Buku Besar Pendapatan (Beban) Lain-Lain tidak ditemukan."
                    );
                }

                applyResponseData(response.data);
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Gagal mengambil Buku Besar TOP M:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Gagal mengambil data Buku Besar."
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchBukuBesar();

        return () => {
            cancelled = true;
        };
    }, [jwbKasusId, top, applyResponseData]);

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
    // UBAH BARIS / DROPDOWN
    // =========================
    const handleRowChange = useCallback(
        (setRows, sourceRows, rowId, field, value) => {
            setRows((prev) =>
                prev.map((row) => {
                    if (row.id !== rowId) return row;

                    if (field === "account") {
                        const selectedAccount = sourceRows.find(
                            (item) => item.account === value
                        );

                        if (!selectedAccount) {
                            return {
                                ...row,
                                account: value,
                                COAID: null,
                            };
                        }

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
        (setRows, subMapping) => {
            const newRow = {
                id: `new-${crypto.randomUUID()}`,
                COAID: null,
                SubMapping: subMapping,
                account: "",
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
                ...pendapatanRows.map((row) => ({
                    COAID: row.COAID,
                    account: row.account,
                    SubMapping: PENDAPATAN_MAPPING,
                })),
                ...bebanRows.map((row) => ({
                    COAID: row.COAID,
                    account: row.account,
                    SubMapping: BEBAN_MAPPING,
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
                    response?.message ||
                    "Gagal menyimpan Buku Besar TOP M."
                );
            }

            if (response.data) {
                applyResponseData(response.data);
            }

            setSuccessMessage(
                response.message ||
                "Data Buku Besar berhasil disimpan."
            );
        } catch (err) {
            console.error(
                "Gagal menyimpan Buku Besar TOP M:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Terjadi kesalahan saat menyimpan data."
            );
        } finally {
            setSaving(false);
        }
    }, [
        saving,
        jwbKasusId,
        top,
        dates.auditedSebelum,
        pendapatanRows,
        bebanRows,
        applyResponseData,
    ]);

    return {
        pendapatanRows,
        bebanRows,
        setPendapatanRows,
        setBebanRows,

        pendapatanAccountOptions,
        bebanAccountOptions,

        dates,
        totalPendapatanBeban,

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
