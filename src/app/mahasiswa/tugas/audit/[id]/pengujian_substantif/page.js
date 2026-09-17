"use client";

import { useEffect, useState } from "react";

import { BookOpen, Search } from "lucide-react";

import { useRouter, useParams } from "next/navigation";

import KategoriCard from "@/components/layout/mahasiswa/audit/pengujian_substantif/kategori_card";
import { getPiutang } from "@/services/mahasiswa/tugas/audit/piutang/piutang";

import {
  kategoriPengujian,
} from "./data/kategori_pengujian";

export default function PengujianSubstantifPage() {

  const router = useRouter();
  const params = useParams();
  const auditId = params.id;
  const [piutangStatus, setPiutangStatus] = useState(null);
  const [isPiutangLoading, setIsPiutangLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!auditId) {
      setIsPiutangLoading(false);
      return undefined;
    }

    let isMounted = true;

    getPiutang(auditId)
      .then((data) => {
        if (isMounted) setPiutangStatus(data);
      })
      .catch(() => {
        if (isMounted) setPiutangStatus(null);
      })
      .finally(() => {
        if (isMounted) setIsPiutangLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [auditId]);

  const kategoriDenganStatusPiutang = kategoriPengujian.map((kategori) => {
    if (kategori.path !== "piutang") return kategori;

    if (isPiutangLoading) {
      return {
        ...kategori,
        status: "Memuat...",
        statusType: "warning",
      };
    }

    const tahapan = kategori.tahapan.map((tahap) => ({
      ...tahap,
      completed: Boolean(piutangStatus?.[tahap.checkKey]),
    }));
    const completedCount = tahapan.filter((tahap) => tahap.completed).length;
    const isComplete = completedCount === tahapan.length;
    const hasProgress = completedCount > 0;

    return {
      ...kategori,
      tahapan,
      status: isComplete ? "Selesai" : hasProgress ? "Belum selesai" : "Belum diisi",
      statusType: isComplete ? "success" : hasProgress ? "warning" : "danger",
    };
  });

  // Filter berdasarkan nama kategori ATAU nama tahapan pengujian.
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const kategoriTampil = normalizedQuery
    ? kategoriDenganStatusPiutang.filter((kategori) => {
        const cocokJudul = kategori.title
          ?.toLowerCase()
          .includes(normalizedQuery);
        const cocokTahapan = kategori.tahapan?.some((tahap) =>
          tahap.title?.toLowerCase().includes(normalizedQuery)
        );
        return cocokJudul || cocokTahapan;
      })
    : kategoriDenganStatusPiutang;

  const handleKategoriClick = (kategori) => {
    router.push(
      `/mahasiswa/tugas/audit/${auditId}/pengujian_substantif/${kategori.path}`
    );
  };

  return (

    <main className="w-full pr-6 pt-4">
      <div className="mx-auto max-w-[1300px]">

        {/* CONTAINER UTAMA */}
        <section className="min-h-[850px] overflow-hidden rounded-xl bg-white shadow-sm">

          {/* HEADER BIRU */}
          <div className="flex items-center gap-4 bg-[#51B7FF] px-8 py-6">

            {/* ICON */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <BookOpen
                size={20}
                className="text-white"
              />
            </div>

            {/* TEXT */}
            <div>
              <h1 className="font-poppins text-xl font-semibold text-white">
                Pengujian Substantif
              </h1>

              <p className="mt-1 font-poppins text-sm text-white/80">
                Pilih kategori untuk melihat tahapan dan detail kelengkapan
                pengujian audit.
              </p>
            </div>

          </div>

          {/* CONTENT PUTIH */}
          <div className="min-h-[700px] bg-white p-6">
            {/* SEARCH */}
            <section className="rounded-xl border border-[#DCE5EF] bg-[#F8FAFC] p-4">

              <div className="flex items-center justify-between gap-6">

                {/* SEARCH INFO */}
                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F7FE]">
                    <Search
                      size={22}
                      className="text-[#2494C7]"
                    />
                  </div>

                  <div>
                    <h2 className="font-poppins text-base font-semibold text-[#26364D]">
                      Cari kategori pengujian
                    </h2>

                    <p className="font-poppins text-xs text-[#7B8794]">
                      Temukan akun atau tahapan pengujian dengan cepat.
                    </p>
                  </div>

                </div>

                {/* INPUT SEARCH */}
                <div className="relative w-[350px]">

                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Cari nama tahapan pengujian"
                    className="
                          h-11
                          w-full
                          rounded-lg
                          border
                          border-[#DCE5EF]
                          bg-white
                          pl-11
                          pr-4
                          font-poppins
                          text-xs
                          text-[#26364D]
                          outline-none
                          transition
                          placeholder:text-[#94A3B8]
                          focus:border-[#2494C7]
                        "
                  />

                </div>

              </div>

            </section>

            {/* Card akan dimasukkan di sini */}

            {kategoriTampil.length > 0 ? (
              <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                {kategoriTampil.map((kategori) => (
                  <KategoriCard
                    key={kategori.id}
                    kategori={kategori}
                    onClick={() => handleKategoriClick(kategori)}
                  />
                ))}

              </section>
            ) : (
              <div className="mt-5 px-4 py-10 text-center font-poppins text-xs text-[#94A3B8]">
                Tidak ada kategori atau tahapan yang cocok dengan &quot;{searchQuery}&quot;.
              </div>
            )}

          </div>

        </section>

      </div>
    </main>
  );
}
