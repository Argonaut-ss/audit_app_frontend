import api from "@/services/api";

const basePath = "/api/jurnal-koreksi-setara-kas";

export async function getJurnalKoreksiSetaraKas(setaraKasId) {
	const response = await api.get(basePath, {
		params: { SetaraKasID: setaraKasId },
	});

	return response.data?.data ?? [];
}

export async function createJurnalKoreksiSetaraKas(setaraKasId, data) {
	const response = await api.post(basePath, {
		SetaraKasID: setaraKasId,
		...data,
	});

	return response.data?.data;
}

export async function updateJurnalKoreksiSetaraKas(itemId, data) {
	const response = await api.put(`${basePath}/${itemId}`, data);
	return response.data?.data;
}

export async function deleteJurnalKoreksiSetaraKas(itemId) {
	await api.delete(`${basePath}/${itemId}`);
}
