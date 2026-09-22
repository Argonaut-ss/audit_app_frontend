"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getProsedur,
  createProsedur,
  updateProsedur,
  deleteProsedur,
  saveAllProsedur,
} from "@/services/mahasiswa/tugas/audit/utang_usaha/prosedur/prosedur";

export default function useProsedur({ utangUsahaId }) {
  const [prosedurList, setProsedurList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchProsedur = useCallback(async () => {
    if (!utangUsahaId) {
      setProsedurList([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getProsedur(utangUsahaId);

      const items = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      const mappedData = items.map((item, index) => ({
        id: item.id,
        no: index + 1,
        prosedur: item.nama_prosedur ?? "",
        index: item.index ?? "",
        tanggal: item.tanggal ?? "",
        checklist: Boolean(item.checkbox),
      }));

      setProsedurList(mappedData);
    } catch (err) {
      console.error("Gagal mengambil data prosedur:", err);

      setError(
        err.response?.data?.message ||
        "Gagal mengambil data prosedur"
      );

      setProsedurList([]);
    } finally {
      setIsLoading(false);
    }
  }, [utangUsahaId]);

  const handleCreate = async (data) => {
    if (!utangUsahaId) {
      return {
        success: false,
        message: "ID utang usaha tidak ditemukan",
      };
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const response = await createProsedur({
        ...data,
        utang_usaha_id: utangUsahaId,
      });

      await fetchProsedur();

      return {
        success: true,
        data: response,
        message: "Prosedur berhasil ditambahkan",
      };
    } catch (err) {
      console.error(
        "Gagal menambahkan prosedur:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Gagal menambahkan prosedur";

      setSaveError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (prosedurId, data) => {
    if (!utangUsahaId) {
      return {
        success: false,
        message: "ID utang usaha tidak ditemukan",
      };
    }

    if (!prosedurId) {
      return {
        success: false,
        message: "ID prosedur tidak ditemukan",
      };
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const response = await updateProsedur(prosedurId, {
        utang_usaha_id: utangUsahaId,
        ...data,
      });

      await fetchProsedur();

      return {
        success: true,
        data: response,
        message: "Prosedur berhasil diperbarui",
      };
    } catch (err) {
      console.error(
        "Gagal memperbarui prosedur:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Gagal memperbarui prosedur";

      setSaveError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (prosedurId) => {
    if (!prosedurId) {
      return {
        success: false,
        message: "ID prosedur tidak ditemukan",
      };
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await deleteProsedur(
        prosedurId
      );

      await fetchProsedur();

      return {
        success: true,
        data: response,
        message: "Prosedur berhasil dihapus",
      };
    } catch (err) {
      console.error(
        "Gagal menghapus prosedur:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Gagal menghapus prosedur";

      setDeleteError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchProsedur();
  }, [fetchProsedur]);

  const handleBulkSave = async (data) => {
    if (!utangUsahaId) {
      return {
        success: false,
        message: "ID utang usaha tidak ditemukan",
      };
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const response = await saveAllProsedur({
        utang_usaha_id: utangUsahaId,
        Kesimpulan: data.Kesimpulan ?? null,
        prosedurs: data.prosedurs,
      });

      await fetchProsedur();

      return {
        success: true,
        data: response,
        message: "Data prosedur berhasil disimpan",
      };
    } catch (err) {
      console.error(
        "Gagal menyimpan semua prosedur:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Gagal menyimpan data prosedur";

      setSaveError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    prosedurList,
    isLoading,
    error,
    refetch: fetchProsedur,
  
    handleCreate,
    handleUpdate,
    handleBulkSave,
    isSaving,
    saveError,
  
    handleDelete,
    isDeleting,
    deleteError,
  };
}