import api from "@/services/api";

const basePath = "/api/test-pricing-persediaan";

export async function getTestPricingPersediaan(persediaanId) {
  const response = await api.get(basePath, {
    params: { PersediaanID: persediaanId },
  });

  return response.data?.data ?? [];
}

export async function saveTestPricingPersediaan(persediaanId, rows) {
  const response = await api.post(`${basePath}/bulk-save`, {
    PersediaanID: persediaanId,
    rows,
  });

  return response.data?.data ?? [];
}

export async function deleteTestPricingPersediaan(itemId) {
  await api.delete(`${basePath}/${itemId}`);
}
