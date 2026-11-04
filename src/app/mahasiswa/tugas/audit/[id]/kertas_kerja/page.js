"use client";

import { useEffect, useState } from "react";
import { CalendarDays, FileCheck } from "lucide-react";
import { useParams } from "next/navigation";

import Wbs from "@/components/layout/mahasiswa/audit/kertas_kerja/tab/wbs/wbs";
import Wpl from "@/components/layout/mahasiswa/audit/kertas_kerja/tab/wpl/wpl";
import { getKertasKerja } from "@/services/mahasiswa/tugas/audit/kertas_kerja/kertas_kerja";

const TABS = {
    WBS: "wbs",
    WPL: "wpl",
};

export default function KertasKerjaPage() {
    const params = useParams();
    const [activeTab, setActiveTab] = useState(TABS.WBS);
    const [kertasKerja, setKertasKerja] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!params?.id) return undefined;

        let cancelled = false;

        const fetchKertasKerja = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getKertasKerja(params.id);

                if (!response?.data) {
                    throw new Error("Data Kertas Kerja tidak ditemukan.");
                }

                if (!cancelled) setKertasKerja(response.data);
            } catch (requestError) {
                if (cancelled) return;

                console.error("Gagal mengambil data Kertas Kerja:", requestError);
                setError(
                    requestError.response?.data?.message ||
                        requestError.message ||
                        "Gagal mengambil data Kertas Kerja."
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchKertasKerja();

        return () => {
            cancelled = true;
        };
    }, [params?.id]);

    const formatDate = (date) =>
        date
            ? new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              }).format(new Date(date))
            : "-";

    const tanggalPerBook = formatDate(
        kertasKerja?.TanggalPerBook ?? kertasKerja?.periode
    );
    const tanggalAuditBerjalan = formatDate(
        kertasKerja?.TanggalAuditJln ?? kertasKerja?.periode
    );
    const tanggalAuditSebelum = formatDate(kertasKerja?.TanggalAuditSblm);

    return (
        <main className="w-full pr-6 pt-4 pb-4">
            <section className="mx-auto min-h-[calc(100vh-98px)] max-w-[1300px] overflow-hidden rounded-xl bg-white shadow-sm">
                <header className="flex items-center gap-4 bg-[#51B7FF] px-8 py-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                        <FileCheck size={22} strokeWidth={1.8} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-poppins text-xl font-semibold text-white">
                            Kertas Kerja
                        </h1>
                        <p className="font-poppins text-xs text-white/80">
                            Ringkasan akhir saldo tiap akun sebagai dasar pemeriksaan
                        </p>
                    </div>
                </header>

                <div className="px-5 pb-8 pt-6">
                    <div className="relative -top-1 grid grid-cols-[1.4fr_repeat(4,1fr)] items-center border-b border-[#E2E8F0] py-4">
                        <div className="flex w-fit rounded-xl bg-[#EEF3F8] p-1.5">
                            {Object.entries(TABS).map(([label, value]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setActiveTab(value)}
                                    className={`min-w-[88px] rounded-lg px-6 py-2.5 font-poppins text-xs font-medium transition ${
                                        activeTab === value
                                            ? "bg-white text-[#1D9BEA] shadow-sm"
                                            : "text-[#64748B] hover:text-[#1D9BEA]"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {[
                            ["Per Book", tanggalPerBook],
                            ["AJE/RJE", ""],
                            ["Audited Berjalan", tanggalAuditBerjalan],
                            ["Audited Sebelum", tanggalAuditSebelum],
                        ].map(([label, date]) => (
                            <div
                                key={label}
                                className="text-center font-poppins text-sm text-[#334155]"
                            >
                                <p className="font-semibold">{label}</p>
                                {date && (
                                    <p className="mt-2 flex items-center justify-center gap-1 text-sm text-[#475569]">
                                        <CalendarDays
                                            size={12}
                                            strokeWidth={1.8}
                                            className="text-[#94A3B8]"
                                        />
                                        {date}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-5">
                        {loading && (
                            <p className="py-6 text-center font-poppins text-sm text-[#64748B]">
                                Memuat data Kertas Kerja...
                            </p>
                        )}
                        {error && (
                            <p className="py-6 text-center font-poppins text-sm text-red-600">
                                {error}
                            </p>
                        )}
                        {activeTab === TABS.WBS ? (
                            !loading && !error && <Wbs data={kertasKerja?.wbs} />
                        ) : (
                            !loading && !error && <Wpl data={kertasKerja?.wpl} />
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}