import api from "@/services/api";

const basePath = (piutangId) => `/api/piutang/${piutangId}/rekonsiliasi-piutang`;

export async function getRekonsiliasiPiutang(piutangId) {
  const response = await api.get(basePath(piutangId));
  return {
    items: response.data?.data ?? [],
    customerOptions: response.data?.customer_options ?? [],
  };
}

export async function createRekonsiliasiPiutang(piutangId, data) {
  const response = await api.post(basePath(piutangId), data);
  return response.data?.data;
}

export async function updateRekonsiliasiPiutang(piutangId, itemId, data) {
  const response = await api.put(`${basePath(piutangId)}/${itemId}`, data);
  return response.data?.data;
}

export async function deleteRekonsiliasiPiutang(piutangId, itemId) {
  await api.delete(`${basePath(piutangId)}/${itemId}`);
}
