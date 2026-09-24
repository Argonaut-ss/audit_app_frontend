"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import SaveButton from "@/components/button/save_button";

const initialRows = [
  ["BRR18A", 960, 380, 810, 0, 190, 1000, 40, "konsinyasi"],
  ["DUR18D", 1025, 105, 1200, 0, 285, 1020, -5, "hilang"],
  ["GRR16G", 970, 300, 920, 0, 200, 1020, 50, "konsinyasi"],
  ["YHR20Y", 900, 118, 780, 0, 100, 798, -2, "dipakai sendiri"],
  ["DRR12D", 910, 100, 860, 0, 50, 910, 0, "sesuai"],
  ["DRR12E", 890, 85, 890, 0, 85, 890, 0, "sesuai"],
  ["AUR13A", 940, 63, 940, 0, 65, 938, -2, "promosi"],
  ["AUR13B", 950, 198, 800, 0, 50, 948, -2, "promosi"],
  ["CRR14C", 900, 388, 978, 0, 459, 898, -2, "promosi"],
  ["CRR14F", 1100, 146, 1000, 0, 50, 1096, -4, "hilang"],
  ["GUR15G", 1080, 378, 785, 0, 86, 1080, 0, "sesuai"],
  ["GUR15H", 1200, 592, 708, 0, 100, 1200, 0, "sesuai"],
  ["DUR16D", 135, 43, 135, 0, 45, 133, -2, "hilang"],
].map((row, index) => ({
  id: index + 1,
  nama: row[0],
  saldoNeraca: row[1],
  saldoStokOpname: row[2],
  keluar: row[3],
  rusak: row[4],
  masuk: row[5],
  saldoAudit: row[6],
  selisih: row[7],
  keterangan: row[8],
}));

const numberFields = ["saldoNeraca", "saldoStokOpname", "keluar", "rusak", "masuk"];
const formatNumber = (value) => Number(value || 0).toLocaleString("id-ID");
const inputClass = "h-10 w-full min-w-[72px] rounded-xl border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] outline-none transition focus:border-[#38BDF8]";

export default function UjiMutasiTab() {
  const [rows, setRows] = useState(initialRows);
  const [period, setPeriod] = useState("sesudah");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const updateRow = (id, field, value) => {
    const nextValue = numberFields.includes(field) ? value.replace(/[^\d-]/g, "") : value;

    setRows((currentRows) => currentRows.map((row) => {
      if (row.id !== id) return row;

      const nextRow = { ...row, [field]: nextValue };
      const saldoAudit = Number(nextRow.saldoStokOpname || 0) - Number(nextRow.keluar || 0) - Number(nextRow.rusak || 0) + Number(nextRow.masuk || 0);

      return { ...nextRow, saldoAudit, selisih: saldoAudit - Number(nextRow.saldoNeraca || 0) };
    }));
  };

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return query ? rows.filter((row) => row.nama.toLowerCase().includes(query)) : rows;
  }, [rows, searchTerm]);

  const totals = useMemo(() => rows.reduce((total, row) => ({
    saldoNeraca: total.saldoNeraca + Number(row.saldoNeraca || 0),
    saldoStokOpname: total.saldoStokOpname + Number(row.saldoStokOpname || 0),
    keluar: total.keluar + Number(row.keluar || 0),
    rusak: total.rusak + Number(row.rusak || 0),
    masuk: total.masuk + Number(row.masuk || 0),
    saldoAudit: total.saldoAudit + Number(row.saldoAudit || 0),
    selisih: total.selisih + Number(row.selisih || 0),
  }), { saldoNeraca: 0, saldoStokOpname: 0, keluar: 0, rusak: 0, masuk: 0, saldoAudit: 0, selisih: 0 }), [rows]);

  const handleSave = () => {
    if (rows.some((row) => !row.nama.trim())) {
      setErrorMessage("Nama persediaan belum lengkap.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("Data uji mutasi berhasil disimpan.");
  };

  return (
    <div className="font-poppins text-[#334155]">
      <AlertSuccess message={successMessage} title="Berhasil" onClose={() => setSuccessMessage("")} />
      <AlertError message={errorMessage} title="Gagal" onClose={() => setErrorMessage("")} />

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-fit rounded-lg border border-[#DCE5EF] bg-[#F1F5F9] p-1">
            {[{ id: "sebelum", label: "Sebelum Tutup Buku" }, { id: "sesudah", label: "Sesudah Tutup Buku" }].map((item) => (
              <button key={item.id} type="button" onClick={() => setPeriod(item.id)} className={`rounded-lg px-4 py-2 font-poppins text-sm font-medium transition ${period === item.id ? "bg-white font-semibold text-[#2494C7] shadow-sm" : "text-[#64748B]"}`}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-[280px]">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Cari Nama Persediaan" className="h-10 w-full rounded-xl border border-[#DCE5EF] pl-9 pr-3 font-poppins text-sm text-[#475569] outline-none placeholder:text-[#94A3B8] transition focus:border-[#38BDF8]" />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-[#DCE5EF]">
          <table className="w-full min-w-[1750px] border-collapse">
            <thead className="bg-[#F8FAFC]"><tr className="border-b border-[#DCE5EF]">
              {["No", "Nama Persediaan", "Satuan", "Saldo Neraca", "Saldo Hasil Stok Opname", "Keluar", "Rusak", "Masuk", "Saldo Per Uji Mutasi (Audited)", "Selisih Uji Mutasi Dengan Saldo Akhir Per 31 Desember", "Keterangan"].map((label) => <th key={label} className={`${label.startsWith("Selisih") ? "w-[120px] max-w-[120px]" : ""} px-3 py-3 text-center font-poppins text-[11px] font-semibold uppercase leading-tight tracking-wide text-[#64748B]`}>{label}</th>)}
            </tr></thead>
            <tbody>
              {filteredRows.map((row, index) => <tr key={row.id} className="border-b border-[#EEF2F6] last:border-none">
                <td className="px-3 py-2 text-center font-poppins text-sm text-[#475569]">{index + 1}</td>
                <td className="px-3 py-2"><input value={row.nama} readOnly className={`${inputClass} cursor-not-allowed !bg-[#F1F5F9] text-[#64748B]`} /></td>
                <td className="px-3 py-2"><input value="Unit" readOnly className={`${inputClass} cursor-not-allowed !bg-[#F1F5F9] text-[#64748B]`} /></td>
                {numberFields.map((field) => <td key={field} className="px-3 py-2"><input value={row[field]} readOnly={field === "saldoNeraca"} onChange={(event) => updateRow(row.id, field, event.target.value)} inputMode="numeric" className={field === "saldoNeraca" ? `${inputClass} cursor-not-allowed !bg-[#F1F5F9] text-[#64748B]` : inputClass} /></td>)}
                <td className="px-3 py-2"><input value={row.saldoAudit} readOnly className={`${inputClass} cursor-not-allowed !bg-[#F1F5F9] text-[#64748B]`} /></td>
                <td className="px-3 py-2"><input value={row.selisih} readOnly className={`${inputClass} !w-[120px] !min-w-0 cursor-not-allowed !bg-[#F1F5F9] text-[#64748B]`} /></td>
                <td className="px-3 py-2"><input value={row.keterangan} onChange={(event) => updateRow(row.id, "keterangan", event.target.value)} className={inputClass} /></td>
              </tr>)}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full max-w-[470px] rounded-xl border border-[#DCE5EF] bg-white p-4">
            <h3 className="mb-3 font-poppins text-sm font-bold text-[#1E293B]">Total</h3>
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3 font-poppins text-sm font-semibold text-[#475569]">
              {[['Saldo Neraca', totals.saldoNeraca], ['Saldo Hasil Stok Opname', totals.saldoStokOpname], ['Keluar', totals.keluar], ['Rusak', totals.rusak], ['Masuk', totals.masuk], ['Saldo Per Uji Mutasi (Audited)', totals.saldoAudit], ['Selisih Uji Mutasi', totals.selisih]].map(([label, value]) => (
                <div key={label} className="contents">
                  <span>{label}</span>
                  <span>:</span>
                  <span>{formatNumber(value)}</span>
                </div>
              ))}
            </div>
          </div>
          <SaveButton onClick={handleSave} className="self-end" />
        </div>
      </div>
    </div>
  );
}