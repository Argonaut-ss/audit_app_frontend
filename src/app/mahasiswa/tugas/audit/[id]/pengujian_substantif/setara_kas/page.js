"use client";

import { ArrowLeft } from "lucide-react";

import {
    useParams,
    useRouter,
} from "next/navigation";

import SetaraKasTabs from "@/components/layout/mahasiswa/audit/pengujian_substantif/setara_kas/setara_kas_tab/setara_kas_tab";

import KeepAliveTabPanels from "@/components/ui/keep_alive_tabs/keep_alive_tab_panels";

import useTabManager from "@/hooks/use_tab_manager";

import ProsedurTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/setara_kas/tab/prosedur/prosedur";

import DokumenTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/setara_kas/tab/dokumen/dokumen";

import RekeningKoranTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/setara_kas/tab/rekening_koran/rekening_koran"

import CekSaldoTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/setara_kas/tab/cek_saldo/cek_saldo"

import RekonsiliasiBankTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/setara_kas/tab/rekonsiliasi_bank/rekonsiliasi_bank";

// import KonfirmasiBankTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/setara_kas/tab/konfirmasi_bank/konfirmasi_bank"

// import RekapBalasanKonfirmasiTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/setara_kas/tab/rekap_balasan_konfirmasi/rekap_balasan_konfirmasi"

import JurnalKoreksiTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/setara_kas/tab/jurnal_koreksi/jurnal_koreksi";

// Daftar tab Kas
const TAB_KEYS = [
    "prosedur",
    "dokumen",
    "rekening_koran",
    "cek_saldo",
    "rekonsiliasi_bank",
    "konfirmasi_bank",
    "rekap_balasan_konfirmasi",
    "jurnal_koreksi",
];

// Peta ketergantungan antar-tab: saat data di tab sumber disimpan,
// tab dependen yang membaca data tersebut perlu refetch.
// - Cash Count & Rekap Mutasi Kas menurunkan data ke Uji Mutasi Kas.
const DEP_GRAPH = {
};

function TabPlaceholder({ name }) {
    return (
        <div className="rounded-xl border border-[#DCE5EF] bg-white p-5">
            <p className="font-poppins text-sm text-[#64748B]">
                {name}
            </p>
        </div>
    );
}


export default function SetaraKasPage() {

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
        depGraph: DEP_GRAPH,
        defaultTab: "prosedur",
    });


    const tabPanels = [

        {
            key: "prosedur",
            element: (
                <ProsedurTab auditId={auditId} />
            ),
        },

        {
            key: "dokumen",
            element: (
                <DokumenTab auditId={auditId} />
            ),
        },

        {
            key: "rekening_koran",
            element: (
                <RekeningKoranTab auditId={auditId}/>
            ),
        },

        {
            key: "cek_saldo",
            element: (
                <CekSaldoTab auditId={auditId} />
            ),
        },

        {
            key: "rekonsiliasi_bank",
            element: (
                <RekonsiliasiBankTab auditId={auditId} />
            ),
        },

        {
            key: "konfirmasi_bank",
            element: (
                <TabPlaceholder name={"konfirmasi bank"} />
            ),
        },

        {
            key: "rekap_balasan_konfirmasi",
            element: (
                <TabPlaceholder name={"rekap balasan konfirmasi"} />
            ),
        },

        {
            key: "jurnal_koreksi",
            element: (
                <JurnalKoreksiTab auditId={auditId} />
            ),
        },

    ];


    return (
        <main className="min-h-screen w-full overflow-y-auto pr-6 pt-4 [scrollbar-gutter:stable]">

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
                                Setara Kas
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

                        <SetaraKasTabs
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