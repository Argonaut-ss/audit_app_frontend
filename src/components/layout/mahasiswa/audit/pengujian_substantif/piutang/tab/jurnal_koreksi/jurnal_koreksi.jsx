"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import JurnalKoreksiTable from "@/components/pengujian_substantif/jurnal_koreksi/JurnalKoreksiTable";
import { getCoa } from "@/services/mahasiswa/tugas/audit/coa/coa";
import { getPiutang } from "@/services/mahasiswa/tugas/audit/piutang/piutang";
import {
  createJurnalKoreksiPiutang,
  deleteJurnalKoreksiPiutang,
  getJurnalKoreksiPiutang,
  updateJurnalKoreksiPiutang,
} from "@/services/mahasiswa/tugas/audit/piutang/jurnal_koreksi/jurnal_koreksi";

const formatInputAmount = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
};

const toApiAmount = (value) => String(value ?? "").replace(/\D/g, "") || "0";

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

const toPayload = (journal) => ({
  Keterangan: journal.description?.trim() || null,
  pembayaran: journal.rows.map((row) => ({
    COAID: Number(row.coaId),
    Debet: toApiAmount(row.debit),
    Kredit: toApiAmount(row.credit),
  })),
});

export default function JurnalKoreksi() {
  const params = useParams();
  const auditId = params?.id;
  const [piutangId, setPiutangId] = useState(null);
  const [journals, setJournals] = useState([]);
  const [coaOptions, setCoaOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(auditId));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!auditId) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    Promise.all([
      getPiutang(auditId),
      getCoa({ jwbKasusId: auditId, page: 1, perPage: 100 }),
    ])
      .then(([piutang, coaResponse]) => {
        if (!isMounted) return null;

        const resolvedPiutangId = piutang?.PiutangID ?? null;
        setPiutangId(resolvedPiutangId);
        setCoaOptions((coaResponse.data ?? []).map((account) => ({
          value: String(account.COAID),
          label: account.NamaAkun ?? "",
          accountNumber: account.NoAkun ?? "",
        })));

        return resolvedPiutangId ? getJurnalKoreksiPiutang(resolvedPiutangId) : [];
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
    if (!piutangId) throw new Error("Data piutang belum tersedia.");

    const saved = await createJurnalKoreksiPiutang(piutangId, toPayload(journal));
    setJournals((current) => [...current, normalizeJournal(saved)]);
  };

  const handleUpdate = async (journalId, journal) => {
    const saved = await updateJurnalKoreksiPiutang(piutangId, journalId, toPayload(journal));
    setJournals((current) => current.map((item) => (
      item.id === journalId ? normalizeJournal(saved) : item
    )));
  };

  const handleDelete = async (journalId) => {
    await deleteJurnalKoreksiPiutang(piutangId, journalId);
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
