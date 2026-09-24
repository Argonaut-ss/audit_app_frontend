"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useSearchParams,
} from "next/navigation";

import { Search } from "lucide-react";
import SaveButton from "@/components/button/save_button";
import AlertSuccess from "@/components/alert/alert_success";

/* =====================================================
   API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const API_ENDPOINT =
  `${API_URL}/api/uji-mutasi-persediaan`;

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
   FORMAT
===================================================== */

const formatNumber = (value) => {
  const number = Number(value || 0);

  return number.toLocaleString("id-ID");
};

const parseNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  const cleanedValue = String(value)
    .replace(/\./g, "")
    .replace(/,/g, "");

  return Number(cleanedValue) || 0;
};

const numberInputValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  const numericValue = parseNumber(value);

  if (Number.isNaN(numericValue)) {
    return "";
  }

  return numericValue.toLocaleString("id-ID");
};

/* =====================================================
   MAP BACKEND DATA
===================================================== */

const mapBackendRow = (item) => ({
  id:
    item.UjiMutasiID ??
    item.id ??
    item.StokOpnameID ??
    null,

  ujiMutasiId:
    item.UjiMutasiID ??
    item.id ??
    null,

  stokOpnameId:
    item.StokOpnameID ??
    item.stokOpnameId,

  persediaanId:
    item.PersediaanID ??
    item.persediaanId ??
    null,

  nama:
    item.NamaPersediaan ??
    item.nama ??
    "",

  satuan:
    item.Satuan ??
    item.satuan ??
    "",

  saldoNeraca: parseNumber(
    item.SaldoNeraca ??
    item.saldoNeraca
  ),

  saldoStokOpname: parseNumber(
    item.SaldoStokOpname ??
    item.saldoStokOpname ??
    0
  ),

  keluar: parseNumber(
    item.Keluar ??
    item.keluar
  ),

  rusak: parseNumber(
    item.Rusak ??
    item.rusak
  ),

  masuk: parseNumber(
    item.Masuk ??
    item.masuk
  ),

  saldoAuditSblm: parseNumber(
    item.SaldoAuditSblm ??
    item.saldoAuditSblm
  ),

  saldoAkhirSblm: parseNumber(
    item.SaldoAkhirSblm ??
    item.saldoAkhirSblm
  ),

  saldoAuditSdh: parseNumber(
    item.SaldoAuditSdh ??
    item.saldoAuditSdh
  ),

  saldoAkhirSdh: parseNumber(
    item.SaldoAkhirSdh ??
    item.saldoAkhirSdh
  ),

  keterangan:
    item.Keterangan ??
    item.keterangan ??
    "",
});

const blankEditableValue = "";

const buildSaveErrorMessage = (result, response) => {
  const message =
    result?.message ||
    result?.error ||
    response?.statusText ||
    "Gagal menyimpan data Uji Mutasi.";

  const lowerMessage = String(message).toLowerCase();

  if (
    lowerMessage.includes("unknown column") ||
    lowerMessage.includes("persediaanid") ||
    lowerMessage.includes("field list") ||
    lowerMessage.includes("column not found") ||
    lowerMessage.includes("sqlstate")
  ) {
    return "Data tidak bisa disimpan karena skema backend Uji Mutasi belum sesuai dengan tabel yang aktif di database.";
  }

  return message;
};

const normalizeRowForSave = (row, persediaanId = null) => {
  const stokOpnameId = Number(
    row.stokOpnameId ?? row.id ?? 0
  );

  return {
    ...(persediaanId !== null && persediaanId !== undefined && Number(persediaanId) > 0
      ? {
          PersediaanID: Number(persediaanId),
        }
      : {}),
    ...(stokOpnameId > 0
      ? {
          StokOpnameID: stokOpnameId,
        }
      : {}),
    SaldoStokOpname: parseNumber(row.saldoStokOpname),
    Keluar: parseNumber(row.keluar),
    Rusak: parseNumber(row.rusak),
    Masuk: parseNumber(row.masuk),
    Keterangan: row.keterangan ?? "",
  };
};

const mapStokOpnameRow = (item) => ({
  ...mapBackendRow({
    ...item,
    UjiMutasiID: null,
    StokOpnameID: item.StokOpnameID,
    NamaPersediaan: item.NamaPersediaan,
    Satuan: item.Satuan,
    SaldoNeraca: item.SaldoNeraca,
    SaldoStokOpname: item.SaldoStokOpname ?? 0,
    Keluar: 0,
    Rusak: 0,
    Masuk: 0,
    SaldoAuditSblm: 0,
    SaldoAkhirSblm: 0,
    SaldoAuditSdh: 0,
    SaldoAkhirSdh: 0,
    Keterangan: blankEditableValue,
  }),
  persediaanId: item.PersediaanID ?? null,
  ujiMutasiId: null,
});

/* =====================================================
   PAGE
===================================================== */

export default function UjiMutasiTab({ auditId: propAuditId }) {
  const searchParams = useSearchParams();
  const { id: routeAuditId } = useParams();
  const auditId = propAuditId ?? routeAuditId;

  /* =====================================================
     PERSEDIAAN ID

     Backend Uji Mutasi saat ini masih memerlukan
     PersediaanID untuk index/update bulk.
     Karena kita tidak boleh mengubah BE,
     FE harus resolve PersediaanID dari audit yang aktif.
  ===================================================== */

  const persediaanId =
    searchParams.get("PersediaanID") ||
    searchParams.get("persediaanId") ||
    searchParams.get("persediaan_id");

  const [resolvedPersediaanId, setResolvedPersediaanId] = useState(null);

  const resolvePersediaanIdFromAudit = useCallback(async () => {
    if (!auditId) {
      return null;
    }

    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/persediaan/${encodeURIComponent(auditId)}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal mengambil data Persediaan."
        );
      }

      return (
        result?.data?.PersediaanID ??
        result?.data?.persediaanId ??
        null
      );
    } catch (error) {
      console.error(
        "RESOLVE PERSEDIAAN ID ERROR:",
        error
      );
      return null;
    }
  }, [auditId]);

  useEffect(() => {
    let isMounted = true;

    const syncResolvedPersediaanId = async () => {
      if (persediaanId) {
        if (isMounted) {
          setResolvedPersediaanId(persediaanId);
        }
        return;
      }

      const resolvedId = await resolvePersediaanIdFromAudit();

      if (isMounted) {
        setResolvedPersediaanId(resolvedId);
      }
    };

    syncResolvedPersediaanId();

    return () => {
      isMounted = false;
    };
  }, [auditId, persediaanId, resolvePersediaanIdFromAudit]);

  const effectivePersediaanId =
    resolvedPersediaanId || persediaanId;

  /* =====================================================
     STATE
  ===================================================== */

  const [activeMode, setActiveMode] =
    useState("sebelum");

  const [search, setSearch] =
    useState("");

  const [rows, setRows] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [showSuccessAlert, setShowSuccessAlert] =
    useState(false);

  /* =====================================================
     GET AUTH TOKEN
  ===================================================== */

  const getToken = () => {
    if (
      typeof window === "undefined"
    ) {
      return null;
    }

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token")
    );
  };

  /* =====================================================
     FETCH DATA

     Karena backend Uji Mutasi saat ini masih memiliki kontrak
     yang berulang ke PersediaanID, sedangkan tabel aktual
     hanya memiliki StokOpnameID, maka halaman ini memuat item
     dari endpoint Stok Opname lalu memetakan ke bentuk Uji Mutasi.
  ===================================================== */

  const fetchUjiMutasi = useCallback(
    async () => {
      if (!effectivePersediaanId) {
        setRows([]);
        setErrorMessage("");
        return [];
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const token = getToken();

        const stokOpnameResponse = await fetch(
          `${API_URL}/api/stok-opname-persediaan?PersediaanID=${encodeURIComponent(
            effectivePersediaanId
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

        const stokOpnameResult = await stokOpnameResponse.json();

        if (!stokOpnameResponse.ok) {
          throw new Error(
            stokOpnameResult?.message ||
              "Gagal mengambil data stok opname."
          );
        }

        const stokOpnameData = Array.isArray(stokOpnameResult?.data)
          ? stokOpnameResult.data
          : Array.isArray(stokOpnameResult)
            ? stokOpnameResult
            : [];

        if (stokOpnameData.length === 0) {
          setRows([]);
          return [];
        }

        const existingUjiMutasiResponse = await fetch(
          `${API_ENDPOINT}?PersediaanID=${encodeURIComponent(
            effectivePersediaanId
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

        const existingUjiMutasiResult =
          await existingUjiMutasiResponse.json();

        const existingRecords = Array.isArray(existingUjiMutasiResult?.data)
          ? existingUjiMutasiResult.data
          : Array.isArray(existingUjiMutasiResult)
            ? existingUjiMutasiResult
            : [];

        const existingByStokOpnameId = new Map(
          existingRecords.map((record) => {
            const stokOpnameId =
              record.StokOpnameID ?? record.stokOpnameId;

            return [Number(stokOpnameId), record];
          })
        );

        const mappedRows = stokOpnameData.map((stokOpnameItem) => {
          const stokOpnameId =
            stokOpnameItem.StokOpnameID ??
            stokOpnameItem.stokOpnameId;

          const existingRecord =
            stokOpnameId !== undefined &&
            stokOpnameId !== null
              ? existingByStokOpnameId.get(Number(stokOpnameId))
              : null;

          if (existingRecord) {
            return mapBackendRow(existingRecord);
          }

          return mapStokOpnameRow(stokOpnameItem);
        });

        setRows(mappedRows);
        return mappedRows;
      } catch (error) {
        console.error(
          "FETCH UJI MUTASI ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
            "Gagal mengambil data Uji Mutasi."
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    [effectivePersediaanId]
  );

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) {
        return;
      }

      await fetchUjiMutasi();
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchUjiMutasi]);

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredRows = useMemo(() => {
    const keyword =
      search
        .trim()
        .toLowerCase();

    if (!keyword) {
      return rows;
    }

    return rows.filter(
      (row) =>
        String(
          row.nama || ""
        )
          .toLowerCase()
          .includes(keyword)
    );
  }, [rows, search]);

  /* =====================================================
     DISPLAY VALUES
     
     Nilai hasil audit berasal dari BE.
  ===================================================== */

  const rowsWithComputedValues =
    useMemo(() => {
      return filteredRows.map(
        (row) => {
          const saldoStokOpname = parseNumber(
            row.saldoStokOpname
          );
          const keluar = parseNumber(
            row.keluar
          );
          const rusak = parseNumber(
            row.rusak
          );
          const masuk = parseNumber(
            row.masuk
          );
          const saldoNeraca = parseNumber(
            row.saldoNeraca
          );

          const hasAnyEditableInput = [
            row.saldoStokOpname,
            row.keluar,
            row.rusak,
            row.masuk,
          ].some((value) => {
            if (
              value === null ||
              value === undefined ||
              value === ""
            ) {
              return false;
            }

            const normalized = String(value).trim();
            return normalized !== "" && Number(normalized) !== 0;
          });

          if (!hasAnyEditableInput) {
            return {
              ...row,
              saldoPerUjiMutasi: 0,
              selisihMutasi: 0,
            };
          }

          const saldoAuditSblm =
            saldoStokOpname -
            keluar -
            rusak +
            masuk;

          const saldoAkhirSblm =
            saldoAuditSblm -
            saldoNeraca;

          const saldoAuditSdh =
            saldoStokOpname +
            keluar +
            rusak -
            masuk;

          const saldoAkhirSdh =
            saldoAuditSdh -
            saldoNeraca;

          let saldoPerUjiMutasi = 0;
          let selisihMutasi = 0;

          if (
            activeMode ===
            "sebelum"
          ) {
            saldoPerUjiMutasi =
              saldoAuditSblm;

            selisihMutasi =
              saldoAkhirSblm;
          }

          if (
            activeMode ===
            "sesudah"
          ) {
            saldoPerUjiMutasi =
              saldoAuditSdh;

            selisihMutasi =
              saldoAkhirSdh;
          }

          return {
            ...row,
            saldoPerUjiMutasi,
            selisihMutasi,
          };
        }
      );
    }, [
      filteredRows,
      activeMode,
    ]);

  /* =====================================================
     TOTAL
  ===================================================== */

  const totalSaldoNeraca =
    useMemo(
      () =>
        filteredRows.reduce(
          (sum, row) =>
            sum +
            parseNumber(
              row.saldoNeraca
            ),
          0
        ),
      [filteredRows]
    );

  const totalSaldoStokOpname =
    useMemo(
      () =>
        filteredRows.reduce(
          (sum, row) =>
            sum +
            parseNumber(
              row.saldoStokOpname
            ),
          0
        ),
      [filteredRows]
    );

  const totalKeluar =
    useMemo(
      () =>
        filteredRows.reduce(
          (sum, row) =>
            sum +
            parseNumber(
              row.keluar
            ),
          0
        ),
      [filteredRows]
    );

  const totalRusak =
    useMemo(
      () =>
        filteredRows.reduce(
          (sum, row) =>
            sum +
            parseNumber(
              row.rusak
            ),
          0
        ),
      [filteredRows]
    );

  const totalMasuk =
    useMemo(
      () =>
        filteredRows.reduce(
          (sum, row) =>
            sum +
            parseNumber(
              row.masuk
            ),
          0
        ),
      [filteredRows]
    );

  const totalSaldoPerUjiMutasi =
    useMemo(
      () =>
        rowsWithComputedValues.reduce(
          (sum, row) =>
            sum +
            Number(
              row.saldoPerUjiMutasi ||
                0
            ),
          0
        ),
      [rowsWithComputedValues]
    );

  const totalSelisih =
    useMemo(
      () =>
        rowsWithComputedValues.reduce(
          (sum, row) =>
            sum +
            Number(
              row.selisihMutasi ||
                0
            ),
          0
        ),
      [rowsWithComputedValues]
    );

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleInputChange = (
    id,
    field,
    value
  ) => {
    let newValue = value;

    if (
      field ===
        "saldoStokOpname" ||
      field === "keluar" ||
      field === "rusak" ||
      field === "masuk"
    ) {
      newValue =
        value.replace(
          /[^\d]/g,
          ""
        );
    }

    setRows(
      (currentRows) =>
        currentRows.map(
          (row) => {
            if (
              row.id !== id
            ) {
              return row;
            }

            return {
              ...row,
              [field]:
                newValue,
            };
          }
        )
    );
  };

  /* =====================================================
     ADD DATA
     
     Uji Mutasi dibuat berdasarkan
     StokOpnameID dari BE.
  ===================================================== */

  /* =====================================================
     SAVE
     
     PUT:
     /api/uji-mutasi-persediaan

     BE tetap menggunakan UjiMutasiID
     dan StokOpnameID yang sudah ada.
  ===================================================== */

  const handleSave = async () => {
    if (!effectivePersediaanId) {
      setErrorMessage("");
      return;
    }

    if (
      rows.length === 0
    ) {
      setErrorMessage(
        "Tidak ada data Uji Mutasi untuk disimpan."
      );

      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const token =
        getToken();

      const existingUjiMutasiResponse = await fetch(
        `${API_ENDPOINT}?PersediaanID=${encodeURIComponent(
          effectivePersediaanId
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const existingUjiMutasiResult =
        await existingUjiMutasiResponse.json();

      const existingRecords = Array.isArray(existingUjiMutasiResult?.data)
        ? existingUjiMutasiResult.data
        : Array.isArray(existingUjiMutasiResult)
          ? existingUjiMutasiResult
          : [];

      const existingByStokOpnameId = new Map(
        existingRecords.map((record) => {
          const stokOpnameId =
            record.StokOpnameID ?? record.stokOpnameId;

          return [Number(stokOpnameId), record];
        })
      );

      const saveRows = rows.filter(
        (row) => Number(row.stokOpnameId ?? row.id ?? 0) > 0
      );

      for (const row of saveRows) {
        const stokOpnameId = Number(row.stokOpnameId ?? row.id ?? 0);
        const existingRecord = existingByStokOpnameId.get(stokOpnameId);
        const ujiMutasiId =
          existingRecord?.UjiMutasiID ?? existingRecord?.ujiMutasiId ?? null;

        const payload = normalizeRowForSave(row, effectivePersediaanId);

        if (ujiMutasiId) {
          const response = await fetch(API_ENDPOINT, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
            body: JSON.stringify({
              PersediaanID: Number(effectivePersediaanId),
              rows: [
                {
                  id: Number(ujiMutasiId),
                  ...payload,
                },
              ],
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              buildSaveErrorMessage(result, response)
            );
          }

          continue;
        }

        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            PersediaanID: Number(effectivePersediaanId),
            ...payload,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          if (
            response.status === 409 ||
            String(result?.message || "")
              .toLowerCase()
              .includes("sudah tersedia")
          ) {
            const refreshedResponse = await fetch(
              `${API_ENDPOINT}?PersediaanID=${encodeURIComponent(
                effectivePersediaanId
              )}`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  ...(token
                    ? {
                        Authorization: `Bearer ${token}`,
                      }
                    : {}),
                },
              }
            );

            const refreshedResult = await refreshedResponse.json();
            const freshRecords = Array.isArray(refreshedResult?.data)
              ? refreshedResult.data
              : Array.isArray(refreshedResult)
                ? refreshedResult
                : [];

            const refreshedRecord = freshRecords.find(
              (item) =>
                Number(item.StokOpnameID ?? item.stokOpnameId) === stokOpnameId
            );

            if (refreshedRecord) {
              const fallbackResponse = await fetch(API_ENDPOINT, {
                method: "PUT",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  ...(token
                    ? {
                        Authorization: `Bearer ${token}`,
                      }
                    : {}),
                },
                body: JSON.stringify({
                  PersediaanID: Number(effectivePersediaanId),
                  rows: [
                    {
                      id: Number(
                        refreshedRecord.UjiMutasiID ?? refreshedRecord.ujiMutasiId
                      ),
                      ...normalizeRowForSave(row, effectivePersediaanId),
                    },
                  ],
                }),
              });

              const fallbackResult = await fallbackResponse.json();

              if (!fallbackResponse.ok) {
                console.warn(
                  "Duplicate create handled by fallback update:",
                  fallbackResult?.message || fallbackResponse.statusText
                );
              }

              continue;
            }

            continue;
          }

          throw new Error(
            buildSaveErrorMessage(result, response)
          );
        }
      }

      if (!showSuccessAlert) {
        setShowSuccessAlert(true);
      }
    } catch (error) {
      console.error(
        "SAVE UJI MUTASI ERROR:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Gagal menyimpan data Uji Mutasi."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="font-poppins text-[#334155]">

      {/* SUCCESS */}

      {showSuccessAlert && (
        <AlertSuccess
          message="Data Uji Mutasi berhasil disimpan."
          onClose={() =>
            setShowSuccessAlert(
              false
            )
          }
        />
      )}

      {/* ERROR */}

      {errorMessage && (
        <div
          className="
            mb-4
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            font-poppins
            text-sm
            text-red-600
          "
        >
          {errorMessage}
        </div>
      )}

      {/* MAIN CARD */}

      <div
        className="
          rounded-xl
          border
          border-[#DCE5EF]
          bg-white
          p-4
          shadow-sm
        "
      >

        {/* TOP */}

        <div
          className="
            mt-1
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          {/* TAB */}

          <div
            className="
              w-full
              rounded-[18px]
              border
              border-[#D9E4F0]
              bg-[#ECF4FB]
              p-1.5
              shadow-sm
              sm:w-[390px]
            "
          >
            <div className="grid grid-cols-2 gap-1.5">

              {[
                {
                  id: "sebelum",
                  label:
                    "Sebelum Tutup Buku",
                },
                {
                  id: "sesudah",
                  label:
                    "Sesudah Tutup Buku",
                },
              ].map(
                (tab) => {
                  const isActive =
                    activeMode ===
                    tab.id;

                  return (
                    <button
                      key={
                        tab.id
                      }
                      type="button"
                      onClick={() =>
                        setActiveMode(
                          tab.id
                        )
                      }
                      className={[
                        "h-11 rounded-[14px] px-3 text-[13px] font-medium transition-all duration-200",
                        isActive
                          ? "bg-white text-[#0EA5E9] shadow-sm"
                          : "text-[#475569] hover:text-[#0EA5E9]",
                      ].join(
                        " "
                      )}
                    >
                      {
                        tab.label
                      }
                    </button>
                  );
                }
              )}

            </div>
          </div>

          {/* SEARCH */}

          <div className="relative w-full sm:w-[280px]">

            <span
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-[#94A3B8]
              "
            >
              <Search
                size={15}
                strokeWidth={2}
                className="shrink-0"
              />
            </span>

            <input
              type="text"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Cari Nama Persediaan"
              className="
                h-10
                w-full
                rounded-xl
                border
                border-[#DCE5EF]
                bg-white
                pl-9
                pr-3
                font-poppins
                text-sm
                text-[#475569]
                outline-none
                placeholder:text-[#94A3B8]
                transition
                focus:border-[#38BDF8]
              "
            />

          </div>

        </div>

        {/* LOADING */}

        {loading ? (

          <div
            className="
              mt-4
              flex
              h-[250px]
              items-center
              justify-center
              rounded-xl
              border
              border-[#DCE5EF]
              font-poppins
              text-sm
              text-[#94A3B8]
            "
          >
            Memuat data Uji Mutasi...
          </div>

        ) : (

          /* TABLE */

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
                min-w-[1700px]
                border-collapse
              "
            >

              <thead className="bg-[#F8FAFC]">

                <tr>

                  <th
                    className="
                      w-[55px]
                      border-b
                      border-[#DCE5EF]
                      px-3
                      py-3
                      text-center
                      font-poppins
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-[#64748B]
                    "
                  >
                    No
                  </th>

                  <th
                    className="
                      min-w-[170px]
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
                    Nama Persediaan
                  </th>

                  <th
                    className="
                      min-w-[100px]
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
                    Satuan
                  </th>

                  <th
                    className="
                      min-w-[155px]
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
                    Saldo Menurut Neraca
                  </th>

                  <th
                    className="
                      min-w-[175px]
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
                    Saldo Hasil Stok Opname
                  </th>

                  <th
                    className="
                      min-w-[120px]
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
                    Keluar
                  </th>

                  <th
                    className="
                      min-w-[120px]
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
                    Rusak
                  </th>

                  <th
                    className="
                      min-w-[120px]
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
                    Masuk
                  </th>

                  <th
                    className="
                      min-w-[190px]
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
                    Saldo Per Uji Mutasi
                    (Audited)
                  </th>

                  <th
                    className="
                      min-w-[245px]
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
                    Selisih Uji Mutasi
                    Dengan Saldo Akhir
                    Per 31 Desember
                  </th>

                  <th
                    className="
                      min-w-[190px]
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
                    Keterangan
                  </th>

                </tr>

              </thead>

              <tbody>

                {rowsWithComputedValues.length >
                0 ? (

                  rowsWithComputedValues.map(
                    (
                      row,
                      index
                    ) => (

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
                            text-center
                            font-poppins
                            text-sm
                            text-[#475569]
                          "
                        >
                          {index + 1}
                        </td>

                        {/* NAMA */}

                        <td
                          className="
                            min-w-[170px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            value={
                              row.nama ||
                              ""
                            }
                            disabled
                            className="
                              h-10
                              min-w-[150px]
                              w-full
                              cursor-not-allowed
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-[#F8FAFC]
                              px-3
                              font-poppins
                              text-sm
                              text-[#64748B]
                              outline-none
                            "
                          />
                        </td>

                        {/* SATUAN */}

                        <td
                          className="
                            min-w-[100px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            value={
                              row.satuan ||
                              ""
                            }
                            disabled
                            className="
                              h-10
                              min-w-[80px]
                              w-full
                              cursor-not-allowed
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-[#F8FAFC]
                              px-3
                              font-poppins
                              text-sm
                              text-[#64748B]
                              outline-none
                            "
                          />
                        </td>

                        {/* SALDO NERACA */}

                        <td
                          className="
                            min-w-[155px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            value={formatNumber(
                              row.saldoNeraca
                            )}
                            disabled
                            className="
                              h-10
                              min-w-[130px]
                              w-full
                              cursor-not-allowed
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-[#F8FAFC]
                              px-3
                              text-left
                              font-poppins
                              text-sm
                              text-[#64748B]
                              outline-none
                            "
                          />
                        </td>

                        {/* SALDO STOK OPNAME */}

                        <td
                          className="
                            min-w-[175px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            value={numberInputValue(
                              row.saldoStokOpname
                            )}
                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                row.id,
                                "saldoStokOpname",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="0"
                            className="
                              h-10
                              min-w-[150px]
                              w-full
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-white
                              px-3
                              text-left
                              font-poppins
                              text-sm
                              text-[#475569]
                              outline-none
                              transition
                              focus:border-[#38BDF8]
                            "
                          />
                        </td>

                        {/* KELUAR */}

                        <td
                          className="
                            min-w-[120px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            value={numberInputValue(
                              row.keluar
                            )}
                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                row.id,
                                "keluar",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="0"
                            className="
                              h-10
                              min-w-[100px]
                              w-full
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-white
                              px-3
                              text-left
                              font-poppins
                              text-sm
                              text-[#475569]
                              outline-none
                              transition
                              focus:border-[#38BDF8]
                            "
                          />
                        </td>

                        {/* RUSAK */}

                        <td
                          className="
                            min-w-[120px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            value={numberInputValue(
                              row.rusak
                            )}
                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                row.id,
                                "rusak",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="0"
                            className="
                              h-10
                              min-w-[100px]
                              w-full
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-white
                              px-3
                              text-left
                              font-poppins
                              text-sm
                              text-[#475569]
                              outline-none
                              transition
                              focus:border-[#38BDF8]
                            "
                          />
                        </td>

                        {/* MASUK */}

                        <td
                          className="
                            min-w-[120px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            value={numberInputValue(
                              row.masuk
                            )}
                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                row.id,
                                "masuk",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="0"
                            className="
                              h-10
                              min-w-[100px]
                              w-full
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-white
                              px-3
                              text-left
                              font-poppins
                              text-sm
                              text-[#475569]
                              outline-none
                              transition
                              focus:border-[#38BDF8]
                            "
                          />
                        </td>

                        {/* SALDO AUDITED */}

                        <td
                          className="
                            min-w-[190px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            value={formatNumber(
                              row.saldoPerUjiMutasi
                            )}
                            readOnly
                            className="
                              h-10
                              min-w-[165px]
                              w-full
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-[#F8FAFC]
                              px-3
                              text-left
                              font-poppins
                              text-sm
                              font-medium
                              text-[#475569]
                              outline-none
                            "
                          />
                        </td>

                        {/* SELISIH */}

                        <td
                          className="
                            min-w-[245px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            value={formatNumber(
                              row.selisihMutasi
                            )}
                            readOnly
                            className="
                              h-10
                              min-w-[220px]
                              w-full
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-[#F8FAFC]
                              px-3
                              text-left
                              font-poppins
                              text-sm
                              font-medium
                              text-[#475569]
                              outline-none
                            "
                          />
                        </td>

                        {/* KETERANGAN */}

                        <td
                          className="
                            min-w-[190px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            value={
                              row.keterangan ||
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              handleInputChange(
                                row.id,
                                "keterangan",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Keterangan"
                            className="
                              h-10
                              min-w-[160px]
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

                      </tr>

                    )
                  )

                ) : (

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
                      {loading
                        ? "Memuat data..."
                        : "Data Uji Mutasi tidak ditemukan."}
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        )}

        {/* BOTTOM */}

        <div
          className="
            mt-5
            flex
            items-end
            justify-between
            gap-6
          "
        >

          {/* TOTAL */}

          <div className="flex-1">

            <div
              className="
                w-full
                max-w-[390px]
                rounded-xl
                border
                border-[#DCE5EF]
                bg-white
                p-3
              "
            >

              <div
                className="
                  mb-2.5
                  font-poppins
                  text-[15px]
                  font-bold
                  text-[#1E293B]
                "
              >
                Total
              </div>

              <div
                className="
                  grid
                  grid-cols-[1fr_auto_auto]
                  gap-x-3
                  gap-y-2
                  font-poppins
                  text-[12px]
                  font-semibold
                  leading-snug
                  text-[#475569]
                "
              >

                <span>
                  Saldo Neraca
                </span>

                <span className="text-[#94A3B8]">
                  :
                </span>

                <span className="text-left">
                  {formatNumber(
                    totalSaldoNeraca
                  )}
                </span>

                <span>
                  Saldo Hasil Stok Opname
                </span>

                <span className="text-[#94A3B8]">
                  :
                </span>

                <span className="text-left">
                  {formatNumber(
                    totalSaldoStokOpname
                  )}
                </span>

                <span>
                  Keluar
                </span>

                <span className="text-[#94A3B8]">
                  :
                </span>

                <span className="text-left">
                  {formatNumber(
                    totalKeluar
                  )}
                </span>

                <span>
                  Rusak
                </span>

                <span className="text-[#94A3B8]">
                  :
                </span>

                <span className="text-left">
                  {formatNumber(
                    totalRusak
                  )}
                </span>

                <span>
                  Masuk
                </span>

                <span className="text-[#94A3B8]">
                  :
                </span>

                <span className="text-left">
                  {formatNumber(
                    totalMasuk
                  )}
                </span>

                <span>
                  Saldo Per Uji Mutasi
                  (Audited)
                </span>

                <span className="text-[#334155]">
                  :
                </span>

                <span className="text-left text-[#334155]">
                  {formatNumber(
                    totalSaldoPerUjiMutasi
                  )}
                </span>

                <span>
                  Selisih Uji Mutasi
                  Dengan Saldo Akhir
                  Per 31 Desember
                </span>

                <span className="text-[#334155]">
                  :
                </span>

                <span className="text-left text-[#334155]">
                  {formatNumber(
                    totalSelisih
                  )}
                </span>

              </div>

            </div>

          </div>

          {/* SAVE */}

          <div className="flex shrink-0 justify-end">

            <SaveButton
              onClick={
                handleSave
              }
              label={
                saving
                  ? "Menyimpan..."
                  : "Simpan"
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}