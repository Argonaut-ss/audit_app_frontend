import api from "@/services/api";

const basePath = "/api/jurnal-koreksi-piutang";

export async function getJurnalKoreksiPiutang(piutangId) {
  const response = await api.get(basePath, {
    params: { PiutangID: piutangId },
  });

  return response.data?.data ?? [];
}

export async function createJurnalKoreksiPiutang(piutangId, data) {
  const response = await api.post(basePath, {
    PiutangID: piutangId,
    ...data,
  });

  return response.data?.data;
}

export async function updateJurnalKoreksiPiutang(piutangId, itemId, data) {
  if (!piutangId) {
    throw new Error("Piutang ID wajib tersedia untuk memperbarui jurnal koreksi.");
  }

  const response = await api.put(`${basePath}/${itemId}`, data);
  return response.data?.data;
}

export async function deleteJurnalKoreksiPiutang(piutangId, itemId) {
  if (!piutangId) {
    throw new Error("Piutang ID wajib tersedia untuk menghapus jurnal koreksi.");
  }

  await api.delete(`${basePath}/${itemId}`);
}
