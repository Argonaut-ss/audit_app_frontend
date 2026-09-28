import api from "@/services/api";

export async function getPendapatanUsaha(jwbKasusId) {
  const response = await api.get(`/api/pendapatan-usaha/${jwbKasusId}`);
  return response.data?.data ?? null;
}
