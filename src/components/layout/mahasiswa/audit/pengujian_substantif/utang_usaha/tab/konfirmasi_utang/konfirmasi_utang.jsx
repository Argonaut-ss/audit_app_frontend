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
  `${API_URL}/api/konfirmasi-utang-usaha`;

/* =====================================================
   MEMORY CACHE
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
   GET UTANG USAHA ID
===================================================== */

const getUtangUsahaId =
  (item) => {
    return normalizeId(
      item?.UtangUsahaID ??
        item?.utangUsahaID ??
        item?.utangUsahaId ??
        item?.utangUsaha
          ?.UtangUsahaID ??
        item?.utangUsaha?.utangUsahaID ??
        item?.utangUsaha?.id ??
        item?.utang_usaha
          ?.UtangUsahaID ??
        item?.utang_usaha?.utangUsahaID ??
        item?.utang_usaha?.id
    );
  };

/* =====================================================
   GET JWB KASUS ID DARI RELASI UTANG USAHA
===================================================== */

const getJwbKasusIdFromUtangUsaha =
  (item) => {
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

/* =====================================================
   NORMALIZE KONFIRMASI UTANG USAHA
===================================================== */

const normalizeKonfirmasi =
  (
    item
  ) => ({
    id:
      normalizeId(
        item?.KonfirmasiUtangUsahaID ??
          item?.konfirmasiUtangUsahaID ??
          item?.konfirmasiUtangUsahaId ??
          item?.id
      ),

    utangUsahaId:
      getUtangUsahaId(
        item
      ),

    namaCustomer:
      item?.NamaCustomer ??
      item?.namaCustomer ??
      "",

    kotaCustomer:
      item?.KotaCustomer ??
      item?.kotaCustomer ??
      "",

    jumlah:
      Number(
        item?.Jumlah ??
          item?.jumlah ??
          0
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

/* =====================================================
   COMPONENT
===================================================== */

export default function KonfirmasiUtangUsaha({
  jwbKasusId:
    jwbKasusIdProp,

  utangUsahaId:
    utangUsahaIdProp,

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
      activeUtangUsahaId,
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
          utangUsahaId:
            normalizeId(
              activeUtangUsahaId
            ),

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
     UTANG USAHA
  ===================================================== */

  const [
    utangUsahaId,
    setUtangUsahaId,
  ] = useState(() => {
    const propId =
      normalizeId(
        utangUsahaIdProp
      );

    if (propId) {
      return propId;
    }

    if (
      !activeJwbKasusId
    ) {
      return null;
    }

    return normalizeId(
      konfirmasiPageCache.get(
        String(
          activeJwbKasusId
        )
      )?.utangUsahaId
    );
  });

  /* =====================================================
     SYNC UTANG USAHA ID DARI PROP
     
     Prop tetap menjadi sumber utama untuk CREATE
     kalau parent sudah mengirimkan ID.
  ===================================================== */

  useEffect(() => {
    const nextId =
      normalizeId(
        utangUsahaIdProp
      );

    if (!nextId) {
      return;
    }

    setUtangUsahaId(
      nextId
    );

    if (
      activeJwbKasusId
    ) {
      const cached =
        konfirmasiPageCache.get(
          String(
            activeJwbKasusId
          )
        );

      konfirmasiPageCache.set(
        String(
          activeJwbKasusId
        ),
        {
          utangUsahaId:
            nextId,

          data:
            cached?.data || [],
        }
      );
    }
  }, [
    utangUsahaIdProp,
    activeJwbKasusId,
  ]);

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
     FETCH KONFIRMASI UTANG USAHA
     
     PENTING:
     - TIDAK membutuhkan UtangUsahaID untuk GET.
     - Endpoint tetap hanya:
       /api/konfirmasi-utang-usaha
     - Kalau UtangUsahaID ada, filter berdasarkan ID.
     - Kalau belum ada, filter berdasarkan JwbKasusID
       dari relasi utangUsaha.
     ===================================================== */

  const fetchKonfirmasiUtangUsaha =
    async (
      activeUtangUsahaId = null,
      options = {}
    ) => {
      const {
        updateState =
          true,
      } = options;

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
            "Gagal mengambil data Konfirmasi Utang Usaha."
          )
        );
      }

      const rawData =
        Array.isArray(
          result?.data
        )
          ? result.data
          : Array.isArray(
              result
            )
            ? result
            : [];

      const normalized =
        rawData.map(
          normalizeKonfirmasi
        );

      /*
       * PRIORITAS FILTER:
       *
       * 1. Jika UtangUsahaID tersedia,
       *    gunakan UtangUsahaID.
       *
       * 2. Jika UtangUsahaID belum tersedia,
       *    gunakan JwbKasusID dari relasi
       *    UtangUsaha.
       *
       * Jadi data lama tetap bisa muncul
       * walaupun parent belum mengirimkan ID.
       */

      let filtered =
        [];

      if (
        normalizeId(
          activeUtangUsahaId
        )
      ) {
        filtered =
          normalized.filter(
            (item) =>
              String(
                item.utangUsahaId
              ) ===
              String(
                normalizeId(
                  activeUtangUsahaId
                )
              )
          );
      } else if (
        activeJwbKasusId
      ) {
        filtered =
          normalized.filter(
            (item) =>
              String(
                getJwbKasusIdFromUtangUsaha(
                  item.utangUsaha
                )
              ) ===
              String(
                activeJwbKasusId
              )
          );
      }

      /*
       * Kalau data ditemukan melalui JwbKasusID,
       * otomatis ambil UtangUsahaID dari data tersebut.
       *
       * Ini yang membuat:
       *
       * Database existing
       *        ↓
       * Frontend tampil
       *        ↓
       * UtangUsahaID otomatis diketahui
       *        ↓
       * Tambah Data bisa digunakan
       */

      const inferredUtangUsahaId =
        normalizeId(
          activeUtangUsahaId
        ) ||
        normalizeId(
          filtered.find(
            (item) =>
              item.utangUsahaId
          )?.utangUsahaId
        );

      if (
        inferredUtangUsahaId
      ) {
        setUtangUsahaId(
          inferredUtangUsahaId
        );
      }

      if (
        updateState
      ) {
        setDataList(
          filtered
        );

        saveCurrentCache(
          inferredUtangUsahaId,
          filtered
        );
      }

      return filtered;
    };

  /* =====================================================
     VERIFY FILE UPLOAD
  ===================================================== */

  const verifyUploadedFile =
    async ({
      activeUtangUsahaId,
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
            await fetchKonfirmasiUtangUsaha(
              activeUtangUsahaId,
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

            const inferredId =
              normalizeId(
                activeUtangUsahaId
              ) ||
              normalizeId(
                item.utangUsahaId
              );

            if (
              inferredId
            ) {
              setUtangUsahaId(
                inferredId
              );
            }

            saveCurrentCache(
              inferredId,
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
      activeUtangUsahaId,
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
            await fetchKonfirmasiUtangUsaha(
              activeUtangUsahaId,
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

            const inferredId =
              normalizeId(
                activeUtangUsahaId
              ) ||
              normalizeId(
                item.utangUsahaId
              );

            if (
              inferredId
            ) {
              setUtangUsahaId(
                inferredId
              );
            }

            saveCurrentCache(
              inferredId,
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
     - Cache langsung tampil.
     - API tetap dipanggil walaupun
       UtangUsahaID belum tersedia.
     - Existing data dicari berdasarkan
       JwbKasusID melalui relasi utangUsaha.
  ===================================================== */

  useEffect(() => {
    let cancelled =
      false;

    const loadPage =
      async () => {
        if (
          !activeJwbKasusId
        ) {
          setUtangUsahaId(
            normalizeId(
              utangUsahaIdProp
            )
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
         * UtangUsahaID dari:
         *
         * 1. prop
         * 2. cache
         *
         * Tetapi TIDAK dijadikan syarat
         * untuk melakukan GET.
         */

        const activeUtangUsahaId =
          normalizeId(
            utangUsahaIdProp
          ) ||
          normalizeId(
            cached?.utangUsahaId
          ) ||
          null;

        if (
          activeUtangUsahaId
        ) {
          setUtangUsahaId(
            activeUtangUsahaId
          );
        }

        /*
         * Cache langsung tampil
         * sementara API melakukan refresh.
         */

        if (cached) {
          setDataList(
            cached.data || []
          );

          if (
            activeUtangUsahaId
          ) {
            setUtangUsahaId(
              activeUtangUsahaId
            );
          }

          setLoading(
            false
          );
        } else {
          setLoading(
            true
          );
        }

        /*
         * JANGAN return hanya karena
         * activeUtangUsahaId kosong.
         *
         * API GET tetap dipanggil.
         */

        try {
          const latestData =
            await fetchKonfirmasiUtangUsaha(
              activeUtangUsahaId
            );

          if (
            cancelled
          ) {
            return;
          }

          /*
           * fetchKonfirmasiUtangUsaha sudah
           * otomatis mengambil UtangUsahaID
           * dari data existing jika ada.
           */

          const inferredId =
            normalizeId(
              activeUtangUsahaId
            ) ||
            normalizeId(
              latestData.find(
                (item) =>
                  item.utangUsahaId
              )?.utangUsahaId
            );

          if (
            inferredId
          ) {
            setUtangUsahaId(
              inferredId
            );
          }

          saveCurrentCache(
            inferredId,
            latestData
          );
        } catch (
          err
        ) {
          console.error(
            "ERROR LOAD KONFIRMASI UTANG USAHA:",
            err
          );

          if (
            !cancelled
          ) {
            /*
             * Jangan langsung menghapus cache
             * jika sebelumnya sudah ada.
             */

            if (!cached) {
              setDataList(
                []
              );
            }

            showErrorAlert(
              "Gagal Memuat Data",
              err?.message ||
                "Data Konfirmasi Utang Usaha gagal dimuat."
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
    utangUsahaIdProp,
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

      /*
       * UtangUsahaID hanya diperlukan
       * untuk CREATE.
       *
       * Data existing tidak membutuhkan
       * ID ini untuk ditampilkan.
       */

      if (
        !utangUsahaId
      ) {
        showErrorAlert(
          "UtangUsahaID Tidak Ditemukan",
          "UtangUsahaID belum tersedia untuk menambahkan data. Silakan pastikan data Utang Usaha untuk kasus ini sudah tersedia."
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
          "Ukuran file maksimal 10MB."
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
        !utangUsahaId
      ) {
        throw new Error(
          "UtangUsahaID tidak tersedia."
        );
      }

      const form =
        new FormData();

      form.append(
        "UtangUsahaID",
        String(
          utangUsahaId
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
            "Data Konfirmasi Utang Usaha gagal disimpan."
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
            "Data Konfirmasi Utang Usaha gagal disimpan."
          )
        );
      }

      const createdId =
        normalizeId(
          result?.data
            ?.KonfirmasiUtangUsahaID
        );

      if (
        !createdId
      ) {
        throw new Error(
          "KonfirmasiUtangUsahaID hasil penyimpanan tidak ditemukan."
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
          "KonfirmasiUtangUsahaID tidak tersedia."
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
          "File Konfirmasi Utang Usaha gagal di-upload."
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
          "KonfirmasiUtangUsahaID tidak tersedia."
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
          "Data Konfirmasi Utang Usaha gagal diperbarui."
        )
      );
    };

  /* =====================================================
     REFRESH + CACHE
     
     Refresh juga tidak memerlukan UtangUsahaID
     untuk mengambil data.
  ===================================================== */

  const refreshKonfirmasi =
    async () => {
      const latestData =
        await fetchKonfirmasiUtangUsaha(
          utangUsahaId || null
        );

      const inferredId =
        normalizeId(
          utangUsahaId
        ) ||
        normalizeId(
          latestData.find(
            (item) =>
              item.utangUsahaId
          )?.utangUsahaId
        );

      if (
        inferredId
      ) {
        setUtangUsahaId(
          inferredId
        );
      }

      saveCurrentCache(
        inferredId,
        latestData
      );

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
                  activeUtangUsahaId:
                    utangUsahaId,

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
                  "Data Konfirmasi Utang Usaha berhasil disimpan, tetapi file belum berhasil dipastikan tersimpan."
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
            "Data konfirmasi utang usaha berhasil disimpan."
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
              "Data konfirmasi utang usaha berhasil diperbarui."
          );

          closeAfterSave();

          return;
        }

        if (
          result?.malformed
        ) {
          const verified =
            await verifyUpdatedData({
              activeUtangUsahaId:
                utangUsahaId,

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
      } catch (
        err
      ) {
        console.error(
          "ERROR SAVE KONFIRMASI UTANG USAHA:",
          err
        );

        showErrorAlert(
          modalMode ===
            "create"
            ? "Gagal Menyimpan"
            : "Gagal Memperbarui",

          err?.message ||
            "Data Konfirmasi Utang Usaha gagal diproses."
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
              "Data Konfirmasi Utang Usaha gagal dihapus."
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
            "Data konfirmasi utang usaha berhasil dihapus."
        );
      } catch (
        err
      ) {
        console.error(
          "ERROR DELETE KONFIRMASI UTANG USAHA:",
          err
        );

        showErrorAlert(
          "Gagal Menghapus",
          err?.message ||
            "Data Konfirmasi Utang Usaha gagal dihapus."
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
          "KonfirmasiUtangUsahaID tidak tersedia."
        );

        return;
      }

      if (
        !item
          ?.namaFile
      ) {
        showErrorAlert(
          "File Tidak Tersedia",
          "File Konfirmasi Utang Usaha tidak tersedia."
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
              "File Konfirmasi Utang Usaha gagal diunduh."
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
          "konfirmasi-utang-usaha";

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
          "ERROR DOWNLOAD FILE KONFIRMASI UTANG USAHA:",
          err
        );

        showErrorAlert(
          "Gagal Mengunduh File",
          err?.message ||
            "File Konfirmasi Utang Usaha gagal diunduh."
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
            previous - 1
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
            previous + 1
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
        message="Apakah Anda yakin ingin menghapus data Konfirmasi Utang Usaha?"
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
              loading ||
              !utangUsahaId
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
                    FILE KONFIRMASI UTANG USAHA
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
                              {formatNumber(
                                item.jumlah
                              )}
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
                      Belum ada data Konfirmasi Utang Usaha.
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
                    ? "Tambahkan data Konfirmasi Utang Usaha"
                    : "Perbarui data Konfirmasi Utang Usaha"}

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
                  Maksimal ukuran file 10MB.
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
                  rounded-md bg-[#FF3030] 
                  px-6 py-2.5 font-poppins 
                  text-xs 
                  font-medium
                  text-white 
                  transition 
                  hover:bg-[#E11D1D] 
                  disabled:opacity-40
                "
              >
                Keluar
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
                  rounded-md bg-[#00A51A] 
                  px-6 py-2.5 
                  font-poppins 
                  text-xs 
                  font-medium
                  text-white 
                  transition 
                  hover:bg-[#008C16] 
                  disabled:opacity-40
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