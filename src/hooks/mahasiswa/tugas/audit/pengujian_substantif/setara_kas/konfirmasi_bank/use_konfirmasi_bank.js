"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getKonfirmasiBank,
  createKonfirmasiBank,
  updateKonfirmasiBank,
  deleteKonfirmasiBank as deleteKonfirmasiBankApi,
  getKonfirmasiBankById,
} from "@/services/mahasiswa/tugas/audit/setara_kas/konfirmasi_bank/konfirmasi_bank";

export default function useKonfirmasiBank({ setaraKasId }) {
  const [konfirmasiBankList, setKonfirmasiBankList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchKonfirmasiBank = useCallback(
    async (page = 1) => {
      if (!setaraKasId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getKonfirmasiBank(setaraKasId, page);

        const pagination = response?.data;

        const items = Array.isArray(pagination?.data)
          ? pagination.data
          : [];

        setKonfirmasiBankList(items);

        setCurrentPage(pagination?.current_page ?? page);
        setTotalPages(pagination?.last_page ?? 0);
        setTotalData(pagination?.total ?? 0);
        setFrom(pagination?.from ?? null);
        setTo(pagination?.to ?? null);
      } catch (err) {
        console.error("Gagal mengambil konfirmasi bank:", err);
        console.error("Status:", err.response?.status);
        console.error("Response Backend:", err.response?.data);

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data konfirmasi bank."
        );
      } finally {
        setLoading(false);
      }
    },
    [setaraKasId]
  );

  const addKonfirmasiBank = async (data) => {
    if (!setaraKasId) {
      throw new Error("SetaraKasID tidak tersedia.");
    }

    const response = await createKonfirmasiBank(setaraKasId, data);

    await fetchKonfirmasiBank(currentPage);

    return response;
  };

  useEffect(() => {
    fetchKonfirmasiBank(1);
  }, [fetchKonfirmasiBank]);

  const changePage = (page) => {
    fetchKonfirmasiBank(page);
  };

  const removeKonfirmasiBank = async (konfirmasiBankId) => {
    if (!konfirmasiBankId) {
      throw new Error("konfirmasiBankID tidak tersedia.");
    }

    const response = await deleteKonfirmasiBankApi(konfirmasiBankId);

    await fetchKonfirmasiBank(currentPage);

    return response;
  };

  const editKonfirmasiBank = async (konfirmasiBankId, data) => {
    if (!konfirmasiBankId) {
      throw new Error("konfirmasiBankID tidak tersedia.");
    }

    const response = await updateKonfirmasiBank(konfirmasiBankId, data);

    await fetchKonfirmasiBank(currentPage);

    return response;
  };

  const viewKonfirmasiBank = async (konfirmasiBankId) => {
    if (!konfirmasiBankId) {
      throw new Error("KonfirmasiBankID tidak tersedia.");
    }

    const response = await getKonfirmasiBankById(konfirmasiBankId);

    const base64 = response?.data?.File;
    const mimeType = response?.data?.MimeType;
    const fileName =
      response?.data?.NamaFileUpload || "konfirmasi-bank";

    if (!base64) {
      throw new Error("File konfirmasi bank tidak tersedia.");
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
    konfirmasiBankList,
    currentPage,
    totalPages,
    totalData,
    from,
    to,
    loading,
    error,
    fetchKonfirmasiBank,
    changePage,
    addKonfirmasiBank,
    editKonfirmasiBank,
    removeKonfirmasiBank,
    viewKonfirmasiBank,
  };
}
