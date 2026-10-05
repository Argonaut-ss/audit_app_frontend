import api from "@/services/api";

export async function getAsetTetap(jwbKasusId) {
  const response = await api.get(`/api/aset-tetap/${jwbKasusId}`);
  return response.data?.data ?? null;
}

export async function updateAsetTetap(jwbKasusId, data) {
  const response = await api.put(
    `/api/aset-tetap/${jwbKasusId}`,
    data
  );

  return response.data;
}
