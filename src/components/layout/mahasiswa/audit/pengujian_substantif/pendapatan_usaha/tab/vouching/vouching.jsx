
"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import {
  Eye,
  Trash2,
  Calendar,
} from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import Dropdown from "@/components/ui/dropdown/dropdown";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";

import { getPendapatanUsaha } from "@/services/mahasiswa/tugas/audit/pendapatan_usaha/pendapatan_usaha";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const API_ENDPOINT = `${API_URL}/api/vouching-pu`;

const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
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

/* ============================================================
   HELPERS
============================================================ */

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

  const cleaned = String(value).replace(/[^\d-]/g, "");

  if (!cleaned || cleaned === "-") {
    return 0;
  }

  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(toNumber(value));

const normalizeBoolean = (value) =>
  value === true ||
  value === 1 ||
  value === "1" ||
  value === "true" ||
  value === "Ya";

const normalizePihakRelasi = (value) =>
  normalizeBoolean(value) ? "Ya" : "Tidak";

const normalizeDate = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && value.length >= 10) {
    return value.substring(0, 10);
  }

  return "";
};

/* ============================================================
   FORMAT TANGGAL DD/MM/YYYY
   Nilai tanggal tetap YYYY-MM-DD untuk backend.
============================================================ */

const formatTanggalIndonesia = (value) => {
  if (!value) {
    return "";
  }

  const parts = value.substring(0, 10).split("-");

  if (parts.length !== 3) {
    return "";
  }

  const [tahun, bulan, tanggal] = parts;

  if (!tahun || !bulan || !tanggal) {
    return "";
  }

  return `${tanggal}/${bulan}/${tahun}`;
};

function TanggalIndonesia({ value, onChange }) {
  const dateInputRef = useRef(null);

  const bukaKalender = () => {
    const input = dateInputRef.current;

    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        input.click();
      }
    } else {
      input.click();
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        readOnly
        value={formatTanggalIndonesia(value)}
        placeholder="dd/mm/yyyy"
        onClick={bukaKalender}
        className="h-10 w-full cursor-pointer rounded-xl border border-[#DCE5EF] bg-white px-3 pr-10 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]"
      />

      <button
        type="button"
        onClick={bukaKalender}
        aria-label="Pilih tanggal"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
      >
        <Calendar size={16} />
      </button>

      <input
        ref={dateInputRef}
        type="date"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />
    </div>
  );
}

const mapBackendRow = (item) => ({
  id: item.VouchingID,
  VouchingID: item.VouchingID,
  PendapatanUsahaID: item.PendapatanUsahaID,

  keterangan: item.Keterangan || "",
  tanggal: normalizeDate(item.Tanggal),
  noBukti: item.NomorBukti || "",

  nominalInternal: item.NominalInternal ?? 0,

  buktiInternal: null,
  buktiInternalExisting: Boolean(item.hasBuktiInternal),
  buktiInternalTipeFile: item.BuktiInternalTipeFile || null,

  nominalEksternal: item.NominalEksternal ?? 0,

  buktiEksternal: null,
  buktiEksternalExisting: Boolean(item.hasBuktiEksternal),
  buktiEksternalTipeFile: item.BuktiEksternalTipeFile || null,

  selisih: item.Selisih ?? 0,

  pihakBerelasi: normalizePihakRelasi(item.PihakRelasi),

  bukti: null,
  buktiExisting: Boolean(item.hasBukti),
  buktiFileTipe: item.BuktiFileTipe || null,

  approvalPO: normalizeBoolean(item.ApprovalPO),
  approvalINV: normalizeBoolean(item.ApprovalNV),
  approvalDO: normalizeBoolean(item.ApprovalDO),
});

const createEmptyRow = (id, pendapatanUsahaId) => ({
  id,
  VouchingID: null,
  PendapatanUsahaID: pendapatanUsahaId,

  keterangan: "",
  tanggal: "",
  noBukti: "",

  nominalInternal: 0,
  buktiInternal: null,
  buktiInternalExisting: false,
  buktiInternalTipeFile: null,

  nominalEksternal: 0,
  buktiEksternal: null,
  buktiEksternalExisting: false,
  buktiEksternalTipeFile: null,

  selisih: 0,
  pihakBerelasi: "",

  bukti: null,
  buktiExisting: false,
  buktiFileTipe: null,

  approvalPO: false,
  approvalINV: false,
  approvalDO: false,
});

/* ============================================================
   COMPONENT
============================================================ */

export default function VouchingPage({ auditId }) {
  const [pendapatanUsahaId, setPendapatanUsahaId] =
    useState(null);

  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showSuccessAlert, setShowSuccessAlert] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);

  const [deleteRowId, setDeleteRowId] = useState(null);
  const [newRowId, setNewRowId] = useState(null);
  const [previousRowCount, setPreviousRowCount] = useState(0);

  /* ============================================================
     LOAD VOUCHING
  ============================================================ */

  const loadVouching = useCallback(async (id) => {
    if (!id) {
      setRows([]);
      setPreviousRowCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const url =
        `${API_ENDPOINT}?PendapatanUsahaID=${encodeURIComponent(id)}`;

      const response = await fetchWithAuth(url, {
        method: "GET",
      });

      let result = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok) {
        throw new Error(
          result?.message || "Data Vouching gagal dimuat."
        );
      }

      const backendRows = Array.isArray(result?.data)
        ? result.data
        : [];

      const mappedRows = backendRows.map(mapBackendRow);

      setRows(mappedRows);
      setPreviousRowCount(mappedRows.length);
    } catch (error) {
      console.error("LOAD VOUCHING ERROR:", error);
      setRows([]);

      setErrorMessage(
        error?.message || "Data Vouching gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* ============================================================
     RESOLVE PENDAPATAN USAHA ID
  ============================================================ */

  useEffect(() => {
    let isMounted = true;

    const resolvePendapatanUsaha = async () => {
      if (!auditId) {
        setPendapatanUsahaId(null);
        setRows([]);
        setLoading(false);

        setErrorMessage(
          "Audit ID tidak ditemukan pada halaman ini."
        );

        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");
        setPendapatanUsahaId(null);
        setRows([]);

        const pendapatanUsaha =
          await getPendapatanUsaha(auditId);

        if (!pendapatanUsaha?.PendapatanUsahaID) {
          throw new Error(
            "Data pendapatan usaha tidak ditemukan."
          );
        }

        const resolvedId =
          pendapatanUsaha.PendapatanUsahaID;

        if (!isMounted) {
          return;
        }

        setPendapatanUsahaId(resolvedId);

        await loadVouching(resolvedId);
      } catch (error) {
        console.error(
          "RESOLVE PENDAPATAN USAHA ERROR:",
          error
        );

        if (isMounted) {
          setPendapatanUsahaId(null);
          setRows([]);

          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              "Gagal mengambil data pendapatan usaha."
          );

          setLoading(false);
        }
      }
    };

    resolvePendapatanUsaha();

    return () => {
      isMounted = false;
    };
  }, [auditId, loadVouching]);

  /* ============================================================
     UPDATE ROW
  ============================================================ */

  const updateRow = (id, field, value) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  /* ============================================================
     NOMINAL
  ============================================================ */

  const handleNominalChange = (id, field, value) => {
    const numericValue = String(value).replace(/\D/g, "");

    updateRow(
      id,
      field,
      numericValue ? Number(numericValue) : 0
    );
  };

  /* ============================================================
     ADD ROW
  ============================================================ */

  const handleAddRow = () => {
    if (!pendapatanUsahaId) {
      setErrorMessage(
        "Data pendapatan usaha belum tersedia."
      );
      return;
    }

    const newId =
      rows.length > 0
        ? Math.max(
            ...rows.map((row) => Number(row.id) || 0)
          ) + 1
        : 1;

    setRows((currentRows) => [
      ...currentRows,
      createEmptyRow(newId, pendapatanUsahaId),
    ]);

    setNewRowId(newId);
    setErrorMessage("");
  };

  /* ============================================================
     SCROLL SETELAH TAMBAH ROW
  ============================================================ */

  useEffect(() => {
    if (newRowId === null) {
      return undefined;
    }

    const timer = setTimeout(() => {
      const rowElement = document.querySelector(
        `[data-row-id="${newRowId}"]`
      );

      rowElement?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      setNewRowId(null);
    }, 100);

    return () => clearTimeout(timer);
  }, [newRowId]);

  /* ============================================================
     SCROLL SETELAH JUMLAH ROW BERUBAH
  ============================================================ */

  useLayoutEffect(() => {
    const currentRowCount = rows.length;

    const wasDeleted = currentRowCount < previousRowCount;
    const wasAdded = currentRowCount > previousRowCount;

    if (!wasDeleted && !wasAdded) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight -
          window.innerHeight
      );

      if (window.scrollY > maxScroll) {
        window.scrollTo({
          top: maxScroll,
          left: 0,
          behavior: "auto",
        });
      }

      setPreviousRowCount(currentRowCount);
    });

    return () => cancelAnimationFrame(frame);
  }, [rows.length, previousRowCount]);

  /* ============================================================
     DROPDOWN SCROLL
  ============================================================ */

  const handlePihakBerelasiPointerDown = (
    event,
    rowId
  ) => {
    if (
      event.button !== undefined &&
      event.button !== 0
    ) {
      return;
    }

    const rowElement = document.querySelector(
      `[data-row-id="${rowId}"]`
    );

    if (!rowElement) {
      return;
    }

    const dropdownButton =
      event.currentTarget?.querySelector("button");

    if (!dropdownButton) {
      return;
    }

    const viewportHeight = window.innerHeight;
    const buttonRect = dropdownButton.getBoundingClientRect();

    const spaceBelow = viewportHeight - buttonRect.bottom;
    const minimumSpaceBelow = 240;

    if (spaceBelow >= minimumSpaceBelow) {
      return;
    }

    const targetTop = Math.max(
      80,
      Math.min(180, viewportHeight * 0.2)
    );

    const scrollAmount = buttonRect.top - targetTop;

    if (scrollAmount > 0) {
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight -
          window.innerHeight
      );

      window.scrollTo({
        top: Math.min(
          window.scrollY + scrollAmount,
          maxScroll
        ),
        left: 0,
        behavior: "auto",
      });
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const updatedRow = document.querySelector(
          `[data-row-id="${rowId}"]`
        );

        const updatedButton =
          updatedRow?.querySelectorAll("td")[9]?.querySelector("button");

        if (!updatedButton) {
          return;
        }

        const updatedRect =
          updatedButton.getBoundingClientRect();

        const updatedSpaceBelow =
          window.innerHeight - updatedRect.bottom;

        if (updatedSpaceBelow < minimumSpaceBelow) {
          const additionalScroll =
            minimumSpaceBelow - updatedSpaceBelow;

          const maxScroll = Math.max(
            0,
            document.documentElement.scrollHeight -
              window.innerHeight
          );

          window.scrollTo({
            top: Math.min(
              window.scrollY + additionalScroll,
              maxScroll
            ),
            left: 0,
            behavior: "auto",
          });
        }
      });
    });
  };

  /* ============================================================
     FILE PICKER
  ============================================================ */

  const handleOpenFile = (field, id) => {
    document.getElementById(`file-${field}-${id}`)?.click();
  };

  const handleFileChange = (event, field, id) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 16 MB.");
      event.target.value = "";
      return;
    }

    updateRow(id, field, file);
    setErrorMessage("");
  };

  /* ============================================================
     VIEW FILE
  ============================================================ */

  const handleViewFile = async (field, id) => {
    const row = rows.find((item) => item.id === id);

    if (!row) {
      return;
    }

    const localFile = row[field];

    if (
      typeof File !== "undefined" &&
      localFile instanceof File
    ) {
      const fileUrl = URL.createObjectURL(localFile);

      window.open(
        fileUrl,
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
      return;
    }

    if (!row.VouchingID) {
      return;
    }

    const backendFieldMap = {
      buktiInternal: "BuktiInternal",
      buktiEksternal: "BuktiEksternal",
      bukti: "Bukti",
    };

    const backendField = backendFieldMap[field];

    if (!backendField) {
      return;
    }

    try {
      setErrorMessage("");

      const response = await fetchWithAuth(
        `${API_ENDPOINT}/${row.VouchingID}/file/${backendField}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        let result = null;

        try {
          result = await response.json();
        } catch {
          result = null;
        }

        throw new Error(
          result?.message || "File gagal dibuka."
        );
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);

      window.open(
        fileUrl,
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
    } catch (error) {
      console.error("VIEW FILE ERROR:", error);

      setErrorMessage(
        error?.message || "File gagal dibuka."
      );
    }
  };

  /* ============================================================
     FORM DATA
  ============================================================ */

  const buildFormData = (row, includeParentId = false) => {
    const formData = new FormData();

    if (includeParentId) {
      formData.append(
        "PendapatanUsahaID",
        String(pendapatanUsahaId)
      );
    }

    formData.append("Keterangan", row.keterangan || "");
    formData.append("Tanggal", row.tanggal || "");
    formData.append("NomorBukti", row.noBukti || "");

    formData.append(
      "NominalInternal",
      String(toNumber(row.nominalInternal))
    );

    formData.append(
      "NominalEksternal",
      String(toNumber(row.nominalEksternal))
    );

    formData.append(
      "PihakRelasi",
      row.pihakBerelasi === "Ya" ? "1" : "0"
    );

    formData.append(
      "ApprovalPO",
      row.approvalPO ? "1" : "0"
    );

    formData.append(
      "ApprovalNV",
      row.approvalINV ? "1" : "0"
    );

    formData.append(
      "ApprovalDO",
      row.approvalDO ? "1" : "0"
    );

    if (
      typeof File !== "undefined" &&
      row.buktiInternal instanceof File
    ) {
      formData.append("BuktiInternal", row.buktiInternal);
    }

    if (
      typeof File !== "undefined" &&
      row.buktiEksternal instanceof File
    ) {
      formData.append("BuktiEksternal", row.buktiEksternal);
    }

    if (
      typeof File !== "undefined" &&
      row.bukti instanceof File
    ) {
      formData.append("Bukti", row.bukti);
    }

    return formData;
  };

  /* ============================================================
     CREATE
  ============================================================ */

  const createRow = async (row) => {
    const formData = buildFormData(row, true);

    const response = await fetchWithAuth(API_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    let result = null;

    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      const validationMessage = result?.errors
        ? Object.values(result.errors).flat().join(" ")
        : null;

      throw new Error(
        validationMessage ||
          result?.message ||
          "Data Vouching gagal disimpan."
      );
    }

    return result;
  };

  /* ============================================================
     UPDATE
  ============================================================ */

  const updateExistingRow = async (row) => {
    const formData = buildFormData(row, false);

    formData.append("_method", "PUT");

    const response = await fetchWithAuth(
      `${API_ENDPOINT}/${row.VouchingID}`,
      {
        method: "POST",
        body: formData,
      }
    );

    let result = null;

    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      const validationMessage = result?.errors
        ? Object.values(result.errors).flat().join(" ")
        : null;

      throw new Error(
        validationMessage ||
          result?.message ||
          "Data Vouching gagal diperbarui."
      );
    }

    return result;
  };

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDeleteClick = (id) => {
    setDeleteRowId(id);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteRowId === null) {
      return;
    }

    const row = rows.find(
      (item) => item.id === deleteRowId
    );

    if (!row) {
      setDeleteRowId(null);
      setShowDeleteConfirmation(false);
      return;
    }

    if (!row.VouchingID) {
      setRows((currentRows) =>
        currentRows.filter(
          (item) => item.id !== deleteRowId
        )
      );

      setDeleteRowId(null);
      setShowDeleteConfirmation(false);

      setSuccessMessage("Data Vouching berhasil dihapus.");
      setShowSuccessAlert(true);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetchWithAuth(
        `${API_ENDPOINT}/${row.VouchingID}`,
        {
          method: "DELETE",
        }
      );

      let result = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok) {
        throw new Error(
          result?.message || "Data Vouching gagal dihapus."
        );
      }

      setRows((currentRows) =>
        currentRows.filter(
          (item) => item.id !== deleteRowId
        )
      );

      setDeleteRowId(null);
      setShowDeleteConfirmation(false);

      setSuccessMessage(
        result?.message || "Data Vouching berhasil dihapus."
      );

      setShowSuccessAlert(true);
    } catch (error) {
      console.error("DELETE VOUCHING ERROR:", error);

      setErrorMessage(
        error?.message || "Data Vouching gagal dihapus."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteRowId(null);
    setShowDeleteConfirmation(false);
  };

  /* ============================================================
     SAVE ALL
  ============================================================ */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!pendapatanUsahaId) {
      setErrorMessage(
        "PendapatanUsahaID tidak ditemukan."
      );
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];

        if (!row.tanggal) {
          throw new Error(
            `Tanggal pada baris ${index + 1} wajib diisi.`
          );
        }

        if (!row.noBukti) {
          throw new Error(
            `Nomor Bukti pada baris ${index + 1} wajib diisi.`
          );
        }
      }

      for (const row of rows) {
        if (row.VouchingID) {
          await updateExistingRow(row);
        } else {
          await createRow(row);
        }
      }

      await loadVouching(pendapatanUsahaId);

      setSuccessMessage("Data Vouching berhasil disimpan.");
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("SAVE VOUCHING ERROR:", error);

      setErrorMessage(
        error?.message || "Data Vouching gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     TOTAL
  ============================================================ */

  const totalInternal = useMemo(
    () =>
      rows.reduce(
        (total, row) =>
          total + toNumber(row.nominalInternal),
        0
      ),
    [rows]
  );

  const totalExternal = useMemo(
    () =>
      rows.reduce(
        (total, row) =>
          total + toNumber(row.nominalEksternal),
        0
      ),
    [rows]
  );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="font-poppins text-[#334155]">
      {showSuccessAlert && (
        <AlertSuccess
          message={successMessage}
          onClose={() => setShowSuccessAlert(false)}
        />
      )}

      {errorMessage && (
        <AlertError
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      <ConfirmationPopup
        isOpen={showDeleteConfirmation}
        message="Apakah Anda yakin ingin menghapus data Vouching?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">
        <div className="mt-0 overflow-x-auto rounded-xl border border-[#DCE5EF]">
          <table className="w-full min-w-[1750px] border-collapse">
            <thead className="bg-[#F8FAFC]">
              <tr>
                {[
                  "No",
                  "Keterangan",
                  "Tanggal",
                  "No. Bukti",
                  "Nominal Internal",
                  "Bukti Internal",
                  "Nominal Eksternal",
                  "Bukti Eksternal",
                  "Selisih",
                  "Pihak Berelasi",
                  "Bukti",
                  "Approval PO",
                  "Approval INV",
                  "Approval DO",
                  "Aksi",
                ].map((header) => (
                  <th
                    key={header}
                    className="border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={15}
                    className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]"
                  >
                    Memuat data Vouching...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={15}
                    className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]"
                  >
                    Belum ada data Vouching.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const selisih =
                    toNumber(row.nominalInternal) -
                    toNumber(row.nominalEksternal);

                  return (
                    <tr
                      key={row.id}
                      data-row-id={row.id}
                      className="border-b border-[#EDF2F7]"
                    >
                      <td className="px-3 py-2 font-poppins text-sm text-[#475569]">
                        {index + 1}
                      </td>

                      <td className="min-w-[240px] px-3 py-2">
                        <input
                          type="text"
                          value={row.keterangan}
                          placeholder="Masukkan Keterangan"
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "keterangan",
                              event.target.value
                            )
                          }
                          className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]"
                        />
                      </td>

                      {/* TANGGAL: TAMPIL DD/MM/YYYY */}
                      <td className="min-w-[170px] px-3 py-2">
                        <TanggalIndonesia
                          value={row.tanggal || ""}
                          onChange={(value) =>
                            updateRow(
                              row.id,
                              "tanggal",
                              value
                            )
                          }
                        />
                      </td>

                      <td className="min-w-[150px] px-3 py-2">
                        <input
                          type="text"
                          value={row.noBukti}
                          placeholder="No. Bukti"
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "noBukti",
                              event.target.value
                            )
                          }
                          className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]"
                        />
                      </td>

                      <td className="px-3 py-2">
                        <div className="inline-flex h-10 min-w-[190px] w-max max-w-none items-center whitespace-nowrap rounded-xl border border-[#DCE5EF] bg-white px-3 transition focus-within:border-[#38BDF8]">
                          <span className="shrink-0 font-poppins text-sm text-[#64748B]">
                            Rp
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatNumber(row.nominalInternal)}
                            onChange={(event) =>
                              handleNominalChange(
                                row.id,
                                "nominalInternal",
                                event.target.value
                              )
                            }
                            className="[field-sizing:content] min-w-[80px] max-w-none shrink-0 bg-transparent pl-3 text-left font-poppins text-sm text-[#475569] outline-none"
                          />
                        </div>
                      </td>

                      <td className="min-w-[110px] px-3 py-2">
                        <input
                          id={`file-buktiInternal-${row.id}`}
                          type="file"
                          className="hidden"
                          onChange={(event) =>
                            handleFileChange(
                              event,
                              "buktiInternal",
                              row.id
                            )
                          }
                        />

                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenFile("buktiInternal", row.id)
                            }
                            className="font-poppins text-sm font-medium text-[#38BDF8] transition hover:underline"
                          >
                            File
                          </button>

                          {(row.buktiInternal instanceof File ||
                            row.buktiInternalExisting) && (
                            <button
                              type="button"
                              title="Lihat file"
                              onClick={() =>
                                handleViewFile("buktiInternal", row.id)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[#38BDF8] transition hover:bg-[#F1F5F9]"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <div className="inline-flex h-10 min-w-[190px] w-max max-w-none items-center whitespace-nowrap rounded-xl border border-[#DCE5EF] bg-white px-3 transition focus-within:border-[#38BDF8]">
                          <span className="shrink-0 font-poppins text-sm text-[#64748B]">
                            Rp
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatNumber(row.nominalEksternal)}
                            onChange={(event) =>
                              handleNominalChange(
                                row.id,
                                "nominalEksternal",
                                event.target.value
                              )
                            }
                            className="[field-sizing:content] min-w-[80px] max-w-none shrink-0 bg-transparent pl-3 text-left font-poppins text-sm text-[#475569] outline-none"
                          />
                        </div>
                      </td>

                      <td className="min-w-[110px] px-3 py-2">
                        <input
                          id={`file-buktiEksternal-${row.id}`}
                          type="file"
                          className="hidden"
                          onChange={(event) =>
                            handleFileChange(
                              event,
                              "buktiEksternal",
                              row.id
                            )
                          }
                        />

                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenFile("buktiEksternal", row.id)
                            }
                            className="font-poppins text-sm font-medium text-[#38BDF8] transition hover:underline"
                          >
                            File
                          </button>

                          {(row.buktiEksternal instanceof File ||
                            row.buktiEksternalExisting) && (
                            <button
                              type="button"
                              title="Lihat file"
                              onClick={() =>
                                handleViewFile("buktiEksternal", row.id)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[#38BDF8] transition hover:bg-[#F1F5F9]"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <div className="inline-flex h-10 min-w-[190px] w-max max-w-none items-center whitespace-nowrap rounded-xl border border-[#DCE5EF] bg-[#F8FAFC] px-3">
                          <span className="shrink-0 font-poppins text-sm text-[#64748B]">
                            Rp
                          </span>
                          <span className="shrink-0 pl-3 font-poppins text-sm text-[#64748B]">
                            {formatNumber(selisih)}
                          </span>
                        </div>
                      </td>

                      <td
                        className="min-w-[180px] px-3 py-2"
                        onPointerDown={(event) =>
                          handlePihakBerelasiPointerDown(event, row.id)
                        }
                      >
                        <Dropdown
                          value={row.pihakBerelasi || ""}
                          placeholder="Pilih Pihak"
                          showCheck={false}
                          options={[
                            { value: "Tidak", label: "Tidak" },
                            { value: "Ya", label: "Ya" },
                          ]}
                          onChange={(value) =>
                            updateRow(row.id, "pihakBerelasi", value)
                          }
                          className="[&>button]:h-10 [&>button]:min-h-10 [&>button]:rounded-xl [&>button]:border-[#DCE5EF] [&>button]:bg-white [&>button]:px-3 [&>button]:font-poppins [&>button]:text-sm [&>button_span]:text-[#475569]"
                        />
                      </td>

                      <td className="min-w-[100px] px-3 py-2">
                        <input
                          id={`file-bukti-${row.id}`}
                          type="file"
                          className="hidden"
                          onChange={(event) =>
                            handleFileChange(event, "bukti", row.id)
                          }
                        />

                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenFile("bukti", row.id)
                            }
                            className="font-poppins text-sm font-medium text-[#38BDF8] transition hover:underline"
                          >
                            File
                          </button>

                          {(row.bukti instanceof File ||
                            row.buktiExisting) && (
                            <button
                              type="button"
                              title="Lihat file"
                              onClick={() =>
                                handleViewFile("bukti", row.id)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[#38BDF8] transition hover:bg-[#F1F5F9]"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                        </div>
                      </td>

                      {[
                        ["approvalPO", "approvalPO"],
                        ["approvalINV", "approvalINV"],
                        ["approvalDO", "approvalDO"],
                      ].map(([field, key]) => (
                        <td key={key} className="px-3 py-2">
                          <div className="flex justify-center">
                            <label className="relative flex h-4 w-4 cursor-pointer items-center justify-center">
                              <input
                                type="checkbox"
                                checked={Boolean(row[field])}
                                onChange={(event) =>
                                  updateRow(
                                    row.id,
                                    field,
                                    event.target.checked
                                  )
                                }
                                className="peer absolute h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-[#CBD5E1] bg-white checked:border-[#38BDF8] checked:bg-[#38BDF8]"
                              />
                              <svg
                                viewBox="0 0 12 12"
                                className="pointer-events-none absolute h-3 w-3 opacity-0 transition peer-checked:opacity-100"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M2 6l2.5 2.5L10 3" />
                              </svg>
                            </label>
                          </div>
                        </td>
                      ))}

                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            title="Hapus"
                            disabled={saving}
                            onClick={() => handleDeleteClick(row.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition duration-200 hover:bg-red-50 hover:text-red-600 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
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
          </table>
        </div>

        <div className="mt-4 flex justify-center">
          <AddDataButton
            onClick={handleAddRow}
            disabled={saving || loading || !pendapatanUsahaId}
            label="Tambah Data"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <SaveButton
            onClick={handleSave}
            disabled={saving || loading || !pendapatanUsahaId}
            isSaving={saving}
            label="Simpan"
            savingLabel="Menyimpan..."
          />
        </div>

        <div aria-hidden="true" className="h-[600px] w-full" />
      </div>
    </div>
  );
}

