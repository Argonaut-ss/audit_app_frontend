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

export function usePiutang({ jwbKasusId, top = "B" }) {
    const [piutangRows, setPiutangRows] = useState([]);
    const [piutangAccountOptions, setPiutangAccountOptions] = useState([]);

    const [dates, setDates] = useState({ ...EMPTY_DATES });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =========================
    // GET BUKU BESAR PIUTANG
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
                    throw new Error("Data Buku Besar tidak ditemukan.");
                }

                const data = response.data;

                const piutangMapping =
                    data.sub_mappings?.find(
                        (item) => item.SubMapping === "Piutang"
                    ) || data.sub_mappings?.[0];

                const mappedRows = mapBukuBesarRows(
                    piutangMapping?.rows,
                    "Piutang"
                );

                setPiutangRows(mappedRows);

                const allAvailable = data.available_accounts?.length
                    ? mapBukuBesarRows(data.available_accounts)
                    : mappedRows;

                const piutangMaster = allAvailable.filter(
                    (acc) =>
                        !acc.SubMapping ||
                        acc.SubMapping === "Piutang" ||
                        allAvailable.length === 1
                );

                setPiutangAccountOptions(
                    piutangMaster.length ? piutangMaster : allAvailable
                );

                setDates({
                    perBook: data.TanggalPerBook ?? "",
                    auditedBerjalan: data.TanggalAuditJln ?? "",
                    auditedSebelum: data.TanggalAuditSblm ?? "",
                });
            } catch (err) {
                if (cancelled) return;

                console.error("Gagal mengambil Buku Besar Piutang:", err);

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
            let setRows = setPiutangRows;
            let sourceRows = piutangAccountOptions;
            let rowId;
            let field;
            let value;

            if (args.length >= 4) {
                // Dipanggil dengan signature: (setRows, sourceRows, rowId, field, value)
                [setRows, sourceRows, rowId, field, value] = args;
            } else {
                // Dipanggil dengan signature langsung: (rowId, field, value)
                [rowId, field, value] = args;
            }

            setRows((prev) =>
                prev.map((row) => {
                    if (row.id !== rowId) return row;

                    if (field === "account") {
                        const selectedAccount = (sourceRows || []).find(
                            (item) => item.account === value
                        );

                        if (!selectedAccount) {
                            return { ...row, account: value };
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
        [piutangAccountOptions]
    );

    // =========================
    // TAMBAH BARIS
    // =========================
    const handleAddRow = useCallback(
        (...args) => {
            let setRows = setPiutangRows;
            let newRowOrSource;
            let prefix = "piutang";
            let defaultAccount = "";
            let subMapping = "Piutang";

            if (typeof args[0] === "function") {
                [setRows, newRowOrSource, prefix = "piutang", defaultAccount = "", subMapping = "Piutang"] = args;
            } else {
                [newRowOrSource, prefix = "piutang", defaultAccount = "", subMapping = "Piutang"] = args;
            }

            setRows((prev) => {
                const existingAccounts = new Set(
                    prev.map((r) => r.account).filter(Boolean)
                );

                // Cari akun COA yang belum terpakai di baris tabel saat ini
                const candidateAccount =
                    (piutangAccountOptions || []).find(
                        (opt) => !existingAccounts.has(opt.account)
                    ) || piutangAccountOptions?.[0];

                const targetAccountName =
                    newRowOrSource && typeof newRowOrSource === "object" && newRowOrSource.account
                        ? newRowOrSource.account
                        : (defaultAccount || candidateAccount?.account || "");

                const matchedMaster = (piutangAccountOptions || []).find(
                    (opt) => opt.account === targetAccountName
                );

                const newRowId =
                    newRowOrSource && typeof newRowOrSource === "object" && newRowOrSource.id
                        ? newRowOrSource.id
                        : `${prefix}-${crypto.randomUUID()}`;

                if (matchedMaster) {
                    return [
                        ...prev,
                        {
                            ...matchedMaster,
                            id: newRowId,
                            SubMapping: subMapping || matchedMaster.SubMapping || "Piutang",
                        },
                    ];
                }

                return [
                    ...prev,
                    {
                        id: newRowId,
                        COAID: null,
                        account: targetAccountName,
                        SubMapping: subMapping || "Piutang",
                        perBook: "0",
                        ajeRje: "0",
                        auditedBerjalan: "0",
                        auditedSebelum: "0",
                    },
                ];
            });
        },
        [piutangAccountOptions]
    );

    // =========================
    // HAPUS BARIS
    // =========================
    const handleRemoveRow = useCallback((...args) => {
        let setRows = setPiutangRows;
        let rowId;

        if (typeof args[0] === "function") {
            [setRows, rowId] = args;
        } else {
            [rowId] = args;
        }

        setRows((prev) => prev.filter((row) => row.id !== rowId));
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
            const items = piutangRows.map((row) => ({
                COAID: row.COAID,
                account: row.account,
                SubMapping: row.SubMapping || "Piutang",
            }));

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
                const piutangMapping =
                    data.sub_mappings?.find(
                        (item) => item.SubMapping === "Piutang"
                    ) || data.sub_mappings?.[0];

                if (piutangMapping?.rows) {
                    setPiutangRows(
                        mapBukuBesarRows(piutangMapping.rows, "Piutang")
                    );
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
            console.error("Gagal menyimpan Buku Besar Piutang:", err);

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Terjadi kesalahan saat menyimpan data."
            );
        } finally {
            setSaving(false);
        }
    }, [jwbKasusId, top, dates, piutangRows, saving]);

    return {
        piutangRows,
        setPiutangRows,
        piutangAccountOptions,
        kasRows: piutangRows,
        setKasRows: setPiutangRows,
        kasAccountOptions: piutangAccountOptions,
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

