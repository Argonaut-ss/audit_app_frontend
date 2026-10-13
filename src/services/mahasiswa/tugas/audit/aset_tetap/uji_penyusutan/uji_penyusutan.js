import api from "@/services/api";

export async function getUjiPenyusutan(asetTetapId, page = 1) {
  const response = await api.get(
    `/api/aset-tetap/${asetTetapId}/uji-penyusutan`,
    {
      params: {
        page,
      },
    }
  );

  return response.data;
}

export async function createUjiPenyusutan(asetTetapId, data) {
  const formData = new FormData();

  formData.append("NamaFile", data.namaFile.trim());
  formData.append("File", data.file);

  const response = await api.post(
    `/api/aset-tetap/${asetTetapId}/uji-penyusutan`,
    formData
  );

  return response.data;
}

export async function deleteUjiPenyusutan(penyusutanId) {
  const response = await api.delete(
    `/api/uji-penyusutan-aset-tetap/${penyusutanId}`
  );

  return response.data;
}

export async function updateUjiPenyusutan(penyusutanId, data) {
  const formData = new FormData();

  formData.append("NamaFile", data.namaFile.trim());

  if (data.file) {
    formData.append("File", data.file);
  }

  // Method spoofing Laravel untuk multipart/form-data
  formData.append("_method", "PUT");

  const response = await api.post(
    `/api/uji-penyusutan-aset-tetap/${penyusutanId}`,
    formData
  );

  return response.data;
}

export async function getUjiPenyusutanById(penyusutanId) {
  const response = await api.get(
    `/api/uji-penyusutan-aset-tetap/${penyusutanId}`
  );

  return response.data;
}
