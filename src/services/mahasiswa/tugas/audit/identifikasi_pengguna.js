import api from "@/lib/api";

export async function getIdentifikasi(jwbKasusId) {
  const response = await api.get(
    `/api/identifikasi/${jwbKasusId}`
  );

  return response.data?.data ?? null;
}

export async function updateIdentifikasi(
  jwbKasusId,
  data
) {
  const response = await api.put(
    `/api/identifikasi/${jwbKasusId}`,
    data
  );

  return response.data;
}