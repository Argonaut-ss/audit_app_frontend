"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getBuktiPendukung,
  createBuktiPendukung,
  updateBuktiPendukung,
  deleteBuktiPendukung as deleteBuktiPendukungApi,
  getBuktiPendukungById,
} from "@/services/mahasiswa/tugas/audit/aset_lain_lain/bukti_pendukung/bukti_pendukung";

export default function useBuktiPendukung({ asetLainId }) {
  const [buktiList, setBuktiList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBuktiPendukung = useCallback(
    async (page = 1) => {
      if (!asetLainId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getBuktiPendukung(asetLainId, page);

        const pagination = response?.data;

        const items = Array.isArray(pagination?.data)
          ? pagination.data
          : [];

        setBuktiList(items);

        setCurrentPage(pagination?.current_page ?? page);
        setTotalPages(pagination?.last_page ?? 0);
        setTotalData(pagination?.total ?? 0);
        setFrom(pagination?.from ?? null);
        setTo(pagination?.to ?? null);
      } catch (err) {
        console.error("Gagal mengambil bukti pendukung:", err);
        console.error("Status:", err.response?.status);
        console.error("Response Backend:", err.response?.data);

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data bukti pendukung."
        );
      } finally {
        setLoading(false);
      }
    },
    [asetLainId]
  );

  const addBukti = async (data) => {
    if (!asetLainId) {
      throw new Error("AsetLainID tidak tersedia.");
    }

    const response = await createBuktiPendukung(asetLainId, data);

    await fetchBuktiPendukung(currentPage);

    return response;
  };

  useEffect(() => {
    fetchBuktiPendukung(1);
  }, [fetchBuktiPendukung]);

  const changePage = (page) => {
    fetchBuktiPendukung(page);
  };

  const removeBukti = async (buktiId) => {
    if (!buktiId) {
      throw new Error("BuktiPendukungID tidak tersedia.");
    }

    const response = await deleteBuktiPendukungApi(buktiId);

    await fetchBuktiPendukung(currentPage);

    return response;
  };

  const editBukti = async (buktiId, data) => {
    if (!buktiId) {
      throw new Error("BuktiPendukungID tidak tersedia.");
    }

    const response = await updateBuktiPendukung(buktiId, data);

    await fetchBuktiPendukung(currentPage);

    return response;
  };

  const viewBukti = async (buktiId) => {
    if (!buktiId) {
      throw new Error("BuktiPendukungID tidak tersedia.");
    }

    const response = await getBuktiPendukungById(buktiId);

    const base64 = response?.data?.File;
    const mimeType = response?.data?.MimeType;
    const fileName =
      response?.data?.NamaFileUpload || "bukti-pendukung";

    if (!base64) {
      throw new Error("File bukti pendukung tidak tersedia.");
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
    buktiList,
    currentPage,
    totalPages,
    totalData,
    from,
    to,
    loading,
    error,
    fetchBuktiPendukung,
    changePage,
    addBukti,
    editBukti,
    removeBukti,
    viewBukti,
  };
}
