"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  getTopSchedule,
  saveTopSchedule,
} from "@/services/mahasiswa/tugas/audit/top_schedule/top_schedule";
import AlertSuccess from "@/components/alert/alert_success";
import AlertError from "@/components/alert/alert_error";

const TOP_OPTIONS = [
  { key: "A", label: "Kas dan Setara Kas" },
  { key: "B", label: "Piutang" },
  { key: "C", label: "Persediaan" },
  { key: "D", label: "Aset Lain-Lain" },
  { key: "E", label: "Aset Tetap" },
  { key: "F", label: "Utang Usaha" },
  { key: "G", label: "Utang Bank" },
  { key: "H", label: "Utang Pajak" },
  { key: "I", label: "Ekuitas" },
  { key: "J", label: "Penjualan" },
  { key: "K", label: "Beban Pokok Penjualan" },
  { key: "L", label: "Beban Usaha" },
  { key: "M", label: "Pendapatan (Beban) Lain-lain" },
  { key: "N", label: "Beban Pajak Penghasilan" },
];

const formatNumber = (val) => {
  const num = Number(val || 0);
  return num.toLocaleString("id-ID");
};

const formatCurrency = (val) => {
  const num = Number(val || 0);
  if (num < 0) {
    return `Rp -${Math.abs(num).toLocaleString("id-ID")}`;
  }
  return `Rp ${num.toLocaleString("id-ID")}`;
};

export default function TopSchedulePage() {
  const params = useParams();
  const jwbKasusId = params.id;

  const [currentTop, setCurrentTop] = useState("A");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Raw API response
  const [serverData, setServerData] = useState(null);

  // Local editable state for tables & rows
  const [subTables, setSubTables] = useState([]);
  const [availableAccounts, setAvailableAccounts] = useState([]);

  // Tanggal header
  const [tanggalPerBook, setTanggalPerBook] = useState("2022-12-31");
  const [tanggalAuditBerjalan, setTanggalAuditBerjalan] = useState("2022-12-31");
  const [tanggalAuditSebelum, setTanggalAuditSebelum] = useState("");

  // Modal Popover untuk dropdown Akun (Gambar 1)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Modal detail Asal Nilai AJE/RJE (Gambar 2 & 3)
  const [activeModalRow, setActiveModalRow] = useState(null);

  // Alert notifikasi
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load data dari backend
  const fetchData = async (topKey) => {
    if (!jwbKasusId) return;
    setLoading(true);
    try {
      const data = await getTopSchedule(jwbKasusId, topKey);
      setServerData(data);
      if (data) {
        setTanggalPerBook(data.TanggalPerBook || "2022-12-31");
        setTanggalAuditBerjalan(data.TanggalAuditBerjalan || "2022-12-31");
        setTanggalAuditSebelum(data.TanggalAuditSebelum || "");
        setSubTables(data.tables || []);
        setAvailableAccounts(data.available_accounts || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data Top Schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentTop);
  }, [jwbKasusId, currentTop]);

  // Close popover when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption = useMemo(
    () => TOP_OPTIONS.find((o) => o.key === currentTop) || TOP_OPTIONS[0],
    [currentTop]
  );

  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return TOP_OPTIONS;
    return TOP_OPTIONS.filter(
      (opt) =>
        opt.key.toLowerCase().includes(q) ||
        opt.label.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handlePrev = () => {
    const idx = TOP_OPTIONS.findIndex((o) => o.key === currentTop);
    if (idx > 0) setCurrentTop(TOP_OPTIONS[idx - 1].key);
  };

  const handleNext = () => {
    const idx = TOP_OPTIONS.findIndex((o) => o.key === currentTop);
    if (idx < TOP_OPTIONS.length - 1) setCurrentTop(TOP_OPTIONS[idx + 1].key);
  };

  // Menambah baris baru pada sub-tabel
  const handleAddRow = (tableIndex, subMappingName) => {
    // Cari akun dari availableAccounts yang belum ada di tabel ini jika memungkinkan
    const existingIds = subTables[tableIndex]?.rows?.map((r) => r.COAID) || [];
    const candidate =
      availableAccounts.find(
        (acc) =>
          !existingIds.includes(acc.COAID) &&
          (acc.SubMappingTop === subMappingName || !acc.SubMappingTop)
      ) ||
      availableAccounts.find((acc) => !existingIds.includes(acc.COAID)) ||
      availableAccounts[0];

    if (!candidate) return;

    const newRow = {
      ...candidate,
      SubMapping: subMappingName,
    };

    setSubTables((prev) =>
      prev.map((t, idx) => {
        if (idx !== tableIndex) return t;
        const updatedRows = [...t.rows, newRow];
        return {
          ...t,
          rows: updatedRows,
          totals: calculateTableTotals(updatedRows),
        };
      })
    );
  };

  // Menghapus baris akun dari sub-tabel
  const handleDeleteRow = (tableIndex, rowIndex) => {
    setSubTables((prev) =>
      prev.map((t, idx) => {
        if (idx !== tableIndex) return t;
        const updatedRows = t.rows.filter((_, rIdx) => rIdx !== rowIndex);
        return {
          ...t,
          rows: updatedRows,
          totals: calculateTableTotals(updatedRows),
        };
      })
    );
  };

  // Mengubah pilihan akun pada dropdown baris
  const handleAccountChange = (tableIndex, rowIndex, newCoaId) => {
    const candidate = availableAccounts.find((a) => a.COAID === Number(newCoaId));
    if (!candidate) return;

    setSubTables((prev) =>
      prev.map((t, idx) => {
        if (idx !== tableIndex) return t;
        const updatedRows = t.rows.map((r, rIdx) => {
          if (rIdx !== rowIndex) return r;
          return {
            ...candidate,
            SubMapping: t.sub_mapping,
          };
        });
        return {
          ...t,
          rows: updatedRows,
          totals: calculateTableTotals(updatedRows),
        };
      })
    );
  };

  const calculateTableTotals = (rows) => {
    return {
      PerBook: rows.reduce((sum, r) => sum + (Number(r.PerBook) || 0), 0),
      AJE_RJE: rows.reduce((sum, r) => sum + (Number(r.AJE_RJE) || 0), 0),
      AuditedBerjalan: rows.reduce(
        (sum, r) => sum + (Number(r.AuditedBerjalan) || 0),
        0
      ),
      AuditSebelum: rows.reduce(
        (sum, r) => sum + (Number(r.AuditSebelum) || 0),
        0
      ),
    };
  };

  // Simpan data ke backend
  const handleSave = async () => {
    if (!jwbKasusId) return;
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      // Flatten all items across all sub-tables
      const itemsPayload = [];
      let order = 1;
      subTables.forEach((t) => {
        (t.rows || []).forEach((r) => {
          itemsPayload.push({
            COAID: r.COAID,
            SubMapping: t.sub_mapping,
            Urutan: order++,
          });
        });
      });

      const payload = {
        top: currentTop,
        TanggalPerBook: tanggalPerBook || null,
        TanggalAuditBerjalan: tanggalAuditBerjalan || null,
        TanggalAuditSebelum: tanggalAuditSebelum || null,
        items: itemsPayload,
      };

      await saveTopSchedule(jwbKasusId, payload);
      await fetchData(currentTop);
      setSuccessMessage("Perubahan Top Schedule berhasil disimpan.");
    } catch (err) {
      console.error("Gagal menyimpan Top Schedule:", err);
      setErrorMessage("Gagal menyimpan Top Schedule. Silakan coba kembali.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Biru Cerah (Buku Besar) */}
      <div className="w-full bg-[#0099FF] rounded-b-[24px] px-8 py-7 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <FileText size={26} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Buku Besar</h1>
            <p className="text-sm text-white/90 font-normal mt-0.5">
              Ringkasan akhir saldo tiap akun sebagai dasar pemeriksaan
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 mt-6 space-y-6">
        {/* Baris Navigasi AKUN (Gambar 1) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
              AKUN:
            </span>

            {/* Tombol Prev */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentTop === "A"}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            {/* Dropdown Selector Pill (Gambar 1) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-[#0099FF] rounded-xl text-sm font-bold text-gray-900 hover:bg-blue-50/40 transition-all shadow-sm min-w-[240px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#0099FF] text-white flex items-center justify-center text-xs font-bold">
                    {currentTop}
                  </span>
                  <span>{currentOption.label}</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {/* Popover Dropdown dengan Search Bar (Gambar 1) */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-xl border border-gray-200 z-50 p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                  {/* Search Bar Input */}
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ketik nama akun / huruf (cth: piutang, HPP, E)..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder:text-gray-400"
                      autoFocus
                    />
                  </div>

                  {/* List Akun TOP A - TOP N */}
                  <div className="max-h-[280px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredOptions.length === 0 ? (
                      <div className="text-xs text-gray-400 text-center py-4">
                        Tidak ada akun yang cocok
                      </div>
                    ) : (
                      filteredOptions.map((opt) => {
                        const isSelected = opt.key === currentTop;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              setCurrentTop(opt.key);
                              setIsDropdownOpen(false);
                              setSearchQuery("");
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-blue-50 text-[#0099FF]"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                isSelected
                                  ? "bg-[#0099FF] text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {opt.key}
                            </span>
                            <span className="truncate">{opt.label}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Next */}
            <button
              type="button"
              onClick={handleNext}
              disabled={currentTop === "N"}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Subtitle Breadcrumb Biru */}
          <div className="text-xs font-bold text-gray-500 pl-0.5">
            Buku Besar:{" "}
            <span className="text-[#0099FF]">
              TOP {currentTop} — {currentOption.label}
            </span>
          </div>
        </div>

        {/* Card Utama Berisi Tabel (Gambar Utama) */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/80 space-y-8">
          {loading ? (
            <div className="py-20 text-center text-gray-400 font-medium">
              Memuat data Buku Besar...
            </div>
          ) : subTables.length === 0 ? (
            <div className="py-20 text-center text-gray-400 font-medium">
              Tidak ada data akun pada mapping{" "}
              <strong>{currentOption.label}</strong>.
            </div>
          ) : (
            subTables.map((table, tIdx) => (
              <div key={tIdx} className="space-y-4">
                {/* Header Judul Sub-Tabel */}
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                  {table.sub_mapping}
                </h2>

                {/* Grid Header Tanggal & Kolom */}
                <div className="grid grid-cols-[260px_1fr_1fr_1fr_1fr_36px] items-center gap-4 text-xs font-bold text-gray-600 px-2">
                  <div className="text-gray-500 font-semibold">{table.sub_mapping}</div>

                  {/* Header Per Book */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-gray-700">Per Book</span>
                    <div className="relative w-full">
                      <Calendar
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={tanggalPerBook}
                        onChange={(e) => setTanggalPerBook(e.target.value)}
                        placeholder="31/12/2022"
                        className="w-full pl-8 pr-2 py-1.5 text-xs text-center border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Header AJE/RJE */}
                  <div className="flex flex-col items-center justify-end h-full pb-2">
                    <span className="text-gray-700">AJE/RJE</span>
                  </div>

                  {/* Header Audited Berjalan */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-gray-700">Audited Berjalan</span>
                    <div className="relative w-full">
                      <Calendar
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={tanggalAuditBerjalan}
                        onChange={(e) => setTanggalAuditBerjalan(e.target.value)}
                        placeholder="31/12/2022"
                        className="w-full pl-8 pr-2 py-1.5 text-xs text-center border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Header Audited Sebelum */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-gray-700">Audited Sebelum</span>
                    <div className="relative w-full">
                      <Calendar
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={tanggalAuditSebelum}
                        onChange={(e) => setTanggalAuditSebelum(e.target.value)}
                        placeholder="Tanggal"
                        className="w-full pl-8 pr-2 py-1.5 text-xs text-center border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Tombol Tambah Baris Hijau (+) */}
                  <div className="flex items-end justify-center h-full pb-1">
                    <button
                      type="button"
                      onClick={() => handleAddRow(tIdx, table.sub_mapping)}
                      title="Tambah Baris Akun"
                      className="text-emerald-500 hover:text-emerald-600 transition-colors p-1 rounded-lg hover:bg-emerald-50"
                    >
                      <Plus size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* List Baris Akun */}
                <div className="space-y-3">
                  {table.rows.map((row, rIdx) => (
                    <div
                      key={rIdx}
                      className="grid grid-cols-[260px_1fr_1fr_1fr_1fr_36px] items-center gap-4 px-2 py-1"
                    >
                      {/* Kolom 1: Radio/Dot Icon + Dropdown Akun */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full border-2 border-sky-400 flex items-center justify-center shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        </div>
                        <div className="relative w-full">
                          <select
                            value={row.COAID}
                            onChange={(e) =>
                              handleAccountChange(tIdx, rIdx, e.target.value)
                            }
                            className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-3 py-2 pr-7 text-xs font-semibold text-gray-800 focus:outline-none focus:border-blue-500 truncate cursor-pointer shadow-sm"
                          >
                            {availableAccounts.map((acc) => (
                              <option key={acc.COAID} value={acc.COAID}>
                                {acc.NamaAkun}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          />
                        </div>
                      </div>

                      {/* Kolom 2: Per Book */}
                      <div className="bg-gray-50/80 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 flex justify-between items-center border border-gray-100">
                        <span className="text-gray-400 font-normal">Rp</span>
                        <span className="font-semibold">{formatNumber(row.PerBook)}</span>
                      </div>

                      {/* Kolom 3: AJE / RJE dengan Icon (i) */}
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-50/80 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 flex justify-between items-center border border-gray-100 flex-1">
                          <span className="text-gray-400 font-normal">Rp</span>
                          <span
                            className={`font-semibold ${
                              row.AJE_RJE < 0 ? "text-gray-900" : ""
                            }`}
                          >
                            {row.AJE_RJE < 0 ? `-${formatNumber(Math.abs(row.AJE_RJE))}` : formatNumber(row.AJE_RJE)}
                          </span>
                        </div>
                        {/* Tombol Detail (i) */}
                        <button
                          type="button"
                          onClick={() => setActiveModalRow(row)}
                          title="Lihat Asal Nilai AJE/RJE"
                          className="w-6 h-6 rounded-full border-2 border-sky-400 text-sky-500 hover:bg-sky-50 flex items-center justify-center shrink-0 transition-all font-bold text-xs"
                        >
                          i
                        </button>
                      </div>

                      {/* Kolom 4: Audited Berjalan */}
                      <div className="bg-gray-50/80 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 flex justify-between items-center border border-gray-100">
                        <span className="text-gray-400 font-normal">Rp</span>
                        <span className="font-semibold">
                          {formatNumber(row.AuditedBerjalan)}
                        </span>
                      </div>

                      {/* Kolom 5: Audited Sebelum */}
                      <div className="bg-gray-50/80 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 flex justify-between items-center border border-gray-100">
                        <span className="text-gray-400 font-normal">Rp</span>
                        <span className="font-semibold">
                          {formatNumber(row.AuditSebelum)}
                        </span>
                      </div>

                      {/* Kolom 6: Tombol Tempat Sampah Merah (Hapus Baris) */}
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(tIdx, rIdx)}
                          title="Hapus Baris"
                          className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Baris Total */}
                <div className="grid grid-cols-[260px_1fr_1fr_1fr_1fr_36px] items-center gap-4 px-2 pt-2 border-t border-gray-200 text-xs font-bold text-gray-900">
                  <div className="pl-6">Total</div>

                  <div className="bg-gray-100/70 rounded-xl px-3.5 py-2 flex justify-between items-center">
                    <span className="text-gray-400 font-normal">Rp</span>
                    <span>{formatNumber(table.totals.PerBook)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100/70 rounded-xl px-3.5 py-2 flex justify-between items-center flex-1">
                      <span className="text-gray-400 font-normal">Rp</span>
                      <span>
                        {table.totals.AJE_RJE < 0
                          ? `-${formatNumber(Math.abs(table.totals.AJE_RJE))}`
                          : formatNumber(table.totals.AJE_RJE)}
                      </span>
                    </div>
                    <div className="w-6 shrink-0" />
                  </div>

                  <div className="bg-gray-100/70 rounded-xl px-3.5 py-2 flex justify-between items-center">
                    <span className="text-gray-400 font-normal">Rp</span>
                    <span>{formatNumber(table.totals.AuditedBerjalan)}</span>
                  </div>

                  <div className="bg-gray-100/70 rounded-xl px-3.5 py-2 flex justify-between items-center">
                    <span className="text-gray-400 font-normal">Rp</span>
                    <span>{formatNumber(table.totals.AuditSebelum)}</span>
                  </div>

                  <div className="w-9" />
                </div>
              </div>
            ))
          )}

          {/* Tombol Simpan Hijau (di pojok kanan bawah seperti gambar) */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2.5 bg-[#00A63E] hover:bg-[#008f35] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Asal Nilai AJE/RJE (Sesuai 100% dengan Gambar 2 & 3) */}
      {activeModalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-[620px] w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Biru Cerah Modal */}
            <div className="bg-[#0099FF] px-8 py-6 text-white">
              <h2 className="text-2xl font-bold tracking-tight">Asal Nilai AJE/RJE</h2>
              <p className="text-xs text-white/90 mt-1">
                Rincian jurnal koreksi pembentuk nilai AJE/RJE
              </p>
            </div>

            <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Bagian 1: RINGKASAN AKUN */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  RINGKASAN AKUN
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
                    <span className="text-[11px] text-gray-400 block mb-1">Akun</span>
                    <span className="text-base font-bold text-gray-900 block truncate">
                      {activeModalRow.NamaAkun}
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
                    <span className="text-[11px] text-gray-400 block mb-1">
                      Saldo Normal
                    </span>
                    <span className="text-base font-bold text-[#00A63E] lowercase block">
                      {activeModalRow.SaldoNormal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bagian 2: DAFTAR JURNAL */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  DAFTAR JURNAL
                </span>
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50/80 text-gray-500 text-[11px] uppercase font-bold border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-center w-12">NO</th>
                        <th className="px-4 py-3 text-center w-32">POSISI JURNAL</th>
                        <th className="px-4 py-3 text-left">SUMBER</th>
                        <th className="px-4 py-3 text-right">NILAI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {!activeModalRow.rincian_jurnal ||
                      activeModalRow.rincian_jurnal.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                            Belum ada jurnal koreksi dari pengujian substantif untuk akun ini.
                          </td>
                        </tr>
                      ) : (
                        activeModalRow.rincian_jurnal.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-4 py-3 text-center text-gray-500 font-medium">
                              {item.no}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block px-3.5 py-1 rounded-full text-[11px] font-semibold border ${
                                  item.posisi === "Debit"
                                    ? "bg-[#E8F8F0] text-[#00A63E] border-[#B7ECCF]"
                                    : "bg-[#FEECEB] text-[#E02424] border-[#F8B4B4]"
                                }`}
                              >
                                {item.posisi}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700 font-medium">
                              {item.sumber}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                              {formatCurrency(item.nilai)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {/* Total Baris di Modal */}
                    <tfoot className="bg-gray-50/50 border-t border-gray-200 font-bold text-xs">
                      <tr>
                        <td colSpan={3} className="px-4 py-3.5 text-gray-900 font-bold">
                          Total AJE/RJE
                        </td>
                        <td
                          className={`px-4 py-3.5 text-right font-bold ${
                            activeModalRow.AJE_RJE < 0
                              ? "text-[#E02424]"
                              : activeModalRow.AJE_RJE > 0
                              ? "text-[#00A63E]"
                              : "text-gray-900"
                          }`}
                        >
                          {formatCurrency(activeModalRow.AJE_RJE)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Bagian 3: Info Box Biru Muda Kaidah Akuntansi (Gambar 3) */}
              <div className="bg-[#EBF5FF] border border-[#BDDAFE] rounded-2xl p-4 flex gap-3 text-xs text-[#1E429F] leading-relaxed">
                <div className="w-5 h-5 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  i
                </div>
                <div>
                  Dari jurnal koreksi di atas, diperoleh Total Debit{" "}
                  <strong>{formatCurrency(activeModalRow.TotalDebit)}</strong> dan
                  Total Kredit{" "}
                  <strong>{formatCurrency(activeModalRow.TotalKredit)}</strong>. Karena
                  saldo normal akun ini{" "}
                  <strong className="uppercase">{activeModalRow.SaldoNormal}</strong>,
                  nilai AJE/RJE dihitung dari selisih{" "}
                  {activeModalRow.SaldoNormal === "debit"
                    ? "Debit dikurangi Kredit"
                    : "Kredit dikurangi Debit"}
                  : <strong>{formatCurrency(activeModalRow.AJE_RJE)}</strong>.
                </div>
              </div>

              {/* Tombol Keluar Merah (Gambar 3) */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalRow(null)}
                  className="px-7 py-2.5 bg-[#E02424] hover:bg-[#C81E1E] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Alert Notifikasi */}
      {successMessage && (
        <AlertSuccess
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <AlertError
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </div>
  );
}
