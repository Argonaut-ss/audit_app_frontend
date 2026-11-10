
"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

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

export function usePajakPenghasilan({
    jwbKasusId,
    top = "N",
}) {
    const [pajakPenghasilanRows, setPajakPenghasilanRows] = useState([]);
    const [pajakPenghasilanAccountOptions, setPajakPenghasilanAccountOptions] = useState([]);

    const [dates, setDates] = useState(EMPTY_DATES);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =========================
    // FETCH DATA
    // =========================
    const fetchPajakPenghasilan = useCallback(async () => {
        if (!jwbKasusId) return;

        setLoading(true);
        setError("");

        try {
            const response = await getBukuBesar({
                jwbKasusId,
                top,
            });

            const data = response?.data || {};

            const pajakPenghasilanMapping =
                data.sub_mappings?.find(
                    (item) =>
                        item.SubMapping === "Pajak Penghasilan"
                );

            const mappedRows = mapBukuBesarRows(
                pajakPenghasilanMapping?.rows || [],
                "Pajak Penghasilan"
            );

            setPajakPenghasilanRows(mappedRows);

            const allAvailable = data.available_accounts?.length
                ? mapBukuBesarRows(data.available_accounts)
                : [];

            const pajakPenghasilanMaster = allAvailable.filter(
                (account) =>
                    !account.SubMapping ||
                    account.SubMapping === "Pajak Penghasilan"
            );

            setPajakPenghasilanAccountOptions(
                pajakPenghasilanMaster
            );

            setDates({
                perBook: data.TanggalPerBook || "",
                auditedBerjalan: data.TanggalAuditJln || "",
                auditedSebelum: data.TanggalAuditSblm || "",
            });
        } catch (err) {
            console.error(
                "Gagal mengambil data Pajak Penghasilan:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Gagal mengambil data Pajak Penghasilan."
            );
        } finally {
            setLoading(false);
        }
    }, [jwbKasusId, top]);

    useEffect(() => {
        fetchPajakPenghasilan();
    }, [fetchPajakPenghasilan]);

    // =========================
    // DATE CHANGE
    // =========================
    const handleDateChange = useCallback((field, value) => {
        setDates((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    // =========================
    // ROW CHANGE
    // =========================
    const handleRowChange = useCallback(
        (...args) => {
            let setRows;
            let sourceRows;
            let rowId;
            let field;
            let value;

            if (typeof args[0] === "function") {
                [
                    setRows,
                    sourceRows,
                    rowId,
                    field,
                    value,
                ] = args;
            } else {
                [
                    rowId,
                    field,
                    value,
                ] = args;

                setRows = setPajakPenghasilanRows;
                sourceRows = pajakPenghasilanAccountOptions;
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
        [pajakPenghasilanAccountOptions]
    );

    // =========================
    // ADD ROW
    // =========================
    const handleAddRow = useCallback(
        (...args) => {
            let setRows;
            let newRow;

            if (typeof args[0] === "function") {
                [setRows, newRow] = args;
            } else {
                [newRow] = args;
                setRows = setPajakPenghasilanRows;
            }

            setRows((prev) => {
                if (!pajakPenghasilanAccountOptions.length) {
                    return prev;
                }

                const usedAccounts = prev.map(
                    (row) => row.account
                );

                const candidateAccount =
                    pajakPenghasilanAccountOptions.find(
                        (account) =>
                            !usedAccounts.includes(account.account)
                    ) || pajakPenghasilanAccountOptions[0];

                const newRowData = {
                    ...candidateAccount,
                    id:
                        newRow?.id ||
                        `pajak-penghasilan-${Date.now()}`,
                    SubMapping: "Pajak Penghasilan",
                };

                return [newRowData, ...prev];
            });
        },
        [pajakPenghasilanAccountOptions]
    );

    // =========================
    // REMOVE ROW
    // =========================
    const handleRemoveRow = useCallback(
        (...args) => {
            let setRows;
            let rowId;

            if (typeof args[0] === "function") {
                [setRows, rowId] = args;
            } else {
                rowId = args[0];
                setRows = setPajakPenghasilanRows;
            }

            setRows((prev) =>
                prev.filter((row) => row.id !== rowId)
            );
        },
        []
    );

    // =========================
    // SAVE DATA
    // =========================
    const handleSave = useCallback(async () => {
        if (!jwbKasusId) return;

        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const items = pajakPenghasilanRows.map((row) => ({
                COAID: row.COAID,
                account: row.account,
                SubMapping:
                    row.SubMapping || "Pajak Penghasilan",
            }));

            const response = await updateBukuBesar({
                jwbKasusId,
                top,
                tanggalAuditSblm: dates.auditedSebelum,
                items,
            });

            const data = response?.data || {};

            const pajakPenghasilanMapping =
                data.sub_mappings?.find(
                    (item) =>
                        item.SubMapping === "Pajak Penghasilan"
                );

            if (pajakPenghasilanMapping) {
                setPajakPenghasilanRows(
                    mapBukuBesarRows(
                        pajakPenghasilanMapping.rows || [],
                        "Pajak Penghasilan"
                    )
                );
            }

            setDates((prev) => ({
                ...prev,
                perBook:
                    data.TanggalPerBook || prev.perBook,
                auditedBerjalan:
                    data.TanggalAuditJln || prev.auditedBerjalan,
                auditedSebelum:
                    data.TanggalAuditSblm || prev.auditedSebelum,
            }));

            setSuccessMessage(
                response?.message ||
                "Data Pajak Penghasilan berhasil disimpan."
            );
        } catch (err) {
            console.error(
                "Gagal menyimpan data Pajak Penghasilan:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Gagal menyimpan data Pajak Penghasilan."
            );
        } finally {
            setSaving(false);
        }
    }, [
        jwbKasusId,
        top,
        dates.auditedSebelum,
        pajakPenghasilanRows,
    ]);

    return {
        pajakPenghasilanRows,
        setPajakPenghasilanRows,

        pajakPenghasilanAccountOptions,

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

        fetchPajakPenghasilan,
    };
}
