"use client";

import { ArrowLeft } from "lucide-react";

import {
    useParams,
    useRouter,
} from "next/navigation";

import AsetLainLainTabs from "@/components/layout/mahasiswa/audit/pengujian_substantif/aset_lain_lain/aset_lain_lain_tab/aset_lain_lain_tab";

import KeepAliveTabPanels from "@/components/ui/keep_alive_tabs/keep_alive_tab_panels";

import useTabManager from "@/hooks/use_tab_manager";

import ProsedurTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/aset_lain_lain/tab/prosedur/prosedur";

import DokumenTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/aset_lain_lain/tab/dokumen/dokumen"

import DokumentasiAsetLainLainTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/aset_lain_lain/tab/dokumentasi_aset_lain_lain/dokumentasi_aset_lain_lain";

import KonfirmasiTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/aset_lain_lain/tab/konfirmasi/konfirmasi";

import RekapBalasanTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/aset_lain_lain/tab/rekap_balasan/rekap_balasan";

import BuktiPendukungTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/aset_lain_lain/tab/bukti_pendukung/bukti_pendukung";

import WawancaraTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/aset_lain_lain/tab/wawancara/wawancara";

import JurnalKoreksiTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/aset_lain_lain/tab/jurnal_koreksi/jurnal_koreksi";

// Daftar tab Aset Lain Lain
const TAB_KEYS = [
    "prosedur",
    "dokumen",
    "konfirmasi",
    "rekap_balasan",
    "dokumentasi_aset_lain_lain",
    "bukti_pendukung",
    "wawancara",
    "jurnal_koreksi",
];

function TabPlaceholder({ name }) {
    return (
        <div className="rounded-xl border border-[#DCE5EF] bg-white p-5">
            <p className="font-poppins text-sm text-[#64748B]">
                {name}
            </p>
        </div>
    );
}


export default function AsetLainLainPage() {

    const router = useRouter();

    const params = useParams();

    const auditId = params.id;


    const {
        activeTab,
        openTab,
        isTabMounted,
        panelClassName,
        tokenOf,
        notifySaved,
    } = useTabManager({
        tabKeys: TAB_KEYS,
        depGraph: {},
        defaultTab: "prosedur",
    });


    const tabPanels = [

        {
            key: "prosedur",
            element: (
                <ProsedurTab auditId={auditId}  />
            ),
        },

        {
            key: "dokumen",
            element: (
                <DokumenTab auditId={auditId} />
            ),
        },

        {
            key: "konfirmasi",
            element: (
                <KonfirmasiTab onSaved={() => notifySaved("konfirmasi")} />
            ),
        },

        {
            key: "rekap_balasan",
            element: (
                <RekapBalasanTab refetchToken={tokenOf("rekap_balasan")}
                onSaved={() => notifySaved("rekap_balasan")} />
            ),
        },

        {
            key: "dokumentasi_aset_lain_lain",
            element: <DokumentasiAsetLainLainTab auditId={auditId} />,
        },

        {
            key: "bukti_pendukung",
            element: (
                <BuktiPendukungTab auditId={auditId} />
            ),
        },

        {
            key: "wawancara",
            element: (
                <WawancaraTab auditId={auditId} />
            ),
        },

        {
            key: "jurnal_koreksi",
            element: <JurnalKoreksiTab auditId={auditId} />,
        },

    ];


    return (
        <main className="w-full pr-6 pt-4">

            <div className="mx-auto max-w-[1300px]">

                <section className="overflow-hidden rounded-xl bg-white shadow-sm">

                    {/* HEADER */}

                    <div
                        className="
                            flex
                            items-center
                            gap-4
                            bg-[#51B7FF]
                            px-7
                            py-5
                        "
                    >

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

                            <h1
                                className="
                                    font-poppins
                                    text-xl
                                    font-semibold
                                    text-white
                                "
                            >
                                Aset Lain-Lain
                            </h1>


                            <p
                                className="
                                    font-poppins
                                    text-xs
                                    text-white/80
                                "
                            >
                                Pengujian
                            </p>

                        </div>

                    </div>


                    {/* CONTENT */}

                    <div className="p-5">


                        {/* TAB */}

                        <AsetLainLainTabs
                            activeTab={activeTab}
                            setActiveTab={openTab}
                        />


                        {/* TAB CONTENT */}

                        <div className="mt-5">

                            <KeepAliveTabPanels
                                panels={tabPanels}
                                isTabMounted={isTabMounted}
                                panelClassName={panelClassName}
                            />

                        </div>


                    </div>

                </section>

            </div>

        </main>
    );
}