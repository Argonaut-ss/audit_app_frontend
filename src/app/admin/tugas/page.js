"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  X,
  UploadCloud,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

const initialFiles = [
  { id: 1, name: "Kasus_1.pdf" },
  { id: 2, name: "Kasus_2.pdf" },
];

// Tipe Kelas: kategori tugas (dropdown, single-select)
const tipeKelasOptions = ["UTS", "UAS", "TUGAS", "Sandbox"];

// Daftar kelas: multi-select toggle (titik hijau = aktif, abu-abu = nonaktif)
const kelasList = ["LA01", "LB01", "LC01", "LD01", "LE01", "LF01"];

export default function TugasPage() {
  const [files, setFiles] = useState(initialFiles);
  const [tugasList, setTugasList] = useState([]);

  // File yang dipilih (radio) untuk dibuatkan jadi tugas
  const [selectedFileId, setSelectedFileId] = useState(null);

  // Tipe Kelas (dropdown, single-select)
  const [tipeKelasOpen, setTipeKelasOpen] = useState(false);
  const [selectedTipeKelas, setSelectedTipeKelas] = useState(null);

  // Daftar kelas (single-select)
  const [selectedKelas, setSelectedKelas] = useState(null);

  // Upload File modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState(null);

  // Delete File confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingFile, setDeletingFile] = useState(null);

  const handleUploadSubmit = () => {
    if (!uploadFileName) return;
    setFiles((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        name: uploadFileName,
      },
    ]);
    setUploadFileName(null);
    setUploadModalOpen(false);
  };

  const openDeleteModal = (file) => {
    setDeletingFile(file);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingFile) return;
    setFiles((prev) => prev.filter((f) => f.id !== deletingFile.id));
    setDeleteModalOpen(false);
    setDeletingFile(null);
  };

  const selectKelas = (kelas) => {
    setSelectedKelas((prev) => (prev === kelas ? null : kelas));
  };

  const selectTipeKelas = (tipe) => {
    setSelectedTipeKelas(tipe);
    setTipeKelasOpen(false);
  };

  // Buat entri Tugas dari file yang dipilih (radio) + Tipe Kelas + kelas yang dipilih
  const handleCreate = () => {
    if (!selectedTipeKelas || !selectedFileId || !selectedKelas) return;
    const file = files.find((f) => f.id === selectedFileId);
    if (!file) return;

    const newEntry = {
      id: tugasList.length ? tugasList[tugasList.length - 1].id + 1 : 1,
      kelas: selectedKelas,
      alokasi: `${selectedTipeKelas}/${selectedKelas}/${file.name}`,
    };

    setTugasList((prev) => [...prev, newEntry]);
    setSelectedFileId(null);
  };

  const canCreate = selectedTipeKelas && selectedFileId && selectedKelas;

  const dropdownLabel = selectedTipeKelas || "Tipe Kelas";

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 px-10 py-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            TUGAS
          </h1>

          <div className="mt-8 flex gap-8">
            {/* Left column */}
            <div className="flex-1">
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="mb-4 rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-600"
              >
                Upload File
              </button>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="grid grid-cols-[32px_60px_1fr_96px] gap-4 px-6 py-4">
                  <span></span>
                  <span className="text-sm font-semibold text-slate-500">
                    No.
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    Nama File
                  </span>
                  <span className="text-right text-sm font-semibold text-slate-500">
                    Aksi
                  </span>
                </div>

                {files.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-slate-400">
                    Belum ada file yang diunggah.
                  </div>
                ) : (
                  files.map((file, index) => (
                    <div
                      key={file.id}
                      className={`grid grid-cols-[32px_60px_1fr_96px] items-center gap-4 px-6 py-4 ${
                        index !== files.length - 1
                          ? "border-t border-slate-100"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="file-untuk-tugas"
                        aria-label={`Pilih ${file.name} untuk dibuat jadi tugas`}
                        checked={selectedFileId === file.id}
                        onChange={() => setSelectedFileId(file.id)}
                        className="h-4 w-4 border-slate-300 text-emerald-500 focus:ring-emerald-400"
                      />
                      <span className="text-sm text-slate-500">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-900">
                        {file.name}
                      </span>
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          aria-label={`Hapus ${file.name}`}
                          onClick={() => openDeleteModal(file)}
                          className="text-slate-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!canCreate}
                  className="rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create
                </button>
                {!canCreate && (
                  <span className="text-xs text-slate-400">
                    Pilih Tipe Kelas, satu kelas, dan centang satu file untuk membuat tugas.
                  </span>
                )}
              </div>

              <div className="min-h-[220px] mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <div className="grid grid-cols-[60px_1fr_1fr] border-b border-slate-200 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    No
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Kelas
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nama File
                  </span>
                </div>

                {tugasList.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400">
                    Belum ada tugas yang dibuat.
                  </div>
                ) : (
                  tugasList.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[60px_1fr_1fr] items-center border-b border-slate-100 py-3 last:border-0"
                    >
                      <span className="text-sm text-slate-500">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-900">
                        {item.kelas}
                      </span>
                      <span className="text-sm text-slate-500">
                        {item.alokasi}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right column: Tipe Kelas dropdown + daftar kelas (toggle) */}
            <div className="w-48 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTipeKelasOpen(!tipeKelasOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  <span className="truncate">{dropdownLabel}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      tipeKelasOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>

                {tipeKelasOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    {tipeKelasOptions.map((tipe, index) => (
                      <button
                        type="button"
                        key={tipe}
                        onClick={() => selectTipeKelas(tipe)}
                        className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 ${
                          index !== tipeKelasOptions.length - 1
                            ? "border-b border-slate-100"
                            : ""
                        } ${
                          selectedTipeKelas === tipe
                            ? "font-medium text-slate-900"
                            : "text-slate-700"
                        }`}
                      >
                        {tipe}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Daftar kelas: klik titik untuk memilih satu kelas (single-select) */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3">
                  {kelasList.map((kelas) => {
                    const active = selectedKelas === kelas;
                    return (
                      <button
                        type="button"
                        key={kelas}
                        onClick={() => selectKelas(kelas)}
                        className="flex items-center gap-3 text-left"
                        aria-pressed={active}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            active ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            active ? "text-slate-900" : "text-slate-500"
                          }`}
                        >
                          {kelas}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Upload File Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Upload File
              </h2>
              <button
                type="button"
                onClick={() => {
                  setUploadModalOpen(false);
                  setUploadFileName(null);
                }}
                aria-label="Tutup"
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center hover:border-sky-300 hover:bg-sky-50"
              >
                <UploadCloud className="h-8 w-8 text-sky-500" strokeWidth={1.6} />
                <span className="text-sm font-medium text-slate-700">
                  {uploadFileName ? uploadFileName : "Klik untuk pilih file PDF"}
                </span>
                <span className="text-xs text-slate-400">
                  Format .pdf, maksimal 10MB
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setUploadFileName(f.name);
                  }}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setUploadModalOpen(false);
                  setUploadFileName(null);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={!uploadFileName}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={1.8} />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Hapus file ini?
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Apakah kamu yakin ingin menghapus{" "}
                <span className="font-medium text-slate-700">
                  {deletingFile.name}
                </span>
                ? Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletingFile(null);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}