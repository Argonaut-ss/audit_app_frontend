"use client";

import { useState } from "react";

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

function Sidebar() {
  return (
    <aside className="w-[250px] min-h-screen bg-white border-r border-gray-100 flex-shrink-0">
      <div className="h-[66px] flex items-center px-8">
        <span className="text-[29px] font-bold text-[#55B7FF]">Binus</span>
      </div>

      <nav className="px-5 mt-10">
        <p className="px-2 mb-5 font-poppins text-[10px] tracking-wider text-[#A7AFBE]">
          MENU
        </p>

        <div className="flex items-center gap-3 px-3 py-3 font-poppins text-xs font-semibold text-[#555E70]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="5" y="4" width="14" height="16" rx="1" />
            <path d="M9 8h6M9 12h6M9 16h4" />
          </svg>
          <span>Kelas</span>
        </div>

        <div className="mt-1 mb-2">
          <div className="flex items-center gap-3 rounded-md bg-[#DFF7FE] px-3 py-4 font-poppins text-xs font-semibold text-[#555E70]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="4" y="4" width="6" height="6" />
              <rect x="14" y="4" width="6" height="6" />
              <rect x="4" y="14" width="6" height="6" />
              <rect x="14" y="14" width="6" height="6" />
            </svg>
            <span>Tugas</span>
            <span className="text-[9px]">▼</span>
          </div>

          <div className="mt-3">
            <div className="px-14 py-2 font-poppins text-xs text-[#555E70]">Data Klien</div>
            <div className="rounded-md bg-[#EFFBFF] px-14 py-3 font-poppins text-xs font-semibold text-[#09A9F5]">
              Audit
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-4 font-poppins text-xs font-semibold text-[#555E70]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M6 5h12M6 9h12M6 13h12M6 17h8" />
          </svg>
          <span>Standar Audit</span>
        </div>
      </nav>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="h-[64px] bg-[#08A8E8] flex items-center justify-between px-8">
      <button className="text-white">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 7h14M5 12h14M5 17h14" />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <div className="w-[29px] h-[29px] rounded-full bg-white flex items-center justify-center">
          <span className="text-[10px] font-semibold text-[#08A8E8]">A</span>
        </div>
        <span className="font-poppins text-[11px] text-white font-medium">Adrian Ananta</span>
        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </header>
  );
}

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

function ActionIcons({ warning, onHistoryClick }) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button type="button" title="Riwayat" onClick={onHistoryClick} className="text-[#8B97A8] hover:text-[#08A8E8] transition">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      </button>

      <button type="button" title="Lampiran" className="text-[#8B97A8] hover:text-[#08A8E8] transition">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
          <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 7 20l1.1-1.1" />
        </svg>
      </button>

      {warning && (
        <button type="button" title="Peringatan" className="text-[#FF4242]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v7h-2V7Zm0 9h2v2h-2v-2Z" />
          </svg>
        </button>
      )}

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

  return (
    <div className="min-h-screen bg-[#F6F7FC] flex text-gray-700">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Topbar />

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
          <div className="mx-auto mb-4 flex w-full max-w-[1100px] flex-col gap-3 md:flex-row md:justify-end">
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

            <button className="h-[36px] rounded-[5px] bg-[#42A5F5] px-5 font-poppins text-[12px] font-semibold text-white transition hover:bg-[#2196F3] flex items-center justify-center gap-2">
              <span className="text-[15px] leading-none">+</span>
              Tambah Data Audit
            </button>
          </div>

          {/* Table Card - mx-auto biar ketengahan */}
          <section className="mx-auto w-full max-w-[1100px] rounded-lg bg-white overflow-hidden shadow-[0_4px_18px_rgba(41,49,68,0.04)]">
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
                    <th className="px-3 py-4 text-right font-poppins text-[10px] font-semibold text-[#6B7589]">Aksi</th>
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
                        <ActionIcons warning={item.warning} onHistoryClick={() => setIsHistoryOpen(true)} />
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
    </div>
  );
}