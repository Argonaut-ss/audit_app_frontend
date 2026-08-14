"use client";

import { useState, useEffect } from "react";

const AUDIT_DATA = [
  {
    id: 1,
    tipe: "Tugas",
    nama: "Adrian Ananta",
    klien: "PT Harmoni Sejahtera E",
    periode: "31 Dec 2022",
    waktuMulai: "03 Feb 2026",
    batas: "31 Aug 2026",
    warning: false,
  },
  {
    id: 2,
    tipe: "UAS",
    nama: "Adrian Ananta",
    klien: "PT Cakra Mangggilingan",
    periode: "31 Dec 2022",
    waktuMulai: "02 Feb 2026",
    batas: "31 Jul 2026",
    warning: true,
  },
];

const HISTORY_LOGS = [
  { id: 1, title: "Audit Perikatan", name: "Kevin Theryo", role: "Mahasiswa", date: "13 Aug 2026", time: "13:03:09", action: "view" },
  { id: 2, title: "Audit Perikatan", name: "Agustinus Winoto", role: "Dosen", date: "07 Aug 2026", time: "23:19:05", action: "view" },
  { id: 3, title: "Audit Perikatan", name: "Agustinus Winoto", role: "Dosen", date: "07 Aug 2026", time: "23:19:05", action: "view" },
  { id: 4, title: "Audit Perikatan", name: "Kevin Theryo", role: "Mahasiswa", date: "06 Aug 2026", time: "09:25:47", action: "view" },
  { id: 5, title: "Audit Perikatan", name: "Kevin Theryo", role: "Mahasiswa", date: "05 Aug 2026", time: "14:17:17", action: "view" },
  { id: 6, title: "Audit Perikatan", name: "Kevin Theryo", role: "Mahasiswa", date: "04 Aug 2026", time: "21:52:29", action: "view" },
  { id: 7, title: "Audit Laporan Keuangan", name: "Kevin Theryo", role: "Mahasiswa", date: "04 Aug 2026", time: "20:14:43", action: "Simpan" },
  { id: 8, title: "Audit Pengujian Jurnal Koreksi", name: "Kevin Theryo", role: "Mahasiswa", date: "04 Aug 2026", time: "20:12:20", action: "Simpan" },
  { id: 9, title: "Audit Pengujian Jurnal Koreksi", name: "Kevin Theryo", role: "Mahasiswa", date: "04 Aug 2026", time: "20:11:48", action: "Simpan" },
  { id: 10, title: "Audit Pengujian Uji Penyusutan", name: "Kevin Theryo", role: "Mahasiswa", date: "04 Aug 2026", time: "20:10:12", action: "Simpan" },
];

function HistoryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
      <div className="max-h-[85vh] w-full max-w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 pt-7 pb-4">
          <h2 className="font-poppins text-[22px] font-bold text-[#1F2937]">History Log Pengujian</h2>
          <button type="button" onClick={onClose} aria-label="Tutup history log" className="text-gray-400 transition hover:text-gray-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-2">
          <div className="space-y-3">
            {HISTORY_LOGS.map((log) => (
              <div key={log.id} className="flex items-stretch overflow-hidden rounded-lg border border-gray-100 bg-white">
                <div className="w-[5px] bg-[#3B82F6]" />
                <div className="flex flex-1 items-center gap-4 px-4 py-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#3B82F6] font-poppins text-xs font-bold text-white">
                    {log.id}
                  </span>
                  <span className="flex-1 font-poppins text-sm font-semibold text-[#1F2937]">{log.title}</span>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {log.role === "Dosen" && (
                      <span className="rounded-md bg-[#EEF2FF] px-2 py-1 font-poppins text-[10px] font-bold text-[#4F46E5]">DOSEN</span>
                    )}
                    <span className="rounded-md bg-[#E9FBEF] px-2 py-1 font-poppins text-[10px] font-bold text-[#12B76A]">
                      {log.action === "Simpan" ? "STORE" : "VIEW"}
                    </span>
                    <span className="whitespace-nowrap font-poppins text-xs text-[#9CA3AF]">
                      {log.date} {log.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 px-8 py-5">
          <button type="button" onClick={onClose} className="h-[42px] rounded-xl bg-[#FF4242] px-8 font-poppins text-sm font-bold text-white shadow-sm transition hover:brightness-95">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

const KLIEN_OPTIONS = [
  "PT Harmoni Sejahtera E",
  "PT Cakra Mangggilingan",
];

const JENIS_PERUSAHAAN_OPTIONS = ["Manufaktur", "Dagang", "Jasa"];

function AuditFormModal({ isOpen, onClose, onSubmit, mode = "tambah", initialData = null }) {
  const [klien, setKlien] = useState("");
  const [jenisPerusahaan, setJenisPerusahaan] = useState("");
  const [periodeAudit, setPeriodeAudit] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [batasWaktu, setBatasWaktu] = useState("");

  // Setiap modal dibuka, isi form sesuai initialData (mode edit)
  // atau kosong lagi (mode tambah)
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setKlien(initialData.klien || "");
      setJenisPerusahaan(initialData.jenisPerusahaan || "");
      setPeriodeAudit(initialData.periodeAudit || "");
      setWaktuMulai(initialData.waktuMulai || "");
      setBatasWaktu(initialData.batasWaktu || "");
    } else {
      setKlien("");
      setJenisPerusahaan("");
      setPeriodeAudit("");
      setWaktuMulai("");
      setBatasWaktu("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  function resetForm() {
    setKlien("");
    setJenisPerusahaan("");
    setPeriodeAudit("");
    setWaktuMulai("");
    setBatasWaktu("");
  }

  function handleKeluar() {
    resetForm();
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      klien,
      jenisPerusahaan,
      periodeAudit,
      waktuMulai,
      batasWaktu,
    });

    resetForm();
  }

  const title = mode === "edit" ? "Update Data Audit" : "Tambah Data Audit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleKeluar();
      }}
    >
      <div className="w-full max-w-[480px] rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-7 pt-6 pb-5">
          <h2 className="font-poppins text-lg font-bold text-[#1F2937]">
            {title}
          </h2>

          <button
            type="button"
            onClick={handleKeluar}
            aria-label="Tutup"
            className="text-gray-400 transition hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 pb-7">
          {/* Klien */}
          <label className="mb-1.5 block font-poppins text-xs font-semibold text-[#374151]">
            Klien
          </label>
          <div className="mb-4 flex items-center gap-2.5 rounded-md border border-[#D9DEE8] px-3 py-2.5">
            <svg
              className="h-4 w-4 flex-shrink-0 text-[#9CA3AF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <select
              value={klien}
              onChange={(e) => setKlien(e.target.value)}
              required
              className="w-full bg-transparent font-poppins text-sm text-[#374151] outline-none"
            >
              <option value="" disabled>
                Pilih klien
              </option>
              {KLIEN_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Jenis Perusahaan */}
          <label className="mb-1.5 block font-poppins text-xs font-semibold text-[#374151]">
            Jenis Perusahaan
          </label>
          <div className="mb-4 flex items-center gap-2.5 rounded-md border border-[#D9DEE8] px-3 py-2.5">
            <svg
              className="h-4 w-4 flex-shrink-0 text-[#9CA3AF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 3v18h18" />
              <path d="M7 15v3" />
              <path d="M12 11v7" />
              <path d="M17 7v11" />
            </svg>
            <select
              value={jenisPerusahaan}
              onChange={(e) => setJenisPerusahaan(e.target.value)}
              required
              className="w-full bg-transparent font-poppins text-sm text-[#374151] outline-none"
            >
              <option value="" disabled>
                Pilih jenis perusahaan
              </option>
              {JENIS_PERUSAHAAN_OPTIONS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          {/* Periode Audit */}
          <label className="mb-1.5 block font-poppins text-xs font-semibold text-[#374151]">
            Periode Audit
          </label>
          <div className="mb-4 flex items-center gap-2.5 rounded-md border border-[#D9DEE8] px-3 py-2.5">
            <svg
              className="h-4 w-4 flex-shrink-0 text-[#9CA3AF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <input
              type="date"
              value={periodeAudit}
              onChange={(e) => setPeriodeAudit(e.target.value)}
              required
              className="w-full bg-transparent font-poppins text-sm text-[#374151] outline-none"
            />
          </div>

          {/* Waktu Mulai Pekerjaan */}
          <label className="mb-1.5 block font-poppins text-xs font-semibold text-[#374151]">
            Waktu Mulai Pekerjaan
          </label>
          <div className="mb-4 flex items-center gap-2.5 rounded-md border border-[#D9DEE8] px-3 py-2.5">
            <svg
              className="h-4 w-4 flex-shrink-0 text-[#9CA3AF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <input
              type="date"
              value={waktuMulai}
              onChange={(e) => setWaktuMulai(e.target.value)}
              required
              className="w-full bg-transparent font-poppins text-sm text-[#374151] outline-none"
            />
          </div>

          {/* Batas Waktu Pengumpulan */}
          <label className="mb-1.5 block font-poppins text-xs font-semibold text-[#374151]">
            Batas Waktu Pengumpulan
          </label>
          <div className="mb-6 flex items-center gap-2.5 rounded-md border border-[#D9DEE8] px-3 py-2.5">
            <svg
              className="h-4 w-4 flex-shrink-0 text-[#9CA3AF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <input
              type="date"
              value={batasWaktu}
              onChange={(e) => setBatasWaktu(e.target.value)}
              required
              className="w-full bg-transparent font-poppins text-sm text-[#374151] outline-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleKeluar}
              className="rounded-md bg-[#FF4242] px-6 py-2 font-poppins text-sm font-semibold text-white transition hover:brightness-95"
            >
              Keluar
            </button>

            <button
              type="submit"
              className="rounded-md bg-[#3B82F6] px-6 py-2 font-poppins text-sm font-semibold text-white transition hover:brightness-95"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionIcons({ warning, onHistoryClick, onEditClick }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button type="button" title="Riwayat" onClick={onHistoryClick} className="text-[#8B97A8] hover:text-[#08A8E8] transition">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      </button>

      <button type="button" title="Edit" onClick={onEditClick} className="text-[#8B97A8] hover:text-[#08A8E8] transition">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>

      <button type="button" className="h-[28px] rounded-full bg-[#22C51F] px-3.5 font-poppins text-[10px] font-semibold text-white hover:bg-[#1fb31c]">
        Kerjakan
      </button>
    </div>
  );
}

export default function AuditPage() {
  const [filterTugas, setFilterTugas] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = mode tambah

  function openTambahModal() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  function openEditModal(item) {
    // Mapping dari struktur AUDIT_DATA ke struktur field form
    setEditingItem({
      klien: item.klien,
      jenisPerusahaan: "", // belum ada di AUDIT_DATA, nanti diisi kalau datanya tersedia
      periodeAudit: "",
      waktuMulai: "",
      batasWaktu: "",
    });
    setIsFormOpen(true);
  }

  function handleSubmitForm(data) {
    // Sementara cuma di-log dulu, belum konek ke backend.
    // Nanti kalau API-nya udah siap:
    // - mode tambah -> POST ke server
    // - mode edit   -> PUT ke server pakai id item yang diedit
    console.log(editingItem ? "Update data audit:" : "Data audit baru:", data);
    setIsFormOpen(false);
    setEditingItem(null);
  }

  return (
    <div className="min-h-screen bg-[#F6F7FC] flex text-gray-700">
      <div className="flex-1 min-w-0">
        <main className="px-10 py-9">
          <div className="mb-8">
            <div className="flex items-center gap-1.5">
              <h1 className="font-poppins text-[22px] font-semibold tracking-wide text-[#293144]">DATA AUDIT</h1>
              <span className="w-3.5 h-3.5 rounded-full border border-[#08A8E8] text-[#08A8E8] flex items-center justify-center text-[9px] font-bold">?</span>
            </div>

            <div className="flex items-center gap-2 mt-3 font-poppins text-[10px] text-[#9CA3AF]">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m3 12 9-8 9 8" />
                <path d="M5 10v10h14V10" />
              </svg>
              <span>/</span>
              <span>Tugas</span>
              <span>/</span>
              <span className="text-[#08A8E8]">Audit</span>
            </div>
          </div>

          {/* Toolbar - mx-auto biar ketengahan, bukan ml-auto */}
          <div className="mx-auto mb-4 flex w-full max-w-[1300px] flex-col gap-3 md:flex-row md:justify-end">
            <select
              value={filterTugas}
              onChange={(e) => setFilterTugas(e.target.value)}
              className="h-[36px] w-full rounded-[5px] border border-[#D9DEE8] bg-white px-4 font-poppins text-[11px] text-[#9CA3AF] outline-none focus:border-[#FFC400] md:w-[150px]"
            >
              <option value="">Pilih kelas tugas...</option>
              <option value="tugas">Tugas</option>
            </select>

            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="h-[36px] w-full rounded-[5px] border border-[#D9DEE8] bg-white px-4 font-poppins text-[11px] text-[#9CA3AF] outline-none focus:border-[#08A8E8] md:w-[140px]"
            >
              <option value="">Pilih kelas ujian...</option>
              <option value="kelas1">Kelas 1</option>
            </select>

            <button
              onClick={openTambahModal}
              className="h-[36px] rounded-[5px] bg-[#42A5F5] px-5 font-poppins text-[12px] font-semibold text-white transition hover:bg-[#2196F3] flex items-center justify-center gap-2"
            >
              <span className="text-[15px] leading-none">+</span>
              Tambah Data Audit
            </button>
          </div>

          {/* Table Card - mx-auto biar ketengahan */}
          <section className="mx-auto w-full max-w-[1300px] rounded-lg bg-white overflow-hidden shadow-[0_4px_18px_rgba(41,49,68,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead className="bg-white">
                  <tr className="border-b border-[#D9DEE8]">
                    <th className="px-8 py-4 text-left font-poppins text-[10px] font-semibold text-[#6B7589]">No</th>
                    <th className="px-3 py-4 text-left font-poppins text-[10px] font-semibold text-[#6B7589]">Tipe</th>
                    <th className="px-3 py-4 text-left font-poppins text-[10px] font-semibold text-[#6B7589]">Nama</th>
                    <th className="px-3 py-4 text-left font-poppins text-[10px] font-semibold text-[#6B7589]">Klien</th>
                    <th className="px-3 py-4 text-left font-poppins text-[10px] font-semibold text-[#6B7589]">Waktu Periode</th>
                    <th className="px-3 py-4 text-left font-poppins text-[10px] font-semibold text-[#6B7589]">
                      <span className="block">Waktu Mulai</span>
                      <span className="block">Pekerjaan</span>
                    </th>
                    <th className="px-3 py-4 text-left font-poppins text-[10px] font-semibold text-[#6B7589]">
                      <span className="block">Batas Waktu</span>
                      <span className="block">Pengumpulan</span>
                    </th>
                    <th className="px-3 py-4 text-center font-poppins text-[10px] font-semibold text-[#6B7589]">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {AUDIT_DATA.map((item) => (
                    <tr key={item.id} className="border-b border-[#E5E7EB] last:border-b-0">
                      <td className="px-8 py-5 font-poppins text-[11px] text-[#555E70]">{item.id}</td>
                      <td className="px-3 py-5 font-poppins text-[11px] text-[#555E70]">{item.tipe}</td>
                      <td className="px-3 py-5 font-poppins text-[11px] text-[#555E70]">{item.nama}</td>
                      <td className="px-3 py-5 font-poppins text-[11px] text-[#555E70] whitespace-nowrap">{item.klien}</td>
                      <td className="px-3 py-5 font-poppins text-[11px] text-[#555E70] whitespace-nowrap">{item.periode}</td>
                      <td className="px-3 py-5 font-poppins text-[11px] text-[#555E70] whitespace-nowrap">{item.waktuMulai}</td>
                      <td className="px-3 py-5 font-poppins text-[11px] text-[#555E70] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {item.batas}
                          {item.warning && (
                            <svg className="w-3.5 h-3.5 text-[#FF4242]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v7h-2V7Zm0 9h2v2h-2v-2Z" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <ActionIcons
                          warning={item.warning}
                          onHistoryClick={() => setIsHistoryOpen(true)}
                          onEditClick={() => openEditModal(item)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex max-w-full flex-col gap-3 px-8 py-4 md:flex-row md:items-center md:justify-between">
              <span className="font-poppins text-[11px] text-[#9CA3AF]">Showing 2 to 10 of 1 entries</span>

              <div className="flex items-center gap-2">
                <button className="w-[28px] h-[28px] border border-gray-200 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button className="w-[28px] h-[28px] rounded-md border border-[#6B7CFF] bg-[#EEF0FF] font-poppins text-sm text-[#465DFF]">1</button>
                <button className="w-[28px] h-[28px] border border-gray-200 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      <AuditFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmitForm}
        mode={editingItem ? "edit" : "tambah"}
        initialData={editingItem}
      />
    </div>
  );
}