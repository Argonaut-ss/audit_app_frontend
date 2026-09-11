"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCoa,
  importCoa,
  createCoa,
  updateCoa,
  deleteAllCoa,
  deleteCoa,
} from "@/services/mahasiswa/tugas/audit/coa/coa";

export default function useCoa({
  jwbKasusId,
  page = 1,
  perPage = 10,
  search = "",
}) {
  const [coaList, setCoaList] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 10,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // IMPORT
  const [isImporting, setIsImporting] =
    useState(false);

  const [importError, setImportError] =
    useState(null);

  // DELETE ALL
  const [isDeletingAll, setIsDeletingAll] =
    useState(false);

  const [deleteAllError, setDeleteAllError] =
    useState(null);

  // DELETE BY ID
  const [isDeleting, setIsDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState(null);

  // CREATE
  const [isCreating, setIsCreating] =
    useState(false);

  const [createError, setCreateError] =
    useState(null);

  //EDIT
  const [isUpdating, setIsUpdating] =
    useState(false);

  const [updateError, setUpdateError] =
    useState(null);

  // ============================
  // GET COA
  // ============================

  const fetchCoa = useCallback(async () => {
    if (!jwbKasusId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await getCoa({
        jwbKasusId,
        page,
        perPage,
        search,
      });

      const mappedData = (response.data ?? []).map(
        (item) => ({
          coaId: item.COAID,
          jwbKasusId: item.JwbKasusID,
          noAkun: item.NoAkun,
          namaAkun: item.NamaAkun,
          namaLain: item.NamaLain,
          mappingGroup: item.MappingGroup,
          mapKelompok: item.MapKelompok,
          mappingTop: item.MappingTop,
          subMappingTop: item.SubMappingTop,
          saldo: item.Saldo,
          perBook: item.PerBook,
          auditSebelum: item.AuditSebelum,
        })
      );

      setCoaList(mappedData);

      setPagination({
        currentPage:
          response.meta?.current_page ?? 1,

        totalPages:
          response.meta?.last_page ?? 1,

        total:
          response.meta?.total ?? 0,

        perPage:
          response.meta?.per_page ?? perPage,
      });
    } catch (err) {
      console.error(
        "Gagal mengambil data COA:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Gagal mengambil data COA"
      );

      setCoaList([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    jwbKasusId,
    page,
    perPage,
    search,
  ]);

  // ============================
  // IMPORT
  // ============================

  const handleImport = async (file) => {
    if (!jwbKasusId) {
      return {
        success: false,
        message:
          "ID kasus audit tidak ditemukan",
      };
    }

    if (!file) {
      return {
        success: false,
        message:
          "Silakan pilih file terlebih dahulu",
      };
    }

    try {
      setIsImporting(true);
      setImportError(null);

      const response = await importCoa({
        jwbKasusId,
        file,
      });

      await fetchCoa();

      return {
        success: true,
        data: response,
        message:
          response.message ||
          "Data COA berhasil diimport",
      };
    } catch (err) {
      console.error(
        "Gagal import COA:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Gagal mengimport data COA";

      setImportError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsImporting(false);
    }
  };

  // ============================
  // CREATE
  // ============================

  const handleCreate = async (data) => {
    if (!jwbKasusId) {
      return {
        success: false,
        message:
          "ID kasus audit tidak ditemukan",
      };
    }

    try {
      setIsCreating(true);
      setCreateError(null);

      const response = await createCoa({
        ...data,
        JwbKasusID: jwbKasusId,
      });

      await fetchCoa();

      return {
        success: true,
        data: response,
        message:
          "Data COA berhasil ditambahkan",
      };
    } catch (err) {
      console.error(
        "Gagal menambahkan data COA:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Gagal menambahkan data COA";

      setCreateError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsCreating(false);
    }
  };

  // ============================
  // DELETE ALL
  // ============================

  const handleDeleteAll = async () => {
    if (!jwbKasusId) {
      return {
        success: false,
        message:
          "ID kasus audit tidak ditemukan",
      };
    }

    try {
      setIsDeletingAll(true);
      setDeleteAllError(null);

      const response =
        await deleteAllCoa(jwbKasusId);

      await fetchCoa();

      return {
        success: true,
        data: response,
        message:
          "Semua data COA berhasil dihapus",
      };
    } catch (err) {
      console.error(
        "Gagal menghapus semua data COA:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Gagal menghapus semua data COA";

      setDeleteAllError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsDeletingAll(false);
    }
  };

  // ============================
  // DELETE BY ID
  // ============================

  const handleDelete = async (coaId) => {
    if (!coaId) {
      return {
        success: false,
        message: "ID COA tidak ditemukan",
      };
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response =
        await deleteCoa(coaId);

      await fetchCoa();

      return {
        success: true,
        data: response,
        message:
          "Data COA berhasil dihapus",
      };
    } catch (err) {
      console.error(
        "Gagal menghapus data COA:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Gagal menghapus data COA";

      setDeleteError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================
  // EDIT
  // ============================
  const handleUpdate = async (coaId, data) => {
    if (!coaId) {
      return {
        success: false,
        message: "ID COA tidak ditemukan",
      };
    }

    try {
      setIsUpdating(true);
      setUpdateError(null);

      const response = await updateCoa(
        coaId,
        data
      );

      await fetchCoa();

      return {
        success: true,
        data: response,
        message: "Data COA berhasil diperbarui",
      };
    } catch (err) {
      console.error(
        "Gagal memperbarui data COA:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Gagal memperbarui data COA";

      setUpdateError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  // ============================
  // INITIAL FETCH
  // ============================

  useEffect(() => {
    fetchCoa();
  }, [fetchCoa]);

  return {
    coaList,
    pagination,

    isLoading,
    error,

    refetch: fetchCoa,

    handleImport,
    isImporting,
    importError,

    handleCreate,
    isCreating,
    createError,

    handleDeleteAll,
    isDeletingAll,
    deleteAllError,

    handleDelete,
    isDeleting,
    deleteError,

    handleUpdate,
    isUpdating,
    updateError,
  };
}