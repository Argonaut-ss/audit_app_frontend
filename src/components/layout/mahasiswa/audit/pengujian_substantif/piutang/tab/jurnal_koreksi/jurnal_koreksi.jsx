"use client";

import { useEffect, useState } from "react";
import { AlignLeft, FilePenLine, FileText, GripVertical, Plus, Trash2, X } from "lucide-react";
import { useParams } from "next/navigation";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import { getCoa } from "@/services/mahasiswa/tugas/audit/coa/coa";
import { getPiutang } from "@/services/mahasiswa/tugas/audit/piutang/piutang";
import {
  createJurnalKoreksiPiutang,
  deleteJurnalKoreksiPiutang,
  getJurnalKoreksiPiutang,
  updateJurnalKoreksiPiutang,
} from "@/services/mahasiswa/tugas/audit/piutang/jurnal_koreksi/jurnal_koreksi";

let nextClientJournalId = 0;

const formatAmount = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "") || "0";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatInputAmount = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? formatAmount(digits) : "";
};

const toApiAmount = (value) => String(value ?? "").replace(/\D/g, "") || "0";

const hasAmount = (value) => BigInt(toApiAmount(value)) > 0n;

const createDraftRow = (canRemove = false) => ({
  coaId: "",
  accountName: "",
  accountNumber: "",
  debit: "",
  credit: "",
  canRemove,
});

const normalizeJournal = (item) => ({
  id: item.JurnalKoreksiID,
  description: item.Keterangan ?? "",
  rows: (item.pembayaran ?? []).map((payment) => ({
    coaId: String(payment.COAID ?? ""),
    accountName: payment.coa?.NamaAkun ?? "",
    accountNumber: payment.coa?.NoAkun ?? "",
    debit: formatInputAmount(payment.Debet),
    credit: formatInputAmount(payment.Kredit),
  })),
});

const isPersistedJournal = (journal) => Number.isInteger(journal.id);

export default function JurnalKoreksi() {
  const params = useParams();
  const jwbKasusId = params?.id;

  const [index] = useState("B.10");
  const [piutangId, setPiutangId] = useState(null);
  const [journals, setJournals] = useState([]);
  const [coaOptions, setCoaOptions] = useState([]);
  const [deletedJournalIds, setDeletedJournalIds] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(jwbKasusId));
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftRows, setDraftRows] = useState([createDraftRow(), createDraftRow()]);
  const [draftDescription, setDraftDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [journalToDelete, setJournalToDelete] = useState(null);
  const [draftRowToDelete, setDraftRowToDelete] = useState(null);
  const [draggedRowIndex, setDraggedRowIndex] = useState(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState(null);

  useEffect(() => {
    if (!jwbKasusId) {
      setIsLoading(false);
      setErrorMessage("JwbKasus ID tidak tersedia.");
      return undefined;
    }

    let isMounted = true;

    getPiutang(jwbKasusId)
      .then((data) => {
        if (!isMounted) return;

        const resolvedPiutangId = data?.PiutangID ?? null;
        setPiutangId(resolvedPiutangId);

        if (!resolvedPiutangId) {
          setErrorMessage("Data piutang tidak tersedia.");
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setErrorMessage("Data piutang gagal dimuat.");
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [jwbKasusId]);

  useEffect(() => {
    if (!piutangId) return undefined;

    let isMounted = true;

    getJurnalKoreksiPiutang(piutangId)
      .then((items) => {
        if (!isMounted) return;
        setJournals(items.map(normalizeJournal));
        setDeletedJournalIds([]);
      })
      .catch(() => {
        if (isMounted) setErrorMessage("Data jurnal koreksi gagal dimuat.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [piutangId]);

  useEffect(() => {
    if (!jwbKasusId) return undefined;

    let isMounted = true;

    const loadCoaOptions = async () => {
      try {
        let page = 1;
        let lastPage = 1;
        const accounts = [];

        while (page <= lastPage) {
          const response = await getCoa({
            jwbKasusId,
            page,
            perPage: 100,
          });

          accounts.push(...(response.data ?? []));
          lastPage = response.meta?.last_page ?? 1;
          page += 1;
        }

        if (!isMounted) return;

        setCoaOptions(accounts.map((account) => ({
          coaId: String(account.COAID),
          accountNumber: account.NoAkun ?? "",
          accountName: account.NamaAkun ?? "",
        })));
      } catch {
        if (isMounted) setErrorMessage("Daftar COA gagal dimuat.");
      }
    };

    loadCoaOptions();

    return () => {
      isMounted = false;
    };
  }, [jwbKasusId]);

  const openAddJournal = () => {
    setErrorMessage("");
    setDraftRows([createDraftRow(), createDraftRow()]);
    setDraftDescription("");
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditJournal = (journal) => {
    setErrorMessage("");
    setDraftRows(journal.rows.map((row, rowIndex) => ({
      ...row,
      canRemove: rowIndex >= 2,
    })));
    setDraftDescription(journal.description ?? "");
    setEditingId(journal.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraftRowToDelete(null);
    setDraggedRowIndex(null);
  };

  const updateDraftRow = (rowIndex, key, value) => {
    setDraftRows((currentRows) => currentRows.map((row, currentRowIndex) => {
      if (currentRowIndex !== rowIndex) return row;

      if (key === "debit" || key === "credit") {
        return { ...row, [key]: formatInputAmount(value) };
      }

      if (key !== "coaId") {
        return { ...row, [key]: value };
      }

      const account = coaOptions.find((option) => option.coaId === value);
      return {
        ...row,
        coaId: value,
        accountName: account?.accountName ?? "",
        accountNumber: account?.accountNumber ?? "",
      };
    }));
  };

  const addDraftRow = () => {
    setDraftRows((currentRows) => [...currentRows, createDraftRow(true)]);
  };

  const validateJournalRows = (rows) => {
    if (rows.length === 0) {
      return "Tambahkan minimal satu baris jurnal koreksi.";
    }

    if (rows.some((row) => !row.coaId)) {
      return "Pilih akun COA untuk setiap baris jurnal koreksi.";
    }

    if (rows.some((row) => {
      const debitFilled = hasAmount(row.debit);
      const creditFilled = hasAmount(row.credit);
      return debitFilled === creditFilled;
    })) {
      return "Setiap baris harus memiliki salah satu nilai Debet atau Kredit yang lebih dari nol.";
    }

    return null;
  };

  const handleDraftRowDragStart = (event, rowIndex) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(rowIndex));
    setDraggedRowIndex(rowIndex);
    setDragOverRowIndex(null);
  };

  const handleDraftRowDrop = (event, targetRowIndex) => {
    event.preventDefault();
    const sourceRowIndex = draggedRowIndex ?? Number(event.dataTransfer.getData("text/plain"));
    const rowBounds = event.currentTarget.getBoundingClientRect();
    const dropAfterTarget = event.clientY > rowBounds.top + (rowBounds.height / 2);
    const requestedIndex = targetRowIndex + (dropAfterTarget ? 1 : 0);

    if (!Number.isInteger(sourceRowIndex) || sourceRowIndex === requestedIndex || sourceRowIndex + 1 === requestedIndex) {
      setDraggedRowIndex(null);
      setDragOverRowIndex(null);
      return;
    }

    setDraftRows((currentRows) => {
      if (sourceRowIndex < 0 || sourceRowIndex >= currentRows.length) return currentRows;

      const reorderedRows = [...currentRows];
      const [movedRow] = reorderedRows.splice(sourceRowIndex, 1);
      const insertionIndex = sourceRowIndex < requestedIndex ? requestedIndex - 1 : requestedIndex;
      reorderedRows.splice(insertionIndex, 0, movedRow);
      return reorderedRows;
    });
    setDraggedRowIndex(null);
    setDragOverRowIndex(null);
  };

  const removeDraftRow = (rowIndex) => {
    setDraftRows((currentRows) => currentRows.filter((_, currentRowIndex) => currentRowIndex !== rowIndex));
    setDraftRowToDelete(null);
    setSuccessMessage("Baris jurnal koreksi berhasil dihapus.");
  };

  const requestRemoveDraftRow = (rowIndex) => {
    if (editingId !== null) {
      setDraftRowToDelete(rowIndex);
      return;
    }

    removeDraftRow(rowIndex);
  };

  const saveDraftJournal = () => {
    const validationError = validateJournalRows(draftRows);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const rows = draftRows.map(({ canRemove, ...row }) => ({
      ...row,
      debit: formatInputAmount(row.debit),
      credit: formatInputAmount(row.credit),
    }));
    const isEditing = editingId !== null;

    setJournals((currentJournals) => {
      if (isEditing) {
        return currentJournals.map((journal) => (
          journal.id === editingId
            ? { ...journal, rows, description: draftDescription }
            : journal
        ));
      }

      return [
        ...currentJournals,
        {
          id: `new-${++nextClientJournalId}`,
          rows,
          description: draftDescription,
        },
      ];
    });

    closeModal();
    setSuccessMessage(isEditing ? "Jurnal koreksi diperbarui di daftar." : "Jurnal koreksi ditambahkan ke daftar.");
  };

  const confirmRemoveJournal = () => {
    const journal = journals.find((item) => item.id === journalToDelete);

    if (journal && isPersistedJournal(journal)) {
      setDeletedJournalIds((currentIds) => [...new Set([...currentIds, journal.id])]);
    }

    setJournals((currentJournals) => currentJournals.filter((journal) => journal.id !== journalToDelete));
    setJournalToDelete(null);
    setSuccessMessage("Jurnal koreksi dihapus dari daftar. Tekan Simpan untuk menerapkan perubahan.");
  };

  const toPayload = (journal) => ({
    Keterangan: journal.description.trim() || null,
    pembayaran: journal.rows.map((row) => ({
      COAID: Number(row.coaId),
      Debet: toApiAmount(row.debit),
      Kredit: toApiAmount(row.credit),
    })),
  });

  const saveJournals = async () => {
    if (!piutangId) {
      setErrorMessage("Piutang belum tersedia untuk disimpan.");
      return;
    }

    for (const journal of journals) {
      const validationError = validateJournalRows(journal.rows);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }
    }

    if (journals.length === 0 && deletedJournalIds.length === 0) {
      setErrorMessage("Tambahkan minimal satu jurnal koreksi terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await Promise.all(
        deletedJournalIds.map((journalId) => deleteJurnalKoreksiPiutang(piutangId, journalId))
      );

      const savedJournals = await Promise.all(
        journals.map((journal) => {
          const payload = toPayload(journal);

          return isPersistedJournal(journal)
            ? updateJurnalKoreksiPiutang(piutangId, journal.id, payload)
            : createJurnalKoreksiPiutang(piutangId, payload);
        })
      );

      setJournals(savedJournals.map(normalizeJournal));
      setDeletedJournalIds([]);
      setSuccessMessage("Jurnal koreksi berhasil disimpan.");
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? error.message ?? "Jurnal koreksi gagal disimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="min-h-[680px] rounded-xl border border-[#DCE5EF] bg-white px-4 pb-6 pt-4">
      <AlertError message={errorMessage} onClose={() => setErrorMessage("")} />
      <AlertSuccess message={successMessage} onClose={() => setSuccessMessage("")} />
      <ConfirmationPopup
        isOpen={journalToDelete !== null || (editingId !== null && draftRowToDelete !== null)}
        message={draftRowToDelete !== null
          ? "Apakah Anda yakin ingin menghapus baris ini?"
          : "Apakah Anda yakin ingin menghapus jurnal koreksi ini?"}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={draftRowToDelete !== null ? () => removeDraftRow(draftRowToDelete) : confirmRemoveJournal}
        onCancel={() => {
          setJournalToDelete(null);
          setDraftRowToDelete(null);
        }}
      />

      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <label htmlFor="jurnal-index" className="mb-1.5 block font-poppins text-xs font-semibold text-[#475569]">Index</label>
          <div className="relative w-[155px]">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">♙</span>
            <input id="jurnal-index" value={index} readOnly className="h-9 w-full rounded-md border border-[#DCE5EF] bg-[#F8FAFC] pl-7 pr-2 font-poppins text-xs text-[#64748B] outline-none" />
          </div>
        </div>
        <button type="button" onClick={openAddJournal} disabled={isLoading || isSaving || coaOptions.length === 0} className="flex h-9 items-center gap-2 rounded-md bg-[#38BDF8] px-4 font-poppins text-xs font-medium text-white transition hover:bg-[#159BD7] disabled:cursor-not-allowed disabled:opacity-60"><Plus size={14} />Tambah Data</button>
      </div>

      {isLoading && (
        <div className="mb-3 rounded-lg bg-[#F8FAFC] px-4 py-3 font-poppins text-xs text-[#64748B]">Memuat data jurnal koreksi...</div>
      )}

      <div className="overflow-x-auto rounded-lg border border-[#DCE5EF]">
        <div className="min-w-[590px]">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_56px] items-center border-b border-[#DCE5EF] bg-[#F8FAFC] px-3 py-3">
            {["Nama Akun", "Nomor Akun", "Debet", "Kredit", "Aksi"].map((heading) => <div key={heading} className="font-poppins text-[11px] font-semibold uppercase text-[#64748B]">{heading}</div>)}
          </div>

          {journals.map((journal) => (
            <div key={journal.id}>
              {journal.rows.map((row, rowIndex) => (
                <div key={`${journal.id}-${rowIndex}`} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_56px] items-center border-b border-[#EEF2F6] px-3 py-2 last:border-b-0">
                  <div className="px-1 font-poppins text-xs text-[#64748B]">{row.accountName}</div>
                  <div className="px-1 font-poppins text-xs text-[#64748B]">{row.accountNumber}</div>
                  <div className="px-1 font-poppins text-xs text-[#64748B]">Rp {formatAmount(row.debit)}</div>
                  <div className="px-1 font-poppins text-xs text-[#64748B]">Rp {formatAmount(row.credit)}</div>
                  <div />
                </div>
              ))}
              <div className="flex items-center justify-between border-b border-[#DCE5EF] px-3 py-2.5">
                <span className="font-poppins text-xs font-semibold text-[#334155]">{journal.description || "Koreksi Atas"}</span>
                <div className="mr-5 flex items-center gap-2">
                  <button type="button" aria-label="Edit jurnal" disabled={isSaving} onClick={() => openEditJournal(journal)} className="rounded p-1 text-[#F59E0B] transition hover:bg-[#FFF7ED] disabled:opacity-40"><FilePenLine size={13} /></button>
                  <button type="button" aria-label="Hapus jurnal" disabled={isSaving} onClick={() => setJournalToDelete(journal.id)} className="rounded p-1 text-[#F87171] transition hover:bg-[#FEF2F2] disabled:opacity-40"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && journals.length === 0 && (
            <div className="px-4 py-8 text-center font-poppins text-xs text-[#94A3B8]">Belum ada jurnal koreksi.</div>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button type="button" onClick={saveJournals} disabled={isLoading || isSaving || coaOptions.length === 0} className="rounded-md bg-[#00A51A] px-6 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#008C16] disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "Menyimpan..." : "Simpan"}</button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-transparent px-4 py-6" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <div className="pointer-events-none absolute inset-0 bg-black/40" aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-labelledby="jurnal-koreksi-modal-title" className="relative z-10 max-h-[calc(100vh-32px)] w-[min(900px,calc(100vw-32px))] overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#38BDF8] px-6 py-6 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15"><FileText size={19} /></div>
                <div>
                  <h2 id="jurnal-koreksi-modal-title" className="font-poppins text-lg font-semibold leading-tight">{editingId !== null ? "Edit Jurnal Koreksi" : "Input Jurnal Koreksi"}</h2>
                  <p className="font-poppins text-[9px] leading-tight text-white/80">{editingId !== null ? "Perbarui detail jurnal koreksi pengujian audit" : "Tambahkan detail jurnal koreksi pengujian audit"}</p>
                </div>
              </div>
              <button type="button" aria-label="Tutup modal" onClick={closeModal} disabled={isSaving} className="rounded-md p-1 text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-40"><X size={17} /></button>
            </div>

            <div className="px-[22px] pb-6 pt-5">
              <div className="overflow-x-auto">
                <div className="min-w-0">
                  <div className="grid grid-cols-[24px_1.3fr_1fr_1fr_1fr_80px] items-center rounded-t-md bg-[#F1F5F9] px-2 py-3">
                    <div />
                    {["Nama Akun", "Nomor Akun", "Debet", "Kredit"].map((heading) => <div key={heading} className="px-1 font-poppins text-[11px] font-semibold text-[#475569]">{heading}</div>)}
                    <button type="button" onClick={addDraftRow} disabled={isSaving} className="flex w-full items-center justify-center gap-1 rounded-md bg-[#10B981] px-2 py-1.5 font-poppins text-xs font-medium text-white transition hover:bg-[#059669] disabled:opacity-40"><span aria-hidden="true">+</span>Tambah</button>
                  </div>

                  {draftRows.map((row, rowIndex) => (
                    <div
                      key={`draft-${rowIndex}`}
                      draggable={!isSaving}
                      onDragStart={(event) => handleDraftRowDragStart(event, rowIndex)}
                      onDragEnter={() => {
                        if (draggedRowIndex !== null && draggedRowIndex !== rowIndex) setDragOverRowIndex(rowIndex);
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleDraftRowDrop(event, rowIndex)}
                      onDragEnd={() => {
                        setDraggedRowIndex(null);
                        setDragOverRowIndex(null);
                      }}
                      className={`grid grid-cols-[24px_1.3fr_1fr_1fr_1fr_80px] items-center border-b border-[#EEF2F6] px-2 py-2.5 transition-[transform,background-color,opacity] duration-200 ease-out ${draggedRowIndex === rowIndex ? "scale-[0.99] bg-[#F0F9FF] opacity-60" : ""} ${dragOverRowIndex === rowIndex ? "bg-[#E0F2FE]" : ""}`}
                    >
                      <div aria-label={`Pindahkan baris ${rowIndex + 1}`} className="cursor-grab touch-none text-[#CBD5E1] active:cursor-grabbing"><GripVertical size={14} /></div>
                      <select value={row.coaId} disabled={isSaving} onChange={(event) => updateDraftRow(rowIndex, "coaId", event.target.value)} className="mx-1 h-10 min-w-0 rounded-md border border-[#DCE5EF] bg-white px-2 font-poppins text-xs text-[#64748B] outline-none focus:border-[#38BDF8] disabled:opacity-60">
                        <option value="">Pilih Akun</option>
                        {coaOptions.map((account) => <option key={account.coaId} value={account.coaId}>{account.accountNumber ? `${account.accountNumber} - ${account.accountName}` : account.accountName}</option>)}
                      </select>
                      <input value={row.accountNumber} readOnly placeholder="Nomor Akun" className="mx-1 h-10 min-w-0 rounded-md border border-[#DCE5EF] bg-[#F8FAFC] px-2 font-poppins text-xs text-[#94A3B8] outline-none" />
                      <div className="relative mx-1 min-w-0">
                        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-poppins text-[10px] text-[#94A3B8]">Rp</span>
                        <input value={row.debit} inputMode="numeric" disabled={isSaving || hasAmount(row.credit)} onChange={(event) => updateDraftRow(rowIndex, "debit", event.target.value)} placeholder="0" className="h-10 w-full min-w-0 rounded-md border border-[#DCE5EF] px-2 pl-8 font-poppins text-xs text-[#475569] outline-none focus:border-[#38BDF8] disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]" />
                      </div>
                      <div className="relative mx-1 min-w-0">
                        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-poppins text-[10px] text-[#94A3B8]">Rp</span>
                        <input value={row.credit} inputMode="numeric" disabled={isSaving || hasAmount(row.debit)} onChange={(event) => updateDraftRow(rowIndex, "credit", event.target.value)} placeholder="0" className="h-10 w-full min-w-0 rounded-md border border-[#DCE5EF] px-2 pl-8 font-poppins text-xs text-[#475569] outline-none focus:border-[#38BDF8] disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]" />
                      </div>
                      {row.canRemove ? <button type="button" aria-label={`Hapus baris ${rowIndex + 1}`} disabled={isSaving} onClick={() => requestRemoveDraftRow(rowIndex)} className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-[#EF4444] transition hover:bg-[#FEF2F2] disabled:opacity-40"><Trash2 size={16} /></button> : <div />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="jurnal-description" className="mb-1.5 block font-poppins text-xs font-semibold text-[#475569]">Keterangan</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-[#F1F5F9] text-[#64748B] leading-none"><AlignLeft size={16} className="shrink-0" /></div>
                  <input id="jurnal-description" type="text" value={draftDescription} disabled={isSaving} onChange={(event) => setDraftDescription(event.target.value)} placeholder="Keterangan atas..." className="h-[50px] w-full rounded-lg border border-[#DCE5EF] pb-1 pl-[58px] pr-3 font-poppins text-xs text-[#475569] outline-none focus:border-[#38BDF8] disabled:bg-[#F1F5F9]" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-[#EEF2F6] pt-5">
                <button type="button" onClick={closeModal} disabled={isSaving} className="rounded-md bg-[#FF3030] px-6 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#E11D1D] disabled:opacity-40">Keluar</button>
                <button type="button" onClick={saveDraftJournal} disabled={isSaving} className="rounded-md bg-[#00A51A] px-6 py-2.5 font-poppins text-xs font-medium text-white transition hover:bg-[#008C16] disabled:opacity-40">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
