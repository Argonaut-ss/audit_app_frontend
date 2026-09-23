"use client";

import { useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import Dropdown from "@/components/ui/dropdown/dropdown";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";

let nextClientRowId = 0;

const createRow = () => ({
  clientId: `new-${++nextClientRowId}`,
  supplierId: "",
  nomorFaktur: "",
  tanggalFaktur: "",
  saldoBuku: "",
  saldoSupplier: "",
  selisih: "0",
  keterangan: "",
});

const getDigits = (value) => String(value ?? "").replace(/\D/g, "");

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

const parseAmount = (value) => {
  const digits = getDigits(value);
  return digits ? BigInt(digits) : 0n;
};

const calculateDifference = (saldoBuku, saldoSupplier) =>
  String(parseAmount(saldoBuku) - parseAmount(saldoSupplier));

const fields = [
  { key: "supplierId", label: "Nama Supplier" },
  { key: "nomorFaktur", label: "Nomor Faktur" },
  { key: "tanggalFaktur", label: "Tanggal Faktur", type: "date" },
  { key: "saldoBuku", label: "Saldo Buku Perusahaan", prefix: "Rp" },
  { key: "saldoSupplier", label: "Saldo Menurut Supplier", prefix: "Rp" },
  { key: "selisih", label: "Selisih", prefix: "Rp", readOnly: true },
  { key: "keterangan", label: "Keterangan" },
];

const supplierOptions = [];

export default function RekonsiliasiUtangTab() {
  const [rows, setRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteIndex, setDeleteIndex] = useState(null);

  const getAmountColumnWidth = (key) => Math.max(
    130,
    ...rows.map((row) => formatAmount(row[key]).length * 8 + 50)
  );

  const tableColumns = `44px 180px 130px 150px ${getAmountColumnWidth("saldoBuku")}px ${getAmountColumnWidth("saldoSupplier")}px ${getAmountColumnWidth("selisih")}px 150px 44px`;

  const updateRow = (index, key, value) => {
    const nextValue = key === "saldoBuku" || key === "saldoSupplier"
      ? formatInputAmount(value)
      : value;

    setRows((currentRows) => currentRows.map((row, rowIndex) => (
      rowIndex === index
        ? {
            ...row,
            [key]: nextValue,
            selisih: key === "saldoBuku" || key === "saldoSupplier"
              ? calculateDifference(
                key === "saldoBuku" ? nextValue : row.saldoBuku,
                key === "saldoSupplier" ? nextValue : row.saldoSupplier,
              )
              : row.selisih,
          }
        : row
    )));
  };

  const addRow = () => {
    setRows((currentRows) => [...currentRows, createRow()]);
    setErrorMessage("");
  };

  const confirmRemoveRow = () => {
    setRows((currentRows) => currentRows.filter((_, index) => index !== deleteIndex));
    setDeleteIndex(null);
    setSuccessMessage("Data rekonsiliasi utang berhasil dihapus dari daftar.");
  };

  const saveRows = async () => {
    if (rows.length === 0) {
      setErrorMessage("Tambahkan minimal satu data rekonsiliasi terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await Promise.resolve();
      setSuccessMessage("Data rekonsiliasi utang berhasil disimpan di tampilan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[520px] rounded-xl border border-[#DCE5EF] bg-white px-4 pb-12 pt-4">
      <AlertError message={errorMessage} onClose={() => setErrorMessage("")} />
      <AlertSuccess message={successMessage} onClose={() => setSuccessMessage("")} />
      <ConfirmationPopup
        isOpen={deleteIndex !== null}
        message="Apakah Anda yakin ingin menghapus data rekonsiliasi utang?"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmRemoveRow}
        onCancel={() => setDeleteIndex(null)}
      />

      <div className="overflow-x-auto rounded-lg border border-[#DCE5EF]">
        <div className="min-w-max">
          <div style={{ gridTemplateColumns: tableColumns }} className="grid min-w-max items-center border-b border-[#DCE5EF] bg-[#F8FAFC] px-3 py-3">
            <div className="font-poppins text-[11px] font-semibold uppercase text-[#64748B]">No</div>
            {fields.map((field) => (
              <div key={field.key} className="px-1 font-poppins text-[11px] font-semibold uppercase leading-tight text-[#64748B]">{field.label}</div>
            ))}
            <div className="text-center font-poppins text-[11px] font-semibold uppercase text-[#64748B]">Aksi</div>
          </div>

          {rows.length === 0 ? (
            <div className="px-3 py-8 text-center font-poppins text-sm text-[#94A3B8]">Belum ada rekonsiliasi utang.</div>
          ) : rows.map((row, index) => (
            <div key={row.clientId} style={{ gridTemplateColumns: tableColumns }} className="grid min-w-max items-center border-b border-[#EEF2F6] px-3 py-3 last:border-b-0">
              <div className="px-1 font-poppins text-sm text-[#64748B]">{index + 1}</div>
              {fields.map((field) => {
                const displayValue = field.key === "selisih" ? formatAmount(row[field.key]) : row[field.key];
                return (
                  <div key={field.key} className="px-1">
                    {field.key === "supplierId" ? (
                      <Dropdown
                        options={supplierOptions}
                        value={row.supplierId}
                        onChange={(value) => updateRow(index, "supplierId", value)}
                        placeholder="Pilih supplier"
                        showCheck
                        className="font-poppins text-sm [&_button]:text-sm [&_span]:text-sm"
                      />
                    ) : (
                      <div className="relative">
                        {field.prefix && <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-poppins text-sm text-[#64748B]">{field.prefix}</span>}
                        <input
                          type={field.type || "text"}
                          value={displayValue}
                          readOnly={field.readOnly}
                          onChange={(event) => updateRow(index, field.key, event.target.value)}
                          className={`h-10 w-full min-w-0 rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition focus:border-[#38BDF8] ${field.prefix ? "pl-8 text-right" : ""} ${field.type === "date" ? "pr-1" : ""} ${field.readOnly ? "cursor-not-allowed bg-[#F1F5F9] text-right text-[#94A3B8]" : ""}`}
                        />
                        {field.type === "date" && <CalendarDays size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#475569]" />}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-center">
                <button type="button" aria-label={`Hapus baris ${index + 1}`} onClick={() => setDeleteIndex(index)} className="rounded p-1 text-[#F87171] transition hover:bg-[#FEF2F2]"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <AddDataButton onClick={addRow} disabled={isSaving} />
      </div>
      <div className="mt-5 flex justify-end">
        <SaveButton onClick={saveRows} disabled={isSaving || rows.length === 0} isSaving={isSaving} />
      </div>
    </div>
  );
}
