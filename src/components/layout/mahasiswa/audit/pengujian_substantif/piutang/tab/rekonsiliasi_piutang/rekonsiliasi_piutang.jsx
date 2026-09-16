"use client";

import { useEffect, useState } from "react";

import {
	CalendarDays,
	// ChevronDown,
	Trash2,
} from "lucide-react";

import { useParams } from "next/navigation";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import Dropdown from "@/components/ui/dropdown/dropdown";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import { getPiutang } from "@/services/mahasiswa/tugas/audit/piutang/piutang";
import {
	createRekonsiliasiPiutang,
	deleteRekonsiliasiPiutang,
	getRekonsiliasiPiutang,
	updateRekonsiliasiPiutang,
} from "@/services/mahasiswa/tugas/audit/piutang/rekonsiliasi_piutang/rekonsiliasi_piutang";

let nextClientRowId = 0;

const createRow = () => ({
	clientId: `new-${++nextClientRowId}`,
	id: null,
	konfirmasiPiutangId: "",
	nomorFaktur: "",
	tanggalFaktur: "",
	saldoBuku: "",
	saldoCustomer: "",
	selisih: "0",
	keterangan: "",
});

const formatBackendAmount = (value) => {
	const stringValue = String(value ?? "");
	const integerValue = /^-?\d+\.\d{1,2}$/.test(stringValue)
		? stringValue.split(".")[0]
		: stringValue;

	return formatAmount(integerValue);
};

const toApiAmount = (value) => {
	const digits = getDigits(value) || "0";

	return String(value ?? "").trim().startsWith("-") ? `-${digits}` : digits;
};

const toDateInputValue = (value) => (value ? String(value).slice(0, 10) : "");

const normalizeRow = (item) => ({
	clientId: `saved-${item.RekonsiliasiPiutangID}`,
	id: item.RekonsiliasiPiutangID,
	konfirmasiPiutangId: item.KonfirmasiPiutangID ?? "",
	nomorFaktur: item.NomorFaktur ?? "",
	tanggalFaktur: toDateInputValue(item.TanggalFaktur),
	saldoBuku: formatBackendAmount(item.SaldoBuku),
	saldoCustomer: formatBackendAmount(item.SaldoCustomer),
	selisih: String(item.Selisih ?? "0").split(".")[0],
	keterangan: item.Keterangan ?? "",
});

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
	{ key: "konfirmasiPiutangId", label: "Nama Customer" },
	{ key: "nomorFaktur", label: "Nomor Faktur" },
	{ key: "tanggalFaktur", label: "Tanggal Faktur", type: "date" },
	{ key: "saldoBuku", label: "Saldo Buku Perusahaan", prefix: "Rp" },
	{ key: "saldoCustomer", label: "Saldo Menurut Customer", prefix: "Rp" },
	{ key: "selisih", label: "Selisih", prefix: "Rp", readOnly: true },
	{ key: "keterangan", label: "Keterangan" },
];

export default function RekonsiliasiPiutangTab() {
	const params = useParams();
	const jwbKasusId = params.id;
	const [piutangId, setPiutangId] = useState(null);
	const [rows, setRows] = useState([]);
	const [customerOptions, setCustomerOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(Boolean(jwbKasusId));
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [deleteIndex, setDeleteIndex] = useState(null);

	useEffect(() => {
		let isMounted = true;

		if (!jwbKasusId) {
			return () => {
				isMounted = false;
			};
		}

		getPiutang(jwbKasusId)
			.then((data) => {
				if (!isMounted) return;

				const resolvedPiutangId = data?.PiutangID ?? null;
				setPiutangId(resolvedPiutangId);

				if (!resolvedPiutangId) {
					setErrorMessage("Data piutang tidak tersedia.");
					setIsLoading(false);
				}
			})
			.catch(() => {
				if (!isMounted) return;
				setErrorMessage("Data piutang gagal dimuat.");
				setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [jwbKasusId]);

	useEffect(() => {
		if (!piutangId) {
			return undefined;
		}

		let isMounted = true;

		getRekonsiliasiPiutang(piutangId)
			.then(({ items, customerOptions: options }) => {
				if (!isMounted) return;
				setRows(items.map(normalizeRow));
				setCustomerOptions(options);
			})
			.catch(() => {
				if (isMounted) setErrorMessage("Data rekonsiliasi piutang gagal dimuat.");
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [piutangId]);
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

	const addRow = () => setRows((currentRows) => [...currentRows, createRow()]);

	const removeRow = (index) => {
		setDeleteIndex(index);
	};

	const confirmRemoveRow = async () => {
		const row = rows[deleteIndex];
		setDeleteIndex(null);

		try {
			if (row.id && piutangId) {
				await deleteRekonsiliasiPiutang(piutangId, row.id);
			}
			setRows((currentRows) => currentRows.filter((_, rowIndex) => rowIndex !== deleteIndex));
			setErrorMessage("");
			setSuccessMessage("Data rekonsiliasi piutang berhasil dihapus.");
		} catch {
			setErrorMessage("Data rekonsiliasi piutang gagal dihapus.");
		}
	};

	const saveRows = async () => {
		if (!piutangId) {
			setErrorMessage("Piutang belum tersedia untuk disimpan.");
			return;
		}

		if (rows.some((row) => !row.konfirmasiPiutangId)) {
			setErrorMessage("Pilih nama customer dari Konfirmasi Piutang untuk setiap baris.");
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			const savedRows = await Promise.all(
				rows.map(async (row) => {
					const payload = {
						KonfirmasiPiutangID: Number(row.konfirmasiPiutangId),
						NomorFaktur: row.nomorFaktur,
						TanggalFaktur: row.tanggalFaktur,
						SaldoBuku: toApiAmount(row.saldoBuku),
						SaldoCustomer: toApiAmount(row.saldoCustomer),
						Selisih: toApiAmount(row.selisih),
						Keterangan: row.keterangan || null,
					};

					return row.id
						? updateRekonsiliasiPiutang(piutangId, row.id, payload)
						: createRekonsiliasiPiutang(piutangId, payload);
				})
			);

			setRows(savedRows.map(normalizeRow));
			setSuccessMessage("Data rekonsiliasi piutang berhasil disimpan.");
		} catch (error) {
			setErrorMessage(error.response?.data?.message ?? "Data rekonsiliasi piutang gagal disimpan.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="min-h-[520px] rounded-xl border border-[#DCE5EF] bg-white px-4 pb-12 pt-4">
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
				message="Apakah Anda yakin ingin menghapus data rekonsiliasi piutang?"
				confirmText="Hapus"
				cancelText="Batal"
				onConfirm={confirmRemoveRow}
				onCancel={() => setDeleteIndex(null)}
			/>
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

			<div className="overflow-x-auto rounded-lg border border-[#DCE5EF]">
				<div className="min-w-max">
					<div style={{ gridTemplateColumns: tableColumns }} className="grid min-w-max items-center border-b border-[#DCE5EF] bg-[#F8FAFC] px-3 py-3">
						<div className="font-poppins text-[11px] font-semibold uppercase text-[#64748B]">No</div>
						{fields.map((field) => (
							<div key={field.key} className="px-1 font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B]">
								{field.label}
							</div>
						))}
						<div className="text-center font-poppins text-[11px] font-semibold uppercase text-[#64748B]">Aksi</div>
					</div>

					{isLoading ? (
						<div style={{ gridTemplateColumns: tableColumns }} className="grid min-w-max px-3 py-8">
							<div className="col-span-9 text-center font-poppins text-xs text-[#94A3B8]">Memuat data rekonsiliasi piutang...</div>
						</div>
					) : rows.length === 0 ? (
						<div style={{ gridTemplateColumns: tableColumns }} className="grid min-w-max px-3 py-8">
							<div className="col-span-9 text-center font-poppins text-xs text-[#94A3B8]">Belum ada rekonsiliasi piutang.</div>
						</div>
					) : rows.map((row, index) => (
						<div key={row.id ?? row.clientId} style={{ gridTemplateColumns: tableColumns }} className="grid min-w-max items-center border-b border-[#EEF2F6] px-3 py-3 last:border-b-0">
							<div className="px-1 font-poppins text-xs text-[#64748B]">{index + 1}</div>

							{fields.map((field) => {
								const displayValue = field.key === "selisih"
									? formatAmount(row[field.key])
									: row[field.key];
								return (
								<div key={field.key} className="px-1">
									{field.key === "konfirmasiPiutangId" ? (
										<Dropdown
											options={customerOptions}
											value={row.konfirmasiPiutangId}
											onChange={(value) => updateRow(index, "konfirmasiPiutangId", value)}
											placeholder="Pilih customer"
											showCheck
											className="text-[10px]"
										/>
									) : (
										<div className="relative">
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
				<AddDataButton
					onClick={addRow}
					disabled={isLoading || isSaving || customerOptions.length === 0}
				/>
			</div>

			<div className="mt-5 flex justify-end">
				<SaveButton
					onClick={saveRows}
					disabled={isLoading || isSaving || rows.length === 0}
					isSaving={isSaving}
				/>
			</div>
		</div>
	);
}
