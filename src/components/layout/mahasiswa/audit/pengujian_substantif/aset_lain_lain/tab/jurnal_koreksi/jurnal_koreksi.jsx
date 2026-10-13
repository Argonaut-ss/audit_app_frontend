"use client";

import { useEffect, useState } from "react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import JurnalKoreksiTable from "@/components/pengujian_substantif/jurnal_koreksi/JurnalKoreksiTable";
import { getCoa } from "@/services/mahasiswa/tugas/audit/coa/coa";
import { getAsetLainLain } from "@/services/mahasiswa/tugas/audit/aset_lain_lain/aset_lain_lain";
import {
	createJurnalKoreksiAsetLain,
	deleteJurnalKoreksiAsetLain,
	getJurnalKoreksiAsetLain,
	updateJurnalKoreksiAsetLain,
} from "@/services/mahasiswa/tugas/audit/aset_lain_lain/jurnal_koreksi/jurnal_koreksi";

const formatInputAmount = (value) => {
	const digits = String(value ?? "").replace(/\D/g, "");
	return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
};

const toApiAmount = (value) => (
	String(value ?? "").replace(/\D/g, "") || "0"
);

const getErrorMessage = (error, fallback) => (
	error?.response?.data?.message
		|| Object.values(error?.response?.data?.errors ?? {})[0]?.[0]
		|| error?.message
		|| fallback
);

const normalizeJournal = (item) => ({
	id: item.JurnalKoreksiAsetLainID,
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

export default function JurnalKoreksiAsetLainLain({ auditId }) {
	const [journals, setJournals] = useState([]);
	const [asetLainId, setAsetLainId] = useState(null);
	const [coaOptions, setCoaOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(Boolean(auditId));
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		if (!auditId) {
			return undefined;
		}

		let isMounted = true;
		Promise.all([
			getAsetLainLain(auditId),
			getCoa({ jwbKasusId: auditId, page: 1, perPage: 100 }),
		])
			.then(([asetLain, coaResponse]) => {
				if (!isMounted) return;
				const resolvedAsetLainId = asetLain?.AsetLainID ?? null;
				if (!resolvedAsetLainId) {
					throw new Error("Data aset lain-lain belum tersedia.");
				}

				setAsetLainId(resolvedAsetLainId);
				setCoaOptions((coaResponse?.data ?? []).map((account) => ({
					value: String(account.COAID),
					label: account.NamaAkun ?? "",
					accountNumber: account.NoAkun ?? "",
				})));
				return getJurnalKoreksiAsetLain(resolvedAsetLainId);
			})
			.then((items) => {
				if (isMounted && items) {
					setJournals(items.map(normalizeJournal));
				}
			})
			.catch((error) => {
				if (isMounted) {
					setCoaOptions([]);
					setJournals([]);
					setErrorMessage(getErrorMessage(
						error,
						"Data jurnal koreksi aset lain-lain gagal dimuat."
					));
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
		if (!asetLainId) throw new Error("Data aset lain-lain belum tersedia.");
		const saved = await createJurnalKoreksiAsetLain(asetLainId, toPayload(journal));
		setJournals((current) => [...current, normalizeJournal(saved)]);
	};

	const handleUpdate = async (journalId, journal) => {
		const saved = await updateJurnalKoreksiAsetLain(journalId, toPayload(journal));
		setJournals((current) => current.map((item) => (
			item.id === journalId ? normalizeJournal(saved) : item
		)));
	};

	const handleDelete = async (journalId) => {
		await deleteJurnalKoreksiAsetLain(journalId);
		setJournals((current) => current.filter((item) => item.id !== journalId));
	};

	const handleSave = async () => {
		setIsSaving(true);
		setErrorMessage("");
		try {
			setSuccessMessage(
				journals.length
					? "Data jurnal koreksi berhasil disimpan."
					: "Belum ada jurnal koreksi untuk disimpan."
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			<AlertError message={errorMessage} onClose={() => setErrorMessage("")} />
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