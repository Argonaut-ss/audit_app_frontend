
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

/*
 * Mendeteksi data sumber yang belum ditemukan.
 */
const isSourceDataNotFound = (status, message) => {
  const normalizedMessage = String(message || "")
    .toLowerCase();

  return (
    status === 404 &&
    (
      normalizedMessage.includes(
        "no query results for model"
      ) ||
      normalizedMessage.includes("cashcountkas") ||
      normalizedMessage.includes("cash count") ||
      normalizedMessage.includes("data tidak ditemukan")
    )
  );
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
  const [activeMode, setActiveMode] =
    useState("sebelum");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  /*
   * Menandakan apakah seluruh angka sumber tersedia.
   */
  const [sourceAvailable, setSourceAvailable] =
    useState(false);

  /*
   * Angka menggunakan null secara internal jika belum
   * tersedia, tetapi akan ditampilkan sebagai Rp 0.
   */
  const [sourceData, setSourceData] = useState({
    UjiMutasiID: null,
    KasID: null,
    TotalKeseluruhan: null,
    KreditTotal: null,
    DebitTotal: null,
    SaldoAwal: null,
    Penjelasan: "",
  });

  const [penjelasan, setPenjelasan] =
    useState("");

  /* =====================================================
     ENDPOINT
  ===================================================== */

  const UJI_MUTASI_ENDPOINT = useMemo(
    () => getUjiMutasiEndpoint(auditId),
    [auditId]
  );

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = useCallback(async () => {
    if (!UJI_MUTASI_ENDPOINT) {
      setError("Audit ID tidak ditemukan.");
      setSourceAvailable(false);
      return;
    }

    setLoading(true);
    setError("");
    setInfoMessage("");
    setSuccess("");

    try {
      /*
       * Satu-satunya GET API untuk halaman ini.
       */
      const response = await fetchWithAuth(
        UJI_MUTASI_ENDPOINT,
        {
          method: "GET",
        }
      );

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        const message =
          result?.message ||
          result?.error ||
          "Gagal mengambil data Uji Mutasi Kas.";

        /*
         * Data Cash Count belum ditemukan:
         * jangan tampilkan AlertError.
         */
        if (
          isSourceDataNotFound(
            response.status,
            message
          )
        ) {
          setSourceAvailable(false);

          setSourceData({
            UjiMutasiID: null,
            KasID: null,
            TotalKeseluruhan: null,
            KreditTotal: null,
            DebitTotal: null,
            SaldoAwal: null,
            Penjelasan: "",
          });

          setPenjelasan("");

          setInfoMessage(
            "Angka Cash Count dan Rekap Mutasi Kas belum tersedia. Silakan lengkapi data sumber terlebih dahulu."
          );

          return;
        }

        throw new Error(message);
      }

      const data = result?.data;

      /*
       * Respons berhasil tetapi tidak memiliki data.
       */
      if (!data || typeof data !== "object") {
        setSourceAvailable(false);

        setSourceData({
          UjiMutasiID: null,
          KasID: null,
          TotalKeseluruhan: null,
          KreditTotal: null,
          DebitTotal: null,
          SaldoAwal: null,
          Penjelasan: "",
        });

        setPenjelasan("");

        setInfoMessage(
          "Angka Cash Count dan Rekap Mutasi Kas belum tersedia."
        );

        return;
      }

      /*
       * Normalisasi response.
       * Nilai kosong tetap null agar FE dapat membedakan
       * angka yang belum tersedia dari angka nol yang valid.
       */
      const normalizedData = {
        UjiMutasiID:
          data.UjiMutasiID ?? null,

        KasID:
          data.KasID ?? null,

        TotalKeseluruhan:
          data.TotalKeseluruhan !== null &&
          data.TotalKeseluruhan !== undefined &&
          data.TotalKeseluruhan !== ""
            ? toNumber(data.TotalKeseluruhan)
            : null,

        KreditTotal:
          data.KreditTotal !== null &&
          data.KreditTotal !== undefined &&
          data.KreditTotal !== ""
            ? toNumber(data.KreditTotal)
            : null,

        DebitTotal:
          data.DebitTotal !== null &&
          data.DebitTotal !== undefined &&
          data.DebitTotal !== ""
            ? toNumber(data.DebitTotal)
            : null,

        SaldoAwal:
          data.SaldoAwal !== null &&
          data.SaldoAwal !== undefined &&
          data.SaldoAwal !== ""
            ? toNumber(data.SaldoAwal)
            : null,

        Penjelasan: data.Penjelasan ?? "",
      };

      setSourceData(normalizedData);
      setPenjelasan(normalizedData.Penjelasan);

      /*
       * Perhitungan dianggap lengkap hanya jika seluruh
       * angka sumber sudah tersedia.
       */
      const requiredValues = [
        normalizedData.TotalKeseluruhan,
        normalizedData.KreditTotal,
        normalizedData.DebitTotal,
        normalizedData.SaldoAwal,
      ];

      const isComplete = requiredValues.every(
        (value) => value !== null
      );

      setSourceAvailable(isComplete);

      if (!isComplete) {
        setInfoMessage(
          "Sebagian angka Cash Count atau Rekap Mutasi Kas belum tersedia. Perhitungan belum dapat dianggap lengkap."
        );
      }
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

  const summary = useMemo(
    () => ({
      cashCount: sourceData.TotalKeseluruhan,
      kasKeluar: sourceData.KreditTotal,
      kasMasuk: sourceData.DebitTotal,
      saldoMenurutAudit:
        calculatedValues.saldoMenurutAudit,
      saldoMenurutBuku: sourceData.SaldoAwal,
      selisih: calculatedValues.selisih,
    }),
    [sourceData, calculatedValues]
  );

  /*
   * Angka kosong/null tetap ditampilkan sebagai Rp 0.
   */
  const displayAmount = (value) => {
    if (loading) {
      return "...";
    }

    return `Rp ${formatNumber(value ?? 0)}`;
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = async () => {
    if (!UJI_MUTASI_ENDPOINT) {
      setError("Audit ID tidak ditemukan.");
      return;
    }

    if (!sourceAvailable) {
      setInfoMessage(
        "Data belum dapat disimpan karena angka Cash Count atau Rekap Mutasi Kas belum lengkap."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    setInfoMessage("");

    try {
      /*
       * Backend menyimpan penjelasan selisih.
       */
      const payload = {
        Penjelasan: penjelasan || null,
      };

      const response = await fetchWithAuth(
        UJI_MUTASI_ENDPOINT,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Gagal menyimpan data Uji Mutasi Kas."
        );
      }

      if (result?.data) {
        setSourceData((previous) => ({
          ...previous,

          UjiMutasiID:
            result.data.UjiMutasiID ??
            previous.UjiMutasiID,

          KasID:
            result.data.KasID ??
            previous.KasID,

          Penjelasan:
            result.data.Penjelasan ??
            penjelasan,
        }));
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
            onClose={() => setError("")}
          />
        </div>
      )}

      {success && (
        <div className="mb-4">
          <AlertSuccess
            message={success}
            onClose={() => setSuccess("")}
          />
        </div>
      )}

      {infoMessage && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 font-poppins text-xs text-amber-800"
        >
          {infoMessage}
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
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id)}
                className={`rounded-lg px-3 py-3 font-poppins text-[11px] font-medium transition ${
                  activeMode === mode.id
                    ? "bg-white text-[#0EA5E9] shadow-sm"
                    : "text-[#64748B] hover:text-[#0EA5E9]"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* SUMMARY */}

        <div className="mt-3 overflow-hidden rounded-xl border border-[#DCE5EF]">
          <div className="grid grid-cols-[1fr_1fr] bg-[#F8FAFC] px-3 py-2 font-poppins text-[9px] font-semibold uppercase tracking-wide text-[#64748B] sm:px-4">
            <span>Keterangan</span>
            <span className="text-center">
              Perhitungan
            </span>
          </div>

          {/* CASH COUNT */}

          <div className="grid grid-cols-[1fr_1fr] items-center border-b border-[#EDF2F7] px-3 py-2 font-poppins text-[11px] text-[#475569] sm:px-4 sm:text-xs">
            <span>Hasil Cash Count</span>
            <span className="text-right">
              {displayAmount(summary.cashCount)}
            </span>
          </div>

          {/* KAS KELUAR */}

          <div className="grid grid-cols-[1fr_1fr] items-center border-b border-[#EDF2F7] px-3 py-2 font-poppins text-[11px] text-[#475569] sm:px-4 sm:text-xs">
            <span>Kas Keluar</span>
            <span className="pl-8 text-left sm:pl-12">
              {displayAmount(summary.kasKeluar)}
            </span>
          </div>

          {/* KAS MASUK */}

          <div className="grid grid-cols-[1fr_1fr] items-center border-b border-[#EDF2F7] px-3 py-2 font-poppins text-[11px] text-[#475569] sm:px-4 sm:text-xs">
            <span>Kas Masuk</span>
            <span className="pl-8 text-left sm:pl-12">
              {displayAmount(summary.kasMasuk)}
            </span>
          </div>

          {/* SALDO MENURUT AUDIT */}

          <div className="grid grid-cols-[1fr_1fr] items-center border-b border-[#EDF2F7] px-3 py-2 font-poppins text-[11px] font-bold text-[#475569] sm:px-4 sm:text-xs">
            <span>Saldo Menurut Audit</span>
            <span className="text-right font-bold">
              {displayAmount(
                sourceAvailable
                  ? summary.saldoMenurutAudit
                  : 0
              )}
            </span>
          </div>

          {/* SALDO MENURUT BUKU */}

          <div className="grid grid-cols-[1fr_1fr] items-center border-b border-[#EDF2F7] px-3 py-2 font-poppins text-[11px] font-bold text-[#475569] sm:px-4 sm:text-xs">
            <span>Saldo Menurut Buku</span>
            <span className="text-right font-bold">
              {displayAmount(summary.saldoMenurutBuku)}
            </span>
          </div>

          {/* SELISIH */}

          <div className="grid grid-cols-[1fr_1fr] items-center px-3 py-2 font-poppins text-[11px] font-bold text-[#1E293B] sm:px-4 sm:text-xs">
            <span>Selisih</span>
            <span className="text-right font-bold text-[#EF4444]">
              {displayAmount(
                sourceAvailable
                  ? summary.selisih
                  : 0
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
            setPenjelasan(event.target.value)
          }
          placeholder="Masukkan penjelasan selisih"
          className="mt-1 h-24 w-full max-w-[520px] resize-none rounded-lg border border-[#DCE5EF] bg-white px-3 py-2 font-poppins text-[11px] text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8] sm:h-28"
        />

        <div className="mt-3 flex justify-end">
          <SaveButton
            onClick={handleSave}
            loading={saving}
            label={
              saving ? "Menyimpan..." : "Simpan"
            }
            disabled={
              loading ||
              saving ||
              !sourceAvailable
            }
          />
        </div>
      </div>
    </div>
  );
}
