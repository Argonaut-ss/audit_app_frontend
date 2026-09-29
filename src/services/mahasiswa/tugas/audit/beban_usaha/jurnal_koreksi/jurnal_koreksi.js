import api from "@/services/api";

const basePath = "/api/jurnal-koreksi-beban-usaha";

export async function getJurnalKoreksiBebanUsaha(bebanUsahaId) {
  const response = await api.get(basePath, {
    params: { BebanUsahaID: bebanUsahaId },
  });

  return response.data?.data ?? [];
}

export async function createJurnalKoreksiBebanUsaha(bebanUsahaId, data) {
  const response = await api.post(basePath, {
    BebanUsahaID: bebanUsahaId,
    ...data,
  });

  return response.data?.data;
}

export async function updateJurnalKoreksiBebanUsaha(itemId, data) {
  const response = await api.put(`${basePath}/${itemId}`, data);
  return response.data?.data;
}

export async function deleteJurnalKoreksiBebanUsaha(itemId) {
  await api.delete(`${basePath}/${itemId}`);
}
