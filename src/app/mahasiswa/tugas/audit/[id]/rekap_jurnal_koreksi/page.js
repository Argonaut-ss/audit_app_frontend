"use client";

import RekapJurnalKoreksi from "@/components/layout/mahasiswa/audit/rekap_jurnal_koreksi/rekap_jurnal_koreksi";

export default function RekapJurnalKoreksiPage() {
    return (
        <main className="w-full pr-6 pt-4">
            <section className="mx-auto min-h-[calc(100vh-98px)] max-w-[1300px] overflow-hidden rounded-xl bg-white shadow-sm">
                <header className="flex items-center gap-4 bg-[#51B7FF] px-8 py-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                        <div className="h-4 w-4 rounded-sm border-2 border-white">
                            <div className="mx-auto mt-1 h-0.5 w-2 bg-white" />
                        </div>
                    </div>

                    <div>
                        <h1 className="font-poppins text-xl font-semibold text-white">
                            Rekap Jurnal Koreksi
                        </h1>
                        <p className="font-poppins text-xs text-white/80">
                            Rekapitulasi seluruh jurnal koreksi (AJE/RJE) yang diusulkan atas hasil pengujian.
                        </p>
                    </div>
                </header>

                <div id="rekap-jurnal-koreksi-content">
                    <RekapJurnalKoreksi />
                </div>
            </section>
        </main>
    );
}