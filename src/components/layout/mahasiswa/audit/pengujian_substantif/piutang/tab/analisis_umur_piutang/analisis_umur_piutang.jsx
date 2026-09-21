"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import Dropdown from "@/components/ui/dropdown/dropdown";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import {
	getAnalisisUmur,
	syncAnalisisUmur,
} from "@/services/mahasiswa/tugas/audit/piutang/analisis_umur_piutang";

const kelompokUmurOptions = ["1-30", "31-60", "61-90", ">90"];

let nextClientRowId = 0;

const createRow = () => ({
	clientId: `new-${++nextClientRowId}`,
	KelompokUmur: "1-30",
	Jumlah: "",
	Kerugian: "",
});

const normalizeRow = (item) => ({
	clientId: `saved-${item.HasilAnalisisUmurID}`,
	KelompokUmur: item.KelompokUmur ?? "1-30",
	Jumlah: String(item.Jumlah ?? ""),
	Kerugian: item.Kerugian ? String(item.Kerugian) : "",
});

/** Format angka menjadi "1.234.567" (id-ID tanpa simbol) */
const formatAmount = (value) => {
	const num = Number(String(value ?? "").replace(/\D/g, "")) || 0;
	return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num);
};

/** Strip semua non-digit dari string input */
const toDigits = (value) => String(value ?? "").replace(/\D/g, "");

/** Konversi string display ("1.234.567") ke integer */
const toInt = (value) => parseInt(toDigits(value), 10) || 0;

export default function AnalisisUmurPiutang() {
	const params = useParams();
	const jwbKasusId = params?.id;

	const [rows, setRows] = useState([]);
	const [saldoBB, setSaldoBB] = useState(0);
	const [isLoading, setIsLoading] = useState(Boolean(jwbKasusId));
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [deleteIndex, setDeleteIndex] = useState(null);

	// Fetch data dari API saat mount
	useEffect(() => {
		if (!jwbKasusId) return;

		let isMounted = true;

		getAnalisisUmur(jwbKasusId)
			.then((data) => {
				if (!isMounted) return;
				setRows(data.rows.length > 0 ? data.rows.map(normalizeRow) : []);
				setSaldoBB(data.SaldoBB ?? 0);
			})
			.catch((error) => {
				if (!isMounted) return;
				// 404 = Piutang/data belum ada → tampilkan kosong, bukan error
				if (error?.response?.status !== 404) {
					setErrorMessage("Data analisis umur piutang gagal dimuat.");
				}
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [jwbKasusId]);

	// Saldo Auditor = Σ CadanganKerugian (Jumlah × Kerugian% per baris)
	const totals = useMemo(() => {
		const saldoAuditor = rows.reduce(
			(sum, row) => sum + Math.round(toInt(row.Jumlah) * (toInt(row.Kerugian) / 100)),
			0
		);
		return {
			saldoAuditor,
			selisih: saldoAuditor - saldoBB,
		};
	}, [rows, saldoBB]);

	const updateRow = (index, key, value) => {
		const nextValue =
			key === "Jumlah"
				? toDigits(value)  // simpan hanya digit mentah
				: value;

		setRows((current) =>
			current.map((row, i) => (i === index ? { ...row, [key]: nextValue } : row))
		);
	};

	const addRow = () =>
		setRows((current) => [...current, createRow()]);

	const removeRow = (index) => setDeleteIndex(index);

	const confirmRemoveRow = () => {
		setRows((current) => current.filter((_, i) => i !== deleteIndex));
		setDeleteIndex(null);
		setSuccessMessage("Baris analisis umur piutang berhasil dihapus dari daftar.");
	};

	const handleSave = async () => {
		if (!jwbKasusId) {
			setErrorMessage("JwbKasus ID tidak tersedia.");
			return;
		}
		if (rows.some((row) => !row.Jumlah)) {
			setErrorMessage("Semua baris harus memiliki nilai Jumlah.");
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			const payload = {
				rows: rows.map((row) => ({
					KelompokUmur: row.KelompokUmur,
					Jumlah: toInt(row.Jumlah),
					Kerugian: toInt(row.Kerugian),
				})),
				SaldoBB: saldoBB,
			};

			const data = await syncAnalisisUmur(jwbKasusId, payload);
			setRows(data.rows.length > 0 ? data.rows.map(normalizeRow) : []);
			setSaldoBB(data.SaldoBB ?? 0);
			setSuccessMessage("Data analisis umur piutang berhasil disimpan.");
		} catch (error) {
			setErrorMessage(
				error?.response?.data?.message ?? "Data analisis umur piutang gagal disimpan."
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<section className="min-h-[680px] rounded-xl border border-[#DCE5EF] bg-white px-4 pb-6 pt-4">
			<AlertError
				message={errorMessage}
				onClose={() => setErrorMessage("")}
			/>
			<AlertSuccess
				message={successMessage}
				onClose={() => setSuccessMessage("")}
			/>
			<ConfirmationPopup
				isOpen={deleteIndex !== null}
				message="Apakah Anda yakin ingin menghapus baris analisis umur piutang?"
				confirmText="Hapus"
				cancelText="Batal"
				onConfirm={confirmRemoveRow}
				onCancel={() => setDeleteIndex(null)}
			/>
			<div className="overflow-x-auto rounded-lg border border-[#DCE5EF]">
				<div className="min-w-[680px]">
					{/* Header */}
					<div className="grid grid-cols-[42px_minmax(120px,1fr)_minmax(160px,1.45fr)_minmax(80px,.65fr)_minmax(145px,1fr)_48px] items-center border-b border-[#DCE5EF] bg-[#F8FAFC] px-3 py-3">
						<div className="font-poppins text-[11px] font-semibold uppercase text-[#64748B]">No</div>
						<div className="px-1 font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B]">Kelompok Umur</div>
						<div className="px-1 font-poppins text-[11px] font-semibold uppercase text-[#64748B]">Jumlah</div>
						<div className="px-1 font-poppins text-[11px] font-semibold uppercase text-[#64748B]">Kerugian</div>
						<div className="px-1 font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B]">Cadangan Kerugian Piutang</div>
						<div className="text-center font-poppins text-[11px] font-semibold uppercase text-[#64748B]">Aksi</div>
					</div>

					{/* Rows */}
					{isLoading ? (
						<div className="grid grid-cols-[42px_minmax(120px,1fr)_minmax(160px,1.45fr)_minmax(80px,.65fr)_minmax(145px,1fr)_48px] px-3 py-8">
							<div className="col-span-6 text-center font-poppins text-xs text-[#94A3B8]">Memuat data analisis umur piutang...</div>
						</div>
					) : rows.map((row, index) => {
						const cadangan = Math.round(toInt(row.Jumlah) * (toInt(row.Kerugian) / 100));

						return (
							<div
								key={row.clientId}
								className="grid grid-cols-[42px_minmax(120px,1fr)_minmax(160px,1.45fr)_minmax(80px,.65fr)_minmax(145px,1fr)_48px] items-center border-b border-[#EEF2F6] px-3 py-3 last:border-b-0"
							>
								<div className="px-1 font-poppins text-sm text-[#64748B]">{index + 1}</div>

								{/* Kelompok Umur */}
								<div className="px-1">
									<div className="flex h-10 items-center overflow-hidden rounded-md border border-[#DCE5EF] bg-white">
										<Dropdown
											options={kelompokUmurOptions}
											value={row.KelompokUmur}
											onChange={(value) => updateRow(index, "KelompokUmur", value)}
											showCheck={false}
											className="min-w-0 flex-1 text-sm [&_button]:min-h-10 [&_button]:rounded-none [&_button]:border-0 [&_button]:px-3 [&_button]:text-sm [&_svg]:h-3 [&_svg]:w-3"
										/>
										<span className="flex h-full items-center border-l border-[#DCE5EF] bg-[#F8FAFC] px-3 font-poppins text-sm text-[#64748B]">Hari</span>
									</div>
								</div>

								{/* Jumlah */}
								<div className="px-1">
									<div className="relative">
										<span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-poppins text-sm text-[#64748B]">Rp</span>
										<input
											type="text"
											inputMode="numeric"
											value={row.Jumlah ? formatAmount(row.Jumlah) : ""}
											onChange={(e) => updateRow(index, "Jumlah", toDigits(e.target.value))}
											className="h-10 w-full rounded-md border border-[#DCE5EF] bg-white pl-8 pr-3 text-right font-poppins text-sm text-[#475569] outline-none transition focus:border-[#38BDF8]"
										/>
									</div>
								</div>

								{/* Kerugian % */}
								<div className="px-1">
									<div className="flex h-10 overflow-hidden rounded-md border border-[#DCE5EF]">
										<input
											type="number"
											min="0"
											max="100"
											value={row.Kerugian}
											placeholder="0"
											onChange={(e) => updateRow(index, "Kerugian", e.target.value)}
											className="min-w-0 flex-1 [appearance:textfield] px-2 text-center font-poppins text-sm text-[#475569] outline-none placeholder:text-[#94A3B8] focus:placeholder-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
										/>
										<span className="flex w-8 items-center justify-center border-l border-[#DCE5EF] bg-[#F8FAFC] font-poppins text-sm text-[#64748B]">%</span>
									</div>
								</div>

								{/* Cadangan Kerugian (read-only, dihitung) */}
								<div className="px-1">
									<div className="flex h-10 items-center rounded-md border border-[#DCE5EF] bg-[#F1F5F9]">
										<span className="flex h-full w-8 items-center justify-center border-r border-[#DCE5EF] bg-white font-poppins text-sm text-[#64748B]">Rp</span>
										<span className="flex-1 px-2 text-right font-poppins text-sm text-[#7B8492]">{formatAmount(cadangan)}</span>
									</div>
								</div>

								{/* Hapus */}
								<div className="flex justify-center">
									<button
										type="button"
										aria-label={`Hapus baris ${index + 1}`}
										onClick={() => removeRow(index)}
										disabled={isSaving}
										className="rounded p-1 text-[#F87171] transition hover:bg-[#FEF2F2] disabled:opacity-40"
									>
										<Trash2 size={13} />
									</button>
								</div>
							</div>
						);
					})}

					{/* Summary tetap tampil walau belum ada baris data. */}
					{!isLoading && (
						<>
							<SummaryRow label="Saldo Auditor" value={totals.saldoAuditor} />
							<SummaryRow
								label="Saldo Buku Besar"
								value={saldoBB}
								editable
								disabled={isSaving}
								onChange={(digits) => setSaldoBB(parseInt(digits, 10) || 0)}
							/>
							<SummaryRow label="Selisih" value={totals.selisih} />
						</>
					)}
				</div>
			</div>

			{/* Tombol Tambah */}
			<div className="mt-6 flex justify-center">
				<AddDataButton onClick={addRow} disabled={isLoading || isSaving} />
			</div>

			{/* Tombol Simpan */}
			<div className="mt-4 flex justify-end">
				<SaveButton onClick={handleSave} disabled={isLoading || isSaving} isSaving={isSaving} />
			</div>
		</section>
	);
}

function SummaryRow({ label, value, editable = false, disabled = false, onChange }) {
	return (
		<div className="grid grid-cols-[42px_minmax(120px,1fr)_minmax(160px,1.45fr)_minmax(80px,.65fr)_minmax(145px,1fr)_48px] items-center border-t border-[#DCE5EF] px-3 py-3">
			<div className="col-span-4 pl-1 font-poppins text-sm font-semibold text-[#475569]">{label}</div>
			<div className={`col-span-1 flex h-10 items-center rounded-md border border-[#DCE5EF] ${editable ? "bg-white" : "bg-[#F1F5F9]"}`}>
				<span className="flex h-full w-8 items-center justify-center border-r border-[#DCE5EF] bg-white font-poppins text-sm text-[#64748B]">Rp</span>
				{editable ? (
					<input
						type="text"
						inputMode="numeric"
						disabled={disabled}
						value={value ? new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value) : ""}
						onChange={(e) => onChange?.(String(e.target.value).replace(/\D/g, ""))}
						className="min-w-0 flex-1 bg-transparent px-2 text-right font-poppins text-sm text-[#475569] outline-none disabled:opacity-60"
					/>
				) : (
					<span className="flex-1 px-2 text-right font-poppins text-sm text-[#7B8492]">
						{new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value ?? 0)}
					</span>
				)}
			</div>
		</div>
	);
}
