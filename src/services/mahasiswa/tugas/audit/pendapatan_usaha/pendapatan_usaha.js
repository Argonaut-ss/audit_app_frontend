import api from "@/services/api";

export async function getPendapatanUsaha(jwbKasusId) {
  const response = await api.get(`/api/pendapatan-usaha/${jwbKasusId}`);
  return response.data?.data ?? null;
}

export async function updatePendapatanUsaha(jwbKasusId, data) {
  const response = await api.put(
    `/api/pendapatan-usaha/${jwbKasusId}`,
    data
  );

  return response.data;
}
