"use client";

import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";

const createRow = () => ({
	id: `${Date.now()}-${Math.random()}`,
	namaAset: "",
	kodeAset: "",
	tanggalPerolehan: "",
	hargaPerolehan: "",
	bukti: null,
});

const formatAmount = (value) => {
	const digits = String(value ?? "").replace(/\D/g, "");
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function HasilObservasiAsetLamaTab() {
	const [rows, setRows] = useState([]);
	const [saving, setSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const updateRow = (id, field, value) => {
		setRows((current) => current.map((row) => (
			row.id === id ? { ...row, [field]: field === "hargaPerolehan" ? value.replace(/\D/g, "") : value } : row
		)));
	};

	const removeRow = (id) => {
		setRows((current) => current.filter((row) => row.id !== id));
	};

	const chooseFile = (id, event) => {
		const [file] = event.target.files;
		if (file) updateRow(id, "bukti", file);
		event.target.value = "";
	};

	const openFilePicker = (id) => {
		document.getElementById(`bukti-${id}`)?.click();
	};

	const viewFile = (file) => {
		if (!file) return;
		const url = URL.createObjectURL(file);
		window.open(url, "_blank", "noopener,noreferrer");
		setTimeout(() => URL.revokeObjectURL(url), 60000);
	};

	const validateRows = () => {
		if (rows.length === 0) {
			throw new Error("Belum ada data Hasil Observasi Aset Lama.");
		}

		rows.forEach((row, index) => {
			if (!row.namaAset.trim()) {
				throw new Error(`Nama Aset pada baris ${index + 1} wajib diisi.`);
			}
			if (!row.kodeAset.trim()) {
				throw new Error(`Kode Aset pada baris ${index + 1} wajib diisi.`);
			}
			if (!row.tanggalPerolehan) {
				throw new Error(`Tanggal Perolehan pada baris ${index + 1} wajib diisi.`);
			}
			if (!row.hargaPerolehan || Number(row.hargaPerolehan) <= 0) {
				throw new Error(`Harga Perolehan pada baris ${index + 1} wajib diisi.`);
			}
		});
	};

	const handleSave = async () => {
		try {
			setSaving(true);
			setErrorMessage("");
			setSuccessMessage("");
			validateRows();
			await Promise.resolve();
			setSuccessMessage("Data hasil observasi aset lama berhasil disimpan.");
		} catch (error) {
			setErrorMessage(error.message ?? "Data hasil observasi aset lama gagal disimpan.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<section className="rounded-xl border border-[#DCE5EF] bg-white p-4">
			<AlertError message={errorMessage} onClose={() => setErrorMessage("")} />
			<AlertSuccess message={successMessage} onClose={() => setSuccessMessage("")} />
			<div className="overflow-x-auto rounded-xl border border-[#DCE5EF]">
				<table className="w-full min-w-[920px] border-collapse">
					<thead className="bg-[#F8FAFC]">
						<tr>
							<th className="w-[50px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">No</th>
							<th className="min-w-[230px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Nama Aset</th>
							<th className="min-w-[160px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Kode Aset</th>
							<th className="min-w-[170px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Tanggal Perolehan</th>
							<th className="min-w-[220px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Harga Perolehan</th>
							<th className="min-w-[120px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Bukti</th>
							<th className="min-w-[70px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Aksi</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row, index) => (
							<tr className="border-b border-[#EEF2F6] last:border-b-0" key={row.id}>
								<td className="w-[50px] px-3 py-2 text-center font-poppins text-sm text-[#475569]">{index + 1}</td>
								<td className="min-w-[230px] px-3 py-2">
									<input aria-label={`Nama aset ${index + 1}`} className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]" value={row.namaAset} placeholder="Nama Aset" onChange={(event) => updateRow(row.id, "namaAset", event.target.value)} />
								</td>
								<td className="min-w-[160px] px-3 py-2">
									<input aria-label={`Kode aset ${index + 1}`} className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]" value={row.kodeAset} placeholder="Kode Aset" onChange={(event) => updateRow(row.id, "kodeAset", event.target.value)} />
								</td>
								<td className="min-w-[170px] px-3 py-2">
									<input aria-label={`Tanggal perolehan ${index + 1}`} className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition focus:border-[#38BDF8]" type="date" value={row.tanggalPerolehan} onChange={(event) => updateRow(row.id, "tanggalPerolehan", event.target.value)} />
								</td>
								<td className="min-w-[220px] px-3 py-2">
									<div className="inline-flex h-10 min-w-[190px] w-max max-w-none items-center overflow-hidden rounded-xl border border-[#DCE5EF] bg-white transition focus-within:border-[#38BDF8]">
										<span className="flex h-full w-10 items-center justify-center border-r border-[#DCE5EF] bg-[#F8FAFC] font-poppins text-sm font-semibold text-[#64748B]">Rp</span>
										<input aria-label={`Harga perolehan ${index + 1}`} className="min-w-0 flex-1 px-3 text-right font-poppins text-sm text-[#475569] outline-none" inputMode="numeric" value={formatAmount(row.hargaPerolehan)} onChange={(event) => updateRow(row.id, "hargaPerolehan", event.target.value)} />
									</div>
								</td>
								<td className="min-w-[120px] px-3 py-2">
									<input id={`bukti-${row.id}`} className="hidden" type="file" accept="image/*,.pdf" onChange={(event) => chooseFile(row.id, event)} />
									<div className="flex items-center justify-center gap-2">
										<button className="font-poppins text-sm font-medium text-[#38BDF8] transition hover:underline" type="button" onClick={() => openFilePicker(row.id)}>File</button>
										{row.bukti && <button aria-label={`Lihat bukti ${index + 1}`} className="flex h-7 w-7 items-center justify-center rounded-md text-[#38BDF8] transition hover:bg-[#F1F5F9]" title="Lihat file" type="button" onClick={() => viewFile(row.bukti)}><Eye size={16} /></button>}
									</div>
								</td>
								<td className="min-w-[70px] px-3 py-2 text-center">
									<button aria-label={`Hapus aset ${index + 1}`} className="text-[#FF3030] transition hover:text-[#DC2626]" type="button" onClick={() => removeRow(row.id)}><Trash2 size={16} /></button>
								</td>
							</tr>
						))}
						{rows.length === 0 && <tr><td className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]" colSpan={7}>Belum ada data Hasil Observasi Aset Lama.</td></tr>}
					</tbody>
				</table>
			</div>
			<div className="mt-4 flex justify-center">
				<AddDataButton label="Tambah Data" onClick={() => setRows((current) => [...current, createRow()])} disabled={saving} />
			</div>
			<div className="mt-5 flex justify-end">
				<SaveButton onClick={handleSave} disabled={saving || rows.length === 0} isSaving={saving} label="Simpan" savingLabel="Menyimpan..." />
			</div>
		</section>
	);
}