import api from "@/services/api";

export async function getPersediaan(jwbKasusId) {
  const response = await api.get(`/api/persediaan/${jwbKasusId}`);
  return response.data?.data ?? null;
}

export async function updatePersediaan(jwbKasusId, data) {
  const response = await api.put(
    `/api/persediaan/${jwbKasusId}`,
    data
  );

  return response.data;
}
