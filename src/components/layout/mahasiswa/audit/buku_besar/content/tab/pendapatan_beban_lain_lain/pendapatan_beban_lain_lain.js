
"use client";

import { useState } from "react";

import {
    usePendapatanBebanLainLain,
} from "@/hooks/mahasiswa/tugas/audit/buku_besar/pendapatan_beban_lain_lain/use_pendapatan_beban_lain_lain";

import BukuBesarSectionForm from "@/components/layout/mahasiswa/audit/buku_besar/buku_besar_section/buku_besar_section";

import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";

const GRID_CLASS = `
    grid
    grid-cols-[minmax(150px,1.2fr)_minmax(120px,1fr)_minmax(115px,0.9fr)_16px_minmax(140px,1fr)_minmax(140px,1fr)_24px]
    items-center
    gap-2
`;

function TotalAmountField({ value }) {
    return (
        <div className="
            flex h-10 min-w-0 items-center overflow-hidden
            rounded-lg bg-[#F1F5F9]
        ">
            <span className="
                flex h-full items-center border-r border-white
                px-3 font-poppins text-sm text-[#64748B]
            ">
                Rp
            </span>

            <span className="
                min-w-0 flex-1 truncate px-2 text-right
                font-poppins text-sm text-[#334155]
            ">
                {value ?? "0"}
            </span>
        </div>
    );
}

function TotalPendapatanBeban({ totals }) {
    return (
        <div className="px-5 py-4">
            <div className={GRID_CLASS}>
                <p className="
                    font-poppins text-sm font-semibold text-[#0F172A]
                ">
                    Total Pendapatan (Beban) Lain-Lain
                </p>

                <TotalAmountField value={totals.perBook} />
                <TotalAmountField value={totals.ajeRje} />

                <div />

                <TotalAmountField value={totals.auditedBerjalan} />
                <TotalAmountField value={totals.auditedSebelum} />

                <div />
            </div>
        </div>
    );
}

export default function PendapatanBebanLainLain({
    jwbKasusId,
}) {
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);

    const {
        pendapatanRows,
        bebanRows,
        setPendapatanRows,
        setBebanRows,

        pendapatanAccountOptions,
        bebanAccountOptions,

        dates,
        totalPendapatanBeban,

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
    } = usePendapatanBebanLainLain({
        jwbKasusId,
        top: "M",
    });

    const requestDeleteRow = (section, rowId) => {
        setPendingDelete({ section, rowId });
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = () => {
        if (!pendingDelete) return;

        if (pendingDelete.section === "pendapatan") {
            handleRemoveRow(setPendapatanRows, pendingDelete.rowId);
        } else {
            handleRemoveRow(setBebanRows, pendingDelete.rowId);
        }

        setShowDeletePopup(false);
        setPendingDelete(null);
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
                subText="Baris yang dihapus akan hilang dari tampilan. Klik Simpan untuk menyimpan perubahan."
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
                {/* SECTION 1: PENDAPATAN LAIN-LAIN */}
                <BukuBesarSectionForm
                    title="Pendapatan Lain-Lain"
                    subtitle="Pendapatan Lain-Lain"
                    totalTitle="Total Pendapatan"
                    accountOptions={pendapatanAccountOptions.map(
                        (item) => item.account
                    )}
                    rows={pendapatanRows}
                    dates={dates}
                    onDateChange={handleDateChange}
                    onRowChange={(rowId, field, value) =>
                        handleRowChange(
                            setPendapatanRows,
                            pendapatanAccountOptions,
                            rowId,
                            field,
                            value
                        )
                    }
                    onAddRow={() =>
                        handleAddRow(
                            setPendapatanRows,
                            "Pendapatan Lain-Lain"
                        )
                    }
                    onRemoveRow={(rowId) =>
                        requestDeleteRow("pendapatan", rowId)
                    }
                />

                <div className="mx-5 h-px bg-[#E2E8F0]" />

                {/* SECTION 2: BEBAN LAIN-LAIN */}
                <BukuBesarSectionForm
                    title="Beban Lain-Lain"
                    subtitle="Beban Lain-Lain"
                    totalTitle="Total Beban"
                    accountOptions={bebanAccountOptions.map(
                        (item) => item.account
                    )}
                    rows={bebanRows}
                    dates={dates}
                    onDateChange={handleDateChange}
                    onRowChange={(rowId, field, value) =>
                        handleRowChange(
                            setBebanRows,
                            bebanAccountOptions,
                            rowId,
                            field,
                            value
                        )
                    }
                    onAddRow={() =>
                        handleAddRow(
                            setBebanRows,
                            "Beban Lain-Lain"
                        )
                    }
                    onRemoveRow={(rowId) =>
                        requestDeleteRow("beban", rowId)
                    }
                />

                <div className="mx-5 h-px bg-[#E2E8F0]" />

                {/* GRAND TOTAL TOP M */}
                <TotalPendapatanBeban
                    totals={totalPendapatanBeban}
                />

                {/* TOMBOL SIMPAN */}
                <div className="flex justify-end px-5 py-4">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
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
