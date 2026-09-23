"use client";

import {
    ArrowLeft,
} from "lucide-react";

import {
    useParams,
    useRouter,
} from "next/navigation";

import PersediaanTabs from "@/components/layout/mahasiswa/audit/pengujian_substantif/persediaan/persediaan_tab/persediaan_tab";

import KeepAliveTabPanels from "@/components/ui/keep_alive_tabs/keep_alive_tab_panels";

import useTabManager from "@/hooks/use_tab_manager";

import ProsedurTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/persediaan/tab/prosedur/prosedur";

import DokumenTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/persediaan/tab/dokumen/dokumen";

import StokOpnameTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/persediaan/tab/stok_opname/stok_opname";

import MutasiStokOpnameTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/persediaan/tab/mutasi_stok_opname/mutasi_stock_opname";

// import UjiMutasiTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/persediaan/tab/uji_mutasi/uji_mutasi";

// import TestPricingTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/persediaan/tab/test_pricing/test_pricing";

import JurnalKoreksi from "@/components/layout/mahasiswa/audit/pengujian_substantif/persediaan/tab/jurnal_koreksi/jurnal_koreksi";

// Daftar tab card Persediaan.
const TAB_KEYS = [
    "prosedur",
    "dokumen",
    "stok_opname",
    "mutasi_stok_opname",
    "uji_mutasi",
    "test_pricing",
    "jurnal_koreksi",
];

// Belum ada ketergantungan antar-tab yang perlu targeted refetch.
const DEP_GRAPH = {};


// Placeholder sementara sampai komponen tab asli dibuat.
function TabPlaceholder({ label }) {
    return (
        <div className="
            flex
            min-h-[240px]
            items-center
            justify-center
            rounded-xl
            border
            border-dashed
            border-[#DCE5EF]
            bg-[#F8FAFC]
        ">
            <p className="
                font-poppins
                text-sm
                text-[#64748B]
            ">
                {label}
            </p>
        </div>
    );
}


export default function PersediaanPage() {

    const router = useRouter();

    const params = useParams();

    const auditId = params.id;

    const {
        activeTab,
        openTab,
        isTabMounted,
        panelClassName,
    } = useTabManager({
        tabKeys: TAB_KEYS,
        depGraph: DEP_GRAPH,
        defaultTab: "prosedur",
    });

    const tabPanels = [
        { key: "prosedur", element: <ProsedurTab auditId={auditId} /> },
        { key: "dokumen", element: <DokumenTab auditId={auditId} /> },
        { key: "stok_opname", element: <StokOpnameTab auditId={auditId} /> },
        { key: "mutasi_stok_opname", element: <MutasiStokOpnameTab auditId={auditId} /> },
        { key: "uji_mutasi", element: <TabPlaceholder label="Uji Mutasi" /> },
        { key: "test_pricing", element: <TabPlaceholder label="Test Pricing" /> },
        { key: "jurnal_koreksi", element: <JurnalKoreksi auditId={auditId} /> },
    ];


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
                                Persediaan
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

                        <PersediaanTabs
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
