"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import Dropdown from "@/components/ui/dropdown/dropdown";

const PAPER_DENOMINATIONS = [100000, 75000, 50000, 20000, 10000, 5000, 2000, 1000];
const COIN_DENOMINATIONS = [1000, 500, 200, 100];
const INITIAL_PAPER_COUNTS = [50, 0, 25, 70, 35, 37, 52, 53];
const INITIAL_COIN_COUNTS = [50, 60, 74, 101];

const inputClass =
	"h-10 w-full rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm font-normal text-[#334155] outline-none transition focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/10";

const formatRupiah = (value) => `Rp ${new Intl.NumberFormat("id-ID").format(Number(value) || 0)}`;
const formatNumber = (value) => new Intl.NumberFormat("id-ID").format(Number(value) || 0);
const createCountRows = (denominations, counts) => denominations.map((denomination, index) => ({ denomination, count: counts[index] ?? 0 }));

export default function CashCount({ initialData, isSaving = false, onSave, companyName = "PT Cakra Manglingan" }) {
	const [company, setCompany] = useState(initialData?.companyName ?? companyName);
	const [cashType, setCashType] = useState(initialData?.cashType ?? "Kas Kecil");
	const [countDate, setCountDate] = useState(initialData?.countDate ?? "2023-03-05");
	const [paperRows, setPaperRows] = useState(initialData?.paperRows ?? createCountRows(PAPER_DENOMINATIONS, INITIAL_PAPER_COUNTS));
	const [coinRows, setCoinRows] = useState(initialData?.coinRows ?? createCountRows(COIN_DENOMINATIONS, INITIAL_COIN_COUNTS));
	const [otherFunds, setOtherFunds] = useState(initialData?.otherFunds ?? [{ description: "Bon-Bon Sementara", amount: "10000000" }]);
	const [bookBalance, setBookBalance] = useState(initialData?.bookBalance ?? "18856900");
	const [notes, setNotes] = useState(initialData?.notes ?? "Ada transaksi pembelian ATK yang belum dicatat");

	const paperTotal = useMemo(() => paperRows.reduce((total, row) => total + row.denomination * (Number(row.count) || 0), 0), [paperRows]);
	const coinTotal = useMemo(() => coinRows.reduce((total, row) => total + row.denomination * (Number(row.count) || 0), 0), [coinRows]);
	const otherTotal = useMemo(() => otherFunds.reduce((total, row) => total + (Number(row.amount) || 0), 0), [otherFunds]);
	const grandTotal = paperTotal + coinTotal + otherTotal;
	const balanceDifference = Number(bookBalance) - grandTotal;

	const updateCount = (setRows, index, value) => setRows((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, count: value } : row));
	const updateOtherFund = (index, field, value) => setOtherFunds((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: field === "amount" ? value.replace(/\D/g, "") : value } : row));

	const save = async () => {
		await onSave?.({ companyName: company, cashType, countDate, paperRows, coinRows, otherFunds, bookBalance: Number(bookBalance) || 0, notes, paperTotal, coinTotal, otherTotal, grandTotal, balanceDifference });
	};

	const renderCountRows = (rows, setRows, label) => (
		<>
			{rows.map((row, index) => (
				<div className="grid min-w-[620px] grid-cols-[1.2fr_1fr_1fr_0.6fr] items-center gap-4 border-b border-[#EDF2F7] px-3 py-2.5 font-poppins text-sm last:border-b-0" key={row.denomination}>
					{index === 0 ? <p className="font-semibold text-[#334155]">{label}</p> : <span className="hidden md:block" />}
					<p className="text-[#718096]">{formatRupiah(row.denomination)}</p>
					<input aria-label={`${label} ${formatRupiah(row.denomination)}`} className="h-10 w-[106px] max-w-full justify-self-center appearance-none rounded-md border border-[#DCE5EF] px-3 text-center font-poppins text-sm text-[#334155] outline-none focus:border-[#38BDF8] -translate-x-4 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none" inputMode="numeric" min="0" type="number" value={row.count} onChange={(event) => updateCount(setRows, index, event.target.value)} />
					<p className="text-right text-[#718096]">{formatRupiah(row.denomination * (Number(row.count) || 0))}</p>
				</div>
			))}
		</>
	);

	return (
		<section className="w-full rounded-xl border border-[#DCE5EF] bg-white px-4 pb-6 pt-10 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
			<h1 className="mb-9 text-center font-poppins text-lg font-bold uppercase tracking-wide text-[#5B5B5B]">Berita Acara Pemeriksaan Kas</h1>
			<div className="mx-auto w-[98%] max-w-full">
			<div className="mb-5 grid gap-4 md:grid-cols-[1.5fr_0.8fr_1fr]">
				<label className="block font-poppins text-xs font-semibold text-[#718096]">Nama Perusahaan<input className={`${inputClass} mt-1.5 bg-[#F1F3F5]`} value={company} onChange={(event) => setCompany(event.target.value)} /></label>
				<label className="block font-poppins text-xs font-semibold text-[#718096]">Jenis Kas<Dropdown options={["Kas Kecil", "Kas Besar"]} value={cashType} onChange={setCashType} className="mt-1.5 w-full [&>button]:rounded-md [&>button]:px-3 [&>button]:font-normal [&>button>span]:font-normal" /></label>
				<label className="block font-poppins text-xs font-semibold text-[#718096]">Tanggal Cash Count<span className="mt-1.5 block"><input className={inputClass} type="date" value={countDate} onChange={(event) => setCountDate(event.target.value)} /></span></label>
			</div>

			<h2 className="mb-2 font-poppins text-base font-bold text-[#334155]">Cash Count</h2>
			<div className="overflow-x-auto rounded-sm border border-[#EDF2F7]">
				<div className="grid min-w-[620px] grid-cols-[1.2fr_1fr_1fr_0.6fr] items-center gap-4 border-b border-[#DCE5EF] bg-[#F8FAFC] px-3 py-3">
					<span className="px-1 font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B]">Keterangan</span>
					<span className="px-1 font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B]">Nominal</span>
					<span className="-translate-x-4 px-1 text-center font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B]">Lembar</span>
					<span className="px-1 text-center font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B]">Jumlah</span>
				</div>
				{renderCountRows(paperRows, setPaperRows, "Uang Kertas")}
				<div className="flex items-center justify-between bg-[#F7F7F7] px-3 py-2 font-poppins text-sm font-semibold text-[#334155]"><span className="md:ml-[28%]">Jumlah Uang Kertas</span><span>{formatRupiah(paperTotal)}</span></div>
				{renderCountRows(coinRows, setCoinRows, "Uang Logam")}
				<div className="flex items-center justify-between bg-[#F7F7F7] px-3 py-2 font-poppins text-sm font-semibold text-[#334155]"><span className="md:ml-[28%]">Jumlah Uang Logam</span><span>{formatRupiah(coinTotal)}</span></div>
			</div>

			<h2 className="mb-3 mt-6 font-poppins text-base font-bold text-[#334155]">Dana Lain-Lain</h2>
			<div className="space-y-2">{otherFunds.map((row, index) => <div className="flex items-center gap-3" key={`other-${index}`}><input aria-label="Keterangan dana lainnya" className={`${inputClass} flex-none`} style={{ width: 252 }} value={row.description} onChange={(event) => updateOtherFund(index, "description", event.target.value)} placeholder="Keterangan" /><span className="flex-1" /><div aria-label="Nominal dana lainnya" className="flex h-10 flex-none overflow-hidden rounded-md border border-[#DCE5EF] bg-white" style={{ width: 196 }}><span className="flex w-12 items-center justify-center border-r border-[#DCE5EF] bg-[#F8FAFC] font-poppins text-sm font-semibold text-[#64748B]">Rp</span><input className="min-w-0 flex-1 bg-transparent px-3 font-poppins text-sm text-[#334155] outline-none" inputMode="numeric" value={formatNumber(row.amount)} onChange={(event) => updateOtherFund(index, "amount", event.target.value)} placeholder="Nominal" /></div><button aria-label="Hapus dana lainnya" className="flex-none text-[#FF6B6B] transition hover:text-[#E53E3E]" type="button" onClick={() => setOtherFunds((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}><Trash2 size={15} /></button></div>)}</div>
			<div className="my-2 flex justify-center"><AddDataButton label="Tambah Data" onClick={() => setOtherFunds((rows) => [...rows, { description: "", amount: "" }])} /></div>
			<div className="flex items-center justify-between bg-[#F7F7F7] px-3 py-2 font-poppins text-sm font-semibold text-[#334155]"><span className="md:ml-[28%]">Jumlah Dana Lainnya</span><span>{formatRupiah(otherTotal)}</span></div>

			<div className="mt-5 flex items-center justify-between font-poppins text-sm font-semibold text-[#334155]"><span>Total Keseluruhan</span><span>{formatRupiah(grandTotal)}</span></div>
			<div className="mt-4 grid gap-2 font-poppins text-xs text-[#8795A8] sm:grid-cols-[1fr_auto] sm:items-center"><span className="font-semibold">Saldo Buku Kas per tanggal Cash Opname</span><input className="h-10 rounded-md border border-[#DCE5EF] px-3 text-right font-poppins text-sm font-semibold text-[#334155] outline-none focus:border-[#38BDF8]" inputMode="numeric" value={formatRupiah(bookBalance)} onChange={(event) => setBookBalance(event.target.value.replace(/\D/g, ""))} /></div>
			<div className="mt-2 flex items-center justify-between font-poppins text-xs text-[#8795A8]"><span className="font-semibold">Selisih Lebih/Kurang</span><strong className="font-poppins text-sm font-semibold text-[#0F172A]">{formatRupiah(balanceDifference)}</strong></div>
			<label className="mt-4 block font-poppins text-xs font-semibold text-[#8795A8]">Penjelasan Selisih<textarea className={`${inputClass} mt-1.5 h-[74px] resize-none py-2`} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
			<div className="mt-5 flex justify-end"><SaveButton disabled={isSaving} isSaving={isSaving} onClick={save} /></div>
			</div>
		</section>
	);
}
