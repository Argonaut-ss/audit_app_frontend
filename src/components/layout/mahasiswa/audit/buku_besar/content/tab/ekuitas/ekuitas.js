"use client";

import { useParams } from "next/navigation";

import { useEkuitas } from "@/hooks/mahasiswa/tugas/audit/buku_besar/ekuitas/use_ekuitas";

import BukuBesarSectionForm from "@/components/layout/mahasiswa/audit/buku_besar/buku_besar_section/buku_besar_section";

import AlertSuccess from "@/components/alert/alert_success";

export default function Ekuitas({
    jwbKasusId,
    isSaving = false,
}) {
    const params = useParams();
    const effectiveJwbKasusId = jwbKasusId || params?.id;

    const {
        ekuitasRows,
        ekuitasAccountOptions,
        dates,
        loading,
        saving,
        error,
        successMessage,
        setSuccessMessage,
        handleDateChange,
        handleRowChange,
        handleSave,
    } = useEkuitas({
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
                    jwbKasusId={jwbKasusId}
                    title="Ekuitas"
                    subtitle="Ekuitas"
                    accountOptions={
                        ekuitasAccountOptions.length
                            ? ekuitasAccountOptions.map(
                                  (item) => item.account
                              )
                            : ["Ekuitas"]
                    }
                    rows={ekuitasRows}
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