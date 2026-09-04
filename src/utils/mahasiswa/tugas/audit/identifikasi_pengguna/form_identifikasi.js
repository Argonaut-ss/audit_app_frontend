export const initialFormIdentifikasi = {
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
  };
  
  
  export function normalizeInteger(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "";
    }
  
    const cleaned = String(value)
      .replace(/[^\d-]/g, "");
  
    return cleaned === ""
      ? ""
      : String(parseInt(cleaned, 10));
  }
  
  
  export function mapIdentifikasiToForm(data) {
    if (!data) {
      return initialFormIdentifikasi;
    }
  
    const profilKlien =
      data?.profil_klien ??
      data?.profilKlien ??
      {};
  
    const detail =
      data?.detail_identifikasi ??
      data?.detailIdentifikasi ??
      {};
  
    return {
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
        profilKlien?.TahunBukuDiAudit?.toString() ?? "",
  
  
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
  
  
      kontakNama:
        detail?.kontak?.nama ?? "",
  
      kontakJabatan:
        detail?.kontak?.jabatan ?? "",
  
      kontakNoTelp:
        detail?.kontak?.noTelp ?? "",
  
      kontakEmail:
        detail?.kontak?.email ?? "",
    };
  }
  
  
  export function mapExistingFiles(data) {
    const detail =
      data?.detail_identifikasi ??
      data?.detailIdentifikasi ??
      {};
  
    return {
      akta:
        detail?.dokumen?.aktaPendirian ?? false,
  
      npwp:
        detail?.dokumen?.npwp ?? false,
  
      struktur:
        detail?.dokumen?.strukturOrganisasi ?? false,
    };
  }
  
  
  export function buildIdentifikasiFormData({
    form,
    fileAkta,
    fileNPWP,
    fileStrukturOrganisasi,
  }) {
    const formData = new FormData();
  
  
    // =============================
    // PROFIL KLIEN
    // =============================
  
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
  
    formData.append(
      "TahunBukuDiAudit",
      form.tahunBuku || ""
    );
  
  
    // =============================
    // IDENTIFIKASI
    // =============================
  
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
  
    formData.append(
      "NamaKAP",
      form.namaKAP || ""
    );
  
  
    // =============================
    // INTEGER
    // =============================
  
    if (form.totalAset !== "") {
      formData.append(
        "TotalAset",
        normalizeInteger(form.totalAset)
      );
    }
  
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
  
  
    // =============================
    // KONTAK
    // =============================
  
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
  
  
    // =============================
    // FILE
    // =============================
  
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
  
    if (
      fileStrukturOrganisasi instanceof File
    ) {
      formData.append(
        "FileStrukturOrg",
        fileStrukturOrganisasi
      );
    }
  
  
    return formData;
  }