"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CalendarDays, Eye, Trash2 } from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import { getAsetTetap } from "@/services/mahasiswa/tugas/audit/aset_tetap/aset_tetap";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const API_ENDPOINT = `${API_URL}/api/aset-lama-aset-tetap`;
const BULK_SAVE_ENDPOINT = `${API_ENDPOINT}/bulk-save`;

const createRow = (asetTetapId) => ({
	id: `new-${Date.now()}-${Math.random()}`,
	AsetLamaID: null,
	AsetTetapID: asetTetapId,
	namaAset: "",
	kodeAset: "",
	tanggalPerolehan: "",
	hargaPerolehan: "",
	bukti: null,
	buktiExisting: false,
	buktiTipeFile: null,
});

const getAuthToken = () => (
	typeof window === "undefined" ? null : localStorage.getItem("token")
);

const fetchWithAuth = async (url, options = {}) => {
	const token = getAuthToken();
	if (!token) {
		throw new Error("Token login tidak ditemukan. Silakan login kembali.");
	}

	const headers = {
		Accept: "application/json",
		...(options.headers || {}),
		Authorization: ["Bearer", token].join(" "),
	};

	if (typeof FormData !== "undefined" && options.body instanceof FormData) {
		delete headers["Content-Type"];
	}

	return fetch(url, { ...options, headers });
};

const formatAmount = (value) => {
	const digits = String(value ?? "").replace(/\D/g, "");
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const normalizeDate = (value) => (value ? String(value).slice(0, 10) : "");

const formatDateIndonesia = (value) => {
	const [year, month, day] = String(value || "").slice(0, 10).split("-");
	return year && month && day ? `${day}/${month}/${year}` : "";
};

function DateInput({ value, onChange, ariaLabel }) {
	const dateInputRef = useRef(null);

	const openDatePicker = () => {
		const picker = dateInputRef.current;
		if (!picker) return;

		if (typeof picker.showPicker === "function") {
			try {
				picker.showPicker();
				return;
			} catch {
				// Browser menolak showPicker pada kondisi tertentu; gunakan fallback.
			}
		}

		picker.click();
	};

	return (
		<div className="relative flex w-full items-center">
			<input
				type="text"
				readOnly
				value={formatDateIndonesia(value)}
				placeholder="dd/mm/yyyy"
				aria-label={ariaLabel}
				onClick={openDatePicker}
				className="h-10 w-full cursor-pointer rounded-xl border border-[#DCE5EF] bg-white px-3 pr-10 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]"
			/>
			<button
				type="button"
				onClick={openDatePicker}
				aria-label={`${ariaLabel} - pilih tanggal`}
				className="absolute right-3 text-[#64748B] transition hover:text-[#38BDF8]"
			>
				<CalendarDays size={16} />
			</button>
			<input
				ref={dateInputRef}
				type="date"
				value={value || ""}
				onChange={(event) => onChange(event.target.value)}
				tabIndex={-1}
				aria-hidden="true"
				className="pointer-events-none absolute h-px w-px opacity-0"
			/>
		</div>
	);
}

const mapBackendRow = (item) => ({
	id: item.AsetLamaID,
	AsetLamaID: item.AsetLamaID,
	AsetTetapID: item.AsetTetapID,
	namaAset: item.NamaAset || "",
	kodeAset: item.KodeAset || "",
	tanggalPerolehan: normalizeDate(item.Tanggal),
	hargaPerolehan: item.HargaPerolehan ?? "",
	bukti: null,
	buktiExisting: Boolean(item.hasFotoAset),
	buktiTipeFile: item.TipeFile || null,
});

const readResponse = async (response) => {
	try {
		return await response.json();
	} catch {
		return null;
	}
};

export default function HasilObservasiAsetLamaTab({ auditId }) {
	const params = useParams();
	const searchParams = useSearchParams();
	const [rows, setRows] = useState([]);
	const [asetTetapId, setAsetTetapId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [deleteRow, setDeleteRow] = useState(null);

	const requestedAsetTetapId = useMemo(() => (
		searchParams?.get("AsetTetapID") ||
		searchParams?.get("asetTetapId") ||
		searchParams?.get("id") ||
		params?.AsetTetapID ||
		params?.asetTetapID ||
		params?.asetTetapId ||
		null
	), [params, searchParams]);

	const loadRows = useCallback(async () => {
		const response = await fetchWithAuth(
			`${API_ENDPOINT}?AsetTetapID=${encodeURIComponent(asetTetapId)}`,
		);
		const result = await readResponse(response);
		if (!response.ok) {
			throw new Error(result?.message || "Data hasil observasi aset lama gagal dimuat.");
		}

		setRows(Array.isArray(result?.data) ? result.data.map(mapBackendRow) : []);
	}, [asetTetapId]);

	useEffect(() => {
		let active = true;
		const resolveAsetTetap = async () => {
			try {
				setLoading(true);
				setErrorMessage("");

				if (requestedAsetTetapId) {
					if (active) setAsetTetapId(requestedAsetTetapId);
					return;
				}

				if (!auditId) {
					throw new Error("AsetTetapID tidak ditemukan.");
				}

				const asetTetap = await getAsetTetap(auditId);
				const resolvedAsetTetapId = asetTetap?.AsetTetapID ?? null;
				if (!resolvedAsetTetapId) {
					throw new Error("Data aset tetap tidak ditemukan.");
				}

				if (active) setAsetTetapId(resolvedAsetTetapId);
			} catch (error) {
				if (active) {
					setAsetTetapId(null);
					setErrorMessage(error.message || "Data aset tetap gagal dimuat.");
					setLoading(false);
				}
			}
		};

		resolveAsetTetap();

		return () => {
			active = false;
		};
	}, [auditId, requestedAsetTetapId]);

	useEffect(() => {
		if (!asetTetapId) return undefined;

		let active = true;
		const timer = setTimeout(() => {
			loadRows()
				.catch((error) => {
					if (active) {
						setErrorMessage(error.message || "Data hasil observasi aset lama gagal dimuat.");
					}
				})
				.finally(() => {
					if (active) setLoading(false);
				});
		}, 0);

		return () => {
			active = false;
			clearTimeout(timer);
		};
	}, [asetTetapId, loadRows]);

	const updateRow = (id, field, value) => {
		setRows((current) => current.map((row) => (
			row.id === id
				? { ...row, [field]: field === "hargaPerolehan" ? value.replace(/\D/g, "") : value }
				: row
		)));
	};

	const chooseFile = (id, event) => {
		const [file] = event.target.files || [];
		event.target.value = "";
		if (!file) return;
		if (file.size > 16 * 1024 * 1024) {
			setErrorMessage("Ukuran file maksimal 16 MB.");
			return;
		}
		updateRow(id, "bukti", file);
		setErrorMessage("");
	};

	const viewFile = async (row) => {
		if (row.bukti instanceof File) {
			const url = URL.createObjectURL(row.bukti);
			window.open(url, "_blank", "noopener,noreferrer");
			setTimeout(() => URL.revokeObjectURL(url), 60000);
			return;
		}
		if (!row.AsetLamaID || !row.buktiExisting) return;

		try {
			const response = await fetchWithAuth(
				`${API_ENDPOINT}/${row.AsetLamaID}/file/FotoAset`,
			);
			if (!response.ok) {
				const result = await readResponse(response);
				throw new Error(result?.message || "File gagal dibuka.");
			}
			const url = URL.createObjectURL(await response.blob());
			window.open(url, "_blank", "noopener,noreferrer");
			setTimeout(() => URL.revokeObjectURL(url), 60000);
		} catch (error) {
			setErrorMessage(error.message || "File gagal dibuka.");
		}
	};

	const removeRow = async (row) => {
		if (!row.AsetLamaID) {
			setRows((current) => current.filter((item) => item.id !== row.id));
			return;
		}

		try {
			setErrorMessage("");
			const response = await fetchWithAuth(`${API_ENDPOINT}/${row.AsetLamaID}`, { method: "DELETE" });
			const result = await readResponse(response);
			if (!response.ok) throw new Error(result?.message || "Data aset lama gagal dihapus.");
			setRows((current) => current.filter((item) => item.id !== row.id));
			setSuccessMessage(result?.message || "Data aset lama berhasil dihapus.");
		} catch (error) {
			setErrorMessage(error.message || "Data aset lama gagal dihapus.");
		}
	};

	const requestRemoveRow = (row) => {
		setDeleteRow(row);
		setShowDeleteConfirmation(true);
	};

	const cancelRemoveRow = () => {
		setDeleteRow(null);
		setShowDeleteConfirmation(false);
	};

	const confirmRemoveRow = async () => {
		if (!deleteRow) return;
		const row = deleteRow;
		cancelRemoveRow();
		await removeRow(row);
	};

	const validateRows = () => {
		if (!rows.length) throw new Error("Belum ada data Hasil Observasi Aset Lama.");
		rows.forEach((row, index) => {
			if (!row.namaAset.trim()) throw new Error(`Nama Aset pada baris ${index + 1} wajib diisi.`);
			if (!row.kodeAset.trim()) throw new Error(`Kode Aset pada baris ${index + 1} wajib diisi.`);
			if (!row.tanggalPerolehan) throw new Error(`Tanggal Perolehan pada baris ${index + 1} wajib diisi.`);
			if (!row.hargaPerolehan || Number(row.hargaPerolehan) <= 0) {
				throw new Error(`Harga Perolehan pada baris ${index + 1} wajib diisi.`);
			}
		});
	};

	const handleSave = async () => {
		if (saving) return;
		try {
			setSaving(true);
			setErrorMessage("");
			setSuccessMessage("");
			validateRows();

			const formData = new FormData();
			formData.append("AsetTetapID", String(asetTetapId));
			rows.forEach((row, index) => {
				if (row.AsetLamaID) formData.append(`rows[${index}][AsetLamaID]`, String(row.AsetLamaID));
				formData.append(`rows[${index}][NamaAset]`, row.namaAset.trim());
				formData.append(`rows[${index}][KodeAset]`, row.kodeAset.trim());
				formData.append(`rows[${index}][Tanggal]`, row.tanggalPerolehan);
				formData.append(`rows[${index}][HargaPerolehan]`, String(row.hargaPerolehan));
				if (row.bukti instanceof File) formData.append(`rows[${index}][FotoAset]`, row.bukti);
			});

			const response = await fetchWithAuth(BULK_SAVE_ENDPOINT, { method: "POST", body: formData });
			const result = await readResponse(response);
			if (!response.ok) {
				const firstError = result?.errors && Object.values(result.errors).flat().find(Boolean);
				throw new Error(firstError || result?.message || "Data hasil observasi aset lama gagal disimpan.");
			}

			setRows(Array.isArray(result?.data) ? result.data.map(mapBackendRow) : []);
			setSuccessMessage(result?.message || "Data hasil observasi aset lama berhasil disimpan.");
		} catch (error) {
			setErrorMessage(error.message || "Data hasil observasi aset lama gagal disimpan.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<AlertError message={errorMessage} onClose={() => setErrorMessage("")} />
			<AlertSuccess message={successMessage} onClose={() => setSuccessMessage("")} />
			<ConfirmationPopup
				isOpen={showDeleteConfirmation}
				message="Apakah Anda yakin ingin menghapus data Hasil Observasi Aset Lama?"
				onConfirm={confirmRemoveRow}
				onCancel={cancelRemoveRow}
			/>
			<div className="rounded-xl border border-[#DCE5EF] bg-white p-4">
				<div className="overflow-x-auto rounded-xl border border-[#DCE5EF]">
				<table className="w-full min-w-[1080px] border-collapse">
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
						{loading && <tr><td className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]" colSpan={7}>Memuat data Hasil Observasi Aset Lama...</td></tr>}
						{!loading && rows.map((row, index) => (
							<tr className="border-b border-[#EDF2F7]" data-row-id={row.id} key={row.id}>
								<td className="w-[50px] px-3 py-2 text-center font-poppins text-sm text-[#475569]">{index + 1}</td>
								<td className="min-w-[230px] px-3 py-2"><input aria-label={`Nama aset ${index + 1}`} className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]" value={row.namaAset} placeholder="Nama Aset" onChange={(event) => updateRow(row.id, "namaAset", event.target.value)} /></td>
								<td className="min-w-[160px] px-3 py-2"><input aria-label={`Kode aset ${index + 1}`} className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]" value={row.kodeAset} placeholder="Kode Aset" onChange={(event) => updateRow(row.id, "kodeAset", event.target.value)} /></td>
								<td className="min-w-[170px] px-3 py-2"><DateInput ariaLabel={`Tanggal perolehan ${index + 1}`} value={row.tanggalPerolehan} onChange={(value) => updateRow(row.id, "tanggalPerolehan", value)} /></td>
								<td className="min-w-[220px] px-3 py-2"><div className="inline-flex h-10 min-w-[190px] w-max max-w-none items-center overflow-hidden rounded-xl border border-[#DCE5EF] bg-white transition focus-within:border-[#38BDF8]"><div className="flex h-full shrink-0 items-center border-r border-[#DCE5EF] bg-[#F8FAFC] px-3"><span className="font-poppins text-sm text-[#94A3B8]">Rp</span></div><input aria-label={`Harga perolehan ${index + 1}`} className="[field-sizing:content] min-w-[100px] max-w-none shrink-0 bg-transparent px-3 text-left font-poppins text-sm text-[#475569] outline-none" inputMode="numeric" placeholder="0" value={formatAmount(row.hargaPerolehan)} onChange={(event) => updateRow(row.id, "hargaPerolehan", event.target.value)} /></div></td>
								<td className="min-w-[120px] px-3 py-2"><input id={`bukti-${row.id}`} className="hidden" type="file" accept="image/*,.pdf" onChange={(event) => chooseFile(row.id, event)} /><div className="flex items-center justify-center gap-2"><button className="font-poppins text-sm font-medium text-[#38BDF8] transition hover:underline" type="button" onClick={() => document.getElementById(`bukti-${row.id}`)?.click()}>File</button>{(row.bukti || row.buktiExisting) && <button aria-label={`Lihat bukti ${index + 1}`} className="flex h-7 w-7 items-center justify-center rounded-md text-[#38BDF8] transition hover:bg-[#F1F5F9]" title="Lihat file" type="button" onClick={() => viewFile(row)}><Eye size={16} /></button>}</div></td>
								<td className="min-w-[70px] px-3 py-2 text-center"><button aria-label={`Hapus aset ${index + 1}`} className="text-[#FF3030] transition hover:text-[#DC2626]" type="button" disabled={saving} onClick={() => requestRemoveRow(row)}><Trash2 size={16} /></button></td>
							</tr>
						))}
						{!loading && rows.length === 0 && <tr><td className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]" colSpan={7}>Belum ada data Hasil Observasi Aset Lama.</td></tr>}
					</tbody>
				</table>
				</div>
				<div className="mt-4 flex justify-center"><AddDataButton label="Tambah Data" onClick={() => setRows((current) => [...current, createRow(asetTetapId)])} disabled={saving || loading} /></div>
				<div className="mt-5 border-t border-[#DCE5EF] pt-4">
					<div className="flex justify-end">
						<SaveButton onClick={handleSave} disabled={saving || loading || rows.length === 0} isSaving={saving} label="Simpan" savingLabel="Menyimpan..." />
					</div>
				</div>
			</div>
		</>
	);
}
