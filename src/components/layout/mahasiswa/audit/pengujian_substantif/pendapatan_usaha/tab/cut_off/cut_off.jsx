"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";

const INITIAL_ROWS = [
	{
		periode: "Sebelum",
		pelanggan: "Toko Asat",
		tanggalFaktur: "2023-03-17",
		nomorFaktur: "CR-178/98",
		jumlah: "43560000",
		tanggalDelivery: "2023-03-17",
		sesuai: "Tidak",
	},
	{
		periode: "Sesudah",
		pelanggan: "Toko Nely",
		tanggalFaktur: "2023-03-16",
		nomorFaktur: "CR-208/90",
		jumlah: "35560000",
		tanggalDelivery: "2023-03-16",
		sesuai: "Ya",
	},
	{
		periode: "Sesudah",
		pelanggan: "Toko Mars",
		tanggalFaktur: "2023-03-15",
		nomorFaktur: "CR-165/38",
		jumlah: "41760000",
		tanggalDelivery: "2023-03-15",
		sesuai: "Ya",
	},
];

const INPUT_CLASS =
	"h-10 w-full min-w-0 rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition focus:border-[#38BDF8]";

const TABLE_COLUMNS = "55px 135px 180px 170px 150px 190px 190px 190px 60px";

function createEmptyRow() {
	return {
		periode: "Sesudah",
		pelanggan: "",
		tanggalFaktur: "",
		nomorFaktur: "",
		jumlah: "",
		tanggalDelivery: "",
		sesuai: "Ya",
	};
}

export default function CutOffTab() {
	const [rows, setRows] = useState(INITIAL_ROWS);
	const [isSaved, setIsSaved] = useState(false);

	const updateRow = (rowIndex, field, value) => {
		setIsSaved(false);
		setRows((currentRows) =>
			currentRows.map((row, index) =>
				index === rowIndex ? { ...row, [field]: value } : row
			)
		);
	};

	const addRow = () => {
		setIsSaved(false);
		setRows((currentRows) => [...currentRows, createEmptyRow()]);
	};

	const removeRow = (rowIndex) => {
		setIsSaved(false);
		setRows((currentRows) => currentRows.filter((_, index) => index !== rowIndex));
	};

	const saveRows = () => {
		setIsSaved(true);
	};

	return (
		<section className="min-h-[520px] rounded-xl border border-[#DCE5EF] bg-white px-4 pb-12 pt-4">
			<div className="overflow-x-auto rounded-lg border border-[#DCE5EF]">
				<div className="min-w-max">
					<div style={{ gridTemplateColumns: TABLE_COLUMNS }} className="grid min-w-max items-center border-b border-[#DCE5EF] bg-[#F8FAFC] px-3 py-3">
						{[
							"NO",
							"PERIODE",
							"NAMA PELANGGAN",
							"TANGGAL FAKTUR",
							"NO. FAKTUR",
							"JUMLAH",
							"TANGGAL DELIVERY ORDER",
							"APAKAH SUDAH SESUAI DENGAN PERIODE?",
							"AKSI",
						].map((heading) => (
							<div key={heading} className="px-1 font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B]">
								{heading}
							</div>
						))}
					</div>

						{rows.map((row, rowIndex) => (
							<div key={`${row.nomorFaktur}-${rowIndex}`} style={{ gridTemplateColumns: TABLE_COLUMNS }} className="grid min-w-max items-center border-b border-[#EEF2F6] px-3 py-3 last:border-b-0">
								<div className="px-1 font-poppins text-sm text-[#475569]">
									{rowIndex + 1}
								</div>
								<div className="px-1">
									<select
										aria-label={`Periode baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										value={row.periode}
										onChange={(event) => updateRow(rowIndex, "periode", event.target.value)}
									>
										<option>Sebelum</option>
										<option>Sesudah</option>
									</select>
								</div>
								<div className="px-1">
									<input
										aria-label={`Nama pelanggan baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										value={row.pelanggan}
										onChange={(event) => updateRow(rowIndex, "pelanggan", event.target.value)}
									/>
								</div>
								<div className="px-1">
									<input
										aria-label={`Tanggal faktur baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										type="date"
										value={row.tanggalFaktur}
										onChange={(event) => updateRow(rowIndex, "tanggalFaktur", event.target.value)}
									/>
								</div>
								<div className="px-1">
									<input
										aria-label={`Nomor faktur baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										value={row.nomorFaktur}
										onChange={(event) => updateRow(rowIndex, "nomorFaktur", event.target.value)}
									/>
								</div>
								<div className="px-1">
									<div className="flex h-10 items-center overflow-hidden rounded-md border border-[#DCE5EF] bg-white">
										<span className="flex h-full items-center border-r border-[#DCE5EF] bg-[#F8FAFC] px-3 font-poppins text-sm text-[#64748B]">Rp</span>
										<input
											aria-label={`Jumlah baris ${rowIndex + 1}`}
											className="h-full min-w-0 flex-1 px-3 font-poppins text-sm text-[#475569] outline-none"
											inputMode="numeric"
											value={row.jumlah}
											onChange={(event) => updateRow(rowIndex, "jumlah", event.target.value)}
										/>
									</div>
								</div>
								<div className="px-1">
									<input
										aria-label={`Tanggal delivery order baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										type="date"
										value={row.tanggalDelivery}
										onChange={(event) => updateRow(rowIndex, "tanggalDelivery", event.target.value)}
									/>
								</div>
								<div className="px-1">
									<select
										aria-label={`Kesesuaian periode baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										value={row.sesuai}
										onChange={(event) => updateRow(rowIndex, "sesuai", event.target.value)}
									>
										<option>Ya</option>
										<option>Tidak</option>
									</select>
								</div>
								<div className="flex justify-center">
									<button
										type="button"
										aria-label={`Hapus baris ${rowIndex + 1}`}
										onClick={() => removeRow(rowIndex)}
										className="rounded p-1 text-[#F87171] transition hover:bg-[#FEF2F2]"
									>
										<Trash2 size={13} strokeWidth={1.8} />
									</button>
								</div>
							</div>
						))}
				</div>
			</div>

			<div className="mt-6 flex justify-center">
				<AddDataButton onClick={addRow} label="Tambah Data" />
			</div>

			<div className="mt-5 flex justify-end">
				{isSaved && <span className="font-poppins text-xs text-[#00A51A]">Data tersimpan</span>}
				<SaveButton onClick={saveRows} />
			</div>
		</section>
	);
}
