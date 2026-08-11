import api from "../../api";

export const importMahasiswa = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/api/mahasiswas/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getMahasiswa = async (params = {}) => {
  const response = await api.get("/api/mahasiswas", {
    params,
  });

  return response.data;
};

export const deleteMahasiswa = async (id) => {
  const response = await api.delete(`/api/mahasiswas/${id}`);

  return response.data;
};

export const updateMahasiswa = async (id, data) => {
  const response = await api.put(`/api/mahasiswas/${id}`, data);

  return response.data;
};