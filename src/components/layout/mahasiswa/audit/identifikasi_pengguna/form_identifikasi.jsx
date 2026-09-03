"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

import {
  updateIdentifikasi,
} from "@/services/mahasiswa/tugas/audit/identifikasi_pengguna";

export default function FormIdentifikasi({
  data = null,
  onCancel,
  onSuccess,
}) {
  const params = useParams();

  // =====================================
  // FORM STATE
  // =====================================

  const [form, setForm] = useState({
    // PROFIL KLIEN
    namaKlien: "",
    npwp: "",
    alamat: "",
    sektorUsaha: "",
    noTelp: "",
    tahunBuku: "",

    // DETAIL IDENTIFIKASI
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

    // KONTAK
    kontakNama: "",
    kontakJabatan: "",
    kontakNoTelp: "",
    kontakEmail: "",
  });

  // =====================================
  // FILE STATE
  // =====================================

  const [fileAkta, setFileAkta] = useState(null);

  const [fileNPWP, setFileNPWP] = useState(null);

  const [
    fileStrukturOrganisasi,
    setFileStrukturOrganisasi,
  ] = useState(null);

  // =====================================
  // EXISTING FILE STATE
  // =====================================

  const [existingFiles, setExistingFiles] = useState({
    akta: false,
    npwp: false,
    struktur: false,
  });

  // =====================================
  // SUBMIT STATE
  // =====================================

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  // =========================
  // PREFILL DATA
  // =========================

  useEffect(() => {
    console.log("DATA MASUK KE FORM:", data);

    if (!data) return;

    // =====================================
    // NORMALISASI STRUKTUR PROFIL KLIEN
    // =====================================

    const profilKlien =
      data?.profil_klien ??
      data?.profilKlien ??
      data?.data?.profil_klien ??
      {};

    // =====================================
    // NORMALISASI STRUKTUR DETAIL IDENTIFIKASI
    // =====================================

    const detail =
      data?.detail_identifikasi ??
      data?.detailIdentifikasi ??
      data?.data?.detail_identifikasi ??
      {};

    console.log("PROFIL KLIEN DI FORM:", profilKlien);
    console.log("DETAIL IDENTIFIKASI DI FORM:", detail);

    // =====================================
    // PREFILL FORM
    // =====================================

    setForm({
      // =========================
      // PROFIL KLIEN
      // =========================

      namaKlien:
        profilKlien?.NamaKlien ?? "",

      npwp:
        profilKlien?.NPWP ?? "",

      alamat:
        profilKlien?.AlamatKlien ?? "",

      sektorUsaha:
        profilKlien?.SektorUsaha ?? "",

      noTelp:
        profilKlien?.NoTelp ?? "",

      tahunBuku:
        profilKlien?.TahunBukuDiAudit?.toString() ??
        "",

      // =========================
      // DETAIL IDENTIFIKASI
      // =========================

      tahunPendirian:
        detail?.tahunPendirian?.toString() ?? "",

      opiniAudit:
        detail?.opiniAudit ?? "",

      noSuratPengesahan:
        detail?.noSuratPengesahan ?? "",

      laporanSPT:
        detail?.laporanSPT ?? "",

      noSuratKeputusan:
        detail?.noSuratKeputusan ?? "",

      laporanKeuangan:
        detail?.laporanKeuangan ?? "",

      tipePerikatan:
        detail?.tipePerikatan ?? "",

      sumberDana:
        detail?.sumberDana ?? "",

      jenisPerikatan:
        detail?.jenisPerikatan ?? "",

      tujuanTransaksi:
        detail?.tujuanTransaksi ?? "",

      standarAkuntansi:
        detail?.standarAkuntansi ?? "",

      namaKAP:
        detail?.namaKAP ?? "",

      totalAset:
        detail?.totalAset?.toString() ?? "",

      totalPendapatan:
        detail?.totalPendapatan?.toString() ?? "",

      totalLabaRugi:
        detail?.totalLabaRugi?.toString() ?? "",

      // =========================
      // KONTAK
      // =========================

      kontakNama:
        detail?.kontak?.nama ?? "",

      kontakJabatan:
        detail?.kontak?.jabatan ?? "",

      kontakNoTelp:
        detail?.kontak?.noTelp ?? "",

      kontakEmail:
        detail?.kontak?.email ?? "",
    });

    // =====================================
    // EXISTING FILE
    // =====================================

    setExistingFiles({
      akta:
        detail?.dokumen?.aktaPendirian ?? false,

      npwp:
        detail?.dokumen?.npwp ?? false,

      struktur:
        detail?.dokumen?.strukturOrganisasi ?? false,
    });

  }, [data]);

  // =====================================
  // HANDLE INPUT
  // =====================================

  function handleChange(e) {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  const normalizeInteger = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }
  
    const cleaned = String(value).replace(/[^\d-]/g, "");
  
    return cleaned === "" ? "" : String(parseInt(cleaned, 10));
  };

  // =====================================
  // HANDLE SUBMIT
  // =====================================

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const formData = new FormData();

      // =================================
      // PROFIL KLIEN
      // =================================

      formData.append(
        "NamaKlien",
        form.namaKlien || ""
      );

      formData.append(
        "NoTelp",
        form.noTelp || ""
      );

      formData.append(
        "AlamatKlien",
        form.alamat || ""
      );

      formData.append(
        "NPWP",
        form.npwp || ""
      );

      formData.append(
        "SektorUsaha",
        form.sektorUsaha || ""
      );

      /*
        Sebelumnya field ini belum dikirim.
        Karena profil klien memiliki
        TahunBukuDiAudit, sekarang dikirim.
      */

      formData.append(
        "TahunBukuDiAudit",
        form.tahunBuku || ""
      );

      // =================================
      // DETAIL IDENTIFIKASI
      // =================================

      formData.append(
        "Tahun",
        form.tahunPendirian || ""
      );

      formData.append(
        "OpiniAudit",
        form.opiniAudit || ""
      );

      formData.append(
        "NoSuratPengesahan",
        form.noSuratPengesahan || ""
      );

      formData.append(
        "LaporanSPT",
        form.laporanSPT || ""
      );

      formData.append(
        "NoSuratKeputusan",
        form.noSuratKeputusan || ""
      );

      formData.append(
        "LaporanKeuangan",
        form.laporanKeuangan || ""
      );

      formData.append(
        "TipePerikatan",
        form.tipePerikatan || ""
      );

      formData.append(
        "SumberDana",
        form.sumberDana || ""
      );

      formData.append(
        "JenisPerikatan",
        form.jenisPerikatan || ""
      );

      formData.append(
        "TujuanTransaksi",
        form.tujuanTransaksi || ""
      );

      formData.append(
        "StandardAkutansi",
        form.standarAkuntansi || ""
      );

      if (form.totalAset !== "") {
        formData.append(
          "TotalAset",
          normalizeInteger(form.totalAset)
        );
      }


      formData.append(
        "NamaKAP",
        form.namaKAP || ""
      );

      if (form.totalPendapatan !== "") {
        formData.append(
          "Pendapatan",
          normalizeInteger(form.totalPendapatan)
        );
      }

      if (form.totalLabaRugi !== "") {

        formData.append(
          "LabaRugi",
          normalizeInteger(form.totalLabaRugi)
        );
      }

      // =================================
      // KONTAK
      // =================================

      formData.append(
        "KontakNama",
        form.kontakNama || ""
      );

      formData.append(
        "KontakJabatan",
        form.kontakJabatan || ""
      );

      formData.append(
        "KontakNomor",
        form.kontakNoTelp || ""
      );

      formData.append(
        "KontakEmail",
        form.kontakEmail || ""
      );

      // =================================
      // FILE
      // =================================

      if (fileAkta instanceof File) {
        formData.append(
          "FileAkte",
          fileAkta
        );
      }

      if (fileNPWP instanceof File) {
        formData.append(
          "FileNPWP",
          fileNPWP
        );
      }

      if (fileStrukturOrganisasi instanceof File) {
        formData.append(
          "FileStrukturOrg",
          fileStrukturOrganisasi
        );
      }

      // =================================
      // DEBUG FORM DATA
      // =================================

      console.log(
        "Data yang dikirim:"
      );

      for (const [
        key,
        value,
      ] of formData.entries()) {
        console.log(key, value);
      }

      // =================================
      // UPDATE API
      // =================================

      console.log("===== FORM DATA =====");

      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await updateIdentifikasi(
        params.id,
        formData
      );

      // =================================
      // REFRESH PAGE DATA
      // =================================

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error(
        "Gagal menyimpan identifikasi:",
        error
      );

      const errors =
        error.response?.data?.errors;

      if (errors) {
        const firstError =
          Object.values(errors)?.[0]?.[0];

        setSubmitError(
          firstError ||
          "Gagal menyimpan data identifikasi."
        );
      } else {
        setSubmitError(
          error.response?.data?.message ||
          error.message ||
          "Gagal menyimpan data identifikasi."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-b-xl bg-white p-5"
    >
      <section className="rounded-xl border border-[#DCE5EF] bg-white p-5">

        {/* HEADER */}

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

        {/* ERROR */}

        {submitError && (

          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

            <p className="font-poppins text-xs text-red-600">
              {submitError}
            </p>

          </div>

        )}

        {/* DATA PROFIL DAN IDENTIFIKASI */}

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

          <InputField
            label="Total Laba/Rugi Tahun Berjalan"
            name="totalLabaRugi"
            value={form.totalLabaRugi}
            onChange={handleChange}
            icon={<CircleDollarSign size={15} />}
          />

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
              label="Nama"
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

        <div className="mt-8">

          <div className="mb-4 flex items-center gap-2">

            <FileText
              size={18}
              className="text-[#38BDF8]"
            />

            <h4 className="font-poppins text-sm font-semibold text-[#26364D]">
              Dokumen Pendukung
            </h4>

          </div>

          <div className="space-y-4">

            <FileInput
              label="File Akta Pendirian"
              file={fileAkta}
              hasExistingFile={
                existingFiles.akta
              }
              onChange={setFileAkta}
            />

            <FileInput
              label="File NPWP"
              file={fileNPWP}
              hasExistingFile={
                existingFiles.npwp
              }
              onChange={setFileNPWP}
            />

            <FileInput
              label="File Struktur Organisasi"
              file={fileStrukturOrganisasi}
              hasExistingFile={
                existingFiles.struktur
              }
              onChange={
                setFileStrukturOrganisasi
              }
            />

          </div>

        </div>

        {/* BUTTON */}

        <div className="mt-8 flex justify-end gap-3 border-t border-[#E5EAF0] pt-5">

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-9 rounded-lg bg-[#EF4444] px-5 font-poppins text-xs font-semibold text-white hover:bg-[#DC2626] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Keluar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 rounded-lg bg-[#16A34A] px-5 font-poppins text-xs font-semibold text-white hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
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
          value={value ?? ""}
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
  file,
  hasExistingFile,
  onChange,
}) {
  const fileName =
    file?.name ??
    (hasExistingFile
      ? "File sudah tersedia"
      : "Belum ada file");

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
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const selectedFile =
                e.target.files?.[0] ?? null;

              if (selectedFile) {
                onChange(selectedFile);
              }
            }}
          />

        </label>

        <div className="flex min-w-0 flex-1 items-center px-3">

          <span className="truncate font-poppins text-xs text-[#718096]">
            {fileName}
          </span>

        </div>

      </div>

    </div>
  );
}