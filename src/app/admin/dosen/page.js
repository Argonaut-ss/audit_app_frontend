"use client";

import { useState, useEffect } from "react";

import { useDosen } from "@/hooks/admin/dosen/useDosen";

import EditDosenModal from "@/components/layout/admin/dosen/edit_dosen";

import AlertSuccess from "@/components/layout/admin/alert/alert_success";

import { Pencil, Trash2, Search } from "lucide-react";

// const dosen = [
// {
//   id: 1,
//   kode: "d123",
//   nama: "Adrian Ananta",
//   email: "adrian.ananta@binus.edu",
//   password: "ADrian123",
// },
// {
//   id: 2,
//   kode: "d1345",
//   nama: "Budi",
//   email: "budi@binus.edu",
//   password: "Budi123",
// },
// {
//   id: 3,
//   kode: "d145",
//   nama: "Citra",
//   email: "citra@binus.edu",
//   password: "Citra123",
// },
// {
//   id: 4,
//   kode: "d432",
//   nama: "Deni",
//   email: "deni@binus.edu",
//   password: "Deni123",
// },
// {
//   id: 5,
//   kode: "d123",
//   nama: "Deni",
//   email: "deni@binus.edu",
//   password: "Deni123",
// },
// {
//   id: 6,
//   kode: "678",
//   nama: "Deni",
//   email: "deni@binus.edu",
//   password: "Deni123",
// },
// {
//   id: 7,
//   kode: "d347",
//   nama: "Deni",
//   email: "deni@binus.edu",
//   password: "Deni123",
// },
// {
//   id: 8,
//   kode: "d268",
//   nama: "Deni",
//   email: "deni@binus.edu",
//   password: "Deni123",
// },
// {
//   id: 9,
//   kode: "d397",
//   nama: "Deni",
//   email: "deni@binus.edu",
//   password: "Deni123",
// },
// {
//   id: 10,
//   kode: "284",
//   nama: "Deni",
//   email: "deni@binus.edu",
//   password: "Deni123",
// },
// ];

const DosenPage = () => {

  const [search, setSearch] = useState("");

  const [selectedDosen, setSelectedDosen] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const {
    dosen,
    loading,
    handleImport,
    handleDelete,
    handleUpdate,
  } = useDosen();

  // Membuka file picker
  const handleOpenImport = () => {
    document.getElementById("import-file").click();
  };

  // Mengirim file ke API
  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      await handleImport(file);
    } catch (error) {
      // Error sudah ditangani oleh hook
    }

    event.target.value = "";
  };

  const filteredDosen = dosen.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.kode_dosen.toLowerCase().includes(keyword) ||
      item.name.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
    );
  });

  const handleSaveEdit = async (form) => {
    try {
      await handleUpdate(selectedDosen.id, form);

      console.log("Mahasiswa berhasil diupdate");

      setShowEditModal(false);
      setSelectedDosen(null);

      setSuccessMessage("Data mahasiswa berhasil diperbarui.");
    } catch (error) {
      console.error(
        "Gagal update dosen:",
        error.response?.data || error.message
      );
    }
  };

  //handler tombol edit
  const handleEdit = (item) => {
    setSelectedDosen(item);
    setShowEditModal(true);
  };


  return (
    <div className="flex h-full min-h-0 flex-col px-10 py-10">

      <AlertSuccess
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />

      {/* Title */}
      <h1 className="font-poppins text-[28px] font-semibold text-[#293144]">
        DATA DOSEN
      </h1>

      {/* Search & Import */}
      <div className="mt-8 flex items-center justify-between">

        {/* Search */}
        <div className="flex h-[46px] w-[340px] items-center rounded-[7px] border border-[#D9DEE8] bg-white px-4">
          <Search
            size={18}
            strokeWidth={1.8}
            className="mr-3 text-[#3B82F6]"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kode, Nama, Email"
            className="w-full bg-transparent font-poppins text-sm text-[#293144] outline-none placeholder:text-[#888888]"
          />
        </div>

        {/* Import */}
        <button
          type="button"
          onClick={handleOpenImport}
          className="h-[46px] w-[155px] rounded-[7px] bg-[#42A5F5] font-poppins text-sm font-semibold text-white transition hover:bg-[#2196F3]"
        >
          + Import
        </button>
        <input
          id="import-file"
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleImportFile}
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
                KODE DOSEN
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
            {filteredDosen.length > 0 ? (
              filteredDosen.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-[#E5E7EB]"
                >
                  <td className="px-6 py-8 font-poppins text-sm text-[#293144]">
                    {index + 1}
                  </td>

                  <td className="px-6 py-8 font-poppins text-sm text-[#293144]">
                    {item.kode_dosen}
                  </td>

                  <td className="px-6 py-8 font-poppins text-sm text-[#293144]">
                    {item.name}
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
                        aria-label="Edit dosen"
                        onClick={() => handleEdit(item)}
                        className="text-black hover:text-[#42A5F5]"
                      >
                        <Pencil size={16} strokeWidth={2} />
                      </button>

                      <button
                        type="button"
                        aria-label="Delete mahasiswa"
                        onClick={() => handleDelete(item.id)}
                        className="text-black hover:text-red-500"
                      >
                        <Trash2 size={16} strokeWidth={1.8} />
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
      <EditDosenModal
        isOpen={showEditModal}
        dosen={selectedDosen}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default DosenPage;