"use client";

import { useEffect, useState } from "react";

import AlertSuccess from "@/components/alert/alert_success";
import JurnalKoreksiTable from "@/components/pengujian_substantif/jurnal_koreksi/JurnalKoreksiTable";
import { getCoa } from "@/services/mahasiswa/tugas/audit/coa/coa";
import { getPendapatanUsaha } from "@/services/mahasiswa/tugas/audit/pendapatan_usaha/pendapatan_usaha";
import {
	createJurnalKoreksiPendapatanUsaha,
	deleteJurnalKoreksiPendapatanUsaha,
	getJurnalKoreksiPendapatanUsaha,
	updateJurnalKoreksiPendapatanUsaha,
} from "@/services/mahasiswa/tugas/audit/pendapatan_usaha/jurnal_koreksi/jurnal_koreksi";

const formatInputAmount = (value) => {
	const digits = String(value ?? "").replace(/\D/g, "");
	return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
};

const toApiAmount = (value) => String(value ?? "").replace(/\D/g, "") || "0";

const normalizeJournal = (item) => ({
	id: item.JurnalKoreksiPendapatanUsahaID,
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

export default function JurnalKoreksiPendapatanUsaha({ auditId }) {
	const [pendapatanUsahaId, setPendapatanUsahaId] = useState(null);
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
			getPendapatanUsaha(auditId),
			getCoa({ jwbKasusId: auditId, page: 1, perPage: 100 }),
		])
			.then(([pendapatanUsaha, coaResponse]) => {
				if (!isMounted) return null;

				setPendapatanUsahaId(pendapatanUsaha?.PendapatanUsahaID ?? null);
				setCoaOptions((coaResponse.data ?? []).map((account) => ({
					value: String(account.COAID),
					label: account.NamaAkun ?? "",
					accountNumber: account.NoAkun ?? "",
				})));

				return getJurnalKoreksiPendapatanUsaha(pendapatanUsaha?.PendapatanUsahaID);
			})
			.then((items) => {
				if (isMounted && items) setJournals(items.map(normalizeJournal));
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
		if (!pendapatanUsahaId) throw new Error("Data pendapatan usaha belum tersedia.");

		const saved = await createJurnalKoreksiPendapatanUsaha(
			pendapatanUsahaId,
			toPayload(journal)
		);
		setJournals((current) => [...current, normalizeJournal(saved)]);
	};

	const handleUpdate = async (journalId, journal) => {
		const saved = await updateJurnalKoreksiPendapatanUsaha(
			journalId,
			toPayload(journal)
		);
		setJournals((current) => current.map((item) => (
			item.id === journalId ? normalizeJournal(saved) : item
		)));
	};

	const handleDelete = async (journalId) => {
		await deleteJurnalKoreksiPendapatanUsaha(journalId);
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
