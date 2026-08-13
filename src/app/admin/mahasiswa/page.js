"use client";

import { useState } from "react";

import { useMahasiswa } from "@/hooks/admin/mahasiswa/useMahasiswa";

import EditMahasiswaModal from "@/components/layout/admin/mahasiswa/edit_mahasiswa";

import AlertSuccess from "@/components/alert/alert_success";
import AlertError from "@/components/alert/alert_error";

import Pagination from "@/components/pagination/pagination";

import { Pencil, Trash2, Search, Edit } from "lucide-react";


//dummy data array
// const mahasiswa = [
// {
//   id: 1,
//   nim: "27022111029",
//   nama: "Adrian Ananta",
//   email: "adrian.ananta@binus.ac.id",
//   password: "ADrian123",
// },
// {
//   id: 2,
//   nim: "27022111030",
//   nama: "Budi",
//   email: "budi@binus.ac.id",
//   password: "Budi123",
// },
// {
//   id: 3,
//   nim: "27022111031",
//   nama: "Citra",
//   email: "citra@binus.ac.id",
//   password: "Citra123",
// },
// {
//   id: 4,
//   nim: "27022111032",
//   nama: "Deni",
//   email: "deni@binus.ac.id",
//   password: "Deni123",
// },
// {
//   id: 5,
//   nim: "27022111032",
//   nama: "Deni",
//   email: "deni@binus.ac.id",
//   password: "Deni123",
// },
// {
//   id: 6,
//   nim: "27022111032",
//   nama: "Deni",
//   email: "deni@binus.ac.id",
//   password: "Deni123",
// },
// {
//   id: 7,
//   nim: "27022111032",
//   nama: "Deni",
//   email: "deni@binus.ac.id",
//   password: "Deni123",
// },
// {
//   id: 8,
//   nim: "27022111032",
//   nama: "Deni",
//   email: "deni@binus.ac.id",
//   password: "Deni123",
// },
// {
//   id: 9,
//   nim: "27022111032",
//   nama: "Deni",
//   email: "deni@binus.ac.id",
//   password: "Deni123",
// },
// {
//   id: 10,
//   nim: "27022111032",
//   nama: "Deni",
//   email: "deni@binus.ac.id",
//   password: "Deni123",
// },
// ];


export default function MahasiswaPage() {

  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);

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
    mahasiswa,
    loading,
    search,
    currentPage,
    totalPages,
    handleSearch,
    changePage,
    handleImport,
    handleDelete,
    handleUpdate,
  } = useMahasiswa();

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
        message: "Data mahasiswa berhasil ditambah.",
      });
    } catch (error) {
      // Error sudah ditangani oleh hook
      setErrorAlert({
        title: "Gagal ditambah",
        message: "Data mahasiswa Gagal ditambah.",
      });
    }

    event.target.value = "";
  };

  //handler save edit
  const handleSaveEdit = async (form) => {
    try {
      await handleUpdate(selectedMahasiswa.id, form);

      console.log("Mahasiswa berhasil diupdate");

      setShowEditModal(false);
      setSelectedMahasiswa(null);

      setSuccessAlert({
        title: "Berhasil diperbarui",
        message: "Data mahasiswa berhasil diperbarui.",
      });

    } catch (error) {
      console.error(
        "Gagal update mahasiswa:",
        error.response?.data || error.message
      );
      setSuccessAlert({
        title: "Gagal diperbarui",
        message: "Data mahasiswa gagal diperbarui.",
      });
    }
  };

  //handler tombol edit
  const handleEdit = (item) => {
    setSelectedMahasiswa(item);
    setShowEditModal(true);
  };

  // handle tombol edit
  const handleDeleteMahasiswa = async (id) => {
    try {
      await handleDelete(id);
      setSuccessAlert({
        title: "Berhasil dihapus",
        message: "Data mahasiswa berhasil dihapus.",
      });
    } catch (error) {
      setErrorAlert({
        title: "Gagal dihapus",
        message: "Data mahasiswa Gagal dihapus.",
      });
    }
  };

  return (
    <div className="min-h-screen px-10 py-10">

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
        DATA MAHASISWA
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
            placeholder="NIM, Nama, Email"
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
          <thead className="bg-white">
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
            {mahasiswa.length > 0 ? (
              mahasiswa.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-[#E5E7EB]"
                >
                  <td className="px-6 py-4 font-poppins text-sm text-[#293144]">
                    {(currentPage - 1) * 10 + index + 1}
                  </td>

                  <td className="px-6 py-4 font-poppins text-sm text-[#293144]">
                    {item.nim}
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
                        aria-label="Edit mahasiswa"
                        onClick={() => handleEdit(item)}
                        className="text-black hover:text-[#42A5F5]"
                      >
                        <Pencil size={16} strokeWidth={2} />
                      </button>

                      <button
                        type="button"
                        aria-label="Delete mahasiswa"
                        onClick={() => handleDeleteMahasiswa(item.id)}
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
      <EditMahasiswaModal
        isOpen={showEditModal}
        mahasiswa={selectedMahasiswa}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}