"use client";

import { useEffect, useState } from "react";
import {
  getDosen,
  importDosen,
  deleteDosen,
  updateDosen,
} from "@/services/admin/dosen/dosen";

export const useDosen = () => {
  const [dosen, setDosen] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDosen = async () => {
    try {
      const result = await getDosen();

      console.log("Data dosen:", result);

      setDosen(result.data);
    } catch (error) {
      console.error(
        "Gagal mengambil data dosen:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDosen();
  }, []);

  const handleImport = async (file) => {
    try {
      const result = await importDosen(file);

      console.log("Import berhasil:", result);

      // Ambil data terbaru setelah import
      await fetchDosen();
    } catch (error) {
      console.error(
        "Import gagal:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteDosen(id);

      console.log("Delete berhasil:", result);

      // Hapus langsung dari state
      setDosen((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(
        "Gagal menghapus dosen:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const result = await updateDosen(id, data);
  
      console.log("Update berhasil:", result);
  
      await fetchDosen();
    } catch (error) {
      console.error(
        "Gagal mengupdate dosen:",
        error.response?.data || error.message
      );
  
      throw error;
    }
  };

  return {
    dosen,
    loading,
    fetchDosen,
    handleImport,
    handleDelete,
    handleUpdate,
  };
};