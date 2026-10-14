
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Trash2,
  Check,
} from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import Dropdown from "@/components/ui/dropdown/dropdown";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const API_ENDPOINT = `${API_URL}/api/rekap-balasan-aset-lain`;
const BULK_SAVE_ENDPOINT = `${API_ENDPOINT}/bulk-save`;

const pageCache = new Map();


const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token login tidak ditemukan. Silakan login kembali.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  if (
    options.body &&
    !(typeof FormData !== "undefined" && options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, { ...options, headers });
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function getApiError(result, fallback) {
  if (result?.errors && typeof result.errors === "object") {
    const firstError = Object.values(result.errors).flat().find(Boolean);
    if (firstError) return String(firstError);
  }

  return result?.message || result?.error || result?.raw || fallback;
}

function normalizeId(value) {
  if (value === null || value === undefined || value === "") return null;

  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const cleaned = String(value).replace(/[^\d-]/g, "");
  if (!cleaned || cleaned === "-") return 0;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(toNumber(value));

const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

const statusFromBackend = (value) => {
  const status = String(value || "").trim().toLowerCase();

  if (status === "terbalas") return "Terbalas";
  if (status === "tidak terbalas") return "Tidak Terbalas";

  return "";
};

const statusToBackend = (value) => {
  const status = String(value || "").trim().toLowerCase();

  if (status === "terbalas") return "terbalas";
  if (status === "tidak terbalas") return "tidak terbalas";

  return "";
};

const getSelisih = (saldoBB, saldoJawaban) =>
  toNumber(saldoBB) - toNumber(saldoJawaban);

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");



function CustomerDropdown({
  value,
  options = [],
  onChange,
  placeholder = "Pilih Customer",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const normalizedValue =
    value === null || value === undefined ? "" : String(value);

  const normalizedOptions = options.map((option) => {
    if (typeof option === "string") {
      return { value: option, label: option };
    }

    return {
      value: String(option.value ?? ""),
      label: option.label ?? option.value ?? "",
      disabled: option.disabled ?? false,
    };
  });

  const selectedOption = normalizedOptions.find(
    (option) => option.value === normalizedValue
  );

  useEffect(() => {
    setMounted(true);
  }, []);

 const updateMenuPosition = useCallback(() => {
  const bounds = triggerRef.current?.getBoundingClientRect();

  if (!bounds) return;

  const gap = 6;
  const spaceBelow = window.innerHeight - bounds.bottom - gap;

  setMenuPosition({
    left: bounds.left,
    top: bounds.bottom + gap,
    bottom: undefined,
    width: bounds.width,
    maxHeight: Math.max(60, Math.min(288, spaceBelow)),
  });
}, []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  const handleSelect = (option) => {
    if (option.disabled) return;

    onChange(option.value);
    setOpen(false);
  };

  const dropdownMenu =
    mounted && open && !disabled && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label={placeholder}
            style={{
              position: "fixed",
              left: menuPosition.left,
              top: menuPosition.top,
              bottom: menuPosition.bottom,
              width: menuPosition.width,
              maxHeight: menuPosition.maxHeight,
              zIndex: 99999,
            }}
            className="
              overflow-y-auto overscroll-contain
              rounded-xl border border-[#DCE5EF]
              bg-white p-2
              shadow-lg
            "
          >
            <button
              type="button"
              role="option"
              aria-selected={!normalizedValue}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="
                flex w-full items-center justify-between
                rounded-lg px-3 py-3 text-left
                font-poppins text-sm
                text-[#8A8F9D] transition
                hover:bg-[#F0FBFF] hover:text-[#38BDF8]
              "
            >
              <span>{placeholder}</span>
            </button>

            {normalizedOptions.map((option) => {
              const isSelected =
                option.value === normalizedValue;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={`
                    flex w-full items-center justify-between
                    rounded-lg px-3 py-3 text-left
                    font-poppins text-sm transition
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    ${
                      isSelected
                        ? "bg-[#EAF9FF] text-[#38BDF8]"
                        : "text-[#8A8F9D] hover:bg-[#F0FBFF] hover:text-[#38BDF8]"
                    }
                  `}
                >
                  <span className="min-w-0 break-words">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
        ref={dropdownRef}
        className="relative w-full"
      >
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (!open) {
              updateMenuPosition();
              setOpen(true);
            } else {
              setOpen(false);
            }
          }}
          className="
            flex min-h-10 w-full items-center
            justify-between gap-3 rounded-lg
            border border-[#DCE5EF] bg-white px-4
            text-left font-poppins text-sm
            text-[#596275] outline-none transition
            hover:border-[#38BDF8]
            focus:border-[#38BDF8]
            disabled:cursor-not-allowed
            disabled:bg-[#F8FAFC]
            disabled:opacity-60
          "
        >
          <span
            className={
              selectedOption
                ? "min-w-0 truncate text-[#475569]"
                : "min-w-0 truncate text-[#94A3B8]"
            }
          >
            {selectedOption?.label ?? placeholder}
          </span>

          <ChevronDown
            size={17}
            className={`
              shrink-0 text-[#64748B]
              transition-transform
              ${open ? "rotate-180" : ""}
            `}
          />
        </button>
      </div>

      {dropdownMenu}
    </>
  );
}



function normalizeKonfirmasi(item, fallbackAsetLainId = null) {
  return {
    id: normalizeId(
      item?.KonfirmasiAsetLainID ??
        item?.konfirmasi_aset_lain_id ??
        item?.id
    ),
    asetLainId: normalizeId(
      item?.AsetLainID ?? fallbackAsetLainId
    ),
    namaCustomer:
      item?.NamaCustomer ??
      item?.namaCustomer ??
      item?.nama_customer ??
      "",
    jumlah: toNumber(
      item?.Jumlah ?? item?.Saldo ?? item?.jumlah
    ),
    kotaCustomer:
      item?.KotaCustomer ??
      item?.kotaCustomer ??
      "",
  };
}

function normalizeRekap(item, fallbackAsetLainId = null) {
  const konfirmasi =
    item?.konfirmasiAsetLain ??
    item?.konfirmasi_aset_lain ??
    null;

  const saldoBBRaw =
    item?.SaldoBB ??
    konfirmasi?.Jumlah ??
    konfirmasi?.Saldo ??
    0;

  const saldoJawaban = toNumber(item?.SaldoJawab);

  const rekapId = normalizeId(
    item?.RekapBalasanAsetLainID ?? item?.id
  );

  const konfirmasiId = normalizeId(
    item?.KonfirmasiAsetLainID ??
      item?.konfirmasi_aset_lain_id ??
      konfirmasi?.KonfirmasiAsetLainID ??
      konfirmasi?.id
  );

  return {
    id: rekapId ?? `temp-${Date.now()}-${Math.random()}`,
    rekapId,
    isNew: !rekapId,
    asetLainId: normalizeId(
      item?.AsetLainID ?? fallbackAsetLainId
    ),
    konfirmasiId: konfirmasiId ? String(konfirmasiId) : "",
    nama:
      konfirmasi?.NamaCustomer ??
      konfirmasi?.namaCustomer ??
      item?.NamaCustomer ??
      item?.namaCustomer ??
      "",
    saldoBukuBesar: toNumber(saldoBBRaw),
    tanggalKirim: toDateInput(item?.TanggalKirim),
    pengirimanVia: item?.MetodeKirim ?? "",
    tanggalJawaban: toDateInput(item?.TanggalJawab),
    saldoJawaban,
    selisih:
      item?.Selisih !== null && item?.Selisih !== undefined
        ? toNumber(item.Selisih)
        : getSelisih(saldoBBRaw, saldoJawaban),
    namaBukti: item?.NamaFile ?? "",
    tipeFile: item?.TipeFile ?? "",
    buktiFile: null,
    statusKonfirmasi: statusFromBackend(item?.Status),
  };
}

function getJenisJawaban(row) {
  const status = String(row?.statusKonfirmasi || "").toLowerCase();

  if (status === "tidak terbalas") return "tidak";
  if (status !== "terbalas") return "kosong";

  return toNumber(row.saldoBukuBesar) === toNumber(row.saldoJawaban)
    ? "sesuai"
    : "berbeda";
}

export default function RekapBalasanAsetLainLainPage({
  jwbKasusId: jwbKasusIdProp,
  refetchToken = 0,
  onSaved,
}) {
  const params = useParams();
  const searchParams = useSearchParams();

  const activeJwbKasusId = useMemo(() => {
    const fromProp = normalizeId(jwbKasusIdProp);
    if (fromProp) return fromProp;

    const fromParams = normalizeId(
      params?.JwbKasusID ??
        params?.jwbKasusId ??
        params?.jwb_kasus_id ??
        params?.id
    );

    if (fromParams) return fromParams;

    return normalizeId(
      searchParams?.get("JwbKasusID") ??
        searchParams?.get("jwbKasusId") ??
        searchParams?.get("jwb_kasus_id")
    );
  }, [jwbKasusIdProp, params, searchParams]);

  const [asetLainId, setAsetLainId] = useState(null);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [dataList, setDataList] = useState([]);

  const [filterStatus, setFilterStatus] = useState("Semua Konfirmasi");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

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
  const exportRef = useRef(null);

  const showSuccessAlert = (title, message) =>
    setSuccessAlert({ title, message });

  const showErrorAlert = (title, message) =>
    setErrorAlert({ title, message });


  const loadPageData = useCallback(async (activeId) => {
    if (!activeId) {
      setAsetLainId(null);
      setCustomerOptions([]);
      setDataList([]);
      return null;
    }

    const response = await fetchWithAuth(
      `${API_ENDPOINT}?_=${Date.now()}`,
      { method: "GET", cache: "no-store" }
    );

    const result = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        getApiError(
          result,
          "Gagal mengambil data Rekap Balasan Aset Lain."
        )
      );
    }

    const rows = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : [];

    const activeAsetLain =
      rows.find((item) => {
        const caseId = normalizeId(
          item?.JwbKasusID ??
            item?.jwb_kasus_id ??
            item?.jwbKasusId ??
            item?.jwb_kasus?.JwbKasusID ??
            item?.jwbKasus?.JwbKasusID
        );

        return caseId === normalizeId(activeId);
      }) ?? null;

    if (!activeAsetLain) {
      const emptyData = {
        asetLainId: null,
        customerOptions: [],
        dataList: [],
      };

      pageCache.set(String(activeId), emptyData);
      setAsetLainId(null);
      setCustomerOptions([]);
      setDataList([]);
      return emptyData;
    }

    const activeAsetLainId = normalizeId(
      activeAsetLain?.AsetLainID ??
        activeAsetLain?.aset_lain_id
    );

    const rawAllCustomers =
      activeAsetLain?.konfirmasiAsetLain ??
      activeAsetLain?.konfirmasi_aset_lain ??
      [];

    const rawAvailableCustomers =
      activeAsetLain?.konfirmasiAsetLainTersedia ??
      activeAsetLain?.konfirmasi_aset_lain_tersedia ??
      [];

    const rawRekap =
      activeAsetLain?.rekapBalasan ??
      activeAsetLain?.rekap_balasan ??
      [];

    const customerMap = new Map();

    const addCustomer = (item) => {
      if (!item) return;

      const customer = normalizeKonfirmasi(item, activeAsetLainId);

      if (!customer.id || !customer.namaCustomer) return;

      customerMap.set(String(customer.id), customer);
    };

    if (Array.isArray(rawAllCustomers)) {
      rawAllCustomers.forEach(addCustomer);
    }

    if (Array.isArray(rawAvailableCustomers)) {
      rawAvailableCustomers.forEach(addCustomer);
    }

    if (Array.isArray(rawRekap)) {
      rawRekap.forEach((item) => {
        addCustomer(
          item?.konfirmasiAsetLain ??
            item?.konfirmasi_aset_lain
        );
      });
    }

    const allCustomers = Array.from(customerMap.values());

    const normalizedRekap = Array.isArray(rawRekap)
      ? rawRekap.map((item) =>
          normalizeRekap(item, activeAsetLainId)
        )
      : [];

    normalizedRekap.forEach((row) => {
      if (!row.konfirmasiId) return;

      const exists = customerMap.has(String(row.konfirmasiId));
      if (exists) return;

      const original = rawRekap.find((item) => {
        const id = normalizeId(
          item?.KonfirmasiAsetLainID ??
            item?.konfirmasiAsetLain?.KonfirmasiAsetLainID ??
            item?.konfirmasi_aset_lain?.KonfirmasiAsetLainID
        );

        return String(id ?? "") === String(row.konfirmasiId);
      });

      const relation =
        original?.konfirmasiAsetLain ??
        original?.konfirmasi_aset_lain;

      if (relation) {
        addCustomer(relation);
      } else if (row.nama) {
        customerMap.set(String(row.konfirmasiId), {
          id: normalizeId(row.konfirmasiId),
          asetLainId: activeAsetLainId,
          namaCustomer: row.nama,
          jumlah: row.saldoBukuBesar,
          kotaCustomer: "",
        });
      }
    });

    const finalCustomers = Array.from(customerMap.values());

    const nextData = {
      asetLainId: activeAsetLainId,
      customerOptions: finalCustomers,
      dataList: normalizedRekap,
    };

    pageCache.set(String(activeId), nextData);
    setAsetLainId(activeAsetLainId);
    setCustomerOptions(finalCustomers);
    setDataList(normalizedRekap);

    return nextData;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!activeJwbKasusId) {
        setAsetLainId(null);
        setCustomerOptions([]);
        setDataList([]);
        return;
      }

      const cached = pageCache.get(String(activeJwbKasusId));

      if (cached) {
        setAsetLainId(cached.asetLainId ?? null);
        setCustomerOptions(cached.customerOptions ?? []);
        setDataList(cached.dataList ?? []);
      }

      try {
        await loadPageData(activeJwbKasusId);
      } catch (error) {
        console.error("LOAD REKAP ASET LAIN ERROR:", error);

        if (cancelled) return;

        if (!cached) {
          setAsetLainId(null);
          setCustomerOptions([]);
          setDataList([]);
        }

        showErrorAlert(
          "Gagal Memuat Data",
          error?.message || "Data gagal dimuat."
        );
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeJwbKasusId, refetchToken, loadPageData]);

  useEffect(() => {
    if (!activeJwbKasusId) return;

    pageCache.set(String(activeJwbKasusId), {
      asetLainId,
      customerOptions,
      dataList,
    });
  }, [activeJwbKasusId, asetLainId, customerOptions, dataList]);

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target)
      ) {
        setExportOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const filteredData = useMemo(() => {
    if (filterStatus === "Semua Konfirmasi") return dataList;

    return dataList.filter(
      (row) => row.statusKonfirmasi === filterStatus
    );
  }, [dataList, filterStatus]);

  const totalSaldoBukuBesar = useMemo(
    () =>
      dataList.reduce(
        (total, row) => total + toNumber(row.saldoBukuBesar),
        0
      ),
    [dataList]
  );

  const totalSaldoJawaban = useMemo(
    () =>
      dataList.reduce(
        (total, row) => total + toNumber(row.saldoJawaban),
        0
      ),
    [dataList]
  );

  const percentage = useMemo(() => {
    const total = dataList.length;

    if (!total) {
      return { sesuai: "0.00", berbeda: "0.00", tidak: "0.00" };
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

  const updateRow = (rowId, field, value) => {
    setDataList((previous) =>
      previous.map((row) =>
        String(row.id) === String(rowId)
          ? { ...row, [field]: value }
          : row
      )
    );
  };

  const getCustomerOptionsForRow = (currentRow) => {
    const options = [...customerOptions];

    if (currentRow.konfirmasiId && currentRow.nama) {
      const exists = options.some(
        (customer) =>
          String(customer.id) === String(currentRow.konfirmasiId)
      );

      if (!exists) {
        options.unshift({
          id: normalizeId(currentRow.konfirmasiId),
          asetLainId: currentRow.asetLainId,
          namaCustomer: currentRow.nama,
          jumlah: toNumber(currentRow.saldoBukuBesar),
        });
      }
    }

    return options;
  };

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
                selisih: getSelisih(0, row.saldoJawaban),
              }
            : row
        )
      );

      return;
    }

    const selectedCustomer = getCustomerOptionsForRow(currentRow).find(
      (customer) => String(customer.id) === String(customerId)
    );

    if (!selectedCustomer) {
      showErrorAlert(
        "Customer Tidak Ditemukan",
        "Data customer tidak tersedia."
      );
      return;
    }

    const usedByAnotherRow = dataList.some(
      (row) =>
        String(row.id) !== String(rowId) &&
        String(row.konfirmasiId) === String(customerId)
    );

    if (usedByAnotherRow) {
      showErrorAlert(
        "Customer Sudah Digunakan",
        "Pilih customer lain. Satu customer hanya dapat digunakan pada satu baris."
      );
      return;
    }

    setDataList((previous) =>
      previous.map((row) =>
        String(row.id) === String(rowId)
          ? {
              ...row,
              konfirmasiId: String(selectedCustomer.id),
              nama: selectedCustomer.namaCustomer,
              saldoBukuBesar: toNumber(selectedCustomer.jumlah),
              asetLainId,
              selisih: getSelisih(
                selectedCustomer.jumlah,
                row.saldoJawaban
              ),
            }
          : row
      )
    );
  };

  const handleAddData = () => {
    if (!normalizeId(asetLainId)) {
      showErrorAlert(
        "Aset Lain Belum Tersedia",
        "Data Aset Lain untuk kasus ini tidak ditemukan."
      );
      return;
    }

    const available = customerOptions.filter(
      (customer) =>
        !dataList.some(
          (row) => String(row.konfirmasiId) === String(customer.id)
        )
    );

    if (available.length === 0) {
      showErrorAlert(
        "Customer Belum Tersedia",
        "Tidak ada customer yang tersedia untuk ditambahkan."
      );
      return;
    }

    setDataList((previous) => [
      ...previous,
      {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        rekapId: null,
        isNew: true,
        asetLainId,
        konfirmasiId: "",
        nama: "",
        saldoBukuBesar: 0,
        tanggalKirim: "",
        pengirimanVia: "",
        tanggalJawaban: "",
        saldoJawaban: 0,
        selisih: 0,
        namaBukti: "",
        tipeFile: "",
        buktiFile: null,
        statusKonfirmasi: "",
      },
    ]);
  };

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

  const handleViewBukti = async (row) => {
    if (typeof File !== "undefined" && row?.buktiFile instanceof File) {
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
        const result = await parseResponse(response);
        throw new Error(
          getApiError(result, "File bukti tidak dapat dibuka.")
        );
      }

      const blob = await response.blob();

      if (!blob.size) throw new Error("File bukti kosong.");

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      showErrorAlert(
        "Gagal Membuka Bukti",
        error?.message || "File bukti gagal dibuka."
      );
    }
  };

  const buildBulkSaveFormData = (rows, activeId) => {
    const form = new FormData();

    rows.forEach((row, index) => {
      const prefix = `data[${index}]`;

      if (row.rekapId) {
        form.append(
          `${prefix}[RekapBalasanAsetLainID]`,
          String(row.rekapId)
        );
      }

      form.append(
        `${prefix}[AsetLainID]`,
        String(normalizeId(row.asetLainId) || activeId)
      );

      const konfirmasiId = normalizeId(row.konfirmasiId);

      if (konfirmasiId) {
        form.append(
          `${prefix}[KonfirmasiAsetLainID]`,
          String(konfirmasiId)
        );
      }

      form.append(
        `${prefix}[SaldoBB]`,
        String(toNumber(row.saldoBukuBesar))
      );

      form.append(
        `${prefix}[SaldoJawab]`,
        String(toNumber(row.saldoJawaban))
      );

      form.append(
        `${prefix}[Selisih]`,
        String(getSelisih(row.saldoBukuBesar, row.saldoJawaban))
      );

      if (row.tanggalKirim) {
        form.append(`${prefix}[TanggalKirim]`, row.tanggalKirim);
      }

      if (row.pengirimanVia?.trim()) {
        form.append(
          `${prefix}[MetodeKirim]`,
          row.pengirimanVia.trim()
        );
      }

      if (row.tanggalJawaban) {
        form.append(`${prefix}[TanggalJawab]`, row.tanggalJawaban);
      }

      const status = statusToBackend(row.statusKonfirmasi);
      if (status) form.append(`${prefix}[Status]`, status);

      if (row.buktiFile instanceof File) {
        form.append(
          `${prefix}[FileBukti]`,
          row.buktiFile,
          row.buktiFile.name
        );
      }
    });

    return form;
  };

  const bulkSaveRekap = async (rows, activeId) => {
    const form = buildBulkSaveFormData(rows, activeId);

    const response = await fetchWithAuth(BULK_SAVE_ENDPOINT, {
      method: "POST",
      body: form,
    });

    const result = await parseResponse(response);

    if (!response.ok || result?.success === false) {
      throw new Error(
        getApiError(result, "Rekap Balasan Aset Lain gagal disimpan.")
      );
    }

    return result;
  };

  const handleSave = async () => {
    if (saving) return;

    if (dataList.length === 0) {
      showErrorAlert("Data Kosong", "Belum ada data yang dapat disimpan.");
      return;
    }

    if (!normalizeId(asetLainId)) {
      showErrorAlert(
        "Aset Lain Tidak Ditemukan",
        "ID Aset Lain tidak ditemukan."
      );
      return;
    }

    if (dataList.some((row) => !normalizeId(row.konfirmasiId))) {
      showErrorAlert(
        "Data Belum Lengkap",
        "Semua baris harus memilih Nama Customer."
      );
      return;
    }

    if (dataList.some((row) => !row.tanggalKirim)) {
      showErrorAlert(
        "Data Belum Lengkap",
        "Tanggal Kirim wajib diisi."
      );
      return;
    }

    if (dataList.some((row) => !String(row.pengirimanVia || "").trim())) {
      showErrorAlert(
        "Data Belum Lengkap",
        "Pengiriman Via wajib diisi."
      );
      return;
    }

    if (dataList.some((row) => !statusToBackend(row.statusKonfirmasi))) {
      showErrorAlert(
        "Data Belum Lengkap",
        "Status Konfirmasi wajib dipilih."
      );
      return;
    }

    const selectedIds = dataList
      .map((row) => normalizeId(row.konfirmasiId))
      .filter((id) => id !== null)
      .map(String);

    if (new Set(selectedIds).size !== selectedIds.length) {
      showErrorAlert(
        "Customer Duplikat",
        "Customer yang sama tidak boleh dipilih pada beberapa baris."
      );

      return;
    }

    try {
      setSaving(true);

      const result = await bulkSaveRekap(dataList, asetLainId);

      await loadPageData(activeJwbKasusId);
      onSaved?.();

      showSuccessAlert(
        "Berhasil Disimpan",
        result?.message || "Rekap Balasan Aset Lain berhasil disimpan."
      );
    } catch (error) {
      console.error("SAVE REKAP ASET LAIN ERROR:", error);
      showErrorAlert(
        "Gagal Menyimpan",
        error?.message || "Data gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  };

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
        throw new Error(getApiError(result, "Data gagal dihapus."));
      }

      await loadPageData(activeJwbKasusId);

      setDeleteModalOpen(false);
      setDeletingData(null);

      showSuccessAlert(
        "Berhasil Dihapus",
        result?.message || "Data berhasil dihapus."
      );
    } catch (error) {
      showErrorAlert(
        "Gagal Menghapus",
        error?.message || "Data gagal dihapus."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleExportExcel = () => {
    if (!dataList.length) {
      showErrorAlert("Data Kosong", "Tidak ada data untuk diekspor.");
      return;
    }

    const headers = [
      "No",
      "Nama",
      "Saldo Buku Besar",
      "Tanggal Kirim",
      "Pengiriman Via",
      "Tanggal Jawaban",
      "Saldo Jawaban",
      "Selisih",
      "Status",
    ];

    const rows = dataList.map((row, index) => [
      index + 1,
      row.nama,
      row.saldoBukuBesar,
      row.tanggalKirim,
      row.pengirimanVia,
      row.tanggalJawaban,
      row.saldoJawaban,
      getSelisih(row.saldoBukuBesar, row.saldoJawaban),
      row.statusKonfirmasi,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((item) => `"${String(item ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "rekap-balasan-aset-lain.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  /* =====================================================
     EXPORT PDF / PRINT
  ====================================================== */

  const handleExportPdf = () => {
    if (!dataList.length) {
      showErrorAlert("Data Kosong", "Tidak ada data untuk diekspor.");
      return;
    }

    const popup = window.open("", "_blank");

    if (!popup) {
      showErrorAlert(
        "Popup Diblokir",
        "Izinkan popup browser untuk melakukan export PDF."
      );
      return;
    }

    const body = dataList.map((row, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(row.nama)}</td>
        <td>Rp ${formatNumber(row.saldoBukuBesar)}</td>
        <td>${escapeHtml(row.tanggalKirim || "-")}</td>
        <td>${escapeHtml(row.pengirimanVia || "-")}</td>
        <td>${escapeHtml(row.tanggalJawaban || "-")}</td>
        <td>Rp ${formatNumber(row.saldoJawaban)}</td>
        <td>Rp ${formatNumber(getSelisih(row.saldoBukuBesar, row.saldoJawaban))}</td>
        <td>${escapeHtml(row.statusKonfirmasi || "-")}</td>
      </tr>
    `).join("");

    popup.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Rekap Balasan Aset Lain</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #ddd; padding: 7px; text-align: left; }
            th { background: #f8fafc; }
            @page { size: landscape; }
          </style>
        </head>
        <body>
          <h2>Rekap Balasan Aset Lain</h2>
          <table>
            <thead>
              <tr>
                <th>No</th><th>Nama</th><th>Saldo Buku Besar</th>
                <th>Tanggal Kirim</th><th>Pengiriman Via</th>
                <th>Tanggal Jawaban</th><th>Saldo Jawaban</th>
                <th>Selisih</th><th>Status</th>
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
          <script>
            window.onload = function () { window.print(); };
          </script>
        </body>
      </html>
    `);

    popup.document.close();
    setExportOpen(false);
  };

  /* =====================================================
     RENDER
  ====================================================== */

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
        message="Apakah Anda yakin ingin menghapus data Rekap Balasan Aset Lain?"
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-[220px]">
            <Dropdown
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Semua Konfirmasi"
              showCheck={false}
              options={[
                { value: "Semua Konfirmasi", label: "Semua Konfirmasi" },
                { value: "Terbalas", label: "Terbalas" },
                { value: "Tidak Terbalas", label: "Tidak Terbalas" },
              ]}
              className="
                [&>button]:h-12 [&>button]:min-h-12
                [&>button]:rounded-xl [&>button]:border-[#DCE5EF]
                [&>button]:bg-white [&>button]:px-4
                [&>button]:font-poppins [&>button]:text-sm
              "
            />
          </div>

          <div ref={exportRef} className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((previous) => !previous)}
              className="
                flex h-12 items-center gap-2 rounded-xl
                border border-[#DCE5EF] bg-white px-4
                font-poppins text-sm text-[#475569]
                transition hover:bg-[#F8FAFC]
              "
            >
              <Download size={16} />
              Export
              <ChevronDown size={14} />
            </button>

            {exportOpen && (
              <div className="
                absolute right-0 top-[54px] z-30 w-[170px]
                overflow-hidden rounded-xl border border-[#DCE5EF]
                bg-white shadow-lg
              ">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="
                    flex w-full items-center gap-3 px-4 py-3
                    font-poppins text-sm text-[#475569] hover:bg-[#F8FAFC]
                  "
                >
                  <FileSpreadsheet size={16} className="text-green-600" />
                  Excel / CSV
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="
                    flex w-full items-center gap-3 px-4 py-3
                    font-poppins text-sm text-[#475569] hover:bg-[#F8FAFC]
                  "
                >
                  <FileText size={16} className="text-red-500" />
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-[#DCE5EF]">
          <table className="w-full min-w-[1750px] border-collapse">
            <thead className="bg-[#F8FAFC]">
              <tr>
                {[
                  "No",
                  "Nama",
                  "Saldo Buku Besar",
                  "Tanggal Kirim",
                  "Pengiriman Via",
                  "Tanggal Jawaban",
                  "Saldo Jawaban",
                  "Selisih",
                  "Bukti",
                  "Status Konfirmasi",
                  "Aksi",
                ].map((header) => (
                  <th
                    key={header}
                    className="
                      border-b border-[#DCE5EF] px-3 py-3 text-left
                      font-poppins text-[11px] font-semibold uppercase
                      tracking-wide text-[#64748B]
                    "
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
                    colSpan={11}
                    className="
                      h-[160px] text-center font-poppins
                      text-sm text-[#94A3B8]
                    "
                  >
                    Tidak ada data yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => {
                  const selisih = getSelisih(
                    row.saldoBukuBesar,
                    row.saldoJawaban
                  );

                  const options = getCustomerOptionsForRow(row);

                  return (
                    <tr key={row.id} className="border-b border-[#EDF2F7]">
                      <td className="px-3 py-2 font-poppins text-sm text-[#475569]">
                        {index + 1}
                      </td>

                      <td className="min-w-[230px] px-3 py-2">
                        <CustomerDropdown
                          value={row.konfirmasiId}
                          placeholder="Pilih Customer"
                          options={options.map((customer) => ({
                            value: String(customer.id),
                            label: customer.namaCustomer,
                          }))}
                          onChange={(value) =>
                            handleCustomerChange(row.id, value)
                          }
                        />
                      </td>

                      <td className="px-3 py-2">
                        <div className="
                          inline-flex h-10 min-w-[190px] w-max
                          items-center whitespace-nowrap rounded-xl
                          border border-[#DCE5EF] bg-[#F8FAFC] px-3
                        ">
                          <span className="shrink-0 text-sm text-[#64748B]">
                            Rp
                          </span>
                          <span className="shrink-0 pl-3 text-sm text-[#475569]">
                            {formatNumber(row.saldoBukuBesar)}
                          </span>
                        </div>
                      </td>

                      <td className="min-w-[160px] px-3 py-2">
                        <input
                          type="date"
                          value={row.tanggalKirim || ""}
                          onChange={(event) =>
                            updateRow(row.id, "tanggalKirim", event.target.value)
                          }
                          className="
                            h-10 w-full rounded-xl border border-[#DCE5EF]
                            bg-white px-3 text-sm text-[#475569]
                            outline-none focus:border-[#38BDF8]
                          "
                        />
                      </td>

                      <td className="min-w-[180px] px-3 py-2">
                        <input
                          type="text"
                          value={row.pengirimanVia || ""}
                          placeholder="Konfirmasi Dikirim"
                          onChange={(event) =>
                            updateRow(row.id, "pengirimanVia", event.target.value)
                          }
                          className="
                            h-10 w-full rounded-xl border border-[#DCE5EF]
                            bg-white px-3 text-sm text-[#475569]
                            outline-none focus:border-[#38BDF8]
                          "
                        />
                      </td>

                      <td className="min-w-[160px] px-3 py-2">
                        <input
                          type="date"
                          value={row.tanggalJawaban || ""}
                          onChange={(event) =>
                            updateRow(row.id, "tanggalJawaban", event.target.value)
                          }
                          className="
                            h-10 w-full rounded-xl border border-[#DCE5EF]
                            bg-white px-3 text-sm text-[#475569]
                            outline-none focus:border-[#38BDF8]
                          "
                        />
                      </td>

                      <td className="px-3 py-2">
                        <div className="
                          inline-flex h-10 min-w-[190px] w-max
                          items-center whitespace-nowrap rounded-xl
                          border border-[#DCE5EF] bg-white px-3
                          focus-within:border-[#38BDF8]
                        ">
                          <span className="shrink-0 text-sm text-[#64748B]">
                            Rp
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatNumber(row.saldoJawaban)}
                            onChange={(event) =>
                              updateRow(
                                row.id,
                                "saldoJawaban",
                                toNumber(event.target.value)
                              )
                            }
                            className="
                              min-w-[80px] shrink-0 bg-transparent
                              pl-3 text-left text-sm text-[#475569] outline-none
                            "
                          />
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <div className="
                          inline-flex h-10 min-w-[190px] w-max
                          items-center whitespace-nowrap rounded-xl
                          border border-[#DCE5EF] bg-[#F8FAFC] px-3
                        ">
                          <span className="shrink-0 text-sm text-[#64748B]">
                            Rp
                          </span>
                          <span className="shrink-0 pl-3 text-sm text-[#64748B]">
                            {formatNumber(selisih)}
                          </span>
                        </div>
                      </td>

                      <td className="min-w-[100px] px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[row.id]?.click()}
                            className="
                              text-sm font-medium text-[#38BDF8]
                              transition hover:underline
                            "
                          >
                            File
                          </button>

                          {(row.buktiFile || row.namaBukti) && (
                            <button
                              type="button"
                              title="Lihat Bukti"
                              onClick={() => handleViewBukti(row)}
                              className="
                                flex h-7 w-7 items-center justify-center
                                rounded-md text-[#38BDF8] hover:bg-[#F0F9FF]
                              "
                            >
                              <Eye size={14} />
                            </button>
                          )}

                          <input
                            ref={(element) => {
                              fileInputRefs.current[row.id] = element;
                            }}
                            type="file"
                            className="hidden"
                            onChange={(event) =>
                              handleFileSelected(row.id, event)
                            }
                          />
                        </div>
                      </td>

                      <td className="min-w-[190px] px-3 py-2">
                        <Dropdown
                          value={row.statusKonfirmasi || ""}
                          placeholder="Pilih Status"
                          showCheck={false}
                          options={[
                            { value: "", label: "Pilih Status" },
                            { value: "Terbalas", label: "Terbalas" },
                            { value: "Tidak Terbalas", label: "Tidak Terbalas" },
                          ]}
                          onChange={(value) =>
                            updateRow(row.id, "statusKonfirmasi", value)
                          }
                          className={`
                            [&>button]:h-10 [&>button]:min-h-10
                            [&>button]:rounded-xl [&>button]:px-3
                            ${
                              !row.statusKonfirmasi
                                ? "[&>button]:border-[#DCE5EF] [&>button]:bg-white"
                                : row.statusKonfirmasi === "Terbalas"
                                  ? "[&>button]:border-[#86EFAC] [&>button]:bg-[#F0FDF4]"
                                  : "[&>button]:border-[#FCA5A5] [&>button]:bg-[#FEF2F2]"
                            }
                          `}
                        />
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            title="Hapus"
                            onClick={() => openDeleteModal(row)}
                            className="
                              flex h-8 w-8 items-center justify-center
                              rounded-md text-red-500 transition
                              hover:bg-red-50 hover:text-red-600
                            "
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

            {dataList.length > 0 && (
              <tfoot>
                <tr className="border-t border-[#DCE5EF] bg-[#F8FAFC]">
                  <td />
                  <td className="px-3 py-4 text-sm font-bold text-[#1E293B]">
                    Total
                  </td>
                  <td className="px-3 py-4 text-sm font-bold text-[#1E293B]">
                    {formatNumber(totalSaldoBukuBesar)}
                  </td>
                  <td />
                  <td />
                  <td />
                  <td className="px-3 py-4 text-sm font-bold text-[#1E293B]">
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

        <div className="mt-4 flex justify-center">
          <AddDataButton
            onClick={handleAddData}
            disabled={saving}
            label="Tambah Data"
          />
        </div>

        <div className="
          mt-5 flex flex-col gap-5
          lg:flex-row lg:items-end lg:justify-between
        ">
          <div className="
            w-full max-w-[470px] rounded-xl
            border border-[#DCE5EF] bg-white p-4
          ">
            <div className="
              grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3
              text-sm font-semibold text-[#475569]
            ">
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
