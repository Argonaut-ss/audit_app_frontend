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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [previousPage, setPreviousPage] = useState(1);

  const [search, setSearch] = useState("");

  const fetchMahasiswa = async (page = 1, searchKeyword = search) => {
    try {
      setLoading(true);

      const result = await getMahasiswa({
        page,
        search: searchKeyword,
      });

      setMahasiswa(result.data);

      setCurrentPage(result.meta.current_page);
      setTotalPages(result.meta.last_page);
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
    fetchMahasiswa(1, "");
  }, []);

  const handleSearch = (keyword) => {
    // Mulai search
    if (search === "" && keyword !== "") {
      setPreviousPage(currentPage);
      setSearch(keyword);
      setCurrentPage(1);
      fetchMahasiswa(1, keyword);
      return;
    }
  
    // Search masih berlangsung
    if (search !== "" && keyword !== "") {
      setSearch(keyword);
      setCurrentPage(1);
      fetchMahasiswa(1, keyword);
      return;
    }
  
    // Search dihapus
    if (search !== "" && keyword === "") {
      setSearch("");
      setCurrentPage(previousPage);
      fetchMahasiswa(previousPage, "");
    }
  };

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;

    fetchMahasiswa(page, search);
  };

  const handleImport = async (file) => {
    try {
      const result = await importMahasiswa(file);

      console.log("Import berhasil:", result);

      await fetchMahasiswa(currentPage, search);
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

      await fetchMahasiswa(currentPage, search);
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

      await fetchMahasiswa(currentPage, search);
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

    search,

    currentPage,
    totalPages,

    fetchMahasiswa,
    handleSearch,
    changePage,

    handleImport,
    handleDelete,
    handleUpdate,
  };
};