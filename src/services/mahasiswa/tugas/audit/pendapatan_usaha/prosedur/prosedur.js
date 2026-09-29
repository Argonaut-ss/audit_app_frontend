import api from "@/services/api";

export async function getProsedur(PendapatanUsahaId) {
  const response = await api.get(
    `/api/pendapatan-usahas/${PendapatanUsahaId}/prosedur`
  );

  return response.data;
}

export async function createProsedur(data) {
  const response = await api.post("/api/prosedur-pendapatan-usaha", data);

  return response.data;
}

export async function updateProsedur(prosedurId, data) {
  const response = await api.put(
    `/api/prosedur-pendapatan-usaha/${prosedurId}`,
    data
  );

  return response.data;
}

export async function deleteProsedur(prosedurId) {
  const response = await api.delete(
    `/api/prosedur-pendapatan-usaha/${prosedurId}`
  );

  return response.data;
}

export async function saveAllProsedur(data) {
  const response = await api.post("/api/prosedur-pendapatan-usaha", data);

  return response.data;
}