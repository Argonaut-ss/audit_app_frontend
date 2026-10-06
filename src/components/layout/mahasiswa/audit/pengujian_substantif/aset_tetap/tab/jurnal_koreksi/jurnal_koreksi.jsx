"use client";

import { useEffect, useState } from "react";

import AlertSuccess from "@/components/alert/alert_success";
import JurnalKoreksiTable from "@/components/pengujian_substantif/jurnal_koreksi/JurnalKoreksiTable";
import { getCoa } from "@/services/mahasiswa/tugas/audit/coa/coa";
import { getAsetTetap } from "@/services/mahasiswa/tugas/audit/aset_tetap/aset_tetap";
import api from "@/services/api";

const formatInputAmount = (value) => {
	const digits = String(value ?? "").replace(/\D/g, "");
	return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
};

const toApiAmount = (value) => String(value ?? "").replace(/\D/g, "") || "0";

const normalizeJournal = (item) => ({
	id: item.JurnalKoreksiAsetTetapID,
	description: item.Keterangan ?? "",
	rows: (item.pembayaran ?? []).map((payment) => ({
		coaId: String(payment.COAID ?? ""),
		accountName: payment.coa?.NamaAkun ?? "",
		accountNumber: payment.coa?.NoAkun ?? "",
		debit: formatInputAmount(payment.Debet),
		credit: formatInputAmount(payment.Kredit),
	})),
});

const toPayload = (journal) => ({
	Keterangan: journal.description?.trim() || null,
	pembayaran: journal.rows.map((row) => ({
		COAID: Number(row.coaId),
		Debet: toApiAmount(row.debit),
		Kredit: toApiAmount(row.credit),
	})),
});

export default function JurnalKoreksiAsetTetap({ auditId }) {
	const [asetTetapId, setAsetTetapId] = useState(null);
	const [journals, setJournals] = useState([]);
	const [coaOptions, setCoaOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(Boolean(auditId));
	const [isSaving, setIsSaving] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		if (!auditId) {
			setIsLoading(false);
			return undefined;
		}

		let isMounted = true;
		Promise.all([
			getAsetTetap(auditId),
			getCoa({ jwbKasusId: auditId, page: 1, perPage: 100 }),
		])
			.then(([asetTetap, coaResponse]) => {
				if (!isMounted) return null;
				const resolvedAsetTetapId = asetTetap?.AsetTetapID ?? null;
				setAsetTetapId(resolvedAsetTetapId);
				setCoaOptions((coaResponse?.data ?? []).map((account) => ({
					value: String(account.COAID),
					label: account.NamaAkun ?? "",
					accountNumber: account.NoAkun ?? "",
				})));
				return resolvedAsetTetapId
					? api.get("/api/jurnal-koreksi-aset-tetap", { params: { AsetTetapID: resolvedAsetTetapId } })
					: null;
			})
			.then((response) => {
				if (isMounted && response) {
					setJournals((response.data?.data ?? []).map(normalizeJournal));
				}
			})
			.catch(() => {
				if (isMounted) {
					setJournals([]);
					setCoaOptions([]);
				}
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [auditId]);

	const handleCreate = async (journal) => {
		if (!asetTetapId) throw new Error("Data aset tetap belum tersedia.");
		const response = await api.post("/api/jurnal-koreksi-aset-tetap", {
			AsetTetapID: asetTetapId,
			...toPayload(journal),
		});
		setJournals((current) => [...current, normalizeJournal(response.data?.data)]);
	};

	const handleUpdate = async (journalId, journal) => {
		const response = await api.put(`/api/jurnal-koreksi-aset-tetap/${journalId}`, toPayload(journal));
		setJournals((current) => current.map((item) => (
			item.id === journalId ? normalizeJournal(response.data?.data) : item
		)));
	};

	const handleDelete = async (journalId) => {
		await api.delete(`/api/jurnal-koreksi-aset-tetap/${journalId}`);
		setJournals((current) => current.filter((item) => item.id !== journalId));
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await Promise.resolve();
			setSuccessMessage("Data jurnal koreksi berhasil disimpan.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			<AlertSuccess message={successMessage} onClose={() => setSuccessMessage("")} />
			<JurnalKoreksiTable
				journals={journals}
				coaOptions={coaOptions}
				isLoading={isLoading}
				isSaving={isSaving}
				onCreate={handleCreate}
				onUpdate={handleUpdate}
				onDelete={handleDelete}
				onSave={handleSave}
			/>
		</>
	);
}