import api from "@/services/api";

export async function getAsetLainLain(jwbKasusId) {
  const response = await api.get(`/api/aset-lain/${jwbKasusId}`);
  return response.data?.data ?? null;
}

export async function updateAsetLainLain(jwbKasusId, data) {
  const response = await api.put(
    `/api/aset-lain/${jwbKasusId}`,
    data
  );

  return response.data;
}
