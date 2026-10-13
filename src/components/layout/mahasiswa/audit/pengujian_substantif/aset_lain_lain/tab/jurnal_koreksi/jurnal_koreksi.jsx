"use client";

import { useEffect, useState } from "react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import JurnalKoreksiTable from "@/components/pengujian_substantif/jurnal_koreksi/JurnalKoreksiTable";
import { getCoa } from "@/services/mahasiswa/tugas/audit/coa/coa";

const createJournalId = () => (
	`aset-lain-jurnal-${Date.now()}-${Math.random().toString(36).slice(2)}`
);

const normalizeJournal = (journal) => ({
	id: journal.id || createJournalId(),
	description: journal.description || "",
	rows: journal.rows.map((row) => ({ ...row })),
});

export default function JurnalKoreksiAsetLainLain({ auditId }) {
	const [journals, setJournals] = useState([]);
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
		getCoa({ jwbKasusId: auditId, page: 1, perPage: 100 })
			.then((response) => {
				if (!isMounted) return;
				setCoaOptions((response?.data ?? []).map((account) => ({
					value: String(account.COAID),
					label: account.NamaAkun ?? "",
					accountNumber: account.NoAkun ?? "",
				})));
			})
			.catch((error) => {
				if (isMounted) {
					setCoaOptions([]);
					setErrorMessage(error?.message || "Daftar COA gagal dimuat.");
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
		setJournals((current) => [...current, normalizeJournal(journal)]);
	};

	const handleUpdate = async (journalId, journal) => {
		setJournals((current) => current.map((item) => (
			item.id === journalId ? normalizeJournal({ ...journal, id: journalId }) : item
		)));
	};

	const handleDelete = async (journalId) => {
		setJournals((current) => current.filter((item) => item.id !== journalId));
	};

	const handleSave = async () => {
		setIsSaving(true);
		setErrorMessage("");
		try {
			setSuccessMessage(
				journals.length
					? "Data jurnal koreksi tersimpan di halaman ini."
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