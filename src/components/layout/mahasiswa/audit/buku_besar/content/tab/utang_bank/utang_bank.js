
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { useUtangBank } from "@/hooks/mahasiswa/tugas/audit/buku_besar/utang_bank/use_utang_bank";

import BukuBesarSectionForm from "@/components/layout/mahasiswa/audit/buku_besar/buku_besar_section/buku_besar_section";

import AlertSuccess from "@/components/alert/alert_success";

import ConfirmationPopup from "@/components/popup/confirmation_popup";

export default function UtangBank({
    jwbKasusId,
    onSave,
    isSaving = false,
}) {
    const params = useParams();
    const effectiveJwbKasusId = jwbKasusId || params?.id;

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);

    const {
        utangBankRows,
        setUtangBankRows,
        utangBankAccountOptions,
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
    } = useUtangBank({
        jwbKasusId: effectiveJwbKasusId,
        top: "G",
    });

    // =========================
    // REQUEST DELETE
    // =========================
    const requestDeleteRow = (rowId) => {
        setPendingDelete({ rowId });
        setShowDeletePopup(true);
    };

    // =========================
    // CONFIRM DELETE
    // =========================
    const handleConfirmDelete = () => {
        if (!pendingDelete) return;

        handleRemoveRow(
            setUtangBankRows,
            pendingDelete.rowId
        );

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
                <BukuBesarSectionForm
                    title="Utang Bank"
                    subtitle="Utang Bank"
                    accountOptions={utangBankAccountOptions.map(
                        (item) => item.account
                    )}
                    rows={utangBankRows}
                    dates={dates}
                    onDateChange={handleDateChange}
                    onRowChange={(rowId, field, value) =>
                        handleRowChange(
                            setUtangBankRows,
                            utangBankAccountOptions,
                            rowId,
                            field,
                            value
                        )
                    }
                    onAddRow={(newRow) =>
                        handleAddRow(setUtangBankRows, newRow)
                    }
                    onRemoveRow={(rowId) =>
                        requestDeleteRow(rowId)
                    }
                />

                <div className="flex justify-end px-5 py-4">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading || isSaving}
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
                        {saving || isSaving ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </>
    );
}
