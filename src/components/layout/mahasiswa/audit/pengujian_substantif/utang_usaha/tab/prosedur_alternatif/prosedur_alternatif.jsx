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
  `${API_URL}/api/prosedur-alternatif-utang-usaha`;

const BULK_SAVE_ENDPOINT =
  `${API_ENDPOINT}/bulk-save`;

/* =====================================================
   MEMORY CACHE
===================================================== */

const prosedurAlternatifUtangUsahaPageCache =
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
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (
    typeof value === "string"
  ) {
    const cleaned =
      value
        .replace(
          /Rp/gi,
          ""
        )
        .replace(
          /\./g,
          ""
        )
        .replace(
          /,/g,
          "."
        )
        .trim();

    const numberValue =
      Number(cleaned);

    return Number.isFinite(
      numberValue
    )
      ? numberValue
      : 0;
  }

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
   SALDO CUSTOMER
===================================================== */

const getSaldoCustomer = (
  item
) => {
  if (!item) {
    return 0;
  }

  const nestedKonfirmasi =
    item?.konfirmasi_utang_usaha ??
    item?.konfirmasiUtangUsaha ??
    null;

  const nestedRekap =
    item?.rekap_balasan_utang_usaha ??
    item?.rekapBalasanUtangUsaha ??
    item?.rekap_balasan ??
    item?.rekapBalasan ??
    null;

  const candidates = [
    nestedKonfirmasi?.Jumlah,
    nestedKonfirmasi?.jumlah,

    item?.Jumlah,
    item?.jumlah,

    nestedRekap?.konfirmasi_utang_usaha?.Jumlah,
    nestedRekap?.konfirmasi_utang_usaha?.jumlah,

    nestedRekap?.konfirmasiUtangUsaha?.Jumlah,
    nestedRekap?.konfirmasiUtangUsaha?.jumlah,

    nestedRekap?.Jumlah,
    nestedRekap?.jumlah,

    item?.SaldoBukuBesar,
    item?.saldo_buku_besar,
    item?.["Saldo Buku Besar"],
    item?.saldoBukuBesar,

    nestedRekap?.SaldoBukuBesar,
    nestedRekap?.saldo_buku_besar,
    nestedRekap?.["Saldo Buku Besar"],
    nestedRekap?.saldoBukuBesar,

    item?.SaldoAkhirPeriode,
    item?.saldo_akhir_periode,

    nestedRekap?.SaldoAkhirPeriode,
    nestedRekap?.saldo_akhir_periode,

    item?.SaldoAkhir,
    item?.saldo_akhir,

    nestedRekap?.SaldoAkhir,
    nestedRekap?.saldo_akhir,

    item?.SaldoBB,
    item?.saldo_bb,

    nestedRekap?.SaldoBB,
    nestedRekap?.saldo_bb,

    0,
  ];

  for (
    const value of candidates
  ) {
    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      return toNumber(value);
    }
  }

  return 0;
};

/* =====================================================
   NORMALIZE CUSTOMER
===================================================== */

const normalizeCustomer = (
  item,
  utangUsahaId
) => {
  if (!item) {
    return {
      id: null,

      utangUsahaId:
        normalizeId(
          utangUsahaId
        ),

      namaCustomer: "",

      saldoAkhirPeriode: 0,
    };
  }

  const nestedKonfirmasi =
    item?.konfirmasi_utang_usaha ??
    item?.konfirmasiUtangUsaha ??
    null;

  const nestedRekap =
    item?.rekap_balasan_utang_usaha ??
    item?.rekapBalasanUtangUsaha ??
    item?.rekap_balasan ??
    item?.rekapBalasan ??
    null;

  const customerId =
    normalizeId(
      item?.KonfirmasiUtangUsahaID ??
      item?.konfirmasi_utang_usaha_id ??
      item?.KonfirmasiUtangUsahaId ??
      nestedKonfirmasi?.KonfirmasiUtangUsahaID ??
      nestedKonfirmasi?.konfirmasi_utang_usaha_id ??
      nestedRekap?.KonfirmasiUtangUsahaID ??
      nestedRekap?.konfirmasi_utang_usaha_id ??
      item?.id
    );

  const namaCustomer =
    item?.NamaCustomer ??
    item?.nama_customer ??
    item?.NamaPelanggan ??
    item?.nama_pelanggan ??
    nestedKonfirmasi?.NamaCustomer ??
    nestedKonfirmasi?.namaCustomer ??
    nestedKonfirmasi?.nama_customer ??
    nestedKonfirmasi?.NamaPelanggan ??
    nestedKonfirmasi?.nama_pelanggan ??
    nestedRekap?.NamaCustomer ??
    nestedRekap?.nama_customer ??
    nestedRekap?.NamaPelanggan ??
    nestedRekap?.nama_pelanggan ??
    "";

  const resolvedUtangUsahaId =
    normalizeId(
      item?.UtangUsahaID ??
      item?.utang_usaha_id ??
      nestedKonfirmasi?.UtangUsahaID ??
      nestedKonfirmasi?.utang_usaha_id ??
      nestedRekap?.UtangUsahaID ??
      nestedRekap?.utang_usaha_id ??
      utangUsahaId
    );

  return {
    id:
      customerId,

    utangUsahaId:
      resolvedUtangUsahaId,

    namaCustomer:
      namaCustomer,

    saldoAkhirPeriode:
      getSaldoCustomer(item),
  };
};

/* =====================================================
   NORMALIZE PROSEDUR
===================================================== */

const normalizeProsedur = (
  item,
  utangUsahaId
) => {
  const nestedCustomer =
    item?.konfirmasi_utang_usaha ??
    item?.konfirmasiUtangUsaha ??
    item?.rekap_balasan_utang_usaha ??
    item?.rekapBalasanUtangUsaha ??
    item?.rekap_balasan ??
    item?.rekapBalasan ??
    null;

  const prosedurId =
    normalizeId(
      item?.ProsedurAlternatifUtangUsahaID ??
      item?.prosedur_alternatif_utang_usaha_id ??
      item?.ProsedurAlternatifID ??
      item?.prosedur_alternatif_id ??
      item?.id
    );

  const nestedKonfirmasi =
    item?.konfirmasi_utang_usaha ??
    item?.konfirmasiUtangUsaha ??
    null;

  const saldoRaw =
    item?.SaldoAkhir ??
    item?.saldo_akhir ??
    item?.SaldoAkhirPeriode ??
    item?.saldo_akhir_periode ??
    nestedKonfirmasi?.Jumlah ??
    nestedKonfirmasi?.jumlah ??
    nestedCustomer?.Jumlah ??
    nestedCustomer?.jumlah ??
    item?.SaldoBB ??
    item?.saldo_bb ??
    0;

  return {
    id:
      prosedurId ??
      `temp-${Date.now()}-${Math.random()}`,

    prosedurId,

    utangUsahaId:
      normalizeId(
        item?.UtangUsahaID ??
        item?.utang_usaha_id ??
        utangUsahaId
      ),

    konfirmasiId:
      normalizeId(
        item?.KonfirmasiUtangUsahaID ??
        item?.konfirmasi_utang_usaha_id ??
        nestedKonfirmasi?.KonfirmasiUtangUsahaID ??
        nestedKonfirmasi?.konfirmasi_utang_usaha_id ??
        nestedCustomer?.KonfirmasiUtangUsahaID ??
        nestedCustomer?.konfirmasi_utang_usaha_id
      ) ?? "",

    originalKonfirmasiId:
      normalizeId(
        item?.KonfirmasiUtangUsahaID ??
        item?.konfirmasi_utang_usaha_id ??
        nestedKonfirmasi?.KonfirmasiUtangUsahaID ??
        nestedKonfirmasi?.konfirmasi_utang_usaha_id ??
        nestedCustomer?.KonfirmasiUtangUsahaID ??
        nestedCustomer?.konfirmasi_utang_usaha_id
      ) ?? "",

    namaCustomer:
      item?.NamaCustomer ??
      item?.nama_customer ??
      nestedKonfirmasi?.NamaCustomer ??
      nestedKonfirmasi?.namaCustomer ??
      nestedKonfirmasi?.nama_customer ??
      nestedCustomer?.NamaCustomer ??
      nestedCustomer?.nama_customer ??
      nestedCustomer?.NamaPelanggan ??
      nestedCustomer?.nama_pelanggan ??
      "",

    saldoAkhirPeriode:
      toNumber(
        saldoRaw
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
   NUMBER HELPERS
===================================================== */

const parseNumber = (
  value
) => {
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

const formatNumber = (
  value
) => {
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

const escapeHtml = (
  value
) => {
  return String(
    value ?? ""
  )
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
};

/* =====================================================
   PAGE
===================================================== */

export default function ProsedurAlternatifUtangUsahaPage({
  jwbKasusId: jwbKasusIdProp,
  refetchToken = 0,
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
      ? prosedurAlternatifUtangUsahaPageCache.get(
          cacheKey
        ) || null
      : null;

  /* =====================================================
     UTANG USAHA
  ===================================================== */

  const [
    utangUsahaId,
    setUtangUsahaId,
  ] = useState(
    () =>
      initialCache?.utangUsahaId ?? null
  );

  /* =====================================================
     CUSTOMER SOURCE
  ===================================================== */

  const [
    customerOptions,
    setCustomerOptions,
  ] = useState(
    () =>
      initialCache?.customerOptions ?? []
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
      nextUtangUsahaId,
      nextCustomerOptions,
      nextDataList
    ) => {
      if (!cacheKey) {
        return;
      }

      prosedurAlternatifUtangUsahaPageCache.set(
        cacheKey,
        {
          utangUsahaId:
            nextUtangUsahaId,

          customerOptions:
            nextCustomerOptions,

          dataList:
            nextDataList,
        }
      );
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

        return {
          utangUsahaId: null,
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
            "Gagal mengambil data Prosedur Alternatif Utang Usaha."
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

        prosedurAlternatifUtangUsahaPageCache.set(
          String(activeId),
          emptyData
        );

        setUtangUsahaId(null);
        setCustomerOptions([]);
        setDataList([]);

        return emptyData;
      }

      const activeUtangUsahaId =
        normalizeId(
          activeUtangUsaha?.UtangUsahaID ??
          activeUtangUsaha?.utang_usaha_id ??
          activeUtangUsaha?.id
        );

      /* =================================================
         MASTER CUSTOMER
      ================================================= */

      const rawAllCustomers =
        Array.isArray(
          activeUtangUsaha
            ?.konfirmasi_utang_usaha
        )
          ? activeUtangUsaha
              .konfirmasi_utang_usaha
          : Array.isArray(
              activeUtangUsaha
                ?.konfirmasiUtangUsaha
            )
          ? activeUtangUsaha
              .konfirmasiUtangUsaha
          : [];

      const rawAvailableCustomers =
        Array.isArray(
          activeUtangUsaha
            ?.konfirmasi_utang_usaha_tersedia
        )
          ? activeUtangUsaha
              .konfirmasi_utang_usaha_tersedia
          : Array.isArray(
              activeUtangUsaha
                ?.konfirmasiUtangUsahaTersedia
            )
          ? activeUtangUsaha
              .konfirmasiUtangUsahaTersedia
          : [];

      const rawRekap =
        Array.isArray(
          activeUtangUsaha
            ?.rekap_balasan_utang_usaha
        )
          ? activeUtangUsaha
              .rekap_balasan_utang_usaha
          : Array.isArray(
              activeUtangUsaha
                ?.rekapBalasanUtangUsaha
            )
          ? activeUtangUsaha
              .rekapBalasanUtangUsaha
          : Array.isArray(
              activeUtangUsaha
                ?.rekap_balasan
            )
          ? activeUtangUsaha
              .rekap_balasan
          : Array.isArray(
              activeUtangUsaha
                ?.rekapBalasan
            )
          ? activeUtangUsaha
              .rekapBalasan
          : [];

      const rawProsedur =
        Array.isArray(
          activeUtangUsaha
            ?.prosedur_alternatif
        )
          ? activeUtangUsaha
              .prosedur_alternatif
          : Array.isArray(
              activeUtangUsaha
                ?.prosedurAlternatif
            )
          ? activeUtangUsaha
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
              activeUtangUsahaId
            );

          if (
            !normalized.id ||
            !normalized.namaCustomer
          ) {
            return;
          }

          const key =
            String(
              normalized.id
            );

          const existing =
            customerMap.get(
              key
            );

          if (!existing) {
            customerMap.set(
              key,
              normalized
            );

            return;
          }

          const existingSaldo =
            toNumber(
              existing
                .saldoAkhirPeriode
            );

          const newSaldo =
            toNumber(
              normalized
                .saldoAkhirPeriode
            );

          if (
            existingSaldo === 0 &&
            newSaldo !== 0
          ) {
            customerMap.set(
              key,
              normalized
            );
          }
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
              ?.konfirmasi_utang_usaha ??
            rekapItem
              ?.konfirmasiUtangUsaha ??
            null;

          if (
            nestedCustomer
          ) {
            addCustomerToMap(
              nestedCustomer
            );
          }

          addCustomerToMap(
            rekapItem
          );
        }
      );

      rawProsedur.forEach(
        (prosedurItem) => {
          const nestedCustomer =
            prosedurItem
              ?.konfirmasi_utang_usaha ??
            prosedurItem
              ?.konfirmasiUtangUsaha ??
            prosedurItem
              ?.rekap_balasan_utang_usaha ??
            prosedurItem
              ?.rekapBalasanUtangUsaha ??
            prosedurItem
              ?.rekap_balasan ??
            prosedurItem
              ?.rekapBalasan ??
            null;

          if (
            !nestedCustomer
          ) {
            return;
          }

          const saldoDariRekap =
            getSaldoCustomer(
              nestedCustomer
            );

          const saldoDariProsedur =
            prosedurItem?.SaldoAkhir ??
            prosedurItem?.saldo_akhir ??
            prosedurItem?.SaldoAkhirPeriode ??
            prosedurItem?.saldo_akhir_periode ??
            prosedurItem?.SaldoBB ??
            prosedurItem?.saldo_bb;

          const saldoFinal =
            saldoDariRekap !== 0
              ? saldoDariRekap
              : toNumber(
                  saldoDariProsedur
                );

          addCustomerToMap({
            ...nestedCustomer,

            Jumlah:
              saldoFinal,
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
                activeUtangUsahaId
              )
          )
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
        utangUsahaId:
          activeUtangUsahaId,

        customerOptions:
          allCustomers,

        dataList:
          normalizedProsedur,
      };

      prosedurAlternatifUtangUsahaPageCache.set(
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
          setUtangUsahaId(null);
          setCustomerOptions([]);
          setDataList([]);

          return;
        }

        const cached =
          prosedurAlternatifUtangUsahaPageCache.get(
            String(
              activeJwbKasusId
            )
          );

        if (cached) {
          setUtangUsahaId(
            cached.utangUsahaId ?? null
          );

          setCustomerOptions(
            cached.customerOptions ?? []
          );

          setDataList(
            cached.dataList ?? []
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
            "Gagal memuat Prosedur Alternatif Utang Usaha:",
            error
          );

          showErrorAlert(
            "Gagal Memuat Data",
            error?.message ||
              "Data Prosedur Alternatif Utang Usaha tidak dapat dimuat."
          );
        }
      };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    activeJwbKasusId,
    refetchToken,
  ]);

  /* =====================================================
     CACHE CURRENT EDITS
  ===================================================== */

  useEffect(() => {
    if (!cacheKey) {
      return;
    }

    saveCurrentCache(
      utangUsahaId,
      customerOptions,
      dataList
    );
  }, [
    cacheKey,
    utangUsahaId,
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
  ===================================================== */

  const getCustomerOptionsForRow =
    (currentRow) => {
      const options =
        customerOptions.map(
          (customer) => ({
            ...customer,
          })
        );

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

            utangUsahaId:
              currentRow
                .utangUsahaId,

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
        "Customer tidak tersedia."
      );

      return;
    }

    const saldoCustomer =
      toNumber(
        customer.saldoAkhirPeriode
      );

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

              utangUsahaId:
                utangUsahaId,

              konfirmasiId:
                customer.id,

              namaCustomer:
                customer.namaCustomer,

              saldoAkhirPeriode:
                saldoCustomer,
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
      if (!utangUsahaId) {
        showErrorAlert(
          "Utang Usaha Belum Tersedia",
          "Data Utang Usaha untuk tugas ini belum tersedia."
        );

        return;
      }

      const newData = {
        id:
          `temp-${Date.now()}`,

        prosedurId:
          null,

        utangUsahaId:
          utangUsahaId,

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
            utangUsahaId,
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
            "Data Prosedur Alternatif Utang Usaha berhasil dihapus."
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
              "Gagal menghapus data Prosedur Alternatif Utang Usaha."
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
          "Data Prosedur Alternatif Utang Usaha berhasil dihapus."
        );
      } catch (error) {
        console.error(
          "Gagal menghapus Prosedur Alternatif Utang Usaha:",
          error
        );

        showErrorAlert(
          "Gagal Menghapus",
          error?.message ||
            "Data Prosedur Alternatif Utang Usaha gagal dihapus."
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
     BUILD BULK SAVE FORM DATA
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

          if (
            row.prosedurId
          ) {
            form.append(
              `${prefix}[ProsedurAlternatifUtangUsahaID]`,
              String(
                row.prosedurId
              )
            );
          }

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

          form.append(
            `${prefix}[KonfirmasiUtangUsahaID]`,
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

  const bulkSaveProsedur =
    async (
      rows,
      activeUtangUsahaId
    ) => {
      const changedExistingRows =
        rows.filter(
          (row) => {
            if (
              !row.prosedurId
            ) {
              return false;
            }

            const originalId =
              normalizeId(
                row.originalKonfirmasiId
              );

            const currentId =
              normalizeId(
                row.konfirmasiId
              );

            return (
              String(
                originalId ?? ""
              ) !==
              String(
                currentId ?? ""
              )
            );
          }
        );

      for (
        const row of changedExistingRows
      ) {
        const response =
          await fetchWithAuth(
            `${API_ENDPOINT}/${encodeURIComponent(
              row.prosedurId
            )}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                KonfirmasiUtangUsahaID:
                  null,
              }),
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
              `Gagal menyiapkan perubahan Customer pada Prosedur Alternatif ID ${row.prosedurId}.`
            )
          );
        }
      }

      const form =
        buildBulkSaveFormData(
          rows,
          activeUtangUsahaId
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
            "Prosedur Alternatif Utang Usaha gagal disimpan."
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
            "Prosedur Alternatif Utang Usaha gagal disimpan."
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
          "Belum ada data Prosedur Alternatif Utang Usaha."
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
          "Utang Usaha Belum Tersedia",
          "UtangUsahaID untuk tugas ini belum tersedia."
        );

        return;
      }

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

        const result =
          await bulkSaveProsedur(
            dataList,
            activeUtangUsahaId
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
            "Prosedur Alternatif Utang Usaha berhasil disimpan ke database."
        );
      } catch (error) {
        console.error(
          "Gagal menyimpan Prosedur Alternatif Utang Usaha:",
          error
        );

        showErrorAlert(
          "Gagal Menyimpan",
          error?.message ||
            "Prosedur Alternatif Utang Usaha gagal disimpan."
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
        "Kode Bukti Bayar",
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
            row.namaCustomer || "-",
            row.saldoAkhirPeriode || 0,
            row.dibayar || "-",
            row.noBuktiBayar || "-",
            Number(
              row.saldoPembayaran || 0
            ),
            getSelisih(
              row.saldoAkhirPeriode,
              row.saldoPembayaran
            ),
            row.namaBukti || "-",
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
        "prosedur-alternatif-utang-usaha.csv";

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
                  <td>${index + 1}</td>
                  <td>${escapeHtml(
                    row.namaCustomer || "-"
                  )}</td>
                  <td>Rp ${formatNumber(
                    row.saldoAkhirPeriode || 0
                  )}</td>
                  <td>${escapeHtml(
                    row.dibayar || "-"
                  )}</td>
                  <td>${escapeHtml(
                    row.noBuktiBayar || "-"
                  )}</td>
                  <td style="text-align:left;">
                    Rp ${formatNumber(
                      row.saldoPembayaran || 0
                    )}
                  </td>
                  <td style="text-align:left;">
                    Rp ${formatNumber(
                      selisih
                    )}
                  </td>
                  <td>${escapeHtml(
                    row.namaBukti || "-"
                  )}</td>
                  <td>${percentage} %</td>
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
              Prosedur Alternatif Utang Usaha
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
              Prosedur Alternatif Utang Usaha
            </h2>

            <table>

              <thead>

                <tr>

                  <th>No</th>
                  <th>Nama Customer</th>
                  <th>Saldo Akhir Periode</th>
                  <th>Dibayar/Tidak</th>
                  <th>Kode Bukti Bayar</th>
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
    <div
      className="
        w-full
        min-w-0
        overflow-visible
        pb-32
        font-poppins
        text-[#334155]
      "
    >

      {/* =====================================================
          ALERT
      ===================================================== */}

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

      {/* =====================================================
          DELETE CONFIRM
      ===================================================== */}

      <ConfirmationPopup
        isOpen={
          deleteModalOpen
        }
        message="Apakah Anda yakin ingin menghapus data Prosedur Alternatif Utang Usaha?"
        subText={
          deletingData
            ? deletingData.namaCustomer ||
              "Data Prosedur Alternatif Utang Usaha"
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

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          w-full
          min-w-0
          overflow-visible
          rounded-xl
          border
          border-[#DCE5EF]
          bg-white
          p-4
        "
      >

        {/* =====================================================
            EXPORT
        ===================================================== */}

        <div className="flex justify-end">

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

              <span className="flex items-center gap-2">

                <Download
                  size={15}
                />

                Export

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

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div
          className="
            mt-4
            w-full
            min-w-0
            overflow-x-auto
            overflow-y-visible
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

            <thead className="bg-[#F8FAFC]">

              <tr className="border-b border-[#DCE5EF]">

                <th className="w-[55px] min-w-[55px] px-4 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                  NO
                </th>

                <th className="w-[240px] min-w-[240px] max-w-[240px] px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                  NAMA CUSTOMER
                </th>

                <th className="w-max min-w-[210px] whitespace-nowrap px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                  SALDO AKHIR PERIODE
                </th>

                <th className="w-[150px] min-w-[150px] px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                  DIBAYAR/TIDAK
                </th>

                <th className="w-[180px] min-w-[180px] px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                  KODE BUKTI BAYAR
                </th>

                <th className="w-max min-w-[210px] whitespace-nowrap px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                  SALDO PEMBAYARAN
                </th>

                <th className="w-max min-w-[210px] whitespace-nowrap px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                  SELISIH
                </th>

                <th className="w-[100px] min-w-[100px] px-3 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                  BUKTI
                </th>

                <th className="w-[210px] min-w-[210px] px-3 py-3 text-center font-poppins text-[11px] font-semibold text-[#64748B]">
                  PERSENTASE PEMBAYARAN
                  <br />
                  DARI TOTAL UTANG
                </th>

                <th className="w-[70px] min-w-[70px] px-3 py-3 text-center font-poppins text-[11px] font-semibold text-[#64748B]">
                  AKSI
                </th>

              </tr>

            </thead>

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

                    const formattedSaldoAkhir =
                      formatNumber(
                        row.saldoAkhirPeriode ?? 0
                      );

                    const formattedSaldoPembayaran =
                      formatNumber(
                        row.saldoPembayaran ?? 0
                      );

                    const formattedSelisih =
                      formatNumber(
                        selisih
                      );

                    return (
                      <tr
                        key={row.id}
                        className="
                          border-b
                          border-[#EEF2F6]
                          bg-white
                          last:border-b-0
                        "
                      >

                        {/* NO */}

                        <td className="w-[55px] min-w-[55px] px-4 py-2 font-poppins text-sm text-[#475569]">
                          {index + 1}
                        </td>

                        {/* CUSTOMER */}

                        <td className="w-[240px] min-w-[240px] max-w-[240px] px-3 py-2">

                          <div className="w-[216px] min-w-[216px] max-w-[216px]">

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
                                w-full
                                min-w-0
                                [&>button]:h-10
                                [&>button]:min-h-10
                                [&>button]:w-full
                                [&>button]:min-w-0
                                [&>button]:rounded-xl
                                [&>button]:px-3
                              "
                            />

                          </div>

                        </td>

                        {/* SALDO AKHIR PERIODE */}

                        <td className="w-max min-w-[210px] whitespace-nowrap px-3 py-2">

                          <div
                            className="
                              inline-flex
                              h-10
                              min-w-[190px]
                              w-max
                              max-w-none
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
                                whitespace-nowrap
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
                                formattedSaldoAkhir
                              }
                              size={
                                Math.max(
                                  1,
                                  formattedSaldoAkhir.length +
                                    1
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
                                [field-sizing:content]
                                min-w-[80px]
                                w-auto
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

                        {/* DIBAYAR */}

                        <td className="w-[150px] min-w-[150px] px-3 py-2">

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
                              w-full
                              [&>button]:h-10
                              [&>button]:min-h-10
                              [&>button]:w-full
                              [&>button]:rounded-xl
                              [&>button]:px-3
                            "
                          />

                        </td>

                        {/* NO BUKTI */}

                        <td className="w-[180px] min-w-[180px] px-3 py-2">

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
                              min-w-[150px]
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

                        <td className="w-max min-w-[210px] whitespace-nowrap px-3 py-2">

                          <div
                            className="
                              inline-flex
                              h-10
                              min-w-[190px]
                              w-max
                              max-w-none
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
                                whitespace-nowrap
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
                                formattedSaldoPembayaran
                              }
                              size={
                                Math.max(
                                  1,
                                  formattedSaldoPembayaran.length +
                                    1
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
                                [field-sizing:content]
                                min-w-[80px]
                                w-auto
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

                        {/* SELISIH */}

                        <td className="w-max min-w-[210px] whitespace-nowrap px-3 py-2">

                          <div
                            className="
                              inline-flex
                              h-10
                              min-w-[190px]
                              w-max
                              max-w-none
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
                                whitespace-nowrap
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
                                whitespace-nowrap
                                pl-3
                                font-poppins
                                text-sm
                                text-[#64748B]
                              "
                            >
                              {formattedSelisih}
                            </span>

                          </div>

                        </td>

                        {/* BUKTI */}

                        <td className="w-[100px] min-w-[100px] px-3 py-2">

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

                        <td className="w-[210px] min-w-[210px] px-3 py-2">

                          <div
                            className="
                              flex
                              h-10
                              w-full
                              min-w-[180px]
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

                        <td className="w-[70px] min-w-[70px] px-3 py-2">

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
                    Belum ada data Prosedur Alternatif Utang Usaha.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* =====================================================
            TAMBAH DATA
        ===================================================== */}

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

        {/* =====================================================
            SIMPAN
        ===================================================== */}

        <div className="mt-5 flex justify-end pb-2">

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