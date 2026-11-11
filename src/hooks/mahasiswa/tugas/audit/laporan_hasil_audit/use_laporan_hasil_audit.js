"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    getLaporanHasilAuditByKasus,
    saveLaporanHasilAudit,
    getFileLaporanHasilAudit,
    JENIS_FILE_LHA,
} from "@/services/mahasiswa/tugas/audit/laporan_hasil_audit/laporan_hasil_audit";

// =====================================================
// LABEL DOKUMEN
// =====================================================

const LABEL_DOKUMEN = {
    laporan_hasil_audit: "File Laporan Hasil Audit",
    laporan_auditor_independen: "File Laporan Auditor Independen",
    surat_representasi_manajemen: "File Surat Representasi Manajemen",
    surat_pmpj: "File Surat PMPJ",
    persetujuan_jurnal_koreksi_audit: "File Persetujuan Jurnal Koreksi Audit",
    pernyataan_direksi: "File Pernyataan Direksi",
    persetujuan_penerbitan_laporan_keuangan_audit:
        "File Persetujuan Penerbitan Laporan Keuangan Audit",
    persetujuan_penyerahan_lapkeu_audit:
        "File Persetujuan Penyerahan Laporan Keuangan Audit",
};

// =====================================================
// INITIAL DOCUMENT STATE
// =====================================================

const createInitialDocuments = () =>
    JENIS_FILE_LHA.map((jenisFile) => ({
        jenis_file: jenisFile,
        label: LABEL_DOKUMEN[jenisFile],
        tipe_input: "file",
        file: null,
        link: "",
        existingFile: null,
    }));

// =====================================================
// ERROR MESSAGE
// =====================================================

const getErrorMessage = (error) => {
    const validationErrors = error?.response?.data?.errors;

    if (validationErrors) {
        return Object.values(validationErrors)
            .flat()
            .join("\n");
    }

    return (
        error?.response?.data?.message ||
        error?.message ||
        "Terjadi kesalahan. Silakan coba kembali."
    );
};

// =====================================================
// VALIDASI URL
// =====================================================

const isValidUrl = (value) => {
    try {
        const url = new URL(value.trim());

        return (
            (url.protocol === "http:" ||
                url.protocol === "https:") &&
            Boolean(url.hostname)
        );
    } catch {
        return false;
    }
};

// =====================================================
// HOOK
// =====================================================

export function useLaporanHasilAudit({ jwbKasusId }) {

    // =========================
    // STATE LAPORAN
    // =========================

    const [laporanId, setLaporanId] = useState(null);

    const [opiniAudit, setOpiniAudit] = useState("");

    // =========================
    // STATE DOKUMEN
    // =========================

    const [documents, setDocuments] = useState(
        createInitialDocuments
    );

    // =========================
    // STATE STATUS
    // =========================

    const [loading, setLoading] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [successMessage, setSuccessMessage] = useState("");

    // =====================================================
    // FETCH LAPORAN
    // =====================================================

    const fetchLaporan = useCallback(async () => {
        if (!jwbKasusId) return;

        setLoading(true);
        setError("");

        try {
            const response =
                await getLaporanHasilAuditByKasus(jwbKasusId);

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Gagal mengambil data Laporan Hasil Audit."
                );
            }

            const laporan = response.data;

            // Belum ada laporan untuk kasus ini.
            if (!laporan) {
                setLaporanId(null);
                setOpiniAudit("");
                setDocuments(createInitialDocuments());
                return;
            }

            setLaporanId(laporan.id);
            setOpiniAudit(laporan.opini_audit ?? "");

            // Mapping dokumen dari backend.
            const mappedDocuments = JENIS_FILE_LHA.map(
                (jenisFile) => {
                    const existingDocument =
                        laporan.files?.find(
                            (item) =>
                                item.jenis_file === jenisFile
                        );

                    return {
                        jenis_file: jenisFile,

                        label: LABEL_DOKUMEN[jenisFile],

                        tipe_input:
                            existingDocument?.tipe_input ?? "file",

                        file: null,

                        link:
                            existingDocument?.link ?? "",

                        existingFile:
                            existingDocument?.tipe_input === "file"
                                ? existingDocument
                                : null,
                    };
                }
            );

            setDocuments(mappedDocuments);

        } catch (error) {
            console.error(
                "Gagal mengambil Laporan Hasil Audit:",
                error
            );

            setError(getErrorMessage(error));

        } finally {
            setLoading(false);
        }
    }, [jwbKasusId]);

    // =====================================================
    // LOAD DATA SAAT JWBKASUSID BERUBAH
    // =====================================================

    useEffect(() => {
        fetchLaporan();
    }, [fetchLaporan]);

    // =====================================================
    // UPDATE OPINI AUDIT
    // =====================================================

    const handleOpiniChange = (value) => {
        setOpiniAudit(value);
        setError("");
        setSuccessMessage("");
    };

    // =====================================================
    // UPDATE TIPE INPUT DOKUMEN
    // FILE / LINK
    // =====================================================

    const handleDocumentTypeChange = (
        jenisFile,
        tipeInput
    ) => {
        setDocuments((prev) =>
            prev.map((document) =>
                document.jenis_file === jenisFile
                    ? {
                        ...document,
                        tipe_input: tipeInput,
                        file: null,
                        link: "",
                    }
                    : document
            )
        );

        setError("");
        setSuccessMessage("");
    };

    // =====================================================
    // PILIH FILE
    // =====================================================

    const handleFileChange = (
        jenisFile,
        file
    ) => {
        setDocuments((prev) =>
            prev.map((document) =>
                document.jenis_file === jenisFile
                    ? {
                        ...document,
                        file,
                    }
                    : document
            )
        );

        setError("");
        setSuccessMessage("");
    };

    // =====================================================
    // UPDATE LINK
    // =====================================================

    const handleLinkChange = (
        jenisFile,
        link
    ) => {
        setDocuments((prev) =>
            prev.map((document) =>
                document.jenis_file === jenisFile
                    ? {
                        ...document,
                        link,
                    }
                    : document
            )
        );

        setError("");
        setSuccessMessage("");
    };

    // =====================================================
    // VALIDASI FORM
    // =====================================================

    const validateForm = () => {
        if (!jwbKasusId) {
            return "ID kasus audit tidak ditemukan.";
        }

        if (!opiniAudit) {
            return "Silakan pilih opini audit terlebih dahulu.";
        }

        for (const document of documents) {

            // Validasi FILE
            if (document.tipe_input === "file") {
                const hasNewFile =
                    document.file instanceof File;

                const hasExistingFile = Boolean(
                    document.existingFile?.file_name
                );

                if (!hasNewFile && !hasExistingFile) {
                    return `${document.label} wajib diisi.`;
                }
            }

            // Validasi LINK
            if (document.tipe_input === "link") {
                const link = document.link.trim();

                if (!link) {
                    return `${document.label} wajib diisi.`;
                }

                if (!isValidUrl(link)) {
                    return `${document.label} harus menggunakan URL yang valid dan diawali http:// atau https://.`;
                }
            }
        }

        return "";
    };

    // =====================================================
    // SIMPAN LAPORAN
    // =====================================================

    const handleSave = async () => {
        if (saving) return;

        setError("");
        setSuccessMessage("");

        // Jalankan validasi sebelum mengirim API.
        const validationMessage = validateForm();

        if (validationMessage) {
            setError(validationMessage);
            return;
        }

        setSaving(true);

        try {
            const filesPayload = documents.map((document) => ({
                jenis_file: document.jenis_file,

                tipe_input: document.tipe_input,

                // File baru dikirim jika pengguna memilih file baru.
                file: document.file,

                // Link dikirim hanya untuk tipe input link.
                link:
                    document.tipe_input === "link"
                        ? document.link.trim()
                        : "",
            }));

            const response = await saveLaporanHasilAudit({
                laporanId,
                jwbKasusId,
                opiniAudit,
                files: filesPayload,
            });

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Gagal menyimpan Laporan Hasil Audit."
                );
            }

            // Simpan ID laporan dari response backend.
            const savedReport = response.data;

            setLaporanId(savedReport?.id ?? laporanId);

            // Sinkronisasi dokumen dengan response terbaru.
            if (savedReport?.files) {
                const mappedDocuments = JENIS_FILE_LHA.map(
                    (jenisFile) => {
                        const savedDocument =
                            savedReport.files.find(
                                (item) =>
                                    item.jenis_file === jenisFile
                            );

                        return {
                            jenis_file: jenisFile,

                            label: LABEL_DOKUMEN[jenisFile],

                            tipe_input:
                                savedDocument?.tipe_input ?? "file",

                            file: null,

                            link:
                                savedDocument?.link ?? "",

                            existingFile:
                                savedDocument?.tipe_input === "file"
                                    ? savedDocument
                                    : null,
                        };
                    }
                );

                setDocuments(mappedDocuments);
            }

            setSuccessMessage(
                response.message ||
                "Laporan Hasil Audit berhasil disimpan."
            );

        } catch (error) {
            console.error(
                "Gagal menyimpan Laporan Hasil Audit:",
                error
            );

            setError(getErrorMessage(error));

        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // AMBIL FILE DOKUMEN
    // =====================================================

    const handleViewFile = async (document) => {
        const fileUrl = document?.existingFile?.file_url;

        if (!fileUrl) {
            setError("File dokumen tidak ditemukan.");
            return;
        }

        try {
            const blob = await getFileLaporanHasilAudit(fileUrl);

            const fileObjectUrl = URL.createObjectURL(blob);

            window.open(
                fileObjectUrl,
                "_blank",
                "noopener,noreferrer"
            );

            // Object URL tidak di-revoke langsung
            // karena tab baru masih memerlukannya.

        } catch (error) {
            console.error(
                "Gagal membuka dokumen:",
                error
            );

            setError(getErrorMessage(error));
        }
    };

    // =====================================================
    // RETURN
    // =====================================================

    return {
        laporanId,

        opiniAudit,
        setOpiniAudit,
        handleOpiniChange,

        documents,

        handleDocumentTypeChange,
        handleFileChange,
        handleLinkChange,
        handleViewFile,

        loading,
        saving,

        error,
        setError,

        successMessage,
        setSuccessMessage,

        fetchLaporan,
        handleSave,
    };
}