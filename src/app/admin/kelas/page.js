"use client";

import { useState } from "react";

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

// function Sidebar() {
//   const menuItems = [
//     { label: "Mahasiswa", active: false },
//     { label: "Dosen", active: false },
//     { label: "Kelas", active: true },
//     { label: "Tugas", active: false },
//   ];

//   return (
//     <aside className="w-[220px] shrink-0 bg-white border-r border-gray-200 flex flex-col">
//       <div className="px-5 py-6">
//         <span className="text-xl font-extrabold text-sky-500 tracking-wide">
//           LOGO
//         </span>
//       </div>

//       <nav className="px-3 flex flex-col">
//         <span className="text-[11px] text-gray-400 tracking-wide px-3 pb-3">
//           MENU
//         </span>

//         {menuItems.map((item) => (
//           <a
//             key={item.label}
//             href="#"
//             className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold mb-0.5 ${
//               item.active
//                 ? "bg-sky-50 text-sky-600"
//                 : "text-gray-600 hover:bg-gray-50"
//             }`}
//           >
//             {item.label}
//           </a>
//         ))}
//       </nav>
//     </aside>
//   );
// }

  // function Topbar() {
  //   return (
  //     <header className="h-16 flex items-center justify-between px-6 text-white bg-gradient-to-r from-sky-700 to-sky-400">
  //       <button aria-label="Toggle menu" className="p-1.5">
  //         <svg
  //           className="w-5 h-5"
  //           viewBox="0 0 24 24"
  //           fill="none"
  //           stroke="currentColor"
  //           strokeWidth="2"
  //         >
  //           <line x1="3" y1="6" x2="21" y2="6" />
  //           <line x1="3" y1="12" x2="21" y2="12" />
  //           <line x1="3" y1="18" x2="21" y2="18" />
  //         </svg>
  //       </button>

  //       <div className="flex items-center gap-2.5">
  //         <span className="w-[30px] h-[30px] rounded-full bg-white text-sky-500 font-bold text-sm flex items-center justify-center">
  //           A
  //         </span>
  //         <span className="text-sm font-semibold">Adrian Ananta</span>
  //         <svg
  //           className="w-4 h-4"
  //           viewBox="0 0 24 24"
  //           fill="none"
  //           stroke="currentColor"
  //           strokeWidth="2"
  //         >
  //           <polyline points="6 9 12 15 18 9" />
  //         </svg>
  //       </div>
  //     </header>
  //   );
  // }

function TambahKelasModal({ isOpen, onClose, onSubmit }) {
  const [kodeKelas, setKodeKelas] = useState("");

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!kodeKelas.trim()) return;
    onSubmit(kodeKelas);
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
          {kelas.map((item) => (
            <tr key={item.kode}>
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
                <button
                  aria-label={`Edit kelas ${item.kode}`}
                  className="text-gray-500 hover:text-gray-700"
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
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function DashboardPage() {
  const [kelasData, setKelasData] = useState(DUMMY_KELAS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isEmpty = kelasData.length === 0;

  function handleTambahKelas(kodeKelas) {
  setKelasData((prev) => {
    const targetExists = prev.some((g) => g.dosen === "Dosen A");

    if (targetExists) {
      return prev.map((group) => {
        if (group.dosen !== "Dosen A") {
          return group;
        }

        const newItem = {
          no: group.kelas.length + 1,
          kode: kodeKelas,
          hari: "-",
          jam: "-",
          ruang: "-",
        };

        return {
          ...group,
          kelas: [...group.kelas, newItem],
        };
      });
    }

    const newItem = {
      no: 1,
      kode: kodeKelas,
      hari: "-",
      jam: "-",
      ruang: "-",
    };

    return [
      ...prev,
      {
        dosen: "Dosen A",
        kelas: [newItem],
      },
    ];
  });

  setIsModalOpen(false);
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