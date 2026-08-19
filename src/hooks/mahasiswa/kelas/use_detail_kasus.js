import { useEffect, useState } from "react";
import { getKasus } from "@/services/mahasiswa/kelas/kasus";

export default function useDetailKasus(kelasId) {
  const [kasus, setKasus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKasus = async () => {
      try {
        setLoading(true);

        const data = await getKasus();

        const detailKasus = data.find(
          (item) => item.KelasID === Number(kelasId)
        );

        setKasus(detailKasus);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (kelasId) {
      fetchKasus();
    }
  }, [kelasId]);

  return {
    kasus,
    loading,
  };
}