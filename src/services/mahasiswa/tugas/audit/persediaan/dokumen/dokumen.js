import api from "@/services/api";

export async function getDokumen(utangUsahaId, page = 1) {
  const response = await api.get(
    `/api/persediaan/${utangUsahaId}/dokumen`,
    {
      params: {
        page,
      },
    }
  );

  return response.data;
}

export async function createDokumen(utangUsahaId, data) {
    const formData = new FormData();
  
    formData.append("TipeFile", data.tipeFile);
  
    if (data.namaFile?.trim()) {
      formData.append("NamaFile", data.namaFile.trim());
    }
  
    formData.append("File", data.file);
  
    const response = await api.post(
      `/api/persediaan/${utangUsahaId}/dokumen`,
      formData
    );
  
    return response.data;
  }

  export async function deleteDokumen(dokumenId) {
    const response = await api.delete(`/api/dokumen-persediaan/${dokumenId}`);
  
    return response.data;
  }

  export async function updateDokumen(dokumenId, data) {
    const formData = new FormData();
  
    formData.append("TipeFile", data.tipeFile);
  
    if (data.namaFile?.trim()) {
      formData.append("NamaFile", data.namaFile.trim());
    }
  
    if (data.file) {
      formData.append("File", data.file);
    }
  
    // Method spoofing Laravel untuk multipart/form-data
    formData.append("_method", "PUT");
  
    const response = await api.post(
      `/api/dokumen-persediaan/${dokumenId}`,
      formData
    );
  
    return response.data;
  }

  export async function getDokumenById(dokumenId) {
    const response = await api.get(`/api/dokumen-persediaan/${dokumenId}`);
  
    return response.data;
  }