"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "next/navigation";

import { Trash2 } from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";

/* =====================================================
   API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const REKAP_ENDPOINT =
  `${API_URL}/api/rekap-mutasi-kas`;

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
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
};

/* =====================================================
   FORMAT RUPIAH
===================================================== */

const formatRupiah = (value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return "Rp 0";
  }

  const number =
    Number(value || 0);

  return `Rp ${number.toLocaleString("id-ID")}`;
};

const normalizeNumericInput = (
  value
) => {
  return String(value ?? "")
    .replace(/\D/g, "");
};

const formatNumericInput = (
  value
) => {
  const digits =
    normalizeNumericInput(value);

  if (!digits) {
    return "";
  }

  try {
    return BigInt(digits).toLocaleString(
      "id-ID"
    );
  } catch {
    return digits;
  }
};

const toSafeNumber = (
  value
) => {
  const number =
    Number(value || 0);

  return Number.isFinite(number)
    ? number
    : 0;
};

const getMoneyInputWidth = (
  value
) =>
  Math.max(
    80,
    formatNumericInput(value).length * 10 + 12
  );

/* =====================================================
   FORMAT DATE
===================================================== */

const formatDateInput = (
  value
) => {
  if (!value) {
    return "";
  }

  const stringValue =
    String(value);

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      stringValue
    )
  ) {
    return stringValue;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =====================================================
   CREATE EMPTY ROW
===================================================== */

const createEmptyRow = (
  id,
  isSaldoAwal = false
) => ({
  id,

  RekapMutasiID: null,

  IsiRekapMutasiID: null,

  tanggal: "",

  keterangan:
    isSaldoAwal
      ? "Saldo Awal"
      : "",

  debit: 0,

  kredit: 0,

  saldo:
    isSaldoAwal
      ? 0
      : 0,

  isSaldoAwal,
});

/* =====================================================
   LOCAL STORAGE
   TANGGAL SALDO AWAL
===================================================== */

const getSaldoAwalDateStorageKey = (
  kasId
) => {
  if (!kasId) {
    return null;
  }

  return `rekap-mutasi-kas-saldo-awal-date-${kasId}`;
};

const getStoredSaldoAwalDate = (
  kasId
) => {
  if (
    typeof window === "undefined" ||
    !kasId
  ) {
    return "";
  }

  const key =
    getSaldoAwalDateStorageKey(
      kasId
    );

  if (!key) {
    return "";
  }

  return (
    localStorage.getItem(key) ||
    ""
  );
};

const saveSaldoAwalDate = (
  kasId,
  date
) => {
  if (
    typeof window === "undefined" ||
    !kasId
  ) {
    return;
  }

  const key =
    getSaldoAwalDateStorageKey(
      kasId
    );

  if (!key) {
    return;
  }

  if (date) {
    localStorage.setItem(
      key,
      date
    );
  } else {
    localStorage.removeItem(
      key
    );
  }
};

/* =====================================================
   COMPONENT
===================================================== */

export default function RekapMutasiKasTab({
  kasId,
  auditId,
  tokenOf = 0,
  refetchToken = 0,
  onSaved,
  notifySaved,
}) {
  const effectiveRefetchToken = refetchToken || tokenOf || 0;

  /* ===================================================
     PARAMS
  =================================================== */

  const params =
    useParams();

  const jwbKasusId =
    params?.jwbKasusId ??
    params?.JwbKasusID ??
    params?.id ??
    null;

  /*
   * kasId diprioritaskan.
   * auditId/jwbKasusId hanya fallback
   * apabila parent memang mengirimkannya
   * sebagai KasID.
   */
  const parentId =
    kasId ??
    auditId ??
    jwbKasusId ??
    null;

  /* ===================================================
     STATE
  =================================================== */

  const [
    resolvedKasId,
    setResolvedKasId,
  ] = useState(
    parentId
      ? Number(parentId)
      : null
  );

  const [
    rekapMutasiId,
    setRekapMutasiId,
  ] = useState(null);

  const [
    dataRows,
    setDataRows,
  ] = useState([
    createEmptyRow(
      "saldo-awal",
      true
    ),
  ]);

  const [
    saldoAwal,
    setSaldoAwal,
  ] = useState(0);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  /* ===================================================
     DELETE POPUP
  =================================================== */

  const [
    deletePopup,
    setDeletePopup,
  ] = useState({
    open: false,
    index: null,
    databaseId: null,
  });

  /* ===================================================
     ALERT
  =================================================== */

  const [
    showSuccess,
    setShowSuccess,
  ] = useState(false);

  const [
    showError,
    setShowError,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /* ===================================================
     UPDATE KAS ID FROM PROP
  =================================================== */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setResolvedKasId(
          parentId
            ? Number(parentId)
            : null
        );
      }, 0);

    return () =>
      clearTimeout(timer);
  }, [parentId]);

  /* ===================================================
     RECALCULATE SALDO
  =================================================== */

  const recalculateSaldo =
    useCallback(
      (
        rows,
        initialSaldo
      ) => {

        let runningSaldo =
          toSafeNumber(
            initialSaldo
          );

        return rows.map(
          (
            row,
            index
          ) => {

            /*
             * ROW PERTAMA = SALDO AWAL
             *
             * Tanggal tetap dipertahankan.
             */
            if (
              index === 0 ||
              row.isSaldoAwal
            ) {

              runningSaldo =
                toSafeNumber(
                  initialSaldo
                );

              return {
                ...row,

                saldo:
                  runningSaldo,

                isSaldoAwal:
                  true,

                keterangan:
                  "Saldo Awal",
              };
            }

            const debit =
              toSafeNumber(
                row.debit
              );

            const kredit =
              toSafeNumber(
                row.kredit
              );

            runningSaldo =
              runningSaldo +
              debit -
              kredit;

            return {
              ...row,

              saldo:
                runningSaldo,

              isSaldoAwal:
                false,
            };
          }
        );
      },
      []
    );

  /* ===================================================
     LOAD REKAP MUTASI
     
     GET:
     /api/rekap-mutasi-kas?KasID={KasID}
  =================================================== */

  const loadRekapData =
    useCallback(
      async (
        currentKasId
      ) => {

        if (!currentKasId) {
          throw new Error(
            "KasID tidak ditemukan."
          );
        }

        const response =
          await fetchWithAuth(
            `${REKAP_ENDPOINT}?KasID=${encodeURIComponent(
              currentKasId
            )}`,
            {
              method:
                "GET",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Data Rekap Mutasi Kas gagal dimuat."
          );
        }

        const responseData =
          Array.isArray(
            result?.data
          )
            ? result.data
            : [];

        const rekap =
          responseData[0] ??
          null;

        /*
         * Ambil tanggal Saldo Awal
         * dari localStorage.
         *
         * Ini diperlukan karena backend
         * saat ini belum memiliki field
         * Tanggal untuk SaldoAwal.
         */
        const storedSaldoAwalDate =
          getStoredSaldoAwalDate(
            currentKasId
          );

        /* =================================================
           BELUM ADA REKAP MUTASI
        ================================================= */

        if (!rekap) {

          setRekapMutasiId(
            null
          );

          setSaldoAwal(
            0
          );

          setDataRows([
            {
              ...createEmptyRow(
                "saldo-awal",
                true
              ),

              tanggal:
                storedSaldoAwalDate,
            },
          ]);

          return null;
        }

        /* =================================================
           REKAP MUTASI DITEMUKAN
        ================================================= */

        const resolvedRekapId =
          rekap.RekapMutasiID ??
          rekap.rekapMutasiID ??
          null;

        const resolvedSaldoAwal =
          toSafeNumber(
            rekap.SaldoAwal
          );

        setRekapMutasiId(
          resolvedRekapId
        );

        setSaldoAwal(
          resolvedSaldoAwal
        );

        const detailRows =
          Array.isArray(
            rekap.isiRekapMutasi
          )
            ? rekap.isiRekapMutasi
            : [];

        /*
         * ROW SALDO AWAL
         *
         * tanggal diambil dari localStorage
         * sehingga tidak hilang ketika refresh.
         */
        const saldoAwalRow = {
          id:
            `saldo-awal-${
              resolvedRekapId ?? "new"
            }`,

          RekapMutasiID:
            resolvedRekapId,

          IsiRekapMutasiID:
            null,

          tanggal:
            storedSaldoAwalDate,

          keterangan:
            "Saldo Awal",

          debit:
            0,

          kredit:
            0,

          saldo:
            resolvedSaldoAwal,

          isSaldoAwal:
            true,
        };

        /* =================================================
           DETAIL ROW
        ================================================= */

        const mappedRows =
          detailRows.map(
            (
              item,
              index
            ) => {

              const debit =
                toSafeNumber(
                  item.Debit
                );

              const kredit =
                toSafeNumber(
                  item.Kredit
                );

              return {
                id:
                  item.IsiRekapMutasiID ??
                  `detail-${index}-${Date.now()}`,

                RekapMutasiID:
                  item.RekapMutasiID ??
                  resolvedRekapId,

                IsiRekapMutasiID:
                  item.IsiRekapMutasiID ??
                  null,

                tanggal:
                  formatDateInput(
                    item.Tanggal
                  ),

                keterangan:
                  item.Keterangan ??
                  "",

                debit,

                kredit,

                saldo:
                  toSafeNumber(
                    item.Saldo
                  ),

                isSaldoAwal:
                  false,
              };
            }
          );

        const normalizedRows = [
          saldoAwalRow,
          ...mappedRows,
        ];

        const calculatedRows =
          recalculateSaldo(
            normalizedRows,
            resolvedSaldoAwal
          );

        setDataRows(
          calculatedRows
        );

        return rekap;
      },
      [
        recalculateSaldo,
      ]
    );

  /* ===================================================
     LOAD DATA
  =================================================== */

  const loadData =
    useCallback(
      async () => {

        if (!resolvedKasId) {

          setErrorMessage(
            "KasID tidak ditemukan. Pastikan KasID sudah dikirim dari parent component."
          );

          setShowError(
            true
          );

          return;
        }

        try {

          setIsLoading(
            true
          );

          await loadRekapData(
            resolvedKasId
          );

        } catch (error) {

          console.error(
            "LOAD REKAP MUTASI KAS ERROR:",
            error
          );

          setErrorMessage(
            error?.message ||
              "Data Rekap Mutasi Kas gagal dimuat."
          );

          setShowError(
            true
          );

        } finally {

          setIsLoading(
            false
          );
        }
      },
      [
        resolvedKasId,
        loadRekapData,
      ]
    );

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {

    if (!resolvedKasId) {
      return;
    }

    const timer =
      setTimeout(() => {
        loadData();
      }, 0);

    return () =>
      clearTimeout(timer);

  }, [
    resolvedKasId,
    loadData,
    effectiveRefetchToken,
  ]);

  /* ===================================================
     TOTAL DEBIT
  =================================================== */

  const totalDebit =
    useMemo(
      () =>
        dataRows.reduce(
          (
            total,
            row
          ) =>
            total +
            (
              row.isSaldoAwal
                ? 0
                : toSafeNumber(
                    row.debit
                  )
            ),
          0
        ),
      [
        dataRows,
      ]
    );

  /* ===================================================
     TOTAL KREDIT
  =================================================== */

  const totalKredit =
    useMemo(
      () =>
        dataRows.reduce(
          (
            total,
            row
          ) =>
            total +
            (
              row.isSaldoAwal
                ? 0
                : toSafeNumber(
                    row.kredit
                  )
            ),
          0
        ),
      [
        dataRows,
      ]
    );

  /* ===================================================
     UPDATE ROW
  =================================================== */

  const updateRow = (
    id,
    field,
    value
  ) => {

    /*
     * Jika yang diubah adalah tanggal
     * Saldo Awal, langsung simpan ke localStorage.
     */
    const targetRow =
      dataRows.find(
        (row) =>
          row.id === id
      );

    if (
      targetRow?.isSaldoAwal &&
      field === "tanggal"
    ) {

      saveSaldoAwalDate(
        resolvedKasId,
        value
      );
    }

    setDataRows(
      (
        previousRows
      ) => {

        const updatedRows =
          previousRows.map(
            (
              row
            ) => {

              if (
                row.id !== id
              ) {
                return row;
              }

              /*
               * Row Saldo Awal:
               * sekarang boleh mengubah:
               * - tanggal
               * - saldo
               */
              if (
                row.isSaldoAwal
              ) {

                if (
                  field !== "saldo" &&
                  field !== "tanggal"
                ) {
                  return row;
                }
              }

              /*
               * Saldo transaksi tidak boleh
               * diedit manual.
               */
              if (
                !row.isSaldoAwal &&
                field === "saldo"
              ) {
                return row;
              }

              return {
                ...row,
                [field]:
                  value,
              };
            }
          );

        const firstRow =
          updatedRows[0];

        const newSaldoAwal =
          firstRow?.isSaldoAwal
            ? toSafeNumber(
                firstRow.saldo
              )
            : 0;

        setSaldoAwal(
          newSaldoAwal
        );

        return recalculateSaldo(
          updatedRows,
          newSaldoAwal
        );
      }
    );
  };

  /* ===================================================
     ADD REKAP
  =================================================== */

  const handleAddRekap = () => {

    const newId =
      Date.now();

    const newRow =
      createEmptyRow(
        newId,
        false
      );

    setDataRows(
      (
        previousRows
      ) => {

        const updatedRows = [
          ...previousRows,
          newRow,
        ];

        return recalculateSaldo(
          updatedRows,
          saldoAwal
        );
      }
    );
  };

  /* ===================================================
     DELETE CLICK
  =================================================== */

  const handleDeleteClick = (
    index
  ) => {

    const row =
      dataRows[index];

    if (
      !row ||
      row.isSaldoAwal
    ) {
      return;
    }

    setDeletePopup({
      open: true,
      index,
      databaseId:
        row.IsiRekapMutasiID ??
        null,
    });
  };

  /* ===================================================
     DELETE CONFIRM
  =================================================== */

  const handleConfirmDelete =
    async () => {

      const index =
        deletePopup.index;

      const databaseId =
        deletePopup.databaseId;

      if (
        index === null ||
        index === undefined
      ) {
        return;
      }

      try {

        /*
         * Row yang sudah tersimpan:
         *
         * DELETE
         * /api/rekap-mutasi-kas/row/{IsiRekapMutasiID}
         */

        if (
          databaseId
        ) {

          const response =
            await fetchWithAuth(
              `${REKAP_ENDPOINT}/row/${databaseId}`,
              {
                method:
                  "DELETE",
              }
            );

          const result =
            await response.json();

          if (
            !response.ok
          ) {

            throw new Error(
              result?.message ||
                "Data mutasi kas gagal dihapus."
            );
          }
        }

        setDataRows(
          (
            previousRows
          ) => {

            const filteredRows =
              previousRows.filter(
                (
                  _,
                  rowIndex
                ) =>
                  rowIndex !==
                  index
              );

            return recalculateSaldo(
              filteredRows,
              saldoAwal
            );
          }
        );

        setSuccessMessage(
          databaseId
            ? "Data mutasi kas berhasil dihapus."
            : "Data mutasi kas berhasil dihapus dari tampilan."
        );

        setShowSuccess(
          true
        );

        if (databaseId) {
          await onSaved?.();
          notifySaved?.("rekap_mutasi_kas");
        }

      } catch (error) {

        console.error(
          "DELETE REKAP MUTASI KAS ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
            "Data mutasi kas gagal dihapus."
        );

        setShowError(
          true
        );

      } finally {

        setDeletePopup({
          open: false,
          index: null,
          databaseId: null,
        });
      }
    };

  /* ===================================================
     SAVE
     
     POST:
     /api/rekap-mutasi-kas/bulk-save
  =================================================== */

  const handleSave =
    async () => {

      try {

        setIsSaving(
          true
        );

        if (!resolvedKasId) {

          throw new Error(
            "KasID tidak ditemukan. Pastikan KasID sudah dikirim dari parent component."
          );
        }

        const firstRow =
          dataRows[0];

        const currentSaldoAwal =
          firstRow?.isSaldoAwal
            ? toSafeNumber(
                firstRow.saldo
              )
            : toSafeNumber(
                saldoAwal
              );

        /*
         * Simpan tanggal Saldo Awal
         * sebelum proses API.
         *
         * Jadi walaupun backend tidak
         * mempunyai field tanggal saldo awal,
         * tanggal tetap tersimpan di browser.
         */
        if (
          firstRow?.isSaldoAwal &&
          firstRow.tanggal
        ) {

          saveSaldoAwalDate(
            resolvedKasId,
            firstRow.tanggal
          );
        }

        const detailRows =
          dataRows.filter(
            (
              row
            ) =>
              !row.isSaldoAwal
          );

        /* =================================================
           VALIDASI TANGGAL TRANSAKSI
        ================================================= */

        const invalidDateRow =
          detailRows.find(
            (
              row
            ) =>
              !row.tanggal
          );

        if (
          invalidDateRow
        ) {

          throw new Error(
            "Tanggal wajib diisi untuk setiap transaksi."
          );
        }

        /* =================================================
           VALIDASI KETERANGAN
        ================================================= */

        const invalidKeteranganRow =
          detailRows.find(
            (
              row
            ) =>
              !String(
                row.keterangan ?? ""
              ).trim()
          );

        if (
          invalidKeteranganRow
        ) {

          throw new Error(
            "Keterangan wajib diisi untuk setiap transaksi."
          );
        }

        /* =================================================
           PAYLOAD
        ================================================= */

        const payload = {

          KasID:
            Number(
              resolvedKasId
            ),

          RekapMutasiID:
            rekapMutasiId
              ? Number(
                  rekapMutasiId
                )
              : null,

          SaldoAwal:
            currentSaldoAwal,

          rows:
            detailRows.map(
              (
                row
              ) => ({

                IsiRekapMutasiID:
                  row.IsiRekapMutasiID
                    ? Number(
                        row.IsiRekapMutasiID
                      )
                    : null,

                Tanggal:
                  row.tanggal,

                Keterangan:
                  String(
                    row.keterangan ?? ""
                  ).trim(),

                Debit:
                  toSafeNumber(
                    row.debit
                  ),

                Kredit:
                  toSafeNumber(
                    row.kredit
                  ),
              })
            ),
        };

        /* =================================================
           VALIDASI MINIMAL ROW
        ================================================= */

        if (
          payload.rows.length === 0
        ) {

          throw new Error(
            "Tambahkan minimal satu transaksi sebelum menyimpan."
          );
        }

        /* =================================================
           API BULK SAVE
        ================================================= */

        const response =
          await fetchWithAuth(
            `${REKAP_ENDPOINT}/bulk-save`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok
        ) {

          if (
            result?.errors
          ) {

            const firstError =
              Object.values(
                result.errors
              )
                .flat()
                .find(
                  Boolean
                );

            throw new Error(
              firstError ||
                result?.message ||
                "Data Rekap Mutasi Kas gagal disimpan."
            );
          }

          throw new Error(
            result?.message ||
              "Data Rekap Mutasi Kas gagal disimpan."
          );
        }

        /* =================================================
           UPDATE DATA HASIL SAVE
        ================================================= */

        const savedData =
          result?.data ??
          null;

        if (
          savedData?.RekapMutasiID
        ) {

          setRekapMutasiId(
            savedData.RekapMutasiID
          );
        }

        if (
          savedData?.SaldoAwal !==
          undefined
        ) {

          setSaldoAwal(
            toSafeNumber(
              savedData.SaldoAwal
            )
          );
        }

        /*
         * Pastikan tanggal Saldo Awal
         * tetap disimpan setelah berhasil save.
         */
        if (
          firstRow?.isSaldoAwal &&
          firstRow.tanggal
        ) {

          saveSaldoAwalDate(
            resolvedKasId,
            firstRow.tanggal
          );
        }

        setSuccessMessage(
          result?.message ||
            "Rekap mutasi kas berhasil disimpan."
        );

        setShowSuccess(
          true
        );

        /*
         * Reload menggunakan API Rekap Mutasi saja.
         *
         * Tanggal Saldo Awal akan diambil
         * kembali dari localStorage.
         */
        await loadData();

        await onSaved?.(savedData);
        notifySaved?.("rekap_mutasi_kas");

      } catch (
        error
      ) {

        console.error(
          "SAVE REKAP MUTASI KAS ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
            "Data Rekap Mutasi Kas gagal disimpan."
        );

        setShowError(
          true
        );

      } finally {

        setIsSaving(
          false
        );
      }
    };

  /* ===================================================
     RETURN
  =================================================== */

  return (
    <div className="font-poppins text-[#334155]">

      {/* =================================================
          SUCCESS
      ================================================= */}

      {showSuccess && (
        <AlertSuccess
          message={
            successMessage
          }
          onClose={() =>
            setShowSuccess(
              false
            )
          }
        />
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {showError && (
        <AlertError
          message={
            errorMessage
          }
          onClose={() =>
            setShowError(
              false
            )
          }
        />
      )}

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
          shadow-sm
        "
      >

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
              min-w-[1050px]
              border-collapse
              font-poppins
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
                    min-w-[150px]
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
                  Tanggal
                </th>

                <th
                  className="
                    min-w-[230px]
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
                  Keterangan
                </th>

                <th
                  className="
                    min-w-[180px]
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
                  Debet
                </th>

                <th
                  className="
                    min-w-[180px]
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
                  Kredit
                </th>

                <th
                  className="
                    min-w-[190px]
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
                  Saldo
                </th>

                <th
                  className="
                    w-[70px]
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
                  Aksi
                </th>

              </tr>

            </thead>

            <tbody>

              {isLoading ? (

                <tr>

                  <td
                    colSpan={7}
                    className="
                      h-[160px]
                      text-center
                      font-poppins
                      text-sm
                      text-[#94A3B8]
                    "
                  >
                    Memuat data Rekap Mutasi...
                  </td>

                </tr>

              ) : dataRows.length > 0 ? (

                dataRows.map(
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

                      {/* =================================================
                          NO
                      ================================================= */}

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

                      {/* =================================================
                          TANGGAL
                      ================================================= */}

                      <td
                        className="
                          min-w-[150px]
                          px-3
                          py-2
                        "
                      >

                        <input
                          type="date"
                          value={
                            row.tanggal ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            updateRow(
                              row.id,
                              "tanggal",
                              event.target.value
                            )
                          }
                          disabled={false}
                          className="
                            h-10
                            min-w-[125px]
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
                          KETERANGAN
                      ================================================= */}

                      <td
                        className="
                          min-w-[230px]
                          px-3
                          py-2
                        "
                      >

                        {row.isSaldoAwal ? (

                          <span
                            className="
                              font-poppins
                              text-sm
                              font-bold
                              text-[#475569]
                            "
                          >
                            Saldo Awal
                          </span>

                        ) : (

                          <input
                            type="text"
                            value={
                              row.keterangan ||
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              updateRow(
                                row.id,
                                "keterangan",
                                event.target.value
                              )
                            }
                            placeholder="Keterangan"
                            className="
                              h-10
                              min-w-[200px]
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

                        )}

                      </td>

                      {/* =================================================
                          DEBET
                      ================================================= */}

                      <td
                        className="
                          min-w-[180px]
                          px-3
                          py-2
                        "
                      >

                        {row.isSaldoAwal ? (

                          <div className="h-10" />

                        ) : (

                          <div
                            className="
                              inline-flex
                              h-10
                              min-w-[150px]
                              w-max
                              max-w-none
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
                                formatNumericInput(
                                  row.debit
                                )
                              }
                              onChange={(
                                event
                              ) =>
                                updateRow(
                                  row.id,
                                  "debit",
                                  normalizeNumericInput(
                                    event.target.value
                                  )
                                )
                              }
                              placeholder="0"
                              style={{
                                width:
                                  getMoneyInputWidth(
                                    row.debit
                                  ),
                              }}
                              className="
                                min-w-[80px]
                                max-w-none
                                shrink-0
                                bg-transparent
                                pl-3
                                font-poppins
                                text-sm
                                text-[#475569]
                                outline-none
                              "
                            />

                          </div>

                        )}

                      </td>

                      {/* =================================================
                          KREDIT
                      ================================================= */}

                      <td
                        className="
                          min-w-[180px]
                          px-3
                          py-2
                        "
                      >

                        {row.isSaldoAwal ? (

                          <div className="h-10" />

                        ) : (

                          <div
                            className="
                              inline-flex
                              h-10
                              min-w-[150px]
                              w-max
                              max-w-none
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
                                formatNumericInput(
                                  row.kredit
                                )
                              }
                              onChange={(
                                event
                              ) =>
                                updateRow(
                                  row.id,
                                  "kredit",
                                  normalizeNumericInput(
                                    event.target.value
                                  )
                                )
                              }
                              placeholder="0"
                              style={{
                                width:
                                  getMoneyInputWidth(
                                    row.kredit
                                  ),
                              }}
                              className="
                                min-w-[80px]
                                max-w-none
                                shrink-0
                                bg-transparent
                                pl-3
                                font-poppins
                                text-sm
                                text-[#475569]
                                outline-none
                              "
                            />

                          </div>

                        )}

                      </td>

                      {/* =================================================
                          SALDO
                      ================================================= */}

                      <td
                        className="
                          min-w-[190px]
                          px-3
                          py-2
                        "
                      >

                        {row.isSaldoAwal ? (

                          <div
                            className="
                              flex
                              h-10
                              w-full
                              items-center
                              justify-center
                            "
                          >

                            <div
                              className="
                                inline-flex
                                h-10
                                min-w-[160px]
                                w-max
                                max-w-none
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
                                  formatNumericInput(
                                    row.saldo
                                  )
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateRow(
                                    row.id,
                                    "saldo",
                                    normalizeNumericInput(
                                      event.target.value
                                    )
                                  )
                                }
                                placeholder="0"
                                style={{
                                  width:
                                    getMoneyInputWidth(
                                      row.saldo
                                    ),
                                }}
                                className="
                                  min-w-[80px]
                                  max-w-none
                                  shrink-0
                                  bg-transparent
                                  pl-3
                                  text-left
                                  font-poppins
                                  text-sm
                                  font-medium
                                  text-[#475569]
                                  outline-none
                                "
                              />

                            </div>

                          </div>

                        ) : (

                          <span
                            className="
                              whitespace-nowrap
                              font-poppins
                              text-sm
                              font-medium
                              text-[#475569]
                            "
                          >
                            {formatRupiah(
                              row.saldo
                            )}
                          </span>

                        )}

                      </td>

                      {/* =================================================
                          AKSI
                      ================================================= */}

                      <td
                        className="
                          w-[70px]
                          px-3
                          py-2
                          text-center
                        "
                      >

                        {row.isSaldoAwal ? null : (

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteClick(
                                index
                              )
                            }
                            className="
                              inline-flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              text-red-500
                              transition
                              hover:bg-red-50
                              hover:text-red-600
                            "
                            title="Hapus Data"
                          >

                            <Trash2
                              size={16}
                            />

                          </button>

                        )}

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan={7}
                    className="
                      h-[160px]
                      text-center
                      font-poppins
                      text-sm
                      text-[#94A3B8]
                    "
                  >
                    Data Rekap Mutasi tidak ditemukan.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            TAMBAH DATA
        ================================================= */}

        <div
          className="
            flex
            justify-center
            py-5
          "
        >

          <AddDataButton
            onClick={
              handleAddRekap
            }
          />

        </div>

        {/* =================================================
            BOTTOM
        ================================================= */}

        <div
          className="
            mt-0
            flex
            items-end
            justify-between
            gap-6
          "
        >

          {/* =================================================
              TOTAL
          ================================================= */}

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
                  Debet
                </span>

                <span className="text-[#94A3B8]">
                  :
                </span>

                <span className="text-left">
                  {formatRupiah(
                    totalDebit
                  )}
                </span>

                <span>
                  Kredit
                </span>

                <span className="text-[#94A3B8]">
                  :
                </span>

                <span className="text-left">
                  {formatRupiah(
                    totalKredit
                  )}
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              SAVE
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              justify-end
            "
          >

            <SaveButton
              onClick={
                handleSave
              }
              label={
                isSaving
                  ? "Menyimpan..."
                  : "Simpan"
              }
              disabled={
                isSaving ||
                isLoading
              }
            />

          </div>

        </div>

      </div>

      {/* =================================================
          CONFIRMATION POPUP
      ================================================= */}

      <ConfirmationPopup
        isOpen={
          deletePopup.open
        }
        message={
          deletePopup.databaseId
            ? "Data ini sudah tersimpan dan akan dihapus dari database. Lanjutkan?"
            : "Apakah Anda yakin ingin menghapus data Rekap Mutasi Kas ini?"
        }
        confirmText="Ya"
        cancelText="Tidak"
        onConfirm={
          handleConfirmDelete
        }
        onCancel={() =>
          setDeletePopup({
            open: false,
            index: null,
            databaseId: null,
          })
        }
      />

    </div>
  );
}