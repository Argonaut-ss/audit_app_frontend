"use client";

import {
  FileText,
  UserRound,
  CircleCheck,
} from "lucide-react";

export default function IdentifikasiPengguna({ data = {} }) {
  return (
    <div className="rounded-b-xl bg-white p-5">
      {/* ================================
          DETAIL IDENTIFIKASI
      ================================= */}
      <section className="rounded-xl border border-[#DCE5EF] bg-white p-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F7FE]">
              <UserRound
                size={18}
                strokeWidth={1.8}
                className="text-[#38BDF8]"
              />
            </div>

            <div>
              <h3 className="font-poppins text-base font-semibold text-[#1F2937]">
                Detail Identifikasi
              </h3>

              <p className="font-poppins text-xs text-[#7B8794]">
                Data perikatan, keuangan, dan kontak klien.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg bg-[#38BDF8] px-4 font-poppins text-xs font-semibold text-white hover:bg-[#29ACEB]"
          >
            <CircleCheck size={16} />
            Lengkapi Data
          </button>
        </div>

        {/* Detail */}
        <div className="mt-5 space-y-3">
          <DetailRow
            label="No Surat Pengesahan"
            value={data.noSuratPengesahan ?? "1212345699"}
          />

          <DetailRow
            label="Tahun Pendirian"
            value={data.tahunPendirian ?? "2018"}
          />

          <DetailRow
            label="Tipe Perikatan"
            value={data.tipePerikatan ?? "Asurans"}
          />

          <DetailRow
            label="Jenis Perikatan"
            value={data.jenisPerikatan ?? "Audit Laporan Keuangan"}
          />

          <DetailRow
            label="Standar Akuntansi Klien"
            value={data.standarAkuntansi ?? "SAK ETAP"}
          />

          <DetailRow
            label="Nama KAP Tahun Lalu (Diaudit/tidak)"
            value={
              data.namaKAP ??
              "KAP Anggara, Budi, dan Cindai (KAP ABC)"
            }
          />

          <DetailRow
            label="Opini Audit Tahun Lalu"
            value={data.opiniAudit ?? "WTP"}
          />

          <DetailRow
            label="Laporan SPT"
            value={data.laporanSPT ?? "Ada"}
          />

          <DetailRow
            label="Laporan Keuangan (Ada CALK/Tidak)"
            value={data.laporanKeuangan ?? "Ada"}
          />

          <DetailRow
            label="Sumber Dana"
            value={data.sumberDana ?? "Modal dasar dan Hasil Usaha"}
          />

          <DetailRow
            label="Tujuan Transaksi"
            value={data.tujuanTransaksi ?? "Keuntungan/Laba"}
          />

          <DetailRow
            label="Total Aset"
            value={data.totalAset ?? "Rp 44,535,761,030"}
          />

          <DetailRow
            label="Total Pendapatan"
            value={data.totalPendapatan ?? "Rp 62,558,966,780"}
          />

          <DetailRow
            label="Total Laba/Rugi Thn Berjalan"
            value={data.totalLabaRugi ?? "Rp 6,053,022,544"}
          />
        </div>

        {/* Kontak Klien */}
        <div className="mt-5">
          <h4 className="font-poppins text-sm font-semibold text-[#26364D]">
            Kontak Klien
          </h4>

          <div className="mt-3 ml-5 space-y-3">
            <DetailRow
              label="Nama"
              value={data.kontak?.nama ?? "Sony Warsono"}
            />

            <DetailRow
              label="Jabatan"
              value={data.kontak?.jabatan ?? "Direktur Utama"}
            />

            <DetailRow
              label="No Telp"
              value={data.kontak?.noTelp ?? "0812-7810-7689"}
            />

            <DetailRow
              label="Email"
              value={
                data.kontak?.email ??
                "Sonywarsono2026@gmail.com"
              }
            />
          </div>
        </div>
      </section>

      {/* ================================
          DOKUMEN PENDUKUNG
      ================================= */}
      <section className="mt-5 rounded-xl border border-[#DCE5EF] bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F7FE]">
            <FileText
              size={18}
              strokeWidth={1.8}
              className="text-[#38BDF8]"
            />
          </div>

          <div>
            <h3 className="font-poppins text-base font-semibold text-[#1F2937]">
              Dokumen Pendukung
            </h3>

            <p className="font-poppins text-xs text-[#7B8794]">
              Dokumen legal dan struktur organisasi klien.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <FileRow
            label="File Akta Pendirian"
            value={data.dokumen?.aktaPendirian}
          />

          <FileRow
            label="File NPWP"
            value={data.dokumen?.npwp}
          />

          <FileRow
            label="File Struktur Organisasi"
            value={data.dokumen?.strukturOrganisasi}
          />
        </div>
      </section>
    </div>
  );
}

/* =====================================
   DETAIL ROW
===================================== */

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-[260px_minmax(0,1fr)] items-start gap-2">
      <span className="font-poppins text-sm text-[#596275]">
        {label}
      </span>

      <span className="font-poppins text-sm font-medium text-[#26364D]">
        : {value}
      </span>
    </div>
  );
}

/* =====================================
   FILE ROW
===================================== */

function FileRow({ label, value }) {
  return (
    <div className="grid grid-cols-[230px_minmax(0,1fr)_32px] items-center gap-2">
      <span className="font-poppins text-sm text-[#596275]">
        {label}
      </span>

      <div className="flex h-8 overflow-hidden rounded-md border border-[#D5DFEA]">
        <button
          type="button"
          className="shrink-0 border-r border-[#D5DFEA] bg-[#F8FAFC] px-4 font-poppins text-xs text-[#596275]"
        >
          Choose File
        </button>

        <div className="flex min-w-0 flex-1 items-center px-3 font-poppins text-xs text-[#718096]">
          <span className="truncate">
            {value || "Belum ada file"}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D5DFEA] text-[#0EA5E9] hover:bg-[#F0F9FF]"
      >
        <FileText size={16} strokeWidth={1.8} />
      </button>
    </div>
  );
}