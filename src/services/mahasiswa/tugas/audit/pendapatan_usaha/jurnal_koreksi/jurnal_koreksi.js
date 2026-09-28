import api from "@/services/api";

const basePath = "/api/jurnal-koreksi-pendapatan-usaha";

export async function getJurnalKoreksiPendapatanUsaha(pendapatanUsahaId) {
  const response = await api.get(basePath, {
    params: { PendapatanUsahaID: pendapatanUsahaId },
  });

  return response.data?.data ?? [];
}

export async function createJurnalKoreksiPendapatanUsaha(pendapatanUsahaId, data) {
  const response = await api.post(basePath, {
    PendapatanUsahaID: pendapatanUsahaId,
    ...data,
  });

  return response.data?.data;
}

export async function updateJurnalKoreksiPendapatanUsaha(itemId, data) {
  const response = await api.put(`${basePath}/${itemId}`, data);
  return response.data?.data;
}

export async function deleteJurnalKoreksiPendapatanUsaha(itemId) {
  await api.delete(`${basePath}/${itemId}`);
}
