"use client";

import { GraduationCap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function KelasCard({ kelas }) {

  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-xl border border-[#DCE5EC] bg-white shadow-sm">
      {/* Header */}
      <div className="h-[82px] bg-[#20A9E5] px-5 py-4">
        <div className="flex items-center gap-2 translate-y-3">
          <GraduationCap
            size={18}
            strokeWidth={2}
            className="shrink-0 text-white"
          />

          <h3 className="font-poppins text-base font-semibold text-white">
            {kelas.kode} - {kelas.tipe}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="h-[86px] px-5 py-5">
        <h3 className="font-poppins text-base font-semibold text-[#293144]">
          {kelas.dosen}
        </h3>

        <p className="mt-1 font-poppins text-sm text-[#6B7589]">
          {kelas.kodeDosen}
        </p>
      </div>

      {/* Footer */}
      <div className="flex h-[64px] items-center justify-between border-t border-[#E5EAF0] px-5">
        <span className="font-poppins text-xs text-[#596275]">
          {kelas.perusahaan}
        </span>

        <button
          type="button"
          onClick={() => router.push(`/mahasiswa/kelas/${kelas.id}`)}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2FB2EF] text-white transition hover:bg-[#159FD9]"
        >
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}