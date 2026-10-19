"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";

import { getAsetLainLain } from "@/services/mahasiswa/tugas/audit/aset_lain_lain/aset_lain_lain";
import useDokumentasi from "@/hooks/mahasiswa/tugas/audit/pengujian_substantif/aset_lain_lain/dokumentasi/use_dokumentasi";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import ConfirmationPopup from "@/components/popup/confirmation_popup";

const createRow = () => ({
	id: `dokumentasi-aset-lain-${Date.now()}-${Math.random()}`,
	noPerjanjian: "",
	objek: "",
	tanggalPerjanjian: "",
	tanggalMulai: "",
	tanggalAkhir: "",
	nominal: "",
	jangkaWaktu: "",
	masaPemakaian: "",
	amortisasiPerBulan: "",
	amortisasiSampaiTanggal: "",
	audit: "",
	perusahaan: "",
	perusahaanDiisiManual: false,
	selisih: "",
});

const mapApiRow = (item) => ({
	id: item.DokumentasiID,
	DokumentasiID: item.DokumentasiID,
	noPerjanjian: item.NomorPerjanjian ?? "",
	objek: item.Objek ?? "",
	tanggalPerjanjian: item.TanggalPerjanjian ?? "",
	tanggalMulai: item.TanggalMulai ?? "",
	tanggalAkhir: item.TanggalAkhir ?? "",
	nominal: String(item.Nominal ?? ""),
	jangkaWaktu: String(item.JangkaWaktu ?? ""),
	masaPemakaian: String(item.MasaPemakaian ?? ""),
	amortisasiPerBulan: String(item.AmortisasiBulan ?? ""),
	amortisasiSampaiTanggal: String(item.AmortisasiAkhirTahun ?? ""),
	audit: String(item.Audit ?? ""),
	perusahaan: String(item.Perusahaan ?? ""),
	perusahaanDiisiManual: Number(item.Perusahaan ?? 0) !== 0,
	selisih: String(item.Selisih ?? ""),
});

const formatAmount = (value) => {
	const digits = String(value ?? "").replace(/\D/g, "");
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const amountValue = (value) => Number(String(value ?? "").replace(/\D/g, "")) || 0;

const formatCalculatedAmount = (value) => (
	value !== "" && value !== null && value !== undefined
		? new Intl.NumberFormat("id-ID", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value)
		: ""
);

const calculateDurationMonths = (startDate, endDate) => {
	if (!startDate || !endDate || endDate < startDate) return "";

	const start = new Date(`${startDate}T00:00:00Z`);
	const end = new Date(`${endDate}T00:00:00Z`);
	let months =
		(end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
		(end.getUTCMonth() - start.getUTCMonth());

	const anniversary = new Date(start);
	anniversary.setUTCMonth(anniversary.getUTCMonth() + months);

	if (anniversary > end) {
		months -= 1;
	}

	const fullMonthsDate = new Date(start);
	fullMonthsDate.setUTCMonth(fullMonthsDate.getUTCMonth() + months);

	const remainingDays = Math.floor(
		(end.getTime() - fullMonthsDate.getTime()) / (1000 * 60 * 60 * 24)
	);

	if (remainingDays >= 16) {
		months += 1;
	}

	return String(Math.max(months, 0));
};

const calculateMonthlyAmortization = (row) => {
	const durationMonths = Number(
		calculateDurationMonths(row.tanggalMulai, row.tanggalAkhir)
	);

	return durationMonths > 0 ? amountValue(row.nominal) / durationMonths : 0;
};

const calculateFiscalYearAmortization = (row) => {
	const nominal = amountValue(row.nominal);
	const monthlyAmortization = calculateMonthlyAmortization(row);
	const usageMonths = amountValue(row.masaPemakaian);

	return nominal > 0 && monthlyAmortization > 0 && usageMonths > 0
		? Math.min(usageMonths * monthlyAmortization, nominal)
		: 0;
};

const calculateAuditAmount = (row) => {
	const nominal = amountValue(row.nominal);
	const fiscalYearAmortization = calculateFiscalYearAmortization(row);

	return nominal > 0 ? nominal - fiscalYearAmortization : 0;
};

const calculateDifferenceAmount = (row) => {
	const auditAmount = calculateAuditAmount(row);
	const companyAmount = amountValue(row.perusahaan);

	return auditAmount - companyAmount;
};

const amountFields = new Set([
	"nominal",
	"masaPemakaian",
	"amortisasiPerBulan",
	"amortisasiSampaiTanggal",
	"selisih",
	"perusahaan",
]);

const columns = [
	{ key: "noPerjanjian", label: "No Perjanjian", className: "min-w-[220px]" },
	{ key: "objek", label: "Objek", className: "min-w-[190px]" },
	{ key: "tanggalPerjanjian", label: "Tanggal Perjanjian", type: "date", className: "min-w-[170px]" },
	{ key: "tanggalMulai", label: "Tanggal Mulai", type: "date", className: "min-w-[160px]" },
	{ key: "tanggalAkhir", label: "Tanggal Akhir", type: "date", className: "min-w-[160px]" },
	{ key: "nominal", label: "Nominal", currency: true, className: "min-w-[170px]" },
	{ key: "jangkaWaktu", label: "Jangka Waktu", className: "min-w-[130px]" },
	{ key: "masaPemakaian", label: "Masa Pemakaian", className: "min-w-[150px]" },
	{ key: "amortisasiPerBulan", label: "Amortisasi/Bulan", currency: true, className: "min-w-[190px]" },
	{ key: "amortisasiSampaiTanggal", label: "Amortisasi Akhir Tahun Fiskal", currency: true, className: "min-w-[220px]" },
	{ key: "audit", label: "Audit", currency: true, className: "min-w-[170px]" },
	{ key: "perusahaan", label: "Perusahaan", currency: true, className: "min-w-[170px]" },
	{ key: "selisih", label: "Selisih", currency: true, className: "min-w-[170px]" },
];

const formatDateIndonesia = (value) => {
	const [year, month, day] = String(value || "").slice(0, 10).split("-");
	return year && month && day ? `${day}/${month}/${year}` : "";
};

function DateInput({ value, min, onChange, ariaLabel }) {
	const dateInputRef = useRef(null);

	const openDatePicker = () => {
		const picker = dateInputRef.current;
		if (!picker) return;

		if (typeof picker.showPicker === "function") {
			picker.showPicker();
			return;
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
				min={min}
				onChange={(event) => onChange(event.target.value)}
				tabIndex={-1}
				aria-hidden="true"
				className="pointer-events-none absolute h-px w-px opacity-0"
			/>
		</div>
	);
}

export default function DokumentasiAsetLainLainTab({ auditId }) {
	const [rows, setRows] = useState([]);
	const [saving, setSaving] = useState(false);
	const [asetLainId, setAsetLainId] = useState(null);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [focusedCompanyRowId, setFocusedCompanyRowId] = useState(null);
	const [rowToDelete, setRowToDelete] = useState(null);
	const {
		dokumentasiList,
		loading,
		error: dokumentasiError,
		saveAll,
		remove,
	} = useDokumentasi({ asetLainId });

	useEffect(() => {
		if (dokumentasiError) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setErrorMessage(dokumentasiError);
		}
	}, [dokumentasiError]);

	useEffect(() => {
		const fetchAsetLain = async () => {
			if (!auditId) return;

			try {
				const data = await getAsetLainLain(auditId);
				setAsetLainId(data?.AsetLainID ?? null);
			} catch (error) {
				console.error("Gagal mengambil data aset lain-lain:", error);
				setErrorMessage(
					error.response?.data?.message ||
					"Gagal mengambil data aset lain-lain."
				);
			}
		};

		fetchAsetLain();
	}, [auditId]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setRows(dokumentasiList.map(mapApiRow));
	}, [dokumentasiList]);

	const updateRow = (id, field, value) => {
		setRows((current) => current.map((row) => (
			row.id === id
				? {
					...row,
					[field]: amountFields.has(field) ? value.replace(/\D/g, "") : value,
					...(field === "perusahaan" ? { perusahaanDiisiManual: value.replace(/\D/g, "") !== "" } : {}),
				}
				: row
		)));
	};

	const hasRowInput = (row) => (
		Object.entries(row).some(([key, value]) => (
			key !== "id" &&
			key !== "perusahaanDiisiManual" &&
			String(value ?? "").trim() !== ""
		))
	);

	const removeRow = async (row) => {
		if (row.DokumentasiID) {
			await remove(row.DokumentasiID);
		} else {
			setRows((current) => current.filter((item) => item.id !== row.id));
		}

		setErrorMessage("");
		setSuccessMessage("Data dokumentasi aset lain-lain berhasil dihapus.");
	};

	const requestRemoveRow = (row) => {
		if (hasRowInput(row)) {
			setRowToDelete(row);
			return;
		}

		removeRow(row).catch((error) => {
			setErrorMessage(
				error.response?.data?.message ||
				"Gagal menghapus data dokumentasi aset lain-lain."
			);
		});
	};

	const confirmRemoveRow = () => {
		if (rowToDelete) {
			removeRow(rowToDelete).catch((error) => {
				setErrorMessage(
					error.response?.data?.message ||
					"Gagal menghapus data dokumentasi aset lain-lain."
				);
			});
		}
		setRowToDelete(null);
	};

	const cancelRemoveRow = () => {
		setRowToDelete(null);
	};

	const handleSave = async () => {
		setSaving(true);
		setErrorMessage("");
		setSuccessMessage("");
		try {
			const rowsWithInput = rows.filter(hasRowInput);
			if (rowsWithInput.length === 0) {
				throw new Error("Tambahkan minimal satu data dokumentasi yang lengkap.");
			}

			const requiredFields = [
				"noPerjanjian",
				"objek",
				"tanggalPerjanjian",
				"tanggalMulai",
				"tanggalAkhir",
			];
			const incompleteRowIndex = rowsWithInput.findIndex((row) => (
				requiredFields.some((field) => !String(row[field] ?? "").trim())
			));

			if (incompleteRowIndex !== -1) {
				throw new Error(`Data pada baris ${rows.indexOf(rowsWithInput[incompleteRowIndex]) + 1} belum lengkap.`);
			}

			const invalidStartDate = rows.some(
				(row) =>
					row.tanggalPerjanjian &&
					row.tanggalMulai &&
					row.tanggalMulai < row.tanggalPerjanjian
			);

			if (invalidStartDate) {
				throw new Error("Tanggal Mulai tidak boleh kurang dari Tanggal Perjanjian.");
			}

			const invalidDateRange = rows.some(
				(row) =>
					row.tanggalMulai &&
					row.tanggalAkhir &&
					row.tanggalAkhir < row.tanggalMulai
			);

			if (invalidDateRange) {
				throw new Error("Tanggal Akhir tidak boleh kurang dari Tanggal Mulai.");
			}

			const invalidUsageDuration = rowsWithInput.some(
				(row) => Number(row.masaPemakaian) > Number(calculateDurationMonths(
					row.tanggalMulai,
					row.tanggalAkhir
				))
			);

			if (invalidUsageDuration) {
				throw new Error("Masa Pemakaian tidak boleh lebih dari Jangka Waktu.");
			}

			if (!asetLainId) {
				throw new Error("ID aset lain-lain tidak ditemukan.");
			}

			const payload = rowsWithInput.map((row) => ({
				...(row.DokumentasiID ? { DokumentasiID: row.DokumentasiID } : {}),
				NomorPerjanjian: row.noPerjanjian.trim(),
				Objek: row.objek.trim(),
				TanggalPerjanjian: row.tanggalPerjanjian,
				TanggalMulai: row.tanggalMulai,
				TanggalAkhir: row.tanggalAkhir,
				Nominal: amountValue(row.nominal),
				MasaPemakaian: Number(row.masaPemakaian) || 0,
				Perusahaan: amountValue(row.perusahaan),
			}));

			await saveAll(payload);
			setSuccessMessage("Data dokumentasi aset lain-lain berhasil disimpan.");
		} catch (error) {
			setErrorMessage(
				error.response?.data?.message ||
				error.message ||
				"Data dokumentasi aset lain-lain gagal disimpan."
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<section className="rounded-xl border border-[#DCE5EF] bg-white p-4">
			<AlertError message={errorMessage} onClose={() => setErrorMessage("")} />
			<AlertSuccess message={successMessage} onClose={() => setSuccessMessage("")} />
			<ConfirmationPopup
				isOpen={rowToDelete !== null}
				message="Apakah Anda yakin ingin menghapus data dokumentasi ini?"
				confirmText="Hapus"
				cancelText="Batal"
				onConfirm={confirmRemoveRow}
				onCancel={cancelRemoveRow}
			/>

			<div className="overflow-x-auto rounded-xl border border-[#DCE5EF]">
				<table className="w-full min-w-[2700px] border-collapse">
					<thead className="bg-[#F8FAFC]">
						<tr>
							<th className="w-[50px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">No</th>
							{columns.map((column) => (
								<th key={column.key} className={`${column.className} border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]`}>
									{column.label}
								</th>
							))}
							<th className="min-w-[70px] border-b border-[#DCE5EF] px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Aksi</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row, index) => (
							<tr className="border-b border-[#EDF2F7]" key={row.id}>
								<td className="px-3 py-2 text-center font-poppins text-sm text-[#475569]">{index + 1}</td>
								{columns.map((column) => (
									<td className={`${column.className} px-3 py-2`} key={column.key}>
											{column.key === "jangkaWaktu" ? (
												<input
													aria-label={`Jangka waktu baris ${index + 1}`}
													className="h-10 w-full rounded-xl border border-[#CBD5E1] bg-[#F1F5F9] px-3 text-center font-poppins text-sm text-[#64748B] outline-none"
													readOnly
													tabIndex={-1}
													value={calculateDurationMonths(row.tanggalMulai, row.tanggalAkhir)}
												/>
											) : column.currency ? (
												<div className={`inline-flex h-10 min-w-[150px] w-full items-center overflow-hidden rounded-xl border ${["amortisasiPerBulan", "amortisasiSampaiTanggal", "audit", "selisih"].includes(column.key) ? "border-[#CBD5E1] bg-[#F1F5F9]" : "border-[#DCE5EF] bg-white transition focus-within:border-[#38BDF8]"}`}>
												<span className="flex h-full w-10 shrink-0 items-center justify-center border-r border-[#DCE5EF] bg-[#F8FAFC] font-poppins text-sm text-[#94A3B8]">Rp</span>
													<input aria-label={`${column.label} baris ${index + 1}`} className={`min-w-0 flex-1 bg-transparent px-3 text-right font-poppins text-sm outline-none ${["amortisasiPerBulan", "amortisasiSampaiTanggal", "audit", "selisih"].includes(column.key) ? "text-[#64748B]" : "text-[#475569]"}`} style={column.key === "perusahaan" ? { color: row.perusahaanDiisiManual ? "#475569" : "#94A3B8" } : undefined} inputMode="numeric" placeholder={column.key === "perusahaan" ? "0" : "0"} readOnly={["amortisasiPerBulan", "amortisasiSampaiTanggal", "audit", "selisih"].includes(column.key)} tabIndex={["amortisasiPerBulan", "amortisasiSampaiTanggal", "audit", "selisih"].includes(column.key) ? -1 : undefined} value={column.key === "amortisasiPerBulan" ? formatCalculatedAmount(calculateMonthlyAmortization(row)) : column.key === "amortisasiSampaiTanggal" ? formatCalculatedAmount(calculateFiscalYearAmortization(row)) : column.key === "audit" ? formatCalculatedAmount(calculateAuditAmount(row)) : column.key === "selisih" ? formatCalculatedAmount(calculateDifferenceAmount(row)) : column.key === "perusahaan" ? (row.perusahaanDiisiManual || focusedCompanyRowId !== row.id ? formatAmount(row[column.key]) : "") : formatAmount(row[column.key])} onFocus={() => column.key === "perusahaan" && setFocusedCompanyRowId(row.id)} onBlur={() => column.key === "perusahaan" && setFocusedCompanyRowId(null)} onChange={(event) => updateRow(row.id, column.key, event.target.value)} />
											</div>
										) : column.type === "date" ? (
											<DateInput
												value={row[column.key]}
												min={column.key === "tanggalMulai" ? row.tanggalPerjanjian || undefined : column.key === "tanggalAkhir" ? row.tanggalMulai || undefined : undefined}
												ariaLabel={`${column.label} baris ${index + 1}`}
												onChange={(value) => {
													if (column.key === "tanggalPerjanjian" && row.tanggalMulai && row.tanggalMulai < value) {
														setErrorMessage("Tanggal Mulai tidak boleh kurang dari Tanggal Perjanjian.");
														return;
													}
													if (column.key === "tanggalMulai" && row.tanggalPerjanjian && value < row.tanggalPerjanjian) {
														setErrorMessage("Tanggal Mulai tidak boleh kurang dari Tanggal Perjanjian.");
														return;
													}
													if (column.key === "tanggalAkhir" && row.tanggalMulai && value < row.tanggalMulai) {
														setErrorMessage("Tanggal Akhir tidak boleh kurang dari Tanggal Mulai.");
														return;
													}
													updateRow(row.id, column.key, value);
												}}
											/>
										) : (
											<input aria-label={`${column.label} baris ${index + 1}`} className="h-10 w-full rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition placeholder:text-[#94A3B8] focus:border-[#38BDF8]" type={column.type || "text"} min={column.key === "tanggalMulai" ? row.tanggalPerjanjian || undefined : column.key === "tanggalAkhir" ? row.tanggalMulai || undefined : undefined} placeholder={column.type === "date" ? "" : column.key === "masaPemakaian" ? "0" : column.label} value={row[column.key]} onChange={(event) => {
														if (column.key === "tanggalPerjanjian" && row.tanggalMulai && row.tanggalMulai < event.target.value) {
															setErrorMessage("Tanggal Mulai tidak boleh kurang dari Tanggal Perjanjian.");
													return;
														}
														if (column.key === "tanggalMulai" && row.tanggalPerjanjian && event.target.value < row.tanggalPerjanjian) {
															setErrorMessage("Tanggal Mulai tidak boleh kurang dari Tanggal Perjanjian.");
															return;
														}
														if (column.key === "tanggalAkhir" && row.tanggalMulai && event.target.value < row.tanggalMulai) {
															setErrorMessage("Tanggal Akhir tidak boleh kurang dari Tanggal Mulai.");
															return;
												}
														if (column.key === "masaPemakaian" && row.tanggalMulai && row.tanggalAkhir && Number(event.target.value || 0) > Number(calculateDurationMonths(row.tanggalMulai, row.tanggalAkhir))) {
															setErrorMessage("Masa Pemakaian tidak boleh lebih dari Jangka Waktu.");
															return;
														}
														updateRow(row.id, column.key, event.target.value);
											}} />
										)}
									</td>
								))}
								<td className="min-w-[70px] px-3 py-2 text-center">
									<button aria-label={`Hapus dokumentasi baris ${index + 1}`} className="rounded p-1 text-[#F87171] transition hover:bg-[#FEF2F2] disabled:opacity-40" type="button" disabled={saving} onClick={() => requestRemoveRow(row)}>
										<Trash2 size={16} />
									</button>
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]" colSpan={columns.length + 2}>{loading ? "Memuat data..." : "Belum ada data Dokumentasi Aset Lain-Lain."}</td>
							</tr>
						)}
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