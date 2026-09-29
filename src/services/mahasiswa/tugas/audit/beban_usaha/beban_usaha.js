import api from "@/services/api";

export async function getBebanUsaha(jwbKasusId) {
  const response = await api.get(`/api/beban-usaha/${jwbKasusId}`);
  return response.data?.data ?? null;
}
