"use client";

import { useEffect, useRef, useState } from "react";
import {
  Trash2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

const tipeKelasOptions = [
  "UTS",
  "UAS",
  "TUGAS",
  "Sandbox",
];

export default function TugasPage() {
  // =====================================================
  // FILE
  // =====================================================

  // File yang sudah dipilih/upload di frontend.
  // Belum masuk database sampai tombol Create ditekan.
  const [files, setFiles] = useState([]);

  // File yang dipilih untuk dibuat menjadi tugas
  const [selectedFileId, setSelectedFileId] =
    useState(null);

  // Ref ke <input type="file"> tersembunyi, dipakai untuk langsung
  // membuka file explorer begitu tombol "Upload File" diklik,
  // tanpa modal konfirmasi lagi.
  const fileInputRef = useRef(null);

  // =====================================================
  // DATA TUGAS
  // =====================================================

  const [tugasList, setTugasList] = useState([]);

  const [loadingTugas, setLoadingTugas] =
    useState(false);

  const [tugasError, setTugasError] =
    useState(null);

  // =====================================================
  // KELAS
  // =====================================================

  const [kelasList, setKelasList] =
    useState([]);

  const [loadingKelas, setLoadingKelas] =
    useState(false);

  const [kelasError, setKelasError] =
    useState(null);

  const [selectedKelas, setSelectedKelas] =
    useState(null);

  // =====================================================
  // TIPE KELAS
  // =====================================================

  const [tipeKelasOpen, setTipeKelasOpen] =
    useState(false);

  const [selectedTipeKelas, setSelectedTipeKelas] =
    useState(null);

  // =====================================================
  // DELETE FILE MODAL
  // =====================================================

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [deletingFile, setDeletingFile] =
    useState(null);

  // =====================================================
  // CREATE LOADING
  // =====================================================

  const [creating, setCreating] =
    useState(false);

  // =====================================================
  // FETCH KELAS
  // =====================================================

  useEffect(() => {
    const fetchKelas = async () => {
      if (!selectedTipeKelas) {
        setKelasList([]);
        setSelectedKelas(null);
        return;
      }

      try {
        setLoadingKelas(true);
        setKelasError(null);
        setSelectedKelas(null);

        /*
         * Dropdown menggunakan:
         *
         * TUGAS
         *
         * Sedangkan endpoint kamu berhasil
         * dengan:
         *
         * ?tipe=Tugas
         */

        const tipeAPI =
          selectedTipeKelas === "TUGAS"
            ? "Tugas"
            : selectedTipeKelas;

        const url =
          `http://localhost:8000/api/kelas?tipe=` +
          encodeURIComponent(tipeAPI);

        console.log("Fetching kelas:", url);

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil data kelas. Status: ${response.status}`
          );
        }

        const data =
          await response.json();

        console.log(
          "Data kelas:",
          data
        );

        if (Array.isArray(data)) {
          setKelasList(data);
        } else {
          setKelasList([]);
        }
      } catch (error) {
        console.error(
          "Error mengambil data kelas:",
          error
        );

        setKelasError(
          error.message
        );

        setKelasList([]);
      } finally {
        setLoadingKelas(false);
      }
    };

    fetchKelas();
  }, [selectedTipeKelas]);

  // =====================================================
  // FETCH TUGAS DARI DATABASE
  // =====================================================

  useEffect(() => {
    const fetchTugas = async () => {
      try {
        setLoadingTugas(true);
        setTugasError(null);

        const response =
          await fetch(
            "http://localhost:8000/api/kasus"
          );

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil data tugas. Status: ${response.status}`
          );
        }

        const data =
          await response.json();

        console.log(
          "Data tugas dari database:",
          data
        );

        if (Array.isArray(data)) {
          setTugasList(data);
        } else if (
          Array.isArray(data.data)
        ) {
          setTugasList(data.data);
        } else {
          setTugasList([]);
        }
      } catch (error) {
        console.error(
          "Error mengambil tugas:",
          error
        );

        setTugasError(
          error.message
        );

        setTugasList([]);
      } finally {
        setLoadingTugas(false);
      }
    };

    fetchTugas();
  }, []);

  // =====================================================
  // UPLOAD FILE (LANGSUNG DARI FILE EXPLORER, TANPA MODAL)
  // =====================================================

  // Klik tombol "Upload File" -> langsung trigger file explorer
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Begitu user pilih file di file explorer, langsung tambahkan
  // ke daftar (tanpa perlu modal konfirmasi lagi).
  //
  // File BELUM masuk database di sini. Kita hanya memasukkannya
  // ke state. Database baru akan menerima file ketika tombol
  // CREATE ditekan.
  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("File harus berupa PDF.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file maksimal 10MB.");
      e.target.value = "";
      return;
    }

    const newFile = {
      id: Date.now(),
      name: file.name,
      file: file,
    };

    setFiles((prev) => [
      ...prev,
      newFile,
    ]);

    // Reset input supaya bisa pilih file yang sama lagi kalau perlu
    e.target.value = "";
  };

  // =====================================================
  // DELETE FILE DARI FRONTEND
  // =====================================================

  const openDeleteModal = (file) => {
    setDeletingFile(file);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingFile) {
      return;
    }

    setFiles((prev) =>
      prev.filter(
        (file) =>
          file.id !==
          deletingFile.id
      )
    );

    if (
      selectedFileId ===
      deletingFile.id
    ) {
      setSelectedFileId(null);
    }

    setDeleteModalOpen(false);
    setDeletingFile(null);
  };

  // =====================================================
  // SELECT KELAS
  // =====================================================

  const selectKelas = (kelasID) => {
    setSelectedKelas((prev) =>
      prev === kelasID
        ? null
        : kelasID
    );
  };

  // =====================================================
  // SELECT TIPE KELAS
  // =====================================================

  const selectTipeKelas = (tipe) => {
    setSelectedTipeKelas(tipe);
    setTipeKelasOpen(false);
  };

  // =====================================================
  // CREATE TUGAS -> DATABASE
  // =====================================================

  const handleCreate = async () => {
    if (
      !selectedTipeKelas ||
      !selectedFileId ||
      !selectedKelas
    ) {
      return;
    }

    const selectedFile =
      files.find(
        (file) =>
          file.id ===
          selectedFileId
      );

    if (!selectedFile) {
      alert(
        "File tidak ditemukan."
      );
      return;
    }

    if (!selectedFile.file) {
      alert(
        "File tidak valid."
      );
      return;
    }

    const kelas =
      kelasList.find(
        (item) =>
          item.KelasID ===
          selectedKelas
      );

    if (!kelas) {
      alert(
        "Kelas tidak ditemukan."
      );
      return;
    }

    try {
      setCreating(true);

      /*
       * Nama tugas diambil dari
       * nama file tanpa .pdf.
       *
       * Contoh:
       *
       * Kasus_1.pdf
       *
       * menjadi:
       *
       * Kasus_1
       */

      const namaTugas =
        selectedFile.name.replace(
          /\.pdf$/i,
          ""
        );

      const formData =
        new FormData();

      formData.append(
        "KelasID",
        kelas.KelasID
      );

      formData.append(
        "NamaTugas",
        namaTugas
      );

      formData.append(
        "file",
        selectedFile.file
      );

      console.log(
        "Mengirim tugas:",
        {
          KelasID:
            kelas.KelasID,
          NamaTugas:
            namaTugas,
          NamaFile:
            selectedFile.name,
        }
      );

      const response =
        await fetch(
          "http://localhost:8000/api/kasus",
          {
            method: "POST",
            body: formData,
          }
        );

      const result =
        await response.json();

      console.log(
        "Response create:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Gagal membuat tugas. Status: ${response.status}`
        );
      }

      /*
       * Backend mengembalikan data kasus
       * yang baru dibuat.
       */

      const newKasus =
        result.data;

      if (newKasus) {
        setTugasList((prev) => [
          ...prev,
          newKasus,
        ]);
      }

      /*
       * Hapus file temporary dari daftar
       * setelah berhasil masuk database.
       */

      setFiles((prev) =>
        prev.filter(
          (file) =>
            file.id !==
            selectedFileId
        )
      );

      // Reset pilihan
      setSelectedFileId(null);

      alert(
        "Tugas berhasil dibuat dan disimpan ke database."
      );
    } catch (error) {
      console.error(
        "Error membuat tugas:",
        error
      );

      alert(
        error.message ||
          "Gagal membuat tugas."
      );
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // CREATE BUTTON STATUS
  // =====================================================

  const canCreate =
    selectedTipeKelas &&
    selectedFileId &&
    selectedKelas &&
    !creating;

  // =====================================================
  // DROPDOWN LABEL
  // =====================================================

  const dropdownLabel =
    selectedTipeKelas ||
    "Tipe Kelas";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <h1 className="text-2xl font-bold text-slate-900">
          TUGAS
        </h1>

        <div className="mt-8 flex gap-8">

          {/* ================================================= */}
          {/* LEFT COLUMN */}
          {/* ================================================= */}

          <div className="flex-1">

            {/* ================================================= */}
            {/* UPLOAD BUTTON (langsung buka file explorer) */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={handleUploadButtonClick}
              className="mb-4 rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-600"
            >
              Upload File
            </button>

            {/* Input file tersembunyi, di-trigger lewat tombol di atas */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileSelected}
            />

            {/* ================================================= */}
            {/* FILE TABLE */}
            {/* ================================================= */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

              <div className="grid grid-cols-[32px_60px_1fr_96px] gap-4 px-6 py-4">

                <span />

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

                files.map(
                  (file, index) => (

                    <div
                      key={file.id}
                      className={`grid grid-cols-[32px_60px_1fr_96px] items-center gap-4 px-6 py-4 ${
                        index !==
                        files.length - 1
                          ? "border-t border-slate-100"
                          : ""
                      }`}
                    >

                      {/* RADIO */}

                      <input
                        type="radio"
                        name="file-untuk-tugas"
                        aria-label={`Pilih ${file.name} untuk dibuat jadi tugas`}
                        checked={
                          selectedFileId ===
                          file.id
                        }
                        onChange={() =>
                          setSelectedFileId(
                            file.id
                          )
                        }
                        className="h-4 w-4 border-slate-300 text-emerald-500 focus:ring-emerald-400"
                      />

                      {/* NO */}

                      <span className="text-sm text-slate-500">
                        {index + 1}
                      </span>

                      {/* FILE NAME */}

                      <span className="text-sm text-slate-900">
                        {file.name}
                      </span>

                      {/* DELETE */}

                      <div className="flex items-center justify-end">

                        <button
                          type="button"
                          aria-label={`Hapus ${file.name}`}
                          onClick={() =>
                            openDeleteModal(
                              file
                            )
                          }
                          className="text-slate-500 hover:text-red-500"
                        >
                          <Trash2
                            className="h-4 w-4"
                            strokeWidth={1.8}
                          />
                        </button>

                      </div>

                    </div>
                  )
                )
              )}

            </div>

            {/* ================================================= */}
            {/* CREATE */}
            {/* ================================================= */}

            <div className="mt-4 flex items-center gap-3">

              <button
                type="button"
                onClick={
                  handleCreate
                }
                disabled={
                  !canCreate
                }
                className="rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Creating..."
                  : "Create"}
              </button>

              {!canCreate &&
                !creating && (
                  <span className="text-xs text-slate-400">
                    Pilih Tipe Kelas,
                    satu kelas, dan
                    satu file untuk
                    membuat tugas.
                  </span>
                )}

            </div>

            {/* ================================================= */}
            {/* TUGAS DATABASE TABLE (header tetap, body scrollable) */}
            {/* ================================================= */}

            <div className="mt-6 min-h-[220px] rounded-xl border border-slate-200 bg-white p-6">

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

              <div className="max-h-[300px] overflow-y-auto">

                {loadingTugas ? (

                  <div className="py-10 text-center text-sm text-slate-400">
                    Memuat tugas...
                  </div>

                ) : tugasError ? (

                  <div className="py-10 text-center">

                    <p className="text-sm text-red-500">
                      Gagal memuat tugas.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {tugasError}
                    </p>

                  </div>

                ) : tugasList.length === 0 ? (

                  <div className="py-10 text-center text-sm text-slate-400">
                    Belum ada tugas yang dibuat.
                  </div>

                ) : (

                  tugasList.map(
                    (item, index) => (

                      <div
                        key={
                          item.KasusID ||
                          item.id ||
                          index
                        }
                        className="grid grid-cols-[60px_1fr_1fr] items-center border-b border-slate-100 py-3 last:border-0"
                      >

                        <span className="text-sm text-slate-500">
                          {index + 1}
                        </span>

                        <span className="text-sm text-slate-900">
                          {item.NamaKelas ||
                            item.KelasID ||
                            item.kelas}
                        </span>

                        <span className="text-sm text-slate-500">
                          {item.NamaFile ||
                            item.namaFile ||
                            "-"}
                        </span>

                      </div>
                    )
                  )
                )}

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* RIGHT COLUMN */}
          {/* ================================================= */}

          <div className="w-48 shrink-0">

            {/* ================================================= */}
            {/* TIPE KELAS */}
            {/* ================================================= */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setTipeKelasOpen(
                    !tipeKelasOpen
                  )
                }
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >

                <span className="truncate">
                  {dropdownLabel}
                </span>

                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    tipeKelasOpen
                      ? "rotate-180"
                      : ""
                  }`}
                  strokeWidth={2}
                />

              </button>

              {tipeKelasOpen && (

                <div className="absolute right-0 z-10 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

                  {tipeKelasOptions.map(
                    (tipe, index) => (

                      <button
                        type="button"
                        key={tipe}
                        onClick={() =>
                          selectTipeKelas(
                            tipe
                          )
                        }
                        className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 ${
                          index !==
                          tipeKelasOptions.length -
                            1
                            ? "border-b border-slate-100"
                            : ""
                        } ${
                          selectedTipeKelas ===
                          tipe
                            ? "font-medium text-slate-900"
                            : "text-slate-700"
                        }`}
                      >
                        {tipe}
                      </button>

                    )
                  )}

                </div>

              )}

            </div>

            {/* ================================================= */}
            {/* KELAS DARI DATABASE */}
            {/* ================================================= */}

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">

              {loadingKelas ? (

                <div className="py-4 text-center text-sm text-slate-400">
                  Memuat kelas...
                </div>

              ) : kelasError ? (

                <div className="py-4 text-center">

                  <p className="text-sm text-red-500">
                    Gagal memuat kelas.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {kelasError}
                  </p>

                </div>

              ) : !selectedTipeKelas ? (

                <div className="py-4 text-center text-sm text-slate-400">
                  Pilih tipe kelas
                  terlebih dahulu.
                </div>

              ) : kelasList.length === 0 ? (

                <div className="py-4 text-center text-sm text-slate-400">
                  Tidak ada kelas
                  untuk tipe ini.
                </div>

              ) : (

                <div className="flex flex-col gap-3">

                  {kelasList.map(
                    (kelas) => {

                      const active =
                        selectedKelas ===
                        kelas.KelasID;

                      return (
                        <button
                          type="button"
                          key={
                            kelas.KelasID
                          }
                          onClick={() =>
                            selectKelas(
                              kelas.KelasID
                            )
                          }
                          className="flex items-center gap-3 text-left"
                          aria-pressed={
                            active
                          }
                        >

                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              active
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                          />

                          <span
                            className={`text-sm ${
                              active
                                ? "text-slate-900"
                                : "text-slate-500"
                            }`}
                          >
                            {
                              kelas.NamaKelas
                            }
                          </span>

                        </button>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          </div>

        </div>
      </main>

      {/* ===================================================== */}
      {/* DELETE MODAL */}
      {/* ===================================================== */}

      {deleteModalOpen &&
        deletingFile && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">

            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">

              <div className="flex flex-col items-center text-center">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">

                  <AlertTriangle
                    className="h-6 w-6 text-red-500"
                    strokeWidth={1.8}
                  />

                </div>

                <h2 className="text-base font-bold text-slate-900">
                  Hapus file ini?
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Apakah kamu yakin ingin
                  menghapus{" "}
                  <span className="font-medium text-slate-700">
                    {
                      deletingFile.name
                    }
                  </span>
                  ? Tindakan ini tidak
                  bisa dibatalkan.
                </p>

              </div>

              <div className="mt-6 flex justify-center gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(
                      false
                    );
                    setDeletingFile(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={
                    handleConfirmDelete
                  }
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