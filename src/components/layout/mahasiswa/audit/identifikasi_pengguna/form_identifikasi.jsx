"use client";

import { useEffect, useState } from "react";
import {
  UserRound,
  CalendarDays,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin,
  BriefcaseBusiness,
  Banknote,
  CircleDollarSign,
} from "lucide-react";

export default function FormIdentifikasi({ data = null, onCancel }) {
  const [form, setForm] = useState({
    namaKlien: "",
    npwp: "",
    alamat: "",
    sektorUsaha: "",
    noTelp: "",
    tahunBuku: "",
    tahunPendirian: "",
    opiniAudit: "",
    noSuratPengesahan: "",
    laporanSPT: "",
    noSuratKeputusan: "",
    laporanKeuangan: "",
    tipePerikatan: "",
    sumberDana: "",
    jenisPerikatan: "",
    tujuanTransaksi: "",
    standarAkuntansi: "",
    namaKAP: "",
    totalAset: "",
    totalPendapatan: "",
    totalLabaRugi: "",

    kontakNama: "",
    kontakJabatan: "",
    kontakNoTelp: "",
    kontakEmail: "",

    fileAkta: "",
    fileNPWP: "",
    fileStrukturOrganisasi: "",
  });

  useEffect(() => {
    if (!data) return;

    setForm({
      namaKlien: data.namaKlien ?? "",
      npwp: data.npwp ?? "",
      alamat: data.alamat ?? "",
      sektorUsaha: data.sektorUsaha ?? "",
      noTelp: data.noTelp ?? "",
      tahunBuku: data.tahunBuku ?? "",
      tahunPendirian: data.tahunPendirian ?? "",
      opiniAudit: data.opiniAudit ?? "",
      noSuratPengesahan: data.noSuratPengesahan ?? "",
      laporanSPT: data.laporanSPT ?? "",
      noSuratKeputusan: data.noSuratKeputusan ?? "",
      laporanKeuangan: data.laporanKeuangan ?? "",
      tipePerikatan: data.tipePerikatan ?? "",
      sumberDana: data.sumberDana ?? "",
      jenisPerikatan: data.jenisPerikatan ?? "",
      tujuanTransaksi: data.tujuanTransaksi ?? "",
      standarAkuntansi: data.standarAkuntansi ?? "",
      namaKAP: data.namaKAP ?? "",
      totalAset: data.totalAset ?? "",
      totalPendapatan: data.totalPendapatan ?? "",
      totalLabaRugi: data.totalLabaRugi ?? "",

      kontakNama: data.kontak?.nama ?? "",
      kontakJabatan: data.kontak?.jabatan ?? "",
      kontakNoTelp: data.kontak?.noTelp ?? "",
      kontakEmail: data.kontak?.email ?? "",

      fileAkta: data.dokumen?.aktaPendirian ?? "",
      fileNPWP: data.dokumen?.npwp ?? "",
      fileStrukturOrganisasi: data.dokumen?.strukturOrganisasi ?? "",
    });
  }, [data]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log("Data form identifikasi:", form);

    // API POST/PUT akan kita pasang di sini
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-b-xl bg-white p-5"
    >
      {/* HEADER */}
      <section className="rounded-xl border border-[#DCE5EF] bg-white p-5">
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
                Update Audit Pengguna
              </h3>

              <p className="font-poppins text-xs text-[#7B8794]">
                Lengkapi dan tinjau informasi klien serta dokumen pendukung audit.
              </p>
            </div>
          </div>
        </div>

        {/* DATA IDENTIFIKASI */}
        <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
          <InputField
            label="Nama Klien"
            name="namaKlien"
            value={form.namaKlien}
            onChange={handleChange}
            icon={<UserRound size={15} />}
          />

          <InputField
            label="Nomor Pokok Wajib Pajak (NPWP)"
            name="npwp"
            value={form.npwp}
            onChange={handleChange}
            icon={<FileText size={15} />}
          />

          <InputField
            label="Alamat"
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            icon={<MapPin size={15} />}
          />

          <InputField
            label="Sektor Usaha Klien"
            name="sektorUsaha"
            value={form.sektorUsaha}
            onChange={handleChange}
            icon={<Building2 size={15} />}
          />

          <InputField
            label="No Telp"
            name="noTelp"
            value={form.noTelp}
            onChange={handleChange}
            icon={<Phone size={15} />}
          />

          <InputField
            label="Tahun buku yang akan diaudit"
            name="tahunBuku"
            value={form.tahunBuku}
            onChange={handleChange}
            icon={<CalendarDays size={15} />}
          />

          <InputField
            label="Tahun Pendirian"
            name="tahunPendirian"
            value={form.tahunPendirian}
            onChange={handleChange}
            icon={<CalendarDays size={15} />}
          />

          <InputField
            label="Opini Audit"
            name="opiniAudit"
            value={form.opiniAudit}
            onChange={handleChange}
            icon={<FileText size={15} />}
          />

          <InputField
            label="Nomor Surat Pengesahan"
            name="noSuratPengesahan"
            value={form.noSuratPengesahan}
            onChange={handleChange}
            icon={<Mail size={15} />}
          />

          <InputField
            label="Laporan SPT"
            name="laporanSPT"
            value={form.laporanSPT}
            onChange={handleChange}
            icon={<FileText size={15} />}
          />

          <InputField
            label="Nomor Surat Keputusan"
            name="noSuratKeputusan"
            value={form.noSuratKeputusan}
            onChange={handleChange}
            icon={<FileText size={15} />}
          />

          <InputField
            label="Laporan Keuangan (ada CALK / tidak)"
            name="laporanKeuangan"
            value={form.laporanKeuangan}
            onChange={handleChange}
            icon={<CircleDollarSign size={15} />}
          />

          <InputField
            label="Tipe Perikatan"
            name="tipePerikatan"
            value={form.tipePerikatan}
            onChange={handleChange}
            icon={<BriefcaseBusiness size={15} />}
          />

          <InputField
            label="Sumber Dana"
            name="sumberDana"
            value={form.sumberDana}
            onChange={handleChange}
            icon={<Banknote size={15} />}
          />

          <InputField
            label="Jenis Perikatan"
            name="jenisPerikatan"
            value={form.jenisPerikatan}
            onChange={handleChange}
            icon={<BriefcaseBusiness size={15} />}
          />

          <InputField
            label="Tujuan Transaksi"
            name="tujuanTransaksi"
            value={form.tujuanTransaksi}
            onChange={handleChange}
            icon={<Banknote size={15} />}
          />

          <InputField
            label="Standar Akuntansi Klien"
            name="standarAkuntansi"
            value={form.standarAkuntansi}
            onChange={handleChange}
            icon={<FileText size={15} />}
          />

          <InputField
            label="Total Aset"
            name="totalAset"
            value={form.totalAset}
            onChange={handleChange}
            icon={<CircleDollarSign size={15} />}
          />

          <InputField
            label="Nama KAP Tahun Lalu (Diaudit/tidak)"
            name="namaKAP"
            value={form.namaKAP}
            onChange={handleChange}
            icon={<BriefcaseBusiness size={15} />}
          />

          <InputField
            label="Total Pendapatan"
            name="totalPendapatan"
            value={form.totalPendapatan}
            onChange={handleChange}
            icon={<CircleDollarSign size={15} />}
          />

          <div className="md:col-start-2">
            <InputField
              label="Total Laba Rugi"
              name="totalLabaRugi"
              value={form.totalLabaRugi}
              onChange={handleChange}
              icon={<CircleDollarSign size={15} />}
            />
          </div>
        </div>

        {/* KONTAK KLIEN */}
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <UserRound
              size={18}
              className="text-[#38BDF8]"
            />

            <h4 className="font-poppins text-sm font-semibold text-[#26364D]">
              Kontak Klien
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <InputField
              label="Nama Klien"
              name="kontakNama"
              value={form.kontakNama}
              onChange={handleChange}
              icon={<UserRound size={15} />}
            />

            <InputField
              label="Nomor Telepon"
              name="kontakNoTelp"
              value={form.kontakNoTelp}
              onChange={handleChange}
              icon={<Phone size={15} />}
            />

            <InputField
              label="Jabatan"
              name="kontakJabatan"
              value={form.kontakJabatan}
              onChange={handleChange}
              icon={<BriefcaseBusiness size={15} />}
            />

            <InputField
              label="Email"
              name="kontakEmail"
              value={form.kontakEmail}
              onChange={handleChange}
              icon={<Mail size={15} />}
            />
          </div>
        </div>

        {/* DOKUMEN */}
        <div className="mt-8 space-y-4">
          <FileInput
            label="File Akta"
            value={form.fileAkta}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                fileAkta: value,
              }))
            }
          />

          <FileInput
            label="File NPWP"
            value={form.fileNPWP}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                fileNPWP: value,
              }))
            }
          />

          <FileInput
            label="File Struktur Organisasi"
            value={form.fileStrukturOrganisasi}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                fileStrukturOrganisasi: value,
              }))
            }
          />
        </div>

        {/* BUTTON */}
        <div className="mt-8 flex justify-end gap-3 border-t border-[#E5EAF0] pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 items-center gap-2 rounded-lg bg-[#EF4444] px-5 font-poppins text-xs font-semibold text-white hover:bg-[#DC2626]"
          >
            Keluar
          </button>

          <button
            type="submit"
            className="flex h-9 items-center gap-2 rounded-lg bg-[#16A34A] px-5 font-poppins text-xs font-semibold text-white hover:bg-[#15803D]"
          >
            Simpan
          </button>
        </div>
      </section>
    </form>
  );
}


/* =====================================
   INPUT FIELD
===================================== */

function InputField({
  label,
  name,
  value,
  onChange,
  icon,
}) {
  return (
    <div>
      <label className="mb-1.5 block font-poppins text-[11px] font-semibold text-[#26364D]">
        {label}
      </label>

      <div className="flex h-9 overflow-hidden rounded-md border border-[#DCE5EF] bg-white">
        <div className="flex w-8 shrink-0 items-center justify-center border-r border-[#DCE5EF] text-[#718096]">
          {icon}
        </div>

        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="min-w-0 flex-1 px-3 font-poppins text-xs text-[#596275] outline-none placeholder:text-[#9AA5B1]"
        />
      </div>
    </div>
  );
}


/* =====================================
   FILE INPUT
===================================== */

function FileInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-1.5 block font-poppins text-[11px] font-semibold text-[#26364D]">
        {label}
      </label>

      <div className="flex h-9 overflow-hidden rounded-md border border-[#DCE5EF]">
        <label className="flex cursor-pointer items-center border-r border-[#DCE5EF] bg-[#F8FAFC] px-4 font-poppins text-xs text-[#596275] hover:bg-[#F1F5F9]">
          Choose File

          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                onChange(file.name);
              }
            }}
          />
        </label>

        <div className="flex min-w-0 flex-1 items-center px-3">
          <span className="truncate font-poppins text-xs text-[#718096]">
            {value || "Belum ada file"}
          </span>
        </div>
      </div>
    </div>
  );
}