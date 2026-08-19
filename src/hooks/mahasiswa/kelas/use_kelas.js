import { useEffect, useState } from "react";

import { getKelas } from "@/services/mahasiswa/kelas/kelas";

export const useKelas = () => {
  const [kelasList, setKelasList] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const data = await getKelas();

        setKelasList(data);
      } catch (error) {
        console.error("Gagal mengambil data kelas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKelas();
  }, []);

  return {
    kelasList,
    loading,
  };
};