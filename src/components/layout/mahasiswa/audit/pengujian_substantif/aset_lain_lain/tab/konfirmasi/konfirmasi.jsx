
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useParams, useSearchParams } from "next/navigation";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Upload,
  X,
  LoaderCircle,
} from "lucide-react";

import AddDataButton from "@/components/button/add_data_button";
import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const API_ENDPOINT = `${API_BASE_URL}/api/konfirmasi-aset-lain`;
const ITEMS_PER_PAGE = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
  "doc",
  "docx",
  "xls",
  "xlsx",
];

const PREVIEW_EXTENSIONS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
  "avif",
  "ico",
  "tif",
  "tiff",
];

const EMPTY_FORM = {
  NamaCustomer: "",
  KotaCustomer: "",
  Jumlah: "0",
  File: null,
  NamaFile: "",
};

/* =====================================================
   HELPER
===================================================== */

function normalizeId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getExtension(filename = "") {
  return filename.split(".").pop()?.toLowerCase() || "";
}

function truncateFileName(filename = "", maxLength = 55) {
  if (filename.length <= maxLength) return filename;

  const extension = getExtension(filename);
  const suffix = extension ? `...${extension}` : "...";

  return `${filename.slice(0, maxLength - suffix.length)}${suffix}`;
}

function getAsetLainId(item) {
  return normalizeId(
    item?.AsetLainID ??
      item?.asetLainID ??
      item?.asetLainId ??
      item?.aset_lain_id ??
      item?.asetLain?.AsetLainID ??
      item?.asetLain?.asetLainID ??
      item?.asetLain?.asetLainId ??
      item?.asetLain?.id ??
      item?.aset_lain?.AsetLainID ??
      item?.aset_lain?.asetLainID ??
      item?.aset_lain?.asetLainId ??
      item?.aset_lain?.id
  );
}

function getKonfirmasiId(item) {
  return normalizeId(
    item?.KonfirmasiAsetLainID ??
      item?.konfirmasiAsetLainID ??
      item?.konfirmasiAsetLainId ??
      item?.id
  );
}

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/* =====================================================
   API REQUEST
===================================================== */

async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

async function apiRequest(url, options = {}) {
  const response = await fetchWithAuth(url, options);

  if (response.status === 401) {
    throw new Error(
      "Sesi login tidak valid atau telah berakhir. Silakan login kembali."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Kamu tidak memiliki akses untuk melakukan tindakan ini."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let result = null;

  if (contentType.includes("application/json")) {
    result = await response.json();
  } else if (response.status !== 204) {
    const responseText = await response.text();

    if (responseText) {
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: responseText };
      }
    }
  }

  if (!response.ok) {
    const validationErrors = result?.errors
      ? Object.values(result.errors).flat().join(" ")
      : "";

    throw new Error(
      validationErrors ||
        result?.message ||
        `Request gagal dengan status ${response.status}.`
    );
  }

  return result;
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function KonfirmasiAsetLainLainPage({
  auditId,
  jwbKasusId: jwbKasusIdProp,
  asetLainId: asetLainIdProp,
  tokenOf = 0,
  refetchToken = 0,
  onSaved,
  notifySaved,
}) {
  const params = useParams();
  const searchParams = useSearchParams();

  /* =====================================================
     RESOLVE ID FROM PROPS / URL
  ===================================================== */

  const activeAsetLainId = useMemo(() => {
    return (
      normalizeId(asetLainIdProp) ||
      normalizeId(searchParams?.get("AsetLainID")) ||
      normalizeId(searchParams?.get("asetLainId")) ||
      normalizeId(searchParams?.get("aset_lain_id")) ||
      normalizeId(params?.AsetLainID) ||
      normalizeId(params?.asetLainId) ||
      normalizeId(params?.aset_lain_id) ||
      null
    );
  }, [asetLainIdProp, searchParams, params]);

  const activeJwbKasusId = useMemo(() => {
    return (
      normalizeId(auditId) ||
      normalizeId(jwbKasusIdProp) ||
      normalizeId(searchParams?.get("JwbKasusID")) ||
      normalizeId(searchParams?.get("jwbKasusId")) ||
      normalizeId(searchParams?.get("jwb_kasus_id")) ||
      normalizeId(params?.jwbKasusId) ||
      normalizeId(params?.JwbKasusID) ||
      normalizeId(params?.jwb_kasus_id) ||
      normalizeId(params?.id) ||
      null
    );
  }, [auditId, jwbKasusIdProp, searchParams, params]);

  /* =====================================================
     STATES
  ===================================================== */

  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [asetLainId, setAsetLainId] = useState(
    activeAsetLainId ? String(activeAsetLainId) : ""
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const [errorAlert, setErrorAlert] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingData, setDeletingData] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [downloadingId, setDownloadingId] = useState(null);

  const fileInputRef = useRef(null);

  /* =====================================================
     ALERT
  ===================================================== */

  const showError = useCallback((title, message) => {
    setErrorAlert({ title, message });
    setSuccessAlert(null);
  }, []);

  const showSuccess = useCallback((title, message) => {
    setSuccessAlert({ title, message });
    setErrorAlert(null);
  }, []);

  /* =====================================================
     LOAD DATA
     1. GET ASET LAIN UNTUK MENDAPATKAN ASETLAINID
     2. GET KONFIRMASI ASET LAIN
  ===================================================== */

  const loadData = useCallback(async () => {
    let selectedAsetId =
      normalizeId(asetLainId) || activeAsetLainId;

    /*
     * Jika AsetLainID belum ada dari props atau URL,
     * ambil melalui endpoint berdasarkan JwbKasusID.
     */
    if (!selectedAsetId && activeJwbKasusId) {
      const asetResult = await apiRequest(
        `${API_BASE_URL}/api/aset-lain/${activeJwbKasusId}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (asetResult?.success === false) {
        throw new Error(
          asetResult.message ||
            "Gagal mengambil data Aset Lain."
        );
      }

      selectedAsetId = normalizeId(
        asetResult?.data?.AsetLainID
      );

      if (!selectedAsetId) {
        throw new Error(
          "AsetLainID tidak ditemukan pada respons API Aset Lain."
        );
      }

      setAsetLainId(String(selectedAsetId));
    }

    /*
     * Jangan mengambil daftar konfirmasi apabila ID induk
     * belum diketahui, agar data tidak tercampur.
     */
    if (!selectedAsetId) {
      throw new Error(
        "ID Aset Lain belum tersedia. Pastikan jwbKasusId dikirim melalui props atau parameter URL."
      );
    }

    /*
     * Ambil data konfirmasi.
     * Endpoint index mengembalikan data konfirmasi milik
     * pengguna yang sedang login.
     */
    const result = await apiRequest(
      `${API_ENDPOINT}?_=${Date.now()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (result?.success === false) {
      throw new Error(
        result.message ||
          "Gagal mengambil data konfirmasi aset lain."
      );
    }

    const items = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];

    /*
     * Filter berdasarkan AsetLainID yang didapat dari
     * endpoint aset-lain atau dari props/URL.
     */
    const filteredItems = items.filter(
      (item) => getAsetLainId(item) === selectedAsetId
    );

    setDataList(filteredItems);
    setCurrentPage(1);
  }, [
    asetLainId,
    activeAsetLainId,
    activeJwbKasusId,
  ]);

  /* =====================================================
     REFRESH PAGE
  ===================================================== */

  const refreshPage = useCallback(async () => {
    setLoading(true);

    try {
      await loadData();
    } catch (error) {
      console.error(
        "ERROR LOAD KONFIRMASI ASET LAIN:",
        error
      );

      showError(
        "Gagal Memuat Data",
        error?.message ||
          "Data Konfirmasi Aset Lain-Lain gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, [loadData, showError]);

  const effectiveRefetchToken = refetchToken || tokenOf || 0;

  useEffect(() => {
    refreshPage();
  }, [refreshPage, effectiveRefetchToken]);

  useEffect(() => {
    if (activeAsetLainId) {
      setAsetLainId(String(activeAsetLainId));
    }
  }, [activeAsetLainId]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(dataList.length / ITEMS_PER_PAGE)
  );

  const currentRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return dataList.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [dataList, currentPage]);

  const firstEntry =
    dataList.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const lastEntry = Math.min(
    currentPage * ITEMS_PER_PAGE,
    dataList.length
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =====================================================
     FORM HANDLERS
  ===================================================== */

  const handleChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openCreateModal = () => {
    const resolvedId =
      normalizeId(asetLainId) || activeAsetLainId;

    if (!resolvedId) {
      showError(
        "ID Aset Tidak Ditemukan",
        "AsetLainID belum tersedia. Pastikan jwbKasusId tersedia melalui props atau URL agar ID aset dapat diambil dari backend."
      );

      return;
    }

    setAsetLainId(String(resolvedId));
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setModalOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openEditModal = (item) => {
    const id = getKonfirmasiId(item);

    if (!id) {
      showError(
        "Gagal Mengedit Data",
        "ID konfirmasi tidak ditemukan."
      );

      return;
    }

    setEditingId(id);

    setFormData({
      NamaCustomer: item.NamaCustomer || "",
      KotaCustomer: item.KotaCustomer || "",
      Jumlah: String(item.Jumlah ?? 0),
      File: null,
      NamaFile: item.NamaFile || "",
    });

    setModalOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     FILE UPLOAD
  ===================================================== */

  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const extension = getExtension(file.name);

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      showError(
        "Format File Tidak Sesuai",
        "Format yang didukung: PDF, JPG, JPEG, PNG, GIF, WEBP, BMP, SVG, DOC, DOCX, XLS, dan XLSX."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showError(
        "Ukuran File Terlalu Besar",
        "Ukuran file maksimal 2 MB."
      );

      event.target.value = "";
      return;
    }

    setFormData((previous) => ({
      ...previous,
      File: file,
      NamaFile: file.name,
    }));
  };

  const removeSelectedFile = () => {
    setFormData((previous) => ({
      ...previous,
      File: null,
      NamaFile: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     CREATE / UPDATE
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (!formData.NamaCustomer.trim()) {
      showError("Validasi", "Nama customer wajib diisi.");
      return;
    }

    if (!formData.KotaCustomer.trim()) {
      showError("Validasi", "Asal kota wajib diisi.");
      return;
    }

    if (
      formData.Jumlah === "" ||
      formData.Jumlah === null ||
      formData.Jumlah === undefined
    ) {
      showError("Validasi", "Saldo wajib diisi.");
      return;
    }

    const resolvedAsetId =
      normalizeId(asetLainId) || activeAsetLainId;

    if (editingId === null && !resolvedAsetId) {
      showError(
        "ID Aset Tidak Ditemukan",
        "Data belum dapat disimpan karena AsetLainID belum ditemukan."
      );

      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      const isEditing = editingId !== null;

      if (!isEditing) {
        payload.append("AsetLainID", String(resolvedAsetId));
      }

      payload.append(
        "NamaCustomer",
        formData.NamaCustomer.trim()
      );

      payload.append(
        "KotaCustomer",
        formData.KotaCustomer.trim()
      );

      payload.append(
        "Jumlah",
        String(Number(formData.Jumlah || 0))
      );

      if (formData.File) {
        payload.append("File", formData.File);
      }

      const url = isEditing
        ? `${API_ENDPOINT}/${editingId}`
        : API_ENDPOINT;

      if (isEditing) {
        payload.append("_method", "PUT");
      }

      const result = await apiRequest(url, {
        method: "POST",
        body: payload,
      });

      if (result?.success === false) {
        throw new Error(
          result.message || "Data gagal disimpan."
        );
      }

      setModalOpen(false);
      setEditingId(null);
      setFormData({ ...EMPTY_FORM });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      showSuccess(
        "Berhasil",
        result?.message ||
          (isEditing
            ? "Data berhasil diperbarui."
            : "Data berhasil ditambahkan.")
      );

      await refreshPage();
      onSaved?.();
      notifySaved?.("konfirmasi");
    } catch (error) {
      console.error(
        "ERROR SIMPAN KONFIRMASI ASET LAIN:",
        error
      );

      showError(
        "Gagal Menyimpan Data",
        error?.message || "Data gagal disimpan."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const openDeleteModal = (item) => {
    setDeletingData(item);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteModalOpen(false);
    setDeletingData(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingData || deleting) return;

    const id = getKonfirmasiId(deletingData);

    if (!id) {
      showError(
        "Gagal Menghapus Data",
        "ID konfirmasi tidak ditemukan."
      );

      return;
    }

    try {
      setDeleting(true);

      const result = await apiRequest(
        `${API_ENDPOINT}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (result?.success === false) {
        throw new Error(
          result.message || "Data gagal dihapus."
        );
      }

      setDeleteModalOpen(false);
      setDeletingData(null);

      showSuccess(
        "Berhasil",
        result?.message || "Data berhasil dihapus."
      );

      await refreshPage();
      onSaved?.();
      notifySaved?.("konfirmasi");
    } catch (error) {
      console.error(
        "ERROR HAPUS KONFIRMASI ASET LAIN:",
        error
      );

      showError(
        "Gagal Menghapus Data",
        error?.message || "Data gagal dihapus."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =====================================================
     PREVIEW / DOWNLOAD FILE
  ===================================================== */

  const handleDownload = async (item) => {
    const id = getKonfirmasiId(item);
    const filename = item.NamaFile || "";
    const extension = getExtension(filename);

    if (!id) {
      showError(
        "File Tidak Tersedia",
        "ID konfirmasi tidak ditemukan."
      );
      return;
    }

    if (!filename) {
      showError(
        "File Tidak Tersedia",
        "Data ini belum memiliki file konfirmasi."
      );
      return;
    }

    const shouldPreview =
      PREVIEW_EXTENSIONS.includes(extension);

    let previewTab = null;

    if (shouldPreview) {
      previewTab = window.open("about:blank", "_blank");

      if (!previewTab) {
        showError(
          "Tab Tidak Dapat Dibuka",
          "Browser memblokir tab baru. Izinkan pop-up untuk situs aplikasi ini, lalu coba kembali."
        );
        return;
      }

      try {
        previewTab.document.title = "Memuat file...";
        previewTab.document.body.innerHTML =
          '<p style="font-family:Arial,sans-serif;padding:24px;color:#475569">Memuat file, mohon tunggu...</p>';
      } catch {
        // Abaikan jika dokumen tab belum bisa diakses.
      }
    }

    setDownloadingId(id);

    let objectUrl = null;

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan. Silakan login kembali."
        );
      }

      const response = await fetch(
        `${API_ENDPOINT}/${id}/file`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error(
          "Sesi login tidak valid atau telah berakhir. Silakan login kembali."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Kamu tidak memiliki akses untuk membuka file ini."
        );
      }

      if (!response.ok) {
        let message = "File gagal diakses.";

        const contentType =
          response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const result = await response.json();
          message = result.message || message;
        } else if (response.status === 404) {
          message = "File tidak ditemukan di server.";
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error(
          "File yang diterima dari backend kosong."
        );
      }

      const mimeByExtension = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        bmp: "image/bmp",
        svg: "image/svg+xml",
        avif: "image/avif",
        ico: "image/x-icon",
        tif: "image/tiff",
        tiff: "image/tiff",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      const mimeType =
        mimeByExtension[extension] ||
        blob.type ||
        "application/octet-stream";

      objectUrl = URL.createObjectURL(
        new Blob([blob], { type: mimeType })
      );

      if (shouldPreview) {
        if (!previewTab || previewTab.closed) {
          throw new Error(
            "Tab pratinjau ditutup sebelum file selesai dimuat. Silakan coba kembali."
          );
        }

        previewTab.location.replace(objectUrl);

        window.setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 5 * 60 * 1000);
      } else {
        const link = document.createElement("a");

        link.href = objectUrl;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 60 * 1000);
      }
    } catch (error) {
      if (previewTab && !previewTab.closed) {
        previewTab.close();
      }

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      console.error(
        "ERROR PREVIEW/DOWNLOAD FILE:",
        error
      );

      showError(
        shouldPreview
          ? "Gagal Membuka File"
          : "Gagal Mengunduh File",
        error?.message || "File gagal diproses."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="font-poppins text-[#334155]">
      {errorAlert && (
        <AlertError
          title={errorAlert.title}
          message={errorAlert.message}
          onClose={() => setErrorAlert(null)}
        />
      )}

      {successAlert && (
        <AlertSuccess
          title={successAlert.title}
          message={successAlert.message}
          onClose={() => setSuccessAlert(null)}
        />
      )}

      <ConfirmationPopup
        isOpen={deleteModalOpen}
        message="Apakah Anda yakin ingin menghapus data Konfirmasi Aset Lain-Lain?"
        subText={deletingData?.NamaCustomer || ""}
        confirmText={deleting ? "Menghapus..." : "Hapus"}
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">
        <div className="flex justify-end">
          <AddDataButton
            onClick={openCreateModal}
            disabled={loading}
            label="Tambah Data"
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-[#DCE5EF]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead className="bg-[#F8FAFC]">
                <tr className="border-b border-[#DCE5EF]">
                  <th className="w-[65px] px-4 py-4 text-left text-[11px] font-semibold text-[#64748B]">
                    NO
                  </th>
                  <th className="w-[220px] px-4 py-4 text-left text-[11px] font-semibold text-[#64748B]">
                    NAMA CUSTOMER
                  </th>
                  <th className="w-[180px] px-4 py-4 text-left text-[11px] font-semibold text-[#64748B]">
                    ASAL KOTA
                  </th>
                  <th className="w-[170px] px-4 py-4 text-left text-[11px] font-semibold text-[#64748B]">
                    SALDO
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-semibold text-[#64748B]">
                    FILE KONFIRMASI ASET LAIN-LAIN
                  </th>
                  <th className="w-[120px] px-4 py-4 text-center text-[11px] font-semibold text-[#64748B]">
                    AKSI
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-[#64748B]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                        Memuat data...
                      </span>
                    </td>
                  </tr>
                ) : currentRows.length > 0 ? (
                  currentRows.map((item, index) => {
                    const id = getKonfirmasiId(item);

                    return (
                      <tr
                        key={id ?? `${item.NamaCustomer}-${index}`}
                        className="border-b border-[#EDF1F6] transition last:border-b-0 hover:bg-[#FCFDFE]"
                      >
                        <td className="px-4 py-4 text-[12px] text-[#475569]">
                          {(currentPage - 1) * ITEMS_PER_PAGE +
                            index +
                            1}
                        </td>

                        <td className="px-4 py-4 text-[12px] text-[#475569]">
                          {item.NamaCustomer}
                        </td>

                        <td className="px-4 py-4 text-[12px] text-[#475569]">
                          {item.KotaCustomer}
                        </td>

                        <td className="px-4 py-3">
                          <div className="inline-flex h-10 w-fit min-w-[150px] items-center rounded-xl border border-[#DCE5EF] bg-[#F8FAFC] px-3 text-sm text-[#64748B]">
                            <span className="mr-2 shrink-0">Rp</span>
                            <span>{formatRupiah(item.Jumlah)}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {item.NamaFile ? (
                            <button
                              type="button"
                              onClick={() => handleDownload(item)}
                              disabled={downloadingId === id}
                              title={item.NamaFile}
                              className="flex max-w-full items-start text-left text-[12px] text-[#0EA5E9] transition hover:text-[#0878ED] hover:underline disabled:opacity-50"
                            >
                              {downloadingId === id && (
                                <LoaderCircle
                                  size={15}
                                  className="mr-2 mt-0.5 shrink-0 animate-spin"
                                />
                              )}
                              <span className="break-words">
                                {truncateFileName(item.NamaFile)}
                              </span>
                            </button>
                          ) : (
                            <span className="text-[12px] text-gray-400">
                              Belum ada file
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              title="Edit"
                              aria-label="Edit data"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#334155] transition hover:bg-[#F1F5F9]"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(item)}
                              title="Hapus"
                              aria-label="Hapus data"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#EF4444] transition hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-gray-400"
                    >
                      Belum ada data Konfirmasi Aset Lain-Lain.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#71819B]">
            Showing {firstEntry} to {lastEntry} of {dataList.length} entries
          </p>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.max(1, previous - 1)
                )
              }
              aria-label="Halaman sebelumnya"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#35445A] transition hover:bg-[#F1F6FB] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={17} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`h-8 min-w-8 rounded-md px-2 text-xs font-semibold transition ${
                  currentPage === page
                    ? "bg-[#E0F2FE] text-[#0EA5E9]"
                    : "text-[#5E6D82] hover:bg-[#F1F6FB]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.min(totalPages, previous + 1)
                )
              }
              aria-label="Halaman berikutnya"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#35445A] transition hover:bg-[#F1F6FB] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CREATE / EDIT */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="my-auto w-full max-w-[600px] overflow-hidden rounded-xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.25)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#38BDF8] px-6 py-5 text-white">
              <div className="min-w-0">
                <h2 className="font-poppins text-lg font-semibold">
                  {editingId !== null ? "Edit Data" : "Tambah Data"}
                </h2>

                <p className="mt-1 font-poppins text-sm text-white/80">
                  {editingId !== null
                    ? "Perbarui data Konfirmasi Aset Lain-Lain"
                    : "Tambahkan data Konfirmasi Aset Lain-Lain"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Tutup pop-up"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
                <div>
                  <label
                    htmlFor="namaCustomer"
                    className="mb-2 block font-poppins text-sm font-semibold text-[#475569]"
                  >
                    Nama Customer
                  </label>

                  <input
                    id="namaCustomer"
                    type="text"
                    value={formData.NamaCustomer}
                    onChange={(event) =>
                      handleChange("NamaCustomer", event.target.value)
                    }
                    placeholder="Masukkan nama customer"
                    required
                    className="h-12 w-full rounded-xl border border-[#DCE5EF] bg-white px-4 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#A0A9B8] focus:border-[#38BDF8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="kotaCustomer"
                    className="mb-2 block font-poppins text-sm font-semibold text-[#475569]"
                  >
                    Asal Kota
                  </label>

                  <input
                    id="kotaCustomer"
                    type="text"
                    value={formData.KotaCustomer}
                    onChange={(event) =>
                      handleChange("KotaCustomer", event.target.value)
                    }
                    placeholder="Masukkan asal kota"
                    required
                    className="h-12 w-full rounded-xl border border-[#DCE5EF] bg-white px-4 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#A0A9B8] focus:border-[#38BDF8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="jumlah"
                    className="mb-2 block font-poppins text-sm font-semibold text-[#475569]"
                  >
                    Saldo
                  </label>

                  <div className="flex h-12 w-full items-center rounded-xl border border-[#DCE5EF] bg-white px-4 transition focus-within:border-[#38BDF8]">
                    <span className="mr-2 shrink-0 font-poppins text-sm text-[#64748B]">
                      Rp
                    </span>

                    <input
                      id="jumlah"
                      type="text"
                      inputMode="numeric"
                      value={
                        formData.Jumlah === ""
                          ? ""
                          : formatRupiah(formData.Jumlah)
                      }
                      onChange={(event) => {
                        const value = event.target.value.replace(/\D/g, "");
                        handleChange("Jumlah", value);
                      }}
                      placeholder="0"
                      required
                      className="min-w-0 flex-1 bg-transparent font-poppins text-sm text-[#475569] outline-none placeholder:text-[#A0A9B8]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="fileKonfirmasi"
                    className="mb-2 block font-poppins text-sm font-semibold text-[#475569]"
                  >
                    File Surat Konfirmasi
                  </label>

                  <input
                    ref={fileInputRef}
                    id="fileKonfirmasi"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg,.avif,.ico,.tif,.tiff,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelected}
                    className="hidden"
                  />

                  <div className="flex min-h-12 items-center overflow-hidden rounded-xl border border-[#DCE5EF] bg-white transition focus-within:border-[#38BDF8]">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-12 shrink-0 items-center gap-2 border-r border-[#DCE5EF] px-4 font-poppins text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC]"
                    >
                      <Upload size={15} />
                      Choose File
                    </button>

                    <div className="min-w-0 flex-1 px-4">
                      <span
                        title={formData.File?.name || formData.NamaFile}
                        className={`block truncate font-poppins text-sm ${
                          formData.NamaFile
                            ? "text-[#38BDF8]"
                            : "text-[#94A3B8]"
                        }`}
                      >
                        {formData.File?.name ||
                          formData.NamaFile ||
                          "Pilih file yang akan di-upload"}
                      </span>
                    </div>

                    {formData.NamaFile && (
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        aria-label="Hapus file yang dipilih"
                        className="flex h-12 w-10 shrink-0 items-center justify-center text-[#94A3B8] transition hover:bg-red-50 hover:text-red-500"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <p className="mt-2 font-poppins text-[11px] text-[#94A3B8]">
                    PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, GIF,
                    WEBP, BMP, SVG. Maksimal ukuran file 2 MB.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#DCE5EF] px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-md bg-[#FF3030] px-6 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#E11D1D] disabled:opacity-40"
                >
                  Keluar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-[#00A51A] px-6 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#008C16] disabled:opacity-40"
                >
                  {submitting
                    ? "Menyimpan..."
                    : editingId !== null
                      ? "Update"
                      : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
