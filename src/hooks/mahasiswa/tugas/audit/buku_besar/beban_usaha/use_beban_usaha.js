
"use client";

import { useCallback, useEffect, useState } from "react";

import {
    getBukuBesar,
    updateBukuBesar,
} from "@/services/mahasiswa/tugas/audit/buku_besar/buku_besar";

import {
    mapBukuBesarRows,
} from "@/utils/mahasiswa/tugas/audit/buku_besar/buku_besar_utils";

const EMPTY_DATES = {
    perBook: "",
    auditedBerjalan: "",
    auditedSebelum: "",
};

export function useBebanUsaha({
    jwbKasusId,
    top = "L",
}) {
    const [bebanUsahaRows, setBebanUsahaRows] = useState([]);
    const [bebanUsahaAccountOptions, setBebanUsahaAccountOptions] = useState([]);

    const [dates, setDates] = useState(EMPTY_DATES);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fetchBebanUsaha = useCallback(async () => {
        if (!jwbKasusId) return;

        setLoading(true);
        setError("");

        try {
            const response = await getBukuBesar({
                jwbKasusId,
                top,
            });

            const data = response?.data || {};

            const bebanUsahaMapping =
                data.sub_mappings?.find(
                    (item) => item.SubMapping === "Beban Usaha"
                ) || data.sub_mappings?.[0];

            const mappedRows = mapBukuBesarRows(
                bebanUsahaMapping?.rows || [],
                "Beban Usaha"
            );

            setBebanUsahaRows(mappedRows);

            const allAvailable = data.available_accounts?.length
                ? mapBukuBesarRows(data.available_accounts)
                : mappedRows;

            const bebanUsahaMaster = allAvailable.filter(
                (account) =>
                    !account.SubMapping ||
                    account.SubMapping === "Beban Usaha" ||
                    allAvailable.length === 1
            );

            setBebanUsahaAccountOptions(
                bebanUsahaMaster.length
                    ? bebanUsahaMaster
                    : allAvailable
            );

            setDates({
                perBook: data.TanggalPerBook || "",
                auditedBerjalan: data.TanggalAuditJln || "",
                auditedSebelum: data.TanggalAuditSblm || "",
            });
        } catch (err) {
            console.error("Gagal mengambil data Beban Usaha:", err);

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Gagal mengambil data Beban Usaha."
            );
        } finally {
            setLoading(false);
        }
    }, [jwbKasusId, top]);

    useEffect(() => {
        fetchBebanUsaha();
    }, [fetchBebanUsaha]);

    const handleDateChange = useCallback((field, value) => {
        setDates((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const handleRowChange = useCallback(
        (...args) => {
            let setRows;
            let sourceRows;
            let rowId;
            let field;
            let value;

            if (typeof args[0] === "function") {
                [setRows, sourceRows, rowId, field, value] = args;
            } else {
                [rowId, field, value] = args;
                setRows = setBebanUsahaRows;
                sourceRows = bebanUsahaAccountOptions;
            }

            setRows((prev) =>
                prev.map((row) => {
                    if (row.id !== rowId) return row;

                    if (field !== "account") {
                        return {
                            ...row,
                            [field]: value,
                        };
                    }

                    const selectedAccount = (sourceRows || []).find(
                        (account) => account.account === value
                    );

                    if (!selectedAccount) {
                        return {
                            ...row,
                            account: value,
                        };
                    }

                    return {
                        ...selectedAccount,
                        id: row.id,
                    };
                })
            );
        },
        [bebanUsahaAccountOptions]
    );

    const handleAddRow = useCallback(
        (...args) => {
            let setRows;
            let newRow;
            let prefix;
            let defaultAccount;
            let subMapping;

            if (typeof args[0] === "function") {
                [
                    setRows,
                    newRow,
                    prefix,
                    defaultAccount,
                    subMapping,
                ] = args;
            } else {
                [
                    newRow,
                    prefix,
                    defaultAccount,
                    subMapping,
                ] = args;

                setRows = setBebanUsahaRows;
            }

            setRows((prev) => {
                const usedAccounts = prev.map((row) => row.account);

                const candidateAccount =
                    bebanUsahaAccountOptions.find(
                        (account) =>
                            !usedAccounts.includes(account.account)
                    ) || bebanUsahaAccountOptions[0];

                const row = candidateAccount
                    ? {
                        ...candidateAccount,
                        id:
                            newRow?.id ||
                            `${prefix || "beban-usaha"}-${Date.now()}`,
                        SubMapping:
                            candidateAccount.SubMapping ||
                            subMapping ||
                            "Beban Usaha",
                    }
                    : {
                        id:
                            newRow?.id ||
                            `${prefix || "beban-usaha"}-${Date.now()}`,
                        COAID: null,
                        account: defaultAccount || "",
                        SubMapping: subMapping || "Beban Usaha",
                    };

                return [row, ...prev];
            });
        },
        [bebanUsahaAccountOptions]
    );

    const handleRemoveRow = useCallback(
        (...args) => {
            let setRows;
            let rowId;

            if (typeof args[0] === "function") {
                [setRows, rowId] = args;
            } else {
                rowId = args[0];
                setRows = setBebanUsahaRows;
            }

            setRows((prev) =>
                prev.filter((row) => row.id !== rowId)
            );
        },
        []
    );

    const handleSave = useCallback(async () => {
        if (!jwbKasusId) return;

        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const items = bebanUsahaRows.map((row) => ({
                COAID: row.COAID,
                account: row.account,
                SubMapping: row.SubMapping || "Beban Usaha",
            }));

            const response = await updateBukuBesar({
                jwbKasusId,
                top,
                tanggalAuditSblm: dates.auditedSebelum,
                items,
            });

            const data = response?.data || {};

            const bebanUsahaMapping =
                data.sub_mappings?.find(
                    (item) => item.SubMapping === "Beban Usaha"
                ) || data.sub_mappings?.[0];

            if (bebanUsahaMapping) {
                setBebanUsahaRows(
                    mapBukuBesarRows(
                        bebanUsahaMapping.rows || [],
                        "Beban Usaha"
                    )
                );
            }

            setDates((prev) => ({
                ...prev,
                perBook: data.TanggalPerBook || prev.perBook,
                auditedBerjalan:
                    data.TanggalAuditJln || prev.auditedBerjalan,
                auditedSebelum:
                    data.TanggalAuditSblm || prev.auditedSebelum,
            }));

            setSuccessMessage(
                response?.message || "Data Beban Usaha berhasil disimpan."
            );
        } catch (err) {
            console.error("Gagal menyimpan data Beban Usaha:", err);

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Gagal menyimpan data Beban Usaha."
            );
        } finally {
            setSaving(false);
        }
    }, [jwbKasusId, top, dates.auditedSebelum, bebanUsahaRows]);

    return {
        bebanUsahaRows,
        setBebanUsahaRows,

        bebanUsahaAccountOptions,

        dates,
        setDates,

        loading,
        saving,

        error,
        setError,

        successMessage,
        setSuccessMessage,

        handleDateChange,
        handleRowChange,
        handleAddRow,
        handleRemoveRow,
        handleSave,

        fetchBebanUsaha,
    };
}
