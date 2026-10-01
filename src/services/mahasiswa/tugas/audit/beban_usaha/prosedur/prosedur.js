import api from "@/services/api";

export async function getProsedur(BebanUsahaId) {
  const response = await api.get(
    `/api/beban-usahas/${BebanUsahaId}/prosedur`
  );

  return response.data;
}

export async function createProsedur(data) {
  const response = await api.post("/api/prosedur-beban-usaha", data);

  return response.data;
}

export async function updateProsedur(prosedurId, data) {
  const response = await api.put(
    `/api/prosedur-beban-usaha/${prosedurId}`,
    data
  );

  return response.data;
}

export async function deleteProsedur(prosedurId) {
  const response = await api.delete(
    `/api/prosedur-beban-usaha/${prosedurId}`
  );

  return response.data;
}

export async function saveAllProsedur(data) {
  const response = await api.post("/api/prosedur-beban-usaha", data);

  return response.data;
}