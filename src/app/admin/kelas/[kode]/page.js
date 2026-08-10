"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

const DUMMY_DOSEN_OPTIONS = ["Dosen A", "Dosen B", "Dosen C"];
const HARI_OPTIONS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const JAM_OPTIONS = ["09.20 - 11.00", "13.20 - 15.00", "15.20 - 17.00"];
const TIPE_KELAS_OPTIONS = ["Reguler", "Praktikum"];

const DUMMY_MAHASISWA = [
  { id: 1, nama: "Adrian Ananta", nim: "2702216021", email: "adrian.ananta@binus.ac.id", dosen: "Dosen A" },
  { id: 2, nama: "Bunga Citra", nim: "2702216022", email: "bunga.citra@binus.ac.id", dosen: "Dosen A" },
  { id: 3, nama: "Cahyo Wibowo", nim: "2702216023", email: "cahyo.wibowo@binus.ac.id", dosen: "Dosen B" },
  { id: 4, nama: "Dewi Lestari", nim: "2702216024", email: "dewi.lestari@binus.ac.id", dosen: "Dosen B" },
  { id: 5, nama: "Eko Prasetyo", nim: "2702216025", email: "eko.prasetyo@binus.ac.id", dosen: "Dosen A" },
  { id: 6, nama: "Fitri Handayani", nim: "2702216026", email: "fitri.handayani@binus.ac.id", dosen: "Dosen C" },
  { id: 7, nama: "Guntur Saputra", nim: "2702216027", email: "guntur.saputra@binus.ac.id", dosen: "Dosen B" },
];

function TambahMahasiswaModal({ isOpen, onClose, onSave, alreadySelectedIds }) {
  const [search, setSearch] = useState("");
  const [dosenFilter, setDosenFilter] = useState("");
  const [checkedIds, setCheckedIds] = useState(new Set());

  if (!isOpen) return null;

  const filtered = DUMMY_MAHASISWA.filter((m) => {
    const matchSearch = m.nama.toLowerCase().includes(search.toLowerCase());
    const matchDosen = dosenFilter ? m.dosen === dosenFilter : true;
    return matchSearch && matchDosen;
  });

  function toggleCheck(id) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSave() {
    const selected = DUMMY_MAHASISWA.filter((m) => checkedIds.has(m.id));
    onSave(selected);
    setCheckedIds(new Set());
    setSearch("");
    setDosenFilter("");
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[700px] max-h-[80vh] flex flex-col p-5">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1.5">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari Mahasiswa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-700">Dosen</span>
          <span className="text-sm text-gray-400">:</span>
          <select
            value={dosenFilter}
            onChange={(e) => setDosenFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900"
          >
            <option value="">Semua</option>
            {DUMMY_DOSEN_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md">
          {filtered.map((m, index) => (
            <div
              key={m.id}
              className="flex items-center gap-4 px-4 py-2.5 border-b border-gray-100 last:border-b-0"
            >
              <span className="text-sm text-gray-500 w-5">{index + 1}</span>
              <span className="w-7 h-7 rounded-full bg-sky-200 text-sky-700 font-bold text-xs flex items-center justify-center">
                {m.nama.charAt(0)}
              </span>
              <span className="flex-1 text-sm text-gray-900">{m.nama}</span>
              <span className="text-sm text-gray-900 w-28">{m.nim}</span>
              <span className="text-sm text-gray-900 flex-1">{m.email}</span>
              <input
                type="checkbox"
                checked={checkedIds.has(m.id) || alreadySelectedIds.has(m.id)}
                disabled={alreadySelectedIds.has(m.id)}
                onChange={() => toggleCheck(m.id)}
                className="w-4 h-4"
              />
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Mahasiswa tidak ditemukan
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-orange-500 hover:brightness-95"
          >
            Back To Dashboard
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-green-600 hover:brightness-95"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailKelasPage() {
  const params = useParams();
  const router = useRouter();
  const kode = params.kode;

  const [dosen, setDosen] = useState("");
  const [hari, setHari] = useState("");
  const [jam, setJam] = useState("");
  const [ruangan, setRuangan] = useState("");
  const [periode, setPeriode] = useState("2025 / 2026");
  const [tipeKelas, setTipeKelas] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");

  const selectedIds = new Set(mahasiswaList.map((m) => m.id));

  function handleSaveMahasiswa(selected) {
    setMahasiswaList((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newOnes = selected.filter((m) => !existingIds.has(m.id));
      return [...prev, ...newOnes];
    });
    setIsModalOpen(false);
  }

  function handleRemoveMahasiswa(id) {
    setMahasiswaList((prev) => prev.filter((m) => m.id !== id));
  }

  function handleSimpan() {
    const payload = {
      kode,
      dosen,
      hari,
      jam,
      ruangan,
      periode,
      tipeKelas,
      mahasiswa: mahasiswaList,
    };

    // Sementara disimpan ke console dulu (belum konek ke backend beneran,
    // soalnya dropdown Dosen masih dummy, belum ambil data dosen asli).
    // Nanti kalau backend Dosen udah ready, ganti bagian ini jadi:
    //   await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kelas`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   });
    console.log("Data kelas disimpan:", payload);

    setSaveMessage("Tersimpan!");
    setTimeout(() => {
      router.push("/admin/kelas");
    }, 800);
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-5">
          <div className="bg-white rounded-lg p-6">
            <div className="flex justify-end mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900">Periode :</span>
                <input
                  type="text"
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  className="border border-gray-300 rounded-md px-2.5 py-1 text-sm text-gray-900 w-28"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">Kode Kelas</span>
                <span className="text-sm text-gray-400">:</span>
                <span className="text-sm text-gray-900">{kode}</span>
              </div>
              <div />

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">Dosen</span>
                <span className="text-sm text-gray-400">:</span>
                <select
                  value={dosen}
                  onChange={(e) => setDosen(e.target.value)}
                  className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 flex-1"
                >
                  <option value="">Pilih Dosen</option>
                  {DUMMY_DOSEN_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div />

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">Hari</span>
                <span className="text-sm text-gray-400">:</span>
                <select
                  value={hari}
                  onChange={(e) => setHari(e.target.value)}
                  className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 flex-1"
                >
                  <option value="">Pilih Hari</option>
                  {HARI_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
              <div />

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">Jam</span>
                <span className="text-sm text-gray-400">:</span>
                <select
                  value={jam}
                  onChange={(e) => setJam(e.target.value)}
                  className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 flex-1"
                >
                  <option value="">Pilih Jam</option>
                  {JAM_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
              <div />

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">Ruangan</span>
                <span className="text-sm text-gray-400">:</span>
                <input
                  type="text"
                  placeholder="Contoh: 503"
                  value={ruangan}
                  onChange={(e) => setRuangan(e.target.value)}
                  className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">Tipe Kelas</span>
                <span className="text-sm text-gray-400">:</span>
                <select
                  value={tipeKelas}
                  onChange={(e) => setTipeKelas(e.target.value)}
                  className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 flex-1"
                >
                  <option value="">Pilih Tipe</option>
                  {TIPE_KELAS_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-sky-500 hover:brightness-95 mb-3"
            >
              + Tambah Mahasiswa
            </button>

            <div className="border border-gray-200 rounded-md min-h-[140px] max-h-[220px] overflow-y-auto">
              {mahasiswaList.map((m, index) => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 px-4 py-2.5 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-sm text-gray-500 w-5">{index + 1}</span>
                  <span className="w-7 h-7 rounded-full bg-sky-200 text-sky-700 font-bold text-xs flex items-center justify-center">
                    {m.nama.charAt(0)}
                  </span>
                  <span className="flex-1 text-sm text-gray-900">{m.nama}</span>
                  <span className="text-sm text-gray-900 w-28">{m.nim}</span>
                  <span className="text-sm text-gray-900 flex-1">{m.email}</span>
                  <button
                    onClick={() => handleRemoveMahasiswa(m.id)}
                    aria-label={`Hapus ${m.nama}`}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => router.push("/admin/kelas")}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-orange-500 hover:brightness-95"
              >
                Back To Dashboard
              </button>

              <div className="flex items-center gap-3">
                {saveMessage && (
                  <span className="text-sm font-semibold text-green-600">{saveMessage}</span>
                )}
                <button className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                  Edit
                </button>
                <button
                  onClick={handleSimpan}
                  className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-green-600 hover:brightness-95"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <TambahMahasiswaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMahasiswa}
        alreadySelectedIds={selectedIds}
      />
    </div>
  );
}