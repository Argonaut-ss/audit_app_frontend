"use client";

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

import useFormIdentifikasi from
  "@/hooks/mahasiswa/tugas/audit/detail_audit/identifikasi_pengguna/use_form_identifikasi";

import KontakSection from "./form/kontak_section";
import DokumenSection from "./form/dokumen_section";
import InputField from "./form/input_field";
import SelectField from "./form/select_field";

export default function FormIdentifikasi({
  data = null,
  onCancel,
  onSuccess,
}) {

  const {
    form,
    existingFiles,

    fileAkta,
    fileNPWP,
    fileStrukturOrganisasi,

    isSubmitting,
    submitError,

    handleChange,
    handleSubmit,

    setFileAkta,
    setFileNPWP,
    setFileStrukturOrganisasi,

  } = useFormIdentifikasi({
    data,
    onSuccess,
  });


  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-b-xl bg-white p-5"
    >

      <section className="rounded-xl border border-[#DCE5EF] bg-white p-5">

        {/* HEADER */}

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F7FE]">

            <UserRound
              size={18}
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


        {/* ERROR */}

        {submitError && (

          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

            <p className="font-poppins text-xs text-red-600">
              {submitError}
            </p>

          </div>

        )}


        {/* 
          DI SINI NANTI KITA PINDAHKAN
          21 INPUT IDENTIFIKASI KE
          IdentifikasiFieldsSection
        */}

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

          <SelectField
            label="Sektor Usaha Klien"
            name="sektorUsaha"
            value={form.sektorUsaha}
            onChange={handleChange}
            icon={<Building2 size={16} />}
            options={[
              {
                value: "Dagang",
                label: "Dagang",
              },
              {
                value: "Manufaktur",
                label: "Manufaktur",
              },
              {
                value: "Jasa",
                label: "Jasa",
              },
            ]}
          />

          <InputField
            label="No Telp"
            name="noTelp"
            value={form.noTelp}
            onChange={handleChange}
            icon={<Phone size={15} />}
          />

          <InputField
            label="Tahun Buku yang Akan Diaudit"
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
            label="Laporan Keuangan (Ada CALK / Tidak)"
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
            label="Nama KAP Tahun Lalu (Diaudit/Tidak)"
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
              label="Total Laba/Rugi Tahun Berjalan"
              name="totalLabaRugi"
              value={form.totalLabaRugi}
              onChange={handleChange}
              icon={<CircleDollarSign size={15} />}
            />
          </div>

        </div>

        <KontakSection
          form={form}
          handleChange={handleChange}
        />


        <DokumenSection
          fileAkta={fileAkta}
          fileNPWP={fileNPWP}
          fileStrukturOrganisasi={
            fileStrukturOrganisasi
          }

          existingFiles={existingFiles}

          setFileAkta={setFileAkta}
          setFileNPWP={setFileNPWP}

          setFileStrukturOrganisasi={
            setFileStrukturOrganisasi
          }
        />


        {/* BUTTON */}

        <div className="mt-8 flex justify-end gap-3 border-t border-[#E5EAF0] pt-5">

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-9 rounded-lg bg-[#EF4444] px-5 font-poppins text-xs font-semibold text-white"
          >
            Keluar
          </button>


          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 rounded-lg bg-[#16A34A] px-5 font-poppins text-xs font-semibold text-white"
          >
            {isSubmitting
              ? "Menyimpan..."
              : "Simpan"}
          </button>

        </div>

      </section>

    </form>
  );
}