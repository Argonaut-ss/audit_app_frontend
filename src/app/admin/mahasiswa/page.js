"use client";

import { useState } from "react";

const mahasiswa = [
  {
    id: 1,
    nim: "27022111029",
    nama: "Adrian Ananta",
    email: "adrian.ananta@binus.ac.id",
    password: "ADrian123",
  },
  {
    id: 2,
    nim: "27022111030",
    nama: "Budi",
    email: "budi@binus.ac.id",
    password: "Budi123",
  },
  {
    id: 3,
    nim: "27022111031",
    nama: "Citra",
    email: "citra@binus.ac.id",
    password: "Citra123",
  },
  {
    id: 4,
    nim: "27022111032",
    nama: "Deni",
    email: "deni@binus.ac.id",
    password: "Deni123",
  },
  {
    id: 5,
    nim: "27022111032",
    nama: "Deni",
    email: "deni@binus.ac.id",
    password: "Deni123",
  },
  {
    id: 6,
    nim: "27022111032",
    nama: "Deni",
    email: "deni@binus.ac.id",
    password: "Deni123",
  },
  {
    id: 7,
    nim: "27022111032",
    nama: "Deni",
    email: "deni@binus.ac.id",
    password: "Deni123",
  },
  {
    id: 8,
    nim: "27022111032",
    nama: "Deni",
    email: "deni@binus.ac.id",
    password: "Deni123",
  },
  {
    id: 9,
    nim: "27022111032",
    nama: "Deni",
    email: "deni@binus.ac.id",
    password: "Deni123",
  },
  {
    id: 10,
    nim: "27022111032",
    nama: "Deni",
    email: "deni@binus.ac.id",
    password: "Deni123",
  },
];

export default function MahasiswaPage() {
  const [search, setSearch] = useState("");

  const filteredMahasiswa = mahasiswa.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.nim.toLowerCase().includes(keyword) ||
      item.nama.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
    );
  });

  //handle import file
  const handleImport = () => {
    document.getElementById("import-file").click();
  };

  return (
    <div className="flex h-full min-h-0 flex-col px-10 py-10">
      {/* Title */}
      <h1 className="font-poppins text-[28px] font-semibold text-[#293144]">
        DATA MAHASISWA
      </h1>

      {/* Search & Import */}
      <div className="mt-8 flex items-center justify-between">

        {/* Search */}
        <div className="flex h-[46px] w-[340px] items-center rounded-[7px] border border-[#D9DEE8] bg-white px-4">
          <span className="mr-3 text-[#3B82F6]">
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="NIM, Nama, Email"
            className="w-full bg-transparent font-poppins text-sm text-[#293144] outline-none placeholder:text-[#888888]"
          />
        </div>

        {/* Import */}
        <button
          type="button"
          onClick={handleImport}
          className="h-[46px] w-[155px] rounded-[7px] bg-[#42A5F5] font-poppins text-sm font-semibold text-white transition hover:bg-[#2196F3]"
        >
          + Import
        </button>
        <input
          id="import-file"
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            console.log("File yang dipilih:", file);
          }}
        />
      </div>

      {/* Table */}
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto rounded-xl bg-white">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-[#D9DEE8]">
              <th className="w-[6%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                NO
              </th>

              <th className="w-[25%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                NIM
              </th>

              <th className="w-[25%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                NAMA
              </th>

              <th className="w-[25%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                EMAIL
              </th>

              <th className="w-[10%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                PASSWORD
              </th>

              <th className="w-[4%] px-6 pt-10 py-4 text-right font-poppins text-xs font-semibold text-[#6B7589]">
                AKSI
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredMahasiswa.length > 0 ? (
              filteredMahasiswa.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-[#E5E7EB]"
                >
                  <td className="px-6 py-8 font-poppins text-sm text-[#293144]">
                    {index + 1}
                  </td>

                  <td className="px-6 py-8 font-poppins text-sm text-[#293144]">
                    {item.nim}
                  </td>

                  <td className="px-6 py-8 font-poppins text-sm text-[#293144]">
                    {item.nama}
                  </td>

                  <td className="px-6 py-8 font-poppins text-sm text-[#6B7589]">
                    {item.email}
                  </td>

                  <td className="px-6 py-8 font-poppins text-sm text-[#6B7589]">
                    {item.password}
                  </td>

                  <td className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        aria-label="Edit mahasiswa"
                        className="text-black hover:text-[#42A5F5]"
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        aria-label="Delete mahasiswa"
                        className="text-black hover:text-red-500"
                      >
                        ♜
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="h-[300px] text-center align-middle font-poppins text-sm text-[#9CA3AF]"
                >
                  No Data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}