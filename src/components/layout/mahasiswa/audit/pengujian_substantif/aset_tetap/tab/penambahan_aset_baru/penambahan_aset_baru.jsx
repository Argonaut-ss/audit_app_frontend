"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { Eye, Trash2 } from "lucide-react";

import { useParams, useSearchParams } from "next/navigation";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";

/* ============================================================
   API
============================================================ */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const API_ENDPOINT =
  `${API_URL}/api/aset-baru-aset-tetap`;

const BULK_SAVE_ENDPOINT =
  `${API_ENDPOINT}/bulk-save`;

/* ============================================================
   AUTH
============================================================ */

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

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  /*
   * Jangan set Content-Type secara manual
   * ketika body berupa FormData.
   *
   * Browser akan otomatis memberikan:
   * multipart/form-data + boundary
   */
  headers.Authorization =
    `Bearer ${token}`;

  return fetch(url, {
    ...options,
    headers,
  });
};

/* ============================================================
   INITIAL DATA
============================================================ */

const initialRows = [];

/* ============================================================
   HELPERS
============================================================ */

const toNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (typeof value === "number") {
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

const formatNumber = (value) =>
  new Intl.NumberFormat(
    "id-ID"
  ).format(
    toNumber(value)
  );

const normalizeDate = (value) => {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    value.length >= 10
  ) {
    return value.substring(
      0,
      10
    );
  }

  return "";
};

/* ============================================================
   MAP BACKEND -> FRONTEND
============================================================ */

const mapBackendRow = (
  item
) => {
  return {
    /*
     * Primary key dari BE:
     * AsetBaruID
     */
    id:
      item.AsetBaruID ??
      null,

    AsetBaruID:
      item.AsetBaruID ??
      null,

    AsetTetapID:
      item.AsetTetapID ??
      null,

    namaAset:
      item.NamaAset ||
      "",

    kodeAset:
      item.KodeAset ||
      "",

    /*
     * Backend menggunakan:
     * Tanggal
     */
    tanggalPerolehan:
      normalizeDate(
        item.Tanggal
      ),

    hargaPerolehan:
      item.HargaPerolehan ??
      0,

    /*
     * File baru yang dipilih
     * dari komputer
     */
    bukti1:
      null,

    bukti2:
      null,

    /*
     * File existing dari database
     */
    bukti1Existing:
      Boolean(
        item.hasFotoAset
      ),

    bukti2Existing:
      Boolean(
        item.hasFotoBukti
      ),

    /*
     * MIME type dari backend
     */
    bukti1TipeFile:
      item.TipeFileAset ||
      null,

    bukti2TipeFile:
      item.TipeFileBukti ||
      null,
  };
};

/* ============================================================
   COMPONENT
============================================================ */

export default function PenambahanAsetBaruPage() {
  const params =
    useParams();

  const searchParams =
    useSearchParams();

  /* ============================================================
     STATE
  ============================================================ */

  const [rows, setRows] =
    useState(initialRows);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    showSuccessAlert,
    setShowSuccessAlert,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    showDeleteConfirmation,
    setShowDeleteConfirmation,
  ] = useState(false);

  const [
    deleteRowId,
    setDeleteRowId,
  ] = useState(null);

  const [
    newRowId,
    setNewRowId,
  ] = useState(null);

  const [
    previousRowCount,
    setPreviousRowCount,
  ] = useState(0);

  /* ============================================================
     RESOLVE ASET TETAP ID
  ============================================================ */

  const asetTetapId =
    useMemo(() => {
      const queryId =
        searchParams?.get(
          "AsetTetapID"
        ) ||
        searchParams?.get(
          "asetTetapId"
        ) ||
        searchParams?.get(
          "id"
        );

      if (queryId) {
        return queryId;
      }

      const routeId =
        params?.AsetTetapID ||
        params?.asetTetapID ||
        params?.asetTetapId ||
        params?.id;

      if (
        Array.isArray(routeId)
      ) {
        return (
          routeId[0] ||
          null
        );
      }

      return routeId || null;
    }, [
      params,
      searchParams,
    ]);

  /* ============================================================
     LOAD DATA
  ============================================================ */

  const loadPenambahanAset =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setErrorMessage("");

          if (!asetTetapId) {
            throw new Error(
              "AsetTetapID tidak ditemukan."
            );
          }

          const url =
            `${API_ENDPOINT}?AsetTetapID=${encodeURIComponent(
              asetTetapId
            )}`;

          const response =
            await fetchWithAuth(
              url,
              {
                method: "GET",
              }
            );

          let result = null;

          try {
            result =
              await response.json();
          } catch {
            result = null;
          }

          if (!response.ok) {
            throw new Error(
              result?.message ||
              "Data Penambahan Aset Baru gagal dimuat."
            );
          }

          const backendRows =
            Array.isArray(
              result?.data
            )
              ? result.data
              : [];

          const mappedRows =
            backendRows.map(
              mapBackendRow
            );

          setRows(
            mappedRows
          );

          setPreviousRowCount(
            mappedRows.length
          );
        } catch (error) {
          console.error(
            "LOAD PENAMBAHAN ASET BARU ERROR:",
            error
          );

          setErrorMessage(
            error?.message ||
            "Data Penambahan Aset Baru gagal dimuat."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        asetTetapId,
      ]
    );

  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadPenambahanAset();
      }, 0);

    return () =>
      clearTimeout(
        timer
      );
  }, [
    loadPenambahanAset,
  ]);

  /* ============================================================
     UPDATE ROW
  ============================================================ */

  const updateRow = (
    id,
    field,
    value
  ) => {
    setRows(
      (currentRows) =>
        currentRows.map(
          (row) =>
            row.id === id
              ? {
                  ...row,
                  [field]: value,
                }
              : row
        )
    );
  };

  /* ============================================================
     HARGA PEROLEHAN
  ============================================================ */

  const handleHargaChange = (
    id,
    value
  ) => {
    const numericValue =
      String(value).replace(
        /\D/g,
        ""
      );

    updateRow(
      id,
      "hargaPerolehan",
      numericValue
        ? Number(
            numericValue
          )
        : 0
    );
  };

  /* ============================================================
     ADD ROW
  ============================================================ */

  const handleAddRow = () => {
    const newId =
      rows.length > 0
        ? Math.max(
            ...rows.map(
              (row) =>
                Number(
                  row.id
                ) || 0
            )
          ) + 1
        : 1;

    const newRow = {
      /*
       * ID frontend sementara.
       * Bukan AsetBaruID database.
       */
      id:
        `new-${Date.now()}-${newId}`,

      AsetBaruID:
        null,

      AsetTetapID:
        asetTetapId,

      namaAset:
        "",

      kodeAset:
        "",

      tanggalPerolehan:
        "",

      hargaPerolehan:
        0,

      bukti1:
        null,

      bukti1Existing:
        false,

      bukti2:
        null,

      bukti2Existing:
        false,

      bukti1TipeFile:
        null,

      bukti2TipeFile:
        null,
    };

    setRows(
      (currentRows) => [
        ...currentRows,
        newRow,
      ]
    );

    setNewRowId(
      newRow.id
    );

    setErrorMessage("");
  };

  /* ============================================================
     SCROLL SETELAH TAMBAH ROW
  ============================================================ */

  useEffect(() => {
    if (
      newRowId === null
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        const rowElement =
          document.querySelector(
            `[data-row-id="${newRowId}"]`
          );

        if (rowElement) {
          rowElement.scrollIntoView(
            {
              behavior:
                "smooth",
              block:
                "center",
              inline:
                "nearest",
            }
          );
        }

        setNewRowId(
          null
        );
      }, 100);

    return () =>
      clearTimeout(
        timer
      );
  }, [
    newRowId,
  ]);

  /* ============================================================
     SCROLL SETELAH PERUBAHAN ROW
  ============================================================ */

  useLayoutEffect(() => {
    const currentRowCount =
      rows.length;

    const wasDeleted =
      currentRowCount <
      previousRowCount;

    const wasAdded =
      currentRowCount >
      previousRowCount;

    if (
      !wasDeleted &&
      !wasAdded
    ) {
      return;
    }

    const timer =
      requestAnimationFrame(
        () => {
          const maxScroll =
            Math.max(
              0,
              document.documentElement
                .scrollHeight -
                window.innerHeight
            );

          if (
            window.scrollY >
            maxScroll
          ) {
            window.scrollTo({
              top:
                maxScroll,
              left: 0,
              behavior:
                "auto",
            });
          }

          setPreviousRowCount(
            currentRowCount
          );
        }
      );

    return () =>
      cancelAnimationFrame(
        timer
      );
  }, [
    rows.length,
    previousRowCount,
  ]);

  /* ============================================================
     FILE PICKER
  ============================================================ */

  const handleOpenFile = (
    field,
    id
  ) => {
    const input =
      document.getElementById(
        `file-${field}-${id}`
      );

    if (input) {
      input.click();
    }
  };

  const handleFileChange = (
    event,
    field,
    id
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * Backend:
     * max:16000 KB
     *
     * FE:
     * sekitar 16 MB
     */
    if (
      file.size >
      16 * 1024 * 1024
    ) {
      setErrorMessage(
        "Ukuran file maksimal 16 MB."
      );

      event.target.value =
        "";

      return;
    }

    /*
     * File yang diperbolehkan:
     *
     * - JPG / JPEG
     * - PNG
     * - WEBP
     * - GIF
     * - PDF
     * - DOC
     * - DOCX
     * - XLS
     * - XLSX
     */
    const allowedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
    ];

    const fileName =
      file.name.toLowerCase();

    const extension =
      fileName.includes(".")
        ? fileName
            .split(".")
            .pop()
        : "";

    if (
      !allowedExtensions.includes(
        extension
      )
    ) {
      setErrorMessage(
        "Format file tidak didukung. Gunakan gambar, PDF, Word, atau Excel."
      );

      event.target.value =
        "";

      return;
    }

    updateRow(
      id,
      field,
      file
    );

    setErrorMessage("");
  };

  /* ============================================================
     VIEW FILE
  ============================================================ */

  const handleViewFile =
    async (
      field,
      id
    ) => {
      const row =
        rows.find(
          (item) =>
            item.id === id
        );

      if (!row) {
        return;
      }

      /*
       * File baru yang belum disimpan.
       */
      const localFile =
        row[field];

      if (
        localFile instanceof File
      ) {
        const fileUrl =
          URL.createObjectURL(
            localFile
          );

        window.open(
          fileUrl,
          "_blank",
          "noopener,noreferrer"
        );

        setTimeout(() => {
          URL.revokeObjectURL(
            fileUrl
          );
        }, 60000);

        return;
      }

      /*
       * File lama yang sudah ada di database.
       */
      if (
        !row.AsetBaruID
      ) {
        setErrorMessage(
          "File belum tersedia."
        );

        return;
      }

      /*
       * Mapping FE → BE
       *
       * bukti1 → FotoAset
       * bukti2 → FotoBukti
       */
      let backendField =
        null;

      if (
        field === "bukti1"
      ) {
        backendField =
          "FotoAset";
      }

      if (
        field === "bukti2"
      ) {
        backendField =
          "FotoBukti";
      }

      if (!backendField) {
        return;
      }

      try {
        setErrorMessage("");

        const response =
          await fetchWithAuth(
            `${API_ENDPOINT}/${row.AsetBaruID}/file/${backendField}`,
            {
              method: "GET",
            }
          );

        if (!response.ok) {
          let result =
            null;

          try {
            result =
              await response.json();
          } catch {
            result = null;
          }

          throw new Error(
            result?.message ||
            "File gagal dibuka."
          );
        }

        const blob =
          await response.blob();

        const fileUrl =
          URL.createObjectURL(
            blob
          );

        window.open(
          fileUrl,
          "_blank",
          "noopener,noreferrer"
        );

        setTimeout(() => {
          URL.revokeObjectURL(
            fileUrl
          );
        }, 60000);
      } catch (error) {
        console.error(
          "VIEW FILE PENAMBAHAN ASET BARU ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
          "File gagal dibuka."
        );
      }
    };

  /* ============================================================
     BUILD BULK FORM DATA
  ============================================================ */

  const buildBulkFormData =
    () => {
      const formData =
        new FormData();

      /*
       * Parent AsetTetapID
       */
      formData.append(
        "AsetTetapID",
        String(
          asetTetapId
        )
      );

      /*
       * Controller bulkSave:
       *
       * rows.*.AsetBaruID
       * rows.*.NamaAset
       * rows.*.KodeAset
       * rows.*.Tanggal
       * rows.*.HargaPerolehan
       * rows.*.FotoAset
       * rows.*.FotoBukti
       */

      rows.forEach(
        (
          row,
          index
        ) => {
          /*
           * ID hanya dikirim untuk
           * data yang sudah tersimpan.
           */
          if (
            row.AsetBaruID
          ) {
            formData.append(
              `rows[${index}][AsetBaruID]`,
              String(
                row.AsetBaruID
              )
            );
          }

          formData.append(
            `rows[${index}][NamaAset]`,
            row.namaAset?.trim() ||
              ""
          );

          formData.append(
            `rows[${index}][KodeAset]`,
            row.kodeAset?.trim() ||
              ""
          );

          /*
           * BE menggunakan "Tanggal",
           * bukan "TanggalPerolehan".
           */
          formData.append(
            `rows[${index}][Tanggal]`,
            row.tanggalPerolehan ||
              ""
          );

          formData.append(
            `rows[${index}][HargaPerolehan]`,
            String(
              toNumber(
                row.hargaPerolehan
              )
            )
          );

          /*
           * BE menggunakan FotoAset
           */
          if (
            row.bukti1 instanceof File
          ) {
            formData.append(
              `rows[${index}][FotoAset]`,
              row.bukti1
            );
          }

          /*
           * BE menggunakan FotoBukti
           */
          if (
            row.bukti2 instanceof File
          ) {
            formData.append(
              `rows[${index}][FotoBukti]`,
              row.bukti2
            );
          }
        }
      );

      return formData;
    };

  /* ============================================================
     DELETE CLICK
  ============================================================ */

  const handleDeleteClick = (
    id
  ) => {
    setDeleteRowId(
      id
    );

    setShowDeleteConfirmation(
      true
    );
  };

  /* ============================================================
     CONFIRM DELETE
  ============================================================ */

  const handleConfirmDelete =
    async () => {
      if (
        deleteRowId === null
      ) {
        return;
      }

      const row =
        rows.find(
          (item) =>
            item.id ===
            deleteRowId
        );

      if (!row) {
        return;
      }

      /*
       * Kalau belum tersimpan ke database,
       * cukup hapus dari state.
       */
      if (
        !row.AsetBaruID
      ) {
        setRows(
          (currentRows) =>
            currentRows.filter(
              (item) =>
                item.id !==
                deleteRowId
            )
        );

        setDeleteRowId(
          null
        );

        setShowDeleteConfirmation(
          false
        );

        setSuccessMessage(
          "Data Penambahan Aset Baru berhasil dihapus."
        );

        setShowSuccessAlert(
          true
        );

        return;
      }

      /*
       * Kalau sudah ada di database,
       * panggil DELETE endpoint.
       */
      try {
        setSaving(
          true
        );

        setErrorMessage("");

        const response =
          await fetchWithAuth(
            `${API_ENDPOINT}/${row.AsetBaruID}`,
            {
              method:
                "DELETE",
            }
          );

        let result =
          null;

        try {
          result =
            await response.json();
        } catch {
          result = null;
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
            "Data Penambahan Aset Baru gagal dihapus."
          );
        }

        setRows(
          (currentRows) =>
            currentRows.filter(
              (item) =>
                item.id !==
                deleteRowId
            )
        );

        setDeleteRowId(
          null
        );

        setShowDeleteConfirmation(
          false
        );

        setSuccessMessage(
          result?.message ||
          "Data aset baru berhasil dihapus."
        );

        setShowSuccessAlert(
          true
        );
      } catch (error) {
        console.error(
          "DELETE PENAMBAHAN ASET BARU ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
          "Data Penambahan Aset Baru gagal dihapus."
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* ============================================================
     CANCEL DELETE
  ============================================================ */

  const handleCancelDelete =
    () => {
      setDeleteRowId(
        null
      );

      setShowDeleteConfirmation(
        false
      );
    };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateRows =
    () => {
      if (!asetTetapId) {
        throw new Error(
          "AsetTetapID tidak ditemukan."
        );
      }

      if (
        rows.length === 0
      ) {
        throw new Error(
          "Belum ada data Penambahan Aset Baru."
        );
      }

      rows.forEach(
        (
          row,
          index
        ) => {
          if (
            !row.namaAset?.trim()
          ) {
            throw new Error(
              `Nama Aset pada baris ${
                index + 1
              } wajib diisi.`
            );
          }

          if (
            !row.kodeAset?.trim()
          ) {
            throw new Error(
              `Kode Aset pada baris ${
                index + 1
              } wajib diisi.`
            );
          }

          if (
            !row.tanggalPerolehan
          ) {
            throw new Error(
              `Tanggal Perolehan pada baris ${
                index + 1
              } wajib diisi.`
            );
          }

          /*
           * Controller BE menerima integer.
           */
          if (
            toNumber(
              row.hargaPerolehan
            ) <= 0
          ) {
            throw new Error(
              `Harga Perolehan pada baris ${
                index + 1
              } wajib diisi.`
            );
          }
        }
      );
    };

  /* ============================================================
     SAVE ALL - BULK SAVE
  ============================================================ */

  const handleSave =
    async () => {
      if (saving) {
        return;
      }

      try {
        setSaving(
          true
        );

        setErrorMessage("");
        setSuccessMessage("");

        /*
         * Validasi FE
         */
        validateRows();

        /*
         * SATU API REQUEST UNTUK SELURUH DATA
         *
         * POST:
         * /api/aset-baru-aset-tetap/bulk-save
         */
        const formData =
          buildBulkFormData();

        const response =
          await fetchWithAuth(
            BULK_SAVE_ENDPOINT,
            {
              method:
                "POST",
              body:
                formData,
            }
          );

        let result =
          null;

        try {
          result =
            await response.json();
        } catch {
          result = null;
        }

        if (!response.ok) {
          /*
           * Laravel validation error
           */
          if (
            result?.errors
          ) {
            const firstError =
              Object.values(
                result.errors
              )
                .flat()
                .find(Boolean);

            throw new Error(
              firstError ||
              result?.message ||
              "Validasi data gagal."
            );
          }

          throw new Error(
            result?.message ||
            "Data Penambahan Aset Baru gagal disimpan."
          );
        }

        /*
         * Controller bulkSave mengembalikan:
         *
         * {
         *   success: true,
         *   message: "...",
         *   data: [...]
         * }
         */
        const savedRows =
          Array.isArray(
            result?.data
          )
            ? result.data
            : [];

        if (
          savedRows.length > 0
        ) {
          setRows(
            savedRows.map(
              mapBackendRow
            )
          );
        } else {
          await loadPenambahanAset();
        }

        setSuccessMessage(
          result?.message ||
          "Data aset baru berhasil disimpan."
        );

        setShowSuccessAlert(
          true
        );
      } catch (error) {
        console.error(
          "SAVE PENAMBAHAN ASET BARU ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
          "Data Penambahan Aset Baru gagal disimpan."
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="font-poppins text-[#334155]">

      {/* ========================================================
          SUCCESS ALERT
      ======================================================== */}

      {showSuccessAlert && (
        <AlertSuccess
          message={
            successMessage
          }
          onClose={() =>
            setShowSuccessAlert(
              false
            )
          }
        />
      )}

      {/* ========================================================
          ERROR ALERT
      ======================================================== */}

      {errorMessage && (
        <AlertError
          message={
            errorMessage
          }
          onClose={() =>
            setErrorMessage(
              ""
            )
          }
        />
      )}

      {/* ========================================================
          DELETE CONFIRMATION
      ======================================================== */}

      <ConfirmationPopup
        isOpen={
          showDeleteConfirmation
        }
        message="Apakah Anda yakin ingin menghapus data Penambahan Aset Baru?"
        onConfirm={
          handleConfirmDelete
        }
        onCancel={
          handleCancelDelete
        }
      />

      {/* ========================================================
          MAIN CARD
      ======================================================== */}

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">

        {/* ======================================================
            TABLE
        ====================================================== */}

        <div className="overflow-x-auto rounded-xl border border-[#DCE5EF]">

          <table className="w-full min-w-[1250px] border-collapse">

            {/* ==================================================
                HEADER
            ================================================== */}

            <thead className="bg-[#F8FAFC]">

              <tr>

                <th className="w-[50px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  No
                </th>

                <th className="min-w-[230px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Nama Aset
                </th>

                <th className="min-w-[160px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Kode Aset
                </th>

                <th className="min-w-[170px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Tanggal Perolehan
                </th>

                <th className="min-w-[220px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Harga Perolehan
                </th>

                <th className="min-w-[120px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Bukti
                </th>

                <th className="min-w-[120px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Bukti
                </th>

                <th className="min-w-[70px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Aksi
                </th>

              </tr>

            </thead>

            {/* ==================================================
                BODY
            ================================================== */}

            <tbody>

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]"
                  >
                    Memuat data Penambahan Aset Baru...
                  </td>
                </tr>
              ) : rows.length === 0 ? (

                /* ===============================================
                   EMPTY
                =============================================== */

                <tr>
                  <td
                    colSpan={8}
                    className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]"
                  >
                    Belum ada data Penambahan Aset Baru.
                  </td>
                </tr>

              ) : (

                /* ===============================================
                   DATA
                =============================================== */

                rows.map(
                  (
                    row,
                    index
                  ) => (
                    <tr
                      key={
                        row.id
                      }
                      data-row-id={
                        row.id
                      }
                      className="border-b border-[#EDF2F7]"
                    >

                      {/* ========================================
                          NO
                      ======================================== */}

                      <td className="w-[50px] px-3 py-2 text-center font-poppins text-sm text-[#475569]">
                        {index + 1}
                      </td>

                      {/* ========================================
                          NAMA ASET
                      ======================================== */}

                      <td className="min-w-[230px] px-3 py-2">

                        <input
                          type="text"
                          value={
                            row.namaAset
                          }
                          placeholder="Nama Aset"
                          onChange={(
                            event
                          ) =>
                            updateRow(
                              row.id,
                              "namaAset",
                              event.target.value
                            )
                          }
                          className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]"
                        />

                      </td>

                      {/* ========================================
                          KODE ASET
                      ======================================== */}

                      <td className="min-w-[160px] px-3 py-2">

                        <input
                          type="text"
                          value={
                            row.kodeAset
                          }
                          placeholder="Kode Aset"
                          onChange={(
                            event
                          ) =>
                            updateRow(
                              row.id,
                              "kodeAset",
                              event.target.value
                            )
                          }
                          className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]"
                        />

                      </td>

                      {/* ========================================
                          TANGGAL PEROLEHAN
                      ======================================== */}

                      <td className="min-w-[170px] px-3 py-2">

                        <input
                          type="date"
                          value={
                            row.tanggalPerolehan ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            updateRow(
                              row.id,
                              "tanggalPerolehan",
                              event.target.value
                            )
                          }
                          className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition focus:border-[#38BDF8]"
                        />

                      </td>

                      {/* ========================================
                          HARGA PEROLEHAN
                      ======================================== */}

                      <td className="px-3 py-2">

                        <div className="inline-flex h-10 min-w-[190px] w-max max-w-none items-center overflow-hidden rounded-xl border border-[#DCE5EF] bg-white transition focus-within:border-[#38BDF8]">

                          {/* ================================
                              RP
                          ================================= */}

                          <div className="flex h-full shrink-0 items-center border-r border-[#DCE5EF] bg-[#F8FAFC] px-3">

                            <span className="font-poppins text-sm text-[#94A3B8]">
                              Rp
                            </span>

                          </div>

                          {/* ================================
                              NOMINAL
                          ================================= */}

                          <input
                            type="text"
                            inputMode="numeric"
                            value={
                              formatNumber(
                                row.hargaPerolehan
                              )
                            }
                            onChange={(
                              event
                            ) =>
                              handleHargaChange(
                                row.id,
                                event.target.value
                              )
                            }
                            placeholder="0"
                            className="[field-sizing:content] min-w-[100px] max-w-none shrink-0 bg-transparent px-3 text-left font-poppins text-sm text-[#475569] outline-none"
                          />

                        </div>

                      </td>

                      {/* ========================================
                          FOTO / DOKUMEN ASET
                      ======================================== */}

                      <td className="min-w-[120px] px-3 py-2">

                        <input
                          id={`file-bukti1-${row.id}`}
                          type="file"

                          /*
                           * SUPPORT:
                           * - Image
                           * - PDF
                           * - Word
                           * - Excel
                           */
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"

                          className="hidden"
                          onChange={(
                            event
                          ) =>
                            handleFileChange(
                              event,
                              "bukti1",
                              row.id
                            )
                          }
                        />

                        <div className="flex items-center justify-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenFile(
                                "bukti1",
                                row.id
                              )
                            }
                            className="font-poppins text-sm font-medium text-[#38BDF8] transition hover:underline"
                          >
                            File
                          </button>

                          {(
                            row.bukti1 instanceof
                              File ||
                            row.bukti1Existing
                          ) && (
                            <button
                              type="button"
                              title="Lihat file"
                              onClick={() =>
                                handleViewFile(
                                  "bukti1",
                                  row.id
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[#38BDF8] transition hover:bg-[#F1F5F9]"
                            >
                              <Eye
                                size={16}
                              />
                            </button>
                          )}

                        </div>

                      </td>

                      {/* ========================================
                          FOTO / DOKUMEN BUKTI
                      ======================================== */}

                      <td className="min-w-[120px] px-3 py-2">

                        <input
                          id={`file-bukti2-${row.id}`}
                          type="file"

                          /*
                           * SUPPORT:
                           * - Image
                           * - PDF
                           * - Word
                           * - Excel
                           */
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"

                          className="hidden"
                          onChange={(
                            event
                          ) =>
                            handleFileChange(
                              event,
                              "bukti2",
                              row.id
                            )
                          }
                        />

                        <div className="flex items-center justify-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenFile(
                                "bukti2",
                                row.id
                              )
                            }
                            className="font-poppins text-sm font-medium text-[#38BDF8] transition hover:underline"
                          >
                            File
                          </button>

                          {(
                            row.bukti2 instanceof
                              File ||
                            row.bukti2Existing
                          ) && (
                            <button
                              type="button"
                              title="Lihat file"
                              onClick={() =>
                                handleViewFile(
                                  "bukti2",
                                  row.id
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[#38BDF8] transition hover:bg-[#F1F5F9]"
                            >
                              <Eye
                                size={16}
                              />
                            </button>
                          )}

                        </div>

                      </td>

                      {/* ========================================
                          AKSI
                      ======================================== */}

                      <td className="min-w-[70px] px-3 py-2">

                        <div className="flex justify-center">

                          <button
                            type="button"
                            title="Hapus"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              handleDeleteClick(
                                row.id
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition duration-200 hover:bg-red-50 hover:text-red-600 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2
                              size={15}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

        {/* ======================================================
            TAMBAH DATA
        ====================================================== */}

        <div className="mt-4 flex justify-center">

          <AddDataButton
            onClick={
              handleAddRow
            }
            disabled={
              saving ||
              loading ||
              !asetTetapId
            }
            label="Tambah Data"
          />

        </div>

        {/* ======================================================
            SIMPAN
        ====================================================== */}

        <div className="mt-5 flex justify-end">

          <SaveButton
            onClick={
              handleSave
            }
            disabled={
              saving ||
              loading ||
              !asetTetapId ||
              rows.length === 0
            }
            isSaving={
              saving
            }
            label="Simpan"
            savingLabel="Menyimpan..."
          />

        </div>

        {/* ======================================================
            EXTRA SPACE
        ====================================================== */}

        <div
          aria-hidden="true"
          className="h-[600px] w-full"
        />

      </div>

    </div>
  );
}