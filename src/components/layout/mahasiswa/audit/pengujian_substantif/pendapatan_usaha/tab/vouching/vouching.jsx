"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  Trash2,
} from "lucide-react";

import { useParams, useSearchParams } from "next/navigation";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import Dropdown from "@/components/ui/dropdown/dropdown";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const API_ENDPOINT =
  `${API_URL}/api/vouching-pu`;

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
  new Intl.NumberFormat("id-ID").format(
    toNumber(value)
  );

const normalizeBoolean = (value) => {
  if (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "Ya"
  ) {
    return true;
  }

  return false;
};

const normalizePihakRelasi = (value) => {
  return normalizeBoolean(value)
    ? "Ya"
    : "Tidak";
};

const normalizeDate = (value) => {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    value.length >= 10
  ) {
    return value.substring(0, 10);
  }

  return "";
};

/* ============================================================
   MAP BACKEND -> FRONTEND
============================================================ */

const mapBackendRow = (item) => {
  return {
    id: item.VouchingID,

    VouchingID:
      item.VouchingID,

    PendapatanUsahaID:
      item.PendapatanUsahaID,

    keterangan:
      item.Keterangan || "",

    tanggal:
      normalizeDate(item.Tanggal),

    noBukti:
      item.NomorBukti || "",

    nominalInternal:
      item.NominalInternal ?? 0,

    buktiInternal: null,

    buktiInternalExisting:
      Boolean(item.hasBuktiInternal),

    buktiInternalTipeFile:
      item.BuktiInternalTipeFile || null,

    nominalEksternal:
      item.NominalEksternal ?? 0,

    buktiEksternal: null,

    buktiEksternalExisting:
      Boolean(item.hasBuktiEksternal),

    buktiEksternalTipeFile:
      item.BuktiEksternalTipeFile || null,

    selisih:
      item.Selisih ?? 0,

    pihakBerelasi:
      normalizePihakRelasi(
        item.PihakRelasi
      ),

    bukti: null,

    buktiExisting:
      Boolean(item.hasBukti),

    buktiFileTipe:
      item.BuktiFileTipe || null,

    approvalPO:
      normalizeBoolean(
        item.ApprovalPO
      ),

    approvalINV:
      normalizeBoolean(
        item.ApprovalNV
      ),

    approvalDO:
      normalizeBoolean(
        item.ApprovalDO
      ),
  };
};

/* ============================================================
   COMPONENT
============================================================ */

export default function VouchingPage() {
  const params =
    useParams();

  const searchParams =
    useSearchParams();

  const [rows, setRows] =
    useState(initialRows);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showSuccessAlert, setShowSuccessAlert] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);

  const [deleteRowId, setDeleteRowId] =
    useState(null);

  const [newRowId, setNewRowId] =
    useState(null);

  const [previousRowCount, setPreviousRowCount] =
    useState(0);

  /* ============================================================
     RESOLVE PENDAPATAN USAHA ID
  ============================================================ */

  const pendapatanUsahaId = useMemo(() => {
    const queryId =
      searchParams?.get(
        "PendapatanUsahaID"
      ) ||
      searchParams?.get(
        "pendapatanUsahaId"
      ) ||
      searchParams?.get("id");

    if (queryId) {
      return queryId;
    }

    const routeId =
      params?.PendapatanUsahaID ||
      params?.pendapatanUsahaId ||
      params?.id;

    if (Array.isArray(routeId)) {
      return routeId[0] || null;
    }

    return routeId || null;
  }, [
    params,
    searchParams,
  ]);

  /* ============================================================
     LOAD DATA
  ============================================================ */

  const loadVouching = async () => {
    if (!pendapatanUsahaId) {
      setLoading(false);

      setErrorMessage(
        "PendapatanUsahaID tidak ditemukan pada halaman ini."
      );

      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const url =
        `${API_ENDPOINT}?PendapatanUsahaID=${encodeURIComponent(
          pendapatanUsahaId
        )}`;

      const response =
        await fetchWithAuth(url, {
          method: "GET",
        });

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
            "Data Vouching gagal dimuat."
        );
      }

      const backendRows =
        Array.isArray(result?.data)
          ? result.data
          : [];

      const mappedRows =
        backendRows.map(
          mapBackendRow
        );

      setRows(mappedRows);

      setPreviousRowCount(
        mappedRows.length
      );
    } catch (error) {
      console.error(
        "LOAD VOUCHING ERROR:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Data Vouching gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouching();
  }, [pendapatanUsahaId]);

  /* ============================================================
     UPDATE ROW
  ============================================================ */

  const updateRow = (
    id,
    field,
    value
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
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
     NOMINAL
  ============================================================ */

  const handleNominalChange = (
    id,
    field,
    value
  ) => {
    const numericValue =
      String(value).replace(
        /\D/g,
        ""
      );

    updateRow(
      id,
      field,
      numericValue
        ? Number(numericValue)
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
                Number(row.id) || 0
            )
          ) + 1
        : 1;

    const newRow = {
      id: newId,

      VouchingID:
        null,

      PendapatanUsahaID:
        pendapatanUsahaId,

      keterangan: "",

      tanggal: "",

      noBukti: "",

      nominalInternal: 0,

      buktiInternal: null,

      buktiInternalExisting:
        false,

      nominalEksternal: 0,

      buktiEksternal: null,

      buktiEksternalExisting:
        false,

      pihakBerelasi: "",

      bukti: null,

      buktiExisting:
        false,

      approvalPO: false,

      approvalINV: false,

      approvalDO: false,
    };

    setRows((currentRows) => [
      ...currentRows,
      newRow,
    ]);

    setNewRowId(newId);
    setErrorMessage("");
  };

  /* ============================================================
     SCROLL SETELAH TAMBAH ROW
  ============================================================ */

  useEffect(() => {
    if (newRowId === null) {
      return;
    }

    const timer =
      setTimeout(() => {
        const rowElement =
          document.querySelector(
            `[data-row-id="${newRowId}"]`
          );

        if (rowElement) {
          rowElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }

        setNewRowId(null);
      }, 100);

    return () =>
      clearTimeout(timer);
  }, [newRowId]);

  /* ============================================================
     SCROLL SETELAH DELETE
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
      requestAnimationFrame(() => {
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
            top: maxScroll,
            left: 0,
            behavior: "auto",
          });
        }

        setPreviousRowCount(
          currentRowCount
        );
      });

    return () =>
      cancelAnimationFrame(
        timer
      );
  }, [
    rows.length,
    previousRowCount,
  ]);

  /* ============================================================
     DROPDOWN SCROLL
  ============================================================ */

  const handlePihakBerelasiPointerDown = (
    event,
    rowId
  ) => {
    if (
      event.button !== undefined &&
      event.button !== 0
    ) {
      return;
    }

    const rowElement =
      document.querySelector(
        `[data-row-id="${rowId}"]`
      );

    if (!rowElement) {
      return;
    }

    const cell =
      event.currentTarget;

    const dropdownButton =
      cell?.querySelector(
        "button"
      );

    if (!dropdownButton) {
      return;
    }

    const viewportHeight =
      window.innerHeight;

    const buttonRect =
      dropdownButton.getBoundingClientRect();

    const spaceBelow =
      viewportHeight -
      buttonRect.bottom;

    const minimumSpaceBelow =
      240;

    if (
      spaceBelow >=
      minimumSpaceBelow
    ) {
      return;
    }

    const targetTop =
      Math.max(
        80,
        Math.min(
          180,
          viewportHeight * 0.2
        )
      );

    const scrollAmount =
      buttonRect.top -
      targetTop;

    if (
      scrollAmount > 0
    ) {
      const desiredScrollTop =
        window.scrollY +
        scrollAmount;

      const maxScroll =
        Math.max(
          0,
          document.documentElement
            .scrollHeight -
            window.innerHeight
        );

      const finalScrollTop =
        Math.min(
          desiredScrollTop,
          maxScroll
        );

      window.scrollTo({
        top: finalScrollTop,
        left: 0,
        behavior: "auto",
      });
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const updatedRow =
          document.querySelector(
            `[data-row-id="${rowId}"]`
          );

        if (!updatedRow) {
          return;
        }

        const cells =
          updatedRow.querySelectorAll(
            "td"
          );

        const updatedCell =
          cells[9];

        const updatedButton =
          updatedCell?.querySelector(
            "button"
          );

        if (!updatedButton) {
          return;
        }

        const updatedRect =
          updatedButton.getBoundingClientRect();

        const updatedSpaceBelow =
          window.innerHeight -
          updatedRect.bottom;

        if (
          updatedSpaceBelow <
          minimumSpaceBelow
        ) {
          const additionalScroll =
            minimumSpaceBelow -
            updatedSpaceBelow;

          const maxScroll =
            Math.max(
              0,
              document.documentElement
                .scrollHeight -
                window.innerHeight
            );

          const finalScrollTop =
            Math.min(
              window.scrollY +
                additionalScroll,
              maxScroll
            );

          if (
            finalScrollTop >
            window.scrollY
          ) {
            window.scrollTo({
              top: finalScrollTop,
              left: 0,
              behavior: "auto",
            });
          }
        }
      });
    });
  };

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

    if (
      file.size >
      16 * 1024 * 1024
    ) {
      setErrorMessage(
        "Ukuran file maksimal 16 MB."
      );

      event.target.value = "";
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
     VIEW FILE FROM BACKEND
  ============================================================ */

  const handleViewFile = async (
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

    if (
      !row.VouchingID
    ) {
      return;
    }

    let backendField =
      null;

    if (
      field ===
      "buktiInternal"
    ) {
      backendField =
        "BuktiInternal";
    }

    if (
      field ===
      "buktiEksternal"
    ) {
      backendField =
        "BuktiEksternal";
    }

    if (
      field === "bukti"
    ) {
      backendField =
        "Bukti";
    }

    if (!backendField) {
      return;
    }

    try {
      setErrorMessage("");

      const response =
        await fetchWithAuth(
          `${API_ENDPOINT}/${row.VouchingID}/file/${backendField}`,
          {
            method: "GET",
          }
        );

      if (!response.ok) {
        let result = null;

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
        "VIEW FILE ERROR:",
        error
      );

      setErrorMessage(
        error?.message ||
          "File gagal dibuka."
      );
    }
  };

  /* ============================================================
     FORM DATA
  ============================================================ */

  const buildFormData = (
    row
  ) => {
    const formData =
      new FormData();

    formData.append(
      "PendapatanUsahaID",
      String(
        row.PendapatanUsahaID ||
          pendapatanUsahaId
      )
    );

    formData.append(
      "Keterangan",
      row.keterangan || ""
    );

    formData.append(
      "Tanggal",
      row.tanggal || ""
    );

    formData.append(
      "NomorBukti",
      row.noBukti || ""
    );

    formData.append(
      "NominalInternal",
      String(
        toNumber(
          row.nominalInternal
        )
      )
    );

    formData.append(
      "NominalEksternal",
      String(
        toNumber(
          row.nominalEksternal
        )
      )
    );

    formData.append(
      "PihakRelasi",
      row.pihakBerelasi === "Ya"
        ? "1"
        : "0"
    );

    formData.append(
      "ApprovalPO",
      row.approvalPO
        ? "1"
        : "0"
    );

    /*
     * Backend memakai ApprovalNV.
     *
     * UI tetap menggunakan nama approvalINV
     * supaya tampilan tidak berubah.
     */

    formData.append(
      "ApprovalNV",
      row.approvalINV
        ? "1"
        : "0"
    );

    formData.append(
      "ApprovalDO",
      row.approvalDO
        ? "1"
        : "0"
    );

    if (
      row.buktiInternal instanceof File
    ) {
      formData.append(
        "BuktiInternal",
        row.buktiInternal
      );
    }

    if (
      row.buktiEksternal instanceof File
    ) {
      formData.append(
        "BuktiEksternal",
        row.buktiEksternal
      );
    }

    if (
      row.bukti instanceof File
    ) {
      formData.append(
        "Bukti",
        row.bukti
      );
    }

    return formData;
  };

  /* ============================================================
     CREATE
  ============================================================ */

  const createRow = async (
    row
  ) => {
    const formData =
      buildFormData(row);

    const response =
      await fetchWithAuth(
        API_ENDPOINT,
        {
          method: "POST",
          body: formData,
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
          "Data Vouching gagal disimpan."
      );
    }

    return result;
  };

  /* ============================================================
     UPDATE
  ============================================================ */

  const updateExistingRow = async (
    row
  ) => {
    const formData =
      buildFormData(row);

    /*
     * Laravel menerima method spoofing
     * agar multipart/form-data dapat digunakan
     * untuk endpoint update.
     */

    formData.append(
      "_method",
      "PUT"
    );

    const response =
      await fetchWithAuth(
        `${API_ENDPOINT}/${row.VouchingID}`,
        {
          method: "POST",
          body: formData,
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
          "Data Vouching gagal diperbarui."
      );
    }

    return result;
  };

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDeleteClick = (
    id
  ) => {
    setDeleteRowId(id);
    setShowDeleteConfirmation(
      true
    );
  };

  const handleConfirmDelete = async () => {
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
     * Kalau row baru dan belum pernah
     * disimpan ke BE, cukup hapus dari FE.
     */

    if (!row.VouchingID) {
      setRows(
        (currentRows) =>
          currentRows.filter(
            (item) =>
              item.id !==
              deleteRowId
          )
      );

      setDeleteRowId(null);

      setShowDeleteConfirmation(
        false
      );

      setSuccessMessage(
        "Data Vouching berhasil dihapus."
      );

      setShowSuccessAlert(true);

      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const response =
        await fetchWithAuth(
          `${API_ENDPOINT}/${row.VouchingID}`,
          {
            method: "DELETE",
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
            "Data Vouching gagal dihapus."
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

      setDeleteRowId(null);

      setShowDeleteConfirmation(
        false
      );

      setSuccessMessage(
        result?.message ||
          "Data Vouching berhasil dihapus."
      );

      setShowSuccessAlert(true);
    } catch (error) {
      console.error(
        "DELETE VOUCHING ERROR:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Data Vouching gagal dihapus."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteRowId(null);

    setShowDeleteConfirmation(
      false
    );
  };

  /* ============================================================
     SAVE ALL
  ============================================================ */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!pendapatanUsahaId) {
      setErrorMessage(
        "PendapatanUsahaID tidak ditemukan."
      );

      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      /*
       * Validasi frontend terlebih dahulu.
       */

      for (
        let index = 0;
        index < rows.length;
        index++
      ) {
        const row =
          rows[index];

        if (!row.tanggal) {
          throw new Error(
            `Tanggal pada baris ${index + 1} wajib diisi.`
          );
        }

        if (!row.noBukti) {
          throw new Error(
            `Nomor Bukti pada baris ${index + 1} wajib diisi.`
          );
        }
      }

      /*
       * CREATE + UPDATE
       *
       * Row tanpa VouchingID
       * => POST
       *
       * Row dengan VouchingID
       * => PUT
       */

      for (
        const row of rows
      ) {
        let result;

        if (
          row.VouchingID
        ) {
          result =
            await updateExistingRow(
              row
            );
        } else {
          result =
            await createRow(
              row
            );
        }
      }

      /*
       * Setelah semua berhasil,
       * ambil ulang data dari BE.
       */

      await loadVouching();

      setSuccessMessage(
        "Data Vouching berhasil disimpan."
      );

      setShowSuccessAlert(true);
    } catch (error) {
      console.error(
        "SAVE VOUCHING ERROR:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Data Vouching gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     TOTAL
  ============================================================ */

  const totalInternal =
    useMemo(
      () =>
        rows.reduce(
          (
            total,
            row
          ) =>
            total +
            toNumber(
              row.nominalInternal
            ),
          0
        ),
      [rows]
    );

  const totalExternal =
    useMemo(
      () =>
        rows.reduce(
          (
            total,
            row
          ) =>
            total +
            toNumber(
              row.nominalEksternal
            ),
          0
        ),
      [rows]
    );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="font-poppins text-[#334155]">

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

      {errorMessage && (
        <AlertError
          message={
            errorMessage
          }
          onClose={() =>
            setErrorMessage("")
          }
        />
      )}

      <ConfirmationPopup
        isOpen={
          showDeleteConfirmation
        }
        message="Apakah Anda yakin ingin menghapus data Vouching?"
        onConfirm={
          handleConfirmDelete
        }
        onCancel={
          handleCancelDelete
        }
      />

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">

        <div className="mt-0 overflow-x-auto rounded-xl border border-[#DCE5EF]">

          <table className="w-full min-w-[1750px] border-collapse">

            <thead className="bg-[#F8FAFC]">

              <tr>

                {[
                  "No",
                  "Keterangan",
                  "Tanggal",
                  "No. Bukti",
                  "Nominal Internal",
                  "Bukti Internal",
                  "Nominal Eksternal",
                  "Bukti Eksternal",
                  "Selisih",
                  "Pihak Berelasi",
                  "Bukti",
                  "Approval PO",
                  "Approval INV",
                  "Approval DO",
                  "Aksi",
                ].map(
                  (header) => (
                    <th
                      key={
                        header
                      }
                      className="border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]"
                    >
                      {header}
                    </th>
                  )
                )}

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={15}
                    className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]"
                  >
                    Memuat data
                    Vouching...
                  </td>

                </tr>

              ) : rows.length === 0 ? (

                <tr>

                  <td
                    colSpan={15}
                    className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]"
                  >
                    Belum ada data
                    Vouching.
                  </td>

                </tr>

              ) : (

                rows.map(
                  (
                    row,
                    index
                  ) => {

                    const selisih =
                      toNumber(
                        row.nominalInternal
                      ) -
                      toNumber(
                        row.nominalEksternal
                      );

                    return (

                      <tr
                        key={
                          row.id
                        }
                        data-row-id={
                          row.id
                        }
                        className="border-b border-[#EDF2F7]"
                      >

                        {/* NO */}

                        <td className="px-3 py-2 font-poppins text-sm text-[#475569]">
                          {index +
                            1}
                        </td>

                        {/* KETERANGAN */}

                        <td className="min-w-[240px] px-3 py-2">

                          <input
                            type="text"
                            value={
                              row.keterangan
                            }
                            placeholder="Masukkan Keterangan"
                            onChange={(
                              event
                            ) =>
                              updateRow(
                                row.id,
                                "keterangan",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]"
                          />

                        </td>

                        {/* TANGGAL */}

                        <td className="min-w-[160px] px-3 py-2">

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
                                event
                                  .target
                                  .value
                              )
                            }
                            className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition focus:border-[#38BDF8]"
                          />

                        </td>

                        {/* NOMOR BUKTI */}

                        <td className="min-w-[150px] px-3 py-2">

                          <input
                            type="text"
                            value={
                              row.noBukti
                            }
                            placeholder="No. Bukti"
                            onChange={(
                              event
                            ) =>
                              updateRow(
                                row.id,
                                "noBukti",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]"
                          />

                        </td>

                        {/* NOMINAL INTERNAL */}

                        <td className="px-3 py-2">

                          <div className="inline-flex min-w-[190px] w-max max-w-none h-10 items-center whitespace-nowrap rounded-xl border border-[#DCE5EF] bg-white px-3 transition focus-within:border-[#38BDF8]">

                            <span className="shrink-0 font-poppins text-sm text-[#64748B]">
                              Rp
                            </span>

                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatNumber(
                                row.nominalInternal
                              )}
                              onChange={(
                                event
                              ) =>
                                handleNominalChange(
                                  row.id,
                                  "nominalInternal",
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="[field-sizing:content] min-w-[80px] max-w-none shrink-0 bg-transparent pl-3 text-left font-poppins text-sm text-[#475569] outline-none"
                            />

                          </div>

                        </td>

                        {/* =================================================
                           BUKTI INTERNAL
                        ================================================= */}

                        <td className="min-w-[110px] px-3 py-2">

                          <input
                            id={`file-buktiInternal-${row.id}`}
                            type="file"
                            className="hidden"
                            onChange={(
                              event
                            ) =>
                              handleFileChange(
                                event,
                                "buktiInternal",
                                row.id
                              )
                            }
                          />

                          <div className="flex items-center justify-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenFile(
                                  "buktiInternal",
                                  row.id
                                )
                              }
                              className="font-poppins text-sm font-medium text-[#38BDF8] transition hover:underline"
                            >
                              File
                            </button>

                            {(row.buktiInternal instanceof File ||
                              row.buktiInternalExisting) && (

                              <button
                                type="button"
                                title="Lihat file"
                                onClick={() =>
                                  handleViewFile(
                                    "buktiInternal",
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

                        {/* NOMINAL EKSTERNAL */}

                        <td className="px-3 py-2">

                          <div className="inline-flex min-w-[190px] w-max max-w-none h-10 items-center whitespace-nowrap rounded-xl border border-[#DCE5EF] bg-white px-3 transition focus-within:border-[#38BDF8]">

                            <span className="shrink-0 font-poppins text-sm text-[#64748B]">
                              Rp
                            </span>

                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatNumber(
                                row.nominalEksternal
                              )}
                              onChange={(
                                event
                              ) =>
                                handleNominalChange(
                                  row.id,
                                  "nominalEksternal",
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="[field-sizing:content] min-w-[80px] max-w-none shrink-0 bg-transparent pl-3 text-left font-poppins text-sm text-[#475569] outline-none"
                            />

                          </div>

                        </td>

                        {/* =================================================
                           BUKTI EKSTERNAL
                        ================================================= */}

                        <td className="min-w-[110px] px-3 py-2">

                          <input
                            id={`file-buktiEksternal-${row.id}`}
                            type="file"
                            className="hidden"
                            onChange={(
                              event
                            ) =>
                              handleFileChange(
                                event,
                                "buktiEksternal",
                                row.id
                              )
                            }
                          />

                          <div className="flex items-center justify-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenFile(
                                  "buktiEksternal",
                                  row.id
                                )
                              }
                              className="font-poppins text-sm font-medium text-[#38BDF8] transition hover:underline"
                            >
                              File
                            </button>

                            {(row.buktiEksternal instanceof File ||
                              row.buktiEksternalExisting) && (

                              <button
                                type="button"
                                title="Lihat file"
                                onClick={() =>
                                  handleViewFile(
                                    "buktiEksternal",
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

                        {/* SELISIH */}

                        <td className="px-3 py-2">

                          <div className="inline-flex min-w-[190px] w-max max-w-none h-10 items-center whitespace-nowrap rounded-xl border border-[#DCE5EF] bg-[#F8FAFC] px-3">

                            <span className="shrink-0 font-poppins text-sm text-[#64748B]">
                              Rp
                            </span>

                            <span className="shrink-0 pl-3 font-poppins text-sm text-[#64748B]">
                              {formatNumber(
                                selisih
                              )}
                            </span>

                          </div>

                        </td>

                        {/* PIHAK BERELASI */}

                        <td
                          className="min-w-[180px] px-3 py-2"
                          onPointerDown={(
                            event
                          ) =>
                            handlePihakBerelasiPointerDown(
                              event,
                              row.id
                            )
                          }
                        >

                          <Dropdown
                            value={
                              row.pihakBerelasi ||
                              ""
                            }
                            placeholder="Pilih Pihak"
                            showCheck={
                              false
                            }
                            options={[
                              {
                                value:
                                  "Tidak",
                                label:
                                  "Tidak",
                              },
                              {
                                value:
                                  "Ya",
                                label:
                                  "Ya",
                              },
                            ]}
                            onChange={(
                              value
                            ) =>
                              updateRow(
                                row.id,
                                "pihakBerelasi",
                                value
                              )
                            }
                            className="[&>button]:h-10 [&>button]:min-h-10 [&>button]:rounded-xl [&>button]:border-[#DCE5EF] [&>button]:bg-white [&>button]:px-3 [&>button]:font-poppins [&>button]:text-sm [&>button_span]:text-[#475569]"
                          />

                        </td>

                        {/* =================================================
                           BUKTI
                        ================================================= */}

                        <td className="min-w-[100px] px-3 py-2">

                          <input
                            id={`file-bukti-${row.id}`}
                            type="file"
                            className="hidden"
                            onChange={(
                              event
                            ) =>
                              handleFileChange(
                                event,
                                "bukti",
                                row.id
                              )
                            }
                          />

                          <div className="flex items-center justify-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenFile(
                                  "bukti",
                                  row.id
                                )
                              }
                              className="font-poppins text-sm font-medium text-[#38BDF8] transition hover:underline"
                            >
                              File
                            </button>

                            {(row.bukti instanceof File ||
                              row.buktiExisting) && (

                              <button
                                type="button"
                                title="Lihat file"
                                onClick={() =>
                                  handleViewFile(
                                    "bukti",
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

                        {/* APPROVAL PO */}

                        <td className="px-3 py-2">

                          <div className="flex justify-center">

                            <label className="relative flex h-4 w-4 cursor-pointer items-center justify-center">

                              <input
                                type="checkbox"
                                checked={Boolean(
                                  row.approvalPO
                                )}
                                onChange={(
                                  event
                                ) =>
                                  updateRow(
                                    row.id,
                                    "approvalPO",
                                    event
                                      .target
                                      .checked
                                  )
                                }
                                className="peer absolute h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-[#CBD5E1] bg-white checked:border-[#38BDF8] checked:bg-[#38BDF8]"
                              />

                              <svg
                                viewBox="0 0 12 12"
                                className="pointer-events-none absolute h-3 w-3 opacity-0 transition peer-checked:opacity-100"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M2 6l2.5 2.5L10 3" />
                              </svg>

                            </label>

                          </div>

                        </td>

                        {/* APPROVAL INV */}

                        <td className="px-3 py-2">

                          <div className="flex justify-center">

                            <label className="relative flex h-4 w-4 cursor-pointer items-center justify-center">

                              <input
                                type="checkbox"
                                checked={Boolean(
                                  row.approvalINV
                                )}
                                onChange={(
                                  event
                                ) =>
                                  updateRow(
                                    row.id,
                                    "approvalINV",
                                    event
                                      .target
                                      .checked
                                  )
                                }
                                className="peer absolute h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-[#CBD5E1] bg-white checked:border-[#38BDF8] checked:bg-[#38BDF8]"
                              />

                              <svg
                                viewBox="0 0 12 12"
                                className="pointer-events-none absolute h-3 w-3 opacity-0 transition peer-checked:opacity-100"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M2 6l2.5 2.5L10 3" />
                              </svg>

                            </label>

                          </div>

                        </td>

                        {/* APPROVAL DO */}

                        <td className="px-3 py-2">

                          <div className="flex justify-center">

                            <label className="relative flex h-4 w-4 cursor-pointer items-center justify-center">

                              <input
                                type="checkbox"
                                checked={Boolean(
                                  row.approvalDO
                                )}
                                onChange={(
                                  event
                                ) =>
                                  updateRow(
                                    row.id,
                                    "approvalDO",
                                    event
                                      .target
                                      .checked
                                  )
                                }
                                className="peer absolute h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-[#CBD5E1] bg-white checked:border-[#38BDF8] checked:bg-[#38BDF8]"
                              />

                              <svg
                                viewBox="0 0 12 12"
                                className="pointer-events-none absolute h-3 w-3 opacity-0 transition peer-checked:opacity-100"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M2 6l2.5 2.5L10 3" />
                              </svg>

                            </label>

                          </div>

                        </td>

                        {/* AKSI */}

                        <td className="px-3 py-2">

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
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

        {/* TAMBAH DATA */}

        <div className="mt-4 flex justify-center">

          <AddDataButton
            onClick={
              handleAddRow
            }
            disabled={
              saving ||
              loading ||
              !pendapatanUsahaId
            }
            label="Tambah Data"
          />

        </div>

        {/* SIMPAN */}

        <div className="mt-5 flex justify-end">

          <SaveButton
            onClick={
              handleSave
            }
            disabled={
              saving ||
              loading ||
              !pendapatanUsahaId
            }
            isSaving={
              saving
            }
            label="Simpan"
            savingLabel="Menyimpan..."
          />

        </div>

        <div
          aria-hidden="true"
          className="h-[600px] w-full"
        />

      </div>

    </div>
  );
}