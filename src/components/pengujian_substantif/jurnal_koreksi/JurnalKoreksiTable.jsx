"use client";

import { useState } from "react";
import { AlignLeft, FilePenLine, FileText, GripVertical, Trash2, X } from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import Dropdown from "@/components/ui/dropdown/dropdown";

let nextRowKey = 0;

const formatAmount = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const amountValue = (value) => Number(String(value ?? "").replace(/\D/g, "") || 0);

const createDraftRow = () => ({
  rowKey: ++nextRowKey,
  coaId: "",
  accountName: "",
  accountNumber: "",
  debit: "",
  credit: "",
});

const createDraftRows = () => [createDraftRow(), createDraftRow()];

const validateRows = (rows) => {
  if (rows.some((row) => !row.coaId)) return "Pilih akun COA untuk setiap baris.";
  if (rows.some((row) => (amountValue(row.debit) > 0) === (amountValue(row.credit) > 0))) {
    return "Setiap baris harus memiliki salah satu nilai Debet atau Kredit.";
  }

  const debit = rows.reduce((total, row) => total + amountValue(row.debit), 0);
  const credit = rows.reduce((total, row) => total + amountValue(row.credit), 0);
  return debit === credit ? "" : "Total Debet dan Kredit harus sama.";
};

export default function JurnalKoreksiTable({ journals = [], coaOptions = [], isLoading = false, isSaving = false, onCreate, onUpdate, onDelete, onSave }) {
  const [draftRows, setDraftRows] = useState(createDraftRows);
  const [draftDescription, setDraftDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState(null);
  const [draftRowToDelete, setDraftRowToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [draggedRowKey, setDraggedRowKey] = useState(null);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraftRowToDelete(null);
    setDraggedRowKey(null);
  };

  const openAddJournal = () => {
    setDraftRows(createDraftRows());
    setDraftDescription("");
    setEditingId(null);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditJournal = (journal) => {
    setDraftRows(journal.rows.map((row) => ({ ...row, rowKey: ++nextRowKey })));
    setDraftDescription(journal.description ?? "");
    setEditingId(journal.id);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const updateDraftRow = (rowKey, field, value) => {
    setDraftRows((currentRows) => currentRows.map((row) => {
      if (row.rowKey !== rowKey) return row;
      if (field === "debit" || field === "credit") return { ...row, [field]: formatAmount(value) };
      if (field === "coaId") {
        const account = coaOptions.find((option) => String(option.value) === String(value));
        return { ...row, coaId: value, accountName: account?.label ?? "", accountNumber: account?.accountNumber ?? "" };
      }
      return { ...row, [field]: value };
    }));
  };

  const saveDraftJournal = async () => {
    const validationError = validateRows(draftRows);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const journal = { id: editingId, description: draftDescription, rows: draftRows.map(({ rowKey, ...row }) => row) };
    try {
      if (editingId !== null) await onUpdate?.(editingId, journal);
      else await onCreate?.(journal);
      closeModal();
      setSuccessMessage(editingId !== null ? "Jurnal koreksi berhasil diperbarui." : "Jurnal koreksi berhasil ditambahkan.");
    } catch (error) {
      setErrorMessage(error?.message ?? "Jurnal koreksi gagal disimpan.");
    }
  };

  const confirmDeleteJournal = async () => {
    try {
      await onDelete?.(journalToDelete);
      setJournalToDelete(null);
      setSuccessMessage("Jurnal koreksi berhasil dihapus.");
    } catch (error) {
      setErrorMessage(error?.message ?? "Jurnal koreksi gagal dihapus.");
    }
  };

  const removeDraftRow = () => {
    if (draftRows.length <= 2) return;
    setDraftRows((currentRows) => currentRows.filter((row) => row.rowKey !== draftRowToDelete));
    setDraftRowToDelete(null);
  };

  const moveDraftRow = (targetRowKey) => {
    if (draggedRowKey === null || draggedRowKey === targetRowKey) return;
    setDraftRows((currentRows) => {
      const sourceIndex = currentRows.findIndex((row) => row.rowKey === draggedRowKey);
      const targetIndex = currentRows.findIndex((row) => row.rowKey === targetRowKey);
      if (sourceIndex === -1 || targetIndex === -1) return currentRows;
      const nextRows = [...currentRows];
      const [movedRow] = nextRows.splice(sourceIndex, 1);
      nextRows.splice(targetIndex, 0, movedRow);
      return nextRows;
    });
    setDraggedRowKey(null);
  };

  return (
    <section className="min-h-[680px] rounded-xl border border-[#DCE5EF] bg-white px-4 pb-6 pt-4">
      <AlertError message={errorMessage} onClose={() => setErrorMessage("")} />
      <AlertSuccess message={successMessage} onClose={() => setSuccessMessage("")} />
      <ConfirmationPopup isOpen={journalToDelete !== null || draftRowToDelete !== null} message={draftRowToDelete !== null ? "Apakah Anda yakin ingin menghapus baris ini?" : "Apakah Anda yakin ingin menghapus jurnal koreksi ini?"} confirmText="Hapus" cancelText="Batal" onConfirm={draftRowToDelete !== null ? removeDraftRow : confirmDeleteJournal} onCancel={() => { setJournalToDelete(null); setDraftRowToDelete(null); }} />

      <div className="mb-3 flex justify-end"><AddDataButton onClick={openAddJournal} disabled={isLoading || isSaving} /></div>
      <div className="overflow-x-auto rounded-lg border border-[#DCE5EF]">
        <div className="min-w-[590px]">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_56px] items-center border-b border-[#DCE5EF] bg-[#F8FAFC] px-3 py-3">{["Nama Akun", "Nomor Akun", "Debet", "Kredit", "Aksi"].map((heading) => <div key={heading} className="text-center font-poppins text-[11px] font-semibold uppercase text-[#64748B]">{heading}</div>)}</div>
          {isLoading ? <div className="px-4 py-8 text-center font-poppins text-xs text-[#94A3B8]">Memuat data jurnal koreksi...</div> : journals.map((journal) => (
            <div key={journal.id}>
              {journal.rows.map((row, index) => <div key={`${journal.id}-${index}`} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_56px] items-center border-b border-[#EEF2F6] px-3 py-3"><div className={`px-1 font-poppins text-sm text-[#64748B] ${amountValue(row.credit) > 0 ? "pl-8" : ""}`}>{row.accountName}</div><div className="px-1 font-poppins text-sm text-[#64748B]">{row.accountNumber}</div><div className="px-1 font-poppins text-sm text-[#64748B]">Rp {formatAmount(row.debit)}</div><div className="px-1 font-poppins text-sm text-[#64748B]">Rp {formatAmount(row.credit)}</div><div /></div>)}
              {journal.description?.trim() && <div className="border-b border-[#EEF2F6] px-3 py-3 font-poppins text-sm italic text-[#64748B]"><span className="mr-2 text-[10px] font-semibold uppercase text-[#94A3B8]">Keterangan:</span>{journal.description.trim()}</div>}
              <div className="flex items-center justify-between border-b border-[#DCE5EF] px-3 py-3"><span className="font-poppins text-sm font-semibold text-[#334155]">Koreksi Atas</span><div className="mr-5 flex items-center gap-2"><button type="button" aria-label="Edit jurnal" disabled={isSaving} onClick={() => openEditJournal(journal)} className="rounded p-1 text-[#F59E0B] transition hover:bg-[#FFF7ED] disabled:opacity-40"><FilePenLine size={13} /></button><button type="button" aria-label="Hapus jurnal" disabled={isSaving} onClick={() => setJournalToDelete(journal.id)} className="rounded p-1 text-[#F87171] transition hover:bg-[#FEF2F2] disabled:opacity-40"><Trash2 size={13} /></button></div></div>
            </div>
          ))}
          {!isLoading && journals.length === 0 && <div className="px-4 py-8 text-center font-poppins text-xs text-[#94A3B8]">Belum ada jurnal koreksi.</div>}
        </div>
      </div>
      <div className="mt-5 flex justify-end"><SaveButton onClick={onSave} disabled={isLoading || isSaving} isSaving={isSaving} /></div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-transparent px-4 py-6" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <div className="pointer-events-none absolute inset-0 bg-black/40" aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-labelledby="jurnal-koreksi-modal-title" className="relative z-10 flex max-h-[calc(100vh-32px)] w-[min(900px,calc(100vw-32px))] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#38BDF8] px-6 py-6 text-white"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15"><FileText size={19} /></div><div><h2 id="jurnal-koreksi-modal-title" className="font-poppins text-lg font-semibold">{editingId !== null ? "Edit Jurnal Koreksi" : "Input Jurnal Koreksi"}</h2><p className="font-poppins text-[9px] text-white/80">Tambahkan detail jurnal koreksi pengujian audit</p></div></div><button type="button" aria-label="Tutup modal" onClick={closeModal} disabled={isSaving} className="rounded-md p-1 text-white/80 hover:bg-white/15 disabled:opacity-40"><X size={17} /></button></div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-[22px] pb-6 pt-5">
              <div className="overflow-x-auto"><div className="min-w-[700px]">
                <div className="grid grid-cols-[24px_1.3fr_1fr_1fr_1fr_80px] items-center rounded-t-md bg-[#F1F5F9] px-2 py-3"><div />{["Nama Akun", "Nomor Akun", "Debet", "Kredit"].map((heading) => <div key={heading} className="px-1 font-poppins text-[11px] font-semibold text-[#475569]">{heading}</div>)}<button type="button" onClick={() => setDraftRows((rows) => [...rows, createDraftRow()])} disabled={isSaving} className="rounded-md bg-[#10B981] px-2 py-1.5 font-poppins text-xs font-medium text-white disabled:opacity-40">+ Tambah</button></div>
                {draftRows.map((row, index) => (
                  <div key={row.rowKey} draggable={!isSaving} onDragStart={() => setDraggedRowKey(row.rowKey)} onDragOver={(event) => event.preventDefault()} onDrop={() => moveDraftRow(row.rowKey)} className="grid grid-cols-[24px_1.3fr_1fr_1fr_1fr_80px] items-center border-b border-[#EEF2F6] px-2 py-2.5">
                    <div className="flex cursor-grab items-center justify-center text-[#CBD5E1] active:cursor-grabbing"><GripVertical size={16} /></div>
                    <Dropdown options={coaOptions.map((option) => ({ value: String(option.value), label: option.label, accountNumber: option.accountNumber }))} value={String(row.coaId)} disabled={isSaving} searchable searchPlaceholder="Cari nama akun..." onChange={(value) => updateDraftRow(row.rowKey, "coaId", value)} placeholder="Pilih Akun" showCheck={false} className="mx-1 text-xs [&_button]:min-h-10 [&_button]:rounded-md [&_button]:px-2 [&_button]:text-xs" />
                    <input value={row.accountNumber} readOnly placeholder="Nomor Akun" className="ml-3 mr-1 h-10 min-w-0 rounded-md border border-[#DCE5EF] bg-[#F8FAFC] px-2 font-poppins text-sm text-[#94A3B8] outline-none" />
                    <input value={row.debit} inputMode="numeric" disabled={isSaving || amountValue(row.credit) > 0} onChange={(event) => updateDraftRow(row.rowKey, "debit", event.target.value)} placeholder="0" className="mx-1 h-10 min-w-0 rounded-md border border-[#DCE5EF] px-2 font-poppins text-sm text-[#0F172A] placeholder:text-[#CBD5E1] outline-none focus:border-[#38BDF8] disabled:bg-[#F1F5F9]" />
                    <input value={row.credit} inputMode="numeric" disabled={isSaving || amountValue(row.debit) > 0} onChange={(event) => updateDraftRow(row.rowKey, "credit", event.target.value)} placeholder="0" className="mx-1 h-10 min-w-0 rounded-md border border-[#DCE5EF] px-2 font-poppins text-sm text-[#0F172A] placeholder:text-[#CBD5E1] outline-none focus:border-[#38BDF8] disabled:bg-[#F1F5F9]" />
                    {draftRows.length > 2 ? <button type="button" aria-label={`Hapus baris ${index + 1}`} onClick={() => setDraftRowToDelete(row.rowKey)} className="mx-auto text-[#EF4444]"><Trash2 size={16} /></button> : <div />}
                  </div>
                ))}
              </div></div>
              <div className="mt-4"><label htmlFor="jurnal-description" className="mb-1.5 block font-poppins text-xs font-semibold text-[#475569]">Keterangan</label><div className="relative"><div className="pointer-events-none absolute left-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-[#F1F5F9] text-[#64748B]"><AlignLeft size={16} /></div><input id="jurnal-description" type="text" value={draftDescription} disabled={isSaving} onChange={(event) => setDraftDescription(event.target.value)} placeholder="Keterangan atas..." className="h-[50px] w-full rounded-lg border border-[#DCE5EF] pl-[58px] pr-3 font-poppins text-sm text-[#0F172A] placeholder:text-[#CBD5E1] outline-none focus:border-[#38BDF8] disabled:bg-[#F1F5F9]" /></div></div>
              <div className="mt-6 flex justify-end gap-2 border-t border-[#EEF2F6] pt-5"><button type="button" onClick={closeModal} disabled={isSaving} className="rounded-md bg-[#FF3030] px-6 py-2.5 font-poppins text-xs font-medium text-white disabled:opacity-40">Keluar</button><button type="button" onClick={saveDraftJournal} disabled={isSaving} className="rounded-md bg-[#00A51A] px-6 py-2.5 font-poppins text-xs font-medium text-white disabled:opacity-40">Simpan</button></div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
