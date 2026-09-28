"use client";

import { useEffect, useState } from "react";

import JurnalKoreksiTable from "@/components/pengujian_substantif/jurnal_koreksi/JurnalKoreksiTable";
import { getCoa } from "@/services/mahasiswa/tugas/audit/coa/coa";

export default function JurnalKoreksiPendapatanUsaha({ auditId }) {
	const [journals, setJournals] = useState([]);
	const [coaOptions, setCoaOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(Boolean(auditId));

	useEffect(() => {
		if (!auditId) {
			setIsLoading(false);
			return undefined;
		}

		let isMounted = true;

		getCoa({ jwbKasusId: auditId, page: 1, perPage: 100 })
			.then((response) => {
				if (!isMounted) return;

				setCoaOptions((response.data ?? []).map((account) => ({
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

	const handleCreate = async (journal) => {
		setJournals((current) => [
			...current,
			{
				...journal,
				id: Date.now(),
			},
		]);
	};

	const handleUpdate = async (journalId, journal) => {
		setJournals((current) => current.map((item) => (
			item.id === journalId ? { ...journal, id: journalId } : item
		)));
	};

	const handleDelete = async (journalId) => {
		setJournals((current) => current.filter((item) => item.id !== journalId));
	};

	return (
		<JurnalKoreksiTable
			journals={journals}
			coaOptions={coaOptions}
			isLoading={isLoading}
			onCreate={handleCreate}
			onUpdate={handleUpdate}
			onDelete={handleDelete}
			onSave={async () => {}}
		/>
	);
}
