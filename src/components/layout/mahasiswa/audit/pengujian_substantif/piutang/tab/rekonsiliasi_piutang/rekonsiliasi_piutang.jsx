"use client";

import { useState } from "react";

import {
	CalendarDays,
	// ChevronDown,
	Plus,
	Trash2,
} from "lucide-react";

import Dropdown from "@/components/ui/dropdown/dropdown";

const createRow = () => ({
	customer: "Toko Kebak",
	nomorFaktur: "CR-99/65",
	tanggalFaktur: "2022-12-25",
	saldoBuku: "500.000.000",
	saldoCustomer: "500.000.000",
	selisih: "0",
	keterangan: "sesuai",
});

const customerOptions = [
	"Toko Kebak",
	"Toko Makmur Jaya",
	"Toko Sumber Rezeki",
	"Toko Berkah Abadi",
	"Toko Maju Bersama",
	"Toko Sejahtera",
	"Toko Sentosa",
	"Toko Harapan Baru",
];

const getDigits = (value) => String(value ?? "").replace(/\D/g, "");

const parseAmount = (value) => {
	const digits = getDigits(value);

	return digits ? BigInt(digits) : 0n;
};

const calculateDifference = (saldoBuku, saldoCustomer) =>
	parseAmount(saldoBuku) - parseAmount(saldoCustomer);

const formatAmount = (value) => {
	const stringValue = String(value ?? "");
	const isNegative = stringValue.startsWith("-");
	const digits = getDigits(stringValue) || "0";
	const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

	return `${isNegative ? "-" : ""}${formatted}`;
};

const formatInputAmount = (value) => {
	const digits = getDigits(value);

	return digits ? formatAmount(digits) : "";
};

const fields = [
	{ key: "customer", label: "Nama Customer" },
	{ key: "nomorFaktur", label: "Nomor Faktur" },
	{ key: "tanggalFaktur", label: "Tanggal Faktur", type: "date" },
	{ key: "saldoBuku", label: "Saldo Buku Perusahaan", prefix: "Rp" },
	{ key: "saldoCustomer", label: "Saldo Menurut Customer", prefix: "Rp" },
	{ key: "selisih", label: "Selisih", prefix: "Rp", readOnly: true },
	{ key: "keterangan", label: "Keterangan" },
];

export default function RekonsiliasiPiutangTab() {
	const [rows, setRows] = useState(() => [
		createRow(),
		createRow(),
		createRow(),
	]);
	const getAmountColumnWidth = (key) => Math.max(
		130,
		...rows.map((row) => formatAmount(row[key]).length * 8 + 50)
	);
	const saldoBukuWidth = getAmountColumnWidth("saldoBuku");
	const saldoCustomerWidth = getAmountColumnWidth("saldoCustomer");
	const selisihWidth = getAmountColumnWidth("selisih");
	const tableColumns = `44px 180px 130px 150px ${saldoBukuWidth}px ${saldoCustomerWidth}px ${selisihWidth}px 150px 44px`;

	const updateRow = (index, key, value) => {
		const nextValue = key === "saldoBuku" || key === "saldoCustomer"
			? formatInputAmount(value)
			: value;

		setRows((currentRows) =>
			currentRows.map((row, rowIndex) =>
				rowIndex === index
					? {
							...row,
							[key]: nextValue,
							selisih:
								key === "saldoBuku" || key === "saldoCustomer"
									? String(calculateDifference(
										key === "saldoBuku" ? nextValue : row.saldoBuku,
										key === "saldoCustomer" ? nextValue : row.saldoCustomer
									))
									: row.selisih,
						}
					: row
			)
		);
	};

	const addRow = () => {
		setRows((currentRows) => [...currentRows, createRow()]);
	};

	const removeRow = (index) => {
		setRows((currentRows) => currentRows.filter((_, rowIndex) => rowIndex !== index));
	};

	return (
		<div className="min-h-[520px] rounded-xl border border-[#DCE5EF] bg-white px-4 pb-12 pt-4">
			{/*
			<div className="flex justify-end">
				<button
					type="button"
					className="flex items-center gap-2 rounded-lg border border-[#DCE5EF] bg-white px-3 py-2 font-poppins text-[11px] font-medium text-[#475569] transition hover:border-[#38BDF8] hover:text-[#159BD7]"
				>
					Export File
					<ChevronDown size={14} />
				</button>
			</div>
			*/}

			<div className="mt-4 overflow-x-auto rounded-lg border border-[#DCE5EF]">
				<div className="min-w-max">
					<div style={{ gridTemplateColumns: tableColumns }} className="grid min-w-max items-center border-b border-[#DCE5EF] bg-[#F8FAFC] px-3 py-4">
						<div className="font-poppins text-[11px] font-semibold uppercase text-[#64748B]">No</div>
						{fields.map((field) => (
							<div key={field.key} className="px-1 font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B]">
								{field.label}
							</div>
						))}
						<div className="text-center font-poppins text-[11px] font-semibold uppercase text-[#64748B]">Aksi</div>
					</div>

					{rows.map((row, index) => (
						<div key={`${index}-${row.nomorFaktur}`} style={{ gridTemplateColumns: tableColumns }} className="grid min-w-max items-center border-b border-[#EEF2F6] px-3 py-3 last:border-b-0">
							<div className="px-1 font-poppins text-xs text-[#64748B]">{index + 1}</div>

							{fields.map((field) => {
								const displayValue = field.key === "selisih"
									? formatAmount(row[field.key])
									: row[field.key];
								return (
								<div key={field.key} className="px-1">
									{field.key === "customer" ? (
										<Dropdown
											options={customerOptions}
											value={row.customer}
											onChange={(value) => updateRow(index, "customer", value)}
											showCheck
											className="text-[10px]"
										/>
									) : (
										<div className={field.prefix ? "relative" : "relative"}>
											{field.prefix && (
													<span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-poppins text-[9px] text-[#64748B]">
													{field.prefix}
												</span>
											)}
											<input
												type={field.type || "text"}
												value={displayValue}
												readOnly={field.readOnly}
												onChange={(event) => updateRow(index, field.key, event.target.value)}
												style={field.readOnly ? { backgroundColor: "#F1F5F9" } : undefined}
												className={`h-10 w-full min-w-0 rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-xs text-[#475569] outline-none transition focus:border-[#38BDF8] ${field.prefix ? "pl-8 text-right" : ""} ${field.type === "date" ? "pr-1" : ""} ${field.readOnly ? "cursor-not-allowed bg-[#F1F5F9] text-right text-[#94A3B8]" : ""}`}
											/>
											{field.type === "date" && (
												<CalendarDays size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#475569]" />
											)}
										</div>
									)}
								</div>
								);
							})}

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
					))}
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

			<div className="mt-5 flex justify-end">
				<button
					type="button"
					className="rounded-lg bg-[#00A51A] px-6 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#008C16]"
				>
					Simpan
				</button>
			</div>
		</div>
	);
}
