"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDokumen,
  createDokumen,
  updateDokumen,
  deleteDokumen as deleteDokumenApi,
  getDokumenById,
} from "@/services/mahasiswa/tugas/audit/utang_usaha/dokumen/dokumen";

export default function useDokumen({ utangUsahaId }) {
  const [dokumenList, setDokumenList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDokumen = useCallback(
    async (page = 1) => {

      if (!utangUsahaId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getDokumen(utangUsahaId, page);

        const pagination = response?.data;

        const items = Array.isArray(pagination?.data)
          ? pagination.data
          : [];

        setDokumenList(items);

        setCurrentPage(pagination?.current_page ?? page);
        setTotalPages(pagination?.last_page ?? 0);
        setTotalData(pagination?.total ?? 0);
        setFrom(pagination?.from ?? null);
        setTo(pagination?.to ?? null);

      } catch (err) {
        console.error("Gagal mengambil dokumen:", err);
        console.error("Status:", err.response?.status);
        console.error("Response Backend:", err.response?.data);

        setError(
          err.response?.data?.message ||
          "Gagal mengambil data dokumen."
        );
      } finally {
        setLoading(false);
      }
    },
    [utangUsahaId]
  );

  const addDokumen = async (data) => {
    if (!utangUsahaId) {
      throw new Error("utangUsahaId tidak tersedia.");
    }

    const response = await createDokumen(utangUsahaId, data);

    await fetchDokumen(currentPage);

    return response;
  };

  useEffect(() => {
    fetchDokumen(1);
  }, [fetchDokumen]);

  const changePage = (page) => {
    fetchDokumen(page);
  };

  const removeDokumen = async (dokumenId) => {
    if (!dokumenId) {
      throw new Error("DokumenID tidak tersedia.");
    }

    const response = await deleteDokumenApi(dokumenId);

    await fetchDokumen(currentPage);

    return response;
  };

  const editDokumen = async (dokumenId, data) => {
    if (!dokumenId) {
      throw new Error("DokumenID tidak tersedia.");
    }

    const response = await updateDokumen(dokumenId, data);

    await fetchDokumen(currentPage);

    return response;
  };

  const viewDokumen = async (dokumenId) => {
    if (!dokumenId) {
      throw new Error("DokumenID tidak tersedia.");
    }

    const response = await getDokumenById(dokumenId);

    const base64 = response?.data?.File;

    if (!base64) {
      throw new Error("File dokumen tidak tersedia.");
    }

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  };

  return {
    dokumenList,
    currentPage,
    totalPages,
    totalData,
    from,
    to,
    loading,
    error,
    fetchDokumen,
    changePage,
    addDokumen,
    editDokumen,
    removeDokumen,
    viewDokumen,
  };
}