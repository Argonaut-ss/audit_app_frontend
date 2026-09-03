"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

import {
  getIdentifikasi,
} from "@/services/mahasiswa/tugas/audit/identifikasi_pengguna";

export default function useIdentifikasi() {
  const params = useParams();

  const [identifikasiData, setIdentifikasiData] = useState(null);

  const [profilKlienData, setProfilKlienData] = useState(null);

  const [loadingIdentifikasi, setLoadingIdentifikasi] = useState(true);

  const [identifikasiError, setIdentifikasiError] = useState("");

  const fetchIdentifikasi = useCallback(async () => {
    if (!params?.id) return;

    try {
      setLoadingIdentifikasi(true);
      setIdentifikasiError("");

      const response = await getIdentifikasi(params.id);

      // console.log("Response Identifikasi:", response);

      const profilKlien =
        response?.profil_klien ?? null;

      const detailIdentifikasi =
        response?.detail_identifikasi ?? null;

      // console.log("Profil Klien:", profilKlien);

      // console.log(
      //   "Detail Identifikasi:",
      //   detailIdentifikasi
      // );

      // =========================
      // SIMPAN PROFIL KLIEN
      // =========================
      setProfilKlienData(profilKlien);

      // =========================
      // SIMPAN DETAIL IDENTIFIKASI
      // =========================
      setIdentifikasiData(
        detailIdentifikasi
          ? {
            identifikasiId:
              detailIdentifikasi.IdentifikasiID ?? null,

            jwbKasusId:
              detailIdentifikasi.JwbKasusID ?? null,

            tahunPendirian:
              detailIdentifikasi.Tahun ?? null,

            opiniAudit:
              detailIdentifikasi.OpiniAudit ?? null,

            noSuratPengesahan:
              detailIdentifikasi.NoSuratPengesahan ?? null,

            laporanSPT:
              detailIdentifikasi.LaporanSPT ?? null,

            noSuratKeputusan:
              detailIdentifikasi.NoSuratKeputusan ?? null,

            laporanKeuangan:
              detailIdentifikasi.LaporanKeuangan ?? null,

            tipePerikatan:
              detailIdentifikasi.TipePerikatan ?? null,

            sumberDana:
              detailIdentifikasi.SumberDana ?? null,

            jenisPerikatan:
              detailIdentifikasi.JenisPerikatan ?? null,

            tujuanTransaksi:
              detailIdentifikasi.TujuanTransaksi ?? null,

            standarAkuntansi:
              detailIdentifikasi.StandardAkutansi ?? null,

            totalAset:
              detailIdentifikasi.TotalAset ?? null,

            namaKAP:
              detailIdentifikasi.NamaKAP ?? null,

            totalPendapatan:
              detailIdentifikasi.Pendapatan ?? null,

            totalLabaRugi:
              detailIdentifikasi.LabaRugi ?? null,

            kontak: {
              nama:
                detailIdentifikasi.KontakNama ?? null,

              jabatan:
                detailIdentifikasi.KontakJabatan ?? null,

              noTelp:
                detailIdentifikasi.KontakNomor ?? null,

              email:
                detailIdentifikasi.KontakEmail ?? null,
            },

            dokumen: {
              aktaPendirian:
                detailIdentifikasi.has_file_akte ?? false,

              npwp:
                detailIdentifikasi.has_file_npwp ?? false,

              strukturOrganisasi:
                detailIdentifikasi.has_file_struktur_org ?? false,
            },
          }
          : null
      );
    } catch (error) {
      console.error(
        "Gagal mengambil data identifikasi:",
        error
      );

      setIdentifikasiError(
        error?.response?.data?.message ||
        error?.message ||
        "Gagal mengambil data identifikasi."
      );
    } finally {
      setLoadingIdentifikasi(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchIdentifikasi();
  }, [fetchIdentifikasi]);

  return {
    identifikasiData,
    profilKlienData,
    loadingIdentifikasi,
    identifikasiError,
    fetchIdentifikasi,
  };
}