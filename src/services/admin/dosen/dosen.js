import api from "../../api";

export const importDosen = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/api/dosens/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getDosen = async (params = {}) => {
    const response = await api.get("/api/dosens", {
      params,
    });
  
    return response.data;
  };

  export const deleteDosen = async (id) => {
    const response = await api.delete(`/api/dosens/${id}`);
  
    return response.data;
  };

  export const updateDosen = async (id, data) => {
    const response = await api.put(`/api/dosens/${id}`, data);
  
    return response.data;
  };