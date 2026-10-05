import api from "@/services/api";

export async function getKas(jwbKasusId) {
  const response = await api.get(`/api/kas/${jwbKasusId}`);
  return response.data?.data ?? null;
}

export async function updateKas(jwbKasusId, data) {
  const response = await api.put(
    `/api/kas/${jwbKasusId}`,
    data
  );

  return response.data;
}
