import api from "@/services/api";

export async function getProsedur(piutangId) {
  const response = await api.get(
    `/api/piutangs/${piutangId}/prosedur`
  );

  return response.data;
}

export async function createProsedur(data) {
  const response = await api.post("/api/prosedur", data);

  return response.data;
}

export async function updateProsedur(prosedurId, data) {
  const response = await api.put(
    `/api/prosedur/${prosedurId}`,
    data
  );

  return response.data;
}

export async function deleteProsedur(prosedurId) {
  const response = await api.delete(
    `/api/prosedur/${prosedurId}`
  );

  return response.data;
}