"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlignLeft, FilePenLine, FileText, GripVertical, Trash2, X } from "lucide-react";
import { useParams } from "next/navigation";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import Dropdown from "@/components/ui/dropdown/dropdown";
import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import { getCoa } from "@/services/mahasiswa/tugas/audit/coa/coa";
import { getPiutang } from "@/services/mahasiswa/tugas/audit/piutang/piutang";
import {
  createJurnalKoreksiPiutang,
  deleteJurnalKoreksiPiutang,
  getJurnalKoreksiPiutang,
  updateJurnalKoreksiPiutang,
} from "@/services/mahasiswa/tugas/audit/piutang/jurnal_koreksi/jurnal_koreksi";

let nextClientJournalId = 0;
let nextClientRowKey = 0;

// Drag tidak dikunci lagi. Semua baris bisa dipindah, tapi tombol hapus tetap
// disembunyikan saat jumlah baris turun menjadi 2.
const LOCKED_ROW_COUNT = 0;

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
  rowKey: ++nextClientRowKey,
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
  const [draftRowKeyToDelete, setDraftRowKeyToDelete] = useState(null);
  const [draggingRowKey, setDraggingRowKey] = useState(null);
  const [dragGhost, setDragGhost] = useState(null);

  const rowRefs = useRef(new Map());
  const rowPositionsRef = useRef(new Map());
  const draggingRowKeyRef = useRef(null);
  const draftRowsRef = useRef(draftRows);
  const rowHeightRef = useRef(0);
  const pendingClientXRef = useRef(0);
  const pendingClientYRef = useRef(0);
  const dragRafIdRef = useRef(null);
  const autoScrollRafIdRef = useRef(null);
  const modalScrollRef = useRef(null);
  const dragGhostNodeRef = useRef(null);
  const grabOffsetXRef = useRef(0);
  const grabOffsetYRef = useRef(0);

  useEffect(() => {
    draggingRowKeyRef.current = draggingRowKey;
  }, [draggingRowKey]);

  useEffect(() => {
    draftRowsRef.current = draftRows;
  }, [draftRows]);

  // Animasi FLIP: geser baris yang tidak sedang di-drag secara halus ke posisi baru.
  // Dinonaktifkan selama ada baris yang sedang di-drag agar tidak berebut dengan reorder
  // (yang bisa membuat baris terlihat "melompat jauh lalu balik").
  useLayoutEffect(() => {
    const newPositions = new Map();

    draftRows.forEach((row) => {
      const node = rowRefs.current.get(row.rowKey);
      if (node) newPositions.set(row.rowKey, node.getBoundingClientRect().top);
    });

    if (draggingRowKeyRef.current === null) {
      draftRows.forEach((row) => {
        const node = rowRefs.current.get(row.rowKey);
        const oldTop = rowPositionsRef.current.get(row.rowKey);
        const newTop = newPositions.get(row.rowKey);

        if (!node || oldTop === undefined || newTop === undefined || oldTop === newTop) return;

        const deltaY = oldTop - newTop;
        node.style.transition = "none";
        node.style.transform = `translateY(${deltaY}px)`;

        requestAnimationFrame(() => {
          node.style.transition = "transform 200ms ease";
          node.style.transform = "";
        });
      });
    }

    rowPositionsRef.current = newPositions;
  }, [draftRows]);

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
        // COA per kasus jumlahnya kecil (mis. ~50), jadi cukup satu request dengan
        // per_page maksimum. Tidak perlu loop paginasi yang bisa memicu request
        // beruntun dan membuat tab terasa nge-hang saat pertama dibuka.
        const response = await getCoa({
          jwbKasusId,
          page: 1,
          perPage: 100,
        });

        if (!isMounted) return;

        const accounts = response.data ?? [];

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
      rowKey: ++nextClientRowKey,
      canRemove: rowIndex >= 2,
    })));
    setDraftDescription(journal.description ?? "");
    setEditingId(journal.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraftRowKeyToDelete(null);
    setDraggingRowKey(null);
    setDragGhost(null);
  };

  const updateDraftRow = (rowKey, key, value) => {
    setDraftRows((currentRows) => currentRows.map((row) => {
      if (row.rowKey !== rowKey) return row;

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

  // Isi kolom satu baris draft. Dipakai untuk baris normal di tabel maupun untuk
  // ghost floating saat baris tersebut sedang di-drag.
  const renderDraftRowFields = (row, rowIndex, { isGhost = false } = {}) => {
    const showDeleteButton = draftRows.length > 2 && !isGhost;

    return (
    <>
      <div
        role="button"
        tabIndex={-1}
        aria-label={`Pindahkan baris ${rowIndex + 1}`}
        onPointerDown={isGhost ? undefined : (event) => handleRowPointerDown(event, row.rowKey)}
        className={`-mx-2 -my-2.5 flex h-[42px] w-6 items-center justify-center text-[#CBD5E1] ${isGhost ? "cursor-grabbing" : "cursor-grab touch-none active:cursor-grabbing"}`}
      >
        <GripVertical size={16} />
      </div>
      <Dropdown
        options={coaOptions.map((account) => ({
          value: account.coaId,
          label: account.accountName,
        }))}
        value={row.coaId}
        disabled={isSaving || isGhost}
        onChange={(value) => updateDraftRow(row.rowKey, "coaId", value)}
        placeholder="Pilih Akun"
        showCheck={false}
        className="mx-1 text-xs [&_button]:min-h-10 [&_button]:rounded-md [&_button]:px-2 [&_button]:text-xs [&_svg]:h-3.5 [&_svg]:w-3.5"
      />
      <input value={row.accountNumber} readOnly placeholder="Nomor Akun" className="ml-3 mr-1 h-10 min-w-0 rounded-md border border-[#DCE5EF] bg-[#F8FAFC] px-2 font-poppins text-sm text-[#94A3B8] outline-none" />
      <div className="relative mx-1 min-w-0">
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-poppins text-sm text-[#94A3B8]">Rp</span>
        <input value={row.debit} inputMode="numeric" readOnly={isGhost} disabled={isSaving || hasAmount(row.credit)} onChange={isGhost ? undefined : (event) => updateDraftRow(row.rowKey, "debit", event.target.value)} placeholder="0" className="h-10 w-full min-w-0 rounded-md border border-[#DCE5EF] px-2 pl-8 font-poppins text-sm text-[#475569] outline-none focus:border-[#38BDF8] disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]" />
      </div>
      <div className="relative mx-1 min-w-0">
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-poppins text-sm text-[#94A3B8]">Rp</span>
        <input value={row.credit} inputMode="numeric" readOnly={isGhost} disabled={isSaving || hasAmount(row.debit)} onChange={isGhost ? undefined : (event) => updateDraftRow(row.rowKey, "credit", event.target.value)} placeholder="0" className="h-10 w-full min-w-0 rounded-md border border-[#DCE5EF] px-2 pl-8 font-poppins text-sm text-[#475569] outline-none focus:border-[#38BDF8] disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]" />
      </div>
      {showDeleteButton ? <button type="button" aria-label={`Hapus baris ${rowIndex + 1}`} disabled={isSaving} onClick={() => requestRemoveDraftRow(row.rowKey)} className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-[#EF4444] transition hover:bg-[#FEF2F2] disabled:opacity-40"><Trash2 size={16} /></button> : <div />}
    </>
    );
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

    const totalDebit = rows.reduce((sum, row) => sum + BigInt(toApiAmount(row.debit)), 0n);
    const totalCredit = rows.reduce((sum, row) => sum + BigInt(toApiAmount(row.credit)), 0n);

    if (totalDebit !== totalCredit) {
      return "Total Debet dan Kredit harus sama agar jurnal koreksi seimbang.";
    }

    return null;
  };

  const applyPendingDragMove = (rowKey) => {
    dragRafIdRef.current = null;

    // Ghost mengambang (dirender lewat portal ke <body>) di-posisikan langsung via mutasi
    // style, bukan re-render React, supaya gerakan tetap mulus dan tidak ter-clip oleh
    // container manapun yang punya overflow, walau digeser jauh keluar area tabel.
    const ghostNode = dragGhostNodeRef.current;
    if (ghostNode) {
      const nextLeft = pendingClientXRef.current - grabOffsetXRef.current;
      const nextTop = pendingClientYRef.current - grabOffsetYRef.current;
      ghostNode.style.left = `${nextLeft}px`;
      ghostNode.style.top = `${nextTop}px`;
    }

    // Acuan penempatan adalah TITIK TENGAH baris yang sedang di-drag (ghost), bukan posisi
    // pointer mentah. Kalau pakai pointer, saat baris digenggam di bagian bawah, tepi atas
    // ghost berada jauh di atas pointer sehingga penanda drop terasa "telat". Dengan memakai
    // pusat ghost, penanda drop selalu selaras dengan posisi visual baris yang diseret.
    const currentRows = draftRowsRef.current;
    const ghostTop = pendingClientYRef.current - grabOffsetYRef.current;
    const ghostCenterY = ghostTop + (rowHeightRef.current || 0) / 2;
    let targetIndex = currentRows.length - 1;

    for (let i = 0; i < currentRows.length; i += 1) {
      const node = rowRefs.current.get(currentRows[i].rowKey);
      if (!node) continue;

      const bounds = node.getBoundingClientRect();
      const midpoint = bounds.top + bounds.height / 2;

      if (ghostCenterY < midpoint) {
        targetIndex = i;
        break;
      }
    }

    // Baris terkunci (index < LOCKED_ROW_COUNT) tidak boleh menjadi tujuan.
    targetIndex = Math.max(targetIndex, LOCKED_ROW_COUNT);

    setDraftRows((rows) => {
      const currentIndex = rows.findIndex((row) => row.rowKey === rowKey);
      if (currentIndex === -1 || currentIndex < LOCKED_ROW_COUNT) return rows;

      const clampedTarget = Math.min(Math.max(targetIndex, LOCKED_ROW_COUNT), rows.length - 1);
      if (currentIndex === clampedTarget) return rows;

      const nextRows = [...rows];
      const [movedRow] = nextRows.splice(currentIndex, 1);
      nextRows.splice(clampedTarget, 0, movedRow);
      return nextRows;
    });
  };

  // Auto-scroll modal saat baris di-drag mendekati tepi atas/bawah area yang bisa di-scroll,
  // supaya gerakan drag tidak terasa terbatas oleh viewport modal.
  const runAutoScroll = () => {
    const container = modalScrollRef.current;

    if (!container || draggingRowKeyRef.current === null) {
      autoScrollRafIdRef.current = null;
      return;
    }

    const bounds = container.getBoundingClientRect();
    const edgeSize = 56;
    const maxSpeed = 16;
    const pointerY = pendingClientYRef.current;

    let scrollDelta = 0;

    if (pointerY < bounds.top + edgeSize) {
      const proximity = Math.max(0, bounds.top + edgeSize - pointerY);
      scrollDelta = -Math.min(maxSpeed, proximity / 2);
    } else if (pointerY > bounds.bottom - edgeSize) {
      const proximity = Math.max(0, pointerY - (bounds.bottom - edgeSize));
      scrollDelta = Math.min(maxSpeed, proximity / 2);
    }

    if (scrollDelta !== 0) {
      container.scrollTop += scrollDelta;
      // Setelah scroll, hitung ulang posisi baris & target dari posisi pointer terkini.
      if (dragRafIdRef.current === null && draggingRowKeyRef.current !== null) {
        const rowKey = draggingRowKeyRef.current;
        dragRafIdRef.current = requestAnimationFrame(() => applyPendingDragMove(rowKey));
      }
    }

    autoScrollRafIdRef.current = requestAnimationFrame(runAutoScroll);
  };

  const handleRowPointerDown = (event, rowKey) => {
    if (isSaving) return;

    const startIndex = draftRowsRef.current.findIndex((row) => row.rowKey === rowKey);
    if (startIndex < LOCKED_ROW_COUNT) return;

    const node = rowRefs.current.get(rowKey);
    if (!node) return;

    event.preventDefault();
    const rowBounds = node.getBoundingClientRect();
    rowHeightRef.current = rowBounds.height;
    pendingClientXRef.current = event.clientX;
    pendingClientYRef.current = event.clientY;
    grabOffsetXRef.current = event.clientX - rowBounds.left;
    grabOffsetYRef.current = event.clientY - rowBounds.top;

    // Ghost adalah salinan visual baris, dirender lewat portal langsung ke <body> dengan
    // position: fixed, sehingga tidak lagi terikat/ter-clip oleh container overflow manapun,
    // walau di-drag jauh keluar area tabel yang terlihat.
    setDragGhost({
      left: rowBounds.left,
      top: rowBounds.top,
      width: rowBounds.width,
      height: rowBounds.height,
    });
    setDraggingRowKey(rowKey);
  };

  // Drag ditangani lewat listener global di window (bukan hanya elemen grip),
  // supaya gerakan pointer tetap terikuti secara bebas ke seluruh arah tanpa macet
  // meskipun pointer sempat keluar dari area kecil grip atau bergerak sangat cepat.
  useEffect(() => {
    if (draggingRowKey === null) return undefined;

    const rowKey = draggingRowKey;

    const handleWindowPointerMove = (event) => {
      pendingClientXRef.current = event.clientX;
      pendingClientYRef.current = event.clientY;

      if (dragRafIdRef.current === null) {
        dragRafIdRef.current = requestAnimationFrame(() => applyPendingDragMove(rowKey));
      }
    };

    const handleWindowPointerUp = () => {
      if (dragRafIdRef.current !== null) {
        cancelAnimationFrame(dragRafIdRef.current);
        dragRafIdRef.current = null;
      }

      if (autoScrollRafIdRef.current !== null) {
        cancelAnimationFrame(autoScrollRafIdRef.current);
        autoScrollRafIdRef.current = null;
      }

      setDraggingRowKey(null);
      setDragGhost(null);
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);

    if (autoScrollRafIdRef.current === null) {
      autoScrollRafIdRef.current = requestAnimationFrame(runAutoScroll);
    }

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingRowKey]);

  const removeDraftRow = (rowKey) => {
    setDraftRows((currentRows) => currentRows.filter((row) => row.rowKey !== rowKey));
    setDraftRowKeyToDelete(null);
    setSuccessMessage("Baris jurnal koreksi berhasil dihapus.");
  };

  const requestRemoveDraftRow = (rowKey) => {
    if (editingId !== null) {
      setDraftRowKeyToDelete(rowKey);
      return;
    }

    removeDraftRow(rowKey);
  };

  const saveDraftJournal = () => {
    const validationError = validateJournalRows(draftRows);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const rows = draftRows.map(({ canRemove, rowKey, ...row }) => ({
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
        isOpen={journalToDelete !== null || (editingId !== null && draftRowKeyToDelete !== null)}
        message={draftRowKeyToDelete !== null
          ? "Apakah Anda yakin ingin menghapus baris ini?"
          : "Apakah Anda yakin ingin menghapus jurnal koreksi ini?"}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={draftRowKeyToDelete !== null ? () => removeDraftRow(draftRowKeyToDelete) : confirmRemoveJournal}
        onCancel={() => {
          setJournalToDelete(null);
          setDraftRowKeyToDelete(null);
        }}
      />

      <div className="mb-3 flex justify-end">
        <AddDataButton onClick={openAddJournal} disabled={isLoading || isSaving || coaOptions.length === 0} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#DCE5EF]">
        <div className="min-w-[590px]">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_56px] items-center border-b border-[#DCE5EF] bg-[#F8FAFC] px-3 py-3">
            {["Nama Akun", "Nomor Akun", "Debet", "Kredit", "Aksi"].map((heading) => <div key={heading} className="text-center font-poppins text-[11px] font-semibold uppercase text-[#64748B]">{heading}</div>)}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_56px] px-3 py-8">
              <div className="col-span-5 text-center font-poppins text-xs text-[#94A3B8]">Memuat data jurnal koreksi...</div>
            </div>
          ) : journals.map((journal) => (
            <div key={journal.id}>
              {journal.rows.map((row, rowIndex) => (
                <div key={`${journal.id}-${rowIndex}`} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_56px] items-center border-b border-[#EEF2F6] px-3 py-3 last:border-b-0">
                  <div className={`px-1 font-poppins text-sm text-[#64748B] ${hasAmount(row.credit) ? "pl-8" : ""}`}>{row.accountName}</div>
                  <div className="px-1 font-poppins text-sm text-[#64748B]">{row.accountNumber}</div>
                  <div className="px-1 font-poppins text-sm text-[#64748B]">Rp {formatAmount(row.debit)}</div>
                  <div className="px-1 font-poppins text-sm text-[#64748B]">Rp {formatAmount(row.credit)}</div>
                  <div />
                </div>
              ))}
              {journal.description?.trim() && (
                <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_56px] items-center border-b border-[#EEF2F6] px-3 py-3">
                  <div className="col-span-5 px-1">
                    <span className="mr-2 font-poppins text-[10px] font-semibold italic uppercase text-[#94A3B8]">Keterangan:</span>
                    <span className="font-poppins text-sm italic text-[#64748B]">{journal.description.trim()}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-[#DCE5EF] px-3 py-3">
                <span className="font-poppins text-sm font-semibold text-[#334155]">Koreksi Atas</span>
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
        <SaveButton onClick={saveJournals} disabled={isLoading || isSaving || coaOptions.length === 0} isSaving={isSaving} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-transparent px-4 py-6" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <div className="pointer-events-none absolute inset-0 bg-black/40" aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="jurnal-koreksi-modal-title"
            className="relative z-10 flex max-h-[calc(100vh-32px)] w-[min(900px,calc(100vw-32px))] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          >
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

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-[22px] pb-6 pt-5">
              <div className="overflow-x-auto">
                <div className="min-w-0">
                  <div className="grid grid-cols-[24px_1.3fr_1fr_1fr_1fr_80px] items-center rounded-t-md bg-[#F1F5F9] px-2 py-3">
                    <div />
                    {["Nama Akun", "Nomor Akun", "Debet", "Kredit"].map((heading) => <div key={heading} className="px-1 font-poppins text-[11px] font-semibold text-[#475569]">{heading}</div>)}
                    <button type="button" onClick={addDraftRow} disabled={isSaving} className="flex w-full items-center justify-center gap-1 rounded-md bg-[#10B981] px-2 py-1.5 font-poppins text-xs font-medium text-white transition hover:bg-[#059669] disabled:opacity-40"><span aria-hidden="true">+</span>Tambah</button>
                  </div>

                  <div
                    ref={modalScrollRef}
                    style={{ maxHeight: 340 }}
                    className="overflow-y-auto"
                  >
                  {draftRows.map((row, rowIndex) => {
                    const isDragging = draggingRowKey === row.rowKey;

                    // Saat baris sedang di-drag, slot aslinya di dalam tabel dikosongkan
                    // (placeholder setinggi baris) karena tampilannya dipindah ke ghost
                    // yang dirender lewat portal ke <body>. Ini mencegah baris "hilang"
                    // ketika digeser keluar area tabel yang punya overflow.
                    if (isDragging) {
                      return (
                        <div
                          key={row.rowKey}
                          ref={(node) => {
                            if (node) rowRefs.current.set(row.rowKey, node);
                            else rowRefs.current.delete(row.rowKey);
                          }}
                          style={{ height: rowHeightRef.current || undefined }}
                          className="rounded-md border-b border-dashed border-[#93C5FD] bg-[#EFF6FF]"
                        />
                      );
                    }

                    return (
                      <div
                        key={row.rowKey}
                        ref={(node) => {
                          if (node) rowRefs.current.set(row.rowKey, node);
                          else rowRefs.current.delete(row.rowKey);
                        }}
                        className="relative grid grid-cols-[24px_1.3fr_1fr_1fr_1fr_80px] items-center border-b border-[#EEF2F6] px-2 py-2.5"
                      >
                        {renderDraftRowFields(row, rowIndex)}
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>

              {dragGhost && draggingRowKey !== null && createPortal(
                <div
                  ref={dragGhostNodeRef}
                  style={{
                    position: "fixed",
                    left: dragGhost.left,
                    top: dragGhost.top,
                    width: dragGhost.width,
                    height: dragGhost.height,
                  }}
                  className="pointer-events-none z-[300] grid grid-cols-[24px_1.3fr_1fr_1fr_1fr_80px] items-center rounded-md border border-[#38BDF8] bg-[#F0F9FF] px-2 py-2.5 shadow-lg"
                >
                  {(() => {
                    const draggedRow = draftRows.find((row) => row.rowKey === draggingRowKey);
                    if (!draggedRow) return null;
                    const draggedIndex = draftRows.findIndex((row) => row.rowKey === draggingRowKey);
                    return renderDraftRowFields(draggedRow, draggedIndex, { isGhost: true });
                  })()}
                </div>,
                document.body
              )}

              <div className="mt-4">
                <label htmlFor="jurnal-description" className="mb-1.5 block font-poppins text-xs font-semibold text-[#475569]">Keterangan</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-[#F1F5F9] text-[#64748B] leading-none"><AlignLeft size={16} className="shrink-0" /></div>
                  <input id="jurnal-description" type="text" value={draftDescription} disabled={isSaving} onChange={(event) => setDraftDescription(event.target.value)} placeholder="Keterangan atas..." className="h-[50px] w-full rounded-lg border border-[#DCE5EF] pb-1 pl-[58px] pr-3 font-poppins text-sm text-[#475569] outline-none focus:border-[#38BDF8] disabled:bg-[#F1F5F9]" />
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
