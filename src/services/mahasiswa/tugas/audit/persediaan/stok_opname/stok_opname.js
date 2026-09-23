import api from "@/services/api";

const basePath = "/api/stok-opname-persediaan";

export async function getStokOpnamePersediaan(persediaanId) {
  const response = await api.get(basePath, {
    params: { PersediaanID: persediaanId },
  });

  return response.data?.data ?? [];
}

export async function saveStokOpnamePersediaan(persediaanId, rows) {
  const response = await api.post(basePath, {
    PersediaanID: persediaanId,
    rows,
  });

  return response.data?.data ?? [];
}

export async function deleteStokOpnamePersediaan(itemId) {
  await api.delete(`${basePath}/${itemId}`);
}
