"use client";

import { useState } from "react";

import {
    ArrowLeft,
} from "lucide-react";

import {
    useParams,
    useRouter,
    useSearchParams,
} from "next/navigation";

import PiutangTabs from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/piutang_tab/piutang_tab";

import ProsedurTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/prosedur/prosedur";

import DokumenTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/dokumen/dokumen";

import KonfirmasiPiutangTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/konfirmasi_piutang/konfirmasi_piutang";

import RekapBalasanKonfirmasiTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/rekap_balasan_konfirmasi/rekap_balasan_konfirmasi";

import ProsedurAlternatifTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/prosedur_alternatif/prosedur_alternatif";

import RekonsiliasiPiutangTab from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/rekonsiliasi_piutang/rekonsiliasi_piutang";

import AnalisisUmurPiutang from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/analisis_umur_piutang/analisis_umur_piutang";

import JurnalKoreksi from "@/components/layout/mahasiswa/audit/pengujian_substantif/piutang/tab/jurnal_koreksi/jurnal_koreksi";


export default function PiutangPage() {

    const router = useRouter();

    const params = useParams();

    const searchParams = useSearchParams();

    const auditId = params.id;

    const tabPanels = [
        { key: "prosedur", element: <ProsedurTab auditId={auditId} /> },
        { key: "dokumen", element: <DokumenTab auditId={auditId} /> },
        { key: "konfirmasi_piutang", element: <KonfirmasiPiutangTab /> },
        { key: "rekap_balasan_konfirmasi", element: <RekapBalasanKonfirmasiTab /> },
        { key: "prosedur_alternatif", element: <ProsedurAlternatifTab /> },
        { key: "rekonsiliasi_piutang", element: <RekonsiliasiPiutangTab /> },
        { key: "analisis_umur_piutang", element: <AnalisisUmurPiutang /> },
        { key: "jurnal_koreksi", element: <JurnalKoreksi /> },
    ];

    // Tab aktif disimpan di URL (?tab=...) supaya tetap sama setelah refresh dan bisa
    // di-bookmark. Fallback ke "prosedur" jika query tidak ada atau tidak valid.
    const tabFromUrl = searchParams.get("tab");
    const initialTab = tabPanels.some((panel) => panel.key === tabFromUrl)
        ? tabFromUrl
        : "prosedur";

    const [activeTab, setActiveTab] = useState(initialTab);

    // Lazy keep-alive: tab baru dibuat (dan datanya di-load) hanya saat PERTAMA KALI dibuka.
    // Setelah itu tab tetap ter-mount (disembunyikan lewat CSS), jadi membukanya lagi tidak
    // memicu load ulang dan state tab (input, draft, scroll) tetap utuh.
    const [mountedTabs, setMountedTabs] = useState(
        () => new Set([initialTab])
    );

    const openTab = (tabKey) => {
        setActiveTab(tabKey);
        setMountedTabs((current) => {
            if (current.has(tabKey)) return current;
            const next = new Set(current);
            next.add(tabKey);
            return next;
        });

        // Sinkronkan URL tanpa reload agar tab bertahan saat refresh.
        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.set("tab", tabKey);
        router.replace(`?${nextParams.toString()}`, { scroll: false });
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
                            setActiveTab={openTab}
                        />


                        {/* TAB CONTENT */}

                        <div className="mt-5">

                            {tabPanels.map(({ key, element }) => (
                                mountedTabs.has(key) ? (
                                    <div key={key} className={activeTab === key ? "" : "hidden"}>
                                        {element}
                                    </div>
                                ) : null
                            ))}

                        </div>


                    </div>

                </section>

            </div>

        </main>
    );
}
