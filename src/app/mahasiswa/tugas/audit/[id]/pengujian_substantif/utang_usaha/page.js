"use client";

import {
    ArrowLeft,
} from "lucide-react";

import {
    useParams,
    useRouter,
} from "next/navigation";

import UtangUsahaTabs from "@/components/layout/mahasiswa/audit/pengujian_substantif/utang_usaha/utang_usaha_tab/utang_usaha_tab";

import KeepAliveTabPanels from "@/components/ui/keep_alive_tabs/keep_alive_tab_panels";

import useTabManager from "@/hooks/use_tab_manager";

import ProsedurTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/utang_usaha/tab/prosedur/prosedur";

import DokumenTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/utang_usaha/tab/dokumen/dokumen";

import KonfirmasiUtangTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/utang_usaha/tab/konfirmasi_utang/konfirmasi_utang";

import RekapBalasanTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/utang_usaha/tab/rekap_balasan/rekap_balasan";

import ProsedurAlternatifTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/utang_usaha/tab/prosedur_alternatif/prosedur_alternatif";

// import RekonsiliasiUtangTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/utang_usaha/tab/rekonsiliasi_utang/rekonsiliasi_utang";

import JurnalKoreksiTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/utang_usaha/tab/jurnal_koreksi/jurnal_koreksi";

// Daftar tab card Utang Usaha.
const TAB_KEYS = [
    "prosedur",
    "dokumen",
    "konfirmasi_utang",
    "rekap_balasan",
    "prosedur_alternatif",
    "rekonsiliasi_utang",
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


export default function UtangUsahaPage() {

    const router = useRouter();

    const params = useParams();

    const auditId = params.id;

    const {
        activeTab,
        openTab,
        isTabMounted,
        panelClassName,
        notifySaved,
        tokenOf,
    } = useTabManager({
        tabKeys: TAB_KEYS,
        depGraph: DEP_GRAPH,
        defaultTab: "prosedur",
    });

    const tabPanels = [
        { key: "prosedur", element: <ProsedurTab auditId={auditId} /> },
        { key: "dokumen", element: <DokumenTab auditId={auditId} /> },
        { key: "konfirmasi_utang", element: <KonfirmasiUtangTab onSaved={() => notifySaved("konfirmasi_utang")} /> },
        { key: "rekap_balasan", element: ( <RekapBalasanTab refetchToken={tokenOf("rekap_balasan")} onSaved={() => notifySaved("rekap_balasan")} /> ),},
        { key: "prosedur_alternatif", element: <ProsedurAlternatifTab refetchToken={tokenOf("prosedur_alternatif")} /> },
        { key: "rekonsiliasi_utang", element: <TabPlaceholder label="Rekonsiliasi Utang" /> },
        { key: "jurnal_koreksi", element: <JurnalKoreksiTab auditId={auditId} /> },
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
                                Utang Usaha
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

                        <UtangUsahaTabs
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
