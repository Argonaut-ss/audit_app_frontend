"use client";

import { useEffect, useState } from "react";

import JurnalKoreksiTable from "@/components/pengujian_substantif/jurnal_koreksi/JurnalKoreksiTable";
import { getCoa } from "@/services/mahasiswa/tugas/audit/coa/coa";
import { getUtangUsaha } from "@/services/mahasiswa/tugas/audit/utang_usaha/utang_usaha";
import {
  createJurnalKoreksiUtangUsaha,
  deleteJurnalKoreksiUtangUsaha,
  getJurnalKoreksiUtangUsaha,
  updateJurnalKoreksiUtangUsaha,
} from "@/services/mahasiswa/tugas/audit/utang_usaha/jurnal_koreksi/jurnal_koreksi";

const formatInputAmount = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
};

const toApiAmount = (value) => String(value ?? "").replace(/\D/g, "") || "0";

const normalizeJournal = (item) => ({
  id: item.JurnalKoreksiUtangUsahaID,
  description: item.Keterangan ?? "",
  rows: (item.pembayaran ?? []).map((payment) => ({
    coaId: String(payment.COAID ?? ""),
    accountName: payment.coa?.NamaAkun ?? "",
    accountNumber: payment.coa?.NoAkun ?? "",
    debit: formatInputAmount(payment.Debet),
    credit: formatInputAmount(payment.Kredit),
  })),
});

const toPayload = (journal) => ({
  Keterangan: journal.description?.trim() || null,
  pembayaran: journal.rows.map((row) => ({
    COAID: Number(row.coaId),
    Debet: toApiAmount(row.debit),
    Kredit: toApiAmount(row.credit),
  })),
});

export default function JurnalKoreksiUtangUsaha({ auditId }) {
  const [utangUsahaId, setUtangUsahaId] = useState(null);
  const [journals, setJournals] = useState([]);
  const [coaOptions, setCoaOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(auditId));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!auditId) return undefined;

    let isMounted = true;

    Promise.all([
      getUtangUsaha(auditId),
      getCoa({ jwbKasusId: auditId, page: 1, perPage: 100 }),
    ])
      .then(([utangUsaha, coaResponse]) => {
        if (!isMounted) return null;

        setUtangUsahaId(utangUsaha?.UtangUsahaID ?? null);
        setCoaOptions((coaResponse.data ?? []).map((account) => ({
          value: String(account.COAID),
          label: account.NamaAkun ?? "",
          accountNumber: account.NoAkun ?? "",
        })));

        return getJurnalKoreksiUtangUsaha(utangUsaha?.UtangUsahaID);
      })
      .then((items) => {
        if (isMounted && items) setJournals(items.map(normalizeJournal));
      })
      .catch(() => {
        if (isMounted) setJournals([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [auditId]);

  const handleCreate = async (journal) => {
    if (!utangUsahaId) throw new Error("Data utang usaha belum tersedia.");
    const saved = await createJurnalKoreksiUtangUsaha(utangUsahaId, toPayload(journal));
    setJournals((current) => [...current, normalizeJournal(saved)]);
  };

  const handleUpdate = async (journalId, journal) => {
    const saved = await updateJurnalKoreksiUtangUsaha(journalId, toPayload(journal));
    setJournals((current) => current.map((item) => item.id === journalId ? normalizeJournal(saved) : item));
  };

  const handleDelete = async (journalId) => {
    await deleteJurnalKoreksiUtangUsaha(journalId);
    setJournals((current) => current.filter((item) => item.id !== journalId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.resolve();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <JurnalKoreksiTable
      journals={journals}
      coaOptions={coaOptions}
      isLoading={isLoading}
      isSaving={isSaving}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onSave={handleSave}
    />
  );
}
