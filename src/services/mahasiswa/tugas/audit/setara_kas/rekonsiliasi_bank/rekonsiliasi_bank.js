import api from "@/services/api";

const basePath = "/api/rekonsilasi-bank-setara-kas";

export async function getRekonsilasiBank(setaraKasId) {
	const response = await api.get(basePath, {
		params: { SetaraKasID: setaraKasId },
	});

	return response.data ?? { data: [], availableBanks: [] };
}

export async function saveRekonsilasiBank(payload) {
	const response = await api.post(basePath, payload);
	return response.data?.data;
}

export async function deleteRekonsilasiBank(rekonsilasiBankId) {
	const response = await api.delete(`${basePath}/${rekonsilasiBankId}`);
	return response.data;
}

