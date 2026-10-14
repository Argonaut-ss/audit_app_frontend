import api from "@/services/api";

export async function getDokumentasiAsetLain(asetLainId) {
	const response = await api.get("/api/dokumentasi-aset-lain", {
		params: { AsetLainID: asetLainId },
	});

	return response.data?.data ?? [];
}

export async function saveDokumentasiAsetLain(asetLainId, rows) {
	const response = await api.post("/api/dokumentasi-aset-lain", {
		AsetLainID: asetLainId,
		rows,
	});

	return response.data?.data ?? [];
}

export async function deleteDokumentasiAsetLain(dokumentasiId) {
	const response = await api.delete(
		`/api/dokumentasi-aset-lain/${dokumentasiId}`
	);

	return response.data;
}
