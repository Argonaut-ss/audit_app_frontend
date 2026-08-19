// src/services/mahasiswa/kelas/kelas.js

import api from "@/services/api";

export const getKelas = async () => {
  const response = await api.get("/api/kelas-card");

  return response.data.data;
};