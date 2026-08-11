import { useCallback, useEffect, useState } from "react";
import { getDosen } from "@/services/admin/dosen/dosen";

export const useDosen = () => {
  const [dosen, setDosen] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDosen = useCallback(async () => {
    try {
      const result = await getDosen();

      console.log("Data dosen:", result);

      setDosen(result.data);
    } catch (error) {
      console.error(
        "Gagal mengambil data dosen:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDosen();
  }, [fetchDosen]);

  return {
    dosen,
    loading,
    fetchDosen,
  };
};