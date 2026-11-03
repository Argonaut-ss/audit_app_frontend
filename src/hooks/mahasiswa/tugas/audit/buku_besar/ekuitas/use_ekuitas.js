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

const EKUITAS_MAPPING = "Ekuitas";

export function useEkuitas({
    jwbKasusId,
    top = "I",
}) {
    const [ekuitasRows, setEkuitasRows] = useState([]);
    const [ekuitasAccountOptions, setEkuitasAccountOptions] =
        useState([]);
    const [dates, setDates] = useState({ ...EMPTY_DATES });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!jwbKasusId || !top) return undefined;

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
                    throw new Error("Data Buku Besar tidak ditemukan.");
                }

                const data = response.data;
                const mapping = data.sub_mappings?.find(
                    (item) =>
                        item.SubMapping === EKUITAS_MAPPING
                );
                const mappedRows = mapBukuBesarRows(
                    mapping?.rows || [],
                    EKUITAS_MAPPING
                );
                const allAvailable = data.available_accounts?.length
                    ? mapBukuBesarRows(data.available_accounts)
                    : mappedRows;
                const accountOptions = allAvailable.filter(
                    (account) =>
                        !account.SubMapping ||
                        account.SubMapping === EKUITAS_MAPPING
                );

                setEkuitasRows(mappedRows);
                setEkuitasAccountOptions(accountOptions);
                setDates({
                    perBook: data.TanggalPerBook ?? "",
                    auditedBerjalan: data.TanggalAuditJln ?? "",
                    auditedSebelum: data.TanggalAuditSblm ?? "",
                });
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Gagal mengambil Buku Besar Ekuitas:",
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
    }, [jwbKasusId, top]);

    const handleDateChange = useCallback((field, value) => {
        setDates((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const handleRowChange = useCallback(
        (...args) => {
            let setRows = setEkuitasRows;
            let sourceRows = ekuitasAccountOptions;
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
                            (item) => item.account === value
                        );

                        return selectedAccount
                            ? { ...selectedAccount, id: row.id }
                            : { ...row, account: value };
                    }

                    return {
                        ...row,
                        [field]: value,
                    };
                })
            );
        },
        [ekuitasAccountOptions]
    );

    const handleAddRow = useCallback(
        (...args) => {
            let setRows = setEkuitasRows;
            let newRowOrSource;
            let prefix = "ekuitas";
            let defaultAccount = "";
            let subMapping = EKUITAS_MAPPING;

            if (typeof args[0] === "function") {
                [
                    setRows,
                    newRowOrSource,
                    prefix = "ekuitas",
                    defaultAccount = "",
                    subMapping = EKUITAS_MAPPING,
                ] = args;
            } else {
                [
                    newRowOrSource,
                    prefix = "ekuitas",
                    defaultAccount = "",
                    subMapping = EKUITAS_MAPPING,
                ] = args;
            }

            setRows((prev) => {
                const existingAccounts = new Set(
                    prev.map((row) => row.account).filter(Boolean)
                );
                const candidateAccount =
                    ekuitasAccountOptions.find(
                        (option) => !existingAccounts.has(option.account)
                    ) || ekuitasAccountOptions[0];
                const targetAccountName =
                    newRowOrSource?.account ||
                    defaultAccount ||
                    candidateAccount?.account ||
                    "";
                const matchedMaster = ekuitasAccountOptions.find(
                    (option) => option.account === targetAccountName
                );
                const newRowId =
                    newRowOrSource?.id ||
                    `${prefix}-${crypto.randomUUID()}`;

                if (matchedMaster) {
                    return [
                        ...prev,
                        {
                            ...matchedMaster,
                            id: newRowId,
                            SubMapping:
                                subMapping ||
                                matchedMaster.SubMapping ||
                                EKUITAS_MAPPING,
                        },
                    ];
                }

                return [
                    ...prev,
                    {
                        id: newRowId,
                        COAID: null,
                        account: targetAccountName,
                        SubMapping:
                            subMapping || EKUITAS_MAPPING,
                        perBook: "0",
                        ajeRje: "0",
                        auditedBerjalan: "0",
                        auditedSebelum: "0",
                    },
                ];
            });
        },
        [ekuitasAccountOptions]
    );

    const handleRemoveRow = useCallback((...args) => {
        const setRows =
            typeof args[0] === "function"
                ? args[0]
                : setEkuitasRows;
        const rowId =
            typeof args[0] === "function" ? args[1] : args[0];

        setRows((prev) => prev.filter((row) => row.id !== rowId));
    }, []);

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
                tanggalAuditSblm: dates.auditedSebelum,
                items: ekuitasRows.map((row) => ({
                    COAID: row.COAID,
                    account: row.account,
                    SubMapping:
                        row.SubMapping || EKUITAS_MAPPING,
                })),
            });

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                        "Gagal menyimpan Buku Besar."
                );
            }

            if (response.data) {
                const data = response.data;
                const mapping = data.sub_mappings?.find(
                    (item) =>
                        item.SubMapping === EKUITAS_MAPPING
                );

                if (mapping?.rows) {
                    setEkuitasRows(
                        mapBukuBesarRows(
                            mapping.rows,
                            EKUITAS_MAPPING
                        )
                    );
                }

                setDates((prev) => ({
                    ...prev,
                    perBook: data.TanggalPerBook ?? prev.perBook,
                    auditedBerjalan:
                        data.TanggalAuditJln ?? prev.auditedBerjalan,
                    auditedSebelum:
                        data.TanggalAuditSblm ?? prev.auditedSebelum,
                }));
            }

            setSuccessMessage(
                response.message ||
                    "Data Buku Besar berhasil disimpan."
            );
        } catch (err) {
            console.error(
                "Gagal menyimpan Buku Besar Ekuitas:",
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
        dates,
        jwbKasusId,
        saving,
        top,
        ekuitasRows,
    ]);

    return {
        ekuitasRows,
        setEkuitasRows,
        ekuitasAccountOptions,
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
