"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import AddDataButton from "@/components/button/add_data_button";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import SaveButton from "@/components/button/save_button";
import Dropdown from "@/components/ui/dropdown/dropdown";
import { getSetaraKas } from "@/services/mahasiswa/tugas/audit/setara_kas/setara_kas";
import {
	deleteRekonsilasiBank,
	getRekonsilasiBank,
	saveRekonsilasiBank,
} from "@/services/mahasiswa/tugas/audit/setara_kas/rekonsiliasi_bank/rekonsiliasi_bank";

const formatAmount = (value) => (
	String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
);

const parseAmount = (value) => Number(String(value ?? "").replace(/\D/g, "") || 0);
const formatEditableAmount = (value) => (Number(value) > 0 ? formatAmount(value) : "");

const total = (rows = []) => rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

const reconciliationTotal = (bank) => (Number(bank.bankBalance) || 0) + total(bank.bankAdditions) - total(bank.bankReductions);
const bookReconciliationTotal = (bank) => (Number(bank.bookBalance) || 0) + total(bank.bookAdditions) - total(bank.bookReductions);

const isBankEmpty = (bank) => (
	!bank.name
	&& (!bank.bankBalance || Number(bank.bankBalance) === 0)
	&& (!bank.bookBalance || Number(bank.bookBalance) === 0)
	&& [
		...(bank.bankAdditions || []),
		...(bank.bankReductions || []),
		...(bank.bookAdditions || []),
		...(bank.bookReductions || []),
	].every((row) => !String(row.description ?? "").trim() && (!row.amount || Number(row.amount) === 0))
);

const makeBank = (id) => ({
	id,
	name: "",
	CekSaldoID: null,
	bankBalance: 0,
	bookBalance: 0,
	expanded: true,
	bankAdditions: [],
	bankReductions: [],
	bookAdditions: [],
	bookReductions: [],
});

export default function RekonsiliasiBank({ auditId, onSaved, refetchToken }) {
	const [setaraKasId, setSetaraKasId] = useState(null);
	const [banks, setBanks] = useState([]);
	const [availableBanks, setAvailableBanks] = useState([]);
	const [isLoading, setIsLoading] = useState(Boolean(auditId));
	const [savingBankId, setSavingBankId] = useState(null);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [deleteConfirmation, setDeleteConfirmation] = useState(null);

	useEffect(() => {
		if (!auditId) {
			return undefined;
		}

		let isMounted = true;
		getSetaraKas(auditId)
			.then((setaraKas) => {
				if (!isMounted) return null;
				const resolvedSetaraKasId = setaraKas?.SetaraKasID ?? null;
				setSetaraKasId(resolvedSetaraKasId);
				if (!resolvedSetaraKasId) return null;
				return getRekonsilasiBank(resolvedSetaraKasId);
			})
			.then((response) => {
				if (!isMounted || !response) return;
				const rawSaved = response.data ?? [];
				const rawAvail = response.availableBanks ?? [];

				setAvailableBanks(rawAvail);

				setBanks((currentBanks) => {
					const currentByCekSaldo = new Map();
					(currentBanks || []).forEach((b) => {
						if (b.CekSaldoID) {
							currentByCekSaldo.set(Number(b.CekSaldoID), b);
						}
					});

					const savedByCekSaldo = new Map();
					rawSaved.forEach((s) => {
						if (s.CekSaldoID) {
							savedByCekSaldo.set(Number(s.CekSaldoID), s);
						}
					});

					// 1. Sinkronkan semua bank dari Cek Saldo agar langsung tampil di Rekonsiliasi Bank
					const merged = rawAvail.map((avail) => {
						const csId = Number(avail.CekSaldoID);
						const saved = savedByCekSaldo.get(csId);
						const existing = currentByCekSaldo.get(csId);

						if (saved) {
							return {
								...saved,
								name: avail.NamaBank || saved.name,
								bankBalance: Number(avail.SaldoRekeningKoran) || 0,
								bookBalance: Number(avail.SaldoBukuBesar) || 0,
								expanded: existing ? existing.expanded : true,
							};
						}

						return {
							id: existing?.id ?? `avail-${avail.CekSaldoID}`,
							name: avail.NamaBank || "",
							CekSaldoID: avail.CekSaldoID,
							bankBalance: Number(avail.SaldoRekeningKoran) || 0,
							bookBalance: Number(avail.SaldoBukuBesar) || 0,
							expanded: existing ? existing.expanded : true,
							bankAdditions: existing?.bankAdditions ?? [],
							bankReductions: existing?.bankReductions ?? [],
							bookAdditions: existing?.bookAdditions ?? [],
							bookReductions: existing?.bookReductions ?? [],
						};
					});

					// 2. Sertakan data rekonsiliasi tersimpan yang mungkin tidak ada di availableBanks
					rawSaved.forEach((s) => {
						if (!s.CekSaldoID || !rawAvail.some((a) => Number(a.CekSaldoID) === Number(s.CekSaldoID))) {
							const existing = (currentBanks || []).find((b) => b.id === s.id || b.RekonsilasiBankID === s.RekonsilasiBankID);
							merged.push({
								...s,
								expanded: existing ? existing.expanded : true,
							});
						}
					});

					// 3. Pertahankan kartu draft manual sementara yang sedang diisi pengguna
					(currentBanks || []).forEach((b) => {
						if (typeof b.id === "string" && b.id.startsWith("temp-") && !b.CekSaldoID && !isBankEmpty(b)) {
							merged.push(b);
						}
					});

					return merged;
				});
			})
			.catch((error) => {
				if (isMounted) {
					setErrorMessage(
						error?.response?.data?.message ||
						error?.message ||
						"Gagal memuat data rekonsiliasi bank."
					);
				}
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [auditId, refetchToken]);

	const bankOptions = useMemo(() => (
		availableBanks.map((b) => b.NamaBank).filter(Boolean)
	), [availableBanks]);

	const nextId = useMemo(() => (
		Math.max(0, ...banks.map((bank) => (typeof bank.id === "number" ? bank.id : 0))) + 1
	), [banks]);

	const updateBank = (bankId, updater) => {
		setBanks((current) => current.map((bank) => (
			bank.id === bankId ? updater(bank) : bank
		)));
	};

	const onSelectBank = (bankId, selectedName) => {
		const matchedCekSaldo = availableBanks.find((b) => b.NamaBank === selectedName);
		updateBank(bankId, (current) => ({
			...current,
			name: selectedName,
			CekSaldoID: matchedCekSaldo?.CekSaldoID ?? null,
			bankBalance: matchedCekSaldo ? Number(matchedCekSaldo.SaldoRekeningKoran) || 0 : current.bankBalance,
			bookBalance: matchedCekSaldo ? Number(matchedCekSaldo.SaldoBukuBesar) || 0 : current.bookBalance,
		}));
	};

	const updateRow = (bankId, group, rowId, field, value) => {
		updateBank(bankId, (bank) => ({
			...bank,
			[group]: bank[group].map((row) => (
				row.id === rowId
					? { ...row, [field]: field === "amount" ? parseAmount(value) : value }
					: row
			)),
		}));
	};

	const addRow = (bankId, group) => {
		updateBank(bankId, (bank) => ({
			...bank,
			[group]: [
				...bank[group],
				{ id: Date.now() + Math.random(), description: "", amount: 0 },
			],
		}));
	};

	const removeRow = (bankId, group, rowId) => {
		updateBank(bankId, (bank) => ({
			...bank,
			[group]: bank[group].filter((row) => row.id !== rowId),
		}));
	};

	const toggleBank = (bankId) => {
		updateBank(bankId, (bank) => ({ ...bank, expanded: !bank.expanded }));
	};

	const removeBank = (bankId) => {
		setBanks((current) => current.filter((bank) => bank.id !== bankId));
	};

	const hasRowData = (row) => String(row.description ?? "").trim() !== "" || Number(row.amount) > 0;
	const hasBankData = (bank) => (
		Boolean(bank.name?.trim())
		|| Number(bank.bankBalance) > 0
		|| Number(bank.bookBalance) > 0
		|| [
			...(bank.bankAdditions || []),
			...(bank.bankReductions || []),
			...(bank.bookAdditions || []),
			...(bank.bookReductions || []),
		].some(hasRowData)
	);

	const requestRemoveRow = (bankId, group, row) => {
		if (!hasRowData(row)) {
			removeRow(bankId, group, row.id);
			setSuccessMessage("Baris rekonsiliasi berhasil dihapus.");
			return;
		}

		setDeleteConfirmation({ type: "row", bankId, group, rowId: row.id });
	};

	const requestRemoveBank = (bank) => {
		if (!hasBankData(bank)) {
			removeBank(bank.id);
			setSuccessMessage("Data bank berhasil dihapus.");
			return;
		}

		setDeleteConfirmation({ type: "bank", bankId: bank.id });
	};

	const confirmRemove = async () => {
		if (!deleteConfirmation) return;

		if (deleteConfirmation.type === "bank") {
			const targetBank = banks.find((b) => b.id === deleteConfirmation.bankId);
			if (targetBank?.RekonsilasiBankID) {
				try {
					await deleteRekonsilasiBank(targetBank.RekonsilasiBankID);
					onSaved?.();
				} catch (error) {
					setErrorMessage(
						error?.response?.data?.message ||
						error?.message ||
						"Gagal menghapus data rekonsiliasi bank."
					);
					setDeleteConfirmation(null);
					return;
				}
			}
			removeBank(deleteConfirmation.bankId);
			setSuccessMessage("Data bank berhasil dihapus.");
		} else {
			removeRow(
				deleteConfirmation.bankId,
				deleteConfirmation.group,
				deleteConfirmation.rowId
			);
			setSuccessMessage("Baris rekonsiliasi berhasil dihapus.");
		}

		setDeleteConfirmation(null);
	};

	const saveBank = async (bank) => {
		if (!setaraKasId) {
			setErrorMessage("Data setara kas belum tersedia.");
			return;
		}

		const matchedCekSaldo = availableBanks.find(
			(b) => b.CekSaldoID === bank.CekSaldoID || b.NamaBank === bank.name
		);

		if (!matchedCekSaldo) {
			setErrorMessage("Pilih bank yang valid dari Cek Saldo terlebih dahulu.");
			return;
		}

		setSavingBankId(bank.id);
		setErrorMessage("");
		setSuccessMessage("");
		try {
			const payload = {
				SetaraKasID: setaraKasId,
				CekSaldoID: matchedCekSaldo.CekSaldoID,
				bankAdditions: bank.bankAdditions,
				bankReductions: bank.bankReductions,
				bookAdditions: bank.bookAdditions,
				bookReductions: bank.bookReductions,
			};

			const saved = await saveRekonsilasiBank(payload);

			updateBank(bank.id, (current) => ({
				...current,
				...saved,
				id: saved.RekonsilasiBankID,
				RekonsilasiBankID: saved.RekonsilasiBankID,
				expanded: current.expanded,
			}));

			setSuccessMessage(`Data rekonsiliasi ${saved.name || bank.name || "bank"} berhasil disimpan.`);
			onSaved?.();
		} catch (error) {
			setErrorMessage(
				error?.response?.data?.message ||
				error?.message ||
				`Data ${bank.name || "bank"} gagal disimpan.`
			);
		} finally {
			setSavingBankId(null);
		}
	};

	const renderRows = (bank, group, color) => (
		<div className="space-y-2">
			{(bank[group] || []).map((row) => (
				<div key={row.id} className="flex gap-1.5">
					<input
						value={row.description}
						disabled={savingBankId === bank.id}
						onChange={(event) => updateRow(bank.id, group, row.id, "description", event.target.value)}
						placeholder="Keterangan"
						className="h-10 min-w-0 flex-1 rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#334155] outline-none focus:border-[#38BDF8]"
					/>
					<div className="flex h-10 w-[196px] shrink-0 items-center overflow-hidden rounded-md border border-[#DCE5EF] bg-white">
						<span className="flex h-full w-12 items-center justify-center border-r border-[#DCE5EF] bg-[#F8FAFC] font-poppins text-sm font-semibold text-[#64748B]">Rp</span>
						<input
							value={formatEditableAmount(row.amount)}
							disabled={savingBankId === bank.id}
							onChange={(event) => updateRow(bank.id, group, row.id, "amount", event.target.value)}
							inputMode="numeric"
							placeholder="0"
							className="min-w-0 flex-1 bg-transparent px-3 text-right font-poppins text-sm text-[#334155] placeholder:text-[#94A3B8] outline-none"
						/>
					</div>
					<button type="button" onClick={() => requestRemoveRow(bank.id, group, row)} disabled={savingBankId === bank.id} className={`flex-none ${color} transition hover:text-[#E53E3E] disabled:opacity-40`} aria-label="Hapus baris">
						<Trash2 size={15} />
					</button>
				</div>
			))}
			<button type="button" onClick={() => addRow(bank.id, group)} disabled={savingBankId === bank.id} className="flex h-10 w-full items-center justify-center gap-1 rounded-md bg-[#32B9ED] font-poppins text-xs font-medium text-white transition hover:bg-[#1DA9DE] disabled:opacity-40">
				<Plus size={12} /> Tambah Baris
			</button>
		</div>
	);

	return (
		<section className="w-full rounded-xl border border-[#DCE5EF] bg-white px-4 pb-6 pt-10 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
			<AlertError message={errorMessage} onClose={() => setErrorMessage("")} />
			<AlertSuccess message={successMessage} onClose={() => setSuccessMessage("")} />
			<ConfirmationPopup
				isOpen={deleteConfirmation !== null}
				message={deleteConfirmation?.type === "bank" ? "Hapus data bank ini?" : "Hapus baris rekonsiliasi ini?"}
				subText="Data yang sudah dihapus tidak dapat dikembalikan."
				confirmText="Hapus"
				cancelText="Batal"
				onConfirm={confirmRemove}
				onCancel={() => setDeleteConfirmation(null)}
			/>

			<div className="mb-5 flex justify-end">
				<AddDataButton
					label="Tambah Data"
					disabled={savingBankId !== null || isLoading}
					onClick={() => setBanks((current) => [...current, makeBank(`temp-${Date.now()}-${nextId}`)])}
				/>
			</div>

			<div className="overflow-x-auto rounded-lg border border-[#DCE5EF]">
				<div className="min-w-[900px]">
					<div className="grid grid-cols-[36px_minmax(140px,1.2fr)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(190px,1.5fr)_100px_70px] items-center bg-[#F8FAFC] px-3 py-3 font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B]">
						<div>No</div><div>Nama Bank</div><div>Saldo Bank</div><div>Saldo Buku</div><div>Saldo Setelah Rekonsiliasi</div><div className="-translate-x-6 text-center">Status</div><div className="text-left">Aksi</div>
					</div>

					{isLoading ? (
						<div className="px-4 py-10 text-center font-poppins text-xs text-[#94A3B8]">
							Memuat data rekonsiliasi bank...
						</div>
					) : (
						banks.map((bank, index) => {
							const bankTotal = reconciliationTotal(bank);
							const bookTotal = bookReconciliationTotal(bank);
							const isBalanced = bankTotal === bookTotal;
							const isEmpty = isBankEmpty(bank);

							return (
								<div key={bank.id} className="border-t border-[#E5EDF5]">
									<div
										role="button"
										tabIndex={0}
										onClick={() => toggleBank(bank.id)}
										onKeyDown={(event) => {
											if (event.key === "Enter" || event.key === " ") {
												event.preventDefault();
												toggleBank(bank.id);
											}
										}}
										className={`group grid cursor-pointer grid-cols-[36px_minmax(140px,1.2fr)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(190px,1.5fr)_100px_70px] items-center border-b transition-colors group-hover:border-[#32B9ED] px-3 py-3 font-poppins text-sm text-[#475569] ${bank.expanded ? "border-[#DCE5EF] bg-[#F1F5F9]" : "border-[#E5EDF5] bg-white"}`}
									>
										<div>{index + 1}</div>
										<div className={isEmpty ? "text-[#64748B]" : "font-semibold text-[#334155]"}>{isEmpty ? "-" : bank.name}</div>
										<div>{isEmpty || Number(bank.bankBalance) === 0 ? <span className="text-[#64748B]">-</span> : `Rp ${formatAmount(bank.bankBalance)}`}</div>
										<div>{isEmpty || Number(bank.bookBalance) === 0 ? <span className="text-[#64748B]">-</span> : `Rp ${formatAmount(bank.bookBalance)}`}</div>
										<div>{isEmpty || bankTotal === 0 ? <span className="text-[#64748B]">-</span> : <span className="font-semibold text-[#334155]">Rp {formatAmount(bankTotal)}</span>}</div>
										<div className="-translate-x-6 text-center">
											{isEmpty ? (
												<span className="text-[#64748B]">-</span>
											) : (
												<span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${isBalanced ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#EF4444]"}`}>
													{isBalanced ? "Sesuai" : "Selisih"}
												</span>
											)}
										</div>
										<div className="flex items-center justify-start gap-2">
											<button type="button" onClick={(event) => { event.stopPropagation(); toggleBank(bank.id); }} className="rounded-md p-1 text-[#64748B] transition group-hover:text-[#32B9ED]" aria-label={bank.expanded ? "Tutup rincian" : "Buka rincian"}>
												{bank.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
											</button>
											<button type="button" onClick={(event) => { event.stopPropagation(); requestRemoveBank(bank); }} disabled={savingBankId !== null} className="flex-none text-[#FF6B6B] transition hover:text-[#E53E3E] disabled:opacity-40" aria-label="Hapus bank">
												<Trash2 size={15} />
											</button>
										</div>
									</div>

									<div className={`grid overflow-hidden transition-[grid-template-rows,opacity,background-color] duration-300 ease-in-out ${bank.expanded ? "grid-rows-[1fr] bg-[#F8FAFC] opacity-100" : "grid-rows-[0fr] bg-white opacity-0 pointer-events-none"}`}>
										<div className="min-h-0">
											<div className="m-3 rounded-lg border border-[#E5EDF5] bg-white p-3">
												<div className="mb-4 flex items-center gap-2 border-b border-[#E5EDF5] pb-3">
													<label htmlFor={`bank-${bank.id}`} className="font-poppins text-xs font-semibold text-[#718096]">Pilih Bank:</label>
													<Dropdown
														id={`bank-${bank.id}`}
														options={bankOptions}
														value={bank.name}
														disabled={savingBankId === bank.id}
														onChange={(value) => onSelectBank(bank.id, value)}
														placeholder={bankOptions.length === 0 ? "Belum ada bank di Cek Saldo" : "Pilih bank"}
														showCheck={false}
														className="!w-56 shrink-0 text-sm [&>button]:h-10 [&>button]:w-56 [&>button]:rounded-md [&>button]:px-3 [&>button]:font-semibold [&>button>span]:font-semibold"
													/>
												</div>

												<div className="grid gap-5 lg:grid-cols-2">
													<div>
														<h3 className="mb-2 border-b border-[#DCE5EF] pb-2 font-poppins text-base font-bold text-[#334155]">Saldo Bank</h3>
														<div className="mb-3 flex h-9 items-center rounded-md border border-[#DCE5EF] bg-[#F8FAFC]">
															<span className="px-3 font-poppins text-sm text-[#64748B]">Saldo Menurut Bank</span>
															<div className="ml-auto flex h-full items-center border-l border-[#DCE5EF]">
																<span className="px-2 text-sm text-[#64748B]">Rp</span>
																<input value={formatAmount(bank.bankBalance)} placeholder="0" readOnly className="w-36 cursor-not-allowed bg-transparent px-3 text-right font-poppins text-sm font-semibold text-[#475569] placeholder:text-[#94A3B8] outline-none" />
															</div>
														</div>
														<h4 className="mb-2 font-poppins text-xs font-semibold text-[#16A34A]">Bertambah Atas</h4>
														{renderRows(bank, "bankAdditions", "text-[#F87171]")}
														<div className={`mt-2 text-right font-poppins text-sm font-semibold ${total(bank.bankAdditions) === 0 ? "text-[#94A3B8]" : "text-[#475569]"}`}>
															Total: Rp {formatAmount(total(bank.bankAdditions))}
														</div>
														<h4 className="mb-2 mt-5 font-poppins text-xs font-semibold text-[#EF4444]">Berkurang Atas</h4>
														{renderRows(bank, "bankReductions", "text-[#F87171]")}
														<div className={`mt-2 text-right font-poppins text-sm font-semibold ${total(bank.bankReductions) === 0 ? "text-[#94A3B8]" : "text-[#475569]"}`}>
															Total: Rp {formatAmount(total(bank.bankReductions))}
														</div>
														<div className="mt-4 rounded-md bg-[#F8FAFC] p-3">
															<p className="font-poppins text-xs font-semibold text-[#64748B]">Saldo Setelah Rekonsiliasi:</p>
															<p className="mt-1 font-poppins text-sm font-bold text-[#334155]">Rp {formatAmount(bankTotal)}</p>
														</div>
													</div>

													<div>
														<h3 className="mb-2 border-b border-[#DCE5EF] pb-2 font-poppins text-base font-bold text-[#334155]">Saldo Buku</h3>
														<div className="mb-3 flex h-9 items-center rounded-md border border-[#DCE5EF] bg-[#F8FAFC]">
															<span className="px-3 font-poppins text-sm text-[#64748B]">Saldo Menurut Buku</span>
															<div className="ml-auto flex h-full items-center border-l border-[#DCE5EF]">
																<span className="px-2 text-sm text-[#64748B]">Rp</span>
																<input value={formatAmount(bank.bookBalance)} placeholder="0" readOnly className="w-36 cursor-not-allowed bg-transparent px-3 text-right font-poppins text-sm font-semibold text-[#475569] placeholder:text-[#94A3B8] outline-none" />
															</div>
														</div>
														<h4 className="mb-2 font-poppins text-xs font-semibold text-[#16A34A]">Bertambah Atas</h4>
														{renderRows(bank, "bookAdditions", "text-[#F87171]")}
														<div className={`mt-2 text-right font-poppins text-sm font-semibold ${total(bank.bookAdditions) === 0 ? "text-[#94A3B8]" : "text-[#475569]"}`}>
															Total: Rp {formatAmount(total(bank.bookAdditions))}
														</div>
														<h4 className="mb-2 mt-5 font-poppins text-xs font-semibold text-[#EF4444]">Berkurang Atas</h4>
														{renderRows(bank, "bookReductions", "text-[#F87171]")}
														<div className={`mt-2 text-right font-poppins text-sm font-semibold ${total(bank.bookReductions) === 0 ? "text-[#94A3B8]" : "text-[#475569]"}`}>
															Total: Rp {formatAmount(total(bank.bookReductions))}
														</div>
														<div className="mt-4 rounded-md bg-[#F8FAFC] p-3">
															<p className="font-poppins text-xs font-semibold text-[#64748B]">Saldo Setelah Rekonsiliasi:</p>
															<p className="mt-1 font-poppins text-sm font-bold text-[#334155]">Rp {formatAmount(bookTotal)}</p>
														</div>
													</div>
												</div>

												<div className="mt-5 -mx-3 -mb-3 flex items-center justify-between border-t border-[#E5EDF5] bg-white px-3 py-3">
													<span className={`rounded-md px-3 py-1.5 font-poppins text-xs font-semibold ${isBalanced ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEF2F2] text-[#EF4444]"}`}>
														{isBalanced ? "Saldo rekonsiliasi sesuai" : `Selisih Rp ${formatAmount(Math.abs(bankTotal - bookTotal))}`}
													</span>
													<SaveButton
														onClick={() => saveBank(bank)}
														disabled={savingBankId === bank.id || isEmpty}
														isSaving={savingBankId === bank.id}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})
					)}

					{!isLoading && banks.length === 0 && (
						<div className="px-4 py-10 text-center font-poppins text-xs text-[#94A3B8]">
							Belum ada data bank. Silakan isi data di tab Cek Saldo terlebih dahulu atau klik &quot;Tambah Data&quot;.
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
