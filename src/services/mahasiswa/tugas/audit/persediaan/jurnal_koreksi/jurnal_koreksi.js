import api from "@/services/api";

const basePath = "/api/jurnal-koreksi-persediaan";

export async function getJurnalKoreksiPersediaan(persediaanId) {
  const response = await api.get(basePath, {
    params: { PersediaanID: persediaanId },
  });

  return response.data?.data ?? [];
}

export async function createJurnalKoreksiPersediaan(persediaanId, data) {
  const response = await api.post(basePath, {
    PersediaanID: persediaanId,
    ...data,
  });

  return response.data?.data;
}

export async function updateJurnalKoreksiPersediaan(itemId, data) {
  const response = await api.put(`${basePath}/${itemId}`, data);
  return response.data?.data;
}

export async function deleteJurnalKoreksiPersediaan(itemId) {
  await api.delete(`${basePath}/${itemId}`);
}
