"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import SaveButton from "@/components/button/save_button";

/* =====================================================
   API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/* =====================================================
   API ENDPOINT
===================================================== */

/*
 * API Uji Mutasi Kas
 *
 * GET:
 * /api/kas/{auditId}/uji-mutasi
 *
 * POST:
 * /api/kas/{auditId}/uji-mutasi
 *
 * Endpoint ini digunakan untuk:
 * - Mengambil data Cash Count
 * - Mengambil data Rekap Mutasi Kas
 * - Mengambil data Uji Mutasi Kas
 *
 * FE hanya memanggil satu API GET untuk mengambil
 * seluruh data yang dibutuhkan halaman Uji Mutasi.
 */
const getUjiMutasiEndpoint = (auditId) => {
  if (
    auditId === null ||
    auditId === undefined ||
    auditId === ""
  ) {
    return null;
  }

  return `${API_URL}/api/kas/${auditId}/uji-mutasi`;
};

/*
 * Endpoint Rekap Mutasi Kas.
 *
 * Hanya ditampilkan sebagai referensi agar endpoint
 * dapat diketahui dengan jelas.
 *
 * Endpoint ini TIDAK dipanggil langsung oleh FE
 * Uji Mutasi Kas.
 *
 * Data Rekap Mutasi Kas diperoleh dari response
 * API Uji Mutasi Kas.
 */
const REKAP_ENDPOINT =
  `${API_URL}/api/rekap-mutasi-kas`;

/* =====================================================
   AUTH
===================================================== */

const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

/* =====================================================
   HELPERS
===================================================== */

const toNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(toNumber(value));
};

/* =====================================================
   CALCULATE
===================================================== */

const calculateValues = (
  cashCount,
  kasKeluar,
  kasMasuk,
  saldoMenurutBuku,
  mode
) => {
  const cashCountValue = toNumber(cashCount);
  const kasKeluarValue = toNumber(kasKeluar);
  const kasMasukValue = toNumber(kasMasuk);
  const saldoMenurutBukuValue =
    toNumber(saldoMenurutBuku);

  let saldoMenurutAudit = 0;

  /*
   * SEBELUM TUTUP BUKU
   *
   * Cash Count + Kas Masuk - Kas Keluar
   */
  if (mode === "sebelum") {
    saldoMenurutAudit =
      cashCountValue +
      kasMasukValue -
      kasKeluarValue;
  }

  /*
   * SETELAH TUTUP BUKU
   *
   * Kas Keluar - Kas Masuk + Cash Count
   */
  if (mode === "sesudah") {
    saldoMenurutAudit =
      kasKeluarValue -
      kasMasukValue +
      cashCountValue;
  }

  /*
   * SELISIH
   *
   * Saldo Menurut Audit - Saldo Menurut Buku
   */
  const selisih =
    saldoMenurutAudit -
    saldoMenurutBukuValue;

  return {
    saldoMenurutAudit,
    selisih,
  };
};

/* =====================================================
   COMPONENT
===================================================== */

export default function UjiMutasiKasPage({
  auditId,
}) {
  const [
    activeMode,
    setActiveMode,
  ] = useState("sebelum");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /*
   * Data yang berasal dari API Uji Mutasi Kas.
   *
   * Backend mengambil:
   * - Cash Count
   * - Rekap Mutasi Kas
   * - Uji Mutasi
   *
   * FE hanya menerima hasil dari satu API.
   */
  const [
    sourceData,
    setSourceData,
  ] = useState({
    UjiMutasiID: null,
    KasID: null,

    TotalKeseluruhan: 0,

    KreditTotal: 0,
    DebitTotal: 0,
    SaldoAwal: 0,

    Penjelasan: "",
  });

  /*
   * Penjelasan selisih.
   */
  const [
    penjelasan,
    setPenjelasan,
  ] = useState("");

  /* =====================================================
     API ENDPOINT
  ===================================================== */

  /*
   * Endpoint utama yang benar-benar dipanggil FE.
   */
  const UJI_MUTASI_ENDPOINT = useMemo(() => {
    return getUjiMutasiEndpoint(auditId);
  }, [auditId]);

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = useCallback(async () => {
    if (!UJI_MUTASI_ENDPOINT) {
      setError("Audit ID tidak ditemukan.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      /*
       * =================================================
       * SATU-SATUNYA GET API
       * =================================================
       *
       * GET:
       * /api/kas/{auditId}/uji-mutasi
       *
       * Tidak memanggil:
       * - API Cash Count
       * - API Rekap Mutasi Kas
       * - API Kas
       *
       * Semua data dikembalikan oleh API Uji Mutasi Kas.
       */
      const response = await fetchWithAuth(
        UJI_MUTASI_ENDPOINT,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        let message =
          "Gagal mengambil data Uji Mutasi Kas.";

        try {
          const result =
            await response.json();

          message =
            result?.message ||
            result?.error ||
            message;
        } catch {
          // Ignore
        }

        throw new Error(message);
      }

      const result =
        await response.json();

      const data =
        result?.data || {};

      /*
       * =================================================
       * NORMALISASI RESPONSE BACKEND
       * =================================================
       *
       * TotalKeseluruhan
       * -> berasal dari Cash Count
       *
       * KreditTotal
       * -> berasal dari Rekap Mutasi Kas
       *
       * DebitTotal
       * -> berasal dari Rekap Mutasi Kas
       *
       * SaldoAwal
       * -> berasal dari Rekap Mutasi Kas
       *
       * Penjelasan
       * -> berasal dari Uji Mutasi Kas
       */
      const normalizedData = {
        UjiMutasiID:
          data?.UjiMutasiID ?? null,

        KasID:
          data?.KasID ?? null,

        TotalKeseluruhan:
          toNumber(
            data?.TotalKeseluruhan
          ),

        KreditTotal:
          toNumber(
            data?.KreditTotal
          ),

        DebitTotal:
          toNumber(
            data?.DebitTotal
          ),

        SaldoAwal:
          toNumber(
            data?.SaldoAwal
          ),

        Penjelasan:
          data?.Penjelasan ?? "",
      };

      setSourceData(normalizedData);

      setPenjelasan(
        normalizedData.Penjelasan
      );
    } catch (err) {
      console.error(
        "LOAD UJI MUTASI ERROR:",
        err
      );

      setError(
        err?.message ||
          "Terjadi kesalahan saat mengambil data Uji Mutasi Kas."
      );
    } finally {
      setLoading(false);
    }
  }, [UJI_MUTASI_ENDPOINT]);

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =====================================================
     CALCULATE
  ===================================================== */

  const calculatedValues = useMemo(() => {
    return calculateValues(
      sourceData.TotalKeseluruhan,
      sourceData.KreditTotal,
      sourceData.DebitTotal,
      sourceData.SaldoAwal,
      activeMode
    );
  }, [
    sourceData.TotalKeseluruhan,
    sourceData.KreditTotal,
    sourceData.DebitTotal,
    sourceData.SaldoAwal,
    activeMode,
  ]);

  /* =====================================================
     SUMMARY
  ===================================================== */

  const summary = useMemo(() => {
    return {
      cashCount:
        sourceData.TotalKeseluruhan,

      kasKeluar:
        sourceData.KreditTotal,

      kasMasuk:
        sourceData.DebitTotal,

      saldoMenurutAudit:
        calculatedValues.saldoMenurutAudit,

      saldoMenurutBuku:
        sourceData.SaldoAwal,

      selisih:
        calculatedValues.selisih,
    };
  }, [
    sourceData,
    calculatedValues,
  ]);

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = async () => {
    if (!UJI_MUTASI_ENDPOINT) {
      setError("Audit ID tidak ditemukan.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      /*
       * Backend hanya menyimpan:
       * - KasID
       * - Penjelasan
       *
       * KasID berasal dari parameter URL.
       */
      const payload = {
        Penjelasan:
          penjelasan || null,
      };

      /*
       * POST ke API Uji Mutasi Kas.
       */
      const response =
        await fetchWithAuth(
          UJI_MUTASI_ENDPOINT,
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );

      if (!response.ok) {
        let message =
          "Gagal menyimpan data Uji Mutasi Kas.";

        try {
          const result =
            await response.json();

          message =
            result?.message ||
            result?.error ||
            message;
        } catch {
          // Ignore
        }

        throw new Error(message);
      }

      const result =
        await response.json();

      /*
       * Update data dari response POST.
       */
      if (result?.data) {
        setSourceData(
          (previous) => ({
            ...previous,

            UjiMutasiID:
              result.data
                ?.UjiMutasiID ??
              previous.UjiMutasiID,

            KasID:
              result.data?.KasID ??
              previous.KasID,

            Penjelasan:
              result.data
                ?.Penjelasan ??
              penjelasan,
          })
        );
      }

      setSuccess(
        result?.message ||
          "Data Uji Mutasi Kas berhasil disimpan."
      );
    } catch (err) {
      console.error(
        "SAVE UJI MUTASI ERROR:",
        err
      );

      setError(
        err?.message ||
          "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="w-full">

      {error && (
        <div className="mb-4">
          <AlertError
            message={error}
            onClose={() =>
              setError("")
            }
          />
        </div>
      )}

      {success && (
        <div className="mb-4">
          <AlertSuccess
            message={success}
            onClose={() =>
              setSuccess("")
            }
          />
        </div>
      )}

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-3 shadow-sm sm:p-4">

        {/* MODE */}

        <div className="flex justify-end">

          <div className="grid w-full max-w-[390px] grid-cols-2 gap-1.5 rounded-xl border border-[#DCE5EF] bg-[#F8FAFC] p-1.5">

            {[
              {
                id: "sebelum",
                label: "Sebelum Tutup Buku",
              },
              {
                id: "sesudah",
                label: "Setelah Tutup Buku",
              },
            ].map(
              (mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() =>
                    setActiveMode(
                      mode.id
                    )
                  }
                  className={`rounded-lg px-3 py-3 font-poppins text-[11px] font-medium transition ${
                    activeMode ===
                    mode.id
                      ? "bg-white text-[#0EA5E9] shadow-sm"
                      : "text-[#64748B] hover:text-[#0EA5E9]"
                  }`}
                >
                  {mode.label}
                </button>
              )
            )}

          </div>

        </div>

        {/* SUMMARY */}

        <div className="mt-3 overflow-hidden rounded-xl border border-[#DCE5EF]">

          <div className="grid grid-cols-[1fr_1fr] bg-[#F8FAFC] px-3 py-2 font-poppins text-[9px] font-semibold uppercase tracking-wide text-[#64748B] sm:px-4">

            <span>
              Keterangan
            </span>

            <span className="text-center">
              Perhitungan
            </span>

          </div>

          {/* HASIL CASH COUNT */}

          <div className="grid grid-cols-[1fr_1fr] items-center border-b border-[#EDF2F7] px-3 py-2 font-poppins text-[11px] text-[#475569] sm:px-4 sm:text-xs">

            <span>
              Hasil Cash Count
            </span>

            <span className="text-right">
              Rp{" "}
              {loading
                ? "..."
                : formatNumber(
                    summary.cashCount
                  )}
            </span>

          </div>

          {/* KAS KELUAR */}

          <div className="grid grid-cols-[1fr_1fr] items-center border-b border-[#EDF2F7] px-3 py-2 font-poppins text-[11px] text-[#475569] sm:px-4 sm:text-xs">

            <span>
              Kas Keluar
            </span>

            <span className="pl-8 text-left sm:pl-12">
              Rp{" "}
              {loading
                ? "..."
                : formatNumber(
                    summary.kasKeluar
                  )}
            </span>

          </div>

          {/* KAS MASUK */}

          <div className="grid grid-cols-[1fr_1fr] items-center border-b border-[#EDF2F7] px-3 py-2 font-poppins text-[11px] text-[#475569] sm:px-4 sm:text-xs">

            <span>
              Kas Masuk
            </span>

            <span className="pl-8 text-left sm:pl-12">
              Rp{" "}
              {loading
                ? "..."
                : formatNumber(
                    summary.kasMasuk
                  )}
            </span>

          </div>

          {/* SALDO MENURUT AUDIT */}

          <div className="grid grid-cols-[1fr_1fr] items-center border-b border-[#EDF2F7] px-3 py-2 font-poppins text-[11px] font-bold text-[#475569] sm:px-4 sm:text-xs">

            <span>
              Saldo Menurut Audit
            </span>

            <span className="text-right font-bold">
              Rp{" "}
              {loading
                ? "..."
                : formatNumber(
                    summary.saldoMenurutAudit
                  )}
            </span>

          </div>

          {/* SALDO MENURUT BUKU */}

          <div className="grid grid-cols-[1fr_1fr] items-center border-b border-[#EDF2F7] px-3 py-2 font-poppins text-[11px] font-bold text-[#475569] sm:px-4 sm:text-xs">

            <span>
              Saldo Menurut Buku
            </span>

            <span className="text-right font-bold">
              Rp{" "}
              {loading
                ? "..."
                : formatNumber(
                    summary.saldoMenurutBuku
                  )}
            </span>

          </div>

          {/* SELISIH */}

          <div className="grid grid-cols-[1fr_1fr] items-center px-3 py-2 font-poppins text-[11px] font-bold text-[#1E293B] sm:px-4 sm:text-xs">

            <span>
              Selisih
            </span>

            <span className="text-right font-bold text-[#EF4444]">
              Rp{" "}
              {loading
                ? "..."
                : formatNumber(
                    summary.selisih
                  )}
            </span>

          </div>

        </div>

        {/* PENJELASAN SELISIH */}

        <label className="mt-3 block font-poppins text-[10px] font-semibold text-[#475569]">
          Penjelasan Selisih
        </label>

        <textarea
          value={penjelasan}
          onChange={(event) =>
            setPenjelasan(
              event.target.value
            )
          }
          placeholder="Masukkan penjelasan selisih"
          className="mt-1 h-24 w-full max-w-[520px] resize-none rounded-lg border border-[#DCE5EF] bg-white px-3 py-2 font-poppins text-[11px] text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8] sm:h-28"
        />

        <div className="mt-3 flex justify-end">

          <SaveButton
            onClick={handleSave}
            loading={saving}
            label={
              saving
                ? "Menyimpan..."
                : "Simpan"
            }
          />

        </div>

      </div>
    </div>
  );
}