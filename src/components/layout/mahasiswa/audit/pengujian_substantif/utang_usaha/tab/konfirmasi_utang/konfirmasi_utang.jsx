
"use client";

import {
  useCallback,
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
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import AddDataButton from "@/components/button/add_data_button";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const KONFIRMASI_ENDPOINT =
  `${API_URL}/api/konfirmasi-utang-usaha`;

const konfirmasiPageCache = new Map();

const INITIAL_FORM = {
  namaCustomer: "",
  kotaCustomer: "",
  jumlah: "",
  file: null,
  namaFile: "",
};

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

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
  if (
    result?.errors &&
    typeof result.errors === "object"
  ) {
    const firstError = Object.values(result.errors)
      .flat()
      .find(Boolean);

    if (firstError) return firstError;
  }

  return (
    result?.message ||
    result?.error ||
    result?.raw ||
    fallback
  );
};

const isMalformedUtf8Error = (result) => {
  const message = String(
    result?.message ||
      result?.error ||
      result?.raw ||
      ""
  ).toLowerCase();

  return (
    message.includes("malformed utf-8") ||
    message.includes("malformed utf8") ||
    message.includes("incorrectly encoded")
  );
};

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(
    Number(value) || 0
  );

const formatInputRupiah = (value) => {
  const cleaned = String(value ?? "").replace(/\D/g, "");

  if (!cleaned) return "";

  return new Intl.NumberFormat("id-ID").format(
    Number(cleaned)
  );
};

const parseRupiah = (value) => {
  const cleaned = String(value ?? "").replace(/\D/g, "");

  return cleaned ? Number(cleaned) : 0;
};

const normalizeId = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const rawValue = Array.isArray(value)
    ? value[0]
    : value;

  const id = Number(rawValue);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

const getUtangUsahaId = (item) =>
  normalizeId(
    item?.UtangUsahaID ??
      item?.utangUsahaID ??
      item?.utangUsahaId ??
      item?.utangUsaha?.UtangUsahaID ??
      item?.utangUsaha?.utangUsahaID ??
      item?.utangUsaha?.id ??
      item?.utang_usaha?.UtangUsahaID ??
      item?.utang_usaha?.utangUsahaID ??
      item?.utang_usaha?.id
  );

const getJwbKasusIdFromUtangUsaha = (item) => {
  const relation =
    item?.utangUsaha ??
    item?.utang_usaha ??
    item;

  return normalizeId(
    relation?.JwbKasusID ??
      relation?.jwbKasusID ??
      relation?.jwbKasusId ??
      relation?.jwb_kasus_id ??
      relation?.JwbKasus?.JwbKasusID ??
      relation?.jwbKasus?.JwbKasusID ??
      relation?.jwbKasus?.id
  );
};

const normalizeKonfirmasi = (item) => ({
  id: normalizeId(
    item?.KonfirmasiUtangUsahaID ??
      item?.konfirmasiUtangUsahaID ??
      item?.konfirmasiUtangUsahaId ??
      item?.id
  ),

  utangUsahaId: getUtangUsahaId(item),

  namaCustomer:
    item?.NamaCustomer ??
    item?.namaCustomer ??
    "",

  kotaCustomer:
    item?.KotaCustomer ??
    item?.kotaCustomer ??
    "",

  jumlah: Number(
    item?.Jumlah ?? item?.jumlah ?? 0
  ),

  namaFile:
    item?.NamaFile ??
    item?.namaFile ??
    "",

  tipeFile:
    item?.TipeFile ??
    item?.tipeFile ??
    "",

  createdAt:
    item?.created_at ??
    item?.createdAt ??
    null,

  updatedAt:
    item?.updated_at ??
    item?.updatedAt ??
    null,

  utangUsaha:
    item?.utangUsaha ??
    item?.utang_usaha ??
    null,
});

const unwrapResponse = (result) => {
  let value = result;

  for (let i = 0; i < 3; i += 1) {
    if (
      value &&
      !Array.isArray(value) &&
      value.data !== undefined
    ) {
      value = value.data;
    } else {
      break;
    }
  }

  return value;
};

const extractUtangUsahaId = (result) => {
  const candidates = [
    result,
    result?.data,
    result?.utangUsaha,
    result?.utang_usaha,
    result?.data?.utangUsaha,
    result?.data?.utang_usaha,
    result?.data?.data,
    result?.data?.data?.utangUsaha,
    result?.data?.data?.utang_usaha,
  ];

  for (const candidate of candidates) {
    const id = getUtangUsahaId(candidate);

    if (id) return id;
  }

  const unwrapped = unwrapResponse(result);

  return getUtangUsahaId(unwrapped);
};

export default function KonfirmasiUtangUsaha({
  jwbKasusId: jwbKasusIdProp,
  utangUsahaId: utangUsahaIdProp,
  onSaved,
}) {
  const params = useParams();
  const searchParams = useSearchParams();

  const activeJwbKasusId = useMemo(() => {
    const fromProp = normalizeId(jwbKasusIdProp);

    if (fromProp) return fromProp;

    const fromNamedParam = normalizeId(
      params?.jwbKasusId ??
        params?.JwbKasusID ??
        params?.jwb_kasus_id
    );

    if (fromNamedParam) return fromNamedParam;

    const fromId = normalizeId(params?.id);

    if (fromId) return fromId;

    return normalizeId(
      searchParams?.get("JwbKasusID") ??
        searchParams?.get("jwbKasusId") ??
        searchParams?.get("jwb_kasus_id")
    );
  }, [
    jwbKasusIdProp,
    params,
    searchParams,
  ]);

  const [dataList, setDataList] = useState(() => {
    if (!activeJwbKasusId) return [];

    return (
      konfirmasiPageCache.get(
        String(activeJwbKasusId)
      )?.data || []
    );
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState(false);

  const [utangUsahaId, setUtangUsahaId] = useState(
    () => normalizeId(utangUsahaIdProp)
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.max(
    1,
    Math.ceil(dataList.length / itemsPerPage)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = dataList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const showingFrom =
    dataList.length === 0 ? 0 : startIndex + 1;

  const showingTo =
    dataList.length === 0
      ? 0
      : Math.min(
          startIndex + currentData.length,
          dataList.length
        );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingId, setEditingId] = useState(null);

  const modalTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    ...INITIAL_FORM,
  });

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [deletingData, setDeletingData] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [errorAlert, setErrorAlert] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);

  const alertTimerRef = useRef({
    error: null,
    success: null,
  });

  const showErrorAlert = useCallback((title, message) => {
    if (alertTimerRef.current.error) {
      clearTimeout(alertTimerRef.current.error);
    }

    setErrorAlert({ title, message });

    alertTimerRef.current.error = window.setTimeout(
      () => setErrorAlert(null),
      3400
    );
  }, []);

  const showSuccessAlert = useCallback((title, message) => {
    if (alertTimerRef.current.success) {
      clearTimeout(alertTimerRef.current.success);
    }

    setSuccessAlert({ title, message });

    alertTimerRef.current.success = window.setTimeout(
      () => setSuccessAlert(null),
      3400
    );
  }, []);

  const saveCurrentCache = useCallback(
    (activeUtangUsahaId, data) => {
      if (!activeJwbKasusId) return;

      konfirmasiPageCache.set(
        String(activeJwbKasusId),
        {
          utangUsahaId: normalizeId(activeUtangUsahaId),
          data: data || [],
        }
      );
    },
    [activeJwbKasusId]
  );

  /*
   * Mendapatkan UtangUsahaID berdasarkan JwbKasusID.
   * Tidak menggunakan konstanta UTANG_USAHA_ENDPOINT.
   *
   * Catatan: request ini tetap memanggil endpoint
   * /api/utang-usaha/{JwbKasusID}.
   */
  const resolveUtangUsahaId = useCallback(async () => {
    const kasusId = normalizeId(activeJwbKasusId);

    if (!kasusId) {
      throw new Error(
        "JwbKasusID aktif tidak ditemukan. Pastikan halaman dibuka dari kasus yang benar."
      );
    }

    const response = await fetchWithAuth(
      `${API_URL}/api/utang-usaha/${encodeURIComponent(
        String(kasusId)
      )}?_=${Date.now()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const result = await parseResponse(response);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Sesi login tidak valid. Silakan login kembali."
        );
      }

      throw new Error(
        getApiError(
          result,
          "Gagal mengambil data Utang Usaha untuk kasus ini."
        )
      );
    }

    const resolvedId = extractUtangUsahaId(result);

    if (!resolvedId) {
      throw new Error(
        "UtangUsahaID tidak ditemukan pada response GET /api/utang-usaha/{jwbKasusId}. Periksa response method show pada UtangUsahaController."
      );
    }

    setUtangUsahaId(resolvedId);

    return resolvedId;
  }, [activeJwbKasusId]);

  const fetchKonfirmasiUtangUsaha = useCallback(
    async (activeUtangUsahaId = null) => {
      const response = await fetchWithAuth(
        `${KONFIRMASI_ENDPOINT}?_=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await parseResponse(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Unauthenticated. Token login tidak diterima oleh Laravel."
          );
        }

        throw new Error(
          getApiError(
            result,
            "Gagal mengambil data Konfirmasi Utang Usaha."
          )
        );
      }

      const rawData = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : Array.isArray(result?.data?.data)
            ? result.data.data
            : [];

      const normalized = rawData
        .map(normalizeKonfirmasi)
        .filter((item) => item.id);

      let filtered = [];

      const filterId = normalizeId(activeUtangUsahaId);

      if (filterId) {
        filtered = normalized.filter(
          (item) =>
            String(item.utangUsahaId) === String(filterId)
        );
      } else if (activeJwbKasusId) {
        filtered = normalized.filter(
          (item) =>
            String(
              getJwbKasusIdFromUtangUsaha(
                item.utangUsaha
              )
            ) === String(activeJwbKasusId)
        );
      }

      const inferredId =
        filterId ||
        normalizeId(
          filtered.find((item) => item.utangUsahaId)
            ?.utangUsahaId
        );

      if (inferredId) {
        setUtangUsahaId(inferredId);
      }

      setDataList(filtered);
      saveCurrentCache(inferredId, filtered);

      return filtered;
    },
    [activeJwbKasusId, saveCurrentCache]
  );

  const refreshKonfirmasi = useCallback(
    async (preferredId = null) => {
      let activeId = normalizeId(preferredId);

      if (!activeId) {
        activeId = normalizeId(utangUsahaId);
      }

      if (!activeId && activeJwbKasusId) {
        try {
          activeId = await resolveUtangUsahaId();
        } catch (error) {
          console.warn(
            "UtangUsahaID belum dapat di-resolve saat refresh:",
            error
          );
        }
      }

      const latestData = await fetchKonfirmasiUtangUsaha(
        activeId
      );

      const inferredId =
        activeId ||
        normalizeId(
          latestData.find((item) => item.utangUsahaId)
            ?.utangUsahaId
        );

      if (inferredId) setUtangUsahaId(inferredId);

      saveCurrentCache(inferredId, latestData);
      onSaved?.();

      return latestData;
    },
    [
      activeJwbKasusId,
      fetchKonfirmasiUtangUsaha,
      onSaved,
      resolveUtangUsahaId,
      saveCurrentCache,
      utangUsahaId,
    ]
  );

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      if (!activeJwbKasusId) {
        setUtangUsahaId(null);
        setDataList([]);
        setLoading(false);
        return;
      }

      const cached = konfirmasiPageCache.get(
        String(activeJwbKasusId)
      );

      const propId = normalizeId(utangUsahaIdProp);

      if (cached) {
        setDataList(cached.data || []);
      } else {
        setLoading(true);
      }

      if (propId) setUtangUsahaId(propId);

      try {
        const resolvedId =
          propId || await resolveUtangUsahaId();

        if (cancelled) return;

        setUtangUsahaId(resolvedId);

        const latestData =
          await fetchKonfirmasiUtangUsaha(resolvedId);

        if (cancelled) return;

        setDataList(latestData);
        saveCurrentCache(resolvedId, latestData);
      } catch (error) {
        console.error(
          "ERROR LOAD KONFIRMASI UTANG USAHA:",
          error
        );

        if (!cancelled) {
          const fallbackId =
            propId ||
            normalizeId(cached?.utangUsahaId);

          if (fallbackId) {
            setUtangUsahaId(fallbackId);

            try {
              const latestData =
                await fetchKonfirmasiUtangUsaha(
                  fallbackId
                );

              if (!cancelled) {
                setDataList(latestData);
                saveCurrentCache(
                  fallbackId,
                  latestData
                );
              }
            } catch (fallbackError) {
              console.error(fallbackError);

              if (!cancelled && !cached) {
                setDataList([]);
              }
            }
          } else if (!cached) {
            setDataList([]);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [
    activeJwbKasusId,
    utangUsahaIdProp,
    resolveUtangUsahaId,
    fetchKonfirmasiUtangUsaha,
    saveCurrentCache,
  ]);

  useEffect(() => {
    const maxPage = Math.max(
      1,
      Math.ceil(dataList.length / itemsPerPage)
    );

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [dataList.length, currentPage]);

  useEffect(() => {
    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }

      if (alertTimerRef.current.error) {
        clearTimeout(alertTimerRef.current.error);
      }

      if (alertTimerRef.current.success) {
        clearTimeout(alertTimerRef.current.success);
      }
    };
  }, []);

  useEffect(() => {
    if (!modalOpen) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [modalOpen]);

  const closeModal = useCallback(() => {
    if (submitting) return;

    setModalVisible(false);

    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
    }

    modalTimerRef.current = window.setTimeout(() => {
      setModalOpen(false);
      setEditingId(null);
      setFormData({ ...INITIAL_FORM });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 280);
  }, [submitting]);

  useEffect(() => {
    if (!modalOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [modalOpen, closeModal]);

  const openModal = useCallback((mode, item = null) => {
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
    }

    setModalMode(mode);
    setEditingId(item?.id || null);

    setFormData(
      item
        ? {
            namaCustomer: item.namaCustomer || "",
            kotaCustomer: item.kotaCustomer || "",
            jumlah:
              item.jumlah !== null &&
              item.jumlah !== undefined
                ? formatInputRupiah(item.jumlah)
                : "",
            file: null,
            namaFile: item.namaFile || "",
          }
        : { ...INITIAL_FORM }
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setModalOpen(true);
    setModalVisible(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setModalVisible(true));
    });
  }, []);

  const openCreateModal = () => {
    if (!activeJwbKasusId) {
      showErrorAlert(
        "Kasus Tidak Ditemukan",
        "JwbKasusID aktif tidak ditemukan pada halaman ini."
      );
      return;
    }

    openModal("create");
  };

  const openEditModal = (item) => {
    openModal("edit", item);
  };

  const handleChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleFileSelected = (event) => {
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

    setFormData((previous) => ({
      ...previous,
      file,
    }));
  };

  const removeSelectedFile = () => {
    setFormData((previous) => ({
      ...previous,
      file: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const createKonfirmasi = async ({
    namaCustomer,
    kotaCustomer,
    jumlah,
  }) => {
    setResolvingId(true);

    let activeUtangUsahaId;

    try {
      activeUtangUsahaId =
        await resolveUtangUsahaId();
    } finally {
      setResolvingId(false);
    }

    const form = new FormData();

    form.append(
      "UtangUsahaID",
      String(activeUtangUsahaId)
    );

    form.append("NamaCustomer", namaCustomer);
    form.append("KotaCustomer", kotaCustomer);
    form.append("Jumlah", String(jumlah));

    const response = await fetchWithAuth(
      KONFIRMASI_ENDPOINT,
      {
        method: "POST",
        body: form,
      }
    );

    const result = await parseResponse(response);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Unauthenticated. Token login tidak diterima oleh Laravel."
        );
      }

      throw new Error(
        getApiError(
          result,
          "Data Konfirmasi Utang Usaha gagal disimpan."
        )
      );
    }

    if (result?.success === false) {
      throw new Error(
        getApiError(
          result,
          "Data Konfirmasi Utang Usaha gagal disimpan."
        )
      );
    }

    const unwrapped = unwrapResponse(result);

    const createdId = normalizeId(
      unwrapped?.KonfirmasiUtangUsahaID ??
        unwrapped?.konfirmasiUtangUsahaID ??
        unwrapped?.konfirmasiUtangUsahaId ??
        unwrapped?.id
    );

    if (!createdId) {
      throw new Error(
        "Data mungkin sudah dikirim, tetapi ID hasil penyimpanan tidak ditemukan pada response Laravel. Periksa response store pada KonfirmasiUtangUsahaController."
      );
    }

    return {
      id: createdId,
      utangUsahaId: activeUtangUsahaId,
      result,
    };
  };

  const uploadFileKonfirmasi = async (
    konfirmasiId,
    file
  ) => {
    if (!konfirmasiId) {
      throw new Error(
        "KonfirmasiUtangUsahaID tidak tersedia."
      );
    }

    if (
      typeof File === "undefined" ||
      !(file instanceof File)
    ) {
      return { success: true, skipped: true };
    }

    const form = new FormData();
    form.append("_method", "PUT");
    form.append("File", file);

    const response = await fetchWithAuth(
      `${KONFIRMASI_ENDPOINT}/${konfirmasiId}`,
      {
        method: "POST",
        body: form,
      }
    );

    const result = await parseResponse(response);

    if (response.ok) {
      return {
        success: true,
        skipped: false,
        malformed: false,
        result,
      };
    }

    if (response.status === 401) {
      throw new Error(
        "Unauthenticated. Token login tidak diterima oleh Laravel."
      );
    }

    if (isMalformedUtf8Error(result)) {
      return {
        success: false,
        skipped: false,
        malformed: true,
        result,
      };
    }

    throw new Error(
      getApiError(
        result,
        "File Konfirmasi Utang Usaha gagal di-upload."
      )
    );
  };

  const updateKonfirmasi = async ({
    namaCustomer,
    kotaCustomer,
    jumlah,
  }) => {
    if (!editingId) {
      throw new Error(
        "KonfirmasiUtangUsahaID tidak tersedia."
      );
    }

    const form = new FormData();

    form.append("_method", "PUT");
    form.append("NamaCustomer", namaCustomer);
    form.append("KotaCustomer", kotaCustomer);
    form.append("Jumlah", String(jumlah));

    if (
      typeof File !== "undefined" &&
      formData.file instanceof File
    ) {
      form.append("File", formData.file);
    }

    const response = await fetchWithAuth(
      `${KONFIRMASI_ENDPOINT}/${editingId}`,
      {
        method: "POST",
        body: form,
      }
    );

    const result = await parseResponse(response);

    if (response.ok) {
      return {
        success: true,
        malformed: false,
        result,
      };
    }

    if (response.status === 401) {
      throw new Error(
        "Unauthenticated. Token login tidak diterima oleh Laravel."
      );
    }

    if (isMalformedUtf8Error(result)) {
      return {
        success: false,
        malformed: true,
        result,
      };
    }

    throw new Error(
      getApiError(
        result,
        "Data Konfirmasi Utang Usaha gagal diperbarui."
      )
    );
  };

  const verifyRecord = async ({
    activeUtangUsahaId,
    konfirmasiId,
    namaCustomer,
    kotaCustomer,
    jumlah,
    expectedFileName,
  }) => {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      if (attempt > 1) await sleep(250);

      try {
        const response = await fetchWithAuth(
          `${KONFIRMASI_ENDPOINT}?_=${Date.now()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await parseResponse(response);

        if (!response.ok) continue;

        const rawData = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : Array.isArray(result?.data?.data)
              ? result.data.data
              : [];

        const latestData = rawData
          .map(normalizeKonfirmasi)
          .filter(
            (item) =>
              String(item.utangUsahaId) ===
              String(activeUtangUsahaId)
          );

        const item = latestData.find(
          (row) =>
            String(row.id) === String(konfirmasiId)
        );

        if (!item) continue;

        const customerValid =
          String(item.namaCustomer || "").trim() ===
          String(namaCustomer || "").trim();

        const kotaValid =
          String(item.kotaCustomer || "").trim() ===
          String(kotaCustomer || "").trim();

        const jumlahValid =
          Number(item.jumlah) === Number(jumlah);

        const fileValid = expectedFileName
          ? String(item.namaFile || "") ===
            String(expectedFileName)
          : true;

        if (
          customerValid &&
          kotaValid &&
          jumlahValid &&
          fileValid
        ) {
          setDataList(latestData);
          saveCurrentCache(
            activeUtangUsahaId,
            latestData
          );

          return true;
        }
      } catch (error) {
        console.warn(
          `Verify attempt ${attempt}:`,
          error
        );
      }
    }

    return false;
  };

  const closeAfterSave = () => {
    setModalVisible(false);

    window.setTimeout(() => {
      setModalOpen(false);
      setEditingId(null);
      setFormData({ ...INITIAL_FORM });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 280);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const namaCustomer = formData.namaCustomer.trim();
    const kotaCustomer = formData.kotaCustomer.trim();
    const jumlah = parseRupiah(formData.jumlah);

    if (!namaCustomer) {
      showErrorAlert(
        "Data Belum Lengkap",
        "Nama Customer wajib diisi."
      );
      return;
    }

    if (!kotaCustomer) {
      showErrorAlert(
        "Data Belum Lengkap",
        "Kota Customer wajib diisi."
      );
      return;
    }

    if (
      !Number.isSafeInteger(jumlah) ||
      jumlah < 0
    ) {
      showErrorAlert(
        "Jumlah Tidak Valid",
        "Jumlah harus berupa angka yang valid."
      );
      return;
    }

    try {
      setSubmitting(true);

      if (modalMode === "create") {
        const created = await createKonfirmasi({
          namaCustomer,
          kotaCustomer,
          jumlah,
        });

        const createdId = created.id;
        const createdUtangUsahaId =
          created.utangUsahaId;

        if (
          typeof File !== "undefined" &&
          formData.file instanceof File
        ) {
          const selectedFile = formData.file;

          const uploadResult =
            await uploadFileKonfirmasi(
              createdId,
              selectedFile
            );

          if (uploadResult?.malformed) {
            const verified = await verifyRecord({
              activeUtangUsahaId:
                createdUtangUsahaId,
              konfirmasiId: createdId,
              namaCustomer,
              kotaCustomer,
              jumlah,
              expectedFileName: selectedFile.name,
            });

            if (!verified) {
              await refreshKonfirmasi(
                createdUtangUsahaId
              );

              setCurrentPage(1);

              showErrorAlert(
                "Data Tersimpan, File Belum Tersimpan",
                "Data berhasil disimpan, tetapi file belum berhasil dipastikan tersimpan."
              );

              closeAfterSave();
              return;
            }
          }
        }

        await refreshKonfirmasi(
          createdUtangUsahaId
        );

        setCurrentPage(1);

        showSuccessAlert(
          "Berhasil Disimpan",
          "Data konfirmasi utang usaha berhasil disimpan."
        );

        closeAfterSave();
        return;
      }

      const result = await updateKonfirmasi({
        namaCustomer,
        kotaCustomer,
        jumlah,
      });

      if (result?.success) {
        await refreshKonfirmasi();

        showSuccessAlert(
          "Berhasil Diperbarui",
          result?.result?.message ||
            "Data konfirmasi utang usaha berhasil diperbarui."
        );

        closeAfterSave();
        return;
      }

      if (result?.malformed) {
        const verified = await verifyRecord({
          activeUtangUsahaId: utangUsahaId,
          konfirmasiId: editingId,
          namaCustomer,
          kotaCustomer,
          jumlah,
          expectedFileName:
            formData.file?.name || null,
        });

        if (verified) {
          showSuccessAlert(
            "Berhasil Diperbarui",
            "Data konfirmasi utang usaha berhasil diperbarui."
          );

          closeAfterSave();
          return;
        }

        throw new Error(
          "Perubahan data belum berhasil ditemukan setelah pengecekan ulang."
        );
      }

      throw new Error(
        "Data Konfirmasi Utang Usaha gagal diperbarui."
      );
    } catch (error) {
      console.error(
        "ERROR SAVE KONFIRMASI UTANG USAHA:",
        error
      );

      showErrorAlert(
        modalMode === "create"
          ? "Gagal Menyimpan"
          : "Gagal Memperbarui",
        error?.message ||
          "Data Konfirmasi Utang Usaha gagal diproses."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (item) => {
    setDeletingData(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingData || deleting) return;

    try {
      setDeleting(true);

      const response = await fetchWithAuth(
        `${KONFIRMASI_ENDPOINT}/${deletingData.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await parseResponse(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Unauthenticated. Token login tidak diterima oleh Laravel."
          );
        }

        throw new Error(
          getApiError(
            result,
            "Data Konfirmasi Utang Usaha gagal dihapus."
          )
        );
      }

      await refreshKonfirmasi();

      setDeleteModalOpen(false);
      setDeletingData(null);

      showSuccessAlert(
        "Berhasil Dihapus",
        result?.message ||
          "Data konfirmasi utang usaha berhasil dihapus."
      );
    } catch (error) {
      console.error(
        "ERROR DELETE KONFIRMASI UTANG USAHA:",
        error
      );

      showErrorAlert(
        "Gagal Menghapus",
        error?.message ||
          "Data Konfirmasi Utang Usaha gagal dihapus."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleFileClick = async (item) => {
    if (!item?.id) {
      showErrorAlert(
        "File Tidak Tersedia",
        "KonfirmasiUtangUsahaID tidak tersedia."
      );
      return;
    }

    if (!item?.namaFile) {
      showErrorAlert(
        "File Tidak Tersedia",
        "File Konfirmasi Utang Usaha tidak tersedia."
      );
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${KONFIRMASI_ENDPOINT}/${item.id}/file`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const result = await parseResponse(response);

        if (response.status === 401) {
          throw new Error(
            "Unauthenticated. Token login tidak diterima oleh Laravel."
          );
        }

        throw new Error(
          getApiError(
            result,
            "File Konfirmasi Utang Usaha gagal diunduh."
          )
        );
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error(
          "File yang diterima dari backend kosong."
        );
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download =
        item.namaFile || "konfirmasi-utang-usaha";

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      window.setTimeout(
        () => URL.revokeObjectURL(url),
        100
      );
    } catch (error) {
      console.error(
        "ERROR DOWNLOAD FILE KONFIRMASI UTANG USAHA:",
        error
      );

      showErrorAlert(
        "Gagal Mengunduh File",
        error?.message ||
          "File Konfirmasi Utang Usaha gagal diunduh."
      );
    }
  };

  const goPrevious = () => {
    setCurrentPage((previous) =>
      Math.max(1, previous - 1)
    );
  };

  const goNext = () => {
    setCurrentPage((previous) =>
      Math.min(totalPages, previous + 1)
    );
  };

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
        message="Apakah Anda yakin ingin menghapus data Konfirmasi Utang Usaha?"
        subText={deletingData?.namaCustomer || ""}
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
        <div className="flex justify-end">
          <AddDataButton
            onClick={openCreateModal}
            disabled={loading}
            label="Tambah Data"
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-[#DCE5EF]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead className="bg-[#F8FAFC]">
                <tr className="border-b border-[#DCE5EF]">
                  <th className="w-[65px] px-4 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    NO
                  </th>

                  <th className="w-[240px] px-4 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    NAMA CUSTOMER
                  </th>

                  <th className="w-[220px] px-4 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    JUMLAH
                  </th>

                  <th className="px-4 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    FILE KONFIRMASI UTANG USAHA
                  </th>

                  <th className="w-[120px] px-4 py-3 text-center font-poppins text-[11px] font-semibold text-[#64748B]">
                    AKSI
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#EEF2F6] bg-white transition duration-200 hover:bg-[#FCFDFE] last:border-b-0"
                    >
                      <td className="px-4 py-3 font-poppins text-sm text-[#475569]">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          title={item.namaCustomer}
                          className="block truncate font-poppins text-sm text-[#475569]"
                        >
                          {item.namaCustomer}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="inline-flex h-10 min-w-[190px] w-fit items-center rounded-xl border border-[#DCE5EF] bg-[#F8FAFC] px-3">
                          <span className="mr-2 shrink-0 font-poppins text-sm text-[#64748B]">
                            Rp
                          </span>

                          <span className="whitespace-nowrap font-poppins text-sm text-[#64748B]">
                            {formatNumber(item.jumlah)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleFileClick(item)}
                          title={item.namaFile || "Tidak ada file"}
                          disabled={!item.namaFile}
                          className={`block max-w-[520px] truncate text-left font-poppins text-sm font-normal transition duration-200 ${
                            item.namaFile
                              ? "cursor-pointer text-[#0EA5E9]"
                              : "cursor-default text-[#94A3B8]"
                          }`}
                        >
                          {item.namaFile || "Tidak ada file"}
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => openEditModal(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-black transition duration-200 hover:bg-[#F1F5F9] active:scale-90"
                          >
                            <Pencil size={15} strokeWidth={1.8} />
                          </button>

                          <button
                            type="button"
                            title="Hapus"
                            onClick={() => openDeleteModal(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition duration-200 hover:bg-red-50 hover:text-red-600 active:scale-90"
                          >
                            <Trash2 size={15} strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : !loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]"
                    >
                      Belum ada data Konfirmasi Utang Usaha.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-poppins text-sm text-[#64748B]">
            Showing {showingFrom} to {showingTo} of{" "}
            {dataList.length} entries
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={goPrevious}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE5EF] bg-white text-[#475569] transition duration-200 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex h-9 min-w-[36px] items-center justify-center rounded-lg bg-[#E0F2FE] px-3 font-poppins text-sm font-semibold text-[#0EA5E9]">
              {currentPage}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={goNext}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE5EF] bg-white text-[#475569] transition duration-200 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4 transition-all duration-[280ms] ${
            modalVisible
              ? "bg-black/40 opacity-100 backdrop-blur-[2px]"
              : "bg-black/0 opacity-0"
          }`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className={`my-auto w-full max-w-[600px] overflow-hidden rounded-xl bg-white transition-all duration-[280ms] ${
              modalVisible
                ? "translate-y-0 scale-100 opacity-100 shadow-[0_24px_70px_rgba(15,23,42,0.25)]"
                : "translate-y-4 scale-[0.97] opacity-0"
            }`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#38BDF8] px-6 py-5 text-white">
              <div>
                <h2 className="font-poppins text-lg font-semibold">
                  {modalMode === "create"
                    ? "Tambah Data"
                    : "Edit Data"}
                </h2>

                <p className="mt-1 font-poppins text-sm text-white/80">
                  {modalMode === "create"
                    ? "Tambahkan data Konfirmasi Utang Usaha"
                    : "Perbarui data Konfirmasi Utang Usaha"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
              <div>
                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Nama Customer
                </label>

                <input
                  type="text"
                  value={formData.namaCustomer}
                  onChange={(event) =>
                    handleChange(
                      "namaCustomer",
                      event.target.value
                    )
                  }
                  placeholder="Masukkan nama customer"
                  className="h-12 w-full rounded-xl border border-[#DCE5EF] bg-white px-4 font-poppins text-sm text-[#475569] outline-none transition focus:border-[#38BDF8]"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Kota Customer
                </label>

                <input
                  type="text"
                  value={formData.kotaCustomer}
                  onChange={(event) =>
                    handleChange(
                      "kotaCustomer",
                      event.target.value
                    )
                  }
                  placeholder="Masukkan kota customer"
                  className="h-12 w-full rounded-xl border border-[#DCE5EF] bg-white px-4 font-poppins text-sm text-[#475569] outline-none transition focus:border-[#38BDF8]"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Jumlah
                </label>

                <div className="flex h-12 items-center rounded-xl border border-[#DCE5EF] bg-white px-4 transition focus-within:border-[#38BDF8]">
                  <span className="mr-2 font-poppins text-sm text-[#64748B]">
                    Rp
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.jumlah}
                    onChange={(event) =>
                      handleChange(
                        "jumlah",
                        formatInputRupiah(
                          event.target.value
                        )
                      )
                    }
                    placeholder="0"
                    className="min-w-0 flex-1 bg-transparent font-poppins text-sm text-[#475569] outline-none"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Upload File
                </label>

                <div className="flex min-h-12 items-center overflow-hidden rounded-xl border border-[#DCE5EF] bg-white transition focus-within:border-[#38BDF8]">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="flex h-12 shrink-0 items-center gap-2 border-r border-[#DCE5EF] px-4 font-poppins text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC]"
                  >
                    <Upload size={15} />
                    Choose File
                  </button>

                  <div className="min-w-0 flex-1 px-4">
                    {formData.file ? (
                      <span
                        title={formData.file.name}
                        className="block truncate font-poppins text-sm text-[#38BDF8]"
                      >
                        {formData.file.name}
                      </span>
                    ) : modalMode === "edit" &&
                      formData.namaFile ? (
                      <span
                        title={formData.namaFile}
                        className="block truncate font-poppins text-sm text-[#475569]"
                      >
                        {formData.namaFile}
                      </span>
                    ) : (
                      <span className="block truncate font-poppins text-sm text-[#94A3B8]">
                        {modalMode === "edit"
                          ? "Pilih file baru jika ingin mengganti"
                          : "Pilih file yang akan di-upload"}
                      </span>
                    )}
                  </div>

                  {formData.file && (
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="flex h-12 w-12 shrink-0 items-center justify-center text-[#94A3B8] transition duration-200 hover:bg-red-50 hover:text-red-500"
                    >
                      <X size={15} />
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelected}
                  />
                </div>

                <p className="mt-2 font-poppins text-[11px] text-[#94A3B8]">
                  Maksimal ukuran file 10MB.
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
                type="button"
                onClick={handleSubmit}
                disabled={submitting || resolvingId}
                className="rounded-md bg-[#00A51A] px-6 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#008C16] disabled:opacity-40"
              >
                {submitting || resolvingId
                  ? modalMode === "create"
                    ? resolvingId
                      ? "Mengambil Data..."
                      : "Menyimpan..."
                    : "Memperbarui..."
                  : modalMode === "create"
                    ? "Simpan"
                    : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
