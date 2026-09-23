import api from "@/services/api";

const basePath = "/api/rekonsiliasi-utang-usaha";

export async function getRekonsiliasiUtangUsaha(utangUsahaId) {
  const response = await api.get(basePath, {
    params: { UtangUsahaID: utangUsahaId },
  });

  return response.data?.data ?? [];
}

export async function getKonfirmasiUtangUsaha() {
  const response = await api.get("/api/konfirmasi-utang-usaha");
  return response.data?.data ?? [];
}

export async function createRekonsiliasiUtangUsaha(utangUsahaId, data) {
  const response = await api.post(basePath, {
    UtangUsahaID: utangUsahaId,
    ...data,
  });

  return response.data?.data;
}

export async function updateRekonsiliasiUtangUsaha(itemId, data) {
  const response = await api.put(`${basePath}/${itemId}`, data);
  return response.data?.data;
}

export async function deleteRekonsiliasiUtangUsaha(itemId) {
  await api.delete(`${basePath}/${itemId}`);
}
