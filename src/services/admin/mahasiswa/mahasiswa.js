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