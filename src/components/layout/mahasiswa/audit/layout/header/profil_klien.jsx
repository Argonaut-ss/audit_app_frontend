"use client";

import { Building2 } from "lucide-react";

export default function ProfilKlien() {
  return (
    <section className="mt-4 w-full rounded-xl border border-[#DCE5EF] bg-white px-6 py-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F7FE]">
          <Building2
            size={20}
            strokeWidth={1.8}
            className="text-[#38BDF8]"
          />
        </div>

        <div>
          <h2 className="font-poppins text-lg font-semibold text-[#1F2937]">
            Profil Klien
          </h2>

          <p className="font-poppins text-sm text-[#7B8794]">
            Informasi utama perusahaan yang diaudit.
          </p>
        </div>
      </div>

      {/* Client Information */}
      <div className="mt-4 grid grid-cols-2 gap-x-20">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="grid grid-cols-[105px_1fr] items-center">
            <span className="font-poppins text-sm text-[#596275]">
              Nama Klien
            </span>

            <span className="font-poppins text-sm font-semibold text-[#26364D]">
              : PT Harmoni Sejahtera E
            </span>
          </div>

          <div className="grid grid-cols-[105px_1fr] items-center">
            <span className="font-poppins text-sm text-[#596275]">
              No Telp
            </span>

            <span className="font-poppins text-sm font-semibold text-[#26364D]">
              : 82286877774
            </span>
          </div>

          <div className="grid grid-cols-[105px_1fr] items-center">
            <span className="font-poppins text-sm text-[#596275]">
              Alamat Klien
            </span>

            <span className="font-poppins text-sm font-semibold text-[#26364D]">
              : Jalan Ringroad Utara 212, Sleman Yogyakarta
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div className="grid grid-cols-[150px_1fr] items-center">
            <span className="font-poppins text-sm text-[#596275]">
              NPWP
            </span>
            <span className="font-poppins text-sm font-semibold text-[#26364D]">
              : 603451236321000
            </span>
          </div>

          <div className="grid grid-cols-[150px_1fr] items-center">
            <span className="font-poppins text-sm text-[#596275]">
              Sektor Usaha
            </span>
            <span className="font-poppins text-sm font-semibold text-[#26364D]">
              : Manufaktur
            </span>
          </div>

          <div className="grid grid-cols-[150px_1fr] items-center">
            <span className="whitespace-nowrap font-poppins text-sm text-[#596275]">
              Tahun Buku di audit
            </span>
            <span className="font-poppins text-sm font-semibold text-[#26364D]">
              : 2022
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-[#E5EAF0]" />

      {/* Audit Period */}
      <div className="grid grid-cols-3 text-center">
        <div>
          <p className="font-poppins text-sm font-semibold text-[#0EA5E9]">
            WAKTU PERIODE
          </p>

          <p className="mt-1 font-poppins text-sm text-[#26364D]">
            31 Desember 2022
          </p>
        </div>

        <div>
          <p className="font-poppins text-sm font-semibold text-[#0EA5E9]">
            WAKTU MULAI PEKERJAAN
          </p>

          <p className="mt-1 font-poppins text-sm text-[#26364D]">
            03 Februari 2026
          </p>
        </div>

        <div>
          <p className="font-poppins text-sm font-semibold text-[#0EA5E9]">
            BATAS WAKTU PENGUMPULAN
          </p>

          <p className="mt-1 font-poppins text-sm text-[#26364D]">
            31 Agustus 2026
          </p>
        </div>
      </div>
    </section>
  );
}