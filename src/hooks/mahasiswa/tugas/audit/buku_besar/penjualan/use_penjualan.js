
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

const PENJUALAN_MAPPING = "Penjualan";

const PENJUALAN_ACCOUNTS = [
    "Penjualan",
    "Diskon Penjualan",
    "Retur Penjualan",
];

const normalizeAccount = (value) =>
    String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

export function usePenjualan({ jwbKasusId, top = "J" }) {
    const [penjualanRows, setPenjualanRows] = useState([]);
    const [penjualanAccountOptions, setPenjualanAccountOptions] =
        useState([]);

    const [dates, setDates] = useState({ ...EMPTY_DATES });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =========================
    // GET BUKU BESAR PENJUALAN
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

                // =========================
                // AMBIL SUB MAPPING
                // =========================
                const penjualanMapping =
                    data.sub_mappings?.find(
                        (item) =>
                            normalizeAccount(item.SubMapping) ===
                            normalizeAccount(PENJUALAN_MAPPING)
                    );

                const mappedRows = mapBukuBesarRows(
                    penjualanMapping?.rows || [],
                    PENJUALAN_MAPPING
                );

                // =========================
                // AMBIL MASTER ACCOUNT
                // =========================
                const availableAccounts = mapBukuBesarRows(
                    data.available_accounts || []
                );

                const allAccounts = [
                    ...availableAccounts,
                    ...mappedRows,
                ];

                const accountLookup = new Map();

                allAccounts.forEach((account) => {
                    const key = normalizeAccount(account.account);

                    if (key && !accountLookup.has(key)) {
                        accountLookup.set(key, account);
                    }
                });

                // =========================
                // BENTUK 3 BARIS PENJUALAN
                // =========================
                const completeRows = PENJUALAN_ACCOUNTS.map(
                    (accountName, index) => {
                        const matchedAccount = accountLookup.get(
                            normalizeAccount(accountName)
                        );

                        const existingRow = mappedRows.find(
                            (row) =>
                                normalizeAccount(row.account) ===
                                normalizeAccount(accountName)
                        );

                        return {
                            ...(matchedAccount || {}),
                            ...(existingRow || {}),
                            id:
                                existingRow?.id ||
                                matchedAccount?.id ||
                                `penjualan-${index}`,
                            COAID:
                                existingRow?.COAID ??
                                matchedAccount?.COAID ??
                                null,
                            account: accountName,
                            SubMapping: PENJUALAN_MAPPING,
                            perBook: existingRow?.perBook ?? "0",
                            ajeRje: existingRow?.ajeRje ?? "0",
                            auditedBerjalan:
                                existingRow?.auditedBerjalan ?? "0",
                            auditedSebelum:
                                existingRow?.auditedSebelum ?? "0",
                        };
                    }
                );

                setPenjualanRows(completeRows);

                // =========================
                // DROPDOWN OPTIONS
                // =========================
                const accountOptions = PENJUALAN_ACCOUNTS.map(
                    (accountName, index) => {
                        const matchedAccount = accountLookup.get(
                            normalizeAccount(accountName)
                        );

                        return {
                            ...(matchedAccount || {}),
                            id:
                                matchedAccount?.id ||
                                `penjualan-option-${index}`,
                            COAID: matchedAccount?.COAID ?? null,
                            account: accountName,
                            SubMapping: PENJUALAN_MAPPING,
                        };
                    }
                );

                setPenjualanAccountOptions(accountOptions);

                // =========================
                // TANGGAL
                // =========================
                setDates({
                    perBook: data.TanggalPerBook ?? "",
                    auditedBerjalan: data.TanggalAuditJln ?? "",
                    auditedSebelum: data.TanggalAuditSblm ?? "",
                });
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Gagal mengambil Buku Besar Penjualan:",
                    err
                );

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
        (...args) => {
            let setRows = setPenjualanRows;
            let sourceRows = penjualanAccountOptions;
            let rowId;
            let field;
            let value;

            if (args.length >= 4) {
                [setRows, sourceRows, rowId, field, value] = args;
            } else {
                [rowId, field, value] = args;
            }

            setRows((prev) =>
                prev.map((row) => {
                    if (row.id !== rowId) return row;

                    if (field === "account") {
                        const selectedAccount = sourceRows.find(
                            (item) =>
                                normalizeAccount(item.account) ===
                                normalizeAccount(value)
                        );

                        if (!selectedAccount) {
                            return {
                                ...row,
                                account: value,
                                COAID: null,
                            };
                        }

                        return {
                            ...row,
                            ...selectedAccount,
                            id: row.id,
                            account: selectedAccount.account,
                        };
                    }

                    return {
                        ...row,
                        [field]: value,
                    };
                })
            );
        },
        [penjualanAccountOptions]
    );

    // =========================
    // TAMBAH BARIS
    // =========================
    const handleAddRow = useCallback(
        (...args) => {
            let setRows = setPenjualanRows;
            let newRowOrSource;
            let prefix = "penjualan";
            let defaultAccount = "";
            let subMapping = PENJUALAN_MAPPING;

            if (typeof args[0] === "function") {
                [
                    setRows,
                    newRowOrSource,
                    prefix = "penjualan",
                    defaultAccount = "",
                    subMapping = PENJUALAN_MAPPING,
                ] = args;
            } else {
                [
                    newRowOrSource,
                    prefix = "penjualan",
                    defaultAccount = "",
                    subMapping = PENJUALAN_MAPPING,
                ] = args;
            }

            setRows((prev) => {
                const existingAccounts = new Set(
                    prev.map((row) => normalizeAccount(row.account))
                );

                const candidateAccount =
                    penjualanAccountOptions.find(
                        (option) =>
                            !existingAccounts.has(
                                normalizeAccount(option.account)
                            )
                    ) || penjualanAccountOptions[0];

                const targetAccountName =
                    newRowOrSource?.account ||
                    defaultAccount ||
                    candidateAccount?.account ||
                    "";

                const matchedMaster =
                    penjualanAccountOptions.find(
                        (option) =>
                            normalizeAccount(option.account) ===
                            normalizeAccount(targetAccountName)
                    );

                const newRowId =
                    newRowOrSource?.id ||
                    `${prefix}-${crypto.randomUUID()}`;

                return [
                    ...prev,
                    {
                        ...(matchedMaster || {}),
                        id: newRowId,
                        COAID: matchedMaster?.COAID ?? null,
                        account: targetAccountName,
                        SubMapping:
                            subMapping || PENJUALAN_MAPPING,
                        perBook: newRowOrSource?.perBook ?? "0",
                        ajeRje: newRowOrSource?.ajeRje ?? "0",
                        auditedBerjalan:
                            newRowOrSource?.auditedBerjalan ?? "0",
                        auditedSebelum:
                            newRowOrSource?.auditedSebelum ?? "0",
                    },
                ];
            });
        },
        [penjualanAccountOptions]
    );

    // =========================
    // HAPUS BARIS
    // =========================
    const handleRemoveRow = useCallback((...args) => {
        let setRows = setPenjualanRows;
        let rowId;

        if (typeof args[0] === "function") {
            [setRows, rowId] = args;
        } else {
            [rowId] = args;
        }

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

        const invalidAccount = penjualanRows.find(
            (row) => !row.COAID
        );

        if (invalidAccount) {
            setError(
                `COAID akun "${invalidAccount.account}" tidak ditemukan. Periksa data master COA.`
            );
            return;
        }

        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const items = penjualanRows.map((row) => ({
                COAID: row.COAID,
                account: row.account,
                SubMapping:
                    row.SubMapping || PENJUALAN_MAPPING,
            }));

            const response = await updateBukuBesar({
                jwbKasusId,
                top,
                tanggalAuditSblm: dates.auditedSebelum,
                items,
            });

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Gagal menyimpan Buku Besar."
                );
            }

            if (response.data) {
                const data = response.data;

                const savedMapping =
                    data.sub_mappings?.find(
                        (item) =>
                            normalizeAccount(item.SubMapping) ===
                            normalizeAccount(PENJUALAN_MAPPING)
                    );

                const savedRows = mapBukuBesarRows(
                    savedMapping?.rows || [],
                    PENJUALAN_MAPPING
                );

                if (savedMapping) {
                    setPenjualanRows((prev) =>
                        PENJUALAN_ACCOUNTS.map(
                            (accountName, index) => {
                                const savedRow = savedRows.find(
                                    (row) =>
                                        normalizeAccount(row.account) ===
                                        normalizeAccount(accountName)
                                );

                                const previousRow = prev.find(
                                    (row) =>
                                        normalizeAccount(row.account) ===
                                        normalizeAccount(accountName)
                                );

                                return (
                                    savedRow ||
                                    previousRow || {
                                        id: `penjualan-${index}`,
                                        COAID: null,
                                        account: accountName,
                                        SubMapping: PENJUALAN_MAPPING,
                                        perBook: "0",
                                        ajeRje: "0",
                                        auditedBerjalan: "0",
                                        auditedSebelum: "0",
                                    }
                                );
                            }
                        )
                    );
                }

                setDates((prev) => ({
                    ...prev,
                    perBook: data.TanggalPerBook ?? prev.perBook,
                    auditedBerjalan:
                        data.TanggalAuditJln ??
                        prev.auditedBerjalan,
                    auditedSebelum:
                        data.TanggalAuditSblm ??
                        prev.auditedSebelum,
                }));
            }

            setSuccessMessage(
                response.message ||
                "Data Buku Besar berhasil disimpan."
            );
        } catch (err) {
            console.error(
                "Gagal menyimpan Buku Besar Penjualan:",
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
        jwbKasusId,
        top,
        dates,
        penjualanRows,
        saving,
    ]);

    return {
        penjualanRows,
        setPenjualanRows,
        penjualanAccountOptions,
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
