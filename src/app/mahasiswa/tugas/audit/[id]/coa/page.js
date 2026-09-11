"use client";

import { useRef, useState } from "react";

import {
  BookOpen,
  Search,
  Trash2,
  Upload,
  Plus,
  Pencil,
} from "lucide-react";

import { useParams } from "next/navigation";

import Pagination from "@/components/pagination/pagination";

import useCoa from "@/hooks/mahasiswa/tugas/audit/coa/use_coa";

import ConfirmationPopup from "@/components/popup/confirmation_popup";

import AlertSuccess from "@/components/alert/alert_success";
import AlertError from "@/components/alert/alert_error";

import CoaForm from "@/components/layout/mahasiswa/audit/coa/form/coa_form";

export default function COAPage() {
  const params = useParams();

  const auditId = params.id;

  // ============================
  // STATE
  // ============================

  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");

  const itemsPerPage = 10;

  // DELETE ALL
  const [isDeleteAllPopupOpen, setIsDeleteAllPopupOpen] =
    useState(false);

  // DELETE BY ID
  const [selectedCoaId, setSelectedCoaId] = useState(null);

  const [isDeletePopupOpen, setIsDeletePopupOpen] =
    useState(false);

  // ALERT
  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // CREATE
  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  //EDIT
  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [selectedCoa, setSelectedCoa] =
    useState(null);

  // ============================
  // API
  // ============================

  const fileInputRef = useRef(null);

  const {
    coaList,
    pagination,

    isLoading,
    error,

    handleImport,
    isImporting,
    importError,

    handleDeleteAll,
    isDeletingAll,
    deleteAllError,

    handleDelete,
    isDeleting,
    deleteError,

    handleCreate,
    isCreating,
    handleUpdate,
    isUpdating,
  } = useCoa({
    jwbKasusId: auditId,
    page: currentPage,
    perPage: itemsPerPage,
    search,
  });

  // ============================
  // PAGINATION
  // ============================

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ============================
  // SEARCH
  // ============================

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  // ============================
  // INFO DATA
  // ============================

  const startData =
    pagination.total === 0
      ? 0
      : (pagination.currentPage - 1) *
      pagination.perPage +
      1;

  const endData = Math.min(
    pagination.currentPage *
    pagination.perPage,
    pagination.total
  );

  // ============================
  // HANDLE IMPORT
  // ============================

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const result = await handleImport(file);

    event.target.value = "";

    if (result.success) {
      setSuccessMessage(
        "Data COA berhasil diimport"
      );
      return;
    }

    setErrorMessage(
      result.message ||
      "Gagal mengimport data COA"
    );
  };

  // ============================
  // HANDLE DELETE ALL
  // ============================

  const handleDeleteAllClick = () => {
    if (pagination.total === 0) {
      return;
    }

    setIsDeleteAllPopupOpen(true);
  };

  const handleConfirmDeleteAll = async () => {
    setIsDeleteAllPopupOpen(false);

    const result =
      await handleDeleteAll();

    if (result.success) {
      setCurrentPage(1);

      setSuccessMessage(
        "Semua data COA berhasil dihapus"
      );

      return;
    }

    setErrorMessage(
      result.message ||
      "Gagal menghapus semua data COA"
    );
  };

  // ============================
  // HANDLE DELETE BY ID
  // ============================

  const handleDeleteClick = (coaId) => {
    setSelectedCoaId(coaId);
    setIsDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeletePopupOpen(false);

    const result =
      await handleDelete(selectedCoaId);

    setSelectedCoaId(null);

    if (result.success) {
      setSuccessMessage(
        "Data COA berhasil dihapus"
      );

      return;
    }

    setErrorMessage(
      result.message ||
      "Gagal menghapus data COA"
    );
  };

  // ============================
  // HANDLE CREATE
  // ============================

  const handleCreateCoa = async (formData) => {
    const result =
      await handleCreate(formData);

    if (result.success) {
      setIsCreateModalOpen(false);
      setCurrentPage(1);

      setSuccessMessage(
        "Data COA berhasil ditambahkan"
      );

      return;
    }

    setErrorMessage(
      result.message ||
      "Gagal menambahkan data COA"
    );
  };

  // ============================
  // HANDLE EDIT
  // ============================

  const handleEditClick = (coa) => {
    setSelectedCoa(coa);
    setIsEditModalOpen(true);
  };

  const handleUpdateCoa = async (formData) => {
    if (!selectedCoa?.coaId) {
      setErrorMessage("ID COA tidak ditemukan");
      return;
    }
  
    const result = await handleUpdate(
      selectedCoa.coaId,
      formData
    );
  
    if (result.success) {
      setIsEditModalOpen(false);
      setSelectedCoa(null);
      setSuccessMessage("Data COA berhasil diperbarui");
      return;
    }
  
    setErrorMessage(
      result.message || "Gagal memperbarui data COA"
    );
  };

  return (
    <main className="w-full pr-6 pt-4">
      <div className="mx-auto max-w-[1300px]">

        <section className="overflow-hidden rounded-xl bg-white shadow-sm">

          {/* HEADER */}
          <div className="flex items-center gap-4 bg-[#51B7FF] px-8 py-6">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <BookOpen
                size={23}
                strokeWidth={1.8}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="font-poppins text-xl font-semibold text-white">
                Chart of Account
              </h1>

              <p className="font-poppins text-xs text-white/80">
                Kelola daftar akun, mapping top schedule,
                dan import data COA audit.
              </p>
            </div>

          </div>

          {/* CONTENT */}
          <div className="p-5">

            {/* TOOLBAR */}
            <div className="mb-5 flex items-center justify-between gap-4">

              {/* SEARCH */}
              <div className="relative w-full max-w-[280px]">

                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Cari Akun"
                  className="h-10 w-full rounded-lg border border-[#DCE5EF] bg-[#F8FAFC] pl-10 pr-4 font-poppins text-xs text-[#475569] outline-none transition focus:border-[#38BDF8]"
                />

              </div>

              {/* BUTTONS */}
              <div className="flex items-center gap-3">

                {/* HAPUS SEMUA */}
                <button
                  type="button"
                  onClick={handleDeleteAllClick}
                  disabled={
                    isDeletingAll ||
                    pagination.total === 0
                  }
                  className="flex h-10 items-center gap-2 rounded-lg border border-[#FCA5A5] px-4 font-poppins text-xs font-medium text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={14} />

                  {isDeletingAll
                    ? "Menghapus..."
                    : "Hapus Semua"}
                </button>

                {/* IMPORT */}
                <button
                  type="button"
                  onClick={handleImportClick}
                  disabled={isImporting}
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#3B82F6] px-4 font-poppins text-xs font-medium text-white transition hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Upload size={14} />
                  {isImporting
                    ? "Mengimport..."
                    : "Import Data"}
                </button>

                {/* TAMBAH */}
                <button
                  type="button"
                  onClick={() =>
                    setIsCreateModalOpen(true)
                  }
                  disabled={isCreating}
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#38BDF8] px-4 font-poppins text-xs font-medium text-white transition hover:bg-[#0EA5E9] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={15} />
                  Tambah
                </button>

              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

            </div>

            {/* ERROR API */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="font-poppins text-xs text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* TABLE */}
            <div className="overflow-hidden rounded-xl border border-[#DCE5EF]">

              <div className="overflow-x-auto">

                <table className="w-full border-collapse">

                  <thead className="bg-[#F8FAFC]">

                    <tr className="border-b border-[#DCE5EF]">

                      <th className="px-4 py-4 text-left font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                        No
                      </th>

                      <th className="px-4 py-4 text-left font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                        No Akun
                      </th>

                      <th className="px-4 py-4 text-left font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                        Nama Akun
                      </th>

                      <th className="px-4 py-4 text-left font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                        Kelompok Akun Utama
                      </th>

                      <th className="px-4 py-4 text-left font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                        Kelompok Sub Akun
                      </th>

                      <th className="px-4 py-4 text-left font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                        Mapping Top Schedule
                      </th>

                      <th className="px-4 py-4 text-left font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                        Sub Mapping Top Schedule
                      </th>

                      <th className="px-4 py-4 text-center font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                        Aksi
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {/* LOADING */}
                    {isLoading && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center"
                        >
                          <p className="font-poppins text-xs text-[#64748B]">
                            Memuat data...
                          </p>
                        </td>
                      </tr>
                    )}

                    {/* EMPTY */}
                    {!isLoading &&
                      coaList.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-10 text-center"
                          >
                            <p className="font-poppins text-xs text-[#64748B]">
                              Data tidak ditemukan
                            </p>
                          </td>
                        </tr>
                      )}

                    {/* DATA */}
                    {!isLoading &&
                      coaList.map(
                        (item, index) => (
                          <tr
                            key={
                              item.coaId ??
                              index
                            }
                            className="border-b border-[#EEF2F6] last:border-none"
                          >

                            <td className="px-4 py-4 font-poppins text-xs text-[#64748B]">
                              {startData + index}
                            </td>

                            <td className="px-4 py-4 font-poppins text-xs text-[#475569]">
                              {item.noAkun ?? "-"}
                            </td>

                            <td className="px-4 py-4 font-poppins text-xs text-[#475569]">
                              {item.namaAkun ?? "-"}
                            </td>

                            <td className="px-4 py-4 font-poppins text-xs text-[#64748B]">
                              {item.mappingGroup ?? "-"}
                            </td>

                            <td className="px-4 py-4 font-poppins text-xs text-[#64748B]">
                              {item.mapKelompok ?? "-"}
                            </td>

                            <td className="px-4 py-4 font-poppins text-xs text-[#64748B]">
                              {item.mappingTop ?? "-"}
                            </td>

                            <td className="px-4 py-4 font-poppins text-xs text-[#64748B]">
                              {item.subMappingTop ?? "-"}
                            </td>

                            <td className="px-4 py-4">

                              <div className="flex items-center justify-center gap-4">

                                {/* EDIT */}
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(item)}
                                  disabled={isUpdating}
                                  className="text-[#D97706] transition hover:scale-110"
                                >
                                  <Pencil size={15} />
                                </button>

                                {/* DELETE */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteClick(
                                      item.coaId
                                    )
                                  }
                                  disabled={
                                    isDeleting
                                  }
                                  className="text-[#EF4444] transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Trash2 size={15} />
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )}

                  </tbody>

                </table>

              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between border-t border-[#DCE5EF] px-5">

                <p className="font-poppins text-xs text-[#64748B]">
                  Menampilkan{" "}
                  {startData}
                  {" - "}
                  {endData}
                  {" dari "}
                  {pagination.total}
                  {" data"}
                </p>

                {pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={
                      pagination.currentPage
                    }
                    totalPages={
                      pagination.totalPages
                    }
                    onPageChange={
                      handlePageChange
                    }
                  />
                )}

              </div>

            </div>

          </div>

          {/* DELETE ALL POPUP */}
          <ConfirmationPopup
            isOpen={
              isDeleteAllPopupOpen
            }
            message="Apakah Anda yakin ingin menghapus semua data COA?"
            subText="Seluruh data COA pada kasus audit ini akan dihapus dan tindakan ini tidak dapat dibatalkan."
            confirmText="Ya, Hapus Semua"
            cancelText="Batal"
            onConfirm={
              handleConfirmDeleteAll
            }
            onCancel={() =>
              setIsDeleteAllPopupOpen(false)
            }
          />

          {/* DELETE BY ID POPUP */}
          <ConfirmationPopup
            isOpen={isDeletePopupOpen}
            message="Apakah Anda yakin ingin menghapus data COA ini?"
            subText="Data COA yang dihapus tidak dapat dikembalikan."
            confirmText="Ya, Hapus"
            cancelText="Batal"
            onConfirm={
              handleConfirmDelete
            }
            onCancel={() => {
              setIsDeletePopupOpen(false);
              setSelectedCoaId(null);
            }}
          />

          {/* SUCCESS ALERT */}
          <AlertSuccess
            message={successMessage}
            onClose={() =>
              setSuccessMessage("")
            }
          />

          {/* ERROR ALERT */}
          <AlertError
            message={errorMessage}
            onClose={() =>
              setErrorMessage("")
            }
          />

          {/* CREATE FORM */}
          <CoaForm
            isOpen={isCreateModalOpen}
            onClose={() =>
              setIsCreateModalOpen(false)
            }
            onSubmit={handleCreateCoa}
            isSubmitting={isCreating}
          />

          {/* EDIT FORM */}
          <CoaForm
            isOpen={isEditModalOpen}
            mode="edit"
            initialData={selectedCoa}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCoa(null);
            }}
            onSubmit={handleUpdateCoa}
            isSubmitting={isUpdating}
          />

        </section>

      </div>
    </main>
  );
}