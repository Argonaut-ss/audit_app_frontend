import api from "@/services/api";

const basePath = "/api/cut-off-pendapatan-usaha";

export async function getCutOffPendapatanUsaha(pendapatanUsahaId) {
  const response = await api.get(basePath, {
    params: { PendapatanUsahaID: pendapatanUsahaId },
  });

  return response.data?.data ?? [];
}

export async function saveCutOffPendapatanUsaha(pendapatanUsahaId, rows) {
  const response = await api.post(basePath, {
    PendapatanUsahaID: pendapatanUsahaId,
    rows,
  });

  return response.data?.data ?? [];
}

export async function deleteCutOffPendapatanUsaha(itemId) {
  await api.delete(`${basePath}/${itemId}`);
}
