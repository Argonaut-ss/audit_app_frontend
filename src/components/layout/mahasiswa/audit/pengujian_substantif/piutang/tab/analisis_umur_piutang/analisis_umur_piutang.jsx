"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import Dropdown from "@/components/ui/dropdown/dropdown";

const ageOptions = ["1-30", "31-60", "61-90", ">90"];

const createRow = () => ({
	age: "1-30",
	amount: "12259040000",
	lossRate: "5",
});

const formatAmount = (value) => {
	const amount = Number(value) || 0;

	return new Intl.NumberFormat("id-ID", {
		maximumFractionDigits: 0,
	}).format(amount);
};

export default function AnalisisUmurPiutang() {
	const [rows, setRows] = useState(() => [createRow(), createRow(), createRow()]);

	const totals = useMemo(() => {
		const totalAmount = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
		const totalLoss = rows.reduce(
			(sum, row) => sum + (Number(row.amount) || 0) * ((Number(row.lossRate) || 0) / 100),
			0
		);

		return {
			totalAmount,
			totalLoss,
			difference: totalAmount - totalLoss,
		};
	}, [rows]);

	const updateRow = (index, key, value) => {
		setRows((currentRows) =>
			currentRows.map((row, rowIndex) =>
				rowIndex === index ? { ...row, [key]: value } : row
			)
		);
	};

	const addRow = () => setRows((currentRows) => [...currentRows, createRow()]);

	const removeRow = (index) => {
		setRows((currentRows) => currentRows.filter((_, rowIndex) => rowIndex !== index));
	};

	return (
		<section className="min-h-[495px] rounded-xl border border-[#DCE5EF] bg-white px-4 pb-4 pt-4">
			<div className="overflow-x-auto rounded-lg border border-[#DCE5EF]">
				<div className="min-w-[680px]">
					<div className="grid grid-cols-[42px_minmax(120px,1fr)_minmax(160px,1.45fr)_minmax(80px,.65fr)_minmax(145px,1fr)_48px] items-center border-b border-[#DCE5EF] bg-[#F8FAFC] px-3 py-3">
						<div className="font-poppins text-[10px] font-semibold uppercase text-[#64748B]">No</div>
						<div className="font-poppins text-[10px] font-semibold uppercase text-[#64748B]">Kelompok Umur</div>
						<div className="font-poppins text-[10px] font-semibold uppercase text-[#64748B]">Jumlah</div>
						<div className="font-poppins text-[10px] font-semibold uppercase text-[#64748B]">Kerugian</div>
						<div className="font-poppins text-[10px] font-semibold uppercase leading-tight text-[#64748B]">Cadangan Kerugian Piutang</div>
						<div className="text-center font-poppins text-[10px] font-semibold uppercase text-[#64748B]">Aksi</div>
					</div>

					{rows.map((row, index) => {
						const provision = (Number(row.amount) || 0) * ((Number(row.lossRate) || 0) / 100);

						return (
							<div key={index} className="grid grid-cols-[42px_minmax(120px,1fr)_minmax(160px,1.45fr)_minmax(80px,.65fr)_minmax(145px,1fr)_48px] items-center border-b border-[#EEF2F6] px-3 py-3 last:border-b-0">
								<div className="px-1 font-poppins text-[11px] text-[#64748B]">{index + 1}</div>

								<div className="px-1">
									<Dropdown
										options={ageOptions}
										value={row.age}
										onChange={(value) => updateRow(index, "age", value)}
										showCheck={false}
										className="text-[10px] [&_button]:min-h-8 [&_button]:rounded-md [&_button]:px-3 [&_button]:text-[10px] [&_svg]:h-3 [&_svg]:w-3"
									/>
								</div>

								<div className="px-1">
									<div className="relative">
										<span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-poppins text-[9px] text-[#64748B]">Rp</span>
										<input
											type="number"
											min="0"
											value={row.amount}
											onChange={(event) => updateRow(index, "amount", event.target.value)}
											className="h-8 w-full rounded-md border border-[#DCE5EF] bg-white pl-8 pr-2 text-right font-poppins text-[10px] text-[#475569] outline-none transition focus:border-[#38BDF8]"
										/>
									</div>
								</div>

								<div className="px-1">
									<div className="flex h-8 overflow-hidden rounded-md border border-[#DCE5EF]">
										<input
											type="number"
											min="0"
											max="100"
											value={row.lossRate}
											onChange={(event) => updateRow(index, "lossRate", event.target.value)}
											className="min-w-0 flex-1 px-2 text-center font-poppins text-[10px] text-[#475569] outline-none"
										/>
										<span className="flex w-7 items-center justify-center border-l border-[#DCE5EF] bg-[#F8FAFC] font-poppins text-[10px] text-[#64748B]">%</span>
									</div>
								</div>

								<div className="px-1">
									<div className="flex h-8 items-center rounded-md border border-[#DCE5EF] bg-[#F1F5F9]">
										<span className="flex h-full w-8 items-center justify-center border-r border-[#DCE5EF] bg-white font-poppins text-[9px] text-[#64748B]">Rp</span>
										<span className="flex-1 px-2 text-right font-poppins text-[10px] text-[#7B8492]">{formatAmount(provision)}</span>
									</div>
								</div>

								<div className="flex justify-center">
									<button
										type="button"
										aria-label={`Hapus baris ${index + 1}`}
										onClick={() => removeRow(index)}
										className="rounded p-1 text-[#F87171] transition hover:bg-[#FEF2F2]"
									>
										<Trash2 size={13} />
									</button>
								</div>
							</div>
						);
					})}

					<SummaryRow label="Saldo Auditor" value={totals.totalAmount} />
					<SummaryRow label="Saldo Buku Besar" value={totals.totalLoss} />
					<SummaryRow label="Selisih" value={totals.difference} />
				</div>
			</div>

			<div className="mt-6 flex justify-center">
				<button
					type="button"
					onClick={addRow}
					className="flex items-center gap-2 rounded-lg bg-[#38BDF8] px-5 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#159BD7]"
				>
					<Plus size={15} />
					Tambah Data
				</button>
			</div>

			<div className="mt-4 flex justify-end">
				<button type="button" className="rounded-lg bg-[#00A51A] px-6 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#008C16]">
					Simpan
				</button>
			</div>
		</section>
	);
}

function SummaryRow({ label, value }) {
	return (
		<div className="grid grid-cols-[42px_minmax(120px,1fr)_minmax(160px,1.45fr)_minmax(80px,.65fr)_minmax(145px,1fr)_48px] items-center border-t border-[#DCE5EF] px-3 py-3">
			<div className="col-span-4 pl-1 font-poppins text-[11px] font-semibold text-[#475569]">{label}</div>
			<div className="col-span-1 flex h-8 items-center rounded-md border border-[#DCE5EF] bg-[#F8FAFC]">
				<span className="flex h-full w-8 items-center justify-center border-r border-[#DCE5EF] bg-white font-poppins text-[9px] text-[#64748B]">Rp</span>
				<span className="flex-1 px-2 text-right font-poppins text-[10px] text-[#7B8492]">{formatAmount(value)}</span>
			</div>
		</div>
	);
}
