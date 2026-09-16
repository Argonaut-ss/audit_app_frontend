import api from "@/services/api";

export async function getPiutang(jwbKasusId) {
  const response = await api.get(`/api/piutang/${jwbKasusId}`);
  return response.data?.data ?? null;
}

export async function updatePiutang(jwbKasusId, data) {
  const response = await api.put(
    `/api/piutang/${jwbKasusId}`,
    data
  );

  return response.data;
}
