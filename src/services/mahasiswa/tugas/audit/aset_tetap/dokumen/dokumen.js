import api from "@/services/api";

export async function getDokumen(asetTetapId, page = 1) {
  const response = await api.get(
    `/api/aset-tetap/${asetTetapId}/dokumen`,
    {
      params: {
        page,
      },
    }
  );

  return response.data;
}

export async function createDokumen(asetTetapId, data) {
    const formData = new FormData();
  
    formData.append("TipeFile", data.tipeFile);
  
    if (data.namaFile?.trim()) {
      formData.append("NamaFile", data.namaFile.trim());
    }
  
    formData.append("File", data.file);
  
    const response = await api.post(
      `/api/aset-tetap/${asetTetapId}/dokumen`,
      formData
    );
  
    return response.data;
  }

  export async function deleteDokumen(dokumenId) {
    const response = await api.delete(`/api/dokumen-aset-tetap/${dokumenId}`);
  
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
      `/api/dokumen-aset-tetap/${dokumenId}`,
      formData
    );
  
    return response.data;
  }

  export async function getDokumenById(dokumenId) {
    const response = await api.get(`/api/dokumen-aset-tetap/${dokumenId}`);
  
    return response.data;
  }