"use client";

import {
  FileText,
  UserRound,
  CirclePlus,
} from "lucide-react";

export default function IdentifikasiPengguna({ data = {}, onEdit, }) {
  // API bisa mengembalikan data: null
  const identifikasi = data ?? {};

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
                Lengkapi dan tinjau informasi klien serta dokumen pendukung
                audit.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 items-center gap-2 rounded-lg bg-[#38BDF8] px-4 font-poppins text-xs font-semibold text-white hover:bg-[#29ACEB]"
          >
            <CirclePlus size={16} />
            Lengkapi Data
          </button>
        </div>

        {/* Detail */}
        <div className="mt-5 space-y-3">
          <DetailRow
            label="No Surat Pengesahan"
            value={identifikasi.noSuratPengesahan}
            alignWithContact
          />

          <DetailRow
            label="Tahun Pendirian"
            value={identifikasi.tahunPendirian}
            alignWithContact
          />

          <DetailRow
            label="Tipe Perikatan"
            value={identifikasi.tipePerikatan}
            alignWithContact
          />

          <DetailRow
            label="Jenis Perikatan"
            value={identifikasi.jenisPerikatan}
            alignWithContact
          />

          <DetailRow
            label="Standar Akuntansi Klien"
            value={identifikasi.standarAkuntansi}
            alignWithContact
          />

          <DetailRow
            label="Nama KAP Tahun Lalu (Diaudit/tidak)"
            value={identifikasi.namaKAP}
            alignWithContact
          />

          <DetailRow
            label="Opini Audit Tahun Lalu"
            value={identifikasi.opiniAudit}
            alignWithContact
          />

          <DetailRow
            label="Laporan SPT"
            value={identifikasi.laporanSPT}
            alignWithContact
          />

          <DetailRow
            label="Laporan Keuangan (Ada CALK/Tidak)"
            value={identifikasi.laporanKeuangan}
            alignWithContact
          />

          <DetailRow
            label="Sumber Dana"
            value={identifikasi.sumberDana}
            alignWithContact
          />

          <DetailRow
            label="Tujuan Transaksi"
            value={identifikasi.tujuanTransaksi}
            alignWithContact
          />

          <DetailRow
            label="Total Aset"
            value={identifikasi.totalAset}
            alignWithContact
          />

          <DetailRow
            label="Total Pendapatan"
            value={identifikasi.totalPendapatan}
            alignWithContact
          />

          <DetailRow
            label="Total Laba/Rugi Thn Berjalan"
            value={identifikasi.totalLabaRugi}
            alignWithContact
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
              value={identifikasi.kontak?.nama}
            />

            <DetailRow
              label="Jabatan"
              value={identifikasi.kontak?.jabatan}
            />

            <DetailRow
              label="No Telp"
              value={identifikasi.kontak?.noTelp}
            />

            <DetailRow
              label="Email"
              value={identifikasi.kontak?.email}
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
            value={identifikasi.dokumen?.aktaPendirian}
          />

          <FileRow
            label="File NPWP"
            value={identifikasi.dokumen?.npwp}
          />

          <FileRow
            label="File Struktur Organisasi"
            value={identifikasi.dokumen?.strukturOrganisasi}
          />
        </div>
      </section>
    </div>
  );
}

/* =====================================
   DETAIL ROW
===================================== */

function DetailRow({
  label,
  value,
  alignWithContact = false,
}) {
  return (
    <div
      className={`grid ${
        alignWithContact
          ? "grid-cols-[450px_minmax(0,1fr)]"
          : "grid-cols-[430px_minmax(0,1fr)]"
      } items-start gap-2`}
    >
      <span className="font-poppins text-sm text-[#596275]">
        {label}
      </span>

      <span className="font-poppins text-sm font-medium text-[#26364D]">
        : {value ?? "-"}
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