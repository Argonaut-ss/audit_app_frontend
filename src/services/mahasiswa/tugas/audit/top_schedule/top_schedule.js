import api from "@/services/api";

export async function getTopSchedule(jwbKasusId, top = "A") {
  const response = await api.get(`/api/top-schedule/${jwbKasusId}?top=${top}`);
  return response.data?.data ?? null;
}

export async function saveTopSchedule(jwbKasusId, payload) {
  const response = await api.post(`/api/top-schedule/${jwbKasusId}`, payload);
  return response.data;
}

