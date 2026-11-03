
"use client";

import { useCallback, useEffect, useState } from "react";

import {
    getBukuBesar,
    updateBukuBesar,
} from "@/services/mahasiswa/tugas/audit/buku_besar/buku_besar";

import {
    formatNominal,
    mapBukuBesarRows,
} from "@/utils/mahasiswa/tugas/audit/buku_besar/buku_besar_utils";

const ASET_TETAP_MAPPING = "Aset Tetap";
const AKUMULASI_MAPPING = "Akumulasi Penyusutan Aset Tetap";

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

const mapTotals = (totals = {}) => ({
    perBook: formatNominal(totals.PerBook ?? 0),
    ajeRje: formatNominal(totals.AJE_RJE ?? 0),
    auditedBerjalan: formatNominal(
        totals.AuditedBerjalan ?? totals.AuditJln ?? 0
    ),
    auditedSebelum: formatNominal(totals.AuditSebelum ?? 0),
});

export function useAsetTetap({ jwbKasusId, top = "E" }) {
    const [asetTetapRows, setAsetTetapRows] = useState([]);
    const [akumulasiRows, setAkumulasiRows] = useState([]);

    const [dates, setDates] = useState({ ...EMPTY_DATES });
    const [totalAsetTetap, setTotalAsetTetap] = useState({
        ...EMPTY_TOTALS,
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const applyResponseData = useCallback((data) => {
        const asetTetapMapping = data.sub_mappings?.find(
            (item) => item.SubMapping === ASET_TETAP_MAPPING
        );

        const akumulasiMapping = data.sub_mappings?.find(
            (item) => item.SubMapping === AKUMULASI_MAPPING
        );

        setAsetTetapRows(
            mapBukuBesarRows(
                asetTetapMapping?.rows ?? [],
                ASET_TETAP_MAPPING
            )
        );

        setAkumulasiRows(
            mapBukuBesarRows(
                akumulasiMapping?.rows ?? [],
                AKUMULASI_MAPPING
            )
        );

        setTotalAsetTetap(mapTotals(data.totals));

        setDates({
            perBook: data.TanggalPerBook ?? "",
            auditedBerjalan: data.TanggalAuditJln ?? "",
            auditedSebelum: data.TanggalAuditSblm ?? "",
        });
    }, []);

    // Ambil data Buku Besar TOP E.
    useEffect(() => {
        if (!jwbKasusId || !top) return;

        let cancelled = false;

        const fetchAsetTetap = async () => {
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
                        "Data Buku Besar Aset Tetap tidak ditemukan."
                    );
                }

                applyResponseData(response.data);
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Gagal mengambil Buku Besar Aset Tetap:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Gagal mengambil data Buku Besar Aset Tetap."
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchAsetTetap();

        return () => {
            cancelled = true;
        };
    }, [jwbKasusId, top, applyResponseData]);

    // Tanggal Audit Sebelumnya dapat diedit.
    const handleDateChange = useCallback((field, value) => {
        setDates((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    // Simpan tanggal dan daftar akun TOP E.
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
                ...asetTetapRows.map((row) => ({
                    COAID: row.COAID,
                    account: row.account,
                    SubMapping: ASET_TETAP_MAPPING,
                })),
                ...akumulasiRows.map((row) => ({
                    COAID: row.COAID,
                    account: row.account,
                    SubMapping: AKUMULASI_MAPPING,
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
                    "Gagal menyimpan Buku Besar Aset Tetap."
                );
            }

            if (response.data) {
                applyResponseData(response.data);
            }

            setSuccessMessage(
                response.message ||
                "Data Buku Besar Aset Tetap berhasil disimpan."
            );
        } catch (err) {
            console.error(
                "Gagal menyimpan Buku Besar Aset Tetap:",
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
        asetTetapRows,
        akumulasiRows,
        applyResponseData,
    ]);

    return {
        asetTetapRows,
        akumulasiRows,
        dates,
        totalAsetTetap,
        loading,
        saving,
        error,
        successMessage,
        setSuccessMessage,
        handleDateChange,
        handleSave,
    };
}
