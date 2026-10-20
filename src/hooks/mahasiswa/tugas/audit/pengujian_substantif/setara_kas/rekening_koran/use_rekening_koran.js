"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getRekeningKoran,
  createRekeningKoran,
  updateRekeningKoran,
  deleteRekeningKoran as deleteRekeningKoranApi,
  getRekeningKoranById,
} from "@/services/mahasiswa/tugas/audit/setara_kas/rekening_koran/rekening_koran";

export default function useRekeningKoran({ setaraKasId }) {
  const [rekeningKoranList, setRekeningKoranList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRekeningKoran = useCallback(
    async (page = 1) => {
      if (!setaraKasId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getRekeningKoran(setaraKasId, page);

        const pagination = response?.data;

        const items = Array.isArray(pagination?.data)
          ? pagination.data
          : [];

        setRekeningKoranList(items);

        setCurrentPage(pagination?.current_page ?? page);
        setTotalPages(pagination?.last_page ?? 0);
        setTotalData(pagination?.total ?? 0);
        setFrom(pagination?.from ?? null);
        setTo(pagination?.to ?? null);
      } catch (err) {
        console.error("Gagal mengambil rekening koran:", err);
        console.error("Status:", err.response?.status);
        console.error("Response Backend:", err.response?.data);

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data rekening koran."
        );
      } finally {
        setLoading(false);
      }
    },
    [setaraKasId]
  );

  const addRekeningKoran = async (data) => {
    if (!setaraKasId) {
      throw new Error("SetaraKasID tidak tersedia.");
    }

    const response = await createRekeningKoran(setaraKasId, data);

    await fetchRekeningKoran(currentPage);

    return response;
  };

  useEffect(() => {
    fetchRekeningKoran(1);
  }, [fetchRekeningKoran]);

  const changePage = (page) => {
    fetchRekeningKoran(page);
  };

  const removeRekeningKoran = async (rekeningKoranId) => {
    if (!rekeningKoranId) {
      throw new Error("rekeningKoranID tidak tersedia.");
    }

    const response = await deleteRekeningKoranApi(rekeningKoranId);

    await fetchRekeningKoran(currentPage);

    return response;
  };

  const editRekeningKoran = async (rekeningKoranId, data) => {
    if (!rekeningKoranId) {
      throw new Error("RekeningKoranID tidak tersedia.");
    }

    const response = await updateRekeningKoran(rekeningkoranId, data);

    await fetchRekeningKoran(currentPage);

    return response;
  };

  const viewRekeningKoran = async (rekeningKoranId) => {
    if (!rekeningKoranId) {
      throw new Error("RekeningKoranID tidak tersedia.");
    }

    const response = await getRekeningKoranById(rekeningKoranIdId);

    const base64 = response?.data?.File;
    const mimeType = response?.data?.MimeType;
    const fileName =
      response?.data?.NamaFileUpload || "rekening-koran";

    if (!base64) {
      throw new Error("File rekening koran tidak tersedia.");
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
    rekeningKoranList,
    currentPage,
    totalPages,
    totalData,
    from,
    to,
    loading,
    error,
    fetchRekeningKoran,
    changePage,
    addRekeningKoran,
    editRekeningKoran,
    removeRekeningKoran,
    viewRekeningKoran,
  };
}
