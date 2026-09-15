import api from "@/services/api";

const basePath = "/api/rekonsiliasi-piutang";

export async function getRekonsiliasiPiutang(piutangId) {
  const response = await api.get(basePath, {
    params: { PiutangID: piutangId },
  });

  return {
    items: response.data?.data ?? [],
    customerOptions: response.data?.customer_options ?? [],
  };
}

export async function createRekonsiliasiPiutang(piutangId, data) {
  const response = await api.post(basePath, {
    PiutangID: piutangId,
    ...data,
  });

  return response.data?.data;
}

export async function updateRekonsiliasiPiutang(piutangId, itemId, data) {
  if (!piutangId) {
    throw new Error("Piutang ID wajib tersedia untuk memperbarui rekonsiliasi.");
  }

  const response = await api.put(`${basePath}/${itemId}`, data);
  return response.data?.data;
}

export async function deleteRekonsiliasiPiutang(piutangId, itemId) {
  if (!piutangId) {
    throw new Error("Piutang ID wajib tersedia untuk menghapus rekonsiliasi.");
  }

  await api.delete(`${basePath}/${itemId}`);
}
