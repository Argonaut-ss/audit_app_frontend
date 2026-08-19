"use client";

import { ArrowLeft, Download } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import useDetailKasus from "@/hooks/mahasiswa/kelas/use_detail_kasus";
import useDownloadKasus from "@/hooks/mahasiswa/kelas/use_download_kasus";


export default function KelasDetailPage() {
  const router = useRouter();
  const params = useParams();

  const { kasus, loading } = useDetailKasus(params.id);

  const { handleDownload } =
    useDownloadKasus();

  if (loading) {
    return (
      <div className="min-h-screen px-10 py-10">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-10 py-10">

      {/* Kembali */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-[40px] items-center gap-1 rounded-lg bg-[#F59E0B] px-4 font-poppins text-sm font-semibold text-white transition hover:bg-[#D97706]"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        Kembali
      </button>

      {/* Information Card */}
      <div className="mt-6 rounded-[24px] border border-[#DCE5EC] bg-white px-12 py-12 shadow-sm">
        <div className="grid grid-cols-3 gap-10">

          {/* Nama Perusahaan */}
          <div>
            <p className="font-poppins text-sm font-semibold uppercase tracking-wide text-[#687B93]">
              Nama Perusahaan
            </p>

            <p className="mt-5 font-poppins text-[18px] text-[#293144]">
              {kasus?.NamaClient || "Data tidak ditemukan"}
            </p>
          </div>

          {/* Deskripsi */}
          <div className="-ml-8">
            <p className="font-poppins text-sm font-semibold uppercase tracking-wide text-[#687B93]">
              Deskripsi
            </p>

            <p className="mt-3 font-poppins text-[18px] text-[#596980]">
              Download Supporting Document
            </p>
          </div>

          {/* File */}
          <div className="pl-10">
            <p className="font-poppins text-sm font-semibold uppercase tracking-wide text-[#687B93]">
              File
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="font-poppins text-[18px] text-[#39465A]">
                {kasus?.NamaFile || "Data tidak ditemukan"}
              </span>

              {kasus?.NamaFile && (
                <button
                  type="button"
                  onClick={() => handleDownload(kasus)}
                  className="text-[#9CA3AF] transition hover:text-[#20A9E5]"
                  aria-label="Download file"
                >
                  <Download size={21} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            router.push(`/mahasiswa/tugas/data_klien`)
          }
          className="h-[40px] rounded-lg bg-[#F59E0B] font-poppins text-sm font-semibold text-white transition hover:bg-[#D97706]"
        >
          Data Klien
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(`/mahasiswa/tugas/audit`)
          }
          className="h-[40px] rounded-lg bg-[#F59E0B] font-poppins text-sm font-semibold text-white transition hover:bg-[#D97706]"
        >
          Audit
        </button>
      </div>
    </div>
  );
}