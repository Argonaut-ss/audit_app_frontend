
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

const ASET_LAIN_MAPPING = "Aset Lain-Lain";

const ASET_LAIN_ACCOUNTS = [
    "Sewa Dibayar Dimuka",
    "PPN Masukan",
    "Piutang PPN",
    "Angsuran Pajak Penghasilan",
];

export function useAsetLain({ jwbKasusId, top = "D" }) {
    const [asetLainRows, setAsetLainRows] = useState([]);
    const [asetLainAccountOptions, setAsetLainAccountOptions] = useState([]);

    const [dates, setDates] = useState({ ...EMPTY_DATES });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =========================
    // GET BUKU BESAR ASET LAIN
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

                const asetLainMapping =
                    data.sub_mappings?.find(
                        (item) =>
                            item.SubMapping === ASET_LAIN_MAPPING
                    );

                const mappedRows = mapBukuBesarRows(
                    asetLainMapping?.rows || [],
                    ASET_LAIN_MAPPING
                );

                setAsetLainRows(mappedRows);

                const allAvailable = data.available_accounts?.length
                    ? mapBukuBesarRows(data.available_accounts)
                    : mappedRows;

                const asetLainMaster = allAvailable.filter(
                    (acc) =>
                        ASET_LAIN_ACCOUNTS.includes(acc.account) &&
                        (
                            !acc.SubMapping ||
                            acc.SubMapping === ASET_LAIN_MAPPING
                        )
                );

                setAsetLainAccountOptions(asetLainMaster);

                setDates({
                    perBook: data.TanggalPerBook ?? "",
                    auditedBerjalan: data.TanggalAuditJln ?? "",
                    auditedSebelum: data.TanggalAuditSblm ?? "",
                });
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Gagal mengambil Buku Besar Aset Lain:",
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
            let setRows = setAsetLainRows;
            let sourceRows = asetLainAccountOptions;
            let rowId;
            let field;
            let value;

            if (args.length >= 4) {
                // Signature: (setRows, sourceRows, rowId, field, value)
                [setRows, sourceRows, rowId, field, value] = args;
            } else {
                // Signature: (rowId, field, value)
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
        [asetLainAccountOptions]
    );

    // =========================
    // TAMBAH BARIS
    // =========================
    const handleAddRow = useCallback(
        (...args) => {
            let setRows = setAsetLainRows;
            let newRowOrSource;
            let prefix = "aset-lain";
            let defaultAccount = "";
            let subMapping = ASET_LAIN_MAPPING;

            if (typeof args[0] === "function") {
                [
                    setRows,
                    newRowOrSource,
                    prefix = "aset-lain",
                    defaultAccount = "",
                    subMapping = ASET_LAIN_MAPPING,
                ] = args;
            } else {
                [
                    newRowOrSource,
                    prefix = "aset-lain",
                    defaultAccount = "",
                    subMapping = ASET_LAIN_MAPPING,
                ] = args;
            }

            setRows((prev) => {
                const existingAccounts = new Set(
                    prev.map((row) => row.account).filter(Boolean)
                );

                const candidateAccount =
                    (asetLainAccountOptions || []).find(
                        (opt) => !existingAccounts.has(opt.account)
                    ) || asetLainAccountOptions?.[0];

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
                    asetLainAccountOptions || []
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
                        ...prev,
                        {
                            ...matchedMaster,
                            id: newRowId,
                            SubMapping:
                                subMapping ||
                                matchedMaster.SubMapping ||
                                ASET_LAIN_MAPPING,
                        },
                    ];
                }

                return [
                    ...prev,
                    {
                        id: newRowId,
                        COAID: null,
                        account: targetAccountName,
                        SubMapping: subMapping || ASET_LAIN_MAPPING,
                        perBook: "0",
                        ajeRje: "0",
                        auditedBerjalan: "0",
                        auditedSebelum: "0",
                    },
                ];
            });
        },
        [asetLainAccountOptions]
    );

    // =========================
    // HAPUS BARIS
    // =========================
    const handleRemoveRow = useCallback((...args) => {
        let setRows = setAsetLainRows;
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
            const items = asetLainRows.map((row) => ({
                COAID: row.COAID,
                account: row.account,
                SubMapping: row.SubMapping || ASET_LAIN_MAPPING,
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

                const asetLainMapping =
                    data.sub_mappings?.find(
                        (item) =>
                            item.SubMapping === ASET_LAIN_MAPPING
                    );

                if (asetLainMapping?.rows) {
                    setAsetLainRows(
                        mapBukuBesarRows(
                            asetLainMapping.rows,
                            ASET_LAIN_MAPPING
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
                "Gagal menyimpan Buku Besar Aset Lain:",
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
        asetLainRows,
        saving,
    ]);

    return {
        asetLainRows,
        setAsetLainRows,
        asetLainAccountOptions,
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
