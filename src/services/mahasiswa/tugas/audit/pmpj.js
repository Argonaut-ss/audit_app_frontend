import api from "@/services/api";

export async function getPmpjRiskConfig() {
  const response = await api.get('/api/pmpj/risk-config');
  return response.data?.data ?? [];
}

export async function getPmpj(jwbKasusId) {
  const response = await api.get(`/api/pmpj/${jwbKasusId}`);
  return response.data?.data ?? null;
}

export async function getPmpjFile(jwbKasusId) {
  const response = await api.get(`/api/pmpj/${jwbKasusId}/file-ktp`, {
    responseType: "blob",
  });

  return response.data;
}

export async function updatePmpj(jwbKasusId, formData) {
  const response = await api.put(`/api/pmpj/${jwbKasusId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
