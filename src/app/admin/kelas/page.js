"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

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
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-[380px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900">
            Tambah Kelas
          </h2>

          <button
            type="button"
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

const COL_WIDTHS = ["6%", "18%", "16%", "22%", "28%", "10%"];

function KelasGroup({ dosenNama, kelasList }) {
  return (
    <section className="bg-white rounded-lg p-6">
      <h2 className="text-base font-extrabold mb-3 text-gray-900">
        {dosenNama.toUpperCase()}
      </h2>

      <table className="w-full border-collapse table-fixed">
        <colgroup>
          {COL_WIDTHS.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {["NO", "KELAS", "HARI", "JAM", "RUANG", "AKSI"].map((h) => (
              <th
                key={h}
                className="text-left font-poppins text-xs font-semibold text-[#6B7589] px-2.5 py-2 border-b border-gray-100"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {kelasList.map((item, index) => (
            <tr key={item.id}>
              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800 truncate">
                {index + 1}
              </td>

              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800 truncate">
                {item.kode_kelas}
                {item.tipe_kelas ? ` - ${item.tipe_kelas}` : ""}
              </td>

              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800 truncate">
                {item.hari || "-"}
              </td>

              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800 truncate">
                {item.jam || "-"}
              </td>

              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800 truncate">
                {item.ruangan || "-"}
              </td>

              <td className="text-sm px-2.5 py-3 border-b border-gray-50 text-gray-800">
                <a
                  href={`/admin/kelas/${encodeURIComponent(
                    item.kode_kelas
                  )}?id=${item.id}`}
                  aria-label={`Edit kelas ${item.kode_kelas}`}
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

  const [kelasList, setKelasList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadKelas = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await api.get("/api/kelas", {
        params: {
          per_page: 100,
        },
      });

      setKelasList(res.data.data || []);
    } catch (err) {
      console.error(err);

      setErrorMsg("Gagal mengambil data kelas dari server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadKelas();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadKelas]);

  function handleTambahKelas(kodeKelas) {
    setIsModalOpen(false);

    router.push(`/admin/kelas/${encodeURIComponent(kodeKelas)}`);
  }

  const grouped = kelasList.reduce((acc, item) => {
    const nama = item.dosen?.name || "Belum Ada Dosen";

    if (!acc[nama]) {
      acc[nama] = [];
    }

    acc[nama].push(item);

    return acc;
  }, {});

  const isEmpty = kelasList.length === 0;

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <main className="flex h-full min-h-0 flex-col px-10 py-10">
          <h1 className="font-poppins text-[28px] font-semibold text-[#293144]">
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

          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-sm rounded-md px-4 py-3 mb-4">
              {errorMsg}
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="bg-white rounded-lg min-h-[420px] flex items-center justify-center">
                <span className="text-sm text-gray-400">Memuat data...</span>
              </div>
            ) : isEmpty ? (
              <div className="bg-white rounded-lg min-h-[420px] flex items-center justify-center">
                <span className="text-6xl font-extrabold text-sky-100 tracking-wide">
                  LOGO
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-5 pb-10 pt-1">
                {Object.entries(grouped).map(([nama, list]) => (
                  <KelasGroup key={nama} dosenNama={nama} kelasList={list} />
                ))}
                <div className="h-16 shrink-0" aria-hidden="true" />
              </div>
            )}
          </div>
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
