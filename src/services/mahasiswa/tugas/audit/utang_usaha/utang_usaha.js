import api from "@/services/api";

export async function getUtangUsaha(jwbKasusId) {
  const response = await api.get(`/api/utang-usaha/${jwbKasusId}`);
  return response.data?.data ?? null;
}

export async function updateUtangUsaha(jwbKasusId, data) {
  const response = await api.put(
    `/api/utang-usaha/${jwbKasusId}`,
    data
  );

  return response.data;
}
