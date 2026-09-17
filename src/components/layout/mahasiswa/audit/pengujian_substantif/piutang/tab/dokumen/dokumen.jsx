"use client";

import { useEffect, useState } from "react";

import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import Pagination from "@/components/pagination/pagination";

import DokumenForm from "./form/dokumen_form";

import { getPiutang } from "@/services/mahasiswa/tugas/audit/piutang/piutang";
import useDokumen from "@/hooks/mahasiswa/tugas/audit/pengujian_substantif/piutang/dokumen/use_dokumen";

import ConfirmationPopup from "@/components/popup/confirmation_popup";

import AlertSuccess from "@/components/alert/alert_success";
import AlertError from "@/components/alert/alert_error";

export default function DokumenTab({ auditId }) {

  const [documents, setDocuments] = useState([]);

  const [piutangId, setPiutangId] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [editingDocument, setEditingDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alert, setAlert] = useState({
    type: null,
    message: "",
  });

  const showSuccess = (message) => {
    setAlert({
      type: "success",
      message,
    });
  };

  const showError = (message) => {
    setAlert({
      type: "error",
      message,
    });
  };

  useEffect(() => {
    const fetchPiutang = async () => {
      if (!auditId) return;

      try {
        const response = await getPiutang(auditId);

        const piutang = response ?? null;

        setPiutangId(piutang?.PiutangID ?? null);
      } catch (error) {
        console.error("Gagal mengambil data piutang:", error);
      }
    };

    fetchPiutang();
  }, [auditId]);

  const {
    dokumenList,
    currentPage,
    totalPages,
    totalData,
    from,
    to,
    loading,
    error,
    changePage,
    addDokumen,
    editDokumen,
    removeDokumen,
    viewDokumen,
  } = useDokumen({
    piutangId,
  });

  useEffect(() => {
    setDocuments(
      dokumenList.map((item) => ({
        id: item.DokumenID,
        tipeFile: item.TipeFile,
        namaFile: item.NamaFile,
        namaFileUpload: item.NamaFileUpload,
      }))
    );
  }, [dokumenList]);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
  
    try {
      await removeDokumen(deleteTarget.id);
  
      setDeleteTarget(null);
  
      showSuccess("Dokumen berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus dokumen:", error);
  
      showError(
        error.response?.data?.message ||
          "Gagal menghapus dokumen."
      );
    }
  };

  return (
    <div className="rounded-xl border border-[#DCE5EF] bg-white p-5">

      {alert.type === "success" && (
        <AlertSuccess
          message={alert.message}
          onClose={() =>
            setAlert({
              type: null,
              message: "",
            })
          }
        />
      )}

      {alert.type === "error" && (
        <AlertError
          message={alert.message}
          onClose={() =>
            setAlert({
              type: null,
              message: "",
            })
          }
        />
      )}

      {/* HEADER / ACTION */}
      <div className="mb-5 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="
            flex
            h-10
            items-center
            gap-2
            rounded-lg
            bg-[#38BDF8]
            px-5
            font-poppins
            text-xs
            font-medium
            text-white
            transition
            hover:bg-[#0EA5E9]
          "
        >
          <Plus size={15} />
          Tambah Data
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-[#DCE5EF]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">

            {/* HEADER */}
            <thead className="bg-[#F8FAFC]">
              <tr className="border-b border-[#DCE5EF]">

                <th
                  className="
                    w-[60px]
                    px-4
                    py-4
                    text-left
                    font-poppins
                    text-[10px]
                    font-semibold
                    uppercase
                    text-[#64748B]
                  "
                >
                  No
                </th>

                <th
                  className="
                    px-4
                    py-4
                    text-left
                    font-poppins
                    text-[10px]
                    font-semibold
                    uppercase
                    text-[#64748B]
                  "
                >
                  Nama File
                </th>

                <th
                  className="
                    px-4
                    py-4
                    text-left
                    font-poppins
                    text-[10px]
                    font-semibold
                    uppercase
                    text-[#64748B]
                  "
                >
                  Upload File
                </th>

                <th
                  className="
                    w-[120px]
                    px-4
                    py-4
                    text-center
                    font-poppins
                    text-[10px]
                    font-semibold
                    uppercase
                    text-[#64748B]
                  "
                >
                  Aksi
                </th>

              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center"
                  >
                    <p className="font-poppins text-xs text-[#64748B]">
                      Belum ada dokumen
                    </p>
                  </td>
                </tr>
              ) : (
                documents.map((document, index) => (
                  <tr
                    key={document.id}
                    className="
                      border-b
                      border-[#EEF2F6]
                      last:border-none
                    "
                  >
                    {/* NO */}
                    <td className="px-4 py-5 font-poppins text-xs text-[#64748B]">
                      {index + 1}
                    </td>

                    {/* NAMA FILE */}
                    <td className="px-4 py-5 font-poppins text-xs text-[#475569]">
                      {document.namaFile}
                    </td>

                    {/* UPLOAD FILE */}
                    <td className="px-4 py-5">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await viewDokumen(document.id);
                          } catch (error) {
                            console.error("Gagal membuka dokumen:", error);
                        
                            showError(
                              error.message ||
                                "Gagal membuka file dokumen."
                            );
                          }
                        }}
                        className="
                          max-w-[500px]
                          truncate
                          text-left
                          font-poppins
                          text-xs
                          text-[#3B82F6]
                          transition
                          hover:text-[#2563EB]
                          hover:underline
                        "
                        title={document.namaFileUpload}
                      >
                        {document.namaFileUpload}
                      </button>
                    </td>

                    {/* AKSI */}
                    <td className="px-4 py-5">
                      <div className="flex items-center justify-center gap-5">

                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDocument(document);
                            setIsFormOpen(true);
                          }}
                          className="
                            text-[#F59E0B]
                            transition
                            hover:scale-110
                          "
                        >
                          <Pencil size={15} />
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              id: document.id,
                              namaFile: document.namaFile,
                            })
                          }
                          className="
                            text-[#EF4444]
                            transition
                            hover:scale-110
                          "
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
          <ConfirmationPopup
            isOpen={Boolean(deleteTarget)}
            message="Hapus dokumen ini?"
            subText={
              deleteTarget
                ? `Dokumen "${deleteTarget.namaFile}" akan dihapus.`
                : ""
            }
            confirmText="Hapus"
            cancelText="Batal"
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        </div>
        <DokumenForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingDocument(null);
          }}
          mode={editingDocument ? "edit" : "create"}
          initialData={
            editingDocument
              ? {
                namaFile: editingDocument.tipeFile,
                customNamaFile:
                  editingDocument.tipeFile === "Lain-lain"
                    ? editingDocument.namaFile
                    : "",
              }
              : null
          }
          isSubmitting={isSubmitting}
          onSubmit={async (formData) => {
            const isEdit = Boolean(editingDocument);

            try {
              setIsSubmitting(true);

              if (isEdit) {
                await editDokumen(
                  editingDocument.id,
                  formData
                );

                showSuccess("Dokumen berhasil diperbarui.");
              } else {
                await addDokumen(formData);

                showSuccess("Dokumen berhasil disimpan.");
              }

              setIsFormOpen(false);
              setEditingDocument(null);
            } catch (error) {
              console.error(
                isEdit
                  ? "Gagal memperbarui dokumen:"
                  : "Gagal menyimpan dokumen:",
                error
              );

              showError(
                error.response?.data?.message ||
                (isEdit
                  ? "Gagal memperbarui dokumen."
                  : "Gagal menyimpan dokumen.")
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
        />

        {/* FOOTER */}
        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-[#DCE5EF]
            px-5
          "
        >
          <p className="font-poppins text-xs text-[#64748B]">
            Menampilkan{" "}
            {from ?? 0}
            {" - "}
            {to ?? 0}
            {" dari "}
            {totalData}
            {" data"}
          </p>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={changePage}
          />
        </div>

      </div>
    </div>
  );
}