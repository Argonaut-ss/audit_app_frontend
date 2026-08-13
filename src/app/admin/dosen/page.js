"use client";

import { useState } from "react";

import { useDosen } from "@/hooks/admin/dosen/useDosen";

import EditDosenModal from "@/components/layout/admin/dosen/edit_dosen";

import AlertSuccess from "@/components/alert/alert_success";
import AlertError from "@/components/alert/alert_error";

import Pagination from "@/components/pagination/pagination";

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

  const [selectedDosen, setSelectedDosen] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);

  const [successAlert, setSuccessAlert] = useState({
    title: "",
    message: "",
  });
  const [errorAlert, setErrorAlert] = useState({
    title: "",
    message: "",
  });

  const {
    dosen,
    loading,

    search,
    handleSearch,

    currentPage,
    totalPages,
    changePage,

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
      setSuccessAlert({
        title: "Berhasil ditambah",
        message: "Data dosen berhasil ditambah.",
      });
    } catch (error) {
      // Error sudah ditangani oleh hook
      setErrorAlert({
        title: "Gagal ditambah",
        message: "Data dosen Gagal ditambah.",
      });
    }

    event.target.value = "";
  };

  const handleSaveEdit = async (form) => {
    try {
      await handleUpdate(selectedDosen.id, form);

      console.log("Dosen berhasil diupdate");

      setShowEditModal(false);
      setSelectedDosen(null);

      setSuccessAlert({
        title: "Berhasil diperbarui",
        message: "Data dosen berhasil diperbarui.",
      });
    } catch (error) {
      console.error(
        "Gagal update dosen:",
        error.response?.data || error.message
      );
      setSuccessAlert({
        title: "Gagal diperbarui",
        message: "Data dosen gagal diperbarui.",
      });
    }
  };

  //handler tombol edit
  const handleEdit = (item) => {
    setSelectedDosen(item);
    setShowEditModal(true);
  };

  // handle tombol edit
  const handleDeleteDosen = async (id) => {
    try {
      await handleDelete(id);
      setSuccessAlert({
        title: "Berhasil dihapus",
        message: "Data dosen berhasil dihapus.",
      });
    } catch (error) {
      setErrorAlert({
        title: "Gagal dihapus",
        message: "Data mahasiswa Gagal dihapus.",
      });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col px-10 py-10">

      <AlertSuccess
        title={successAlert.title}
        message={successAlert.message}
        onClose={() => setSuccessAlert("")}
      />

      <AlertError
        title={errorAlert.title}
        message={errorAlert.message}
        onClose={() => setErrorAlert("")}
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
            onChange={(e) => handleSearch(e.target.value)}
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
      <div className="mt-2 rounded-xl bg-white">
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
            {dosen.length > 0 ? (
              dosen.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-[#E5E7EB]"
                >
                  <td className="px-6 py-4 font-poppins text-sm text-[#293144]">
                    {(currentPage - 1) * 10 + index + 1}
                  </td>

                  <td className="px-6 py-4 font-poppins text-sm text-[#293144]">
                    {item.kode_dosen}
                  </td>

                  <td className="px-6 py-4 font-poppins text-sm text-[#293144]">
                    {item.name}
                  </td>

                  <td className="px-6 py-4 font-poppins text-sm text-[#6B7589]">
                    {item.email}
                  </td>

                  <td className="px-6 py-4 font-poppins text-sm text-[#6B7589]">
                    {item.password}
                  </td>

                  <td className="px-6 py-4 text-center">
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
                        onClick={() => handleDeleteDosen(item.id)}
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={changePage}
        />
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