"use client";

import { useEffect, useRef, useState } from "react";
import {
    FileText,
    Upload,
    X,
} from "lucide-react";

import Dropdown from "@/components/ui/dropdown/dropdown";

const initialFormData = {
    namaFile: "",
    customNamaFile: "",
    file: null,
};

const defaultNamaFileOptions = [
    {
        value: "Rincian",
        label: "Rincian",
    },
    {
        value: "Buku Besar",
        label: "Buku Besar",
    },
    {
        value: "Lain-lain",
        label: "Lain-lain",
    },
];

export default function DokumenForm({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting = false,
    namaFileOptions = defaultNamaFileOptions,
    mode = "create",
    initialData = null,
}) {
    const fileInputRef = useRef(null);

    const [formData, setFormData] =
        useState(initialFormData);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === "edit" && initialData) {
            setFormData({
                namaFile: initialData.namaFile ?? "",
                customNamaFile: initialData.customNamaFile ?? "",
                file: null,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [isOpen, mode, initialData]);

    if (!isOpen) {
        return null;
    }

    const handleNamaFileChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            namaFile: value,
            customNamaFile:
                value === "Lain-lain"
                    ? prev.customNamaFile
                    : "",
        }));
    };

    const handleCustomNamaFileChange = (event) => {
        setFormData((prev) => ({
            ...prev,
            customNamaFile: event.target.value,
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/jpeg",
            "image/png",
        ];

        const maxSize = 16 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            alert(
                "Format file tidak didukung. Gunakan PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, atau PNG."
            );

            event.target.value = "";
            return;
        }

        if (file.size > maxSize) {
            alert("Ukuran file maksimal 16 MB.");

            event.target.value = "";
            return;
        }

        setFormData((prev) => ({
            ...prev,
            file,
        }));
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        await onSubmit({
            tipeFile: formData.namaFile,
            namaFile:
                formData.namaFile === "Lain-lain"
                    ? formData.customNamaFile.trim()
                    : "",
            file: formData.file,
        });
    };

    const isCustomNamaFile =
        formData.namaFile === "Lain-lain";

    const canSubmit =
        !isSubmitting &&
        formData.namaFile &&
        (!isCustomNamaFile ||
            formData.customNamaFile.trim()) &&
        (mode === "edit" || formData.file);


    const handleResetCustomNamaFile = () => {
        setFormData((prev) => ({
            ...prev,
            namaFile: "",
            customNamaFile: "",
        }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-5">
            <div className="w-full max-w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* ================= HEADER ================= */}
                <div className="flex items-start justify-between bg-gradient-to-r from-[#10A8E8] to-[#54B8F7] px-7 py-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                            <FileText
                                size={28}
                                strokeWidth={1.8}
                                className="text-white"
                            />
                        </div>

                        <div>
                            <h2 className="font-poppins text-xl font-semibold text-white">
                                {mode === "edit" ? "Edit Dokumen" : "Input Dokumen"}
                            </h2>

                            <p className="mt-1 font-poppins text-sm text-white">
                                {mode === "edit"
                                    ? "Perbarui dokumen pendukung pengujian audit"
                                    : "Tambahkan dokumen pendukung pengujian audit"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-white transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Tutup"
                    >
                        <X
                            size={25}
                            strokeWidth={2.5}
                        />
                    </button>
                </div>

                {/* ================= FORM ================= */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 px-8 py-7">

                        {/* ================= NAMA FILE ================= */}
                        <div>
                            <label className="mb-2 block font-poppins text-sm font-semibold text-[#334155]">
                                Nama File
                            </label>

                            {isCustomNamaFile ? (
                                <div className="flex h-11 items-center rounded-lg border border-[#DCE5EF] bg-white transition focus-within:border-[#38BDF8]">
                                    <input
                                        type="text"
                                        value={formData.customNamaFile}
                                        onChange={handleCustomNamaFileChange}
                                        placeholder="Masukkan nama file"
                                        autoFocus
                                        className="
                                            min-w-0
                                            flex-1
                                            bg-transparent
                                            px-4
                                            font-poppins
                                            text-sm
                                            text-[#475569]
                                            outline-none
                                            placeholder:text-[#94A3B8]
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={handleResetCustomNamaFile}
                                        disabled={isSubmitting}
                                        className="
                                            mr-2
                                            flex
                                            h-7
                                            w-7
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-md
                                            text-[#94A3B8]
                                            transition
                                            hover:bg-[#F1F5F9]
                                            hover:text-[#64748B]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                        aria-label="Kembali ke pilihan nama file"
                                    >
                                        <X size={16} strokeWidth={2} />
                                    </button>
                                </div>
                            ) : (
                                <Dropdown
                                    options={namaFileOptions}
                                    value={formData.namaFile}
                                    onChange={handleNamaFileChange}
                                    placeholder="Nama File"
                                    className="w-full"
                                />
                            )}
                        </div>

                        {/* ================= FILE ================= */}
                        <div>
                            <label className="mb-2 block font-poppins text-sm font-semibold text-[#334155]">
                                File
                            </label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={handleUploadClick}
                                disabled={isSubmitting}
                                className="
                  flex
                  min-h-[68px]
                  w-full
                  items-center
                  gap-4
                  rounded-xl
                  border
                  border-dashed
                  border-[#CBD5E1]
                  bg-white
                  px-5
                  text-left
                  transition
                  hover:border-[#38BDF8]
                  hover:bg-[#F8FCFF]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F7FE]">
                                    <Upload
                                        size={21}
                                        strokeWidth={1.8}
                                        className="text-[#38BDF8]"
                                    />
                                </div>

                                <div className="min-w-0">
                                    {formData.file ? (
                                        <>
                                            <p className="truncate font-poppins text-sm font-medium text-[#475569]">
                                                {formData.file.name}
                                            </p>

                                            <p className="mt-1 font-poppins text-xs text-[#94A3B8]">
                                                Klik untuk mengganti file
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-poppins text-sm font-medium text-[#475569]">
                                                Klik untuk unggah atau seret berkas
                                            </p>

                                            <p className="mt-1 font-poppins text-xs text-[#94A3B8]">
                                                PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG · Maks. 2 MB
                                            </p>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* ================= FOOTER ================= */}
                    <div className="mx-8 border-t border-[#E2E8F0]" />

                    <div className="flex justify-end gap-3 px-8 py-6">

                        {/* KELUAR */}
                        {/* <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="
                min-w-[95px]
                rounded-lg
                bg-[#E52B2B]
                px-6
                py-3
                font-poppins
                text-sm
                font-bold
                text-white
                transition
                hover:bg-[#D91F1F]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
                        >
                            Keluar
                        </button> */}

                        {/* SIMPAN */}
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="
                                min-w-[120px]
                                rounded-lg
                                bg-[#05A80B]
                                px-6
                                py-3
                                font-poppins
                                text-sm
                                font-bold
                                text-white
                                transition
                                hover:bg-[#04930A]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {isSubmitting
                                ? "Menyimpan..."
                                : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}