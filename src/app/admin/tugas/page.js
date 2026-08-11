"use client";

import { useEffect, useRef, useState } from "react";
import {
  Trash2,
  AlertTriangle,
  ChevronDown,
  X,
} from "lucide-react";

const tipeKelasOptions = [
  "UTS",
  "UAS",
  "TUGAS",
  "Sandbox",
];

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export default function TugasPage() {
  // =====================================================
  // FILE
  // =====================================================

  const [files, setFiles] = useState([]);

  // File otomatis terpilih setelah upload.
  // Tidak ditampilkan sebagai checkbox/radio.
  const [selectedFileId, setSelectedFileId] = useState(null);

  const fileInputRef = useRef(null);

  // =====================================================
  // DATA TUGAS
  // =====================================================

  const [tugasList, setTugasList] = useState([]);
  const [loadingTugas, setLoadingTugas] = useState(false);
  const [tugasError, setTugasError] = useState(null);

  // =====================================================
  // KELAS
  // =====================================================

  const [kelasList, setKelasList] = useState([]);
  const [loadingKelas, setLoadingKelas] = useState(false);
  const [kelasError, setKelasError] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState(null);

  // =====================================================
  // TIPE KELAS
  // =====================================================

  const [tipeKelasOpen, setTipeKelasOpen] = useState(false);
  const [selectedTipeKelas, setSelectedTipeKelas] =
    useState(null);

  // =====================================================
  // DELETE FILE MODAL
  // =====================================================

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingFile, setDeletingFile] = useState(null);

  // =====================================================
  // CREATE LOADING
  // =====================================================

  const [creating, setCreating] = useState(false);

  // =====================================================
  // CUSTOM ERROR ALERT
  // =====================================================

  const [errorAlert, setErrorAlert] = useState("");

  // =====================================================
  // CUSTOM SUCCESS ALERT
  // =====================================================

  const [successAlert, setSuccessAlert] = useState("");

  // =====================================================
  // SHOW ERROR ALERT
  // =====================================================

  const showErrorAlert = (message) => {
    setErrorAlert(message);

    setTimeout(() => {
      setErrorAlert("");
    }, 5000);
  };

  // =====================================================
  // SHOW SUCCESS ALERT
  // =====================================================

  const showSuccessAlert = (message) => {
    setSuccessAlert(message);

    setTimeout(() => {
      setSuccessAlert("");
    }, 5000);
  };

  // =====================================================
  // HELPER RESPONSE JSON
  // =====================================================

  const parseResponse = async (response) => {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        raw: text,
      };
    }
  };

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

        const response = await fetch(
          `${API_URL}/api/kelas`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const result = await parseResponse(response);

        console.log("GET /api/kelas:", result);

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              result?.raw ||
              `Gagal mengambil data kelas. Status: ${response.status}`
          );
        }

        let data = [];

        if (Array.isArray(result?.data)) {
          data = result.data;
        } else if (Array.isArray(result)) {
          data = result;
        }

        const filteredKelas = data.filter((kelas) => {
          const tipeDatabase =
            kelas.tipe_kelas ??
            kelas.TipeKelas ??
            kelas.tipeKelas ??
            "";

          return (
            String(tipeDatabase).toLowerCase() ===
            String(selectedTipeKelas).toLowerCase()
          );
        });

        console.log(
          "Kelas setelah filter:",
          filteredKelas
        );

        setKelasList(filteredKelas);
      } catch (error) {
        console.error(
          "Error mengambil data kelas:",
          error
        );

        setKelasError(
          error?.message ||
            "Gagal mengambil data kelas."
        );

        setKelasList([]);
      } finally {
        setLoadingKelas(false);
      }
    };

    fetchKelas();
  }, [selectedTipeKelas]);

  // =====================================================
  // FETCH TUGAS
  // =====================================================

  const fetchTugas = async () => {
    try {
      setLoadingTugas(true);
      setTugasError(null);

      const response = await fetch(
        `${API_URL}/api/kasus`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await parseResponse(response);

      console.log("GET /api/kasus:", result);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            result?.raw ||
            `Gagal mengambil data tugas. Status: ${response.status}`
        );
      }

      let data = [];

      if (Array.isArray(result)) {
        data = result;
      } else if (Array.isArray(result?.data)) {
        data = result.data;
      }

      setTugasList(data);
    } catch (error) {
      console.error(
        "Error mengambil tugas:",
        error
      );

      setTugasError(
        error?.message ||
          "Gagal mengambil tugas."
      );

      setTugasList([]);
    } finally {
      setLoadingTugas(false);
    }
  };

  useEffect(() => {
    fetchTugas();
  }, []);

  // =====================================================
  // UPLOAD BUTTON
  // =====================================================

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // =====================================================
  // FILE SELECTED
  // =====================================================

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // ===================================================
    // VALIDASI FORMAT
    // ===================================================

    if (file.type !== "application/pdf") {
      showErrorAlert(
        "File harus berupa PDF."
      );

      e.target.value = "";
      return;
    }

    // ===================================================
    // VALIDASI UKURAN
    // ===================================================

    if (file.size > 10 * 1024 * 1024) {
      showErrorAlert(
        "Ukuran file maksimal 10MB."
      );

      e.target.value = "";
      return;
    }

    // ===================================================
    // BUAT DATA FILE
    // ===================================================

    const newFile = {
      id: Date.now(),
      name: file.name,
      file: file,
    };

    // ===================================================
    // TAMBAHKAN FILE
    // ===================================================

    setFiles((prev) => [
      ...prev,
      newFile,
    ]);

    // ===================================================
    // FILE OTOMATIS TERPILIH
    //
    // Tidak ada checkbox/radio di UI.
    // File langsung digunakan oleh tombol Create.
    // ===================================================

    setSelectedFileId(newFile.id);

    // Reset input supaya file dengan nama sama
    // tetap dapat dipilih kembali.
    e.target.value = "";
  };

  // =====================================================
  // DELETE FILE MODAL
  // =====================================================

  const openDeleteModal = (file) => {
    setDeletingFile(file);
    setDeleteModalOpen(true);
  };

  // =====================================================
  // CONFIRM DELETE FILE
  // =====================================================

  const handleConfirmDelete = () => {
    if (!deletingFile) {
      return;
    }

    setFiles((prev) =>
      prev.filter(
        (file) =>
          file.id !== deletingFile.id
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
  // CREATE TUGAS
  // =====================================================

  const handleCreate = async () => {
    // ===================================================
    // VALIDASI
    // ===================================================

    if (
      !selectedTipeKelas ||
      !selectedFileId ||
      !selectedKelas
    ) {
      showErrorAlert(
        "Pilih tipe kelas, satu kelas, dan satu file."
      );

      return;
    }

    // ===================================================
    // CARI FILE
    // ===================================================

    const selectedFile = files.find(
      (file) =>
        file.id === selectedFileId
    );

    if (!selectedFile) {
      showErrorAlert(
        "File tidak ditemukan."
      );

      return;
    }

    if (!selectedFile.file) {
      showErrorAlert(
        "File tidak valid."
      );

      return;
    }

    // ===================================================
    // CARI KELAS
    // ===================================================

    const kelas = kelasList.find(
      (item) =>
        String(item.kode_kelas) ===
        String(selectedKelas)
    );

    if (!kelas) {
      showErrorAlert(
        "Kelas tidak ditemukan."
      );

      return;
    }

    // ===================================================
    // CEK APAKAH KELAS SUDAH MEMILIKI TUGAS
    // ===================================================

    const kelasSudahMemilikiTugas =
      tugasList.some((item) => {
        const kelasTugas =
          item.KelasID ??
          item.kelas_id ??
          item.kode_kelas ??
          "";

        return (
          String(kelasTugas).toLowerCase() ===
          String(kelas.kode_kelas).toLowerCase()
        );
      });

    if (kelasSudahMemilikiTugas) {
      showErrorAlert(
        `Kelas ${kelas.kode_kelas} sudah memiliki tugas.`
      );

      return;
    }

    // ===================================================
    // CREATE
    // ===================================================

    try {
      setCreating(true);

      // =================================================
      // NAMA TUGAS DARI NAMA FILE
      // =================================================

      const namaTugas =
        selectedFile.name.replace(
          /\.pdf$/i,
          ""
        );

      // =================================================
      // FORM DATA
      // =================================================

      const formData = new FormData();

      formData.append(
        "KelasID",
        String(kelas.kode_kelas)
      );

      formData.append(
        "NamaTugas",
        namaTugas
      );

      formData.append(
        "file",
        selectedFile.file,
        selectedFile.name
      );

      console.log(
        "================================"
      );

      console.log(
        "CREATE TUGAS"
      );

      console.log(
        "API:",
        `${API_URL}/api/kasus`
      );

      console.log({
        KelasID: kelas.kode_kelas,
        NamaTugas: namaTugas,
        NamaFile: selectedFile.name,
        FileType: selectedFile.file.type,
        FileSize: selectedFile.file.size,
      });

      console.log(
        "================================"
      );

      // =================================================
      // POST
      // =================================================

      const response = await fetch(
        `${API_URL}/api/kasus`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result =
        await parseResponse(response);

      console.log(
        "POST status:",
        response.status
      );

      console.log(
        "POST result:",
        result
      );

      // =================================================
      // RESPONSE ERROR
      // =================================================

      if (!response.ok) {
        let errorMessage =
          result?.message ||
          result?.error ||
          result?.raw;

        if (!errorMessage) {
          errorMessage =
            `Gagal membuat tugas. Status: ${response.status}`;
        }

        throw new Error(
          String(errorMessage)
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      console.log(
        "Tugas berhasil dibuat."
      );

      // Ambil ulang data dari database
      await fetchTugas();

      // Hapus file temporary dari frontend
      setFiles((prev) =>
        prev.filter(
          (file) =>
            file.id !== selectedFileId
        )
      );

      // Reset file terpilih
      setSelectedFileId(null);

      // Tampilkan success alert
      showSuccessAlert(
        "Tugas berhasil dibuat dan disimpan ke database."
      );
    } catch (error) {
      console.error(
        "================================"
      );

      console.error(
        "ERROR CREATE TUGAS"
      );

      console.error(error);

      console.error(
        "================================"
      );

      showErrorAlert(
        error?.message ||
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
    Boolean(
      selectedTipeKelas &&
      selectedFileId &&
      selectedKelas &&
      !creating
    );

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
    <div
      className="relative bg-slate-50 overflow-y-auto"
      style={{
        height: "100vh",
      }}
    >
      {/* =================================================
          ERROR ALERT
          ================================================= */}

      {errorAlert && (
        <div className="fixed right-6 top-6 z-[9999] w-[380px] overflow-hidden rounded-xl border border-red-200 bg-white shadow-xl">
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle
                  className="h-5 w-5 text-red-500"
                  strokeWidth={2}
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900">
                  Gagal Membuat Tugas
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {errorAlert}
                </p>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={() =>
                  setErrorAlert("")
                }
                className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
              >
                <X
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* Progress 5 detik */}
          <div className="h-1 w-full bg-red-100">
            <div
              className="h-full bg-red-500"
              style={{
                animation:
                  "errorAlertProgress 5s linear forwards",
              }}
            />
          </div>

          <style jsx>{`
            @keyframes errorAlertProgress {
              from {
                width: 100%;
              }

              to {
                width: 0%;
              }
            }
          `}</style>
        </div>
      )}

      {/* =================================================
          SUCCESS ALERT
          ================================================= */}

      {successAlert && (
        <div className="fixed right-6 top-6 z-[9999] w-[380px] overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-xl">
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  className="h-5 w-5 text-emerald-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M5 12.5L9.5 17L19 7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900">
                  Berhasil
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {successAlert}
                </p>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={() =>
                  setSuccessAlert("")
                }
                className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
              >
                <X
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* Progress 5 detik */}
          <div className="h-1 w-full bg-emerald-100">
            <div
              className="h-full bg-emerald-500"
              style={{
                animation:
                  "successAlertProgress 5s linear forwards",
              }}
            />
          </div>

          <style jsx>{`
            @keyframes successAlertProgress {
              from {
                width: 100%;
              }

              to {
                width: 0%;
              }
            }
          `}</style>
        </div>
      )}

      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <div className="p-6">
        {/* =================================================
            TITLE
            ================================================= */}

        <h1 className="text-2xl font-bold text-slate-900">
          TUGAS
        </h1>

        <div className="mt-8 flex gap-8">
          {/* =================================================
              LEFT COLUMN
              ================================================= */}

          <div className="flex-1">
            {/* =================================================
                UPLOAD BUTTON
                ================================================= */}

            <button
              type="button"
              onClick={
                handleUploadButtonClick
              }
              className="mb-4 rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-600"
            >
              Upload File
            </button>

            {/* Hidden input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={
                handleFileSelected
              }
            />

            {/* =================================================
                FILE TABLE
                ================================================= */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {/* HEADER */}

              <div className="grid grid-cols-[60px_1fr_96px] gap-4 px-6 py-4">
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

              {/* DATA FILE */}

              {files.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">
                  Belum ada file yang
                  diunggah.
                </div>
              ) : (
                files.map(
                  (file, index) => (
                    <div
                      key={file.id}
                      className={`grid grid-cols-[60px_1fr_96px] items-center gap-4 px-6 py-4 ${
                        index !==
                        files.length - 1
                          ? "border-t border-slate-100"
                          : ""
                      }`}
                    >
                      {/* NO */}

                      <span className="text-sm text-slate-500">
                        {index + 1}
                      </span>

                      {/* NAMA FILE */}

                      <span className="truncate text-sm text-slate-900">
                        {file.name}
                      </span>

                      {/* AKSI */}

                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          aria-label={`Hapus ${file.name}`}
                          onClick={() =>
                            openDeleteModal(
                              file
                            )
                          }
                          className="text-slate-500 transition-colors hover:text-red-500"
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

            {/* =================================================
                CREATE
                ================================================= */}

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={!canCreate}
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

            {/* =================================================
                TUGAS DATABASE TABLE
                ================================================= */}

            <div className="mt-6 min-h-[220px] rounded-xl border border-slate-200 bg-white p-6">
              {/* HEADER */}

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

              {/* DATA */}

              <div
                className="overflow-y-auto"
                style={{
                  maxHeight: "300px",
                }}
              >
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
                ) : tugasList.length ===
                  0 ? (
                  <div className="py-10 text-center text-sm text-slate-400">
                    Belum ada tugas
                    yang dibuat.
                  </div>
                ) : (
                  tugasList.map(
                    (item, index) => (
                      <div
                        key={
                          item.KasusID ||
                          item.kasus_id ||
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
                            "-"}{" "}
                          {item.TipeKelas
                            ? `- ${item.TipeKelas}`
                            : ""}
                        </span>

                        <span className="truncate text-sm text-slate-500">
                          {item.NamaFile ||
                            item.NamaTugas ||
                            "-"}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT COLUMN
              ================================================= */}

          <div className="w-48 shrink-0">
            {/* =================================================
                TIPE KELAS DROPDOWN
                ================================================= */}

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

            {/* =================================================
                KELAS
                ================================================= */}

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
              ) : kelasList.length ===
                0 ? (
                <div className="py-4 text-center text-sm text-slate-400">
                  Tidak ada kelas
                  untuk tipe ini.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {kelasList.map(
                    (kelas) => {
                      const active =
                        String(
                          selectedKelas
                        ) ===
                        String(
                          kelas.kode_kelas
                        );

                      return (
                        <button
                          type="button"
                          key={
                            kelas.kode_kelas
                          }
                          onClick={() =>
                            selectKelas(
                              kelas.kode_kelas
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
                              kelas.kode_kelas
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

        {/* =====================================================
            DELETE MODAL
            ===================================================== */}

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
                    Apakah kamu yakin
                    ingin menghapus{" "}
                    <span className="font-medium text-slate-700">
                      {
                        deletingFile.name
                      }
                    </span>
                    ? Tindakan ini
                    tidak bisa
                    dibatalkan.
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
    </div>
  );
}