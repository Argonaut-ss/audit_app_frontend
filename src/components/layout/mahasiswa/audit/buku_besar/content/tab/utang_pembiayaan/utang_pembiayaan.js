"use client";

import { useParams } from "next/navigation";

import { useUtangPembiayaan } from "@/hooks/mahasiswa/tugas/audit/buku_besar/utang_pembiayaan/use_utang_pembiayaan";

import BukuBesarSectionForm from "@/components/layout/mahasiswa/audit/buku_besar/buku_besar_section/buku_besar_section";

import AlertSuccess from "@/components/alert/alert_success";

export default function UtangPembiayaan({
    jwbKasusId,
    isSaving = false,
}) {
    const params = useParams();
    const effectiveJwbKasusId = jwbKasusId || params?.id;

    const {
        utangPembiayaanRows,
        utangPembiayaanAccountOptions,
        dates,
        loading,
        saving,
        error,
        successMessage,
        setSuccessMessage,
        handleDateChange,
        handleRowChange,
        handleSave,
    } = useUtangPembiayaan({
        jwbKasusId: effectiveJwbKasusId,
        top: "I",
    });

    return (
        <>
            <AlertSuccess
                message={successMessage}
                onClose={() => setSuccessMessage("")}
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
                    title="Utang Pembiayaan"
                    subtitle="Utang Pembiayaan"
                    accountOptions={
                        utangPembiayaanAccountOptions.length
                            ? utangPembiayaanAccountOptions.map(
                                  (item) => item.account
                              )
                            : ["Utang Pembiayaan"]
                    }
                    rows={utangPembiayaanRows}
                    dates={dates}
                    onDateChange={handleDateChange}
                    onRowChange={handleRowChange}
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