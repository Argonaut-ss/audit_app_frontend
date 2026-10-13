"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getUjiPenyusutan,
  createUjiPenyusutan,
  updateUjiPenyusutan,
  deleteUjiPenyusutan as deleteUjiPenyusutanApi,
  getUjiPenyusutanById,
} from "@/services/mahasiswa/tugas/audit/aset_tetap/uji_penyusutan/uji_penyusutan";

export default function useUjiPenyusutan({ asetTetapId }) {
  const [penyusutanList, setPenyusutanList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPenyusutan = useCallback(
    async (page = 1) => {
      if (!asetTetapId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getUjiPenyusutan(asetTetapId, page);

        const pagination = response?.data;

        const items = Array.isArray(pagination?.data)
          ? pagination.data
          : [];

        setPenyusutanList(items);

        setCurrentPage(pagination?.current_page ?? page);
        setTotalPages(pagination?.last_page ?? 0);
        setTotalData(pagination?.total ?? 0);
        setFrom(pagination?.from ?? null);
        setTo(pagination?.to ?? null);
      } catch (err) {
        console.error("Gagal mengambil uji penyusutan:", err);
        console.error("Status:", err.response?.status);
        console.error("Response Backend:", err.response?.data);

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data uji penyusutan."
        );
      } finally {
        setLoading(false);
      }
    },
    [asetTetapId]
  );

  const addPenyusutan = async (data) => {
    if (!asetTetapId) {
      throw new Error("AsetTetapID tidak tersedia.");
    }

    const response = await createUjiPenyusutan(asetTetapId, data);

    await fetchPenyusutan(currentPage);

    return response;
  };

  useEffect(() => {
    fetchPenyusutan(1);
  }, [fetchPenyusutan]);

  const changePage = (page) => {
    fetchPenyusutan(page);
  };

  const removePenyusutan = async (penyusutanId) => {
    if (!penyusutanId) {
      throw new Error("UjiPenyusutanID tidak tersedia.");
    }

    const response = await deleteUjiPenyusutanApi(penyusutanId);

    await fetchPenyusutan(currentPage);

    return response;
  };

  const editPenyusutan = async (penyusutanId, data) => {
    if (!penyusutanId) {
      throw new Error("UjiPenyusutanID tidak tersedia.");
    }

    const response = await updateUjiPenyusutan(penyusutanId, data);

    await fetchPenyusutan(currentPage);

    return response;
  };

  const viewPenyusutan = async (penyusutanId) => {
    if (!penyusutanId) {
      throw new Error("UjiPenyusutanID tidak tersedia.");
    }

    const response = await getUjiPenyusutanById(penyusutanId);

    const base64 = response?.data?.File;
    const mimeType = response?.data?.MimeType;
    const fileName =
      response?.data?.NamaFileUpload || "uji-penyusutan";

    if (!base64) {
      throw new Error("File uji penyusutan tidak tersedia.");
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
    penyusutanList,
    currentPage,
    totalPages,
    totalData,
    from,
    to,
    loading,
    error,
    fetchPenyusutan,
    changePage,
    addPenyusutan,
    editPenyusutan,
    removePenyusutan,
    viewPenyusutan,
  };
}
