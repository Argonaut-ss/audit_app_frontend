"use client";

import { useParams } from "next/navigation";

import {
    FileText,
    Scale,
    Upload,
    CloudUpload,
    Link as LinkIcon,
    ExternalLink,
} from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import Dropdown from "@/components/ui/dropdown/dropdown";

import DocumentInput from "./upload_dokumen_form/upload_dokumen_form";

import { useLaporanHasilAudit } from "@/hooks/mahasiswa/tugas/audit/laporan_hasil_audit/use_laporan_hasil_audit";

// =====================================================
// CONSTANT
// =====================================================

const OPINI_AUDIT_OPTIONS = [
    "Wajar Tanpa Pengecualian",
    "Wajar Dengan Pengecualian",
    "Tidak Wajar",
    "Tidak Menyatakan Pendapat",
];

// =====================================================
// MAIN PAGE
// =====================================================

export default function LaporanHasilAuditPage() {
    const params = useParams();
    const jwbKasusId = params.id;

    const {
        opiniAudit,
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

        handleSave,
    } = useLaporanHasilAudit({ jwbKasusId });

    return (
        <main className="w-full pr-6 pt-4 pb-4">
            <div className="mx-auto max-w-[1300px]">
                <section
                    className="
                        min-h-[calc(100vh-98px)]
                        overflow-hidden
                        rounded-xl
                        bg-white
                        shadow-sm
                    "
                >
                    {/* HEADER */}
                    <div className="flex min-h-[74px] items-center gap-3 rounded-t-xl bg-gradient-to-r from-[#0DB5F5] to-[#4CB5F7] px-8 py-6">
                        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-white/20">
                            <FileText
                                size={21}
                                className="text-white"
                            />
                        </div>

                        <div>
                            <h1 className="font-poppins text-xl font-semibold text-white">
                                Laporan Hasil Audit
                            </h1>

                            <p className="text-xs text-white/90">
                                Rekap laporan keuangan audited beserta penilaian audit.
                            </p>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="space-y-3.5 px-[18px] pb-6 pt-[18px]">

                        {/* SECTION OPINI */}
                        <section className="rounded-2xl border border-[#E5ECF4] bg-white px-5 py-5 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-[#EDF1F6] pb-4">
                                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-lg bg-[#EFF8FF]">
                                    <Scale
                                        size={20}
                                        className="text-[#20B5F5]"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-[#26364F]">
                                        Opini
                                    </h2>

                                    <p className="text-xs text-[#94A3B8]">
                                        Tentukan opini akhir auditor berdasarkan hasil pemeriksaan akun.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="mb-2 block text-[13px] font-semibold text-[#34445F]">
                                    Opini Audit{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <Dropdown
                                    options={OPINI_AUDIT_OPTIONS}
                                    value={opiniAudit}
                                    onChange={handleOpiniChange}
                                    placeholder="Pilih Opini Audit"
                                    className="max-w-[280px]"
                                />
                            </div>
                        </section>

                        {/* SECTION DOKUMEN */}
                        <section className="rounded-2xl border border-[#E5ECF4] bg-white px-5 py-5 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-[#EDF1F6] pb-4">
                                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-lg bg-[#EFF8FF]">
                                    <Upload
                                        size={20}
                                        className="text-[#20B5F5]"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-[#26364F]">
                                        Dokumen Laporan Audit
                                    </h2>

                                    <p className="text-xs text-[#94A3B8]">
                                        Unggah dokumen pendukung laporan hasil audit dalam format PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, atau PNG. Kamu juga dapat mengaktifkan "Gunakan Link" untuk memakai tautan.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-5 md:grid-cols-2">
                                {documents.map((document) => (
                                    <DocumentInput
                                        key={document.jenis_file}
                                        document={document}
                                        onTypeChange={handleDocumentTypeChange}
                                        onFileChange={handleFileChange}
                                        onLinkChange={handleLinkChange}
                                        onViewFile={handleViewFile}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* TOMBOL SIMPAN */}
                        <div className="mt-3 flex justify-end border-t border-[#EDF1F6] pt-3">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || loading}
                                className="
                                    h-9 min-w-[80px]
                                    rounded-md bg-green-600
                                    px-5
                                    text-xs font-semibold text-white
                                    shadow-sm transition-colors
                                    hover:bg-green-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                {saving ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* ALERT ERROR */}
            <AlertError
                message={error}
                onClose={() => setError("")}
            />

            {/* ALERT SUCCESS */}
            <AlertSuccess
                message={successMessage}
                onClose={() => setSuccessMessage("")}
            />
        </main>
    );
}