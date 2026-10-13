import api from "@/services/api";

const basePath = "/api/jurnal-koreksi-aset-lain";

export async function getJurnalKoreksiAsetLain(asetLainId) {
	const response = await api.get(basePath, {
		params: { AsetLainID: asetLainId },
	});

	return response.data?.data ?? [];
}

export async function createJurnalKoreksiAsetLain(asetLainId, data) {
	const response = await api.post(basePath, {
		AsetLainID: asetLainId,
		...data,
	});

	return response.data?.data;
}

export async function updateJurnalKoreksiAsetLain(itemId, data) {
	const response = await api.put(`${basePath}/${itemId}`, data);
	return response.data?.data;
}

export async function deleteJurnalKoreksiAsetLain(itemId) {
	await api.delete(`${basePath}/${itemId}`);
}
