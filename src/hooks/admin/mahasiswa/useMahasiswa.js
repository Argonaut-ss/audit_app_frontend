"use client";

import { useEffect, useState } from "react";
import {
  getMahasiswa,
  importMahasiswa,
  deleteMahasiswa,
  updateMahasiswa,
} from "@/services/admin/mahasiswa/mahasiswa";

export const useMahasiswa = () => {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMahasiswa = async () => {
    try {
      const result = await getMahasiswa();

      console.log("Data mahasiswa:", result);

      setMahasiswa(result.data);
    } catch (error) {
      console.error(
        "Gagal mengambil data mahasiswa:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMahasiswa();
  }, []);

  const handleImport = async (file) => {
    try {
      const result = await importMahasiswa(file);

      console.log("Import berhasil:", result);

      // Ambil data terbaru setelah import
      await fetchMahasiswa();
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
      const result = await deleteMahasiswa(id);

      console.log("Delete berhasil:", result);

      // Hapus langsung dari state
      setMahasiswa((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(
        "Gagal menghapus mahasiswa:",
        error.response?.data || error.message
      );

      throw error;
    }
  };
  const handleUpdate = async (id, data) => {
    try {
      const result = await updateMahasiswa(id, data);
  
      console.log("Update berhasil:", result);
  
      await fetchMahasiswa();
    } catch (error) {
      console.error(
        "Gagal mengupdate mahasiswa:",
        error.response?.data || error.message
      );
  
      throw error;
    }
  };


  return {
    mahasiswa,
    loading,
    fetchMahasiswa,
    handleImport,
    handleDelete,
    handleUpdate,
  };
};