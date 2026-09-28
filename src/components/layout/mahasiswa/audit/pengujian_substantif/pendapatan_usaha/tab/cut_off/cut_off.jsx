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
	"h-8 w-full rounded border border-[#DCE5EF] bg-white px-2 font-poppins text-[10px] text-[#475569] outline-none transition focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/20";

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
		<section className="min-h-[475px] rounded-xl border border-[#DCE5EF] bg-white p-3">
			<div className="overflow-x-auto rounded-lg border border-[#DCE5EF]">
				<table className="w-full min-w-[1040px] table-fixed border-collapse">
					<colgroup>
						<col className="w-[38px]" />
						<col className="w-[92px]" />
						<col className="w-[128px]" />
						<col className="w-[135px]" />
						<col className="w-[128px]" />
						<col className="w-[170px]" />
						<col className="w-[135px]" />
						<col className="w-[125px]" />
						<col className="w-[55px]" />
					</colgroup>
					<thead className="bg-[#F8FAFC]">
						<tr className="border-b border-[#DCE5EF]">
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
								<th
									key={heading}
									className="px-2 py-3 text-left font-poppins text-[8px] font-semibold uppercase tracking-[0.02em] text-[#64748B]"
								>
									{heading}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map((row, rowIndex) => (
							<tr key={`${row.nomorFaktur}-${rowIndex}`} className="border-b border-[#E8EEF5] last:border-b-0">
								<td className="px-2 py-2 text-center font-poppins text-[10px] text-[#475569]">
									{rowIndex + 1}
								</td>
								<td className="px-1 py-2">
									<select
										aria-label={`Periode baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										value={row.periode}
										onChange={(event) => updateRow(rowIndex, "periode", event.target.value)}
									>
										<option>Sebelum</option>
										<option>Sesudah</option>
									</select>
								</td>
								<td className="px-1 py-2">
									<input
										aria-label={`Nama pelanggan baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										value={row.pelanggan}
										onChange={(event) => updateRow(rowIndex, "pelanggan", event.target.value)}
									/>
								</td>
								<td className="px-1 py-2">
									<input
										aria-label={`Tanggal faktur baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										type="date"
										value={row.tanggalFaktur}
										onChange={(event) => updateRow(rowIndex, "tanggalFaktur", event.target.value)}
									/>
								</td>
								<td className="px-1 py-2">
									<input
										aria-label={`Nomor faktur baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										value={row.nomorFaktur}
										onChange={(event) => updateRow(rowIndex, "nomorFaktur", event.target.value)}
									/>
								</td>
								<td className="px-1 py-2">
									<div className="flex h-8 items-center overflow-hidden rounded border border-[#DCE5EF] bg-white">
										<span className="flex h-full items-center border-r border-[#DCE5EF] bg-[#F8FAFC] px-2 font-poppins text-[9px] text-[#64748B]">Rp</span>
										<input
											aria-label={`Jumlah baris ${rowIndex + 1}`}
											className="h-full min-w-0 flex-1 px-2 font-poppins text-[10px] text-[#475569] outline-none"
											inputMode="numeric"
											value={row.jumlah}
											onChange={(event) => updateRow(rowIndex, "jumlah", event.target.value)}
										/>
									</div>
								</td>
								<td className="px-1 py-2">
									<input
										aria-label={`Tanggal delivery order baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										type="date"
										value={row.tanggalDelivery}
										onChange={(event) => updateRow(rowIndex, "tanggalDelivery", event.target.value)}
									/>
								</td>
								<td className="px-1 py-2">
									<select
										aria-label={`Kesesuaian periode baris ${rowIndex + 1}`}
										className={INPUT_CLASS}
										value={row.sesuai}
										onChange={(event) => updateRow(rowIndex, "sesuai", event.target.value)}
									>
										<option>Ya</option>
										<option>Tidak</option>
									</select>
								</td>
								<td className="px-1 py-2 text-center">
									<button
										type="button"
										aria-label={`Hapus baris ${rowIndex + 1}`}
										onClick={() => removeRow(rowIndex)}
										className="text-[#FF5757] transition hover:text-[#D93636]"
									>
										<Trash2 size={13} strokeWidth={1.8} />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex justify-center pt-4">
				<AddDataButton onClick={addRow} label="Tambah Data" />
			</div>

			<div className="flex items-center justify-end gap-3 pt-4">
				{isSaved && <span className="font-poppins text-xs text-[#00A51A]">Data tersimpan</span>}
				<SaveButton onClick={saveRows} />
			</div>
		</section>
	);
}
