import { useCallback, useEffect, useState } from "react";
import { getMahasiswa } from "@/services/admin/mahasiswa/mahasiswa";

export const useMahasiswa = () => {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMahasiswa = useCallback(async () => {
    try {
      const result = await getMahasiswa();

      console.log("Data mahasiswa:", result);

      setMahasiswa(result.data);
    } catch (error) {
      console.error(
        "Gagal mengambil data mahasiswa:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMahasiswa();
  }, [fetchMahasiswa]);

  return {
    mahasiswa,
    loading,
    fetchMahasiswa,
  };
};