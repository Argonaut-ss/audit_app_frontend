"use client";

import { useCallback, useEffect, useState } from "react";

import {
	deleteDokumentasiAsetLain,
	getDokumentasiAsetLain,
	saveDokumentasiAsetLain,
} from "@/services/mahasiswa/tugas/audit/aset_lain_lain/dokumentasi/dokumentasi";

export default function useDokumentasi({ asetLainId }) {
	const [dokumentasiList, setDokumentasiList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const fetchDokumentasi = useCallback(async () => {
		if (!asetLainId) {
			setDokumentasiList([]);
			setError("");
			return;
		}

		setLoading(true);
		try {
			setError("");
			const data = await getDokumentasiAsetLain(asetLainId);
			setDokumentasiList(Array.isArray(data) ? data : []);
		} catch (requestError) {
			console.error("Gagal mengambil dokumentasi aset lain-lain:", requestError);
			setError(
				requestError.response?.data?.message ||
				"Gagal mengambil dokumentasi aset lain-lain."
			);
		} finally {
			setLoading(false);
		}
	}, [asetLainId]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchDokumentasi();
	}, [fetchDokumentasi]);

	const saveAll = async (rows) => {
		if (!asetLainId) {
			throw new Error("ID aset lain-lain tidak ditemukan.");
		}

		const data = await saveDokumentasiAsetLain(asetLainId, rows);
		setDokumentasiList(Array.isArray(data) ? data : []);
		return data;
	};

	const remove = async (dokumentasiId) => {
		await deleteDokumentasiAsetLain(dokumentasiId);
		await fetchDokumentasi();
	};

	return {
		dokumentasiList,
		loading,
		error,
		saveAll,
		remove,
	};
}
