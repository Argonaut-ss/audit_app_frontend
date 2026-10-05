import api from "@/services/api";

export async function getCashCount(kasId) {
	const response = await api.get(`/api/kas/${kasId}/cash-count`);
	return response.data?.data ?? null;
}

export async function saveCashCount(kasId, payload) {
	const response = await api.post(`/api/kas/${kasId}/cash-count`, payload);
	return response.data?.data ?? null;
}
