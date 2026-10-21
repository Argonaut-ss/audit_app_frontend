import api from "@/services/api";

export async function getKonfirmasiBank(setaraKasId, page = 1) {
  const response = await api.get(
    `/api/setara-kas/${setaraKasId}/konfirmasi-bank`,
    {
      params: {
        page,
      },
    }
  );

  return response.data;
}

export async function createKonfirmasiBank(setaraKasId, data) {
  const formData = new FormData();

  formData.append("NamaFile", data.namaFile.trim());
  formData.append("File", data.file);

  const response = await api.post(
    `/api/setara-kas/${setaraKasId}/konfirmasi-bank`,
    formData
  );

  return response.data;
}

export async function deleteKonfirmasiBank(konfirmasiBankId) {
  const response = await api.delete(
    `/api/konfirmasi-bank-setara-kas/${konfirmasiBankId}`
  );

  return response.data;
}

export async function updateKonfirmasiBank(konfirmasiBankId, data) {
  const formData = new FormData();

  formData.append("NamaFile", data.namaFile.trim());

  if (data.file) {
    formData.append("File", data.file);
  }

  // Method spoofing Laravel untuk multipart/form-data
  formData.append("_method", "PUT");

  const response = await api.post(
    `/api/konfirmasi-bank-setara-kas/${konfirmasiBankId}`,
    formData
  );

  return response.data;
}

export async function getKonfirmasiBankById(konfirmasiBankId) {
  const response = await api.get(
    `/api/konfirmasi-bank-setara-kas/${konfirmasiBankId}`
  );

  return response.data;
}
