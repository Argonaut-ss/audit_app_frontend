"use client";

import { useEffect, useState } from "react";

import AlertSuccess from "@/components/alert/alert_success";
import JurnalKoreksiTable from "@/components/pengujian_substantif/jurnal_koreksi/JurnalKoreksiTable";
import { getCoa } from "@/services/mahasiswa/tugas/audit/coa/coa";

const getLocalJournalId = (() => {
	let nextId = 0;
	return () => `aset-tetap-${Date.now()}-${++nextId}`;
})();

export default function JurnalKoreksiAsetTetap({ auditId }) {
	const [journals, setJournals] = useState([]);
	const [coaOptions, setCoaOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(Boolean(auditId));
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		if (!auditId) {
			setIsLoading(false);
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
			.catch(() => {
				if (isMounted) setCoaOptions([]);
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [auditId]);

	const handleCreate = (journal) => {
		setJournals((current) => [...current, { ...journal, id: getLocalJournalId() }]);
	};

	const handleUpdate = (journalId, journal) => {
		setJournals((current) => current.map((item) => item.id === journalId ? { ...journal, id: journalId } : item));
	};

	const handleDelete = (journalId) => {
		setJournals((current) => current.filter((item) => item.id !== journalId));
	};

	const handleSave = async () => {
		setSuccessMessage("Data jurnal koreksi berhasil disimpan.");
	};

	return (
		<>
			<AlertSuccess message={successMessage} onClose={() => setSuccessMessage("")} />
			<JurnalKoreksiTable
				journals={journals}
				coaOptions={coaOptions}
				isLoading={isLoading}
				onCreate={handleCreate}
				onUpdate={handleUpdate}
				onDelete={handleDelete}
				onSave={handleSave}
			/>
		</>
	);
}