import api from "@/services/api";

const basePath = "/api/cut-off-beban-usaha";

export async function getCutOffBebanUsaha(bebanUsahaId) {
  const response = await api.get(basePath, {
    params: { BebanUsahaID: bebanUsahaId },
  });

  return response.data?.data ?? [];
}

export async function saveCutOffBebanUsaha(bebanUsahaId, rows) {
  const response = await api.post(basePath, {
    BebanUsahaID: bebanUsahaId,
    rows,
  });

  return response.data?.data ?? [];
}

export async function deleteCutOffBebanUsaha(itemId) {
  await api.delete(`${basePath}/${itemId}`);
}
