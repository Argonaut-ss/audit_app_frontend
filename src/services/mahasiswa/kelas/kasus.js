import api from "@/services/api";

export const getKasus = async () => {
  const response = await api.get("/api/kasus");

  return response.data;
};

export const downloadKasusFile = async (kasusId) => {
  const response = await api.get(
    `/api/kasus/${kasusId}/file`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};