"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DUMMY_KELAS_DATA = [
  {
    dosen: "Dosen A",
    kelas: [
      { no: 1, kode: "LA01", hari: "Senin", jam: "09.20 - 11.00", ruang: "503" },
    ],
  },
  {
    dosen: "Dosen B",
    kelas: [
      { no: 1, kode: "LC22", hari: "Senin", jam: "09.20 - 11.00", ruang: "301" },
      { no: 2, kode: "LB23", hari: "Rabu", jam: "13.20 - 15.00", ruang: "606" },
      { no: 3, kode: "A0253", hari: "Jumat", jam: "09.20 - 11.00", ruang: "503" },
    ],
  },
];

function TambahKelasModal({ isOpen, onClose, onSubmit }) {
  const [kodeKelas, setKodeKelas] = useState("");

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!kodeKelas.trim()) return;
    onSubmit(kodeKelas.trim());
    setKodeKelas("");
  }

  return (
    <div
      className="fixed inset-0 bg-black/55 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-[380px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900">Tambah Kelas</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="text-gray-500 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="kodeKelas"
            className="block text-sm font-semibold text-gray-600 mb-1.5"
          >
            Kode Kelas
          </label>
          <input
            id="kodeKelas"
            type="text"
            value={kodeKelas}
            onChange={(e) => setKodeKelas(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm mb-5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
            autoFocus
          />

          <div className="flex gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-md text-sm font-semibold text-white bg-red-400 hover:brightness-95"
            >
              Keluar
            </button>
            <button
              type="submit"
              className="px-4.5 py-2.5 rounded-md text-sm font-semibold text-white bg-green-600 hover:brightness-95"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function KelasGroup({ dosen, kelas }) {
  return (
    <section className="bg-white rounded-lg p-6">
      <h2 className="text-base font-extrabold mb-3 text-gray-900">{dosen.toUpperCase()}</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["NO", "KELAS", "HARI", "JAM", "RUANG", "AKSI"].map((h) => (
              <th
                key={h}
                className="text-left text-[11px] tracking-wide text-gray-400 font-medium px-2.5 py-2 border-b border-gray-100"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {kelas.map((item, index) => (
            <tr key={`${item.kode}-${index}`}>
              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800">
                {item.no}
              </td>
              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800">
                {item.kode}
              </td>
              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800">
                {item.hari}
              </td>
              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800">
                {item.jam}
              </td>
              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800">
                {item.ruang}
              </td>
              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800">
                <a
                  href={`/admin/kelas/${item.kode}`}
                  aria-label={`Edit kelas ${item.kode}`}
                  className="text-gray-500 hover:text-gray-700 inline-block"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [kelasData] = useState(DUMMY_KELAS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isEmpty = kelasData.length === 0;

  function handleTambahKelas(kodeKelas) {
    setIsModalOpen(false);
    router.push(`/admin/kelas/${kodeKelas}`);
  }

  return (
    <div className="flex min-h-screen bg-slate-100">

      <div className="flex-1 flex flex-col min-w-0">

        <main className="p-8">
          <h1 className="text-xl font-extrabold tracking-wide text-gray-800">
            DASHBOARD KELAS
          </h1>

          <div className="flex justify-end my-5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4.5 py-2.5 rounded-md text-sm font-semibold text-white bg-sky-500 hover:brightness-95"
            >
              + Tambah Kelas
            </button>
          </div>

          {isEmpty ? (
            <div className="bg-white rounded-lg min-h-[420px] flex items-center justify-center">
              <span className="text-6xl font-extrabold text-sky-100 tracking-wide">
                LOGO
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {kelasData.map((group) => (
                <KelasGroup
                  key={group.dosen}
                  dosen={group.dosen}
                  kelas={group.kelas}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <TambahKelasModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTambahKelas}
      />
    </div>
  );
}