"use client";

import { ArrowLeft } from "lucide-react";

import {
    useParams,
    useRouter,
} from "next/navigation";

import KasTabs from "@/components/layout/mahasiswa/audit/pengujian_substantif/kas/kas_tab/kas_tab";

import KeepAliveTabPanels from "@/components/ui/keep_alive_tabs/keep_alive_tab_panels";

import useTabManager from "@/hooks/use_tab_manager";

// import ProsedurTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/kas/tab/prosedur/prosedur";

// import DokumenTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/kas/tab/dokumen/dokumen";

// import CashCountTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/kas/tab/cash_count/cash_count";

// import RekapMutasiKasTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/kas/tab/rekap_mutasi_kas/rekap_mutasi_kas";

// import UjiMutasiKasTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/kas/tab/uji_mutasi_kas/uji_mutasi_kas";

// import JurnalKoreksiTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/kas/tab/jurnal_koreksi/jurnal_koreksi";

// Daftar tab Kas
const TAB_KEYS = [
    "prosedur",
    "dokumen",
    "cash_count",
    "rekap_mutasi_kas",
    "uji_mutasi_kas",
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


export default function KasPage() {

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
                <TabPlaceholder name="Prosedur" />
            ),
        },

        {
            key: "dokumen",
            element: (
                <TabPlaceholder name="Dokumen" />
            ),
        },

        {
            key: "cash_count",
            element: (
                <TabPlaceholder name="Cash Count" />
            ),
        },

        {
            key: "rekap_mutasi_kas",
            element: (
                <TabPlaceholder name="Rekap Mutasi Kas" />
            ),
        },

        {
            key: "uji_mutasi_kas",
            element: (
                <TabPlaceholder name="Uji Mutasi Kas" />
            ),
        },

        {
            key: "jurnal_koreksi",
            element: (
                <TabPlaceholder name="Jurnal Koreksi" />
            ),
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
                                Kas
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

                        <KasTabs
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