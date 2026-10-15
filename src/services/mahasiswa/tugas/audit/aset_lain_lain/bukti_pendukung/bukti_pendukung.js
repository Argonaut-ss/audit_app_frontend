import api from "@/services/api";

export async function getBuktiPendukung(asetLainId, page = 1) {
  const response = await api.get(
    `/api/aset-lain/${asetLainId}/bukti-pendukung`,
    {
      params: {
        page,
      },
    }
  );

  return response.data;
}

export async function createBuktiPendukung(asetLainId, data) {
  const formData = new FormData();

  formData.append("NamaFile", data.namaFile.trim());
  formData.append("File", data.file);

  const response = await api.post(
    `/api/aset-lain/${asetLainId}/bukti-pendukung`,
    formData
  );

  return response.data;
}

export async function deleteBuktiPendukung(buktiId) {
  const response = await api.delete(
    `/api/bukti-pendukung-aset-lain/${buktiId}`
  );

  return response.data;
}

export async function updateBuktiPendukung(buktiId, data) {
  const formData = new FormData();

  formData.append("NamaFile", data.namaFile.trim());

  if (data.file) {
    formData.append("File", data.file);
  }

  // Method spoofing Laravel untuk multipart/form-data
  formData.append("_method", "PUT");

  const response = await api.post(
    `/api/bukti-pendukung-aset-lain/${buktiId}`,
    formData
  );

  return response.data;
}

export async function getBuktiPendukungById(buktiId) {
  const response = await api.get(
    `/api/bukti-pendukung-aset-lain/${buktiId}`
  );

  return response.data;
}
