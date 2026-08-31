"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPmpj } from "@/services/mahasiswa/tugas/audit/pmpj";

export default function usePmpj() {
  const params = useParams();

  const [pmpjData, setPmpjData] = useState(null);
  const [loadingPmpj, setLoadingPmpj] = useState(true);
  const [pmpjError, setPmpjError] = useState("");

  const fetchPmpj = useCallback(async () => {
    if (!params?.id) return;

    try {
      setLoadingPmpj(true);
      setPmpjError("");

      const data = await getPmpj(params.id);
      setPmpjData(data);
    } catch (error) {
      console.error("Gagal mengambil data PMPJ:", error);
      setPmpjError(
        error.response?.data?.message ||
          "Gagal mengambil data PMPJ."
      );
    } finally {
      setLoadingPmpj(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchPmpj();
  }, [fetchPmpj]);

  return {
    pmpjData,
    loadingPmpj,
    pmpjError,
    fetchPmpj,
  };
}
