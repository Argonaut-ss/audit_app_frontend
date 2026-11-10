
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

export function useBebanPokokPenjualan({
    jwbKasusId,
    top = "K",
}) {
    const [
        bebanPokokPenjualanRows,
        setBebanPokokPenjualanRows,
    ] = useState([]);

    const [
        bebanPokokPenjualanAccountOptions,
        setBebanPokokPenjualanAccountOptions,
    ] = useState([]);

    const [dates, setDates] = useState({ ...EMPTY_DATES });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =========================
    // GET BUKU BESAR BEBAN POKOK PENJUALAN
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

                const bebanPokokPenjualanMapping =
                    data.sub_mappings?.find(
                        (item) =>
                            item.SubMapping === "Beban Pokok Penjualan"
                    ) || data.sub_mappings?.[0];

                const mappedRows = mapBukuBesarRows(
                    bebanPokokPenjualanMapping?.rows,
                    "Beban Pokok Penjualan"
                );

                setBebanPokokPenjualanRows(mappedRows);

                const allAvailable = data.available_accounts?.length
                    ? mapBukuBesarRows(data.available_accounts)
                    : mappedRows;

                const bebanPokokPenjualanMaster = allAvailable.filter(
                    (acc) =>
                        !acc.SubMapping ||
                        acc.SubMapping === "Beban Pokok Penjualan" ||
                        allAvailable.length === 1
                );

                setBebanPokokPenjualanAccountOptions(
                    bebanPokokPenjualanMaster.length
                        ? bebanPokokPenjualanMaster
                        : allAvailable
                );

                setDates({
                    perBook: data.TanggalPerBook ?? "",
                    auditedBerjalan: data.TanggalAuditJln ?? "",
                    auditedSebelum: data.TanggalAuditSblm ?? "",
                });
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Gagal mengambil Buku Besar Beban Pokok Penjualan:",
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
            let setRows = setBebanPokokPenjualanRows;
            let sourceRows = bebanPokokPenjualanAccountOptions;
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
                        const selectedAccount = (sourceRows || []).find(
                            (item) => item.account === value
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
                    }

                    return {
                        ...row,
                        [field]: value,
                    };
                })
            );
        },
        [bebanPokokPenjualanAccountOptions]
    );

    // =========================
    // TAMBAH BARIS
    // =========================
    const handleAddRow = useCallback(
        (...args) => {
            let setRows = setBebanPokokPenjualanRows;
            let newRowOrSource;
            let prefix = "beban-pokok-penjualan";
            let defaultAccount = "";
            let subMapping = "Beban Pokok Penjualan";

            if (typeof args[0] === "function") {
                [
                    setRows,
                    newRowOrSource,
                    prefix = "beban-pokok-penjualan",
                    defaultAccount = "",
                    subMapping = "Beban Pokok Penjualan",
                ] = args;
            } else {
                [
                    newRowOrSource,
                    prefix = "beban-pokok-penjualan",
                    defaultAccount = "",
                    subMapping = "Beban Pokok Penjualan",
                ] = args;
            }

            setRows((prev) => {
                const existingAccounts = new Set(
                    prev.map((row) => row.account).filter(Boolean)
                );

                const candidateAccount =
                    (bebanPokokPenjualanAccountOptions || []).find(
                        (opt) => !existingAccounts.has(opt.account)
                    ) || bebanPokokPenjualanAccountOptions?.[0];

                const targetAccountName =
                    newRowOrSource &&
                    typeof newRowOrSource === "object" &&
                    newRowOrSource.account
                        ? newRowOrSource.account
                        : (
                            defaultAccount ||
                            candidateAccount?.account ||
                            ""
                        );

                const matchedMaster = (
                    bebanPokokPenjualanAccountOptions || []
                ).find(
                    (opt) => opt.account === targetAccountName
                );

                const newRowId =
                    newRowOrSource &&
                    typeof newRowOrSource === "object" &&
                    newRowOrSource.id
                        ? newRowOrSource.id
                        : `${prefix}-${crypto.randomUUID()}`;

                if (matchedMaster) {
                    return [
                        {
                            ...matchedMaster,
                            id: newRowId,
                            SubMapping:
                                subMapping ||
                                matchedMaster.SubMapping ||
                                "Beban Pokok Penjualan",
                        },
                        ...prev,
                    ];
                }

                return [
                    {
                        id: newRowId,
                        COAID: null,
                        account: targetAccountName,
                        SubMapping: subMapping || "Beban Pokok Penjualan",
                        perBook: "0",
                        ajeRje: "0",
                        auditedBerjalan: "0",
                        auditedSebelum: "0",
                    },
                    ...prev,
                ];
            });
        },
        [bebanPokokPenjualanAccountOptions]
    );

    // =========================
    // HAPUS BARIS
    // =========================
    const handleRemoveRow = useCallback((...args) => {
        let setRows = setBebanPokokPenjualanRows;
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

        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const items = bebanPokokPenjualanRows.map((row) => ({
                COAID: row.COAID,
                account: row.account,
                SubMapping: row.SubMapping || "Beban Pokok Penjualan",
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

                const bebanPokokPenjualanMapping =
                    data.sub_mappings?.find(
                        (item) =>
                            item.SubMapping === "Beban Pokok Penjualan"
                    ) || data.sub_mappings?.[0];

                if (bebanPokokPenjualanMapping?.rows) {
                    setBebanPokokPenjualanRows(
                        mapBukuBesarRows(
                            bebanPokokPenjualanMapping.rows,
                            "Beban Pokok Penjualan"
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
                "Gagal menyimpan Buku Besar Beban Pokok Penjualan:",
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
        bebanPokokPenjualanRows,
        saving,
    ]);

    return {
        bebanPokokPenjualanRows,
        setBebanPokokPenjualanRows,
        bebanPokokPenjualanAccountOptions,
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
