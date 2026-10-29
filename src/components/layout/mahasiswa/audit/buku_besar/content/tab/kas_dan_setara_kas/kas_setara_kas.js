"use client";

import { useEffect, useState } from "react";

import { getBukuBesar, updateBukuBesar } from "@/services/mahasiswa/tugas/audit/buku_besar/buku_besar";

import { useBukuBesar } from "@/hooks/mahasiswa/tugas/audit/buku_besar/use_buku_besar";

import BukuBesarSectionForm from "@/components/layout/mahasiswa/audit/buku_besar/buku_besar_section/buku_besar_section";

import AlertSuccess from "@/components/alert/alert_success";

import ConfirmationPopup from "@/components/popup/confirmation_popup";

export default function KasSetaraKas({
    jwbKasusId,
    onSave,
    isSaving = false,
}) {

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);

    const {
        kasRows,
        bankRows,
        setKasRows,
        setBankRows,
        kasAccountOptions,
        bankAccountOptions,
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
    } = useBukuBesar({
        jwbKasusId,
        top: "A",
    });

    const requestDeleteRow = (section, rowId) => {
        setPendingDelete({ section, rowId });
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = () => {
        if (!pendingDelete) return;

        if (pendingDelete.section === "kas") {
            handleRemoveRow(setKasRows, pendingDelete.rowId);
        } else {
            handleRemoveRow(setBankRows, pendingDelete.rowId);
        }

        setShowDeletePopup(false);
        setPendingDelete(null);
        setSuccessMessage("Baris berhasil dihapus.");
    };


    return (

        <>
            <AlertSuccess
                message={successMessage}
                onClose={() => setSuccessMessage("")}
            />

            <ConfirmationPopup
                isOpen={showDeletePopup}
                message="Apakah Anda yakin ingin menghapus baris ini?"
                subText="Data baris yang dihapus akan hilang dari tampilan ini."
                confirmText="Hapus"
                cancelText="Batal"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeletePopup(false);
                    setPendingDelete(null);
                }}
                onClose={() => {
                    setShowDeletePopup(false);
                    setPendingDelete(null);
                }}
                closeOnBackdrop={true}
            />

            {loading && (
                <p className="px-5 py-3 text-sm text-gray-500">
                    Memuat data Buku Besar...
                </p>
            )}

            {error && (
                <p className="px-5 py-3 text-sm text-red-600">
                    {error}
                </p>
            )}
            <div className="overflow-hidden rounded-xl bg-white">

                {/* =========================
                KELOMPOK 1:
                KAS DAN SETARA KAS
            ========================= */}

                <BukuBesarSectionForm
                    title="Kas dan Setara Kas"
                    subtitle="Kas dan Setara Kas"
                    accountOptions={kasAccountOptions.map(
                        (item) => item.account
                    )}
                    rows={kasRows}
                    dates={dates}
                    onDateChange={handleDateChange}
                    onRowChange={(rowId, field, value) =>
                        handleRowChange(
                            setKasRows,
                            kasAccountOptions,
                            rowId,
                            field,
                            value
                        )
                    }
                    onAddRow={(newRow) => handleAddRow(setKasRows, newRow)}
                    onRemoveRow={(rowId) =>
                        requestDeleteRow("kas", rowId)
                    }
                />

                <div className="mx-5 h-px bg-[#E2E8F0]" />

                {/* =========================
                KELOMPOK 2:
                RINCIAN SETARA KAS - BANK
            ========================= */}

                <BukuBesarSectionForm
                    title="Rincian Setara Kas – Bank"
                    subtitle="Kas dan Setara Kas"
                    accountOptions={bankAccountOptions.map(
                        (item) => item.account
                    )}
                    
                    rows={bankRows}
                    dates={dates}
                    onDateChange={handleDateChange}
                    onRowChange={(rowId, field, value) =>
                        handleRowChange(
                            setBankRows,
                            bankAccountOptions,
                            rowId,
                            field,
                            value
                        )
                    }
                    onAddRow={(newRow) => handleAddRow(setBankRows, newRow)}
                    onRemoveRow={(rowId) =>
                        requestDeleteRow("bank", rowId)
                    }
                />


                {/* =========================
                TOMBOL SIMPAN
            ========================= */}

                <div className="flex justify-end px-5 py-4">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="
                        min-w-[100px]
                        rounded-lg
                        bg-[#05A80B]
                        px-5
                        py-2.5
                        font-poppins
                        text-xs
                        font-semibold
                        text-white
                        transition
                        hover:bg-[#04930A]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                    >
                        {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>

            </div>
        </>
    );
}