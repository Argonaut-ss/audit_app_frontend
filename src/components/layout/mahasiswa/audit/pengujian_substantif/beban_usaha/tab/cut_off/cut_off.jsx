"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import AddDataButton from "@/components/button/add_data_button";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import SaveButton from "@/components/button/save_button";
import Dropdown from "@/components/ui/dropdown/dropdown";
import { getBebanUsaha } from "@/services/mahasiswa/tugas/audit/beban_usaha/beban_usaha";
import {
	deleteCutOffBebanUsaha,
	getCutOffBebanUsaha,
	saveCutOffBebanUsaha,
} from "@/services/mahasiswa/tugas/audit/beban_usaha/cut_off/cut_off";

const PERIOD_OPTIONS = ["Sebelum", "Sesudah"];
const COMPLIANCE_OPTIONS = ["Ya", "Tidak"];
const TABLE_COLUMNS = "55px 135px 180px 170px 150px 190px 190px 190px 60px";

const INPUT_CLASS =
	"h-10 w-full min-w-0 rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition focus:border-[#38BDF8]";

let nextClientRowId = 0;

function formatRupiah(value) {
	const digits = String(value ?? "").replace(/\D/g, "");

	if (!digits) {
		return "";
	}

	return new Intl.NumberFormat("id-ID").format(Number(digits));
}

function createEmptyRow() {
	return {
		clientId: `new-${++nextClientRowId}`,
		periode: "Sesudah",
		pelanggan: "",
		tanggalFaktur: "",
		nomorFaktur: "",
		jumlah: "",
		tanggalDelivery: "",
		sesuai: "Ya",
	};
}

function normalizeRow(item) {
	return {
		clientId: `saved-${item.CutOffID}`,
		id: item.CutOffID,
		periode: item.Periode === "sebelum" ? "Sebelum" : "Sesudah",
		pelanggan: item.NamaPelanggan ?? "",
		tanggalFaktur: item.TanggalFaktur ?? "",
		nomorFaktur: item.NomorFaktur ?? "",
		jumlah: String(item.Jumlah ?? ""),
		tanggalDelivery: item.TanggalDelivery ?? "",
		sesuai: item.SesuaiPeriode ? "Ya" : "Tidak",
	};
}

function toPayload(row) {
	return {
		id: row.id ?? null,
		Periode: row.periode.toLowerCase(),
		NamaPelanggan: row.pelanggan.trim() || null,
		NomorFaktur: row.nomorFaktur.trim() || null,
		TanggalFaktur: row.tanggalFaktur || null,
		Jumlah: Number(String(row.jumlah ?? "").replace(/\D/g, "") || 0),
		TanggalDelivery: row.tanggalDelivery || null,
		SesuaiPeriode: row.sesuai === "Ya",
	};
}

function getRowValidationErrors(row) {
	const errors = [];
	const amount = String(row.jumlah ?? "").trim();

	if (!PERIOD_OPTIONS.includes(row.periode)) errors.push("Periode belum dipilih");
	if (!String(row.pelanggan ?? "").trim()) errors.push("Nama pelanggan belum diisi");
	if (!String(row.tanggalFaktur ?? "").trim()) errors.push("Tanggal faktur belum diisi");
	if (!String(row.nomorFaktur ?? "").trim()) errors.push("Nomor faktur belum diisi");
	if (!amount) errors.push("Jumlah belum diisi");
	else if (!Number.isInteger(Number(amount)) || Number(amount) < 1) errors.push("Jumlah harus minimal 1");
	if (!String(row.tanggalDelivery ?? "").trim()) errors.push("Tanggal delivery order belum diisi");
	if (!COMPLIANCE_OPTIONS.includes(row.sesuai)) errors.push("Kesesuaian periode belum dipilih");

	return errors;
}

export default function CutOffTab({ auditId }) {
	const [bebanUsahaId, setBebanUsahaId] = useState(null);
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(Boolean(auditId));
	const [isSaving, setIsSaving] = useState(false);
	const [deleteIndex, setDeleteIndex] = useState(null);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		if (!auditId) {
			setIsLoading(false);
			return undefined;
		}

		let isMounted = true;
		setIsLoading(true);

		getBebanUsaha(auditId)
			.then((bebanUsaha) => {
				if (!bebanUsaha?.BebanUsahaID) {
					throw new Error("Data beban usaha tidak ditemukan.");
				}

				if (isMounted) setBebanUsahaId(bebanUsaha.BebanUsahaID);
				return getCutOffBebanUsaha(bebanUsaha.BebanUsahaID);
			})
			.then((items) => {
				if (isMounted) setRows(items.map(normalizeRow));
			})
			.catch((error) => {
				if (isMounted) {
					setRows([]);
					setErrorMessage(error.response?.data?.message ?? error.message ?? "Gagal mengambil data cut off.");
				}
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [auditId]);

	const updateRow = (rowIndex, field, value) => {
		setSuccessMessage("");
		setRows((currentRows) =>
			currentRows.map((row, index) =>
				index === rowIndex ? { ...row, [field]: value } : row
			)
		);
	};

	const addRow = () => {
		setSuccessMessage("");
		setRows((currentRows) => [...currentRows, createEmptyRow()]);
	};

	const confirmRemoveRow = () => {
		if (deleteIndex === null) return;

		const row = rows[deleteIndex];
		setRows((currentRows) => currentRows.filter((_, index) => index !== deleteIndex));
		setDeleteIndex(null);

		if (!row?.id) {
			setSuccessMessage("Data cut off berhasil dihapus.");
			return;
		}

		setIsSaving(true);
		deleteCutOffBebanUsaha(row.id)
			.then(() => setSuccessMessage("Data cut off berhasil dihapus."))
			.catch((error) => {
				setErrorMessage(error.response?.data?.message ?? "Gagal menghapus data cut off.");
			})
			.finally(() => setIsSaving(false));
	};

	const saveRows = async () => {
		if (rows.length === 0) {
			setErrorMessage("Belum ada data cut off yang ditambahkan.");
			return;
		}

		const invalidRows = rows
			.map((row, index) => ({ rowNumber: index + 1, errors: getRowValidationErrors(row) }))
			.filter(({ errors }) => errors.length > 0)
			.map(({ rowNumber, errors }) => `Baris ${rowNumber}: ${errors.join(", ")}`);

		if (invalidRows.length > 0) {
			setErrorMessage(`Data belum memenuhi syarat. ${invalidRows.join("; ")}.`);
			setSuccessMessage("");
			return;
		}

		if (!bebanUsahaId) {
			setErrorMessage("Data beban usaha belum tersedia.");
			return;
		}

		setIsSaving(true);
		try {
			const savedRows = await saveCutOffBebanUsaha(
				bebanUsahaId,
				rows.map(toPayload)
			);

			setRows(savedRows.map(normalizeRow));
			setSuccessMessage("Data cut off berhasil disimpan.");
		} catch (error) {
			setErrorMessage(error.response?.data?.message ?? "Gagal menyimpan data cut off.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<section className="min-h-[520px] rounded-xl border border-[#DCE5EF] bg-white px-4 pb-12 pt-4">
			<AlertError message={errorMessage} onClose={() => setErrorMessage("")} />
			<AlertSuccess message={successMessage} onClose={() => setSuccessMessage("")} />
			<ConfirmationPopup
				isOpen={deleteIndex !== null}
				message="Hapus data cut off?"
				subText="Data cut off yang dipilih akan dihapus."
				confirmText="Hapus"
				cancelText="Batal"
				onConfirm={confirmRemoveRow}
				onCancel={() => setDeleteIndex(null)}
			/>

			{isLoading && (
				<div className="mb-3 rounded-lg bg-[#F8FAFC] px-4 py-3 text-center font-poppins text-sm text-[#94A3B8]">
					Memuat data cut off...
				</div>
			)}

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
							<div key={heading} className={`px-1 font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B] ${heading === "AKSI" ? "text-center" : ""}`}>
								{heading}
							</div>
						))}
					</div>

					{!isLoading && rows.length === 0 ? (
						<div className="px-3 py-8 text-center font-poppins text-sm text-[#94A3B8]">
							Belum ada data cut off.
						</div>
					) : rows.map((row, rowIndex) => (
						<div key={row.clientId} style={{ gridTemplateColumns: TABLE_COLUMNS }} className="grid min-w-max items-center border-b border-[#EEF2F6] px-3 py-3 last:border-b-0">
							<div className="px-1 font-poppins text-sm text-[#475569]">{rowIndex + 1}</div>
							<div className="px-1">
								<Dropdown options={PERIOD_OPTIONS} value={row.periode} onChange={(value) => updateRow(rowIndex, "periode", value)} className="font-poppins text-sm [&_button]:min-h-10 [&_button]:rounded-md [&_button]:px-3 [&_button]:text-sm" />
							</div>
							<div className="px-1">
								<input aria-label={`Nama pelanggan baris ${rowIndex + 1}`} className={INPUT_CLASS} value={row.pelanggan} onChange={(event) => updateRow(rowIndex, "pelanggan", event.target.value)} />
							</div>
							<div className="px-1">
								<input aria-label={`Tanggal faktur baris ${rowIndex + 1}`} className={INPUT_CLASS} type="date" value={row.tanggalFaktur} onChange={(event) => updateRow(rowIndex, "tanggalFaktur", event.target.value)} />
							</div>
							<div className="px-1">
								<input aria-label={`Nomor faktur baris ${rowIndex + 1}`} className={INPUT_CLASS} value={row.nomorFaktur} onChange={(event) => updateRow(rowIndex, "nomorFaktur", event.target.value)} />
							</div>
							<div className="px-1">
								<div className="flex h-10 items-center overflow-hidden rounded-md border border-[#DCE5EF] bg-white">
									<span className="flex h-full items-center border-r border-[#DCE5EF] bg-[#F8FAFC] px-3 font-poppins text-sm text-[#64748B]">Rp</span>
									<input aria-label={`Jumlah baris ${rowIndex + 1}`} className="h-full min-w-0 flex-1 px-3 font-poppins text-sm text-[#475569] outline-none" inputMode="numeric" value={formatRupiah(row.jumlah)} onChange={(event) => updateRow(rowIndex, "jumlah", event.target.value.replace(/\D/g, ""))} />
								</div>
							</div>
							<div className="px-1">
								<input aria-label={`Tanggal delivery order baris ${rowIndex + 1}`} className={INPUT_CLASS} type="date" value={row.tanggalDelivery} onChange={(event) => updateRow(rowIndex, "tanggalDelivery", event.target.value)} />
							</div>
							<div className="px-1">
								<Dropdown options={COMPLIANCE_OPTIONS} value={row.sesuai} onChange={(value) => updateRow(rowIndex, "sesuai", value)} className="font-poppins text-sm [&_button]:min-h-10 [&_button]:rounded-md [&_button]:px-3 [&_button]:text-sm" />
							</div>
							<div className="flex justify-center">
								<button type="button" aria-label={`Hapus baris ${rowIndex + 1}`} onClick={() => setDeleteIndex(rowIndex)} className="rounded p-1 text-[#F87171] transition hover:bg-[#FEF2F2]">
									<Trash2 size={13} strokeWidth={1.8} />
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="mt-6 flex justify-center">
				<AddDataButton onClick={addRow} label="Tambah Data" disabled={isLoading || isSaving} />
			</div>

			<div className="mt-5 flex justify-end">
				<SaveButton onClick={saveRows} disabled={isLoading || isSaving} isSaving={isSaving} />
			</div>
		</section>
	);
}
