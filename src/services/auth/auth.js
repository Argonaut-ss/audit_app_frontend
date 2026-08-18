import api from "@/services/api";

export const login = async (credentials) => {
  const response = await api.post("/api/login", credentials);

  return response.data;
};

export const logout = async () => {
  const response = await api.post("/api/logout");

  return response.data;
};