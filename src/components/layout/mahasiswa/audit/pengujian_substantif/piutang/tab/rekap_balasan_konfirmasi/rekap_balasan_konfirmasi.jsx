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
  Plus,
  Trash2,
} from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import Dropdown from "@/components/ui/dropdown/dropdown";

/* =====================================================
   API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const API_ENDPOINT =
  `${API_URL}/api/rekap-balasan`;

/* =====================================================
   MEMORY CACHE
===================================================== */

const rekapBalasanPageCache =
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
  fallbackPiutangId = null
) => ({
  id:
    normalizeId(
      item?.KonfirmasiPiutangID ??
      item?.id
    ),

  piutangId:
    normalizeId(
      item?.PiutangID ??
      fallbackPiutangId
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
});

/* =====================================================
   REKAP NORMALIZER
===================================================== */

const normalizeRekap = (
  item,
  fallbackPiutangId = null
) => {
  const konfirmasi =
    item?.konfirmasi_piutang ??
    item?.konfirmasiPiutang ??
    null;

  return {
    id:
      item?.RekapBalasanID ??
      null,

    rekapId:
      item?.RekapBalasanID ??
      null,

    isNew: false,

    piutangId:
      normalizeId(
        item?.PiutangID ??
        fallbackPiutangId
      ),

    konfirmasiId:
      normalizeId(
        item?.KonfirmasiPiutangID
      ) ?? "",

    nama:
      konfirmasi?.NamaCustomer ??
      "",

    saldoBukuBesar:
      toNumber(
        konfirmasi?.Jumlah ??
        item?.SaldoBB
      ),

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

    saldoJawaban:
      toNumber(
        item?.SaldoJawab
      ),

    selisih:
      toNumber(
        item?.Selisih ??
        getSelisih(
          item?.SaldoBB,
          item?.SaldoJawab
        )
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

export default function RekapBalasanKonfirmasiPage({
  jwbKasusId: jwbKasusIdProp,
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
      ? rekapBalasanPageCache.get(
          cacheKey
        ) || null
      : null;

  /* =====================================================
     STATE
  ===================================================== */

  const [
    piutangId,
    setPiutangId,
  ] = useState(
    () =>
      initialCache?.piutangId ||
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
     LOAD PAGE

     CONTROLLER TERBARU:

     GET /api/rekap-balasan
     =>
     Piutang[]
       -> PiutangID
       -> JwbKasusID
       -> konfirmasi_piutang[]
       -> konfirmasi_piutang_tersedia[]
       -> rekap_balasan[]
  ===================================================== */

  const loadPageData =
    async (
      activeId
    ) => {
      if (!activeId) {
        setPiutangId(null);
        setCustomerOptions([]);
        setDataList([]);

        return;
      }

      /*
       * HANYA SATU GET UNTUK LOAD PAGE.
       */
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
            "Gagal mengambil data Rekap Balasan."
          )
        );
      }

      /*
       * Controller:
       *
       * return response()->json(
       *     $query->get()
       * );
       *
       * Berarti array terluar adalah PIUTANG.
       */
      const piutangRows =
        Array.isArray(result)
          ? result
          : Array.isArray(
              result?.data
            )
          ? result.data
          : [];

      /*
       * Cari Piutang yang JwbKasusID-nya
       * sama dengan tugas yang sedang dibuka.
       */
      const activePiutang =
        piutangRows.find(
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

      /*
       * Tidak ditemukan Piutang.
       *
       * Tidak mencoba cari dari Rekap,
       * karena PiutangID memang sumbernya
       * dari tabel Piutang.
       */
      if (!activePiutang) {
        const emptyData = {
          piutangId: null,
          customerOptions: [],
          dataList: [],
        };

        rekapBalasanPageCache.set(
          String(activeId),
          emptyData
        );

        setPiutangId(null);
        setCustomerOptions([]);
        setDataList([]);

        return emptyData;
      }

      /*
       * PIUTANG ID LANGSUNG DARI TABEL PIUTANG.
       */
      const activePiutangId =
        normalizeId(
          activePiutang?.PiutangID ??
          activePiutang?.id
        );

      /*
       * ===========================================
       * MASTER CUSTOMER KONFIRMASI PIUTANG
       *
       * Dropdown memakai SEMUA customer dari:
       * konfirmasi_piutang[]
       *
       * Bukan hanya konfirmasi_piutang_tersedia[],
       * karena customer yang pernah dipakai lalu
       * dilepas/diganti harus dapat muncul kembali
       * sebagai pilihan.
       *
       * Customer yang sedang dipakai oleh row lain
       * tetap disembunyikan melalui
       * getCustomerOptionsForRow().
       * ===========================================
       */

      const rawAllCustomers =
        Array.isArray(
          activePiutang
            ?.konfirmasi_piutang
        )
          ? activePiutang
              .konfirmasi_piutang
          : Array.isArray(
              activePiutang
                ?.konfirmasiPiutang
            )
          ? activePiutang
              .konfirmasiPiutang
          : [];

      const allCustomers =
        rawAllCustomers
          .map(
            (item) =>
              normalizeKonfirmasi(
                item,
                activePiutangId
              )
          )
          .filter(
            (item) =>
              item.id &&
              item.namaCustomer
          );

      /*
       * ===========================================
       * REKAP EXISTING
       *
       * Controller:
       *
       * 'rekapBalasan.konfirmasiPiutang'
       * ===========================================
       */

      const rawRekap =
        Array.isArray(
          activePiutang
            ?.rekap_balasan
        )
          ? activePiutang
              .rekap_balasan
          : Array.isArray(
              activePiutang
                ?.rekapBalasan
            )
          ? activePiutang
              .rekapBalasan
          : [];

      const normalizedRekap =
        rawRekap.map(
          (item) => {
            const row =
              normalizeRekap(
                item,
                activePiutangId
              );

            /*
             * Customer pada row existing tetap
             * diambil dari nested relation
             * rekap_balasan.konfirmasi_piutang.
             *
             * Jadi walaupun customer tersebut
             * tidak lagi ada di daftar
             * konfirmasi_piutang_tersedia,
             * nama dan saldo row existing
             * tetap tampil.
             */
            return {
              ...row,

              piutangId:
                activePiutangId,
            };
          }
        );

      const nextData = {
        piutangId:
          activePiutangId,

        /*
         * Master semua customer Konfirmasi Piutang.
         * Filtering dilakukan per row agar customer
         * yang dilepas dapat langsung tersedia lagi.
         */
        customerOptions:
          allCustomers,

        dataList:
          normalizedRekap,
      };

      rekapBalasanPageCache.set(
        String(activeId),
        nextData
      );

      setPiutangId(
        activePiutangId
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

     Tidak ada loading screen.
     Cache langsung ditampilkan jika tersedia,
     lalu API refresh di background.
  ===================================================== */

  useEffect(() => {
    let cancelled =
      false;

    const load = async () => {
      if (
        !activeJwbKasusId
      ) {
        setPiutangId(null);
        setCustomerOptions([]);
        setDataList([]);

        return;
      }

      const cached =
        rekapBalasanPageCache.get(
          String(
            activeJwbKasusId
          )
        );

      if (cached) {
        setPiutangId(
          cached.piutangId ||
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
          "LOAD REKAP ERROR:",
          error
        );

        if (
          cancelled
        ) {
          return;
        }

        if (!cached) {
          setPiutangId(null);
          setCustomerOptions([]);
          setDataList([]);
        }

        showErrorAlert(
          "Gagal Memuat Data",
          error?.message ||
            "Data Rekap Balasan gagal dimuat."
        );
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [
    activeJwbKasusId,
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

    rekapBalasanPageCache.set(
      String(
        activeJwbKasusId
      ),
      {
        piutangId,
        customerOptions,
        dataList,
      }
    );
  }, [
    activeJwbKasusId,
    piutangId,
    customerOptions,
    dataList,
  ]);

  /* =====================================================
     EXPORT OUTSIDE
  ===================================================== */

  useEffect(() => {
    const handleMouseDown = (event) => {
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
          (total, row) =>
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
          (total, row) =>
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

     customerOptions adalah MASTER SEMUA customer
     dari konfirmasi_piutang[].

     Behavior:
     - customer yang sedang dipakai ROW LAIN
       tidak muncul sebagai pilihan
     - customer milik row saat ini tetap tampil
     - jika row dikembalikan ke "Pilih Customer",
       customer yang tadi dilepas otomatis kembali
       tersedia
     - jika customer diganti lalu Save, customer
       lama tetap tersedia pada dropdown karena
       sudah tidak dipakai lagi

     Fallback existing customer tetap dipertahankan
     untuk keamanan jika response backend tidak
     lengkap pada kondisi tertentu.
  ===================================================== */

  const getCustomerOptionsForRow =
    (currentRow) => {
      const usedByOtherRows =
        new Set(
          dataList
            .filter(
              (row) =>
                String(row.id) !==
                String(
                  currentRow.id
                )
            )
            .map(
              (row) =>
                normalizeId(
                  row.konfirmasiId
                )
            )
            .filter(Boolean)
            .map(String)
        );

      const options =
        customerOptions.filter(
          (customer) =>
            !usedByOtherRows.has(
              String(
                customer.id
              )
            )
        );

      /*
       * Jika row existing sudah mempunyai
       * customer, masukkan customer tersebut
       * kembali ke dropdown milik row itu.
       */
      if (
        currentRow.konfirmasiId &&
        currentRow.nama
      ) {
        const alreadyExists =
          options.some(
            (customer) =>
              String(
                customer.id
              ) ===
              String(
                currentRow.konfirmasiId
              )
          );

        if (!alreadyExists) {
          options.unshift({
            id:
              currentRow.konfirmasiId,

            piutangId:
              currentRow.piutangId,

            namaCustomer:
              currentRow.nama,

            jumlah:
              toNumber(
                currentRow
                  .saldoBukuBesar
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
                    }
                  : row
            )
        );

        return;
      }

      const selectedCustomer =
        getCustomerOptionsForRow(
          currentRow
        ).find(
          (customer) =>
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
          "Data customer tidak tersedia atau sudah digunakan."
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

                    /*
                     * FK RekapBalasan
                     */
                    konfirmasiId:
                      selectedCustomer.id,

                    /*
                     * Tampilan nama.
                     */
                    nama:
                      selectedCustomer
                        .namaCustomer,

                    /*
                     * Jumlah dari
                     * KonfirmasiPiutang.
                     */
                    saldoBukuBesar:
                      toNumber(
                        selectedCustomer
                          .jumlah
                      ),

                    /*
                     * Piutang yang sama.
                     */
                    piutangId:
                      piutangId,
                  }
                : row
          )
      );
    };

  /* =====================================================
     ADD DATA

     Tidak ada lagi piutangIdSource.
     PiutangID sudah didapat langsung dari
     array Piutang yang dikirim controller.
  ===================================================== */

  const handleAddData =
    () => {
      const activePiutangId =
        normalizeId(
          piutangId
        );

      if (
        !activePiutangId
      ) {
        showErrorAlert(
          "Piutang Belum Tersedia",
          "Data Piutang untuk tugas ini tidak ditemukan."
        );

        return;
      }

      const usedCustomerIds =
        new Set(
          dataList
            .map(
              (row) =>
                normalizeId(
                  row.konfirmasiId
                )
            )
            .filter(Boolean)
            .map(String)
        );

      const availableCustomerCount =
        customerOptions.filter(
          (customer) =>
            !usedCustomerIds.has(
              String(
                customer.id
              )
            )
        ).length;

      if (
        availableCustomerCount ===
        0
      ) {
        showErrorAlert(
          "Customer Belum Tersedia",
          "Tidak ada customer Konfirmasi Piutang yang masih tersedia untuk Rekap Balasan."
        );

        return;
      }

      const newData = {
        id:
          `temp-${Date.now()}`,

        rekapId: null,

        isNew: true,

        /*
         * LANGSUNG PiutangID
         * dari tabel Piutang.
         */
        piutangId:
          activePiutangId,

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
      /*
       * File baru yang belum tersimpan.
       */
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

      /*
       * File dari database.
       */
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
            result = null;
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
     BUILD FORM DATA
  ===================================================== */

  const buildRekapFormData =
    (
      row,
      isCreate
    ) => {
      const form =
        new FormData();

      if (isCreate) {
        const activePiutangId =
          normalizeId(
            row.piutangId
          ) ||
          normalizeId(
            piutangId
          );

        if (
          !activePiutangId
        ) {
          throw new Error(
            "PiutangID tidak tersedia."
          );
        }

        /*
         * Controller:
         *
         * 'PiutangID' =>
         * ['required',
         *  'exists:Piutang,PiutangID']
         */
        form.append(
          "PiutangID",
          String(
            activePiutangId
          )
        );
      } else {
        /*
         * Multipart update Laravel.
         */
        form.append(
          "_method",
          "PUT"
        );
      }

      if (
        row.konfirmasiId
      ) {
        form.append(
          "KonfirmasiPiutangID",
          String(
            row.konfirmasiId
          )
        );
      }

      form.append(
        "SaldoBB",
        String(
          toNumber(
            row.saldoBukuBesar
          )
        )
      );

      if (
        row.tanggalKirim
      ) {
        form.append(
          "TanggalKirim",
          row.tanggalKirim
        );
      }

      if (
        String(
          row.pengirimanVia ||
          ""
        ).trim()
      ) {
        form.append(
          "MetodeKirim",
          String(
            row.pengirimanVia
          ).trim()
        );
      }

      if (
        row.tanggalJawaban
      ) {
        form.append(
          "TanggalJawab",
          row.tanggalJawaban
        );
      }

      form.append(
        "SaldoJawab",
        String(
          toNumber(
            row.saldoJawaban
          )
        )
      );

      const selisih =
        getSelisih(
          row.saldoBukuBesar,
          row.saldoJawaban
        );

      form.append(
        "Selisih",
        String(selisih)
      );

      const backendStatus =
        statusToBackend(
          row.statusKonfirmasi
        );

      if (
        backendStatus
      ) {
        form.append(
          "Status",
          backendStatus
        );
      }

      if (
        typeof File !==
          "undefined" &&
        row.buktiFile instanceof
          File
      ) {
        form.append(
          "FileBukti",
          row.buktiFile,
          row.buktiFile.name
        );
      }

      return form;
    };

  /* =====================================================
     CREATE
  ===================================================== */

  const createRekap =
    async (
      row
    ) => {
      const form =
        buildRekapFormData(
          row,
          true
        );

      const response =
        await fetchWithAuth(
          API_ENDPOINT,
          {
            method: "POST",
            body: form,
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          getApiError(
            result,
            `Gagal menyimpan rekap untuk ${
              row.nama ||
              "customer"
            }.`
          )
        );
      }

      return result;
    };

  /* =====================================================
     UPDATE
  ===================================================== */

  const updateRekap =
    async (
      row
    ) => {
      if (
        !row.rekapId
      ) {
        throw new Error(
          "RekapBalasanID tidak tersedia."
        );
      }

      const form =
        buildRekapFormData(
          row,
          false
        );

      const response =
        await fetchWithAuth(
          `${API_ENDPOINT}/${encodeURIComponent(
            row.rekapId
          )}`,
          {
            method: "POST",
            body: form,
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          getApiError(
            result,
            `Gagal memperbarui rekap untuk ${
              row.nama ||
              "customer"
            }.`
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
      if (saving) {
        return;
      }

      if (
        dataList.length ===
        0
      ) {
        showErrorAlert(
          "Data Kosong",
          "Belum ada data Rekap Balasan Konfirmasi."
        );

        return;
      }

      /*
       * PiutangID dari TABLE PIUTANG.
       */
      const activePiutangId =
        normalizeId(
          piutangId
        );

      if (
        !activePiutangId
      ) {
        showErrorAlert(
          "Piutang Tidak Ditemukan",
          "Data Piutang untuk tugas ini tidak ditemukan."
        );

        return;
      }

      const invalidCustomer =
        dataList.some(
          (row) =>
            !row.konfirmasiId
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

      const invalidStatus =
        dataList.some(
          (row) =>
            !row.statusKonfirmasi
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
        setSaving(true);

        for (
          const row of
          dataList
        ) {
          if (
            row.rekapId
          ) {
            await updateRekap(
              row
            );
          } else {
            await createRekap({
              ...row,

              /*
               * Pastikan POST selalu
               * membawa PiutangID.
               */
              piutangId:
                activePiutangId,
            });
          }
        }

        /*
         * Refresh dari controller yang sama.
         */
        await loadPageData(
          activeJwbKasusId
        );

        showSuccessAlert(
          "Berhasil Disimpan",
          "Rekap Balasan Konfirmasi berhasil disimpan."
        );
      } catch (error) {
        console.error(
          "SAVE REKAP ERROR:",
          error
        );

        showErrorAlert(
          "Gagal Menyimpan",
          error?.message ||
            "Data gagal disimpan."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =====================================================
     DELETE
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

  const handleConfirmDelete =
    async () => {
      if (
        !deletingData ||
        deleting
      ) {
        return;
      }

      try {
        setDeleting(true);

        /*
         * Belum disimpan ke database.
         */
        if (
          !deletingData.rekapId
        ) {
          setDataList(
            (previous) =>
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

        if (!response.ok) {
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
          "Data Rekap berhasil dihapus."
        );
      } catch (error) {
        console.error(
          "DELETE REKAP ERROR:",
          error
        );

        showErrorAlert(
          "Gagal Menghapus",
          error?.message ||
            "Data gagal dihapus."
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =====================================================
     EXPORT CSV
  ===================================================== */

  const handleExportExcel =
    () => {
      if (
        dataList.length === 0
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
            (row) =>
              row
                .map(
                  (item) =>
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

      link.href = url;

      link.download =
        "rekap-balasan-konfirmasi.csv";

      link.click();

      URL.revokeObjectURL(
        url
      );

      setExportOpen(false);
    };

  /* =====================================================
     EXPORT PDF
  ===================================================== */

  const handleExportPdf =
    () => {
      if (
        dataList.length === 0
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
                <td>${escapeHtml(row.nama)}</td>
                <td>Rp ${formatNumber(
                  row.saldoBukuBesar
                )}</td>
                <td>${escapeHtml(
                  row.tanggalKirim ||
                  "-"
                )}</td>
                <td>${escapeHtml(
                  row.pengirimanVia ||
                  "-"
                )}</td>
                <td>${escapeHtml(
                  row.tanggalJawaban ||
                  "-"
                )}</td>
                <td>Rp ${formatNumber(
                  row.saldoJawaban
                )}</td>
                <td>Rp ${formatNumber(
                  getSelisih(
                    row.saldoBukuBesar,
                    row.saldoJawaban
                  )
                )}</td>
                <td>${escapeHtml(
                  row.statusKonfirmasi
                )}</td>
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
              Rekap Balasan Konfirmasi
            </title>

            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
              }

              th,
              td {
                border: 1px solid #ddd;
                padding: 7px;
              }

              th {
                background: #f8fafc;
              }

              @page {
                size: landscape;
              }
            </style>
          </head>

          <body>
            <h2>
              Rekap Balasan Konfirmasi
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
              window.onload = function () {
                window.print();
              };
            </script>
          </body>
        </html>
      `);

      popup.document.close();

      setExportOpen(false);
    };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="font-poppins text-[#334155]">

      {/* SUCCESS */}

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

      {/* ERROR */}

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

      {/* DELETE CONFIRMATION */}

      <ConfirmationPopup
        isOpen={
          deleteModalOpen
        }
        message="Apakah Anda yakin ingin menghapus data Rekap Balasan Konfirmasi?"
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
          if (deleting) {
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

      {/* MAIN CARD */}

      <div
        className="
          rounded-xl
          border
          border-[#DCE5EF]
          bg-white
          p-4
        "
      >

        {/* TOP */}

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
              relative
              w-full
              sm:w-[220px]
            "
          >
            <select
              value={
                filterStatus
              }
              onChange={(
                event
              ) =>
                setFilterStatus(
                  event.target.value
                )
              }
              className="
                h-12
                w-full
                appearance-none
                rounded-xl
                border
                border-[#DCE5EF]
                bg-white
                px-4
                pr-10
                font-poppins
                text-sm
                text-[#475569]
                outline-none
                transition
                focus:border-[#38BDF8]
              "
            >
              <option>
                Semua Konfirmasi
              </option>

              <option>
                Terbalas
              </option>

              <option>
                Tidak Terbalas
              </option>
            </select>

            <ChevronDown
              size={15}
              className="
                pointer-events-none
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-[#64748B]
              "
            />
          </div>

          {/* EXPORT */}

          <div
            ref={
              exportRef
            }
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setExportOpen(
                  (previous) =>
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
                  />

                  PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TABLE */}

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
                  (header) => (
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
                      {header}
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
                    colSpan={11}
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
                          {index + 1}
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
                                value: "",
                                label: "Pilih Customer",
                              },
                              ...getCustomerOptionsForRow(
                                row
                              ).map(
                                (customer) => ({
                                  value:
                                    customer.id,
                                  label:
                                    customer.namaCustomer,
                                })
                              ),
                            ]}
                            onChange={(value) =>
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

                        {/* SALDO BUKU BESAR */}

                        <td
                          className="
                            min-w-[180px]
                            px-3
                            py-2
                          "
                        >
                          <div
                            className="
                              flex
                              h-10
                              items-center
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
                                flex
                                min-w-0
                                flex-1
                                items-center
                                justify-end
                                pl-3
                                text-right
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

                        {/* SALDO JAWABAN */}

                        <td
                          className="
                            min-w-[180px]
                            px-3
                            py-2
                          "
                        >
                          <div
                            className="
                              flex
                              h-10
                              items-center
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
                              value={
                                formatNumber(
                                  row.saldoJawaban
                                )
                              }
                              onChange={(
                                event
                              ) =>
                                updateRow(
                                  row.id,
                                  "saldoJawaban",
                                  parseNumber(
                                    event.target.value
                                  )
                                )
                              }
                              className="
                                min-w-0
                                flex-1
                                bg-transparent
                                pl-3
                                text-right
                                font-poppins
                                text-sm
                                text-[#475569]
                                outline-none
                              "
                            />
                          </div>
                        </td>

                        {/* SELISIH */}

                        <td
                          className="
                            min-w-[180px]
                            px-3
                            py-2
                          "
                        >
                          <div
                            className="
                              flex
                              h-10
                              items-center
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
                                flex
                                min-w-0
                                flex-1
                                items-center
                                justify-end
                                pl-3
                                text-right
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

                            {(row.buktiFile ||
                              row.namaBukti) && (
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
                                value: "",
                                label: "Pilih Status",
                              },
                              {
                                value: "Terbalas",
                                label: "Terbalas",
                              },
                              {
                                value: "Tidak Terbalas",
                                label: "Tidak Terbalas",
                              },
                            ]}
                            onChange={(value) =>
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
                                text-black
                                transition
                                hover:bg-red-50
                                hover:text-red-500
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

            {/* TOTAL */}

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

        {/* TAMBAH DATA */}

        <div
          className="
            mt-4
            flex
            justify-center
          "
        >
          <button
            type="button"
            onClick={
              handleAddData
            }
            disabled={
              saving
            }
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-[#38BDF8]
              px-5
              py-2.5
              font-poppins
              text-sm
              font-medium
              text-white
              transition
              hover:bg-[#22AFE8]
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Plus
              size={15}
            />

            Tambah Data
          </button>
        </div>

        {/* BOTTOM */}

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

          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              saving
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
              disabled:opacity-50
            "
          >
            {saving
              ? "Menyimpan..."
              : "Simpan"}
          </button>
        </div>
      </div>


    </div>
  );
}