"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useSearchParams,
} from "next/navigation";

import {
  Eye,
  Trash2,
  Check,
  ChevronDown,
  Calendar,
} from "lucide-react";

import { createPortal } from "react-dom";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";

/* =====================================================
   API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const API_ENDPOINT = `${API_URL}/api/rekap-balasan-setara-kas`;
const BULK_SAVE_ENDPOINT = `${API_ENDPOINT}/bulk-save`;

const rekapBalasanSetaraKasPageCache = new Map();

/* =====================================================
   AUTH
===================================================== */

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token login tidak ditemukan. Silakan login kembali.");
  }

  return fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
};

/* =====================================================
   RESPONSE HELPER
===================================================== */

const parseResponse = async (response) => {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const getApiError = (result, fallback) => {
  if (result?.errors && typeof result.errors === "object") {
    const firstError = Object.values(result.errors)
      .flat()
      .find(Boolean);

    if (firstError) return String(firstError);
  }

  return result?.message || result?.error || result?.raw || fallback;
};

/* =====================================================
   ID HELPER
===================================================== */

const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

/* =====================================================
   NUMBER HELPER
===================================================== */

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value).replace(/[^\d-]/g, "");

  if (!cleaned || cleaned === "-") return 0;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseNumber = (value) => toNumber(value);

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(toNumber(value));

/* =====================================================
   DATE HELPER
===================================================== */

const toDateInput = (value) => {
  if (!value) return "";

  const normalized = String(value).trim();

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const displayMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (displayMatch) {
    return `${displayMatch[3]}-${displayMatch[2]}-${displayMatch[1]}`;
  }

  return "";
};

const formatTanggalIndonesia = (value) => {
  const normalized = toDateInput(value);

  if (!normalized) return "";

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return "";

  return `${match[3]}/${match[2]}/${match[1]}`;
};

/* =====================================================
   DATE INPUT INDONESIA
===================================================== */

function TanggalIndonesia({
  value,
  onChange,
  disabled = false,
  ariaLabel = "Tanggal",
}) {
  const dateInputRef = useRef(null);

  const openDatePicker = () => {
    const input = dateInputRef.current;

    if (!input || disabled) return;

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Gunakan fallback.
      }
    }

    input.focus();
    input.click();
  };

  return (
    <div
      className={`relative flex h-10 w-full min-w-[140px] items-center rounded-xl border px-3 transition ${
        disabled
          ? "cursor-not-allowed border-[#DCE5EF] bg-[#F1F5F9]"
          : "border-[#DCE5EF] bg-white focus-within:border-[#38BDF8]"
      }`}
    >
      <span
        className={`min-w-0 flex-1 truncate font-poppins text-sm ${
          disabled
            ? "text-[#94A3B8]"
            : value
              ? "text-[#475569]"
              : "text-[#94A3B8]"
        }`}
      >
        {formatTanggalIndonesia(value) || "dd/mm/yyyy"}
      </span>

      <button
        type="button"
        disabled={disabled}
        aria-label={`Pilih ${ariaLabel}`}
        onClick={openDatePicker}
        className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#64748B] transition hover:bg-[#F1F5F9] disabled:cursor-not-allowed"
      >
        <Calendar size={16} />
      </button>

      <input
        ref={dateInputRef}
        type="date"
        value={toDateInput(value)}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange?.(event.target.value)}
        className="pointer-events-none absolute h-px w-px opacity-0"
        tabIndex={-1}
      />
    </div>
  );
}

/* =====================================================
   STATUS
===================================================== */

const statusFromBackend = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (["diterima", "terbalas"].includes(normalized)) {
    return "Terbalas";
  }

  if (["belum diterima", "tidak terbalas"].includes(normalized)) {
    return "Tidak Terbalas";
  }

  return "";
};

const statusToBackend = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (["terbalas", "diterima"].includes(normalized)) {
    return "diterima";
  }

  if (["tidak terbalas", "belum diterima"].includes(normalized)) {
    return "belum diterima";
  }

  return "";
};

/* =====================================================
   JAWABAN KONFIRMASI
===================================================== */

const jawabanFromBackend = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (["diterima", "ya", "yes", "received"].includes(normalized)) {
    return "Diterima";
  }

  if (
    ["belum diterima", "tidak", "no", "not received"].includes(
      normalized
    )
  ) {
    return "Belum Diterima";
  }

  return "";
};

const jawabanToBackend = (value) => {
  if (value === "Diterima") return "diterima";
  if (value === "Belum Diterima") return "belum diterima";
  return "";
};

/* =====================================================
   SELISIH
===================================================== */

const getSelisih = (saldoBukuBesar, saldoJawaban) =>
  toNumber(saldoBukuBesar) - toNumber(saldoJawaban);

/* =====================================================
   SALDO KONFIRMASI TIDAK TERBALAS
   Jika belum diedit, gunakan Saldo Buku Besar.
   Nilai manual, termasuk 0, harus tetap dipertahankan.
===================================================== */

const getKonfirmasiTidakTerbalas = (row) => {
  if (row?.jawabanKonfirmasiDiterima !== "Belum Diterima") {
    return 0;
  }

  return row?.saldoKonfirmasiTidakTerbalas == null
    ? toNumber(row?.saldoBukuBesar)
    : toNumber(row.saldoKonfirmasiTidakTerbalas);
};

/* =====================================================
   CUSTOMER NORMALIZER
===================================================== */

const normalizeKonfirmasi = (item, fallbackSetaraKasId = null) => ({
  id: normalizeId(
    item?.CekSaldoID ?? item?.cek_saldo_id ?? item?.id
  ),

  setaraKasId: normalizeId(
    item?.SetaraKasID ?? fallbackSetaraKasId
  ),

  namaCustomer: item?.NamaBank ?? item?.namaBank ?? "",

  jumlah: toNumber(
    item?.SaldoBukuBesar ??
      item?.saldoBukuBesar ??
      item?.SaldoBB ??
      item?.saldoBB
  ),
});

/* =====================================================
   REKAP NORMALIZER
===================================================== */

const normalizeRekap = (item, fallbackSetaraKasId = null) => {
  const cekSaldo =
    item?.cek_saldo_setara_kas ??
    item?.cekSaldoSetaraKas ??
    null;

  const statusBackend =
    item?.StatusKonfirmasi ?? item?.status_konfirmasi;

  const jawaban = jawabanFromBackend(statusBackend);

  const saldoBukuBesar = toNumber(
    cekSaldo?.SaldoBukuBesar ??
      cekSaldo?.saldoBukuBesar ??
      item?.SaldoBB
  );

  const nilaiKonfirmasiTidakTerbalas =
    item?.KonfirmasiTakTerbalas ??
    item?.konfirmasiTakTerbalas;

  return {
    id: item?.RekapBalasanSetaraKasID ?? null,
    rekapId: item?.RekapBalasanSetaraKasID ?? null,
    isNew: false,

    setaraKasId: normalizeId(
      item?.SetaraKasID ?? fallbackSetaraKasId
    ),

    konfirmasiId: normalizeId(item?.CekSaldoSetaraKasID) ?? "",

    nama: cekSaldo?.NamaBank ?? cekSaldo?.namaBank ?? "",

    saldoBukuBesar,

    tanggalKirim: toDateInput(item?.TanggalKirim),
    pengirimanVia: item?.MetodeKirim ?? "",

    jawabanKonfirmasiDiterima: jawaban,

    tanggalJawaban: toDateInput(item?.TanggalJawab),
    saldoJawaban: toNumber(item?.SaldoJawab),

    // Gunakan nilai backend jika tersedia, termasuk 0.
    // Jika belum tersedia, gunakan Saldo Buku Besar.
    saldoKonfirmasiTidakTerbalas:
      jawaban === "Belum Diterima"
        ? nilaiKonfirmasiTidakTerbalas != null
          ? toNumber(nilaiKonfirmasiTidakTerbalas)
          : saldoBukuBesar
        : 0,

    selisih: toNumber(item?.Selisih),

    namaBukti: item?.NamaFile ?? "",
    tipeFile: item?.TipeFile ?? "",
    buktiFile: null,

    statusKonfirmasi: statusFromBackend(statusBackend),
  };
};

/* =====================================================
   JENIS JAWABAN
===================================================== */

const getJenisJawaban = (row) => {
  const status = String(row?.statusKonfirmasi || "")
    .trim()
    .toLowerCase();

  if (status === "tidak terbalas") return "tidak";
  if (status !== "terbalas") return "kosong";

  return toNumber(row.saldoBukuBesar) === toNumber(row.saldoJawaban)
    ? "sesuai"
    : "berbeda";
};

/* =====================================================
   CUSTOM DROPDOWN
===================================================== */

function ForcedDownDropdown({
  value,
  options = [],
  onChange,
  placeholder = "Pilih opsi",
  showCheck = true,
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);

  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const normalizedValue = String(value ?? "");

  const selectedOption = options.find(
    (option) => String(option.value ?? "") === normalizedValue
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const inTrigger = wrapperRef.current?.contains(event.target);
      const inMenu = menuRef.current?.contains(event.target);

      if (!inTrigger && !inMenu) setOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const bounds = triggerRef.current?.getBoundingClientRect();

      if (!bounds) return;

      const gap = 6;
      const availableBelow = Math.max(
        120,
        window.innerHeight - bounds.bottom - gap - 8
      );

      setMenuPosition({
        left: bounds.left,
        top: bounds.bottom + gap,
        width: bounds.width,
        maxHeight: Math.min(288, availableBelow),
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left font-poppins text-sm outline-none transition hover:border-[#38BDF8] focus:border-[#38BDF8] disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-60 ${
          open ? "border-[#38BDF8]" : "border-[#DCE5EF]"
        } ${
          className.includes("!border-green-300") &&
          selectedOption?.value === "Diterima"
            ? "!border-green-300 !bg-green-50 !text-green-700"
            : ""
        } ${
          className.includes("!border-red-300") &&
          selectedOption?.value === "Belum Diterima"
            ? "!border-red-300 !bg-red-50 !text-red-700"
            : ""
        }`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            selectedOption ? "text-[#475569]" : "text-[#94A3B8]"
          } ${
            selectedOption?.value === "Diterima" &&
            className.includes("!border-green-300")
              ? "!text-green-700"
              : ""
          } ${
            selectedOption?.value === "Belum Diterima" &&
            className.includes("!border-red-300")
              ? "!text-red-700"
              : ""
          }`}
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 text-[#64748B] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        !disabled &&
        menuPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: "fixed",
              left: menuPosition.left,
              top: menuPosition.top,
              bottom: "auto",
              width: menuPosition.width,
              maxHeight: menuPosition.maxHeight,
              transform: "none",
            }}
            className="z-[99999] overflow-y-auto rounded-xl border border-[#DCE5EF] bg-white p-2 shadow-lg"
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 font-poppins text-sm text-[#94A3B8]">
                Tidak ada pilihan
              </div>
            ) : (
              options.map((option) => {
                const selected =
                  String(option.value ?? "") === normalizedValue;

                return (
                  <button
                    key={String(option.value ?? "")}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={option.disabled}
                    onClick={() => {
                      if (option.disabled) return;

                      onChange?.(option.value, option);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left font-poppins text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected
                        ? "bg-[#EAF9FF] text-[#38BDF8]"
                        : "text-[#8A8F9D] hover:bg-[#F0FBFF] hover:text-[#38BDF8]"
                    }`}
                  >
                    <span>{option.label}</span>

                    {showCheck && selected && (
                      <Check
                        size={20}
                        strokeWidth={3}
                        className="shrink-0 text-[#38BDF8]"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function RekapBalasanKonfirmasiSetaraKasPage({
  auditId: auditIdProp,
  jwbKasusId: jwbKasusIdProp,
  refetchToken = 0,
  onSaved,
}) {
  const params = useParams();
  const searchParams = useSearchParams();

  const activeJwbKasusId = useMemo(() => {
    const fromProp = normalizeId(auditIdProp ?? jwbKasusIdProp);
    if (fromProp) return fromProp;

    const fromParams = normalizeId(
      params?.JwbKasusID ??
        params?.jwbKasusId ??
        params?.jwb_kasus_id
    );

    if (fromParams) return fromParams;

    const fromId = normalizeId(params?.id);
    if (fromId) return fromId;

    return normalizeId(
      searchParams?.get("JwbKasusID") ??
        searchParams?.get("jwbKasusId") ??
        searchParams?.get("jwb_kasus_id")
    );
  }, [jwbKasusIdProp, params, searchParams]);

  const [setaraKasId, setSetaraKasId] = useState(null);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [dataList, setDataList] = useState([]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingData, setDeletingData] = useState(null);

  const [successAlert, setSuccessAlert] = useState({
    title: "",
    message: "",
  });

  const [errorAlert, setErrorAlert] = useState({
    title: "",
    message: "",
  });

  const fileInputRefs = useRef({});

  const showSuccessAlert = (title, message) => {
    setSuccessAlert({ title, message });
  };

  const showErrorAlert = (title, message) => {
    setErrorAlert({ title, message });
  };

  /* =====================================================
     LOAD PAGE
  ===================================================== */

  const loadPageData = async (activeId) => {
    if (!activeId) {
      setSetaraKasId(null);
      setCustomerOptions([]);
      setDataList([]);
      return null;
    }

    const response = await fetchWithAuth(
      `${API_ENDPOINT}?_=${Date.now()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const result = await parseResponse(response);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthenticated. Silakan login kembali.");
      }

      throw new Error(
        getApiError(result, "Gagal mengambil data Rekap Balasan.")
      );
    }

    const setaraKasRows = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : [];

    const activeSetaraKas =
      setaraKasRows.find((item) => {
        const itemJwbKasusId = normalizeId(
          item?.JwbKasusID ??
            item?.jwb_kasus_id ??
            item?.jwbKasusId
        );

        return String(itemJwbKasusId) === String(activeId);
      }) ?? null;

    if (!activeSetaraKas) {
      const emptyData = {
        setaraKasId: null,
        customerOptions: [],
        dataList: [],
      };

      rekapBalasanSetaraKasPageCache.set(String(activeId), emptyData);

      setSetaraKasId(null);
      setCustomerOptions([]);
      setDataList([]);

      return emptyData;
    }

    const activeSetaraKasId = normalizeId(
      activeSetaraKas?.SetaraKasID ?? activeSetaraKas?.id
    );

    const rawAllCustomers = Array.isArray(
      activeSetaraKas?.cek_saldo_setara_kas
    )
      ? activeSetaraKas.cek_saldo_setara_kas
      : Array.isArray(activeSetaraKas?.cekSaldoSetaraKas)
        ? activeSetaraKas.cekSaldoSetaraKas
        : [];

    const rawAvailableCustomers = Array.isArray(
      activeSetaraKas?.cek_saldo_setara_kas_tersedia
    )
      ? activeSetaraKas.cek_saldo_setara_kas_tersedia
      : Array.isArray(activeSetaraKas?.cekSaldoSetaraKasTersedia)
        ? activeSetaraKas.cekSaldoSetaraKasTersedia
        : [];

    const rawRekap = Array.isArray(activeSetaraKas?.rekap_balasan)
      ? activeSetaraKas.rekap_balasan
      : Array.isArray(activeSetaraKas?.rekapBalasan)
        ? activeSetaraKas.rekapBalasan
        : [];

    const customerMap = new Map();

    const addCustomerToMap = (item) => {
      if (!item) return;

      const normalized = normalizeKonfirmasi(item, activeSetaraKasId);

      if (!normalized.id || !normalized.namaCustomer) return;

      customerMap.set(String(normalized.id), normalized);
    };

    rawAllCustomers.forEach(addCustomerToMap);
    rawAvailableCustomers.forEach(addCustomerToMap);

    rawRekap.forEach((rekapItem) => {
      const nestedCustomer =
        rekapItem?.cek_saldo_setara_kas ??
        rekapItem?.cekSaldoSetaraKas ??
        null;

      addCustomerToMap(nestedCustomer);
    });

    const allCustomers = Array.from(customerMap.values());

    const normalizedRekap = rawRekap.map((item) => ({
      ...normalizeRekap(item, activeSetaraKasId),
      setaraKasId: activeSetaraKasId,
    }));

    const nextData = {
      setaraKasId: activeSetaraKasId,
      customerOptions: allCustomers,
      dataList: normalizedRekap,
    };

    rekapBalasanSetaraKasPageCache.set(String(activeId), nextData);

    setSetaraKasId(activeSetaraKasId);
    setCustomerOptions(allCustomers);
    setDataList(normalizedRekap);

    return nextData;
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!activeJwbKasusId) {
        setSetaraKasId(null);
        setCustomerOptions([]);
        setDataList([]);
        return;
      }

      const cached = rekapBalasanSetaraKasPageCache.get(
        String(activeJwbKasusId)
      );

      if (cached) {
        setSetaraKasId(cached.setaraKasId || null);
        setCustomerOptions(cached.customerOptions || []);
        setDataList(cached.dataList || []);
      }

      try {
        await loadPageData(activeJwbKasusId);
      } catch (error) {
        console.error("LOAD REKAP ERROR:", error);

        if (cancelled) return;

        if (!cached) {
          setSetaraKasId(null);
          setCustomerOptions([]);
          setDataList([]);
        }

        showErrorAlert(
          "Gagal Memuat Data",
          error?.message || "Data Rekap Balasan gagal dimuat."
        );
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeJwbKasusId, refetchToken]);

  /* =====================================================
     CACHE SYNC
  ===================================================== */

  useEffect(() => {
    if (!activeJwbKasusId) return;

    rekapBalasanSetaraKasPageCache.set(
      String(activeJwbKasusId),
      {
        setaraKasId,
        customerOptions,
        dataList,
      }
    );
  }, [activeJwbKasusId, setaraKasId, customerOptions, dataList]);

  /* =====================================================
     FILTER
  ===================================================== */

  const [filterJawaban, setFilterJawaban] = useState("semua");

  const filteredData = useMemo(() => {
    if (filterJawaban === "diterima") {
      return dataList.filter(
        (row) => row.jawabanKonfirmasiDiterima === "Diterima"
      );
    }

    if (filterJawaban === "belum_diterima") {
      return dataList.filter(
        (row) => row.jawabanKonfirmasiDiterima === "Belum Diterima"
      );
    }

    return dataList;
  }, [dataList, filterJawaban]);

  /* =====================================================
     TOTAL
  ===================================================== */

  const totalSaldoJawaban = useMemo(
    () =>
      dataList.reduce(
        (total, row) => total + toNumber(row.saldoJawaban),
        0
      ),
    [dataList]
  );

  /* =====================================================
     PERCENTAGE
  ===================================================== */

  const percentage = useMemo(() => {
    const total = dataList.length;

    if (!total) {
      return {
        sesuai: "0.00",
        berbeda: "0.00",
        tidak: "0.00",
      };
    }

    const sesuai = dataList.filter(
      (row) => getJenisJawaban(row) === "sesuai"
    ).length;

    const berbeda = dataList.filter(
      (row) => getJenisJawaban(row) === "berbeda"
    ).length;

    const tidak = dataList.filter(
      (row) => getJenisJawaban(row) === "tidak"
    ).length;

    return {
      sesuai: ((sesuai / total) * 100).toFixed(2),
      berbeda: ((berbeda / total) * 100).toFixed(2),
      tidak: ((tidak / total) * 100).toFixed(2),
    };
  }, [dataList]);

  /* =====================================================
     UPDATE ROW
  ===================================================== */

  const updateRow = (rowId, field, value) => {
    setDataList((previous) =>
      previous.map((row) =>
        String(row.id) === String(rowId)
          ? { ...row, [field]: value }
          : row
      )
    );
  };

  /* =====================================================
     CUSTOMER OPTIONS PER ROW
  ===================================================== */

  const getCustomerOptionsForRow = (currentRow) => {
    const options = customerOptions.map((customer) => ({ ...customer }));

    if (currentRow.konfirmasiId && currentRow.nama) {
      const alreadyExists = options.some(
        (customer) =>
          String(customer.id) === String(currentRow.konfirmasiId)
      );

      if (!alreadyExists) {
        options.unshift({
          id: currentRow.konfirmasiId,
          setaraKasId: currentRow.setaraKasId,
          namaCustomer: currentRow.nama,
          jumlah: toNumber(currentRow.saldoBukuBesar),
        });
      }
    }

    return options;
  };

  /* =====================================================
     CUSTOMER CHANGE
  ===================================================== */

  const handleCustomerChange = (rowId, customerId) => {
    const currentRow = dataList.find(
      (row) => String(row.id) === String(rowId)
    );

    if (!currentRow) return;

    if (!customerId) {
      setDataList((previous) =>
        previous.map((row) =>
          String(row.id) === String(rowId)
            ? {
                ...row,
                konfirmasiId: "",
                nama: "",
                saldoBukuBesar: 0,
                saldoKonfirmasiTidakTerbalas: null,
              }
            : row
        )
      );

      return;
    }

    const selectedCustomer = getCustomerOptionsForRow(
      currentRow
    ).find(
      (customer) => String(customer.id) === String(customerId)
    );

    if (!selectedCustomer) {
      showErrorAlert(
        "Customer Tidak Ditemukan",
        "Data customer tidak tersedia atau sudah digunakan."
      );

      return;
    }

    setDataList((previous) =>
      previous.map((row) => {
        if (String(row.id) !== String(rowId)) return row;

        const saldoBaru = toNumber(selectedCustomer.jumlah);

        return {
          ...row,
          konfirmasiId: selectedCustomer.id,
          nama: selectedCustomer.namaCustomer,
          saldoBukuBesar: saldoBaru,
          setaraKasId,

          // Jika jawaban sudah Belum Diterima,
          // bank yang baru dipilih memakai saldo bank tersebut.
          // Jika belum memilih jawaban, nilai tetap belum ditentukan.
          saldoKonfirmasiTidakTerbalas:
            row.jawabanKonfirmasiDiterima === "Belum Diterima"
              ? saldoBaru
              : null,
        };
      })
    );
  };

  /* =====================================================
     ADD DATA
  ===================================================== */

  const handleAddData = () => {
    const activeSetaraKasId = normalizeId(setaraKasId);

    const newData = {
      id: `temp-${Date.now()}`,
      rekapId: null,
      isNew: true,

      setaraKasId: activeSetaraKasId,
      konfirmasiId: "",
      nama: "",
      saldoBukuBesar: 0,

      tanggalKirim: "",
      pengirimanVia: "",

      jawabanKonfirmasiDiterima: "",
      tanggalJawaban: "",
      saldoJawaban: 0,

      saldoKonfirmasiTidakTerbalas: null,
      selisih: 0,

      namaBukti: "",
      tipeFile: "",
      buktiFile: null,

      statusKonfirmasi: "",
    };

    setDataList((previous) => [...previous, newData]);
  };

  /* =====================================================
     FILE SELECT
  ===================================================== */

  const handleFileSelected = (rowId, event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      showErrorAlert(
        "Ukuran File Terlalu Besar",
        "Ukuran file maksimal 10MB."
      );

      event.target.value = "";
      return;
    }

    setDataList((previous) =>
      previous.map((row) =>
        String(row.id) === String(rowId)
          ? {
              ...row,
              buktiFile: file,
              namaBukti: file.name,
              tipeFile: file.type || "application/octet-stream",
            }
          : row
      )
    );
  };

  /* =====================================================
     VIEW FILE
  ===================================================== */

  const handleViewBukti = async (row) => {
    if (
      typeof File !== "undefined" &&
      row?.buktiFile instanceof File
    ) {
      const url = URL.createObjectURL(row.buktiFile);

      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => URL.revokeObjectURL(url), 10000);
      return;
    }

    if (!row?.rekapId) {
      showErrorAlert(
        "Bukti Tidak Tersedia",
        "File bukti belum tersimpan."
      );

      return;
    }

    try {
      const response = await fetchWithAuth(
        `${API_ENDPOINT}/${encodeURIComponent(row.rekapId)}/file`,
        { method: "GET" }
      );

      if (!response.ok) {
        let result = null;

        try {
          result = await parseResponse(response);
        } catch {
          result = null;
        }

        throw new Error(
          getApiError(result, "File bukti tidak dapat dibuka.")
        );
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error("File bukti kosong.");
      }

      const url = URL.createObjectURL(blob);

      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("VIEW FILE ERROR:", error);

      showErrorAlert(
        "Gagal Membuka Bukti",
        error?.message || "File bukti gagal dibuka."
      );
    }
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateFinalCustomerState = (rows) => {
    const seen = new Set();

    for (const row of rows) {
      const rowSetaraKasId = normalizeId(row.setaraKasId);
      const customerId = normalizeId(row.konfirmasiId);

      if (!customerId) {
        return {
          valid: false,
          message:
            "Masih ada baris yang belum memilih Nama Customer.",
        };
      }

      const key = `${rowSetaraKasId}:${customerId}`;

      if (seen.has(key)) {
        return {
          valid: false,
          message:
            "Nama Customer yang sama tidak boleh digunakan pada lebih dari satu baris.",
        };
      }

      seen.add(key);
    }

    return { valid: true, message: "" };
  };

  /* =====================================================
     BUILD FORM DATA
  ===================================================== */

  const buildBulkSaveFormData = (rows, activeSetaraKasId) => {
    const form = new FormData();

    rows.forEach((row, index) => {
      const prefix = `data[${index}]`;

      if (row.rekapId) {
        form.append(
          `${prefix}[RekapBalasanSetaraKasID]`,
          String(row.rekapId)
        );
      }

      const rowSetaraKasId =
        normalizeId(row.setaraKasId) || activeSetaraKasId;

      form.append(
        `${prefix}[SetaraKasID]`,
        String(rowSetaraKasId)
      );

      if (row.konfirmasiId) {
        form.append(
          `${prefix}[CekSaldoSetaraKasID]`,
          String(row.konfirmasiId)
        );
      }

      form.append(
        `${prefix}[SaldoBB]`,
        String(toNumber(row.saldoBukuBesar))
      );

      // Simpan nilai manual jika Belum Diterima.
      // Nilai 0 tetap sah dan tidak diganti dengan SaldoBB.
      form.append(
        `${prefix}[KonfirmasiTakTerbalas]`,
        String(
          row.jawabanKonfirmasiDiterima === "Belum Diterima"
            ? getKonfirmasiTidakTerbalas(row)
            : 0
        )
      );

      if (row.tanggalKirim) {
        form.append(`${prefix}[TanggalKirim]`, row.tanggalKirim);
      }

      const metodeKirim = String(row.pengirimanVia || "").trim();

      if (metodeKirim) {
        form.append(`${prefix}[MetodeKirim]`, metodeKirim);
      }

      const backendStatusKonfirmasi = jawabanToBackend(
        row.jawabanKonfirmasiDiterima
      );

      if (backendStatusKonfirmasi) {
        form.append(
          `${prefix}[StatusKonfirmasi]`,
          backendStatusKonfirmasi
        );
      }

      if (row.tanggalJawaban) {
        form.append(`${prefix}[TanggalJawab]`, row.tanggalJawaban);
      }

      form.append(
        `${prefix}[SaldoJawab]`,
        String(toNumber(row.saldoJawaban))
      );

      // Selisih dihitung oleh backend.

      if (
        typeof File !== "undefined" &&
        row.buktiFile instanceof File
      ) {
        form.append(
          `${prefix}[FileBukti]`,
          row.buktiFile,
          row.buktiFile.name
        );
      }
    });

    return form;
  };

  /* =====================================================
     BULK SAVE
  ===================================================== */

  const bulkSaveRekap = async (rows, activeSetaraKasId) => {
    const form = buildBulkSaveFormData(rows, activeSetaraKasId);

    const response = await fetchWithAuth(BULK_SAVE_ENDPOINT, {
      method: "POST",
      body: form,
    });

    const result = await parseResponse(response);

    if (!response.ok || result?.success === false) {
      throw new Error(
        getApiError(
          result,
          "Rekap Balasan Konfirmasi Setara Kas gagal disimpan."
        )
      );
    }

    return result;
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = async () => {
    if (saving) return;

    if (dataList.length === 0) {
      showErrorAlert(
        "Data Kosong",
        "Belum ada data Rekap Balasan Konfirmasi Setara Kas."
      );
      return;
    }

    const activeSetaraKasId = normalizeId(setaraKasId);

    if (!activeSetaraKasId) {
      showErrorAlert(
        "Setara Kas Tidak Ditemukan",
        "Data Setara Kas untuk tugas ini tidak ditemukan."
      );
      return;
    }

    if (dataList.some((row) => !row.konfirmasiId)) {
      showErrorAlert(
        "Data Belum Lengkap",
        "Masih ada baris yang belum memilih Nama Customer."
      );
      return;
    }

    const finalCustomerValidation =
      validateFinalCustomerState(dataList);

    if (!finalCustomerValidation.valid) {
      showErrorAlert(
        "Customer Tidak Valid",
        finalCustomerValidation.message
      );
      return;
    }

    if (dataList.some((row) => !row.tanggalKirim)) {
      showErrorAlert(
        "Data Belum Lengkap",
        "Tanggal Kirim wajib diisi pada setiap baris."
      );
      return;
    }

    if (
      dataList.some(
        (row) => !String(row.pengirimanVia || "").trim()
      )
    ) {
      showErrorAlert(
        "Data Belum Lengkap",
        "Pengiriman Via wajib diisi pada setiap baris."
      );
      return;
    }

    if (
      dataList.some((row) => !row.jawabanKonfirmasiDiterima)
    ) {
      showErrorAlert(
        "Data Belum Lengkap",
        "Jawaban Konfirmasi wajib dipilih pada setiap baris."
      );
      return;
    }

    try {
      setSaving(true);

      const result = await bulkSaveRekap(
        dataList,
        activeSetaraKasId
      );

      await loadPageData(activeJwbKasusId);

      onSaved?.();

      showSuccessAlert(
        "Berhasil Disimpan",
        result?.message ||
          "Rekap Balasan Konfirmasi Setara Kas berhasil disimpan."
      );
    } catch (error) {
      console.error("SAVE REKAP ERROR:", error);

      showErrorAlert(
        "Gagal Menyimpan",
        error?.message || "Data gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const openDeleteModal = (row) => {
    setDeletingData(row);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingData || deleting) return;

    try {
      setDeleting(true);

      if (!deletingData.rekapId) {
        setDataList((previous) =>
          previous.filter(
            (row) => String(row.id) !== String(deletingData.id)
          )
        );

        setDeleteModalOpen(false);
        setDeletingData(null);
        return;
      }

      const response = await fetchWithAuth(
        `${API_ENDPOINT}/${encodeURIComponent(deletingData.rekapId)}`,
        { method: "DELETE" }
      );

      const result = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getApiError(result, "Data gagal dihapus.")
        );
      }

      await loadPageData(activeJwbKasusId);

      setDeleteModalOpen(false);
      setDeletingData(null);

      showSuccessAlert(
        "Berhasil Dihapus",
        "Data Rekap berhasil dihapus."
      );
    } catch (error) {
      console.error("DELETE REKAP ERROR:", error);

      showErrorAlert(
        "Gagal Menghapus",
        error?.message || "Data gagal dihapus."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="font-poppins text-[#334155]">
      <AlertSuccess
        title={successAlert.title}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ title: "", message: "" })}
      />

      <AlertError
        title={errorAlert.title}
        message={errorAlert.message}
        onClose={() => setErrorAlert({ title: "", message: "" })}
      />

      <ConfirmationPopup
        isOpen={deleteModalOpen}
        message="Apakah Anda yakin ingin menghapus data Rekap Balasan Konfirmasi Setara Kas?"
        subText={deletingData?.nama || ""}
        confirmText={deleting ? "Menghapus..." : "Hapus"}
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (deleting) return;

          setDeleteModalOpen(false);
          setDeletingData(null);
        }}
      />

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">
        {/* FILTER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-[220px]">
            <ForcedDownDropdown
              value={filterJawaban}
              onChange={setFilterJawaban}
              placeholder="Semua Konfirmasi"
              showCheck={false}
              options={[
                { value: "semua", label: "Semua Konfirmasi" },
                { value: "diterima", label: "Diterima" },
                {
                  value: "belum_diterima",
                  label: "Belum Diterima",
                },
              ]}
              className="
                [&>button]:!h-12
                [&>button]:!min-h-12
                [&>button]:!px-4
                [&>button]:!rounded-xl
                [&>button]:!text-sm
              "
            />
          </div>
        </div>

        {/* TABLE */}

        <div className="mt-4 overflow-x-auto rounded-xl border border-[#DCE5EF]">
          <table className="w-full min-w-[1900px] border-collapse">
            <thead className="bg-[#F8FAFC]">
              <tr>
                {[
                  "No",
                  "Nama Bank",
                  "Saldo Buku Besar",
                  "Tanggal Kirim",
                  "Konfirmasi Dikirim Via",
                  "Jawaban Konfirmasi",
                  "Tanggal Jawaban Diterima",
                  "Saldo Konfirmasi Diterima",
                  "Selisih",
                  "Saldo Konfirmasi Tidak Terbalas",
                  "Bukti",
                  "Aksi",
                ].map((header) => (
                  <th
                    key={header}
                    className="border-b border-[#DCE5EF] px-3 py-3 text-left font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]"
                  >
                    Belum ada data untuk rekap balasan konfirmasi.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => {
                  const selisih =
                    row.jawabanKonfirmasiDiterima === "Diterima"
                      ? getSelisih(
                          row.saldoBukuBesar,
                          row.saldoJawaban
                        )
                      : 0;

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[#EDF2F7]"
                    >
                      {/* NO */}

                      <td className="px-3 py-2 font-poppins text-sm text-[#475569]">
                        {index + 1}
                      </td>

                      {/* NAMA BANK */}

                      <td className="min-w-[230px] px-3 py-2">
                        <ForcedDownDropdown
                          value={row.konfirmasiId || ""}
                          placeholder="Pilih Bank"
                          showCheck={false}
                          options={[
                            { value: "", label: "Pilih Bank" },
                            ...getCustomerOptionsForRow(row).map(
                              (customer) => ({
                                value: customer.id,
                                label: customer.namaCustomer,
                              })
                            ),
                          ]}
                          onChange={(value) =>
                            handleCustomerChange(row.id, value)
                          }
                          className="
                            [&>button]:h-10
                            [&>button]:min-h-10
                            [&>button]:rounded-xl
                            [&>button]:px-3
                          "
                        />
                      </td>

                      {/* SALDO BUKU BESAR */}

                      <td className="min-w-[190px] px-3 py-2">
                        <div className="inline-flex h-10 min-w-[190px] items-center whitespace-nowrap rounded-xl border border-[#DCE5EF] bg-[#F1F5F9] px-3">
                          <span className="shrink-0 font-poppins text-sm text-[#64748B]">
                            Rp
                          </span>

                          <input
                            type="text"
                            value={formatNumber(row.saldoBukuBesar)}
                            readOnly
                            aria-label="Saldo Buku Besar"
                            title="Saldo Buku Besar diambil otomatis dari data bank yang dipilih"
                            className="min-w-0 w-full cursor-default bg-transparent pl-3 text-left font-poppins text-sm text-[#64748B] outline-none"
                          />
                        </div>
                      </td>

                      {/* TANGGAL KIRIM */}

                      <td className="min-w-[170px] px-3 py-2">
                        <TanggalIndonesia
                          value={row.tanggalKirim || ""}
                          onChange={(value) =>
                            updateRow(row.id, "tanggalKirim", value)
                          }
                          ariaLabel="Tanggal Kirim"
                        />
                      </td>

                      {/* PENGIRIMAN VIA */}

                      <td className="min-w-[180px] px-3 py-2">
                        <input
                          type="text"
                          value={row.pengirimanVia || ""}
                          placeholder="Via pengiriman"
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "pengirimanVia",
                              event.target.value
                            )
                          }
                          className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition focus:border-[#38BDF8]"
                        />
                      </td>

                      {/* JAWABAN KONFIRMASI */}

                      <td className="min-w-[230px] px-3 py-2">
                        <ForcedDownDropdown
                          value={row.jawabanKonfirmasiDiterima || ""}
                          onChange={(value) => {
                            setDataList((previous) =>
                              previous.map((item) => {
                                if (
                                  String(item.id) !== String(row.id)
                                ) {
                                  return item;
                                }

                                const isBelumDiterima =
                                  value === "Belum Diterima";

                                const sebelumnyaBelumDiterima =
                                  item.jawabanKonfirmasiDiterima ===
                                  "Belum Diterima";

                                return {
                                  ...item,

                                  jawabanKonfirmasiDiterima: value,

                                  statusKonfirmasi:
                                    value === "Diterima"
                                      ? "Terbalas"
                                      : isBelumDiterima
                                        ? "Tidak Terbalas"
                                        : "",

                                  tanggalJawaban: "",
                                  saldoJawaban: 0,

                                  saldoKonfirmasiTidakTerbalas:
                                    isBelumDiterima
                                      ? sebelumnyaBelumDiterima
                                        ? item.saldoKonfirmasiTidakTerbalas ??
                                          toNumber(item.saldoBukuBesar)
                                        : toNumber(item.saldoBukuBesar)
                                      : 0,
                                };
                              })
                            );
                          }}
                          placeholder="Pilih Jawaban"
                          showCheck={false}
                          options={[
                            {
                              value: "Diterima",
                              label: "Diterima",
                            },
                            {
                              value: "Belum Diterima",
                              label: "Belum Diterima",
                            },
                          ]}
                          className={`
                            [&>button]:h-10
                            [&>button]:min-h-10
                            [&>button]:rounded-xl
                            [&>button]:px-3
                            ${
                              row.jawabanKonfirmasiDiterima ===
                              "Diterima"
                                ? "[&>button]:!border-green-300 [&>button]:!bg-green-50 [&>button]:!text-green-700"
                                : row.jawabanKonfirmasiDiterima ===
                                    "Belum Diterima"
                                  ? "[&>button]:!border-red-300 [&>button]:!bg-red-50 [&>button]:!text-red-700"
                                  : ""
                            }
                          `}
                        />
                      </td>

                      {/* TANGGAL JAWABAN */}

                      <td className="min-w-[170px] px-3 py-2">
                        <TanggalIndonesia
                          value={row.tanggalJawaban || ""}
                          disabled={
                            row.jawabanKonfirmasiDiterima !==
                            "Diterima"
                          }
                          onChange={(value) =>
                            updateRow(row.id, "tanggalJawaban", value)
                          }
                          ariaLabel="Tanggal Jawaban Diterima"
                        />
                      </td>

                      {/* SALDO KONFIRMASI DITERIMA */}

                      <td className="px-3 py-2">
                        <div
                          className={`inline-flex min-w-[190px] w-max max-w-none h-10 items-center whitespace-nowrap rounded-xl border px-3 transition ${
                            row.jawabanKonfirmasiDiterima ===
                            "Belum Diterima"
                              ? "border-[#DCE5EF] bg-[#F1F5F9] cursor-not-allowed"
                              : "border-[#DCE5EF] bg-white focus-within:border-[#38BDF8]"
                          }`}
                        >
                          <span className="shrink-0 font-poppins text-sm text-[#64748B]">
                            Rp
                          </span>

                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatNumber(row.saldoJawaban)}
                            disabled={
                              row.jawabanKonfirmasiDiterima ===
                              "Belum Diterima"
                            }
                            onChange={(event) =>
                              updateRow(
                                row.id,
                                "saldoJawaban",
                                parseNumber(event.target.value)
                              )
                            }
                            className={`[field-sizing:content] min-w-[80px] max-w-none shrink-0 bg-transparent pl-3 text-left font-poppins text-sm outline-none ${
                              row.jawabanKonfirmasiDiterima ===
                              "Belum Diterima"
                                ? "text-[#94A3B8] cursor-not-allowed"
                                : "text-[#475569]"
                            }`}
                          />
                        </div>
                      </td>

                      {/* SELISIH */}

                      <td className="min-w-[220px] px-3 py-2">
                        <div className="inline-flex h-10 min-w-[220px] items-center whitespace-nowrap rounded-xl border border-[#DCE5EF] bg-[#F1F5F9] px-3">
                          <span className="shrink-0 font-poppins text-sm text-[#64748B]">
                            Rp
                          </span>

                          <input
                            type="text"
                            value={formatNumber(selisih)}
                            readOnly
                            aria-label="Selisih"
                            title="Selisih dihitung oleh backend saat data disimpan"
                            className="min-w-0 w-full bg-transparent pl-3 text-left font-poppins text-sm text-[#64748B] outline-none disabled:cursor-not-allowed"
                          />
                        </div>
                      </td>

                      {/* SALDO KONFIRMASI TIDAK TERBALAS */}

                      <td className="min-w-[220px] px-3 py-2">
                        <div
                          className={`inline-flex h-10 min-w-[220px] items-center whitespace-nowrap rounded-xl border border-[#DCE5EF] px-3 ${
                            row.jawabanKonfirmasiDiterima ===
                            "Belum Diterima"
                              ? "bg-white focus-within:border-[#38BDF8]"
                              : "bg-[#F1F5F9]"
                          }`}
                        >
                          <span className="shrink-0 font-poppins text-sm text-[#64748B]">
                            Rp
                          </span>

                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatNumber(
                              getKonfirmasiTidakTerbalas(row)
                            )}
                            disabled={
                              row.jawabanKonfirmasiDiterima !==
                              "Belum Diterima"
                            }
                            onChange={(event) =>
                              updateRow(
                                row.id,
                                "saldoKonfirmasiTidakTerbalas",
                                parseNumber(event.target.value)
                              )
                            }
                            aria-label="Saldo Konfirmasi Tidak Terbalas"
                            className="min-w-0 w-full bg-transparent pl-3 text-left font-poppins text-sm text-[#475569] outline-none disabled:cursor-not-allowed disabled:text-[#94A3B8]"
                          />
                        </div>
                      </td>

                      
                        {/* BUKTI */}

                        <td className="min-w-[100px] px-3 py-2">
                          {row.jawabanKonfirmasiDiterima === "Diterima" && (
                            <>
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="hidden"
                                ref={(element) => {
                                  fileInputRefs.current[row.id] = element;
                                }}
                                onChange={(event) =>
                                  handleFileSelected(row.id, event)
                                }
                              />

                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  title="Pilih file bukti"
                                  onClick={() =>
                                    fileInputRefs.current[row.id]?.click()
                                  }
                                  className="font-poppins text-sm font-medium text-[#38BDF8] transition hover:underline"
                                >
                                  File
                                </button>

                                {(row.buktiFile instanceof File ||
                                  row.namaBukti) && (
                                  <button
                                    type="button"
                                    title="Lihat file"
                                    onClick={() => handleViewBukti(row)}
                                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#38BDF8] transition hover:bg-[#F1F5F9]"
                                  >
                                    <Eye size={16} />
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </td>


                      {/* AKSI */}

                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            title="Hapus"
                            onClick={() => openDeleteModal(row)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition duration-200 hover:bg-red-50 hover:text-red-600 active:scale-90"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* TOTAL */}

            {dataList.length > 0 && (
              <tfoot>
                <tr className="border-t border-[#DCE5EF] bg-[#F8FAFC]">
                  <td />
                  <td className="px-3 py-4 font-poppins text-sm font-bold text-[#1E293B]">
                    Total
                  </td>
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td className="px-3 py-4 text-left font-poppins text-sm font-bold text-[#1E293B]">
                    {formatNumber(totalSaldoJawaban)}
                  </td>
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* TAMBAH DATA */}

        <div className="mt-4 flex justify-center">
          <AddDataButton
            onClick={handleAddData}
            disabled={saving}
            label="Tambah Data"
          />
        </div>

        {/* SUMMARY DAN SIMPAN */}

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full max-w-[470px] rounded-xl border border-[#DCE5EF] bg-white p-4">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3 font-poppins text-sm font-semibold text-[#475569]">
              <span>Konfirmasi Dijawab Sesuai</span>
              <span>:</span>
              <span>{percentage.sesuai} %</span>

              <span>Konfirmasi Dijawab Berbeda</span>
              <span>:</span>
              <span>{percentage.berbeda} %</span>

              <span>Konfirmasi Tidak Terbalas</span>
              <span>:</span>
              <span>{percentage.tidak} %</span>
            </div>
          </div>

          <SaveButton
            onClick={handleSave}
            disabled={saving}
            isSaving={saving}
            label="Simpan"
            savingLabel="Menyimpan..."
          />
        </div>
      </div>
    </div>
  );
}