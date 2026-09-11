"use client";

import { useState } from "react";
import { AlignLeft, FilePenLine, FileText, GripVertical, Plus, Trash2, X } from "lucide-react";

const createJournal = (suffix = "", rows = [
	{ accountName: "Beban Kerugian Piutang", accountNumber: "5-2300", debit: "879.664.324", credit: "0" },
	{ accountName: "Cadangan Kerugian Piutang", accountNumber: "1-1220", debit: "0", credit: "879.664.324" },
]) => ({
	id: `${Date.now()}-${suffix}`,
	rows,
});

const initialJournals = [
	{
		id: "opening",
		rows: [
			{ accountName: "Bank ABC", accountNumber: "1-1111", debit: "53.170.000", credit: "0" },
			{ accountName: "Piutang Dagang", accountNumber: "1-1210", debit: "0", credit: "53.170.000" },
		],
	},
	createJournal("one"),
	createJournal("two"),
	createJournal("three"),
];

const formatAmount = (value) => {
	const digits = String(value ?? "").replace(/\D/g, "") || "0";
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatInputAmount = (value) => {
	const digits = String(value ?? "").replace(/\D/g, "");
	return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
};

const hasAmount = (value) => {
	const digits = String(value ?? "").replace(/\D/g, "");
	return Boolean(digits) && BigInt(digits) > 0n;
};

const accountOptions = [
	{ name: "Beban Kerugian Piutang", number: "5-2300" },
	{ name: "Cadangan Kerugian Piutang", number: "1-1220" },
	{ name: "Bank ABC", number: "1-1111" },
	{ name: "Piutang Dagang", number: "1-1210" },
];

const createDraftRow = (canRemove = false) => ({
	accountName: "",
	accountNumber: "",
	debit: "",
	credit: "",
	canRemove,
});

export default function JurnalKoreksi() {
	const [index, setIndex] = useState("B.10");
	const [journals, setJournals] = useState(initialJournals);
	const [editingId, setEditingId] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [draftRows, setDraftRows] = useState([createDraftRow(), createDraftRow()]);
	const [draftDescription, setDraftDescription] = useState("");

	const openAddJournal = () => {
		setDraftRows([createDraftRow(), createDraftRow()]);
		setDraftDescription("");
		setEditingId(null);
		setIsModalOpen(true);
	};

	const openEditJournal = (journal) => {
		setDraftRows(journal.rows.map((row) => ({ ...row, canRemove: false })));
		setDraftDescription(journal.description ?? "");
		setEditingId(journal.id);
		setIsModalOpen(true);
	};

	const closeAddJournal = () => {
		setIsModalOpen(false);
		setEditingId(null);
	};

	const updateDraftRow = (rowIndex, key, value) => {
		setDraftRows((currentRows) => currentRows.map((row, currentRowIndex) => {
			if (currentRowIndex !== rowIndex) return row;
			if (key === "debit" || key === "credit") return { ...row, [key]: formatInputAmount(value) };
			if (key !== "accountName") return { ...row, [key]: value };
			const account = accountOptions.find((option) => option.name === value);
			return { ...row, accountName: value, accountNumber: account?.number ?? "" };
		}));
	};

	const addDraftRow = () => setDraftRows((currentRows) => [...currentRows, createDraftRow(true)]);

	const removeDraftRow = (rowIndex) => {
		setDraftRows((currentRows) => currentRows.filter((_, currentRowIndex) => currentRowIndex !== rowIndex));
	};

	const saveDraftJournal = () => {
		const rows = draftRows.map(({ canRemove, ...row }) => ({
			...row,
			debit: formatAmount(row.debit),
			credit: formatAmount(row.credit),
		}));
		setJournals((currentJournals) => editingId
			? currentJournals.map((journal) => journal.id === editingId
				? { ...journal, rows, description: draftDescription }
				: journal)
			: [...currentJournals, { ...createJournal(currentJournals.length, rows), description: draftDescription }]
		);
		closeAddJournal();
	};

	const removeJournal = (journalId) => {
		setJournals((currentJournals) => currentJournals.filter(({ id }) => id !== journalId));
		setEditingId((currentId) => (currentId === journalId ? null : currentId));
	};

	const updateRow = (journalId, rowIndex, key, value) => {
		setJournals((currentJournals) => currentJournals.map((journal) => {
			if (journal.id !== journalId) return journal;
			return { ...journal, rows: journal.rows.map((row, currentRowIndex) => currentRowIndex === rowIndex ? { ...row, [key]: value } : row) };
		}));
	};

	return (
		<section className="min-h-[680px] rounded-xl border border-[#DCE5EF] bg-white px-4 pb-6 pt-4">
			<div className="mb-3 flex items-end justify-between gap-4">
				<div>
					<label htmlFor="jurnal-index" className="mb-1.5 block font-poppins text-xs font-semibold text-[#475569]">Index</label>
					<div className="relative w-[155px]">
						<span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">♙</span>
						<input id="jurnal-index" value={index} onChange={(event) => setIndex(event.target.value)} className="h-9 w-full rounded-md border border-[#DCE5EF] bg-[#F8FAFC] pl-7 pr-2 font-poppins text-xs text-[#64748B] outline-none focus:border-[#38BDF8]" />
					</div>
				</div>
				<button type="button" onClick={openAddJournal} className="flex h-9 items-center gap-2 rounded-md bg-[#38BDF8] px-4 font-poppins text-xs font-medium text-white transition hover:bg-[#159BD7]"><Plus size={14} />Tambah Data</button>
			</div>

			<div className="overflow-x-auto rounded-lg border border-[#DCE5EF]">
				<div className="min-w-[590px]">
					<div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_56px] items-center border-b border-[#DCE5EF] bg-[#F8FAFC] px-3 py-3">
						{["Nama Akun", "Nomor Akun", "Debet", "Kredit", "Aksi"].map((heading) => <div key={heading} className="font-poppins text-[11px] font-semibold uppercase text-[#64748B]">{heading}</div>)}
					</div>

					{journals.map((journal) => {
						const isEditing = editingId === journal.id;
						return (
							<div key={journal.id}>
								{journal.rows.map((row, rowIndex) => <div key={`${journal.id}-${rowIndex}`} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_56px] items-center border-b border-[#EEF2F6] px-3 py-2 last:border-b-0">
									{["accountName", "accountNumber", "debit", "credit"].map((key) => <div key={key} className="px-1 font-poppins text-xs text-[#64748B]">{isEditing ? <input value={row[key]} onChange={(event) => updateRow(journal.id, rowIndex, key, event.target.value)} className="h-7 w-full rounded border border-[#DCE5EF] px-2 font-poppins text-xs text-[#475569] outline-none focus:border-[#38BDF8]" /> : key === "debit" || key === "credit" ? `Rp ${formatAmount(row[key])}` : row[key]}</div>)}
												{row.canRemove ? (
													<button type="button" aria-label={`Hapus baris ${rowIndex + 1}`} onClick={() => removeDraftRow(rowIndex)} className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#EF4444] transition hover:bg-[#FEE2E2]"><Trash2 size={16} /></button>
												) : <div />}
								</div>)}
								<div className="flex items-center justify-between border-b border-[#DCE5EF] px-3 py-2.5"><span className="font-poppins text-xs font-semibold text-[#334155]">Koreksi Atas</span><div className="flex items-center gap-2"><button type="button" aria-label="Edit jurnal" onClick={() => openEditJournal(journal)} className="rounded p-1 text-[#F59E0B] transition hover:bg-[#FFF7ED]"><FilePenLine size={13} /></button><button type="button" aria-label="Hapus jurnal" onClick={() => removeJournal(journal.id)} className="rounded p-1 text-[#F87171] transition hover:bg-[#FEF2F2]"><Trash2 size={13} /></button></div></div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="mt-5 flex justify-end"><button type="button" className="rounded-md bg-[#00A51A] px-6 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#008C16]">Simpan</button></div>

			{isModalOpen && (
				<div className="fixed inset-0 z-[200] flex items-center justify-center bg-transparent px-4 py-6" onMouseDown={(event) => event.target === event.currentTarget && closeAddJournal()}>
					<div className="pointer-events-none absolute inset-0 bg-black/40" aria-hidden="true" />
					<div role="dialog" aria-modal="true" aria-labelledby="jurnal-koreksi-modal-title" className="relative z-10 max-h-[calc(100vh-32px)] w-[min(900px,calc(100vw-32px))] overflow-y-auto rounded-xl bg-white shadow-2xl">
						<div className="flex items-center justify-between bg-[#38BDF8] px-6 py-6 text-white">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15"><FileText size={19} /></div>
								<div>
									<h2 id="jurnal-koreksi-modal-title" className="font-poppins text-lg font-semibold leading-tight">{editingId ? "Edit Jurnal Koreksi" : "Input Jurnal Koreksi"}</h2>
									<p className="font-poppins text-[9px] leading-tight text-white/80">{editingId ? "Perbarui detail jurnal koreksi pengujian audit" : "Tambahkan detail jurnal koreksi pengujian audit"}</p>
								</div>
							</div>
							<button type="button" aria-label="Tutup modal" onClick={closeAddJournal} className="rounded-md p-1 text-white/80 transition hover:bg-white/15 hover:text-white"><X size={17} /></button>
						</div>

						<div className="px-[22px] pb-6 pt-5">
							<div className="overflow-x-auto">
								<div className="min-w-0">
									<div className="grid grid-cols-[24px_1.3fr_1fr_1fr_1fr_80px] items-center rounded-t-md bg-[#F1F5F9] px-2 py-3">
										<div />
										{["Nama Akun", "Nomor Akun", "Debet", "Kredit"].map((heading) => <div key={heading} className="px-1 font-poppins text-[11px] font-semibold text-[#475569]">{heading}</div>)}
										<button type="button" onClick={addDraftRow} className="flex w-full items-center justify-center gap-1 rounded-md bg-[#10B981] px-2 py-1.5 font-poppins text-xs font-medium text-white transition hover:bg-[#059669]"><span aria-hidden="true">+</span>Tambah</button>
									</div>

									{draftRows.map((row, rowIndex) => (
										<div key={`draft-${rowIndex}`} className="grid grid-cols-[24px_1.3fr_1fr_1fr_1fr_80px] items-center border-b border-[#EEF2F6] px-2 py-2.5">
											<div className="text-[#CBD5E1]"><GripVertical size={14} /></div>
											<select value={row.accountName} onChange={(event) => updateDraftRow(rowIndex, "accountName", event.target.value)} className="mx-1 h-10 min-w-0 rounded-md border border-[#DCE5EF] bg-white px-2 font-poppins text-xs text-[#64748B] outline-none focus:border-[#38BDF8]">
												<option value="">Pilih Akun</option>
												{accountOptions.map((account) => <option key={account.number} value={account.name}>{account.name}</option>)}
											</select>
											<input value={row.accountNumber} readOnly placeholder="Nomor Akun" className="mx-1 h-10 min-w-0 rounded-md border border-[#DCE5EF] bg-[#F8FAFC] px-2 font-poppins text-xs text-[#94A3B8] outline-none" />
											<div className="relative mx-1 min-w-0">
												<span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-poppins text-[10px] text-[#94A3B8]">Rp</span>
												<input value={row.debit} disabled={hasAmount(row.credit)} onChange={(event) => updateDraftRow(rowIndex, "debit", event.target.value)} placeholder="0" className="h-10 w-full min-w-0 rounded-md border border-[#DCE5EF] px-2 pl-8 font-poppins text-xs text-[#475569] outline-none focus:border-[#38BDF8] disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]" />
											</div>
											<div className="relative mx-1 min-w-0">
												<span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-poppins text-[10px] text-[#94A3B8]">Rp</span>
												<input value={row.credit} disabled={hasAmount(row.debit)} onChange={(event) => updateDraftRow(rowIndex, "credit", event.target.value)} placeholder="0" className="h-10 w-full min-w-0 rounded-md border border-[#DCE5EF] px-2 pl-8 font-poppins text-xs text-[#475569] outline-none focus:border-[#38BDF8] disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]" />
											</div>
											{row.canRemove ? (
												<button type="button" aria-label={`Hapus baris ${rowIndex + 1}`} onClick={() => removeDraftRow(rowIndex)} className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-[#EF4444] transition hover:bg-[#FEF2F2]"><Trash2 size={16} /></button>
											) : <div />}
										</div>
									))}
								</div>
							</div>
							<div className="mt-4">
								<label htmlFor="jurnal-description" className="mb-1.5 block font-poppins text-xs font-semibold text-[#475569]">Keterangan</label>
								<div className="relative">
									<div className="pointer-events-none absolute left-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-[#F1F5F9] text-[#64748B] leading-none">
										<AlignLeft size={16} className="shrink-0" />
									</div>
									<input id="jurnal-description" type="text" value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} placeholder="Keterangan atas..." className="h-[50px] w-full rounded-lg border border-[#DCE5EF] pb-1 pl-[58px] pr-3 font-poppins text-xs text-[#475569] outline-none focus:border-[#38BDF8]" />
								</div>
							</div>

							<div className="mt-6 flex justify-end gap-2 border-t border-[#EEF2F6] pt-5">
								<button type="button" onClick={closeAddJournal} className="rounded-md bg-[#FF3030] px-6 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#E11D1D]">Keluar</button>
								<button type="button" onClick={saveDraftJournal} className="rounded-md bg-[#00A51A] px-6 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#008C16]">Simpan</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
