
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

const UTANG_PAJAK_MAPPING = "Utang Pajak";

const UTANG_PAJAK_ACCOUNTS = [
    "Utang Pajak Penghasilan",
    "PPN Keluaran",
    "Utang PPN",
    "Utang PPh ayat 2",
];

// =========================
// NORMALIZE ACCOUNT NAME
// =========================
const normalizeAccount = (value) => {
    return String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
};

export function useUtangPajak({ jwbKasusId, top = "H" }) {
    const [utangPajakRows, setUtangPajakRows] = useState([]);

    const [utangPajakAccountOptions, setUtangPajakAccountOptions] =
        useState([]);

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

                // =========================
                // AMBIL SUB MAPPING
                // =========================
                const utangPajakMapping =
                    data.sub_mappings?.find(
                        (item) =>
                            normalizeAccount(item.SubMapping) ===
                            normalizeAccount(UTANG_PAJAK_MAPPING)
                    );

                const mappedRows = mapBukuBesarRows(
                    utangPajakMapping?.rows || [],
                    UTANG_PAJAK_MAPPING
                );

                // =========================
                // AMBIL MASTER ACCOUNT
                // =========================
                const availableAccounts = mapBukuBesarRows(
                    data.available_accounts || []
                );

                // Gabungkan akun dari master dan baris yang sudah tersimpan.
                const allAccounts = [
                    ...availableAccounts,
                    ...mappedRows,
                ];

                // Buat lookup berdasarkan nama akun.
                const accountLookup = new Map();

                allAccounts.forEach((account) => {
                    const key = normalizeAccount(account.account);

                    if (key && !accountLookup.has(key)) {
                        accountLookup.set(key, account);
                    }
                });

                // =========================
                // BENTUK 4 BARIS UTANG PAJAK
                // =========================
                const completeRows = UTANG_PAJAK_ACCOUNTS.map(
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
                                `utang-pajak-${index}`,
                            COAID:
                                existingRow?.COAID ??
                                matchedAccount?.COAID ??
                                null,
                            account: accountName,
                            SubMapping: UTANG_PAJAK_MAPPING,
                            perBook: existingRow?.perBook ?? "0",
                            ajeRje: existingRow?.ajeRje ?? "0",
                            auditedBerjalan:
                                existingRow?.auditedBerjalan ?? "0",
                            auditedSebelum:
                                existingRow?.auditedSebelum ?? "0",
                        };
                    }
                );

                setUtangPajakRows(completeRows);

                // =========================
                // BENTUK DROPDOWN OPTIONS
                // =========================
                const accountOptions = UTANG_PAJAK_ACCOUNTS.map(
                    (accountName, index) => {
                        const matchedAccount = accountLookup.get(
                            normalizeAccount(accountName)
                        );

                        return {
                            ...(matchedAccount || {}),
                            id:
                                matchedAccount?.id ||
                                `utang-pajak-option-${index}`,
                            COAID: matchedAccount?.COAID ?? null,
                            account: accountName,
                            SubMapping: UTANG_PAJAK_MAPPING,
                        };
                    }
                );

                setUtangPajakAccountOptions(accountOptions);

                // =========================
                // TANGGAL
                // =========================
                setDates({
                    perBook: data.TanggalPerBook ?? "",
                    auditedBerjalan: data.TanggalAuditJln ?? "",
                    auditedSebelum: data.TanggalAuditSblm ?? "",
                });

                // Debug sementara untuk memastikan akun dan COAID.
                console.log(
                    "Utang Pajak - Account Options:",
                    accountOptions
                );

                console.log(
                    "Utang Pajak - Rows:",
                    completeRows
                );
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Gagal mengambil Buku Besar Utang Pajak:",
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
            let setRows = setUtangPajakRows;
            let sourceRows = utangPajakAccountOptions;
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
        [utangPajakAccountOptions]
    );

    // =========================
    // TAMBAH BARIS
    // =========================
    const handleAddRow = useCallback(
        (...args) => {
            let setRows = setUtangPajakRows;
            let newRowOrSource;
            let prefix = "utang-pajak";
            let defaultAccount = "";
            let subMapping = UTANG_PAJAK_MAPPING;

            if (typeof args[0] === "function") {
                [
                    setRows,
                    newRowOrSource,
                    prefix = "utang-pajak",
                    defaultAccount = "",
                    subMapping = UTANG_PAJAK_MAPPING,
                ] = args;
            } else {
                [
                    newRowOrSource,
                    prefix = "utang-pajak",
                    defaultAccount = "",
                    subMapping = UTANG_PAJAK_MAPPING,
                ] = args;
            }

            setRows((prev) => {
                const existingAccounts = new Set(
                    prev.map((row) =>
                        normalizeAccount(row.account)
                    )
                );

                const candidateAccount =
                    utangPajakAccountOptions.find(
                        (option) =>
                            !existingAccounts.has(
                                normalizeAccount(option.account)
                            )
                    ) || utangPajakAccountOptions[0];

                const targetAccountName =
                    newRowOrSource?.account ||
                    defaultAccount ||
                    candidateAccount?.account ||
                    "";

                const matchedMaster =
                    utangPajakAccountOptions.find(
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
                            subMapping || UTANG_PAJAK_MAPPING,
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
        [utangPajakAccountOptions]
    );

    // =========================
    // HAPUS BARIS
    // =========================
    const handleRemoveRow = useCallback((...args) => {
        let setRows = setUtangPajakRows;
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

        // Pastikan akun yang dipilih memiliki COAID.
        const invalidAccount = utangPajakRows.find(
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
            const items = utangPajakRows.map((row) => ({
                COAID: row.COAID,
                account: row.account,
                SubMapping:
                    row.SubMapping || UTANG_PAJAK_MAPPING,
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

                const utangPajakMapping =
                    data.sub_mappings?.find(
                        (item) =>
                            normalizeAccount(item.SubMapping) ===
                            normalizeAccount(UTANG_PAJAK_MAPPING)
                    );

                const savedRows = mapBukuBesarRows(
                    utangPajakMapping?.rows || [],
                    UTANG_PAJAK_MAPPING
                );

                if (utangPajakMapping) {
                    setUtangPajakRows((prev) =>
                        UTANG_PAJAK_ACCOUNTS.map((accountName, index) => {
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
                                    id: `utang-pajak-${index}`,
                                    COAID: null,
                                    account: accountName,
                                    SubMapping: UTANG_PAJAK_MAPPING,
                                    perBook: "0",
                                    ajeRje: "0",
                                    auditedBerjalan: "0",
                                    auditedSebelum: "0",
                                }
                            );
                        })
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
                "Gagal menyimpan Buku Besar Utang Pajak:",
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
        utangPajakRows,
        saving,
    ]);

    return {
        utangPajakRows,
        setUtangPajakRows,
        utangPajakAccountOptions,
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
