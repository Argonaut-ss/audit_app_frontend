import api from "@/services/api";

export async function getRekeningKoran(setaraKasId, page = 1) {
  const response = await api.get(
    `/api/setara-kas/${setaraKasId}/rekening-koran`,
    {
      params: {
        page,
      },
    }
  );

  return response.data;
}

export async function createRekeningKoran(setaraKasId, data) {
  const formData = new FormData();

  formData.append("NamaFile", data.namaFile.trim());
  formData.append("File", data.file);

  const response = await api.post(
    `/api/setara-kas/${setaraKasId}/rekening-koran`,
    formData
  );

  return response.data;
}

export async function deleteRekeningKoran(rekeningKoranId) {
  const response = await api.delete(
    `/api/rekening-koran-setara-kas/${rekeningKoranId}`
  );

  return response.data;
}

export async function updateRekeningKoran(rekeningKoranId, data) {
  const formData = new FormData();

  formData.append("NamaFile", data.namaFile.trim());

  if (data.file) {
    formData.append("File", data.file);
  }

  // Method spoofing Laravel untuk multipart/form-data
  formData.append("_method", "PUT");

  const response = await api.post(
    `/api/rekening-koran-setara-kas/${rekeningKoranId}`,
    formData
  );

  return response.data;
}

export async function getRekeningKoranById(rekeningKoranId) {
  const response = await api.get(
    `/api/rekening-koran-setara-kas/${rekeningKoranId}`
  );

  return response.data;
}
