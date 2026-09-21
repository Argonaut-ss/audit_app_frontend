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

/* =====================================================
   API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const KONFIRMASI_ENDPOINT =
  `${API_URL}/api/konfirmasi-piutang`;

/* =====================================================
   MEMORY CACHE

   BUKAN localStorage untuk data halaman.

   Tujuan:
   - ketika pindah tab lalu kembali lagi,
     data sebelumnya langsung tampil
   - API tetap refresh di background
===================================================== */

const konfirmasiPageCache =
  new Map();

/* =====================================================
   AUTH
===================================================== */

const getAuthToken = () => {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    "token"
  );
};

const fetchWithAuth = async (
  url,
  options = {}
) => {
  const token =
    getAuthToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  return fetch(url, {
    ...options,

    headers: {
      Accept:
        "application/json",

      Authorization:
        `Bearer ${token}`,

      ...(options.headers || {}),
    },
  });
};

/* =====================================================
   INITIAL FORM
===================================================== */

const INITIAL_FORM = {
  namaCustomer: "",
  kotaCustomer: "",
  jumlah: "",
  file: null,
  namaFile: "",
};

/* =====================================================
   RESPONSE
===================================================== */

const parseResponse = async (
  response
) => {
  const text =
    await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    return {
      raw: text,
    };
  }
};

const getApiError = (
  result,
  fallback
) => {
  if (
    result?.errors &&
    typeof result.errors ===
      "object"
  ) {
    const firstError =
      Object.values(
        result.errors
      )
        .flat()
        .find(Boolean);

    if (firstError) {
      return firstError;
    }
  }

  return (
    result?.message ||
    result?.error ||
    result?.raw ||
    fallback
  );
};

/* =====================================================
   MALFORMED UTF-8
===================================================== */

const isMalformedUtf8Error = (
  result
) => {
  const message =
    String(
      result?.message ||
        result?.error ||
        result?.raw ||
        ""
    ).toLowerCase();

  return (
    message.includes(
      "malformed utf-8"
    ) ||
    message.includes(
      "malformed utf8"
    ) ||
    message.includes(
      "incorrectly encoded"
    )
  );
};

/* =====================================================
   DELAY
===================================================== */

const sleep = (
  ms
) =>
  new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        ms
      );
    }
  );

/* =====================================================
   NUMBER
===================================================== */

const formatNumber = (
  value
) => {
  const number =
    Number(value) || 0;

  return new Intl.NumberFormat(
    "id-ID"
  ).format(
    number
  );
};

const formatInputRupiah = (
  value
) => {
  const cleaned =
    String(
      value ?? ""
    ).replace(
      /\D/g,
      ""
    );

  if (!cleaned) {
    return "";
  }

  return new Intl.NumberFormat(
    "id-ID"
  ).format(
    Number(cleaned)
  );
};

const parseRupiah = (
  value
) => {
  const cleaned =
    String(
      value ?? ""
    ).replace(
      /\D/g,
      ""
    );

  if (!cleaned) {
    return 0;
  }

  return Number(
    cleaned
  );
};

/* =====================================================
   ID
===================================================== */

const normalizeId = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const rawValue =
    Array.isArray(value)
      ? value[0]
      : value;

  const id =
    Number(
      rawValue
    );

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  return id;
};

/* =====================================================
   NORMALIZE KONFIRMASI
===================================================== */

const normalizeKonfirmasi = (
  item
) => ({
  id:
    item?.KonfirmasiPiutangID ??
    null,

  piutangId:
    item?.PiutangID ??
    null,

  namaCustomer:
    item?.NamaCustomer ??
    "",

  kotaCustomer:
    item?.KotaCustomer ??
    "",

  jumlah:
    Number(
      item?.Jumlah ?? 0
    ),

  namaFile:
    item?.NamaFile ??
    "",

  tipeFile:
    item?.TipeFile ??
    "",

  createdAt:
    item?.created_at ??
    null,

  updatedAt:
    item?.updated_at ??
    null,

  piutang:
    item?.piutang ??
    null,
});

/* =====================================================
   COMPONENT
===================================================== */

export default function KonfirmasiPiutang({
  jwbKasusId:
    jwbKasusIdProp,
  onSaved,
}) {
  const params =
    useParams();

  const searchParams =
    useSearchParams();

  /* =====================================================
     ACTIVE JWB KASUS ID
  ===================================================== */

  const activeJwbKasusId =
    useMemo(() => {
      const fromProp =
        normalizeId(
          jwbKasusIdProp
        );

      if (fromProp) {
        return fromProp;
      }

      const fromNamedParam =
        normalizeId(
          params?.jwbKasusId ??
            params?.JwbKasusID ??
            params?.jwb_kasus_id
        );

      if (
        fromNamedParam
      ) {
        return fromNamedParam;
      }

      const fromId =
        normalizeId(
          params?.id
        );

      if (fromId) {
        return fromId;
      }

      return normalizeId(
        searchParams?.get(
          "JwbKasusID"
        ) ??
          searchParams?.get(
            "jwbKasusId"
          ) ??
          searchParams?.get(
            "jwb_kasus_id"
          )
      );
    }, [
      jwbKasusIdProp,
      params,
      searchParams,
    ]);

  /* =====================================================
     CACHE
  ===================================================== */

  const getCurrentCache =
    () => {
      if (
        !activeJwbKasusId
      ) {
        return null;
      }

      return (
        konfirmasiPageCache.get(
          String(
            activeJwbKasusId
          )
        ) || null
      );
    };

  const saveCurrentCache =
    (
      activePiutangId,
      data
    ) => {
      if (
        !activeJwbKasusId
      ) {
        return;
      }

      konfirmasiPageCache.set(
        String(
          activeJwbKasusId
        ),
        {
          piutangId:
            activePiutangId,

          data:
            data || [],
        }
      );
    };

  /* =====================================================
     DATA
  ===================================================== */

  const [
    dataList,
    setDataList,
  ] = useState(() => {
    if (
      !activeJwbKasusId
    ) {
      return [];
    }

    return (
      konfirmasiPageCache.get(
        String(
          activeJwbKasusId
        )
      )?.data || []
    );
  });

  /*
   * Loading tetap disimpan untuk logic internal,
   * tetapi TIDAK ditampilkan ke tabel.
   */
  const [
    loading,
    setLoading,
  ] = useState(() => {
    if (
      !activeJwbKasusId
    ) {
      return false;
    }

    return !konfirmasiPageCache.has(
      String(
        activeJwbKasusId
      )
    );
  });

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  /* =====================================================
     PIUTANG
  ===================================================== */

  const [
    piutangId,
    setPiutangId,
  ] = useState(() => {
    if (
      !activeJwbKasusId
    ) {
      return null;
    }

    return (
      konfirmasiPageCache.get(
        String(
          activeJwbKasusId
        )
      )?.piutangId ||
      null
    );
  });

  /* =====================================================
     PAGINATION
  ===================================================== */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const itemsPerPage =
    10;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        dataList.length /
          itemsPerPage
      )
    );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const currentData =
    dataList.slice(
      startIndex,
      startIndex +
        itemsPerPage
    );

  const showingFrom =
    dataList.length === 0
      ? 0
      : startIndex + 1;

  const showingTo =
    dataList.length === 0
      ? 0
      : Math.min(
          startIndex +
            currentData.length,
          dataList.length
        );

  /* =====================================================
     MODAL
  ===================================================== */

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    modalMode,
    setModalMode,
  ] = useState(
    "create"
  );

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const modalTimerRef =
    useRef(null);

  /* =====================================================
     FORM
  ===================================================== */

  const [
    formData,
    setFormData,
  ] = useState({
    ...INITIAL_FORM,
  });

  const fileInputRef =
    useRef(null);

  /* =====================================================
     DELETE
  ===================================================== */

  const [
    deleteModalOpen,
    setDeleteModalOpen,
  ] = useState(false);

  const [
    deletingData,
    setDeletingData,
  ] = useState(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  /* =====================================================
     ALERT
  ===================================================== */

  const [
    errorAlert,
    setErrorAlert,
  ] = useState(null);

  const [
    successAlert,
    setSuccessAlert,
  ] = useState(null);

  const showErrorAlert = (
    title,
    message
  ) => {
    setErrorAlert({
      title,
      message,
    });

    window.setTimeout(
      () => {
        setErrorAlert(
          null
        );
      },
      3400
    );
  };

  const showSuccessAlert = (
    title,
    message
  ) => {
    setSuccessAlert({
      title,
      message,
    });

    window.setTimeout(
      () => {
        setSuccessAlert(
          null
        );
      },
      3400
    );
  };

  /* =====================================================
     FETCH PIUTANG
  ===================================================== */

  const fetchPiutang =
    async (
      activeId
    ) => {
      if (!activeId) {
        throw new Error(
          "JwbKasusID aktif tidak tersedia."
        );
      }

      const response =
        await fetchWithAuth(
          `${API_URL}/api/piutang/${activeId}`,
          {
            method:
              "GET",

            cache:
              "no-store",
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (
        !response.ok
      ) {
        if (
          response.status ===
          401
        ) {
          throw new Error(
            "Unauthenticated. Token login tidak diterima oleh Laravel."
          );
        }

        throw new Error(
          getApiError(
            result,
            "Gagal mengambil data Piutang."
          )
        );
      }

      const id =
        normalizeId(
          result?.data
            ?.PiutangID
        );

      if (!id) {
        throw new Error(
          "PiutangID tidak ditemukan dari response backend."
        );
      }

      setPiutangId(
        id
      );

      return id;
    };

  /* =====================================================
     FETCH KONFIRMASI
  ===================================================== */

  const fetchKonfirmasiPiutang =
    async (
      activePiutangId,
      options = {}
    ) => {
      const {
        updateState =
          true,
      } = options;

      if (
        !activePiutangId
      ) {
        if (
          updateState
        ) {
          setDataList(
            []
          );
        }

        return [];
      }

      const requestUrl =
        `${KONFIRMASI_ENDPOINT}?_=${Date.now()}`;

      const response =
        await fetchWithAuth(
          requestUrl,
          {
            method:
              "GET",

            cache:
              "no-store",
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (
        !response.ok
      ) {
        if (
          response.status ===
          401
        ) {
          throw new Error(
            "Unauthenticated. Token login tidak diterima oleh Laravel."
          );
        }

        throw new Error(
          getApiError(
            result,
            "Gagal mengambil data Konfirmasi Piutang."
          )
        );
      }

      const rawData =
        Array.isArray(
          result?.data
        )
          ? result.data
          : [];

      const normalized =
        rawData
          .map(
            normalizeKonfirmasi
          )
          .filter(
            (item) =>
              String(
                item.piutangId
              ) ===
              String(
                activePiutangId
              )
          );

      if (
        updateState
      ) {
        setDataList(
          normalized
        );

        saveCurrentCache(
          activePiutangId,
          normalized
        );
      }

      return normalized;
    };

  /* =====================================================
     VERIFY FILE UPLOAD
  ===================================================== */

  const verifyUploadedFile =
    async ({
      activePiutangId,
      konfirmasiId,
      expectedFileName,
    }) => {
      for (
        let attempt = 1;
        attempt <= 3;
        attempt += 1
      ) {
        if (
          attempt > 1
        ) {
          await sleep(
            250
          );
        }

        try {
          const latestData =
            await fetchKonfirmasiPiutang(
              activePiutangId,
              {
                updateState:
                  false,
              }
            );

          const item =
            latestData.find(
              (row) =>
                String(
                  row.id
                ) ===
                String(
                  konfirmasiId
                )
            );

          if (
            item &&
            String(
              item.namaFile ||
                ""
            ) ===
              String(
                expectedFileName ||
                  ""
              )
          ) {
            setDataList(
              latestData
            );

            saveCurrentCache(
              activePiutangId,
              latestData
            );

            return true;
          }
        } catch (
          error
        ) {
          console.warn(
            `Verify file attempt ${attempt}:`,
            error
          );
        }
      }

      return false;
    };

  /* =====================================================
     VERIFY UPDATE
  ===================================================== */

  const verifyUpdatedData =
    async ({
      activePiutangId,
      konfirmasiId,
      namaCustomer,
      kotaCustomer,
      jumlah,
      expectedFileName,
    }) => {
      for (
        let attempt = 1;
        attempt <= 3;
        attempt += 1
      ) {
        if (
          attempt > 1
        ) {
          await sleep(
            250
          );
        }

        try {
          const latestData =
            await fetchKonfirmasiPiutang(
              activePiutangId,
              {
                updateState:
                  false,
              }
            );

          const item =
            latestData.find(
              (row) =>
                String(
                  row.id
                ) ===
                String(
                  konfirmasiId
                )
            );

          if (!item) {
            continue;
          }

          const customerValid =
            String(
              item.namaCustomer ||
                ""
            ).trim() ===
            String(
              namaCustomer ||
                ""
            ).trim();

          const kotaValid =
            String(
              item.kotaCustomer ||
                ""
            ).trim() ===
            String(
              kotaCustomer ||
                ""
            ).trim();

          const jumlahValid =
            Number(
              item.jumlah
            ) ===
            Number(
              jumlah
            );

          const fileValid =
            expectedFileName
              ? String(
                  item.namaFile ||
                    ""
                ) ===
                String(
                  expectedFileName
                )
              : true;

          if (
            customerValid &&
            kotaValid &&
            jumlahValid &&
            fileValid
          ) {
            setDataList(
              latestData
            );

            saveCurrentCache(
              activePiutangId,
              latestData
            );

            return true;
          }
        } catch (
          error
        ) {
          console.warn(
            `Verify update attempt ${attempt}:`,
            error
          );
        }
      }

      return false;
    };

  /* =====================================================
     LOAD PAGE

     PENTING:
     - kalau cache ada -> langsung tampil
     - API tetap refresh background
     - tidak ada tulisan "Memuat data..."
  ===================================================== */

  useEffect(() => {
    let cancelled =
      false;

    const loadPage =
      async () => {
        if (
          !activeJwbKasusId
        ) {
          setPiutangId(
            null
          );

          setDataList(
            []
          );

          setLoading(
            false
          );

          return;
        }

        const cached =
          konfirmasiPageCache.get(
            String(
              activeJwbKasusId
            )
          );

        /*
         * Kalau user kembali dari tab lain,
         * data cache langsung ditampilkan.
         */
        if (cached) {
          setPiutangId(
            cached.piutangId ||
              null
          );

          setDataList(
            cached.data || []
          );

          setLoading(
            false
          );
        } else {
          /*
           * First load memang masih menunggu network,
           * tapi loading tidak ditampilkan di tabel.
           */
          setLoading(
            true
          );
        }

        try {
          /*
           * API 1
           */
          const activePiutangId =
            await fetchPiutang(
              activeJwbKasusId
            );

          if (
            cancelled
          ) {
            return;
          }

          /*
           * API 2
           */
          const latestData =
            await fetchKonfirmasiPiutang(
              activePiutangId
            );

          if (
            cancelled
          ) {
            return;
          }

          saveCurrentCache(
            activePiutangId,
            latestData
          );
        } catch (
          err
        ) {
          console.error(
            "ERROR LOAD KONFIRMASI PIUTANG:",
            err
          );

          if (
            !cancelled
          ) {
            /*
             * Kalau cache sudah ada,
             * jangan kosongkan tabel.
             */
            if (!cached) {
              setPiutangId(
                null
              );

              setDataList(
                []
              );
            }

            showErrorAlert(
              "Gagal Memuat Data",
              err?.message ||
                "Data Konfirmasi Piutang gagal dimuat."
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            );
          }
        }
      };

    loadPage();

    return () => {
      cancelled =
        true;
    };
  }, [
    activeJwbKasusId,
  ]);

  /* =====================================================
     PAGINATION VALIDATION
  ===================================================== */

  useEffect(() => {
    const maxPage =
      Math.max(
        1,
        Math.ceil(
          dataList.length /
            itemsPerPage
        )
      );

    if (
      currentPage >
      maxPage
    ) {
      setCurrentPage(
        maxPage
      );
    }
  }, [
    dataList.length,
    currentPage,
  ]);

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      if (
        modalTimerRef.current
      ) {
        clearTimeout(
          modalTimerRef.current
        );
      }
    };
  }, []);

  /* =====================================================
     BODY LOCK
  ===================================================== */

  useEffect(() => {
    if (
      !modalOpen
    ) {
      return;
    }

    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, [
    modalOpen,
  ]);

  /* =====================================================
     ESC
  ===================================================== */

  useEffect(() => {
    if (
      !modalOpen
    ) {
      return;
    }

    const handleEscape =
      (
        event
      ) => {
        if (
          event.key ===
          "Escape"
        ) {
          closeModal();
        }
      };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    modalOpen,
    submitting,
  ]);

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (
    field,
    value
  ) => {
    setFormData(
      (
        previous
      ) => ({
        ...previous,

        [field]:
          value,
      })
    );
  };

  /* =====================================================
     OPEN CREATE
  ===================================================== */

  const openCreateModal =
    () => {
      if (
        loading
      ) {
        return;
      }

      if (
        !activeJwbKasusId
      ) {
        showErrorAlert(
          "Kasus Tidak Ditemukan",
          "JwbKasusID aktif tidak ditemukan pada halaman ini."
        );

        return;
      }

      if (
        !piutangId
      ) {
        showErrorAlert(
          "PiutangID Tidak Ditemukan",
          `Data Piutang untuk JwbKasusID ${activeJwbKasusId} belum berhasil dimuat.`
        );

        return;
      }

      if (
        modalTimerRef.current
      ) {
        clearTimeout(
          modalTimerRef.current
        );
      }

      setModalMode(
        "create"
      );

      setEditingId(
        null
      );

      setFormData({
        ...INITIAL_FORM,
      });

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      setModalOpen(
        true
      );

      setModalVisible(
        false
      );

      requestAnimationFrame(
        () => {
          requestAnimationFrame(
            () => {
              setModalVisible(
                true
              );
            }
          );
        }
      );
    };

  /* =====================================================
     OPEN EDIT
  ===================================================== */

  const openEditModal =
    (
      item
    ) => {
      if (
        modalTimerRef.current
      ) {
        clearTimeout(
          modalTimerRef.current
        );
      }

      setModalMode(
        "edit"
      );

      setEditingId(
        item.id
      );

      setFormData({
        namaCustomer:
          item.namaCustomer ||
          "",

        kotaCustomer:
          item.kotaCustomer ||
          "",

        jumlah:
          item.jumlah !==
            null &&
          item.jumlah !==
            undefined
            ? formatInputRupiah(
                item.jumlah
              )
            : "",

        file:
          null,

        namaFile:
          item.namaFile ||
          "",
      });

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      setModalOpen(
        true
      );

      setModalVisible(
        false
      );

      requestAnimationFrame(
        () => {
          requestAnimationFrame(
            () => {
              setModalVisible(
                true
              );
            }
          );
        }
      );
    };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal =
    () => {
      if (
        submitting
      ) {
        return;
      }

      setModalVisible(
        false
      );

      if (
        modalTimerRef.current
      ) {
        clearTimeout(
          modalTimerRef.current
        );
      }

      modalTimerRef.current =
        window.setTimeout(
          () => {
            setModalOpen(
              false
            );

            setEditingId(
              null
            );

            setFormData({
              ...INITIAL_FORM,
            });

            if (
              fileInputRef.current
            ) {
              fileInputRef.current.value =
                "";
            }
          },
          280
        );
    };

  const closeAfterSave =
    () => {
      setModalVisible(
        false
      );

      window.setTimeout(
        () => {
          setModalOpen(
            false
          );

          setEditingId(
            null
          );

          setFormData({
            ...INITIAL_FORM,
          });

          if (
            fileInputRef.current
          ) {
            fileInputRef.current.value =
              "";
          }
        },
        280
      );
    };

  /* =====================================================
     FILE SELECT
  ===================================================== */

  const handleFileSelected =
    (
      event
    ) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      const maxSize =
        10 *
        1024 *
        1024;

      if (
        file.size >
        maxSize
      ) {
        showErrorAlert(
          "Ukuran File Terlalu Besar",
          "Ukuran file maksimal 1MB."
        );

        event.target.value =
          "";

        return;
      }

      setFormData(
        (
          previous
        ) => ({
          ...previous,

          file,
        })
      );
    };

  const removeSelectedFile =
    () => {
      setFormData(
        (
          previous
        ) => ({
          ...previous,

          file:
            null,
        })
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };

  /* =====================================================
     CREATE
  ===================================================== */

  const createKonfirmasi =
    async ({
      namaCustomer,
      kotaCustomer,
      jumlah,
    }) => {
      if (
        !piutangId
      ) {
        throw new Error(
          "PiutangID tidak tersedia."
        );
      }

      const form =
        new FormData();

      form.append(
        "PiutangID",
        String(
          piutangId
        )
      );

      form.append(
        "NamaCustomer",
        namaCustomer
      );

      form.append(
        "KotaCustomer",
        kotaCustomer
      );

      form.append(
        "Jumlah",
        String(
          jumlah
        )
      );

      const response =
        await fetchWithAuth(
          KONFIRMASI_ENDPOINT,
          {
            method:
              "POST",

            body:
              form,
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (
        !response.ok
      ) {
        if (
          response.status ===
          401
        ) {
          throw new Error(
            "Unauthenticated. Token login tidak diterima oleh Laravel."
          );
        }

        throw new Error(
          getApiError(
            result,
            "Data Konfirmasi Piutang gagal disimpan."
          )
        );
      }

      if (
        result?.success ===
        false
      ) {
        throw new Error(
          getApiError(
            result,
            "Data Konfirmasi Piutang gagal disimpan."
          )
        );
      }

      const createdId =
        normalizeId(
          result?.data
            ?.KonfirmasiPiutangID
        );

      if (
        !createdId
      ) {
        throw new Error(
          "KonfirmasiPiutangID hasil penyimpanan tidak ditemukan."
        );
      }

      return {
        id:
          createdId,

        result,
      };
    };

  /* =====================================================
     UPLOAD FILE AFTER CREATE
  ===================================================== */

  const uploadFileKonfirmasi =
    async (
      konfirmasiId,
      file
    ) => {
      if (
        !konfirmasiId
      ) {
        throw new Error(
          "KonfirmasiPiutangID tidak tersedia."
        );
      }

      if (
        typeof File ===
          "undefined" ||
        !(file instanceof File)
      ) {
        return {
          success:
            true,

          skipped:
            true,

          malformed:
            false,
        };
      }

      const form =
        new FormData();

      form.append(
        "_method",
        "PUT"
      );

      form.append(
        "File",
        file
      );

      const response =
        await fetchWithAuth(
          `${KONFIRMASI_ENDPOINT}/${konfirmasiId}`,
          {
            method:
              "POST",

            body:
              form,
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (
        response.ok
      ) {
        return {
          success:
            true,

          skipped:
            false,

          malformed:
            false,

          result,
        };
      }

      if (
        response.status ===
        401
      ) {
        throw new Error(
          "Unauthenticated. Token login tidak diterima oleh Laravel."
        );
      }

      if (
        isMalformedUtf8Error(
          result
        )
      ) {
        return {
          success:
            false,

          skipped:
            false,

          malformed:
            true,

          result,
        };
      }

      throw new Error(
        getApiError(
          result,
          "File Konfirmasi Piutang gagal di-upload."
        )
      );
    };

  /* =====================================================
     UPDATE DATA
  ===================================================== */

  const updateKonfirmasi =
    async ({
      namaCustomer,
      kotaCustomer,
      jumlah,
    }) => {
      if (
        !editingId
      ) {
        throw new Error(
          "KonfirmasiPiutangID tidak tersedia."
        );
      }

      const form =
        new FormData();

      form.append(
        "_method",
        "PUT"
      );

      form.append(
        "NamaCustomer",
        namaCustomer
      );

      form.append(
        "KotaCustomer",
        kotaCustomer
      );

      form.append(
        "Jumlah",
        String(
          jumlah
        )
      );

      if (
        typeof File !==
          "undefined" &&
        formData.file instanceof
          File
      ) {
        form.append(
          "File",
          formData.file
        );
      }

      const response =
        await fetchWithAuth(
          `${KONFIRMASI_ENDPOINT}/${editingId}`,
          {
            method:
              "POST",

            body:
              form,
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (
        response.ok
      ) {
        return {
          success:
            true,

          malformed:
            false,

          result,
        };
      }

      if (
        response.status ===
        401
      ) {
        throw new Error(
          "Unauthenticated. Token login tidak diterima oleh Laravel."
        );
      }

      if (
        isMalformedUtf8Error(
          result
        )
      ) {
        return {
          success:
            false,

          malformed:
            true,

          result,
        };
      }

      throw new Error(
        getApiError(
          result,
          "Data Konfirmasi Piutang gagal diperbarui."
        )
      );
    };

  /* =====================================================
     REFRESH + CACHE
  ===================================================== */

  const refreshKonfirmasi =
    async () => {
      if (
        !piutangId
      ) {
        return [];
      }

      const latestData =
        await fetchKonfirmasiPiutang(
          piutangId
        );

      saveCurrentCache(
        piutangId,
        latestData
      );

      // Beritahu parent bahwa data konfirmasi (master customer) berubah, agar tab lain
      // yang bergantung (Rekap, Prosedur Alternatif, Rekonsiliasi) melakukan refetch.
      onSaved?.();

      return latestData;
    };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit =
    async () => {
      if (
        submitting
      ) {
        return;
      }

      const namaCustomer =
        formData
          .namaCustomer
          .trim();

      const kotaCustomer =
        formData
          .kotaCustomer
          .trim();

      const jumlah =
        parseRupiah(
          formData.jumlah
        );

      if (
        !namaCustomer
      ) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Nama Customer wajib diisi."
        );

        return;
      }

      if (
        !kotaCustomer
      ) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Kota Customer wajib diisi."
        );

        return;
      }

      if (
        !Number.isInteger(
          jumlah
        ) ||
        jumlah < 0
      ) {
        showErrorAlert(
          "Jumlah Tidak Valid",
          "Jumlah harus berupa angka yang valid."
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        /* =============================================
           CREATE
        ============================================== */

        if (
          modalMode ===
          "create"
        ) {
          const created =
            await createKonfirmasi({
              namaCustomer,
              kotaCustomer,
              jumlah,
            });

          const createdId =
            created.id;

          if (
            typeof File !==
              "undefined" &&
            formData.file instanceof
              File
          ) {
            const selectedFile =
              formData.file;

            const uploadResult =
              await uploadFileKonfirmasi(
                createdId,
                selectedFile
              );

            if (
              uploadResult
                ?.malformed
            ) {
              const fileStored =
                await verifyUploadedFile({
                  activePiutangId:
                    piutangId,

                  konfirmasiId:
                    createdId,

                  expectedFileName:
                    selectedFile
                      .name,
                });

              if (
                !fileStored
              ) {
                await refreshKonfirmasi();

                setCurrentPage(
                  1
                );

                showErrorAlert(
                  "Data Tersimpan, File Belum Tersimpan",
                  "Data Konfirmasi Piutang berhasil disimpan, tetapi file belum berhasil dipastikan tersimpan."
                );

                closeAfterSave();

                return;
              }
            }
          }

          await refreshKonfirmasi();

          setCurrentPage(
            1
          );

          showSuccessAlert(
            "Berhasil Disimpan",
            "Data konfirmasi piutang berhasil disimpan."
          );

          closeAfterSave();

          return;
        }

        /* =============================================
           UPDATE
        ============================================== */

        const result =
          await updateKonfirmasi({
            namaCustomer,
            kotaCustomer,
            jumlah,
          });

        if (
          result?.success
        ) {
          await refreshKonfirmasi();

          showSuccessAlert(
            "Berhasil Diperbarui",
            result
              ?.result
              ?.message ||
              "Data konfirmasi piutang berhasil diperbarui."
          );

          closeAfterSave();

          return;
        }

        if (
          result?.malformed
        ) {
          const verified =
            await verifyUpdatedData({
              activePiutangId:
                piutangId,

              konfirmasiId:
                editingId,

              namaCustomer,

              kotaCustomer,

              jumlah,

              expectedFileName:
                formData.file
                  ?.name ||
                null,
            });

          if (
            verified
          ) {
            showSuccessAlert(
              "Berhasil Diperbarui",
              "Data konfirmasi piutang berhasil diperbarui."
            );

            closeAfterSave();

            return;
          }

          throw new Error(
            "Perubahan data belum berhasil ditemukan setelah pengecekan ulang."
          );
        }

        throw new Error(
          "Data Konfirmasi Piutang gagal diperbarui."
        );
      } catch (
        err
      ) {
        console.error(
          "ERROR SAVE KONFIRMASI PIUTANG:",
          err
        );

        showErrorAlert(
          modalMode ===
            "create"
            ? "Gagal Menyimpan"
            : "Gagal Memperbarui",

          err?.message ||
            "Data Konfirmasi Piutang gagal diproses."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /* =====================================================
     DELETE
  ===================================================== */

  const openDeleteModal =
    (
      item
    ) => {
      setDeletingData(
        item
      );

      setDeleteModalOpen(
        true
      );
    };

  const handleConfirmDelete =
    async () => {
      if (
        !deletingData ||
        deleting
      ) {
        return;
      }

      try {
        setDeleting(
          true
        );

        const response =
          await fetchWithAuth(
            `${KONFIRMASI_ENDPOINT}/${deletingData.id}`,
            {
              method:
                "DELETE",
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (
          !response.ok
        ) {
          if (
            response.status ===
            401
          ) {
            throw new Error(
              "Unauthenticated. Token login tidak diterima oleh Laravel."
            );
          }

          throw new Error(
            getApiError(
              result,
              "Data Konfirmasi Piutang gagal dihapus."
            )
          );
        }

        await refreshKonfirmasi();

        setDeleteModalOpen(
          false
        );

        setDeletingData(
          null
        );

        showSuccessAlert(
          "Berhasil Dihapus",
          result?.message ||
            "Data konfirmasi piutang berhasil dihapus."
        );
      } catch (
        err
      ) {
        console.error(
          "ERROR DELETE KONFIRMASI PIUTANG:",
          err
        );

        showErrorAlert(
          "Gagal Menghapus",
          err?.message ||
            "Data Konfirmasi Piutang gagal dihapus."
        );
      } finally {
        setDeleting(
          false
        );
      }
    };

  /* =====================================================
     DOWNLOAD FILE
  ===================================================== */

  const handleFileClick =
    async (
      item
    ) => {
      if (
        !item?.id
      ) {
        showErrorAlert(
          "File Tidak Tersedia",
          "KonfirmasiPiutangID tidak tersedia."
        );

        return;
      }

      if (
        !item
          ?.namaFile
      ) {
        showErrorAlert(
          "File Tidak Tersedia",
          "File Konfirmasi Piutang tidak tersedia."
        );

        return;
      }

      try {
        const response =
          await fetchWithAuth(
            `${KONFIRMASI_ENDPOINT}/${item.id}/file`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          );

        if (
          !response.ok
        ) {
          let result =
            null;

          try {
            const text =
              await response.text();

            if (text) {
              try {
                result =
                  JSON.parse(
                    text
                  );
              } catch {
                result = {
                  raw:
                    text,
                };
              }
            }
          } catch {
            result =
              null;
          }

          if (
            response.status ===
            401
          ) {
            throw new Error(
              "Unauthenticated. Token login tidak diterima oleh Laravel."
            );
          }

          throw new Error(
            getApiError(
              result,
              "File Konfirmasi Piutang gagal diunduh."
            )
          );
        }

        const blob =
          await response.blob();

        if (
          !blob ||
          blob.size ===
            0
        ) {
          throw new Error(
            "File yang diterima dari backend kosong."
          );
        }

        const url =
          URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        anchor.href =
          url;

        anchor.download =
          item.namaFile ||
          "konfirmasi-piutang";

        document.body.appendChild(
          anchor
        );

        anchor.click();

        document.body.removeChild(
          anchor
        );

        window.setTimeout(
          () => {
            URL.revokeObjectURL(
              url
            );
          },
          100
        );
      } catch (
        err
      ) {
        console.error(
          "ERROR DOWNLOAD FILE KONFIRMASI PIUTANG:",
          err
        );

        showErrorAlert(
          "Gagal Mengunduh File",
          err?.message ||
            "File Konfirmasi Piutang gagal diunduh."
        );
      }
    };

  /* =====================================================
     PAGINATION
  ===================================================== */

  const goPrevious =
    () => {
      setCurrentPage(
        (
          previous
        ) =>
          Math.max(
            1,
            previous -
              1
          )
      );
    };

  const goNext =
    () => {
      setCurrentPage(
        (
          previous
        ) =>
          Math.min(
            totalPages,
            previous +
              1
          )
      );
    };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="font-poppins text-[#334155]">

      {/* ERROR */}

      {errorAlert && (
        <AlertError
          title={
            errorAlert.title
          }
          message={
            errorAlert.message
          }
          onClose={() =>
            setErrorAlert(
              null
            )
          }
        />
      )}

      {/* SUCCESS */}

      {successAlert && (
        <AlertSuccess
          title={
            successAlert.title
          }
          message={
            successAlert.message
          }
          onClose={() =>
            setSuccessAlert(
              null
            )
          }
        />
      )}

      {/* DELETE CONFIRMATION */}

      <ConfirmationPopup
        isOpen={
          deleteModalOpen
        }
        message="Apakah Anda yakin ingin menghapus data Konfirmasi Piutang?"
        subText={
          deletingData
            ? deletingData
                .namaCustomer
            : ""
        }
        confirmText={
          deleting
            ? "Menghapus..."
            : "Hapus"
        }
        cancelText="Batal"
        onConfirm={
          handleConfirmDelete
        }
        onCancel={() => {
          if (
            deleting
          ) {
            return;
          }

          setDeleteModalOpen(
            false
          );

          setDeletingData(
            null
          );
        }}
      />

      {/* CONTENT */}

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">

        {/* ADD BUTTON */}

        <div className="flex justify-end">

          <AddDataButton
            onClick={
              openCreateModal
            }
            disabled={
              loading
            }
            label="Tambah Data"
          />

        </div>

        {/* TABLE */}

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
                    FILE KONFIRMASI PIUTANG
                  </th>

                  <th className="w-[120px] px-4 py-3 text-center font-poppins text-[11px] font-semibold text-[#64748B]">
                    AKSI
                  </th>

                </tr>

              </thead>

              <tbody>

                {currentData.length >
                0 ? (

                  currentData.map(
                    (
                      item,
                      index
                    ) => (

                      <tr
                        key={
                          item.id
                        }
                        className="
                          border-b
                          border-[#EEF2F6]
                          bg-white
                          transition
                          duration-200
                          hover:bg-[#FCFDFE]
                          last:border-b-0
                        "
                      >

                        {/* NO */}

                        <td className="px-4 py-3 font-poppins text-sm text-[#475569]">

                          {startIndex +
                            index +
                            1}

                        </td>

                        {/* CUSTOMER */}

                        <td className="px-4 py-3">

                          <span
                            title={
                              item.namaCustomer
                            }
                            className="
                              block
                              truncate
                              font-poppins
                              text-sm
                              text-[#475569]
                            "
                          >
                            {
                              item.namaCustomer
                            }
                          </span>

                        </td>

                        {/* JUMLAH */}
                            <td className="px-4 py-3">

                              <div
                                className="
                                  inline-flex
                                  h-10
                                  min-w-[190px]
                                  w-fit
                                  items-center
                                  rounded-xl
                                  border
                                  border-[#DCE5EF]
                                  bg-[#F8FAFC]
                                  px-3
                                "
                              >

                                <span className="mr-2 shrink-0 font-poppins text-sm text-[#64748B]">
                                  Rp
                                </span>

                                <span className="whitespace-nowrap font-poppins text-sm text-[#64748B]">
                                  {formatNumber(item.jumlah)}
                                </span>

                              </div>

                            </td>
                        {/* FILE */}

                        <td className="px-4 py-3">

                          <button
                            type="button"
                            onClick={() =>
                              handleFileClick(
                                item
                              )
                            }
                            title={
                              item.namaFile ||
                              "Tidak ada file"
                            }
                            disabled={
                              !item.namaFile
                            }
                            className={`
                              block
                              max-w-[520px]
                              truncate
                              text-left
                              font-poppins
                              text-sm
                              font-normal
                              transition
                              duration-200

                              ${
                                item.namaFile
                                  ? `
                                      cursor-pointer
                                      text-[#0EA5E9]
                                    `
                                  : `
                                      cursor-default
                                      text-[#94A3B8]
                                    `
                              }
                            `}
                          >

                            {item.namaFile ||
                              "Tidak ada file"}

                          </button>

                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-3">

                          <div className="flex items-center justify-center gap-2">

                            <button
                              type="button"
                              title="Edit"
                              onClick={() =>
                                openEditModal(
                                  item
                                )
                              }
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-md
                                text-black
                                transition
                                duration-200
                                hover:bg-[#F1F5F9]
                                active:scale-90
                              "
                            >
                              <Pencil
                                size={15}
                                strokeWidth={
                                  1.8
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Hapus"
                              onClick={() =>
                                openDeleteModal(
                                  item
                                )
                              }
                              className="
                                      flex
                                      h-8
                                      w-8
                                      items-center
                                      justify-center
                                      rounded-md
                                      text-red-500
                                      transition
                                      duration-200
                                      hover:bg-red-50
                                      hover:text-red-600
                                      active:scale-90
                                    "
                            >
                              <Trash2
                                size={15}
                                strokeWidth={
                                  1.8
                                }
                              />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                ) : !loading ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="
                        h-[160px]
                        text-center
                        font-poppins
                        text-sm
                        text-[#94A3B8]
                      "
                    >
                      Belum ada data Konfirmasi Piutang.
                    </td>

                  </tr>

                ) : null}

              </tbody>

            </table>

          </div>

        </div>

        {/* PAGINATION */}

        <div
          className="
            mt-4
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <p className="font-poppins text-sm text-[#64748B]">

            Showing{" "}
            {showingFrom}{" "}
            to{" "}
            {showingTo}{" "}
            of{" "}
            {dataList.length}{" "}
            entries

          </p>

          <div className="flex items-center gap-2">

            <button
              type="button"
              disabled={
                currentPage ===
                1
              }
              onClick={
                goPrevious
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-[#DCE5EF]
                bg-white
                text-[#475569]
                transition
                duration-200
                hover:bg-[#F8FAFC]
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <ChevronLeft
                size={16}
              />
            </button>

            <div
              className="
                flex
                h-9
                min-w-[36px]
                items-center
                justify-center
                rounded-lg
                bg-[#E0F2FE]
                px-3
                font-poppins
                text-sm
                font-semibold
                text-[#0EA5E9]
              "
            >
              {
                currentPage
              }
            </div>

            <button
              type="button"
              disabled={
                currentPage >=
                totalPages
              }
              onClick={
                goNext
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-[#DCE5EF]
                bg-white
                text-[#475569]
                transition
                duration-200
                hover:bg-[#F8FAFC]
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <ChevronRight
                size={16}
              />
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {modalOpen && (

        <div
          className={`
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            overflow-y-auto
            p-4
            transition-all
            duration-[280ms]

            ${
              modalVisible
                ? `
                    bg-black/40
                    opacity-100
                    backdrop-blur-[2px]
                  `
                : `
                    bg-black/0
                    opacity-0
                  `
            }
          `}
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div
            className={`
              my-auto
              w-full
              max-w-[600px]
              overflow-hidden
              rounded-xl
              bg-white
              transition-all
              duration-[280ms]

              ${
                modalVisible
                  ? `
                      translate-y-0
                      scale-100
                      opacity-100
                      shadow-[0_24px_70px_rgba(15,23,42,0.25)]
                    `
                  : `
                      translate-y-4
                      scale-[0.97]
                      opacity-0
                    `
              }
            `}
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                bg-[#38BDF8]
                px-6
                py-5
                text-white
              "
            >

              <div>

                <h2 className="font-poppins text-lg font-semibold">

                  {modalMode ===
                  "create"
                    ? "Tambah Data"
                    : "Edit Data"}

                </h2>

                <p className="mt-1 font-poppins text-sm text-white/80">

                  {modalMode ===
                  "create"
                    ? "Tambahkan data Konfirmasi Piutang"
                    : "Perbarui data Konfirmasi Piutang"}

                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  submitting
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  transition
                  hover:bg-white/10
                  disabled:opacity-50
                "
              >
                <X
                  size={19}
                />
              </button>

            </div>

            {/* BODY */}

            <div className="max-h-[70vh] overflow-y-auto px-6 py-6">

              {/* NAMA CUSTOMER */}

              <div>

                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Nama Customer
                </label>

                <input
                  type="text"
                  value={
                    formData.namaCustomer
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "namaCustomer",
                      event.target.value
                    )
                  }
                  placeholder="Masukkan nama customer"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#DCE5EF]
                    bg-white
                    px-4
                    font-poppins
                    text-sm
                    text-[#475569]
                    outline-none
                    transition
                    focus:border-[#38BDF8]
                  "
                />

              </div>

              {/* KOTA */}

              <div className="mt-5">

                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Kota Customer
                </label>

                <input
                  type="text"
                  value={
                    formData.kotaCustomer
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "kotaCustomer",
                      event.target.value
                    )
                  }
                  placeholder="Masukkan kota customer"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#DCE5EF]
                    bg-white
                    px-4
                    font-poppins
                    text-sm
                    text-[#475569]
                    outline-none
                    transition
                    focus:border-[#38BDF8]
                  "
                />

              </div>

              {/* JUMLAH */}

              <div className="mt-5">

                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Jumlah
                </label>

                <div
                  className="
                    flex
                    h-12
                    items-center
                    rounded-xl
                    border
                    border-[#DCE5EF]
                    bg-white
                    px-4
                    transition
                    focus-within:border-[#38BDF8]
                  "
                >

                  <span className="mr-2 font-poppins text-sm text-[#64748B]">
                    Rp
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      formData.jumlah
                    }
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "jumlah",
                        formatInputRupiah(
                          event.target.value
                        )
                      )
                    }
                    placeholder="0"
                    className="
                      min-w-0
                      flex-1
                      bg-transparent
                      font-poppins
                      text-sm
                      text-[#475569]
                      outline-none
                    "
                  />

                </div>

              </div>

              {/* FILE */}

              <div className="mt-5">

                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Upload File
                </label>

                <div
                  className="
                    flex
                    min-h-12
                    items-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-[#DCE5EF]
                    bg-white
                    transition
                    focus-within:border-[#38BDF8]
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="
                      flex
                      h-12
                      shrink-0
                      items-center
                      gap-2
                      border-r
                      border-[#DCE5EF]
                      px-4
                      font-poppins
                      text-sm
                      font-medium
                      text-[#475569]
                      transition
                      hover:bg-[#F8FAFC]
                    "
                  >
                    <Upload
                      size={15}
                    />

                    Choose File
                  </button>

                  <div className="min-w-0 flex-1 px-4">

                    {formData.file ? (

                      <span
                        title={
                          formData.file
                            .name
                        }
                        className="
                          block
                          truncate
                          font-poppins
                          text-sm
                          text-[#38BDF8]
                        "
                      >
                        {
                          formData.file
                            .name
                        }
                      </span>

                    ) : modalMode ===
                        "edit" &&
                      formData.namaFile ? (

                      <span
                        title={
                          formData.namaFile
                        }
                        className="
                          block
                          truncate
                          font-poppins
                          text-sm
                          text-[#475569]
                        "
                      >
                        {
                          formData.namaFile
                        }
                      </span>

                    ) : (

                      <span className="block truncate font-poppins text-sm text-[#94A3B8]">

                        {modalMode ===
                        "edit"
                          ? "Pilih file baru jika ingin mengganti"
                          : "Pilih file yang akan di-upload"}

                      </span>

                    )}

                  </div>

                  {formData.file && (

                    <button
                      type="button"
                      onClick={
                        removeSelectedFile
                      }
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        text-[#94A3B8]
                        transition
                        duration-200
                        hover:bg-red-50
                        hover:text-red-500
                      "
                    >
                      <X
                        size={15}
                      />
                    </button>

                  )}

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    className="hidden"
                    onChange={
                      handleFileSelected
                    }
                  />

                </div>

                <p className="mt-2 font-poppins text-[11px] text-[#94A3B8]">
                  Maksimal ukuran file 1MB.
                </p>

              </div>

            </div>

            {/* FOOTER */}

            <div
              className="
                flex
                items-center
                justify-end
                gap-3
                border-t
                border-[#DCE5EF]
                px-6
                py-4
              "
            >

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  submitting
                }
                className="
                  rounded-lg
                  border
                  border-[#DCE5EF]
                  bg-white
                  px-6
                  py-2.5
                  font-poppins
                  text-sm
                  font-medium
                  text-[#64748B]
                  transition
                  hover:bg-[#F8FAFC]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  handleSubmit
                }
                disabled={
                  submitting
                }
                className="
                  rounded-lg
                  bg-[#22A58A]
                  px-6
                  py-2.5
                  font-poppins
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-[#1B8C76]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {submitting
                  ? modalMode ===
                    "create"
                    ? "Menyimpan..."
                    : "Memperbarui..."
                  : modalMode ===
                    "create"
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