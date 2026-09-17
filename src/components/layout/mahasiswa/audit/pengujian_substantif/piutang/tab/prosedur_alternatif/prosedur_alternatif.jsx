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
  Bookmark,
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
  `${API_URL}/api/prosedur-alternatif`;

const BULK_SAVE_ENDPOINT =
  `${API_ENDPOINT}/bulk-save`;

/* =====================================================
   MEMORY CACHE
===================================================== */

const prosedurAlternatifPageCache =
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
      return String(
        firstError
      );
    }
  }

  if (result?.message) {
    return String(
      result.message
    );
  }

  if (result?.error) {
    return String(
      result.error
    );
  }

  if (result?.raw) {
    return String(
      result.raw
    );
  }

  return fallback;
};

/* =====================================================
   ID / VALUE HELPERS
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

  const numberValue =
    Number(value);

  return Number.isNaN(
    numberValue
  )
    ? value
    : numberValue;
};

const toNumber = (
  value
) => {
  const numberValue =
    Number(value);

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : 0;
};

const normalizeBooleanBayar = (
  value
) => {
  if (
    value === true ||
    value === 1 ||
    value === "1"
  ) {
    return "Ya";
  }

  if (
    value === false ||
    value === 0 ||
    value === "0"
  ) {
    return "Tidak";
  }

  return "";
};

/* =====================================================
   NORMALIZE API DATA
===================================================== */

const normalizeCustomer = (
  item,
  piutangId
) => {
  return {
    id:
      normalizeId(
        item?.KonfirmasiPiutangID ??
        item?.konfirmasi_piutang_id ??
        item?.id
      ),

    piutangId:
      normalizeId(
        item?.PiutangID ??
        item?.piutang_id ??
        piutangId
      ),

    namaCustomer:
      item?.NamaCustomer ??
      item?.nama_customer ??
      "",

    /*
     * Controller Prosedur Alternatif menambahkan
     * SaldoBB pada konfirmasi_piutang_tersedia.
     */
    saldoAkhirPeriode:
      toNumber(
        item?.SaldoBB ??
        item?.saldo_bb ??
        0
      ),
  };
};

const normalizeProsedur = (
  item,
  piutangId
) => {
  const nestedCustomer =
    item?.konfirmasi_piutang ??
    item?.konfirmasiPiutang ??
    null;

  const prosedurId =
    normalizeId(
      item?.ProsedurAlternatifID ??
      item?.prosedur_alternatif_id ??
      item?.id
    );

  return {
    id:
      prosedurId ??
      `temp-${Date.now()}-${Math.random()}`,

    prosedurId,

    piutangId:
      normalizeId(
        item?.PiutangID ??
        item?.piutang_id ??
        piutangId
      ),

    konfirmasiId:
      normalizeId(
        item?.KonfirmasiPiutangID ??
        item?.konfirmasi_piutang_id ??
        nestedCustomer?.KonfirmasiPiutangID ??
        nestedCustomer?.konfirmasi_piutang_id
      ) ?? "",

    /*
     * Hanya untuk menentukan urutan UPDATE saat Save.
     * Field ini TIDAK dipakai untuk filtering dropdown.
     */
    originalKonfirmasiId:
      normalizeId(
        item?.KonfirmasiPiutangID ??
        item?.konfirmasi_piutang_id ??
        nestedCustomer?.KonfirmasiPiutangID ??
        nestedCustomer?.konfirmasi_piutang_id
      ) ?? "",

    namaCustomer:
      item?.NamaCustomer ??
      item?.nama_customer ??
      nestedCustomer?.NamaCustomer ??
      nestedCustomer?.nama_customer ??
      "",

    /*
     * SaldoAkhir adalah nilai yang disimpan
     * pada tabel ProsedurAlternatif.
     */
    saldoAkhirPeriode:
      toNumber(
        item?.SaldoAkhir ??
        item?.saldo_akhir ??
        item?.SaldoBB ??
        item?.saldo_bb ??
        0
      ),

    dibayar:
      normalizeBooleanBayar(
        item?.KonfirmasiBayar ??
        item?.konfirmasi_bayar
      ),

    noBuktiBayar:
      item?.BuktiBayar ??
      item?.bukti_bayar ??
      "",

    /*
     * Nama field backend memang SaldoBata.
     * Di FE digunakan sebagai Saldo Pembayaran.
     */
    saldoPembayaran:
      toNumber(
        item?.SaldoBata ??
        item?.saldo_bata ??
        0
      ),

    namaBukti:
      item?.NamaFile ??
      item?.nama_file ??
      "",

    tipeBukti:
      item?.TipeFile ??
      item?.tipe_file ??
      "",

    buktiFile:
      null,
  };
};

/* =====================================================
   INITIAL DATA
===================================================== */

const INITIAL_DATA = [];

/* =====================================================
   HELPERS
===================================================== */

const parseNumber = (value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  const onlyNumber =
    String(value).replace(
      /\D/g,
      ""
    );

  if (!onlyNumber) {
    return 0;
  }

  return Number(
    onlyNumber
  );
};

const formatNumber = (value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return "0";
  }

  return new Intl.NumberFormat(
    "id-ID"
  ).format(
    Number(value) || 0
  );
};

const getSelisih = (
  saldoAkhirPeriode,
  saldoPembayaran
) => {
  if (
    saldoPembayaran === "" ||
    saldoPembayaran === null ||
    saldoPembayaran === undefined
  ) {
    return 0;
  }

  return (
    Number(
      saldoAkhirPeriode || 0
    ) -
    Number(
      saldoPembayaran || 0
    )
  );
};

const getPersentase = (
  saldoAkhirPeriode,
  saldoPembayaran
) => {
  const saldoAkhir =
    Number(
      saldoAkhirPeriode || 0
    );

  const pembayaran =
    Number(
      saldoPembayaran || 0
    );

  if (
    saldoAkhir <= 0
  ) {
    return "0.00";
  }

  return (
    (pembayaran /
      saldoAkhir) *
    100
  ).toFixed(2);
};

const escapeHtml = (value) => {
  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

/* =====================================================
   PAGE
===================================================== */

export default function ProsedurAlternatifPage({
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

  const cacheKey =
    activeJwbKasusId
      ? String(
          activeJwbKasusId
        )
      : null;

  const initialCache =
    cacheKey
      ? prosedurAlternatifPageCache.get(
          cacheKey
        ) || null
      : null;

  /* =====================================================
     PIUTANG
  ===================================================== */

  const [
    piutangId,
    setPiutangId,
  ] = useState(
    () =>
      initialCache?.piutangId ??
      null
  );

  /* =====================================================
     CUSTOMER SOURCE
  ===================================================== */

  const [
    customerOptions,
    setCustomerOptions,
  ] = useState(
    () =>
      initialCache?.customerOptions ??
      []
  );

  /* =====================================================
     DATA
  ===================================================== */

  const [
    dataList,
    setDataList,
  ] = useState(
    () =>
      initialCache?.dataList ??
      INITIAL_DATA
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  /* =====================================================
     INDEX
  ===================================================== */

  const [
    indexValue,
    setIndexValue,
  ] = useState("B.9");

  /* =====================================================
     EXPORT
  ===================================================== */

  const [
    exportOpen,
    setExportOpen,
  ] = useState(false);

  const exportRef =
    useRef(null);

  /* =====================================================
     ALERT
  ===================================================== */

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

  /* =====================================================
     FILE INPUT
  ===================================================== */

  const fileInputRefs =
    useRef({});

  /* =====================================================
     ALERT HELPERS
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
     SAVE CURRENT CACHE
  ===================================================== */

  const saveCurrentCache =
    (
      nextPiutangId,
      nextCustomerOptions,
      nextDataList
    ) => {
      if (!cacheKey) {
        return;
      }

      prosedurAlternatifPageCache.set(
        cacheKey,
        {
          piutangId:
            nextPiutangId,

          customerOptions:
            nextCustomerOptions,

          dataList:
            nextDataList,
        }
      );
    };

  /* =====================================================
     LOAD PAGE DATA

     GET /api/prosedur-alternatif

     Controller mengembalikan:
     Piutang[]
       -> PiutangID
       -> JwbKasusID
       -> konfirmasi_piutang[]
       -> konfirmasi_piutang_tersedia[]
       -> prosedur_alternatif[]

     FE selalu mengurutkan prosedur_alternatif berdasarkan
     ProsedurAlternatifID supaya posisi row tidak berpindah
     setelah customer pada suatu row di-update.
  ===================================================== */

  const loadPageData =
    async (
      activeId
    ) => {
      if (!activeId) {
        setPiutangId(null);
        setCustomerOptions([]);
        setDataList([]);

        return {
          piutangId: null,
          customerOptions: [],
          dataList: [],
        };
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
            "Gagal mengambil data Prosedur Alternatif."
          )
        );
      }

      const piutangRows =
        Array.isArray(result)
          ? result
          : Array.isArray(
              result?.data
            )
          ? result.data
          : [];

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

      if (!activePiutang) {
        const emptyData = {
          piutangId: null,
          customerOptions: [],
          dataList: [],
        };

        prosedurAlternatifPageCache.set(
          String(activeId),
          emptyData
        );

        setPiutangId(null);
        setCustomerOptions([]);
        setDataList([]);

        return emptyData;
      }

      const activePiutangId =
        normalizeId(
          activePiutang?.PiutangID ??
          activePiutang?.piutang_id ??
          activePiutang?.id
        );

      /*
       * ===========================================
       * MASTER CUSTOMER PROSEDUR ALTERNATIF
       * ===========================================
       *
       * Sama seperti Rekap Balasan:
       *
       * Pool dropdown dibentuk dari UNION:
       *
       * 1. konfirmasi_piutang[]
       * 2. konfirmasi_piutang_tersedia[]
       * 3. prosedur_alternatif[].konfirmasi_piutang
       *
       * Customer yang sudah tersimpan di database
       * tetap tersedia sebagai pilihan dropdown,
       * sehingga bisa dipakai sebagai target SWAP.
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

      const rawAvailableCustomers =
        Array.isArray(
          activePiutang
            ?.konfirmasi_piutang_tersedia
        )
          ? activePiutang
              .konfirmasi_piutang_tersedia
          : Array.isArray(
              activePiutang
                ?.konfirmasiPiutangTersedia
            )
          ? activePiutang
              .konfirmasiPiutangTersedia
          : [];

      const rawProsedur =
        Array.isArray(
          activePiutang
            ?.prosedur_alternatif
        )
          ? activePiutang
              .prosedur_alternatif
          : Array.isArray(
              activePiutang
                ?.prosedurAlternatif
            )
          ? activePiutang
              .prosedurAlternatif
          : [];

      const customerMap =
        new Map();

      const addCustomerToMap =
        (item) => {
          if (!item) {
            return;
          }

          const normalized =
            normalizeCustomer(
              item,
              activePiutangId
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

      /*
       * Master dari backend.
       * Controller terbaru menempelkan SaldoBB
       * pada seluruh konfirmasi_piutang[].
       */
      rawAllCustomers.forEach(
        addCustomerToMap
      );

      /*
       * Fallback customer tersedia.
       */
      rawAvailableCustomers.forEach(
        addCustomerToMap
      );

      /*
       * Fallback customer existing.
       *
       * Jika suatu customer sudah ada di database,
       * nested relation memastikan customer tersebut
       * tidak hilang dari dropdown.
       */
      rawProsedur.forEach(
        (prosedurItem) => {
          const nestedCustomer =
            prosedurItem
              ?.konfirmasi_piutang ??
            prosedurItem
              ?.konfirmasiPiutang ??
            null;

          if (!nestedCustomer) {
            return;
          }

          /*
           * Nested relation sendiri tidak membawa
           * SaldoBB. Ambil SaldoBB dari record prosedur
           * bila tersedia sebagai fallback.
           */
          addCustomerToMap({
            ...nestedCustomer,

            SaldoBB:
              prosedurItem?.SaldoBB ??
              prosedurItem?.SaldoAkhir ??
              0,
          });
        }
      );

      const allCustomers =
        Array.from(
          customerMap.values()
        );

      const normalizedProsedur =
        rawProsedur
          .map(
            (item) =>
              normalizeProsedur(
                item,
                activePiutangId
              )
          )
          /*
           * Jaga urutan row tetap stabil setelah Save.
           *
           * Tanpa sort ini, urutan relation dari backend/database
           * bisa berubah setelah KonfirmasiPiutangID di-update.
           * Akibatnya secara visual terlihat seperti:
           *
           * Row 1: Kebak -> Sumber Rezeki
           * Row 2: Makmur Jaya -> Kebak
           *
           * lalu setelah Save tampak "balik/berubah lagi",
           * padahal record yang tersimpan bisa saja benar tetapi
           * posisi row-nya bertukar karena response backend.
           *
           * ProsedurAlternatifID tidak berubah saat update,
           * jadi kita pakai ID tersebut sebagai urutan tetap.
           */
          .sort(
            (a, b) => {
              const aId =
                Number(
                  a?.prosedurId ?? 0
                );

              const bId =
                Number(
                  b?.prosedurId ?? 0
                );

              return aId - bId;
            }
          );

      const nextData = {
        piutangId:
          activePiutangId,

        customerOptions:
          allCustomers,

        dataList:
          normalizedProsedur,
      };

      prosedurAlternatifPageCache.set(
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
        normalizedProsedur
      );

      return nextData;
    };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const run =
      async () => {
        if (
          !activeJwbKasusId
        ) {
          setPiutangId(null);
          setCustomerOptions([]);
          setDataList([]);

          return;
        }

        const cached =
          prosedurAlternatifPageCache.get(
            String(
              activeJwbKasusId
            )
          );

        if (cached) {
          setPiutangId(
            cached.piutangId ??
            null
          );

          setCustomerOptions(
            cached.customerOptions ??
            []
          );

          setDataList(
            cached.dataList ??
            []
          );
        }

        try {
          const latest =
            await loadPageData(
              activeJwbKasusId
            );

          if (
            cancelled ||
            !latest
          ) {
            return;
          }
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            "Gagal memuat Prosedur Alternatif:",
            error
          );

          showErrorAlert(
            "Gagal Memuat Data",
            error?.message ||
              "Data Prosedur Alternatif tidak dapat dimuat."
          );
        }
      };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    activeJwbKasusId,
  ]);

  /* =====================================================
     CACHE CURRENT EDITS

     Hanya memory cache, bukan localStorage.
  ===================================================== */

  useEffect(() => {
    if (!cacheKey) {
      return;
    }

    saveCurrentCache(
      piutangId,
      customerOptions,
      dataList
    );
  }, [
    cacheKey,
    piutangId,
    customerOptions,
    dataList,
  ]);

  /* =====================================================
     CLOSE EXPORT OUTSIDE
  ===================================================== */

  useEffect(() => {
    const handleOutside =
      (event) => {
        if (
          exportRef.current &&
          !exportRef.current.contains(
            event.target
          )
        ) {
          setExportOpen(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  /* =====================================================
     UPDATE ROW
  ===================================================== */

  const updateRow = (
    id,
    field,
    value
  ) => {
    setDataList(
      (previous) =>
        previous.map(
          (row) => {
            if (
              String(
                row.id
              ) !==
              String(
                id
              )
            ) {
              return row;
            }

            return {
              ...row,

              [field]:
                value,
            };
          }
        )
    );
  };

  /* =====================================================
     CUSTOMER OPTIONS PER ROW

     Backend bulkSave menangani SWAP sebagai final state.

     Karena itu SEMUA customer tetap tampil di setiap dropdown,
     termasuk customer yang sedang dipakai row lain.

     Contoh:
       Row 1 = A
       Row 2 = B

     User boleh memilih:
       Row 1 -> B
       Row 2 -> A

     Duplicate FINAL STATE akan dicek saat Save.
  ===================================================== */

  const getCustomerOptionsForRow =
    (currentRow) => {
      const options =
        customerOptions.map(
          (customer) => ({
            ...customer,
          })
        );

      /*
       * Fallback existing customer.
       */
      if (
        currentRow.konfirmasiId &&
        currentRow.namaCustomer
      ) {
        const alreadyExists =
          options.some(
            (customer) =>
              String(
                customer.id
              ) ===
              String(
                currentRow
                  .konfirmasiId
              )
          );

        if (!alreadyExists) {
          options.unshift({
            id:
              currentRow
                .konfirmasiId,

            piutangId:
              currentRow
                .piutangId,

            namaCustomer:
              currentRow
                .namaCustomer,

            saldoAkhirPeriode:
              toNumber(
                currentRow
                  .saldoAkhirPeriode
              ),
          });
        }
      }

      return options;
    };

  /* =====================================================
     CUSTOMER CHANGE
  ===================================================== */

  const handleCustomerChange = (
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
            (row) => {
              if (
                String(
                  row.id
                ) !==
                String(
                  rowId
                )
              ) {
                return row;
              }

              return {
                ...row,

                konfirmasiId:
                  "",

                namaCustomer:
                  "",

                saldoAkhirPeriode:
                  0,
              };
            }
          )
      );

      return;
    }

    const customer =
      getCustomerOptionsForRow(
        currentRow
      ).find(
        (item) =>
          String(
            item.id
          ) ===
          String(
            customerId
          )
      );

    if (!customer) {
      showErrorAlert(
        "Customer Tidak Ditemukan",
        "Customer tidak tersedia atau sudah digunakan."
      );

      return;
    }

    setDataList(
      (previous) =>
        previous.map(
          (row) => {
            if (
              String(
                row.id
              ) !==
              String(
                rowId
              )
            ) {
              return row;
            }

            return {
              ...row,

              piutangId:
                piutangId,

              konfirmasiId:
                customer.id,

              namaCustomer:
                customer.namaCustomer,

              /*
               * Saldo Akhir Periode otomatis
               * mengambil SaldoBB dari Rekap Balasan.
               */
              saldoAkhirPeriode:
                toNumber(
                  customer
                    .saldoAkhirPeriode
                ),
            };
          }
        )
    );
  };

  /* =====================================================
     ADD DATA
  ===================================================== */

  const handleAddData =
    () => {
      if (!piutangId) {
        showErrorAlert(
          "Piutang Belum Tersedia",
          "Data Piutang untuk tugas ini belum tersedia."
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
          "Tidak ada customer Konfirmasi Piutang yang masih tersedia untuk Prosedur Alternatif."
        );

        return;
      }

      const newData = {
        id:
          `temp-${Date.now()}`,

        prosedurId:
          null,

        piutangId:
          piutangId,

        konfirmasiId:
          "",

        originalKonfirmasiId:
          "",

        namaCustomer:
          "",

        saldoAkhirPeriode:
          0,

        dibayar:
          "",

        noBuktiBayar:
          "",

        saldoPembayaran:
          0,

        namaBukti:
          "",

        tipeBukti:
          "",

        buktiFile:
          null,
      };

      setDataList(
        (previous) => [
          ...previous,
          newData,
        ]
      );
    };

  /* =====================================================
     DELETE
  ===================================================== */

  const openDeleteModal =
    (row) => {
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
        !deletingData
      ) {
        return;
      }

      try {
        /*
         * Row baru yang belum pernah tersimpan
         * cukup dihapus dari state FE.
         */
        if (
          !deletingData
            .prosedurId
        ) {
          const nextDataList =
            dataList.filter(
              (row) =>
                String(
                  row.id
                ) !==
                String(
                  deletingData.id
                )
            );

          setDataList(
            nextDataList
          );

          saveCurrentCache(
            piutangId,
            customerOptions,
            nextDataList
          );

          setDeleteModalOpen(
            false
          );

          setDeletingData(
            null
          );

          showSuccessAlert(
            "Berhasil dihapus",
            "Data Prosedur Alternatif berhasil dihapus."
          );

          return;
        }

        const response =
          await fetchWithAuth(
            `${API_ENDPOINT}/${encodeURIComponent(
              deletingData
                .prosedurId
            )}`,
            {
              method: "DELETE",
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
              "Gagal menghapus data Prosedur Alternatif."
            )
          );
        }

        setDeleteModalOpen(
          false
        );

        setDeletingData(
          null
        );

        if (
          activeJwbKasusId
        ) {
          await loadPageData(
            activeJwbKasusId
          );
        }

        showSuccessAlert(
          "Berhasil dihapus",
          "Data Prosedur Alternatif berhasil dihapus."
        );
      } catch (error) {
        console.error(
          "Gagal menghapus Prosedur Alternatif:",
          error
        );

        showErrorAlert(
          "Gagal Menghapus",
          error?.message ||
            "Data Prosedur Alternatif gagal dihapus."
        );
      }
    };

  /* =====================================================
     FILE
  ===================================================== */

  const handleFileSelected = (
    rowId,
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

    setDataList(
      (previous) =>
        previous.map(
          (row) => {
            if (
              String(
                row.id
              ) !==
              String(
                rowId
              )
            ) {
              return row;
            }

            return {
              ...row,

              namaBukti:
                file.name,

              tipeBukti:
                file.type,

              buktiFile:
                file,
            };
          }
        )
    );
  };

  const handleViewBukti =
    async (
      row
    ) => {
      /*
       * File yang baru dipilih tetapi belum
       * disimpan ke database.
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
          () => {
            URL.revokeObjectURL(
              url
            );
          },
          10000
        );

        return;
      }

      /*
       * File yang sudah tersimpan di database.
       */
      if (
        !row?.prosedurId
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
              row.prosedurId
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
          () => {
            URL.revokeObjectURL(
              url
            );
          },
          10000
        );
      } catch (error) {
        console.error(
          "Gagal membuka bukti:",
          error
        );

        showErrorAlert(
          "Gagal Membuka Bukti",
          error?.message ||
            "File bukti tidak dapat dibuka."
        );
      }
    };

  /* =====================================================
     FINAL CUSTOMER VALIDATION
  ===================================================== */

  const validateFinalCustomerState =
    (rows) => {
      const seen =
        new Set();

      for (const row of rows) {
        const activePiutangId =
          normalizeId(
            row.piutangId
          ) ||
          normalizeId(
            piutangId
          );

        const customerId =
          normalizeId(
            row.konfirmasiId
          );

        if (!customerId) {
          return {
            valid: false,
            message:
              "Masih ada baris yang belum memilih Nama Customer.",
          };
        }

        const key =
          `${activePiutangId}:${customerId}`;

        if (seen.has(key)) {
          return {
            valid: false,
            message:
              "Satu customer hanya boleh digunakan satu kali pada Prosedur Alternatif.",
          };
        }

        seen.add(key);
      }

      return {
        valid: true,
        message: "",
      };
    };

  /* =====================================================
     BULK SAVE FORM DATA

     Backend:
     POST /api/prosedur-alternatif/bulk-save

     Semua row FINAL dikirim sekaligus.

     Existing:
       ProsedurAlternatifID ada -> UPDATE

     New:
       ProsedurAlternatifID kosong -> CREATE

     FileBukti hanya dikirim jika user memilih file baru.
  ===================================================== */

  const buildBulkSaveFormData =
    (
      rows,
      activePiutangId
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

          /*
           * Existing primary key.
           */
          if (
            row.prosedurId
          ) {
            form.append(
              `${prefix}[ProsedurAlternatifID]`,
              String(
                row.prosedurId
              )
            );
          }

          const rowPiutangId =
            normalizeId(
              row.piutangId
            ) ||
            activePiutangId;

          form.append(
            `${prefix}[PiutangID]`,
            String(
              rowPiutangId
            )
          );

          form.append(
            `${prefix}[KonfirmasiPiutangID]`,
            String(
              row.konfirmasiId
            )
          );

          form.append(
            `${prefix}[SaldoAkhir]`,
            String(
              toNumber(
                row.saldoAkhirPeriode
              )
            )
          );

          if (
            row.dibayar ===
            "Ya"
          ) {
            form.append(
              `${prefix}[KonfirmasiBayar]`,
              "1"
            );
          } else if (
            row.dibayar ===
            "Tidak"
          ) {
            form.append(
              `${prefix}[KonfirmasiBayar]`,
              "0"
            );
          }

          form.append(
            `${prefix}[BuktiBayar]`,
            String(
              row.noBuktiBayar ||
              ""
            )
          );

          form.append(
            `${prefix}[SaldoBata]`,
            String(
              toNumber(
                row.saldoPembayaran
              )
            )
          );

          /*
           * File existing tidak dikirim ulang.
           * Backend mempertahankan file lama jika
           * tidak ada File object baru.
           */
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

  const bulkSaveProsedur =
    async (
      rows,
      activePiutangId
    ) => {
      const form =
        buildBulkSaveFormData(
          rows,
          activePiutangId
        );

      const response =
        await fetchWithAuth(
          BULK_SAVE_ENDPOINT,
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
            "Prosedur Alternatif gagal disimpan."
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
            "Prosedur Alternatif gagal disimpan."
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
          "Belum ada data Prosedur Alternatif."
        );

        return;
      }

      const activePiutangId =
        normalizeId(
          piutangId
        );

      if (
        !activePiutangId
      ) {
        showErrorAlert(
          "Piutang Belum Tersedia",
          "PiutangID untuk tugas ini belum tersedia."
        );

        return;
      }

      const finalCustomerValidation =
        validateFinalCustomerState(
          dataList
        );

      if (
        !finalCustomerValidation.valid
      ) {
        showErrorAlert(
          "Customer Tidak Valid",
          finalCustomerValidation.message
        );

        return;
      }

      const invalidDibayar =
        dataList.some(
          (row) =>
            !row.dibayar
        );

      if (
        invalidDibayar
      ) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Masih ada baris yang belum memilih Dibayar/Tidak."
        );

        return;
      }

      try {
        setSaving(true);

        /*
         * SATU REQUEST FINAL STATE.
         *
         * Tidak ada lagi:
         * - create satu per satu
         * - update satu per satu
         * - temporary customer FE
         * - safe-order FE
         *
         * Swap / cycle ditangani transaction backend.
         */
        const result =
          await bulkSaveProsedur(
            dataList,
            activePiutangId
          );

        if (
          activeJwbKasusId
        ) {
          await loadPageData(
            activeJwbKasusId
          );
        }

        showSuccessAlert(
          "Berhasil disimpan",
          result?.message ||
            "Prosedur Alternatif berhasil disimpan ke database."
        );
      } catch (error) {
        console.error(
          "Gagal menyimpan Prosedur Alternatif:",
          error
        );

        showErrorAlert(
          "Gagal Menyimpan",
          error?.message ||
            "Prosedur Alternatif gagal disimpan."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =====================================================
     EXPORT EXCEL
  ===================================================== */

  const handleExportExcel =
    () => {
      if (
        dataList.length ===
        0
      ) {
        setExportOpen(
          false
        );

        showErrorAlert(
          "Data Kosong",
          "Tidak ada data yang dapat diexport."
        );

        return;
      }

      const headers = [
        "No",
        "Nama Customer",
        "Saldo Akhir Periode",
        "Dibayar/Tidak",
        "No Bukti Bayar",
        "Saldo Pembayaran",
        "Selisih",
        "Bukti",
        "Persentase Pembayaran",
      ];

      const rows =
        dataList.map(
          (
            row,
            index
          ) => [
            index + 1,

            row.namaCustomer ||
              "-",

            row.saldoAkhirPeriode ||
              0,

            row.dibayar ||
              "-",

            row.noBuktiBayar ||
              "-",

            Number(
              row.saldoPembayaran ||
                0
            ),

            getSelisih(
              row.saldoAkhirPeriode,
              row.saldoPembayaran
            ),

            row.namaBukti ||
              "-",

            getPersentase(
              row.saldoAkhirPeriode,
              row.saldoPembayaran
            ) + "%",
          ]
        );

      const csvContent = [
        headers,
        ...rows,
      ]
        .map(
          (row) =>
            row
              .map(
                (value) =>
                  `"${String(
                    value
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
              csvContent,
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
        "prosedur-alternatif.csv";

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
        setExportOpen(
          false
        );

        showErrorAlert(
          "Data Kosong",
          "Tidak ada data yang dapat diexport."
        );

        return;
      }

      const printWindow =
        window.open(
          "",
          "_blank"
        );

      if (!printWindow) {
        return;
      }

      const rowsHtml =
        dataList
          .map(
            (
              row,
              index
            ) => {
              const selisih =
                getSelisih(
                  row.saldoAkhirPeriode,
                  row.saldoPembayaran
                );

              const percentage =
                getPersentase(
                  row.saldoAkhirPeriode,
                  row.saldoPembayaran
                );

              return `
                <tr>

                  <td>
                    ${index + 1}
                  </td>

                  <td>
                    ${escapeHtml(
                      row.namaCustomer ||
                        "-"
                    )}
                  </td>

                  <td>
                    Rp ${formatNumber(
                      row.saldoAkhirPeriode ||
                        0
                    )}
                  </td>

                  <td>
                    ${escapeHtml(
                      row.dibayar ||
                        "-"
                    )}
                  </td>

                  <td>
                    ${escapeHtml(
                      row.noBuktiBayar ||
                        "-"
                    )}
                  </td>

                  <td style="text-align:right;">
                    Rp ${formatNumber(
                      row.saldoPembayaran ||
                        0
                    )}
                  </td>

                  <td style="text-align:right;">
                    Rp ${formatNumber(
                      selisih
                    )}
                  </td>

                  <td>
                    ${escapeHtml(
                      row.namaBukti ||
                        "-"
                    )}
                  </td>

                  <td>
                    ${percentage} %
                  </td>

                </tr>
              `;
            }
          )
          .join("");

      printWindow.document.write(`
        <!DOCTYPE html>

        <html>

          <head>

            <meta charset="UTF-8" />

            <title>
              Prosedur Alternatif
            </title>

            <style>

              * {
                box-sizing: border-box;
              }

              body {
                font-family: Arial, sans-serif;
                padding: 24px;
                color: #475569;
              }

              h2 {
                margin-bottom: 20px;
                color: #334155;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10px;
              }

              th,
              td {
                padding: 8px;
                border: 1px solid #dce5ef;
              }

              th {
                background: #f8fafc;
                color: #64748b;
                text-align: left;
              }

              @page {
                size: landscape;
                margin: 10mm;
              }

            </style>

          </head>

          <body>

            <h2>
              Prosedur Alternatif
            </h2>

            <table>

              <thead>

                <tr>

                  <th>No</th>
                  <th>Nama Customer</th>
                  <th>Saldo Akhir Periode</th>
                  <th>Dibayar/Tidak</th>
                  <th>No Bukti Bayar</th>
                  <th>Saldo Pembayaran</th>
                  <th>Selisih</th>
                  <th>Bukti</th>
                  <th>Persentase Pembayaran</th>

                </tr>

              </thead>

              <tbody>

                ${rowsHtml}

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

      printWindow.document.close();

      setExportOpen(
        false
      );
    };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="font-poppins text-[#334155]">

      {/* =================================================
          ALERT
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
          DELETE CONFIRM
      ================================================= */}

      <ConfirmationPopup
        isOpen={
          deleteModalOpen
        }
        message="Apakah Anda yakin ingin menghapus data Prosedur Alternatif?"
        subText={
          deletingData
            ? deletingData.namaCustomer ||
              "Data Prosedur Alternatif"
            : ""
        }
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={
          handleConfirmDelete
        }
        onCancel={() => {
          setDeleteModalOpen(
            false
          );

          setDeletingData(
            null
          );
        }}
      />

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">

        {/* =================================================
            INDEX + EXPORT
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          {/* INDEX */}

          <div>

            <label className="mb-2 block font-poppins text-[11px] font-semibold text-[#475569]">
              Index
            </label>

            <div
              className="
                flex
                h-12
                w-[230px]
                items-center
                gap-3
                rounded-xl
                border
                border-[#DCE5EF]
                bg-[#F8FAFC]
                px-4
              "
            >

              <Bookmark
                size={16}
                className="text-[#64748B]"
              />

              <input
                type="text"
                value={
                  indexValue
                }
                onChange={(
                  event
                ) =>
                  setIndexValue(
                    event.target.value
                  )
                }
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  font-poppins
                  text-sm
                  text-[#64748B]
                  outline-none
                "
              />

            </div>

          </div>

          {/* EXPORT */}

          <div
            ref={exportRef}
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
                min-w-[150px]
                items-center
                justify-between
                gap-3
                rounded-xl
                border
                border-[#DCE5EF]
                bg-white
                px-4
                font-poppins
                text-sm
                text-[#64748B]
                transition
                hover:bg-[#F8FAFC]
              "
            >

              <span className="flex items-center gap-2">

                <Download
                  size={15}
                />

                Export File

              </span>

              <ChevronDown
                size={14}
                className={`
                  transition
                  duration-200

                  ${
                    exportOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />

            </button>

            {exportOpen && (

              <div
                className="
                  absolute
                  right-0
                  top-[54px]
                  z-50
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
                    transition
                    hover:bg-[#F8FAFC]
                  "
                >

                  <FileSpreadsheet
                    size={16}
                    className="text-green-600"
                  />

                  Excel

                </button>

                <div className="h-px bg-[#EEF2F6]" />

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
                    transition
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

        <div className="mt-4 overflow-hidden rounded-xl border border-[#DCE5EF]">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1450px] table-fixed border-collapse">

              {/* HEADER */}

              <thead className="bg-[#F8FAFC]">

                <tr className="border-b border-[#DCE5EF]">

                  <th className="w-[55px] px-4 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    NO
                  </th>

                  <th className="w-[210px] px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    NAMA CUSTOMER
                  </th>

                  <th className="w-[190px] px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    SALDO AKHIR PERIODE
                  </th>

                  <th className="w-[140px] px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    DIBAYAR/TIDAK
                  </th>

                  <th className="w-[170px] px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    NO BUKTI BAYAR
                  </th>

                  <th className="w-[190px] px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    SALDO PEMBAYARAN
                  </th>

                  <th className="w-[170px] px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    SELISIH
                  </th>

                  <th className="w-[100px] px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    BUKTI
                  </th>

                  <th className="w-[210px] px-3 py-3 text-center font-poppins text-[11px] font-semibold text-[#64748B]">
                    PERSENTASE PEMBAYARAN
                    <br />
                    DARI TOTAL PIUTANG
                  </th>

                  <th className="w-[70px] px-3 py-3 text-center font-poppins text-[11px] font-semibold text-[#64748B]">
                    AKSI
                  </th>

                </tr>

              </thead>

              {/* BODY */}

              <tbody>

                {dataList.length > 0 ? (

                  dataList.map(
                    (
                      row,
                      index
                    ) => {
                      const selisih =
                        getSelisih(
                          row.saldoAkhirPeriode,
                          row.saldoPembayaran
                        );

                      const percentage =
                        getPersentase(
                          row.saldoAkhirPeriode,
                          row.saldoPembayaran
                        );

                      return (
                        <tr
                          key={
                            row.id
                          }
                          className="
                            border-b
                            border-[#EEF2F6]
                            bg-white
                            last:border-b-0
                          "
                        >

                          {/* NO */}

                          <td className="px-4 py-2 font-poppins text-sm text-[#475569]">
                            {index + 1}
                          </td>

                          {/* CUSTOMER */}

                          <td className="px-3 py-2">

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

                          {/* SALDO AKHIR */}

                          <td className="w-[190px] min-w-0 px-3 py-2">

                            <div
                              className="
                                flex
                                h-10
                                w-full
                                min-w-0
                                items-center
                                overflow-hidden
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
                                    row.saldoAkhirPeriode ??
                                      0
                                  )
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateRow(
                                    row.id,
                                    "saldoAkhirPeriode",
                                    parseNumber(
                                      event.target.value
                                    )
                                  )
                                }
                                className="
                                  w-full
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

                          {/* DIBAYAR */}

                          <td className="px-3 py-2">

                            <Dropdown
                              value={
                                row.dibayar ||
                                ""
                              }
                              placeholder="Pilih"
                              showCheck={false}
                              options={[
                                {
                                  value: "",
                                  label: "Pilih",
                                },
                                {
                                  value: "Ya",
                                  label: "Ya",
                                },
                                {
                                  value: "Tidak",
                                  label: "Tidak",
                                },
                              ]}
                              onChange={(
                                value
                              ) =>
                                updateRow(
                                  row.id,
                                  "dibayar",
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

                          {/* NO BUKTI */}

                          <td className="px-3 py-2">

                            <input
                              type="text"
                              value={
                                row.noBuktiBayar ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                updateRow(
                                  row.id,
                                  "noBuktiBayar",
                                  event.target.value
                                )
                              }
                              placeholder="No bukti"
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

                          {/* SALDO PEMBAYARAN */}

                          <td className="px-3 py-2">

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
                                    row.saldoPembayaran ??
                                      0
                                  )
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateRow(
                                    row.id,
                                    "saldoPembayaran",
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

                          <td className="w-[170px] min-w-0 px-3 py-2">

                            <div
                              className="
                                flex
                                h-10
                                w-full
                                min-w-0
                                items-center
                                overflow-hidden
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
                                  min-w-0
                                  flex-1
                                  overflow-hidden
                                  whitespace-nowrap
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

                          <td className="px-3 py-2">

                            <div className="flex items-center gap-1">

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

                          {/* PERSENTASE */}

                          <td className="px-3 py-2">

                            <div
                              className="
                                flex
                                h-10
                                overflow-hidden
                                rounded-xl
                                border
                                border-[#DCE5EF]
                                bg-[#F8FAFC]
                              "
                            >

                              <span
                                className="
                                  flex
                                  min-w-0
                                  flex-1
                                  items-center
                                  justify-end
                                  px-3
                                  font-poppins
                                  text-sm
                                  text-[#64748B]
                                "
                              >
                                {percentage}
                              </span>

                              <span
                                className="
                                  flex
                                  items-center
                                  border-l
                                  border-[#DCE5EF]
                                  px-3
                                  font-poppins
                                  text-sm
                                  text-[#64748B]
                                "
                              >
                                %
                              </span>

                            </div>

                          </td>

                          {/* DELETE */}

                          <td className="px-3 py-2">

                            <div className="flex justify-center">

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
                                  duration-200
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

                ) : (

                  <tr>

                    <td
                      colSpan={10}
                      className="
                        h-[160px]
                        text-center
                        font-poppins
                        text-sm
                        text-[#94A3B8]
                      "
                    >
                      Belum ada data Prosedur Alternatif.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =================================================
            TAMBAH DATA
        ================================================= */}

        <div className="mt-4 flex justify-center">

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
            SIMPAN
        ================================================= */}

        <div className="mt-5 flex justify-end">

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