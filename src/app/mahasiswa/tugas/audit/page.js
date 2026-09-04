"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  ChevronDown,
  History,
  Pencil,
  Plus,
  User,
  X,
} from "lucide-react";

import Pagination from "@/components/pagination/pagination";
import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import api from "@/services/api";
import { useRouter } from "next/navigation";

const HISTORY_LOGS = [
  { id: 1, title: "Audit Perikatan", name: "Kevin Theryo", role: "Mahasiswa", date: "13 Aug 2026", time: "13:03:09", action: "view" },
  { id: 2, title: "Audit Perikatan", name: "Agustinus Winoto", role: "Dosen", date: "07 Aug 2026", time: "23:19:05", action: "view" },
  { id: 3, title: "Audit Perikatan", name: "Agustinus Winoto", role: "Dosen", date: "07 Aug 2026", time: "23:19:05", action: "view" },
  { id: 4, title: "Audit Perikatan", name: "Kevin Theryo", role: "Mahasiswa", date: "06 Aug 2026", time: "09:25:47", action: "view" },
  { id: 5, title: "Audit Perikatan", name: "Kevin Theryo", role: "Mahasiswa", date: "05 Aug 2026", time: "14:17:17", action: "view" },
  { id: 6, title: "Audit Perikatan", name: "Kevin Theryo", role: "Mahasiswa", date: "04 Aug 2026", time: "21:52:29", action: "view" },
  { id: 7, title: "Audit Laporan Keuangan", name: "Kevin Theryo", role: "Mahasiswa", date: "04 Aug 2026", time: "20:14:43", action: "Simpan" },
  { id: 8, title: "Audit Pengujian Jurnal Koreksi", name: "Kevin Theryo", role: "Mahasiswa", date: "04 Aug 2026", time: "20:12:20", action: "Simpan" },
  { id: 9, title: "Audit Pengujian Jurnal Koreksi", name: "Kevin Theryo", role: "Mahasiswa", date: "04 Aug 2026", time: "20:11:48", action: "Simpan" },
  { id: 10, title: "Audit Pengujian Uji Penyusutan", name: "Kevin Theryo", role: "Mahasiswa", date: "04 Aug 2026", time: "20:10:12", action: "Simpan" },
];

const JENIS_PERUSAHAAN_OPTIONS = ["Manufaktur", "Dagang", "Jasa"];

function normalizeAudit(item) {
  return {
    id: item.JwbKasusID,
    KasusID: item.KasusID,
    tipe: item.kasus?.kelas?.tipe_kelas || "-",
    nama: item.mahasiswa?.user?.name || "-",
    klien: item.kasus?.client?.NamaClient || "-",
    jenisPerusahaan: item.JenisPerusahaan || "",
    periodeAudit: item.Periode || "",
    waktuMulai: item.WaktuMulai || "",
    batasWaktu: item.BatasWaktu || "",
  };
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function HistoryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
      <div className="max-h-[85vh] w-full max-w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 pt-7 pb-4">
          <h2 className="font-poppins text-[22px] font-bold text-[#1F2937]">History Log Pengujian</h2>
          <button type="button" onClick={onClose} aria-label="Tutup history log" className="text-gray-400 transition hover:text-gray-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-2">
          <div className="space-y-3">
            {HISTORY_LOGS.map((log) => (
              <div key={log.id} className="flex items-stretch overflow-hidden rounded-lg border border-gray-100 bg-white">
                <div className="w-[5px] bg-[#3B82F6]" />
                <div className="flex flex-1 items-center gap-4 px-4 py-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#3B82F6] font-poppins text-xs font-bold text-white">
                    {log.id}
                  </span>

                  <span className="flex-1 min-w-0 font-poppins text-sm font-semibold text-[#1F2937]">
                    {log.title}
                  </span>

                  <div className="ml-auto flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
                    {log.role === "Dosen" && (
                      <span className="rounded-md bg-[#EEF2FF] px-2 py-1 font-poppins text-[10px] font-bold text-[#4F46E5]">
                        DOSEN
                      </span>
                    )}

                    <span className="rounded-md bg-[#E9FBEF] px-2 py-1 font-poppins text-[10px] font-bold text-[#12B76A]">
                      {log.action === "Simpan" ? "STORE" : "VIEW"}
                    </span>

                    <span className="whitespace-nowrap font-poppins text-[11px] text-[#9CA3AF]">
                      {log.date} {log.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end border-t border-gray-100 px-8 py-5">
          <button type="button" onClick={onClose} className="h-[42px] rounded-xl bg-[#FF4242] px-8 font-poppins text-sm font-bold text-white shadow-sm transition hover:brightness-95">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}


function FieldShell({ label, icon, children }) {
  return (
    <div>
      <label className="mb-2 block font-poppins text-sm font-semibold text-[#596275]">
        {label}
      </label>

      <div className="flex h-[42px] w-full items-center rounded-md border border-[#D8DEE9] px-3 focus-within:border-[#3B82F6]">
        <span className="mr-3 text-[#9CA3AF]">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  emptyText = "Tidak ada pilihan",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (!selectRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectedOption = options.find(
    (option) => String(option.value) === String(value)
  );
  const hasOptions = options.length > 0;

  return (
    <div ref={selectRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        disabled={!hasOptions}
        className={`flex w-full items-center justify-between gap-2 bg-transparent p-0 text-left font-poppins text-sm outline-none ${
          hasOptions ? "text-[#293144]" : "cursor-not-allowed text-[#9CA3AF]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate ${selectedOption ? "" : "text-[#888888]"}`}>
          {selectedOption?.label || (hasOptions ? placeholder : emptyText)}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#596275] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-52 overflow-y-auto rounded-md border border-[#D8DEE9] bg-white py-1 shadow-lg"
          role="listbox"
        >
          {hasOptions ? options.map((option) => {
            const isSelected = String(option.value) === String(value);

            return (
              <button
                type="button"
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left font-poppins text-sm transition-colors ${
                  isSelected
                    ? "bg-[#EFF6FF] font-semibold text-[#2563EB]"
                    : "text-[#293144] hover:bg-[#F7FAFC]"
                }`}
                role="option"
                aria-selected={isSelected}
              >
                {option.label}
              </button>
            );
          }) : (
            <p className="px-3 py-2 font-poppins text-sm text-[#9CA3AF]">
              Tidak ada klien ditemukan
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function AuditFormModal({
  isOpen,
  onClose,
  onSubmit,
  mode = "tambah",
  initialData = null,
  tugasOptions = [],
  isSaving = false,
}) {
  const [kasusId, setKasusId] = useState(initialData?.KasusID || "");
  const [jenisPerusahaan, setJenisPerusahaan] = useState(
    initialData?.jenisPerusahaan || ""
  );
  const [periodeAudit, setPeriodeAudit] = useState(
    initialData?.periodeAudit || ""
  );
  const [waktuMulai, setWaktuMulai] = useState(initialData?.waktuMulai || "");
  const [batasWaktu, setBatasWaktu] = useState(initialData?.batasWaktu || "");

  if (!isOpen) return null;

  function handleKeluar() {
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      KasusID: kasusId,
      jenisPerusahaan,
      periodeAudit,
      waktuMulai,
      batasWaktu,
    });

  }

  const title = mode === "edit" ? "Update Data Audit" : "Tambah Data Audit";
  const inputClass =
    "w-full bg-transparent font-poppins text-sm text-[#293144] outline-none placeholder:text-[#888888]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleKeluar();
      }}
    >
      <div className="w-full max-w-[835px] rounded-xl bg-white px-8 py-7 shadow-xl">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="font-poppins text-xl font-bold text-[#293144]">
            {title}
          </h2>

          <button
            type="button"
            onClick={handleKeluar}
            aria-label="Tutup"
            className="text-[#888888] hover:text-black"
          >
            <X size={20} strokeWidth={2.2} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-9 gap-y-5 md:grid-cols-2">
            <FieldShell label="Klien" icon={<User size={17} strokeWidth={1.8} />}>
              <CustomSelect
                value={kasusId}
                onChange={setKasusId}
                placeholder="Pilih klien"
                emptyText="Tidak ada klien ditemukan"
                options={tugasOptions.map((item) => ({
                  value: item.KasusID,
                  label: item.NamaClient || "Tanpa nama klien",
                }))}
              />
            </FieldShell>

            <FieldShell
              label="Jenis Perusahaan"
              icon={<BarChart3 size={17} strokeWidth={1.8} />}
            >
              <CustomSelect
                value={jenisPerusahaan}
                onChange={setJenisPerusahaan}
                placeholder="Pilih jenis perusahaan"
                options={JENIS_PERUSAHAAN_OPTIONS.map((item) => ({
                  value: item,
                  label: item,
                }))}
              />
            </FieldShell>

            <FieldShell
              label="Periode Audit"
              icon={<CalendarDays size={17} strokeWidth={1.8} />}
            >
              <input
                type="date"
                value={periodeAudit}
                onChange={(e) => setPeriodeAudit(e.target.value)}
                required
                className={inputClass}
              />
            </FieldShell>

            <FieldShell
              label="Waktu Mulai Pekerjaan"
              icon={<CalendarDays size={17} strokeWidth={1.8} />}
            >
              <input
                type="date"
                value={waktuMulai}
                onChange={(e) => setWaktuMulai(e.target.value)}
                required
                className={inputClass}
              />
            </FieldShell>

            <FieldShell
              label="Batas Waktu Pengumpulan"
              icon={<CalendarDays size={17} strokeWidth={1.8} />}
            >
              <input
                type="date"
                value={batasWaktu}
                onChange={(e) => setBatasWaktu(e.target.value)}
                required
                className={inputClass}
              />
            </FieldShell>
          </div>

          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleKeluar}
              className="h-[38px] rounded-md bg-[#E52B2B] px-6 font-poppins text-sm font-semibold text-white hover:bg-[#D91F1F]"
            >
              Keluar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="h-[38px] rounded-md bg-[#3B82F6] px-7 font-poppins text-sm font-semibold text-white hover:bg-[#2563EB]"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionIcons({ auditId, onHistoryClick, onEditClick }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        aria-label="Riwayat audit"
        onClick={onHistoryClick}
        className="text-black hover:text-[#42A5F5]"
      >
        <History size={16} strokeWidth={2} />
      </button>

      <button
        type="button"
        aria-label="Edit audit"
        onClick={onEditClick}
        className="text-black hover:text-[#42A5F5]"
      >
        <Pencil size={16} strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={() =>
          router.push(`/mahasiswa/tugas/audit/${auditId}/detail_audit`)
        }
        className="h-[44px] whitespace-nowrap rounded-full bg-green-600 px-4 font-poppins text-sm font-semibold text-white hover:brightness-95"
      >
        Mulai Audit
      </button>
    </div>
  );
}

export default function AuditPage() {
  const [auditData, setAuditData] = useState([]);
  const [tugasOptions, setTugasOptions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState("");
  const [filterTugas, setFilterTugas] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [savingAudit, setSavingAudit] = useState(false);
  const [successAlert, setSuccessAlert] = useState({
    title: "",
    message: "",
  });
  const [errorAlert, setErrorAlert] = useState({
    title: "",
    message: "",
  });

  useEffect(() => {
    async function fetchAuditData() {
      try {
        setLoadingData(true);
        setDataError("");

        const [auditResponse, tugasResponse] = await Promise.all([
          api.get("/api/jwb-kasus"),
          api.get("/api/kasus"),
        ]);

        setAuditData((auditResponse.data || []).map(normalizeAudit));
        setTugasOptions(tugasResponse.data || []);
      } catch (error) {
        setDataError(
          error.response?.data?.message || "Gagal mengambil data audit."
        );
      } finally {
        setLoadingData(false);
      }
    }

    fetchAuditData();
  }, []);

  function openTambahModal() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  function openEditModal(item) {
    setEditingItem({
      id: item.id,
      KasusID: item.KasusID,
      klien: item.klien,
      jenisPerusahaan: item.jenisPerusahaan || "",
      periodeAudit: item.periodeAudit || "",
      waktuMulai: item.waktuMulai || "",
      batasWaktu: item.batasWaktu || "",
    });
    setIsFormOpen(true);
  }

  function handleSubmitForm(data) {
    async function saveAudit() {
      try {
        setSavingAudit(true);

        const payload = {
          KasusID: Number(data.KasusID),
          JenisPerusahaan: data.jenisPerusahaan,
          Periode: data.periodeAudit,
          WaktuMulai: data.waktuMulai,
          BatasWaktu: data.batasWaktu,
        };
        const response = editingItem
          ? await api.put(`/api/jwb-kasus/${editingItem.id}`, payload)
          : await api.post("/api/jwb-kasus", payload);

        const savedAuditResponse = response.data?.data;
        if (!savedAuditResponse) {
          throw new Error("Respons data audit dari server tidak valid.");
        }
        const savedAudit = normalizeAudit(savedAuditResponse);

        setAuditData((previous) => editingItem
          ? previous.map((item) => item.id === savedAudit.id ? savedAudit : item)
          : [savedAudit, ...previous]);
        setIsFormOpen(false);
        setEditingItem(null);
        setSuccessAlert({
          title: editingItem ? "Berhasil diperbarui" : "Berhasil ditambah",
          message: editingItem
            ? "Data audit berhasil diperbarui."
            : "Data audit berhasil ditambahkan.",
        });
      } catch (error) {
        const validationErrors = error.response?.data?.errors;
        const firstValidationError = validationErrors
          ? Object.values(validationErrors).flat()[0]
          : null;

        setErrorAlert({
          title: "Gagal menyimpan",
          message: firstValidationError
            || error.response?.data?.message
            || error.message
            || "Gagal menyimpan data audit.",
        });
      } finally {
        setSavingAudit(false);
      }
    }

    saveAudit();
  }

  return (
    <div className="min-h-screen px-10 py-10">
      <AlertSuccess
        title={successAlert.title}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ title: "", message: "" })}
      />

      <AlertError
        title={errorAlert.title}
        message={errorAlert.message}
        onClose={() => setErrorAlert({ title: "", message: "" })}
      />

      <h1 className="font-poppins text-[28px] font-semibold text-[#293144]">
        DATA AUDIT
      </h1>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={openTambahModal}
          className="flex h-[46px] items-center justify-center gap-2 rounded-[7px] bg-[#42A5F5] px-5 font-poppins text-sm font-semibold text-white transition hover:bg-[#2196F3] sm:w-[190px]"
        >
          <Plus size={17} strokeWidth={2.2} />
          Tambah Audit
        </button>
      </div>

      <div className="mt-2 overflow-hidden rounded-xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse">
            <thead className="bg-white">
              <tr className="border-b border-[#D9DEE8]">
                <th className="w-[6%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                  NO
                </th>
                <th className="w-[10%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                  TIPE
                </th>
                <th className="w-[18%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                  NAMA
                </th>
                <th className="w-[22%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                  KLIEN
                </th>
                <th className="w-[14%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                  WAKTU PERIODE
                </th>
                <th className="w-[14%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                  WAKTU MULAI
                </th>
                <th className="w-[14%] px-6 pt-10 py-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                  BATAS WAKTU
                </th>
                <th className="w-[12%] px-6 pt-10 py-4 text-center font-poppins text-xs font-semibold text-[#6B7589]">
                  AKSI
                </th>
              </tr>
            </thead>

            <tbody>
              {loadingData ? (
                <tr>
                  <td colSpan={8} className="h-[300px] text-center align-middle font-poppins text-sm text-[#9CA3AF]">
                    Memuat data audit...
                  </td>
                </tr>
              ) : dataError ? (
                <tr>
                  <td colSpan={8} className="h-[300px] text-center align-middle font-poppins text-sm text-red-500">
                    {dataError}
                  </td>
                </tr>
              ) : auditData.length > 0 ? (
                auditData.map((item, index) => (
                  <tr key={item.id} className="border-b border-[#E5E7EB]">
                    <td className="px-6 py-4 font-poppins text-sm text-[#293144]">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-poppins text-sm text-[#293144]">
                      {item.tipe}
                    </td>
                    <td className="px-6 py-4 font-poppins text-sm text-[#293144]">
                      {item.nama}
                    </td>
                    <td className="px-6 py-4 font-poppins text-sm text-[#6B7589]">
                      {item.klien}
                    </td>
                    <td className="px-6 py-4 font-poppins text-sm text-[#6B7589]">
                      {formatDate(item.periodeAudit)}
                    </td>
                    <td className="px-6 py-4 font-poppins text-sm text-[#6B7589]">
                      {formatDate(item.waktuMulai)}
                    </td>
                    <td className="px-6 py-4 font-poppins text-sm text-[#6B7589]">
                      <div className="flex items-center gap-2">
                        {formatDate(item.batasWaktu)}
                        {item.batasWaktu && new Date(`${item.batasWaktu}T00:00:00`) < new Date() && (
                          <AlertCircle
                            size={16}
                            strokeWidth={2}
                            className="text-[#E52B2B]"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ActionIcons
                        onHistoryClick={() => setIsHistoryOpen(true)}
                        onEditClick={() => openEditModal(item)}
                        auditId={item.id}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="h-[300px] text-center align-middle font-poppins text-sm text-[#9CA3AF]"
                  >
                    No Data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
      </div>

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {isFormOpen && (
        <AuditFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleSubmitForm}
          mode={editingItem ? "edit" : "tambah"}
          initialData={editingItem}
          tugasOptions={tugasOptions}
          isSaving={savingAudit}
        />
      )}
    </div>
  );
}
