import api from "@/services/api";

const basePath = "/api/jurnal-koreksi-kas";

export async function getJurnalKoreksiKas(kasId) {
	const response = await api.get(basePath, {
		params: { KasID: kasId },
	});

	return response.data?.data ?? [];
}

export async function createJurnalKoreksiKas(kasId, data) {
	const response = await api.post(basePath, {
		KasID: kasId,
		...data,
	});

	return response.data?.data;
}

export async function updateJurnalKoreksiKas(itemId, data) {
	const response = await api.put(`${basePath}/${itemId}`, data);
	return response.data?.data;
}

export async function deleteJurnalKoreksiKas(itemId) {
	await api.delete(`${basePath}/${itemId}`);
}
