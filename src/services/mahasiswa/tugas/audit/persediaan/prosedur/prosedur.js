import api from "@/services/api";

export async function getProsedur(PersediaanId) {
  const response = await api.get(
    `/api/persediaans/${PersediaanId}/prosedur`
  );

  return response.data;
}

export async function createProsedur(data) {
  const response = await api.post("/api/prosedur-persediaan", data);

  return response.data;
}

export async function updateProsedur(prosedurId, data) {
  const response = await api.put(
    `/api/prosedur-persediaan/${prosedurId}`,
    data
  );

  return response.data;
}

export async function deleteProsedur(prosedurId) {
  const response = await api.delete(
    `/api/prosedur-persediaan/${prosedurId}`
  );

  return response.data;
}

export async function saveAllProsedur(data) {
  const response = await api.post("/api/prosedur-persediaan", data);

  return response.data;
}