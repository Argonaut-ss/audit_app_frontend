import api from "@/services/api";

export async function getProsedur(AsetTetapId) {
  const response = await api.get(
    `/api/aset-tetaps/${AsetTetapId}/prosedur`
  );

  return response.data;
}

export async function createProsedur(data) {
  const response = await api.post("/api/prosedur-aset-tetap", data);

  return response.data;
}

export async function updateProsedur(prosedurId, data) {
  const response = await api.put(
    `/api/prosedur-aset-tetap/${prosedurId}`,
    data
  );

  return response.data;
}

export async function deleteProsedur(prosedurId) {
  const response = await api.delete(
    `/api/prosedur-aset-tetap/${prosedurId}`
  );

  return response.data;
}

export async function saveAllProsedur(data) {
  const response = await api.post("/api/prosedur-aset-tetap", data);

  return response.data;
}