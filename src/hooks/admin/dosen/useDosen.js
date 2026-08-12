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

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const perPage = 10;

  const fetchDosen = async (
    page = currentPage,
    keyword = search
  ) => {
    try {
      setLoading(true);

      const result = await getDosen({
        page,
        per_page: perPage,
        search: keyword,
      });

      console.log("Data dosen:", result);

      setDosen(result.data);

      setCurrentPage(result.meta.current_page);
      setTotalPages(result.meta.last_page);
      setTotal(result.meta.total);
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
    fetchDosen(1, "");
  }, []);

  const handleSearch = (keyword) => {
    setSearch(keyword);
    setCurrentPage(1);

    fetchDosen(1, keyword);
  };

  const changePage = (page) => {
    setCurrentPage(page);

    fetchDosen(page, search);
  };

  const handleImport = async (file) => {
    try {
      const result = await importDosen(file);

      console.log("Import berhasil:", result);

      await fetchDosen(currentPage, search);
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

      await fetchDosen(currentPage, search);
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

      await fetchDosen(currentPage, search);
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

    search,
    handleSearch,

    currentPage,
    totalPages,
    total,
    changePage,

    fetchDosen,
    handleImport,
    handleDelete,
    handleUpdate,
  };
};