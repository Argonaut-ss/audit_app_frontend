import api from "@/services/api";

export async function getSetaraKas(jwbKasusId) {
  const response = await api.get(`/api/setara-kas/${jwbKasusId}`);
  return response.data?.data ?? null;
}

export async function updateSetaraKas(jwbKasusId, data) {
  const response = await api.put(
    `/api/setara-kas/${jwbKasusId}`,
    data
  );

  return response.data;
}
