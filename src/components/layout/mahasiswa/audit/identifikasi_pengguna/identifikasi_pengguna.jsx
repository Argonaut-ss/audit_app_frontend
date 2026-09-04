"use client";

import {
  FileText,
  UserRound,
  CirclePlus,
} from "lucide-react";

export default function IdentifikasiPengguna({
  data,
  onEdit,
}) {
  // console.log("DATA IDENTIFIKASI:", data);

  const detail = data?.detail_identifikasi ?? {};
  console.log("DATA LENGKAP:", data);

  return (
    <div className="rounded-b-xl bg-white p-5">
      {/* ================================
          JUDUL IDENTIFIKASI PENGGUNA
      ================================= */}

      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F7FE]">
          <UserRound
            size={20}
            strokeWidth={1.8}
            className="text-[#38BDF8]"
          />
        </div>

        <div>
          <h2 className="font-poppins text-lg font-semibold text-[#1F2937]">
            Identifikasi Pengguna
          </h2>

          <p className="font-poppins text-sm text-[#7B8794]">
            Lengkapi dan tinjau informasi identifikasi pengguna jasa.
          </p>
        </div>
      </div>

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
            value={detail.noSuratPengesahan}
          />

          <DetailRow
            label="Tahun Pendirian"
            value={detail.tahunPendirian}
          />

          <DetailRow
            label="Tipe Perikatan"
            value={detail.tipePerikatan}
          />

          <DetailRow
            label="Jenis Perikatan"
            value={detail.jenisPerikatan}
          />

          <DetailRow
            label="Standar Akuntansi Klien"
            value={detail.standarAkuntansi}
          />

          <DetailRow
            label="Nama KAP Tahun Lalu (Diaudit/Tidak)"
            value={detail.namaKAP}
          />

          <DetailRow
            label="Opini Audit Tahun Lalu"
            value={detail.opiniAudit}
          />

          <DetailRow
            label="Laporan SPT"
            value={detail.laporanSPT}
          />

          <DetailRow
            label="Laporan Keuangan (Ada CALK/Tidak)"
            value={detail.laporanKeuangan}
          />

          <DetailRow
            label="Sumber Dana"
            value={detail.sumberDana}
          />

          <DetailRow
            label="Tujuan Transaksi"
            value={detail.tujuanTransaksi}
          />

          <DetailRow
            label="Total Aset"
            value={detail.totalAset}
          />

          <DetailRow
            label="Total Pendapatan"
            value={detail.totalPendapatan}
          />

          <DetailRow
            label="Total Laba/Rugi Thn Berjalan"
            value={detail.totalLabaRugi}
          />
        </div>

        {/* ================================
            KONTAK KLIEN
        ================================= */}

        <div className="mt-5">
          <h4 className="font-poppins text-sm font-semibold text-[#26364D]">
            Kontak Klien
          </h4>

          <div className="mt-3 space-y-3">
            <DetailRow
              label="Nama"
              value={detail.kontak?.nama}
            />

            <DetailRow
              label="Jabatan"
              value={detail.kontak?.jabatan}
            />

            <DetailRow
              label="No Telp"
              value={detail.kontak?.noTelp}
            />

            <DetailRow
              label="Email"
              value={detail.kontak?.email}
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
            hasFile={detail.dokumen?.aktaPendirian}
          />

          <FileRow
            label="File NPWP"
            hasFile={detail.dokumen?.npwp}
          />

          <FileRow
            label="File Struktur Organisasi"
            hasFile={detail.dokumen?.strukturOrganisasi}
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
  labelWidth = "320px",
}) {
  return (
    <div
      className="grid items-start gap-2"
      style={{
        gridTemplateColumns: `${labelWidth} minmax(0, 1fr)`,
      }}
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

function FileRow({
  label,
  hasFile,
}) {
  return (
    <div className="grid grid-cols-[230px_minmax(0,1fr)_32px] items-center gap-2">
      <span className="font-poppins text-sm text-[#596275]">
        {label}
      </span>

      <div className="flex h-8 overflow-hidden rounded-md border border-[#D5DFEA]">
        <div className="flex min-w-0 flex-1 items-center px-3 font-poppins text-xs text-[#718096]">
          <span className="truncate">
            {hasFile
              ? "File tersedia"
              : "Belum ada file"}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={!hasFile}
        className={`flex h-8 w-8 items-center justify-center rounded-md border border-[#D5DFEA] ${hasFile
            ? "text-[#0EA5E9] hover:bg-[#F0F9FF]"
            : "cursor-not-allowed text-[#CBD5E1]"
          }`}
      >
        <FileText
          size={16}
          strokeWidth={1.8}
        />
      </button>
    </div>
  );
}