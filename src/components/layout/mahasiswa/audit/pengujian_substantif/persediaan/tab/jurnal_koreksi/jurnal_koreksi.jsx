"use client";

import { useEffect, useState } from "react";

import AlertSuccess from "@/components/alert/alert_success";
import JurnalKoreksiTable from "@/components/pengujian_substantif/jurnal_koreksi/JurnalKoreksiTable";
import { getCoa } from "@/services/mahasiswa/tugas/audit/coa/coa";
import { getPersediaan } from "@/services/mahasiswa/tugas/audit/persediaan/persediaan";
import {
  createJurnalKoreksiPersediaan,
  deleteJurnalKoreksiPersediaan,
  getJurnalKoreksiPersediaan,
  updateJurnalKoreksiPersediaan,
} from "@/services/mahasiswa/tugas/audit/persediaan/jurnal_koreksi/jurnal_koreksi";

const formatInputAmount = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
};

const toApiAmount = (value) => String(value ?? "").replace(/\D/g, "") || "0";

const normalizeJournal = (item) => ({
  id: item.JurnalKoreksiPersediaanID,
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

export default function JurnalKoreksiPersediaan({ auditId }) {
  const [persediaanId, setPersediaanId] = useState(null);
  const [journals, setJournals] = useState([]);
  const [coaOptions, setCoaOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(auditId));
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!auditId) return undefined;

    let isMounted = true;

    Promise.all([
      getPersediaan(auditId),
      getCoa({ jwbKasusId: auditId, page: 1, perPage: 100 }),
    ])
      .then(([persediaan, coaResponse]) => {
        if (!isMounted) return null;

        setPersediaanId(persediaan?.PersediaanID ?? null);
        setCoaOptions((coaResponse.data ?? []).map((account) => ({
          value: String(account.COAID),
          label: account.NamaAkun ?? "",
          accountNumber: account.NoAkun ?? "",
        })));

        return getJurnalKoreksiPersediaan(persediaan?.PersediaanID);
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
    if (!persediaanId) throw new Error("Data persediaan belum tersedia.");
    const saved = await createJurnalKoreksiPersediaan(persediaanId, toPayload(journal));
    setJournals((current) => [...current, normalizeJournal(saved)]);
  };

  const handleUpdate = async (journalId, journal) => {
    const saved = await updateJurnalKoreksiPersediaan(journalId, toPayload(journal));
    setJournals((current) => current.map((item) => item.id === journalId ? normalizeJournal(saved) : item));
  };

  const handleDelete = async (journalId) => {
    await deleteJurnalKoreksiPersediaan(journalId);
    setJournals((current) => current.filter((item) => item.id !== journalId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.resolve();
      setSuccessMessage("Data jurnal koreksi berhasil disimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <AlertSuccess message={successMessage} onClose={() => setSuccessMessage("")} />
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
    </>
  );
}
