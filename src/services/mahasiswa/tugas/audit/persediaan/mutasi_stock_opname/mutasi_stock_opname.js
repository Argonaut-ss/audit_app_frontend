import api from "@/services/api";

export async function getMutasiStockOpname(persediaanId, page = 1) {
  const response = await api.get(
    `/api/persediaan/${persediaanId}/mutasi-stock-opname-persediaan`,
    {
      params: {
        page,
      },
    }
  );

  return response.data;
}

export async function createMutasiStockOpname(persediaanId, data) {
  const formData = new FormData();

  formData.append("NamaFile", data.namaFile.trim());
  formData.append("File", data.file);

  const response = await api.post(
    `/api/persediaan/${persediaanId}/mutasi-stock-opname-persediaan`,
    formData
  );

  return response.data;
}

export async function deleteMutasiStockOpname(mutasiId) {
  const response = await api.delete(
    `/api/mutasi-stock-opname-persediaan/${mutasiId}`
  );

  return response.data;
}

export async function updateMutasiStockOpname(mutasiId, data) {
  const formData = new FormData();

  formData.append("NamaFile", data.namaFile.trim());

  if (data.file) {
    formData.append("File", data.file);
  }

  // Method spoofing Laravel untuk multipart/form-data
  formData.append("_method", "PUT");

  const response = await api.post(
    `/api/mutasi-stock-opname-persediaan/${mutasiId}`,
    formData
  );

  return response.data;
}

export async function getMutasiStockOpnameById(mutasiId) {
  const response = await api.get(
    `/api/mutasi-stock-opname-persediaan/${mutasiId}`
  );

  return response.data;
}
