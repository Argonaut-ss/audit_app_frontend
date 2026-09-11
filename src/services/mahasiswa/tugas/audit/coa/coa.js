import api from "@/services/api";

export async function getCoa({
  jwbKasusId,
  page = 1,
  perPage = 10,
  search = "",
}) {
  const response = await api.get("/api/coa", {
    params: {
      JwbKasusID: jwbKasusId,
      page,
      per_page: perPage,
      search: search || undefined,
    },
  });

  return response.data;
}

export async function importCoa({
  jwbKasusId,
  file,
}) {
  const formData = new FormData();

  formData.append("JwbKasusID", jwbKasusId);
  formData.append("file", file);

  const response = await api.post(
    "/api/coa/import",
    formData
  );

  return response.data;
}

export async function createCoa(data) {
  const response = await api.post("/api/coa", data);

  return response.data;
}

export async function deleteAllCoa(jwbKasusId) {
  const response = await api.delete(
    `/api/jwb-kasus/${jwbKasusId}/coa`
  );

  return response.data;
}

export async function deleteCoa(coaId) {
  const response = await api.delete(`/api/coa/${coaId}`);

  return response.data;
}

export async function updateCoa(coaId, data) {
  const response = await api.put(
    `/api/coa/${coaId}`,
    data
  );

  return response.data;
}