"use client";

import { ArrowLeft } from "lucide-react";

import {
    useParams,
    useRouter,
} from "next/navigation";

import BebanUsahaTabs from "@/components/layout/mahasiswa/audit/pengujian_substantif/beban_usaha/beban_usaha_tab/beban_usaha_tab";

import KeepAliveTabPanels from "@/components/ui/keep_alive_tabs/keep_alive_tab_panels";

import useTabManager from "@/hooks/use_tab_manager";

// import ProsedurTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/beban_usaha/tab/prosedur/prosedur";

// import DokumenTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/beban_usaha/tab/dokumen/dokumen";

// import CutOffTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/beban_usaha/tab/cut_off/cut_off";

// import VouchingTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/beban_usaha/tab/vouching/vouching";

// import JurnalKoreksiTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/beban_usaha/tab/jurnal_koreksi/jurnal_koreksi";


// Daftar tab Beban Usaha
const TAB_KEYS = [
    "prosedur",
    "dokumen",
    "cut_off",
    "vouching",
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


export default function BebanUsahaPage() {

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
                <TabPlaceholder
                    name="Prosedur"
                />
            ),
        },

        {
            key: "dokumen",
            element: (
                <TabPlaceholder
                    name="Dokumen"
                />
            ),
        },

        {
            key: "cut_off",
            element: (
                <TabPlaceholder
                    name="Cut Off"
                />
            ),
        },

        {
            key: "vouching",
            element: (
                <TabPlaceholder
                    name="Vouching"
                />
            ),
        },

        {
            key: "jurnal_koreksi",
            element: (
                <TabPlaceholder
                    name="Jurnal Koreksi"
                />
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
                                Beban Usaha
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

                        <BebanUsahaTabs
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