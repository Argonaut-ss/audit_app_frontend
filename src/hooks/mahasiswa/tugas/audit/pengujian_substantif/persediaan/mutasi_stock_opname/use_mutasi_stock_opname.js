"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getMutasiStockOpname,
  createMutasiStockOpname,
  updateMutasiStockOpname,
  deleteMutasiStockOpname as deleteMutasiStockOpnameApi,
  getMutasiStockOpnameById,
} from "@/services/mahasiswa/tugas/audit/mutasi_stock_opname/mutasi_stock_opname";

export default function useMutasiStockOpname({ persediaanId }) {
  const [mutasiList, setMutasiList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMutasi = useCallback(
    async (page = 1) => {
      if (!persediaanId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getMutasiStockOpname(persediaanId, page);

        const pagination = response?.data;

        const items = Array.isArray(pagination?.data)
          ? pagination.data
          : [];

        setMutasiList(items);

        setCurrentPage(pagination?.current_page ?? page);
        setTotalPages(pagination?.last_page ?? 0);
        setTotalData(pagination?.total ?? 0);
        setFrom(pagination?.from ?? null);
        setTo(pagination?.to ?? null);
      } catch (err) {
        console.error("Gagal mengambil mutasi stock opname:", err);
        console.error("Status:", err.response?.status);
        console.error("Response Backend:", err.response?.data);

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data mutasi stock opname."
        );
      } finally {
        setLoading(false);
      }
    },
    [persediaanId]
  );

  const addMutasi = async (data) => {
    if (!persediaanId) {
      throw new Error("PersediaanID tidak tersedia.");
    }

    const response = await createMutasiStockOpname(persediaanId, data);

    await fetchMutasi(currentPage);

    return response;
  };

  useEffect(() => {
    fetchMutasi(1);
  }, [fetchMutasi]);

  const changePage = (page) => {
    fetchMutasi(page);
  };

  const removeMutasi = async (mutasiId) => {
    if (!mutasiId) {
      throw new Error("MutasiStockOpnamePersediaanID tidak tersedia.");
    }

    const response = await deleteMutasiStockOpnameApi(mutasiId);

    await fetchMutasi(currentPage);

    return response;
  };

  const editMutasi = async (mutasiId, data) => {
    if (!mutasiId) {
      throw new Error("MutasiStockOpnamePersediaanID tidak tersedia.");
    }

    const response = await updateMutasiStockOpname(mutasiId, data);

    await fetchMutasi(currentPage);

    return response;
  };

  const viewMutasi = async (mutasiId) => {
    if (!mutasiId) {
      throw new Error("MutasiStockOpnamePersediaanID tidak tersedia.");
    }

    const response = await getMutasiStockOpnameById(mutasiId);

    const base64 = response?.data?.File;
    const mimeType = response?.data?.MimeType;
    const fileName =
      response?.data?.NamaFileUpload || "mutasi-stock-opname";

    if (!base64) {
      throw new Error("File mutasi stock opname tidak tersedia.");
    }

    if (!mimeType) {
      throw new Error("Tipe file tidak tersedia.");
    }

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {
      type: mimeType,
    });

    const url = URL.createObjectURL(blob);

    const previewableTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (previewableTypes.includes(mimeType)) {
      window.open(url, "_blank");
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  };

  return {
    mutasiList,
    currentPage,
    totalPages,
    totalData,
    from,
    to,
    loading,
    error,
    fetchMutasi,
    changePage,
    addMutasi,
    editMutasi,
    removeMutasi,
    viewMutasi,
  };
}
