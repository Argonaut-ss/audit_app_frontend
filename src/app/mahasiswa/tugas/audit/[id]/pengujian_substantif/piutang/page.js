"use client";

import { useState } from "react";

import {
    ArrowLeft,
} from "lucide-react";

import {
    useParams,
    useRouter,
} from "next/navigation";

// import AuditSidebar from "@/components/layout/mahasiswa/audit/layout/audit_sidebar/audit_sidebar";

import PiutangTabs from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/piutang_tab/piutang_tab";

import ProsedurTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/prosedur/prosedur";

// import DokumenTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/dokumen";

// import KonfirmasiPiutangTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/konfirmasi_piutang/konfirmasi_piutang";

// import RekapBalasanKonfirmasiTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/rekap_balasan_konfirmasi/rekap_balasan_konfirmasi";

// import ProsedurAlternatifTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/prosedur_alternatif/prosedur_alternatif";

import RekonsiliasiPiutangTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/rekonsiliasi_piutang/rekonsiliasi_piutang";

import AnalisisUmurPiutang from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/analisis_umur_piutang/analisis_umur_piutang";

import JurnalKoreksi from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/jurnal_koreksi/jurnal_koreksi";


export default function PiutangPage() {

    const router = useRouter();

    const params = useParams();

    const auditId = params.id;


    const [activeTab, setActiveTab] =
        useState("prosedur");


    const renderTabContent = () => {

        switch (activeTab) {

            case "prosedur":
                return <ProsedurTab />;

            case "dokumen":
                return <DokumenTab />;

            case "konfirmasi_piutang":
                return <KonfirmasiPiutangTab />;

            case "rekap_balasan_konfirmasi":
                return <RekapBalasanKonfirmasiTab />;

            case "prosedur_alternatif":
                return <ProsedurAlternatifTab />;

            case "rekonsiliasi_piutang":
                return <RekonsiliasiPiutangTab />;

            case "analisis_umur_piutang":
                return <AnalisisUmurPiutang />;

            case "jurnal_koreksi":
                return <JurnalKoreksi />;

            default:
                return <ProsedurTab />;

        }

    };


    return (
        <main className="w-full pr-6 pt-4">

            <div className="mx-auto max-w-[1300px]">

                <section className="overflow-hidden rounded-xl bg-white shadow-sm">


                    {/* HEADER */}

                    <div className="
              flex
              items-center
              gap-4
              bg-[#51B7FF]
              px-7
              py-5
            ">

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    `/mahasiswa/tugas/audit/${auditId}/pengujian_substantif`
                                )
                            }
                            className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/10
                  text-white
                  transition
                  hover:bg-white/20
                "
                        >

                            <ArrowLeft size={20} />

                        </button>


                        <div>

                            <h1 className="
                  font-poppins
                  text-xl
                  font-semibold
                  text-white
                ">
                                Piutang
                            </h1>


                            <p className="
                  font-poppins
                  text-xs
                  text-white/80
                ">
                                Pengujian
                            </p>

                        </div>

                    </div>


                    {/* CONTENT */}

                    <div className="p-5">


                        {/* TAB */}

                        <PiutangTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />


                        {/* TAB CONTENT */}

                        <div className="mt-5">

                            {renderTabContent()}

                        </div>


                    </div>

                </section>

            </div>

        </main>
    );
}