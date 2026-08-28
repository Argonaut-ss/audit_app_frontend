"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";

export default function useIdentifikasi() {
  const params = useParams();

  const [identifikasiData, setIdentifikasiData] = useState(null);
  const [loadingIdentifikasi, setLoadingIdentifikasi] = useState(true);
  const [identifikasiError, setIdentifikasiError] = useState("");

  const fetchIdentifikasi = useCallback(async () => {
    if (!params?.id) return;

    try {
      setLoadingIdentifikasi(true);
      setIdentifikasiError("");

      const response = await api.get(
        `/api/identifikasi/${params.id}`
      );

      setIdentifikasiData(response.data?.data ?? null);
    } catch (error) {
      console.error("Gagal mengambil data identifikasi:", error);

      setIdentifikasiError(
        error.response?.data?.message ||
          "Gagal mengambil data identifikasi."
      );
    } finally {
      setLoadingIdentifikasi(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchIdentifikasi();
  }, [fetchIdentifikasi]);

  return {
    identifikasiData,
    loadingIdentifikasi,
    identifikasiError,
    fetchIdentifikasi,
  };
}