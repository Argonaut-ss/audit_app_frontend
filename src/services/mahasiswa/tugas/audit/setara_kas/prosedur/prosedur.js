import api from "@/services/api";

export async function getProsedur(SetaraKasId) {
  const response = await api.get(
    `/api/setara-kas/${SetaraKasId}/prosedur`
  );

  return response.data;
}

export async function createProsedur(data) {
  const response = await api.post("/api/prosedur-setara-kas", data);

  return response.data;
}

export async function updateProsedur(prosedurId, data) {
  const response = await api.put(
    `/api/prosedur-setara-kas/${prosedurId}`,
    data
  );

  return response.data;
}

export async function deleteProsedur(prosedurId) {
  const response = await api.delete(
    `/api/prosedur-setara-kas/${prosedurId}`
  );

  return response.data;
}

export async function saveAllProsedur(data) {
  const response = await api.post("/api/prosedur-setara-kas", data);

  return response.data;
}