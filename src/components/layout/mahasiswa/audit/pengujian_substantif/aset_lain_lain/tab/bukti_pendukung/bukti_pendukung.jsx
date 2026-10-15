"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import Pagination from "@/components/pagination/pagination";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import AlertSuccess from "@/components/alert/alert_success";
import AlertError from "@/components/alert/alert_error";

import BuktiPendukungForm from "./form/bukti_pendukung_form";

import { getAsetLainLain } from "@/services/mahasiswa/tugas/audit/aset_lain_lain/aset_lain_lain";
import useBuktiPendukung from "@/hooks/mahasiswa/tugas/audit/pengujian_substantif/aset_lain_lain/bukti_pendukung/use_bukti_pendukung";

export default function buktiPendukungTab({ auditId }) {
  const [documents, setDocuments] = useState([]);
  const [asetLainId, setAsetLainId] = useState(null);

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
    const fetchAsetLain = async () => {
      if (!auditId) return;

      try {
        const response = await getAsetLainLain(auditId);
        const asetLain = response ?? null;

        setAsetLainId(asetLain?.AsetLainID ?? null);
      } catch (error) {
        console.error("Gagal mengambil data aset lain-lain:", error);
      }
    };

    fetchAsetLain();
  }, [auditId]);

  const {
    buktiList,
    currentPage,
    totalPages,
    totalData,
    from,
    to,
    loading,
    error,
    changePage,
    addBukti,
    editBukti,
    removeBukti,
    viewBukti,
  } = useBuktiPendukung({
    asetLainId,
  });

  useEffect(() => {
    setDocuments(
      buktiList.map((item) => ({
        id: item.BuktiPendukungAsetLainID,
        namaFile: item.NamaFile,
        namaFileUpload: item.NamaFileUpload,
      }))
    );
  }, [buktiList]);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      await removeBukti(deleteTarget.id);

      setDeleteTarget(null);
      showSuccess("Bukti Pendukung berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus Bukti Pendukung:", error);

      showError(
        error.response?.data?.message ||
          "Gagal menghapus Bukti Pendukung."
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

      {error && !loading && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-poppins text-xs text-red-600">
          {error}
        </div>
      )}

      {/* HEADER / ACTION */}
      <div className="mb-5 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="flex h-10 items-center gap-2 rounded-lg bg-[#38BDF8] px-5 font-poppins text-xs font-medium text-white transition hover:bg-[#0EA5E9]"
        >
          <Plus size={15} />
          Tambah Data
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-[#DCE5EF]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#F8FAFC]">
              <tr className="border-b border-[#DCE5EF]">
                <th className="w-[60px] px-4 py-4 text-left font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                  No
                </th>

                <th className="px-4 py-4 text-left font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                  Nama File
                </th>

                <th className="px-4 py-4 text-left font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                  Upload File
                </th>

                <th className="w-[120px] px-4 py-4 text-center font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center font-poppins text-xs text-[#64748B]"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center">
                    <p className="font-poppins text-xs text-[#64748B]">
                      Belum ada Bukti Pendukung
                    </p>
                  </td>
                </tr>
              ) : (
                documents.map((document, index) => (
                  <tr
                    key={document.id}
                    className="border-b border-[#EEF2F6] last:border-none"
                  >
                    {/* NO */}
                    <td className="px-4 py-5 font-poppins text-xs text-[#64748B]">
                      {(currentPage - 1) * 10 + index + 1}
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
                            await viewBukti(document.id);
                          } catch (error) {
                            console.error(
                              "Gagal membuka bukti pendukung:",
                              error
                            );

                            showError(
                              error.message ||
                                "Gagal membuka file bukti pendukung."
                            );
                          }
                        }}
                        className="max-w-[500px] truncate text-left font-poppins text-xs text-[#3B82F6] transition hover:text-[#2563EB] hover:underline"
                        title={document.namaFileUpload}
                      >
                        {document.namaFileUpload}
                      </button>
                    </td>

                    {/* AKSI */}
                    <td className="px-4 py-5">
                      <div className="flex items-center justify-center gap-5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDocument(document);
                            setIsFormOpen(true);
                          }}
                          className="text-[#F59E0B] transition hover:scale-110"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              id: document.id,
                              namaFile: document.namaFile,
                            })
                          }
                          className="text-[#EF4444] transition hover:scale-110"
                          aria-label="Hapus"
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
            message="Hapus bukti pendukung ini?"
            subText={
              deleteTarget
                ? `bukti pendukung "${deleteTarget.namaFile}" akan dihapus.`
                : ""
            }
            confirmText="Hapus"
            cancelText="Batal"
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        </div>

        <BuktiPendukungForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingDocument(null);
          }}
          mode={editingDocument ? "edit" : "create"}
          initialData={editingDocument ? { namaFile: editingDocument.namaFile } : null}
          isSubmitting={isSubmitting}
          onSubmit={async (formData) => {
            const isEdit = Boolean(editingDocument);

            try {
              setIsSubmitting(true);

              if (isEdit) {
                await editBukti(editingDocument.id, formData);
                showSuccess("Bukti pendukung berhasil diperbarui.");
              } else {
                await addBukti(formData);
                showSuccess("Bukti Pendukung berhasil disimpan.");
              }

              setIsFormOpen(false);
              setEditingDocument(null);
            } catch (error) {
              console.error(
                isEdit
                  ? "Gagal memperbarui bukti Pendukung:"
                  : "Gagal menyimpan bukti Pendukung:",
                error
              );

              showError(
                error.response?.data?.message ||
                  (isEdit
                    ? "Gagal memperbarui bukti pendunkung."
                    : "Gagal menyimpan bukti pendukung.")
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
        />

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-[#DCE5EF] px-5">
          <p className="font-poppins text-xs text-[#64748B]">
            Menampilkan {from ?? 0} - {to ?? 0} dari {totalData} data
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
