import api from "@/services/api";

export async function getProsedur(UtangUsahaId) {
  const response = await api.get(
    `/api/utang-usahas/${UtangUsahaId}/prosedur`
  );

  return response.data;
}

export async function createProsedur(data) {
  const response = await api.post("/api/prosedur-utang-usaha", data);

  return response.data;
}

export async function updateProsedur(prosedurId, data) {
  const response = await api.put(
    `/api/prosedur-utang-usaha/${prosedurId}`,
    data
  );

  return response.data;
}

export async function deleteProsedur(prosedurId) {
  const response = await api.delete(
    `/api/prosedur-utang-usaha/${prosedurId}`
  );

  return response.data;
}

export async function saveAllProsedur(data) {
  const response = await api.post("/api/prosedur-utang-usaha", data);

  return response.data;
}