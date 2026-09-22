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
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Trash2,
} from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import Dropdown from "@/components/ui/dropdown/dropdown";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";

/* =====================================================
   API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const API_ENDPOINT =
  `${API_URL}/api/rekap-balasan-utang-usaha`;

const BULK_SAVE_ENDPOINT =
  `${API_ENDPOINT}/bulk-save`;

/* =====================================================
   MEMORY CACHE
===================================================== */

const rekapBalasanUtangUsahaPageCache =
  new Map();

/* =====================================================
   AUTH
===================================================== */

const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

const fetchWithAuth = async (
  url,
  options = {}
) => {
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

      Authorization:
        `Bearer ${token}`,

      ...(options.headers || {}),
    },
  });
};

/* =====================================================
   RESPONSE HELPER
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
    return JSON.parse(text);
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
    typeof result.errors === "object"
  ) {
    const firstError =
      Object.values(result.errors)
        .flat()
        .find(Boolean);

    if (firstError) {
      return String(firstError);
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
   ID HELPER
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

  const raw =
    Array.isArray(value)
      ? value[0]
      : value;

  const parsed =
    Number(raw);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
};

/* =====================================================
   NUMBER HELPER
===================================================== */

const toNumber = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (
    typeof value === "number"
  ) {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  const cleaned =
    String(value).replace(
      /[^\d-]/g,
      ""
    );

  if (
    !cleaned ||
    cleaned === "-"
  ) {
    return 0;
  }

  const parsed =
    Number(cleaned);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

const parseNumber = (
  value
) =>
  toNumber(value);

const formatNumber = (
  value
) =>
  new Intl.NumberFormat(
    "id-ID"
  ).format(
    toNumber(value)
  );

/* =====================================================
   DATE
===================================================== */

const toDateInput = (
  value
) => {
  if (!value) {
    return "";
  }

  return String(value).slice(
    0,
    10
  );
};

/* =====================================================
   STATUS
===================================================== */

const statusFromBackend = (
  value
) => {
  const normalized =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    normalized === "terbalas"
  ) {
    return "Terbalas";
  }

  if (
    normalized ===
    "tidak terbalas"
  ) {
    return "Tidak Terbalas";
  }

  return "";
};

const statusToBackend = (
  value
) => {
  const normalized =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    normalized === "terbalas"
  ) {
    return "terbalas";
  }

  if (
    normalized ===
    "tidak terbalas"
  ) {
    return "tidak terbalas";
  }

  return "";
};

/* =====================================================
   SELISIH
===================================================== */

const getSelisih = (
  saldoBukuBesar,
  saldoJawaban
) =>
  toNumber(saldoBukuBesar) -
  toNumber(saldoJawaban);

/* =====================================================
   CUSTOMER NORMALIZER
===================================================== */

const normalizeKonfirmasi = (
  item,
  fallbackUtangUsahaId = null
) => ({
  id:
    normalizeId(
      item?.KonfirmasiUtangUsahaID ??
      item?.id
    ),

  utangUsahaId:
    normalizeId(
      item?.UtangUsahaID ??
      fallbackUtangUsahaId
    ),

  namaCustomer:
    item?.NamaCustomer ??
    item?.namaCustomer ??
    "",

  jumlah:
    toNumber(
      item?.Jumlah ??
      item?.jumlah
    ),

  kotaCustomer:
    item?.KotaCustomer ??
    item?.kotaCustomer ??
    "",
});

/* =====================================================
   REKAP NORMALIZER
===================================================== */

const normalizeRekap = (
  item,
  fallbackUtangUsahaId = null
) => {
  const konfirmasi =
    item?.konfirmasi_utang_usaha ??
    item?.konfirmasiUtangUsaha ??
    null;

  const utangUsahaId =
    normalizeId(
      item?.UtangUsahaID ??
      fallbackUtangUsahaId
    );

  const saldoBBFromKonfirmasi =
    konfirmasi?.Jumlah ??
    konfirmasi?.jumlah;

  const saldoBB =
    saldoBBFromKonfirmasi !==
      undefined &&
    saldoBBFromKonfirmasi !==
      null
      ? toNumber(
          saldoBBFromKonfirmasi
        )
      : toNumber(
          item?.SaldoBB
        );

  const saldoJawaban =
    toNumber(
      item?.SaldoJawab
    );

  return {
    id:
      normalizeId(
        item?.RekapBalasanUtangUsahaID ??
        item?.id
      ),

    rekapId:
      normalizeId(
        item?.RekapBalasanUtangUsahaID ??
        item?.id
      ),

    isNew: false,

    utangUsahaId,

    konfirmasiId:
      normalizeId(
        item?.KonfirmasiUtangUsahaID
      ) ?? "",

    nama:
      konfirmasi?.NamaCustomer ??
      konfirmasi?.namaCustomer ??
      "",

    saldoBukuBesar:
      saldoBB,

    tanggalKirim:
      toDateInput(
        item?.TanggalKirim
      ),

    pengirimanVia:
      item?.MetodeKirim ??
      "",

    tanggalJawaban:
      toDateInput(
        item?.TanggalJawab
      ),

    saldoJawaban,

    selisih:
      item?.Selisih !==
        undefined &&
      item?.Selisih !==
        null
        ? toNumber(
            item?.Selisih
          )
        : getSelisih(
            saldoBB,
            saldoJawaban
          ),

    namaBukti:
      item?.NamaFile ??
      "",

    tipeFile:
      item?.TipeFile ??
      "",

    buktiFile: null,

    statusKonfirmasi:
      statusFromBackend(
        item?.Status
      ),
  };
};

/* =====================================================
   ANSWER TYPE
===================================================== */

const getJenisJawaban = (
  row
) => {
  const status =
    String(
      row?.statusKonfirmasi ||
      ""
    )
      .trim()
      .toLowerCase();

  if (
    status ===
    "tidak terbalas"
  ) {
    return "tidak";
  }

  if (
    status !== "terbalas"
  ) {
    return "kosong";
  }

  if (
    toNumber(
      row.saldoBukuBesar
    ) ===
    toNumber(
      row.saldoJawaban
    )
  ) {
    return "sesuai";
  }

  return "berbeda";
};

/* =====================================================
   ESCAPE HTML
===================================================== */

const escapeHtml = (
  value
) =>
  String(value ?? "")
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

/* =====================================================
   PAGE
===================================================== */

export default function RekapBalasanUtangUsahaPage({
  jwbKasusId: jwbKasusIdProp,
  refetchToken = 0,
  onSaved,
}) {
  const params =
    useParams();

  const searchParams =
    useSearchParams();

  /* =====================================================
     ACTIVE JWB KASUS
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

      const fromParams =
        normalizeId(
          params?.JwbKasusID ??
          params?.jwbKasusId ??
          params?.jwb_kasus_id
        );

      if (fromParams) {
        return fromParams;
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

  const cacheKey =
    activeJwbKasusId
      ? String(
          activeJwbKasusId
        )
      : null;

  const initialCache =
    cacheKey
      ? rekapBalasanUtangUsahaPageCache.get(
          cacheKey
        ) || null
      : null;

  /* =====================================================
     STATE
  ===================================================== */

  const [
    utangUsahaId,
    setUtangUsahaId,
  ] = useState(
    () =>
      initialCache?.utangUsahaId ||
      null
  );

  const [
    customerOptions,
    setCustomerOptions,
  ] = useState(
    () =>
      initialCache?.customerOptions ||
      []
  );

  const [
    dataList,
    setDataList,
  ] = useState(
    () =>
      initialCache?.dataList ||
      []
  );

  const [
    filterStatus,
    setFilterStatus,
  ] = useState(
    "Semua Konfirmasi"
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    exportOpen,
    setExportOpen,
  ] = useState(false);

  const [
    deleteModalOpen,
    setDeleteModalOpen,
  ] = useState(false);

  const [
    deletingData,
    setDeletingData,
  ] = useState(null);

  const [
    successAlert,
    setSuccessAlert,
  ] = useState({
    title: "",
    message: "",
  });

  const [
    errorAlert,
    setErrorAlert,
  ] = useState({
    title: "",
    message: "",
  });

  const fileInputRefs =
    useRef({});

  const exportRef =
    useRef(null);

  /* =====================================================
     ALERT
  ===================================================== */

  const showSuccessAlert = (
    title,
    message
  ) => {
    setSuccessAlert({
      title,
      message,
    });
  };

  const showErrorAlert = (
    title,
    message
  ) => {
    setErrorAlert({
      title,
      message,
    });
  };

  /* =====================================================
     LOAD PAGE DATA
  ===================================================== */

  const loadPageData =
    async (
      activeId
    ) => {
      if (!activeId) {
        setUtangUsahaId(null);
        setCustomerOptions([]);
        setDataList([]);

        return;
      }

      const response =
        await fetchWithAuth(
          `${API_ENDPOINT}?_=${Date.now()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (!response.ok) {
        if (
          response.status === 401
        ) {
          throw new Error(
            "Unauthenticated. Silakan login kembali."
          );
        }

        throw new Error(
          getApiError(
            result,
            "Gagal mengambil data Rekap Balasan Utang Usaha."
          )
        );
      }

      const utangUsahaRows =
        Array.isArray(result)
          ? result
          : Array.isArray(
              result?.data
            )
          ? result.data
          : [];

      /* =================================================
         FIND ACTIVE UTANG USAHA
      ================================================= */

      const activeUtangUsaha =
        utangUsahaRows.find(
          (item) => {
            const itemJwbKasusId =
              normalizeId(
                item?.JwbKasusID ??
                item?.jwb_kasus_id ??
                item?.jwbKasusId
              );

            return (
              String(
                itemJwbKasusId
              ) ===
              String(activeId)
            );
          }
        ) ?? null;

      if (!activeUtangUsaha) {
        const emptyData = {
          utangUsahaId: null,
          customerOptions: [],
          dataList: [],
        };

        rekapBalasanUtangUsahaPageCache.set(
          String(activeId),
          emptyData
        );

        setUtangUsahaId(null);
        setCustomerOptions([]);
        setDataList([]);

        return emptyData;
      }

      /* =================================================
         ACTIVE UTANG USAHA ID
      ================================================= */

      const activeUtangUsahaId =
        normalizeId(
          activeUtangUsaha?.UtangUsahaID ??
          activeUtangUsaha?.id
        );

      /* =================================================
         ALL CONFIRMATION CUSTOMERS
      ================================================= */

      const rawAllCustomers =
        Array.isArray(
          activeUtangUsaha
            ?.konfirmasiUtangUsaha
        )
          ? activeUtangUsaha
              .konfirmasiUtangUsaha
          : Array.isArray(
              activeUtangUsaha
                ?.konfirmasi_utang_usaha
            )
          ? activeUtangUsaha
              .konfirmasi_utang_usaha
          : [];

      /* =================================================
         AVAILABLE CONFIRMATION CUSTOMERS

         Controller menyediakan:
         konfirmasiUtangUsahaTersedia
      ================================================= */

      const rawAvailableCustomers =
        Array.isArray(
          activeUtangUsaha
            ?.konfirmasiUtangUsahaTersedia
        )
          ? activeUtangUsaha
              .konfirmasiUtangUsahaTersedia
          : Array.isArray(
              activeUtangUsaha
                ?.konfirmasi_utang_usaha_tersedia
            )
          ? activeUtangUsaha
              .konfirmasi_utang_usaha_tersedia
          : [];

      /* =================================================
         REKAP BALASAN
      ================================================= */

      const rawRekap =
        Array.isArray(
          activeUtangUsaha
            ?.rekapBalasan
        )
          ? activeUtangUsaha
              .rekapBalasan
          : Array.isArray(
              activeUtangUsaha
                ?.rekap_balasan
            )
          ? activeUtangUsaha
              .rekap_balasan
          : [];

      /* =================================================
         CUSTOMER MAP

         Gabungkan:
         1. Semua Konfirmasi Utang Usaha
         2. Konfirmasi yang tersedia
         3. Konfirmasi yang sudah dipakai
            melalui nested rekap

         IMPORTANT:
         Semua customer tetap dimasukkan ke options.
         Tidak ada customer yang dihapus karena
         sudah digunakan pada row sebelumnya.
      ================================================= */

      const customerMap =
        new Map();

      const addCustomerToMap =
        (item) => {
          if (!item) {
            return;
          }

          const normalized =
            normalizeKonfirmasi(
              item,
              activeUtangUsahaId
            );

          if (
            !normalized.id ||
            !normalized.namaCustomer
          ) {
            return;
          }

          customerMap.set(
            String(
              normalized.id
            ),
            normalized
          );
        };

      rawAllCustomers.forEach(
        addCustomerToMap
      );

      rawAvailableCustomers.forEach(
        addCustomerToMap
      );

      rawRekap.forEach(
        (rekapItem) => {
          const nestedCustomer =
            rekapItem
              ?.konfirmasiUtangUsaha ??
            rekapItem
              ?.konfirmasi_utang_usaha ??
            null;

          addCustomerToMap(
            nestedCustomer
          );
        }
      );

      const allCustomers =
        Array.from(
          customerMap.values()
        );

      /* =================================================
         NORMALIZE REKAP
      ================================================= */

      const normalizedRekap =
        rawRekap.map(
          (item) => {
            const row =
              normalizeRekap(
                item,
                activeUtangUsahaId
              );

            return {
              ...row,

              utangUsahaId:
                activeUtangUsahaId,
            };
          }
        );

      const nextData = {
        utangUsahaId:
          activeUtangUsahaId,

        customerOptions:
          allCustomers,

        dataList:
          normalizedRekap,
      };

      rekapBalasanUtangUsahaPageCache.set(
        String(activeId),
        nextData
      );

      setUtangUsahaId(
        activeUtangUsahaId
      );

      setCustomerOptions(
        allCustomers
      );

      setDataList(
        normalizedRekap
      );

      return nextData;
    };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    let cancelled =
      false;

    const load = async () => {
      if (
        !activeJwbKasusId
      ) {
        setUtangUsahaId(null);
        setCustomerOptions([]);
        setDataList([]);

        return;
      }

      const cached =
        rekapBalasanUtangUsahaPageCache.get(
          String(
            activeJwbKasusId
          )
        );

      if (cached) {
        setUtangUsahaId(
          cached.utangUsahaId ||
          null
        );

        setCustomerOptions(
          cached.customerOptions ||
          []
        );

        setDataList(
          cached.dataList ||
          []
        );
      }

      try {
        await loadPageData(
          activeJwbKasusId
        );
      } catch (error) {
        console.error(
          "LOAD REKAP UTANG USAHA ERROR:",
          error
        );

        if (
          cancelled
        ) {
          return;
        }

        if (!cached) {
          setUtangUsahaId(null);
          setCustomerOptions([]);
          setDataList([]);
        }

        showErrorAlert(
          "Gagal Memuat Data",
          error?.message ||
            "Data Rekap Balasan Utang Usaha gagal dimuat."
        );
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [
    activeJwbKasusId,
    refetchToken,
  ]);

  /* =====================================================
     CACHE SYNC
  ===================================================== */

  useEffect(() => {
    if (
      !activeJwbKasusId
    ) {
      return;
    }

    rekapBalasanUtangUsahaPageCache.set(
      String(
        activeJwbKasusId
      ),
      {
        utangUsahaId,
        customerOptions,
        dataList,
      }
    );
  }, [
    activeJwbKasusId,
    utangUsahaId,
    customerOptions,
    dataList,
  ]);

  /* =====================================================
     EXPORT OUTSIDE
  ===================================================== */

  useEffect(() => {
    const handleMouseDown = (
      event
    ) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(
          event.target
        )
      ) {
        setExportOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleMouseDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleMouseDown
      );
    };
  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredData =
    useMemo(() => {
      if (
        filterStatus ===
        "Semua Konfirmasi"
      ) {
        return dataList;
      }

      return dataList.filter(
        (row) =>
          row.statusKonfirmasi ===
          filterStatus
      );
    }, [
      dataList,
      filterStatus,
    ]);

  /* =====================================================
     TOTAL
  ===================================================== */

  const totalSaldoBukuBesar =
    useMemo(
      () =>
        dataList.reduce(
          (
            total,
            row
          ) =>
            total +
            toNumber(
              row.saldoBukuBesar
            ),
          0
        ),
      [
        dataList,
      ]
    );

  const totalSaldoJawaban =
    useMemo(
      () =>
        dataList.reduce(
          (
            total,
            row
          ) =>
            total +
            toNumber(
              row.saldoJawaban
            ),
          0
        ),
      [
        dataList,
      ]
    );

  /* =====================================================
     PERCENTAGE
  ===================================================== */

  const percentage =
    useMemo(() => {
      const total =
        dataList.length;

      if (!total) {
        return {
          sesuai: "0.00",
          berbeda: "0.00",
          tidak: "0.00",
        };
      }

      const sesuai =
        dataList.filter(
          (row) =>
            getJenisJawaban(
              row
            ) === "sesuai"
        ).length;

      const berbeda =
        dataList.filter(
          (row) =>
            getJenisJawaban(
              row
            ) === "berbeda"
        ).length;

      const tidak =
        dataList.filter(
          (row) =>
            getJenisJawaban(
              row
            ) === "tidak"
        ).length;

      return {
        sesuai:
          (
            (sesuai /
              total) *
            100
          ).toFixed(2),

        berbeda:
          (
            (berbeda /
              total) *
            100
          ).toFixed(2),

        tidak:
          (
            (tidak /
              total) *
            100
          ).toFixed(2),
      };
    }, [
      dataList,
    ]);

  /* =====================================================
     UPDATE ROW
  ===================================================== */

  const updateRow = (
    rowId,
    field,
    value
  ) => {
    setDataList(
      (previous) =>
        previous.map(
          (row) =>
            String(row.id) ===
            String(rowId)
              ? {
                  ...row,
                  [field]: value,
                }
              : row
        )
    );
  };

  /* =====================================================
     CUSTOMER OPTIONS PER ROW

     IMPORTANT:
     Semua customer selalu ditampilkan.

     Customer yang sudah dipilih pada Row 1
     tetap tersedia pada Row 2, Row 3, dst.

     Tidak ada filter berdasarkan customer
     yang sudah digunakan oleh row lain.
  ===================================================== */

  const getCustomerOptionsForRow =
    (
      currentRow
    ) => {
      const options =
        customerOptions.map(
          (
            customer
          ) => ({
            ...customer,
          })
        );

      /*
       * Pastikan customer yang sedang
       * dipilih oleh row tersebut tetap
       * muncul.
       */

      if (
        currentRow.konfirmasiId &&
        currentRow.nama
      ) {
        const alreadyExists =
          options.some(
            (
              customer
            ) =>
              String(
                customer.id
              ) ===
              String(
                currentRow.konfirmasiId
              )
          );

        if (
          !alreadyExists
        ) {
          options.unshift({
            id:
              currentRow.konfirmasiId,

            utangUsahaId:
              currentRow.utangUsahaId,

            namaCustomer:
              currentRow.nama,

            jumlah:
              toNumber(
                currentRow.saldoBukuBesar
              ),
          });
        }
      }

      return options;
    };

  /* =====================================================
     CUSTOMER CHANGE
  ===================================================== */

  const handleCustomerChange =
    (
      rowId,
      customerId
    ) => {
      const currentRow =
        dataList.find(
          (row) =>
            String(row.id) ===
            String(rowId)
        );

      if (!currentRow) {
        return;
      }

      if (!customerId) {
        setDataList(
          (previous) =>
            previous.map(
              (row) =>
                String(row.id) ===
                String(rowId)
                  ? {
                      ...row,

                      konfirmasiId:
                        "",

                      nama:
                        "",

                      saldoBukuBesar:
                        0,

                      selisih:
                        getSelisih(
                          0,
                          row.saldoJawaban
                        ),
                    }
                  : row
            )
        );

        return;
      }

      /*
       * Customer TIDAK lagi dicek apakah
       * sudah digunakan oleh row lain.
       *
       * Jadi:
       *
       * Row 1 -> Toko A
       * Row 2 -> Toko A
       * Row 3 -> Toko A
       *
       * semuanya diperbolehkan.
       */

      const selectedCustomer =
        getCustomerOptionsForRow(
          currentRow
        ).find(
          (
            customer
          ) =>
            String(
              customer.id
            ) ===
            String(
              customerId
            )
        );

      if (
        !selectedCustomer
      ) {
        showErrorAlert(
          "Customer Tidak Ditemukan",
          "Data customer tidak tersedia."
        );

        return;
      }

      setDataList(
        (previous) =>
          previous.map(
            (row) =>
              String(row.id) ===
              String(rowId)
                ? {
                    ...row,

                    konfirmasiId:
                      selectedCustomer.id,

                    nama:
                      selectedCustomer
                        .namaCustomer,

                    saldoBukuBesar:
                      toNumber(
                        selectedCustomer
                          .jumlah
                      ),

                    utangUsahaId:
                      utangUsahaId,

                    selisih:
                      getSelisih(
                        selectedCustomer
                          .jumlah,
                        row.saldoJawaban
                      ),
                  }
                : row
          )
      );
    };

  /* =====================================================
     ADD DATA

     IMPORTANT:
     Tidak lagi menghitung customer yang sudah
     digunakan.

     Artinya Add Data dapat terus dilakukan
     walaupun semua customer sudah pernah
     dipilih pada row sebelumnya.
  ===================================================== */

  const handleAddData =
    () => {
      const activeUtangUsahaId =
        normalizeId(
          utangUsahaId
        );

      if (
        !activeUtangUsahaId
      ) {
        showErrorAlert(
          "Utang Usaha Belum Tersedia",
          "Data Utang Usaha untuk tugas ini tidak ditemukan."
        );

        return;
      }

      /*
       * Pastikan minimal ada customer yang
       * tersedia untuk dipilih.
       *
       * Tidak peduli customer tersebut
       * sudah digunakan di row sebelumnya.
       */

      if (
        customerOptions.length ===
        0
      ) {
        showErrorAlert(
          "Customer Belum Tersedia",
          "Data customer Konfirmasi Utang Usaha belum tersedia."
        );

        return;
      }

      const newData = {
        id:
          `temp-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,

        rekapId:
          null,

        isNew:
          true,

        utangUsahaId:
          activeUtangUsahaId,

        konfirmasiId:
          "",

        nama:
          "",

        saldoBukuBesar:
          0,

        tanggalKirim:
          "",

        pengirimanVia:
          "",

        tanggalJawaban:
          "",

        saldoJawaban:
          0,

        selisih:
          0,

        namaBukti:
          "",

        tipeFile:
          "",

        buktiFile:
          null,

        statusKonfirmasi:
          "",
      };

      setDataList(
        (previous) => [
          ...previous,
          newData,
        ]
      );
    };

  /* =====================================================
     FILE SELECT
  ===================================================== */

  const handleFileSelected =
    (
      rowId,
      event
    ) => {
      const file =
        event.target.files?.[0];

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

      setDataList(
        (previous) =>
          previous.map(
            (row) =>
              String(row.id) ===
              String(rowId)
                ? {
                    ...row,

                    buktiFile:
                      file,

                    namaBukti:
                      file.name,

                    tipeFile:
                      file.type ||
                      "application/octet-stream",
                  }
                : row
          )
      );
    };

  /* =====================================================
     VIEW FILE
  ===================================================== */

  const handleViewBukti =
    async (
      row
    ) => {
      if (
        typeof File !==
          "undefined" &&
        row?.buktiFile instanceof
          File
      ) {
        const url =
          URL.createObjectURL(
            row.buktiFile
          );

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );

        setTimeout(
          () =>
            URL.revokeObjectURL(
              url
            ),
          10000
        );

        return;
      }

      if (
        !row?.rekapId
      ) {
        showErrorAlert(
          "Bukti Tidak Tersedia",
          "File bukti belum tersimpan."
        );

        return;
      }

      try {
        const response =
          await fetchWithAuth(
            `${API_ENDPOINT}/${encodeURIComponent(
              row.rekapId
            )}/file`,
            {
              method: "GET",
            }
          );

        if (!response.ok) {
          let result =
            null;

          try {
            result =
              await parseResponse(
                response
              );
          } catch {
            result =
              null;
          }

          throw new Error(
            getApiError(
              result,
              "File bukti tidak dapat dibuka."
            )
          );
        }

        const blob =
          await response.blob();

        if (
          !blob ||
          blob.size === 0
        ) {
          throw new Error(
            "File bukti kosong."
          );
        }

        const url =
          URL.createObjectURL(
            blob
          );

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );

        setTimeout(
          () =>
            URL.revokeObjectURL(
              url
            ),
          10000
        );
      } catch (error) {
        console.error(
          "VIEW FILE ERROR:",
          error
        );

        showErrorAlert(
          "Gagal Membuka Bukti",
          error?.message ||
            "File bukti gagal dibuka."
        );
      }
    };

  /* =====================================================
     BULK SAVE FORM DATA
  ===================================================== */

  const buildBulkSaveFormData =
    (
      rows,
      activeUtangUsahaId
    ) => {
      const form =
        new FormData();

      rows.forEach(
        (
          row,
          index
        ) => {
          const prefix =
            `data[${index}]`;

          /* =============================================
             REKAP ID
          ============================================= */

          if (
            row.rekapId
          ) {
            form.append(
              `${prefix}[RekapBalasanUtangUsahaID]`,
              String(
                row.rekapId
              )
            );
          }

          /* =============================================
             UTANG USAHA ID
          ============================================= */

          const rowUtangUsahaId =
            normalizeId(
              row.utangUsahaId
            ) ||
            activeUtangUsahaId;

          form.append(
            `${prefix}[UtangUsahaID]`,
            String(
              rowUtangUsahaId
            )
          );

          /* =============================================
             KONFIRMASI UTANG USAHA ID
          ============================================= */

          const konfirmasiId =
            normalizeId(
              row.konfirmasiId
            );

          if (
            konfirmasiId
          ) {
            form.append(
              `${prefix}[KonfirmasiUtangUsahaID]`,
              String(
                konfirmasiId
              )
            );
          }

          /* =============================================
             SALDO BUKU BESAR
          ============================================= */

          form.append(
            `${prefix}[SaldoBB]`,
            String(
              toNumber(
                row.saldoBukuBesar
              )
            )
          );

          /* =============================================
             TANGGAL KIRIM
          ============================================= */

          if (
            row.tanggalKirim
          ) {
            form.append(
              `${prefix}[TanggalKirim]`,
              row.tanggalKirim
            );
          }

          /* =============================================
             METODE KIRIM
          ============================================= */

          const metodeKirim =
            String(
              row.pengirimanVia ||
              ""
            ).trim();

          if (
            metodeKirim
          ) {
            form.append(
              `${prefix}[MetodeKirim]`,
              metodeKirim
            );
          }

          /* =============================================
             TANGGAL JAWAB
          ============================================= */

          if (
            row.tanggalJawaban
          ) {
            form.append(
              `${prefix}[TanggalJawab]`,
              row.tanggalJawaban
            );
          }

          /* =============================================
             SALDO JAWABAN
          ============================================= */

          form.append(
            `${prefix}[SaldoJawab]`,
            String(
              toNumber(
                row.saldoJawaban
              )
            )
          );

          /* =============================================
             SELISIH
          ============================================= */

          form.append(
            `${prefix}[Selisih]`,
            String(
              getSelisih(
                row.saldoBukuBesar,
                row.saldoJawaban
              )
            )
          );

          /* =============================================
             STATUS
          ============================================= */

          const backendStatus =
            statusToBackend(
              row.statusKonfirmasi
            );

          if (
            backendStatus
          ) {
            form.append(
              `${prefix}[Status]`,
              backendStatus
            );
          }

          /* =============================================
             FILE BUKTI
          ============================================= */

          if (
            typeof File !==
              "undefined" &&
            row.buktiFile instanceof
              File
          ) {
            form.append(
              `${prefix}[FileBukti]`,
              row.buktiFile,
              row.buktiFile.name
            );
          }
        }
      );

      return form;
    };

  /* =====================================================
     BULK SAVE
  ===================================================== */

  const bulkSaveRekap =
    async (
      rows,
      activeUtangUsahaId
    ) => {
      const form =
        buildBulkSaveFormData(
          rows,
          activeUtangUsahaId
        );

      const response =
        await fetchWithAuth(
          BULK_SAVE_ENDPOINT,
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
        throw new Error(
          getApiError(
            result,
            "Rekap Balasan Utang Usaha gagal disimpan."
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
            "Rekap Balasan Utang Usaha gagal disimpan."
          )
        );
      }

      return result;
    };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave =
    async () => {
      if (
        saving
      ) {
        return;
      }

      if (
        dataList.length ===
        0
      ) {
        showErrorAlert(
          "Data Kosong",
          "Belum ada data Rekap Balasan Utang Usaha."
        );

        return;
      }

      const activeUtangUsahaId =
        normalizeId(
          utangUsahaId
        );

      if (
        !activeUtangUsahaId
      ) {
        showErrorAlert(
          "Utang Usaha Tidak Ditemukan",
          "Data Utang Usaha untuk tugas ini tidak ditemukan."
        );

        return;
      }

      /* =============================================
         CUSTOMER
         
         Hanya memastikan setiap row sudah
         memilih customer.

         Tidak ada validasi duplicate customer.
      ============================================= */

      const invalidCustomer =
        dataList.some(
          (row) =>
            !normalizeId(
              row.konfirmasiId
            )
        );

      if (
        invalidCustomer
      ) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Masih ada baris yang belum memilih Nama Customer."
        );

        return;
      }

      /* =============================================
         TANGGAL KIRIM
      ============================================= */

      const invalidTanggalKirim =
        dataList.some(
          (row) =>
            !row.tanggalKirim
        );

      if (
        invalidTanggalKirim
      ) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Tanggal Kirim wajib diisi pada setiap baris."
        );

        return;
      }

      /* =============================================
         METODE KIRIM
      ============================================= */

      const invalidMetode =
        dataList.some(
          (row) =>
            !String(
              row.pengirimanVia ||
              ""
            ).trim()
        );

      if (
        invalidMetode
      ) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Pengiriman Via wajib diisi pada setiap baris."
        );

        return;
      }

      /* =============================================
         STATUS
      ============================================= */

      const invalidStatus =
        dataList.some(
          (row) =>
            !statusToBackend(
              row.statusKonfirmasi
            )
        );

      if (
        invalidStatus
      ) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Status Konfirmasi wajib dipilih pada setiap baris."
        );

        return;
      }

      try {
        setSaving(
          true
        );

        const result =
          await bulkSaveRekap(
            dataList,
            activeUtangUsahaId
          );

        await loadPageData(
          activeJwbKasusId
        );

        onSaved?.();

        showSuccessAlert(
          "Berhasil Disimpan",
          result?.message ||
            "Rekap Balasan Utang Usaha berhasil disimpan."
        );
      } catch (
        error
      ) {
        console.error(
          "SAVE REKAP UTANG USAHA ERROR:",
          error
        );

        showErrorAlert(
          "Gagal Menyimpan",
          error?.message ||
            "Data gagal disimpan."
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* =====================================================
     DELETE MODAL
  ===================================================== */

  const openDeleteModal =
    (
      row
    ) => {
      setDeletingData(
        row
      );

      setDeleteModalOpen(
        true
      );
    };

  /* =====================================================
     DELETE
  ===================================================== */

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

        /* =============================================
           DELETE ROW BARU YANG BELUM TERSIMPAN
        ============================================= */

        if (
          !deletingData.rekapId
        ) {
          setDataList(
            (
              previous
            ) =>
              previous.filter(
                (row) =>
                  String(
                    row.id
                  ) !==
                  String(
                    deletingData.id
                  )
              )
          );

          setDeleteModalOpen(
            false
          );

          setDeletingData(
            null
          );

          return;
        }

        /* =============================================
           DELETE ROW DARI DATABASE
        ============================================= */

        const response =
          await fetchWithAuth(
            `${API_ENDPOINT}/${encodeURIComponent(
              deletingData.rekapId
            )}`,
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
          throw new Error(
            getApiError(
              result,
              "Data gagal dihapus."
            )
          );
        }

        await loadPageData(
          activeJwbKasusId
        );

        setDeleteModalOpen(
          false
        );

        setDeletingData(
          null
        );

        showSuccessAlert(
          "Berhasil Dihapus",
          result?.message ||
            "Data Rekap Balasan Utang Usaha berhasil dihapus."
        );
      } catch (
        error
      ) {
        console.error(
          "DELETE REKAP UTANG USAHA ERROR:",
          error
        );

        showErrorAlert(
          "Gagal Menghapus",
          error?.message ||
            "Data gagal dihapus."
        );
      } finally {
        setDeleting(
          false
        );
      }
    };

  /* =====================================================
     EXPORT CSV / EXCEL
  ===================================================== */

  const handleExportExcel =
    () => {
      if (
        dataList.length ===
        0
      ) {
        showErrorAlert(
          "Data Kosong",
          "Tidak ada data untuk diexport."
        );

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

      const rows =
        dataList.map(
          (
            row,
            index
          ) => [
            index + 1,

            row.nama,

            row.saldoBukuBesar,

            row.tanggalKirim,

            row.pengirimanVia,

            row.tanggalJawaban,

            row.saldoJawaban,

            getSelisih(
              row.saldoBukuBesar,
              row.saldoJawaban
            ),

            row.statusKonfirmasi,
          ]
        );

      const csv =
        [
          headers,
          ...rows,
        ]
          .map(
            (
              row
            ) =>
              row
                .map(
                  (
                    item
                  ) =>
                    `"${String(
                      item ?? ""
                    ).replace(
                      /"/g,
                      '""'
                    )}"`
                )
                .join(",")
          )
          .join("\n");

      const blob =
        new Blob(
          [
            "\ufeff" +
              csv,
          ],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        url;

      link.download =
        "rekap-balasan-utang-usaha.csv";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );

      setExportOpen(
        false
      );
    };

  /* =====================================================
     EXPORT PDF
  ===================================================== */

  const handleExportPdf =
    () => {
      if (
        dataList.length ===
        0
      ) {
        showErrorAlert(
          "Data Kosong",
          "Tidak ada data untuk diexport."
        );

        return;
      }

      const popup =
        window.open(
          "",
          "_blank"
        );

      if (!popup) {
        showErrorAlert(
          "Popup Diblokir",
          "Izinkan popup browser untuk melakukan export PDF."
        );

        return;
      }

      const body =
        dataList
          .map(
            (
              row,
              index
            ) => `
              <tr>
                <td>${index + 1}</td>

                <td>
                  ${escapeHtml(
                    row.nama
                  )}
                </td>

                <td>
                  Rp ${formatNumber(
                    row.saldoBukuBesar
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    row.tanggalKirim ||
                    "-"
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    row.pengirimanVia ||
                    "-"
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    row.tanggalJawaban ||
                    "-"
                  )}
                </td>

                <td>
                  Rp ${formatNumber(
                    row.saldoJawaban
                  )}
                </td>

                <td>
                  Rp ${formatNumber(
                    getSelisih(
                      row.saldoBukuBesar,
                      row.saldoJawaban
                    )
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    row.statusKonfirmasi ||
                    "-"
                  )}
                </td>
              </tr>
            `
          )
          .join("");

      popup.document.write(`
        <!DOCTYPE html>

        <html>
          <head>
            <meta charset="UTF-8" />

            <title>
              Rekap Balasan Utang Usaha
            </title>

            <style>
              body {
                font-family:
                  Arial,
                  sans-serif;

                padding:
                  20px;
              }

              h2 {
                margin-bottom:
                  20px;
              }

              table {
                width:
                  100%;

                border-collapse:
                  collapse;

                font-size:
                  11px;
              }

              th,
              td {
                border:
                  1px solid #ddd;

                padding:
                  7px;

                text-align:
                  left;
              }

              th {
                background:
                  #f8fafc;
              }

              @page {
                size:
                  landscape;
              }
            </style>
          </head>

          <body>
            <h2>
              Rekap Balasan Utang Usaha
            </h2>

            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Saldo Buku Besar</th>
                  <th>Tanggal Kirim</th>
                  <th>Pengiriman Via</th>
                  <th>Tanggal Jawaban</th>
                  <th>Saldo Jawaban</th>
                  <th>Selisih</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                ${body}
              </tbody>
            </table>

            <script>
              window.onload =
                function () {
                  window.print();
                };
            </script>
          </body>
        </html>
      `);

      popup.document.close();

      setExportOpen(
        false
      );
    };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div
      className="
        font-poppins
        text-[#334155]
      "
    >
      {/* =================================================
         SUCCESS ALERT
      ================================================= */}

      <AlertSuccess
        title={
          successAlert.title
        }
        message={
          successAlert.message
        }
        onClose={() =>
          setSuccessAlert({
            title: "",
            message: "",
          })
        }
      />

      {/* =================================================
         ERROR ALERT
      ================================================= */}

      <AlertError
        title={
          errorAlert.title
        }
        message={
          errorAlert.message
        }
        onClose={() =>
          setErrorAlert({
            title: "",
            message: "",
          })
        }
      />

      {/* =================================================
         DELETE CONFIRMATION
      ================================================= */}

      <ConfirmationPopup
        isOpen={
          deleteModalOpen
        }
        message="Apakah Anda yakin ingin menghapus data Rekap Balasan Utang Usaha?"
        subText={
          deletingData?.nama ||
          ""
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

      {/* =================================================
         MAIN CARD
      ================================================= */}

      <div
        className="
          rounded-xl
          border
          border-[#DCE5EF]
          bg-white
          p-4
        "
      >
        {/* =================================================
           TOP
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          {/* FILTER */}

          <div
            className="
              w-full
              sm:w-[220px]
            "
          >
            <Dropdown
              value={
                filterStatus
              }
              onChange={(
                value
              ) =>
                setFilterStatus(
                  value
                )
              }
              placeholder="Semua Konfirmasi"
              showCheck={false}
              options={[
                {
                  value:
                    "Semua Konfirmasi",

                  label:
                    "Semua Konfirmasi",
                },

                {
                  value:
                    "Terbalas",

                  label:
                    "Terbalas",
                },

                {
                  value:
                    "Tidak Terbalas",

                  label:
                    "Tidak Terbalas",
                },
              ]}
              className="
                [&>button]:h-12
                [&>button]:min-h-12
                [&>button]:rounded-xl
                [&>button]:border-[#DCE5EF]
                [&>button]:bg-white
                [&>button]:px-4
                [&>button]:font-poppins
                [&>button]:text-sm
                [&>button_span]:text-[#475569]
              "
            />
          </div>

          {/* EXPORT */}

          <div
            ref={
              exportRef
            }
            className="
              relative
            "
          >
            <button
              type="button"
              onClick={() =>
                setExportOpen(
                  (
                    previous
                  ) =>
                    !previous
                )
              }
              className="
                flex
                h-12
                items-center
                gap-2
                rounded-xl
                border
                border-[#DCE5EF]
                bg-white
                px-4
                font-poppins
                text-sm
                text-[#475569]
                transition
                hover:bg-[#F8FAFC]
              "
            >
              <Download
                size={16}
              />

              Export

              <ChevronDown
                size={14}
              />
            </button>

            {exportOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[54px]
                  z-30
                  w-[170px]
                  overflow-hidden
                  rounded-xl
                  border
                  border-[#DCE5EF]
                  bg-white
                  shadow-lg
                "
              >
                <button
                  type="button"
                  onClick={
                    handleExportExcel
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    font-poppins
                    text-sm
                    text-[#475569]
                    hover:bg-[#F8FAFC]
                  "
                >
                  <FileSpreadsheet
                    size={16}
                    className="text-green-600"
                  />

                  Excel
                </button>

                <button
                  type="button"
                  onClick={
                    handleExportPdf
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-3
                    font-poppins
                    text-sm
                    text-[#475569]
                    hover:bg-[#F8FAFC]
                  "
                >
                  <FileText
                    size={16}
                    className="text-red-500"
                  />

                  PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
           TABLE
        ================================================= */}

        <div
          className="
            mt-4
            overflow-x-auto
            rounded-xl
            border
            border-[#DCE5EF]
          "
        >
          <table
            className="
              w-full
              min-w-[1750px]
              border-collapse
            "
          >
            <thead
              className="
                bg-[#F8FAFC]
              "
            >
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
                ].map(
                  (
                    header
                  ) => (
                    <th
                      key={
                        header
                      }
                      className="
                        border-b
                        border-[#DCE5EF]
                        px-3
                        py-3
                        text-left
                        font-poppins
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-[#64748B]
                      "
                    >
                      {
                        header
                      }
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filteredData.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={
                      11
                    }
                    className="
                      h-[160px]
                      text-center
                      font-poppins
                      text-sm
                      text-[#94A3B8]
                    "
                  >
                    Tidak ada data yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredData.map(
                  (
                    row,
                    index
                  ) => {
                    const selisih =
                      getSelisih(
                        row.saldoBukuBesar,
                        row.saldoJawaban
                      );

                    const customerOptionsForRow =
                      getCustomerOptionsForRow(
                        row
                      );

                    return (
                      <tr
                        key={
                          row.id
                        }
                        className="
                          border-b
                          border-[#EDF2F7]
                        "
                      >
                        {/* NO */}

                        <td
                          className="
                            px-3
                            py-2
                            font-poppins
                            text-sm
                            text-[#475569]
                          "
                        >
                          {
                            index +
                            1
                          }
                        </td>

                        {/* NAMA CUSTOMER */}

                        <td
                          className="
                            min-w-[230px]
                            px-3
                            py-2
                          "
                        >
                          <Dropdown
                            value={
                              row.konfirmasiId ||
                              ""
                            }
                            placeholder="Pilih Customer"
                            showCheck={false}
                            options={[
                              {
                                value:
                                  "",

                                label:
                                  "Pilih Customer",
                              },

                              /*
                               * PENTING:
                               *
                               * Tidak ada lagi:
                               *
                               * .filter(
                               *   customer =>
                               *   !isCustomerUsedByOtherRow(...)
                               * )
                               *
                               * Semua customer ditampilkan.
                               */
                              ...customerOptionsForRow.map(
                                (
                                  customer
                                ) => ({
                                  value:
                                    customer.id,

                                  label:
                                    customer.namaCustomer,
                                })
                              ),
                            ]}
                            onChange={(
                              value
                            ) =>
                              handleCustomerChange(
                                row.id,
                                value
                              )
                            }
                            className="
                              [&>button]:h-10
                              [&>button]:min-h-10
                              [&>button]:rounded-xl
                              [&>button]:px-3
                            "
                          />
                        </td>

                        {/* =================================================
                           SALDO BUKU BESAR
                        ================================================== */}

                        <td
                          className="
                            px-3
                            py-2
                          "
                        >
                          <div
                            className="
                              inline-flex
                              min-w-[190px]
                              w-max
                              max-w-none
                              h-10
                              items-center
                              whitespace-nowrap
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-[#F8FAFC]
                              px-3
                            "
                          >
                            <span
                              className="
                                shrink-0
                                font-poppins
                                text-sm
                                text-[#64748B]
                              "
                            >
                              Rp
                            </span>

                            <span
                              className="
                                shrink-0
                                pl-3
                                font-poppins
                                text-sm
                                text-[#475569]
                              "
                            >
                              {formatNumber(
                                row.saldoBukuBesar
                              )}
                            </span>
                          </div>
                        </td>

                        {/* TANGGAL KIRIM */}

                        <td
                          className="
                            min-w-[160px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="date"
                            value={
                              row.tanggalKirim ||
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              updateRow(
                                row.id,
                                "tanggalKirim",
                                event.target.value
                              )
                            }
                            className="
                              h-10
                              w-full
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-white
                              px-3
                              font-poppins
                              text-sm
                              text-[#475569]
                              outline-none
                              transition
                              focus:border-[#38BDF8]
                            "
                          />
                        </td>

                        {/* PENGIRIMAN VIA */}

                        <td
                          className="
                            min-w-[180px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            value={
                              row.pengirimanVia ||
                              ""
                            }
                            placeholder="Konfirmasi Dikirim"
                            onChange={(
                              event
                            ) =>
                              updateRow(
                                row.id,
                                "pengirimanVia",
                                event.target.value
                              )
                            }
                            className="
                              h-10
                              w-full
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-white
                              px-3
                              font-poppins
                              text-sm
                              text-[#475569]
                              outline-none
                              transition
                              focus:border-[#38BDF8]
                            "
                          />
                        </td>

                        {/* TANGGAL JAWABAN */}

                        <td
                          className="
                            min-w-[160px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="date"
                            value={
                              row.tanggalJawaban ||
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              updateRow(
                                row.id,
                                "tanggalJawaban",
                                event.target.value
                              )
                            }
                            className="
                              h-10
                              w-full
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-white
                              px-3
                              font-poppins
                              text-sm
                              text-[#475569]
                              outline-none
                              transition
                              focus:border-[#38BDF8]
                            "
                          />
                        </td>

                        {/* =================================================
                           SALDO JAWABAN
                        ================================================== */}

                        <td
                          className="
                            px-3
                            py-2
                          "
                        >
                          <div
                            className="
                              inline-flex
                              min-w-[190px]
                              w-max
                              max-w-none
                              h-10
                              items-center
                              whitespace-nowrap
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-white
                              px-3
                              transition
                              focus-within:border-[#38BDF8]
                            "
                          >
                            <span
                              className="
                                shrink-0
                                font-poppins
                                text-sm
                                text-[#64748B]
                              "
                            >
                              Rp
                            </span>

                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatNumber(
                                row.saldoJawaban
                              )}
                              onChange={(
                                event
                              ) =>
                                updateRow(
                                  row.id,
                                  "saldoJawaban",
                                  parseNumber(
                                    event
                                      .target
                                      .value
                                  )
                                )
                              }
                              className="
                                [field-sizing:content]
                                min-w-[80px]
                                max-w-none
                                shrink-0
                                bg-transparent
                                pl-3
                                text-left
                                font-poppins
                                text-sm
                                text-[#475569]
                                outline-none
                              "
                            />
                          </div>
                        </td>

                        {/* =================================================
                           SELISIH
                        ================================================== */}

                        <td
                          className="
                            px-3
                            py-2
                          "
                        >
                          <div
                            className="
                              inline-flex
                              min-w-[190px]
                              w-max
                              max-w-none
                              h-10
                              items-center
                              whitespace-nowrap
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-[#F8FAFC]
                              px-3
                            "
                          >
                            <span
                              className="
                                shrink-0
                                font-poppins
                                text-sm
                                text-[#64748B]
                              "
                            >
                              Rp
                            </span>

                            <span
                              className="
                                shrink-0
                                pl-3
                                font-poppins
                                text-sm
                                text-[#64748B]
                              "
                            >
                              {formatNumber(
                                selisih
                              )}
                            </span>
                          </div>
                        </td>

                        {/* BUKTI */}

                        <td
                          className="
                            min-w-[100px]
                            px-3
                            py-2
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-1
                            "
                          >
                            <button
                              type="button"
                              onClick={() =>
                                fileInputRefs.current[
                                  row.id
                                ]?.click()
                              }
                              className="
                                font-poppins
                                text-sm
                                font-medium
                                text-[#38BDF8]
                                transition
                                hover:underline
                              "
                            >
                              File
                            </button>

                            {(
                              row.buktiFile ||
                              row.namaBukti
                            ) && (
                              <button
                                type="button"
                                title="Lihat Bukti"
                                onClick={() =>
                                  handleViewBukti(
                                    row
                                  )
                                }
                                className="
                                  flex
                                  h-7
                                  w-7
                                  items-center
                                  justify-center
                                  rounded-md
                                  text-[#38BDF8]
                                  transition
                                  hover:bg-[#F0F9FF]
                                "
                              >
                                <Eye
                                  size={14}
                                />
                              </button>
                            )}

                            <input
                              ref={(
                                element
                              ) => {
                                fileInputRefs.current[
                                  row.id
                                ] =
                                  element;
                              }}
                              type="file"
                              className="hidden"
                              onChange={(
                                event
                              ) =>
                                handleFileSelected(
                                  row.id,
                                  event
                                )
                              }
                            />
                          </div>
                        </td>

                        {/* STATUS */}

                        <td
                          className="
                            min-w-[190px]
                            px-3
                            py-2
                          "
                        >
                          <Dropdown
                            value={
                              row.statusKonfirmasi ||
                              ""
                            }
                            placeholder="Pilih Status"
                            showCheck={false}
                            options={[
                              {
                                value:
                                  "",

                                label:
                                  "Pilih Status",
                              },

                              {
                                value:
                                  "Terbalas",

                                label:
                                  "Terbalas",
                              },

                              {
                                value:
                                  "Tidak Terbalas",

                                label:
                                  "Tidak Terbalas",
                              },
                            ]}
                            onChange={(
                              value
                            ) =>
                              updateRow(
                                row.id,
                                "statusKonfirmasi",
                                value
                              )
                            }
                            className={`
                              [&>button]:h-10
                              [&>button]:min-h-10
                              [&>button]:rounded-xl
                              [&>button]:px-3

                              ${
                                !row.statusKonfirmasi
                                  ? `
                                    [&>button]:border-[#DCE5EF]
                                    [&>button]:bg-white
                                    [&>button_span]:text-[#64748B]
                                  `
                                  : row.statusKonfirmasi ===
                                    "Terbalas"
                                  ? `
                                    [&>button]:border-[#86EFAC]
                                    [&>button]:bg-[#F0FDF4]
                                    [&>button_span]:text-[#16A34A]
                                  `
                                  : `
                                    [&>button]:border-[#FCA5A5]
                                    [&>button]:bg-[#FEF2F2]
                                    [&>button_span]:text-[#EF4444]
                                  `
                              }
                            `}
                          />
                        </td>

                        {/* DELETE */}

                        <td
                          className="
                            px-3
                            py-2
                          "
                        >
                          <div
                            className="
                              flex
                              justify-center
                            "
                          >
                            <button
                              type="button"
                              title="Hapus"
                              onClick={() =>
                                openDeleteModal(
                                  row
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
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>

            {/* =================================================
               TOTAL
            ================================================== */}

            {dataList.length >
              0 && (
              <tfoot>
                <tr
                  className="
                    border-t
                    border-[#DCE5EF]
                    bg-[#F8FAFC]
                  "
                >
                  <td />

                  <td
                    className="
                      px-3
                      py-4
                      font-poppins
                      text-sm
                      font-bold
                      text-[#1E293B]
                    "
                  >
                    Total
                  </td>

                  <td
                    className="
                      px-3
                      py-4
                      text-left
                      font-poppins
                      text-sm
                      font-bold
                      text-[#1E293B]
                    "
                  >
                    {formatNumber(
                      totalSaldoBukuBesar
                    )}
                  </td>

                  <td />

                  <td />

                  <td />

                  <td
                    className="
                      px-3
                      py-4
                      text-left
                      font-poppins
                      text-sm
                      font-bold
                      text-[#1E293B]
                    "
                  >
                    {formatNumber(
                      totalSaldoJawaban
                    )}
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

        {/* =================================================
           TAMBAH DATA
        ================================================== */}

        <div
          className="
            mt-4
            flex
            justify-center
          "
        >
          <AddDataButton
            onClick={
              handleAddData
            }
            disabled={
              saving
            }
            label="Tambah Data"
          />
        </div>

        {/* =================================================
           BOTTOM
        ================================================== */}

        <div
          className="
            mt-5
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          {/* SUMMARY */}

          <div
            className="
              w-full
              max-w-[470px]
              rounded-xl
              border
              border-[#DCE5EF]
              bg-white
              p-4
            "
          >
            <div
              className="
                grid
                grid-cols-[1fr_auto_auto]
                gap-x-4
                gap-y-3
                font-poppins
                text-sm
                font-semibold
                text-[#475569]
              "
            >
              <span>
                Konfirmasi Dijawab Sesuai
              </span>

              <span>
                :
              </span>

              <span>
                {
                  percentage.sesuai
                } %
              </span>

              <span>
                Konfirmasi Dijawab Berbeda
              </span>

              <span>
                :
              </span>

              <span>
                {
                  percentage.berbeda
                } %
              </span>

              <span>
                Konfirmasi Tidak Terbalas
              </span>

              <span>
                :
              </span>

              <span>
                {
                  percentage.tidak
                } %
              </span>
            </div>
          </div>

          {/* SIMPAN */}

          <SaveButton
            onClick={
              handleSave
            }
            disabled={
              saving
            }
            isSaving={
              saving
            }
            label="Simpan"
            savingLabel="Menyimpan..."
          />
        </div>
      </div>
    </div>
  );
}