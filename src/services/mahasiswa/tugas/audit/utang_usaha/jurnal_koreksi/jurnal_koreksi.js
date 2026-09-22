import api from "@/services/api";

const basePath = "/api/jurnal-koreksi-utang-usaha";

export async function getJurnalKoreksiUtangUsaha(utangUsahaId) {
  const response = await api.get(basePath, {
    params: { UtangUsahaID: utangUsahaId },
  });

  return response.data?.data ?? [];
}

export async function createJurnalKoreksiUtangUsaha(utangUsahaId, data) {
  const response = await api.post(basePath, {
    UtangUsahaID: utangUsahaId,
    ...data,
  });

  return response.data?.data;
}

export async function updateJurnalKoreksiUtangUsaha(itemId, data) {
  const response = await api.put(`${basePath}/${itemId}`, data);
  return response.data?.data;
}

export async function deleteJurnalKoreksiUtangUsaha(itemId) {
  await api.delete(`${basePath}/${itemId}`);
}
