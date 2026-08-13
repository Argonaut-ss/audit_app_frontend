"use client";

import { useEffect, useRef, useState } from "react";
import {
  Trash2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

import AlertError from "@/components/layout/admin/alert/alert_error";
import AlertSuccess from "@/components/layout/admin/alert/alert_success";

const tipeKelasOptions = [
  "UTS",
  "UAS",
  "TUGAS",
  "Sandbox",
];

const tipeKelasBackendMap = {
  UTS: "UTS",
  UAS: "UAS",
  TUGAS: "Tugas",
  Sandbox: "Sandbox",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export default function TugasPage() {
  // =====================================================
  // FILE
  // =====================================================

  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] =
    useState(null);

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

  const [kelasList, setKelasList] = useState([]);
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
  // NAMA PERUSAHAAN / CLIENT
  // =====================================================

  /*
   * Nama state tetap namaPerusahaan karena
   * ini hanya nama variabel frontend.
   *
   * Yang dikirim ke backend adalah:
   *
   * Client
   */
  const [namaPerusahaan, setNamaPerusahaan] =
    useState("");

  // =====================================================
  // DELETE FILE MODAL
  // =====================================================

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [deletingFile, setDeletingFile] =
    useState(null);

  // =====================================================
  // DELETE TUGAS MODAL
  // =====================================================

  const [
    deleteTugasModalOpen,
    setDeleteTugasModalOpen,
  ] = useState(false);

  const [deletingTugas, setDeletingTugas] =
    useState(null);

  const [
    deletingTugasLoading,
    setDeletingTugasLoading,
  ] = useState(false);

  // =====================================================
  // CREATE LOADING
  // =====================================================

  const [creating, setCreating] =
    useState(false);

  // =====================================================
  // ERROR / SUCCESS ALERT
  // =====================================================

  const [errorAlert, setErrorAlert] =
    useState("");

  const [successAlert, setSuccessAlert] =
    useState("");

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

        const result =
          await parseResponse(response);

        console.log(
          "GET /api/kelas:",
          result
        );

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

        // =================================================
        // FILTER TIPE KELAS
        // =================================================

        const filteredKelas = data.filter(
          (kelas) => {
            const tipeDatabase =
              kelas.tipe_kelas ??
              kelas.TipeKelas ??
              kelas.tipeKelas ??
              "";

            return (
              String(
                tipeDatabase
              ).toLowerCase() ===
              String(
                selectedTipeKelas
              ).toLowerCase()
            );
          }
        );

        // =================================================
        // DEDUPLIKASI KELAS
        // =================================================
        //
        // Jika:
        //
        // LA01 Senin 08:00
        // LA01 Rabu 10:00
        //
        // maka frontend hanya menampilkan:
        //
        // LA01
        //
        // karena tugas dimiliki oleh kode kelas + tipe,
        // bukan oleh hari/jam.
        // =================================================

        const uniqueKelas = [];
        const seenKelas = new Set();

        filteredKelas.forEach((kelas) => {
          const kodeKelas =
            kelas.kode_kelas ??
            kelas.KelasID ??
            kelas.kelas_id ??
            kelas.KodeKelas ??
            "";

          const tipeKelas =
            kelas.tipe_kelas ??
            kelas.TipeKelas ??
            kelas.tipeKelas ??
            "";

          const uniqueKey =
            `${String(kodeKelas)
              .trim()
              .toLowerCase()}|${String(
              tipeKelas
            )
              .trim()
              .toLowerCase()}`;

          if (!seenKelas.has(uniqueKey)) {
            seenKelas.add(uniqueKey);
            uniqueKelas.push(kelas);
          }
        });

        console.log(
          "Kelas setelah filter:",
          filteredKelas
        );

        console.log(
          "Kelas setelah deduplikasi:",
          uniqueKelas
        );

        setKelasList(uniqueKelas);
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

      const result =
        await parseResponse(response);

      console.log(
        "GET /api/kasus:",
        result
      );

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
    // DATA FILE
    // ===================================================

    const newFile = {
      id: Date.now(),
      name: file.name,
      file: file,
    };

    setFiles((prev) => [
      ...prev,
      newFile,
    ]);

    // File otomatis dipilih
    setSelectedFileId(newFile.id);

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
  // DELETE TUGAS MODAL
  // =====================================================

  const openDeleteTugasModal = (tugas) => {
    setDeletingTugas(tugas);
    setDeleteTugasModalOpen(true);
  };

  // =====================================================
  // CONFIRM DELETE TUGAS
  // =====================================================

  const handleConfirmDeleteTugas =
    async () => {
      if (!deletingTugas) {
        return;
      }

      const kasusId =
        deletingTugas.KasusID ??
        deletingTugas.kasus_id;

      if (!kasusId) {
        showErrorAlert(
          "ID tugas tidak ditemukan."
        );
        return;
      }

      try {
        setDeletingTugasLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/kasus/${kasusId}`,
            {
              method: "DELETE",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const result =
          await parseResponse(
            response
          );

        console.log(
          "DELETE /api/kasus:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              result?.raw ||
              `Gagal menghapus tugas. Status: ${response.status}`
          );
        }

        setTugasList((prev) =>
          prev.filter((item) => {
            const itemId =
              item.KasusID ??
              item.kasus_id;

            return (
              String(itemId) !==
              String(kasusId)
            );
          })
        );

        setDeleteTugasModalOpen(
          false
        );

        setDeletingTugas(null);

        showSuccessAlert(
          "Tugas berhasil dihapus."
        );
      } catch (error) {
        console.error(
          "ERROR DELETE TUGAS:",
          error
        );

        showErrorAlert(
          error?.message ||
            "Gagal menghapus tugas."
        );
      } finally {
        setDeletingTugasLoading(false);
      }
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
      !namaPerusahaan.trim() ||
      !selectedTipeKelas ||
      !selectedFileId ||
      !selectedKelas
    ) {
      showErrorAlert(
        "Isi nama perusahaan, pilih tipe kelas, satu kelas, dan satu file."
      );

      return;
    }

    // ===================================================
    // CARI FILE
    // ===================================================

    const selectedFile =
      files.find(
        (file) =>
          file.id ===
          selectedFileId
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

    const kelas =
      kelasList.find(
        (item) =>
          String(
            item.kode_kelas ??
              item.KelasID ??
              item.kelas_id ??
              item.KodeKelas
          ) ===
          String(
            selectedKelas
          )
      );

    if (!kelas) {
      showErrorAlert(
        "Kelas tidak ditemukan."
      );

      return;
    }

    const kodeKelas =
      kelas.kode_kelas ??
      kelas.KelasID ??
      kelas.kelas_id ??
      kelas.KodeKelas;

    // ===================================================
    // KONVERSI TIPE KELAS FRONTEND → BACKEND
    // ===================================================

    const tipeKelas =
      tipeKelasBackendMap[
        selectedTipeKelas
      ];

    // ===================================================
    // CEK APAKAH KELAS + TIPE SUDAH MEMILIKI TUGAS
    // ===================================================

    const kelasSudahMemilikiTugas =
      tugasList.some((item) => {
        const kelasTugas =
          item.KelasID ??
          item.kelas_id ??
          item.kode_kelas ??
          item.KodeKelas ??
          "";

        const tipeTugas =
          item.TipeKelas ??
          item.tipe_kelas ??
          item.tipeKelas ??
          "";

        return (
          String(kelasTugas)
            .trim()
            .toLowerCase() ===
            String(kodeKelas)
              .trim()
              .toLowerCase() &&
          String(tipeTugas)
            .trim()
            .toLowerCase() ===
            String(tipeKelas)
              .trim()
              .toLowerCase()
        );
      });

    if (kelasSudahMemilikiTugas) {
      showErrorAlert(
        `Kelas ${kodeKelas} dengan tipe ${tipeKelas} sudah memiliki tugas.`
      );

      return;
    }

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

      const formData =
        new FormData();

      formData.append(
        "KelasID",
        String(kodeKelas)
      );

      formData.append(
        "TipeKelas",
        String(tipeKelas)
      );

      formData.append(
        "NamaTugas",
        namaTugas
      );

      /*
       * =================================================
       * CLIENT
       * =================================================
       *
       * UI tetap menggunakan state namaPerusahaan.
       *
       * Tetapi nama field yang dikirim ke Laravel
       * HARUS "Client" karena backend menggunakan:
       *
       * $request->validate([
       *     'Client' => [...]
       * ]);
       */
      formData.append(
        "NamaClient",
        namaPerusahaan.trim()
      );

      formData.append(
        "file",
        selectedFile.file,
        selectedFile.name
      );

      // =================================================
      // DEBUG
      // =================================================

      console.log(
        "CREATE TUGAS"
      );

      console.log(
        "API:",
        `${API_URL}/api/kasus`
      );

      console.log({
        KelasID: kodeKelas,
        TipeKelas: tipeKelas,
        NamaClient:
          namaPerusahaan.trim(),
        NamaTugas: namaTugas,
        NamaFile:
          selectedFile.name,
        FileType:
          selectedFile.file.type,
        FileSize:
          selectedFile.file.size,
      });

      for (const [
        key,
        value,
      ] of formData.entries()) {
        console.log(
          "FormData:",
          key,
          value
        );
      }

      // =================================================
      // POST
      // =================================================

      const response =
        await fetch(
          `${API_URL}/api/kasus`,
          {
            method: "POST",
            body: formData,
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const result =
        await parseResponse(
          response
        );

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

      // Ambil ulang dari database
      await fetchTugas();

      // Hapus file temporary
      setFiles((prev) =>
        prev.filter(
          (file) =>
            file.id !==
            selectedFileId
        )
      );

      setSelectedFileId(null);

      // Reset nama perusahaan
      setNamaPerusahaan("");

      showSuccessAlert(
        "Tugas berhasil dibuat dan disimpan ke database."
      );
    } catch (error) {
      console.error(
        "ERROR CREATE TUGAS:",
        error
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

  const canCreate = Boolean(
    namaPerusahaan.trim() &&
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
    <div className="relative h-full overflow-y-auto bg-slate-50">
      {/* =================================================
          ERROR ALERT
      ================================================= */}

      {errorAlert && (
        <AlertError
          message={errorAlert}
          onClose={() =>
            setErrorAlert("")
          }
        />
      )}

      {/* =================================================
          SUCCESS ALERT
      ================================================= */}

      {successAlert && (
        <AlertSuccess
          message={successAlert}
          onClose={() =>
            setSuccessAlert("")
          }
        />
      )}

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          TUGAS
        </h1>

        <div className="mt-8 flex gap-8">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="flex-1">

            {/* =================================================
                UPLOAD FILE
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
                UPLOAD FILE TABLE
            ================================================= */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

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

              {files.length === 0 ? (

                <div className="px-6 py-8 text-center text-sm text-slate-400">
                  Belum ada file
                  yang
                  diunggah.
                </div>

              ) : (

                files.map(
                  (
                    file,
                    index
                  ) => (

                    <div
                      key={
                        file.id
                      }
                      className={`grid grid-cols-[60px_1fr_96px] items-center gap-4 px-6 py-4 ${
                        index !==
                        files.length -
                          1
                          ? "border-t border-slate-100"
                          : ""
                      }`}
                    >

                      <span className="text-sm text-slate-500">
                        {index + 1}
                      </span>

                      <span className="truncate text-sm text-slate-900">
                        {file.name}
                      </span>

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
                            strokeWidth={
                              1.8
                            }
                          />

                        </button>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

            {/* =================================================
                NAMA PERUSAHAAN
            ================================================= */}

            <div className="mt-4">

              <label
                htmlFor="nama-perusahaan"
                className="mb-2 block text-sm font-semibold text-slate-500"
              >
                Nama Perusahaan
              </label>

              <input
                id="nama-perusahaan"
                type="text"
                value={
                  namaPerusahaan
                }
                onChange={(e) =>
                  setNamaPerusahaan(
                    e.target.value
                  )
                }
                placeholder="Masukkan nama perusahaan"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />

            </div>

            {/* =================================================
                CREATE BUTTON
            ================================================= */}

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
                    Isi nama
                    perusahaan,
                    pilih Tipe
                    Kelas, satu
                    kelas, dan
                    satu file
                    untuk
                    membuat
                    tugas.
                  </span>

                )}

            </div>

            {/* =================================================
                DAFTAR TUGAS
                (PERBAIKAN SCROLL DI SINI)
            ================================================= */}

            <div className="mt-6 flex min-h-[220px] min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-6">

              {/* HEADER */}

              <div className="grid grid-cols-[60px_1fr_1.2fr_1fr_70px] gap-4 border-b border-slate-200 pb-3">

                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  No
                </span>

                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Kelas
                </span>

                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nama Perusahaan
                </span>

                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nama File
                </span>

                <span className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Aksi
                </span>

              </div>

              {/* DATA */}

              <div className="min-h-0">

                {loadingTugas ? (

                  <div className="py-10 text-center text-sm text-slate-400">
                    Memuat tugas...
                  </div>

                ) : tugasError ? (

                  <div className="py-10 text-center">

                    <p className="text-sm text-red-500">
                      Gagal memuat
                      tugas.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {
                        tugasError
                      }
                    </p>

                  </div>

                ) : tugasList.length === 0 ? (

                  <div className="py-10 text-center text-sm text-slate-400">
                    Belum ada
                    tugas yang
                    dibuat.
                  </div>

                ) : (

                  tugasList.map(
                    (
                      item,
                      index
                    ) => (

                      <div
                        key={
                          item.KasusID ||
                          item.kasus_id ||
                          index
                        }
                        className="grid grid-cols-[60px_1fr_1.2fr_1fr_70px] items-center gap-4 border-b border-slate-100 py-3 last:border-0"
                      >

                        {/* NO */}

                        <span className="text-sm text-slate-500">
                          {index + 1}
                        </span>

                        {/* KELAS */}

                        <span
                          className="truncate text-sm text-slate-900"
                          title={`${item.NamaKelas || item.KelasID || "-"}${
                            item.TipeKelas
                              ? ` - ${item.TipeKelas}`
                              : ""
                          }`}
                        >
                          {item.NamaKelas ||
                            item.KelasID ||
                            "-"}{" "}
                          {item.TipeKelas
                            ? `- ${item.TipeKelas}`
                            : ""}
                        </span>

                        {/* CLIENT */}

                        <span
                          className="truncate text-sm text-slate-900"
                          title={
                            item.NamaClient ||
                            "-"
                          }
                        >
                          {item.NamaClient ||
                            "-"}
                        </span>

                        {/* NAMA FILE */}

                        <span
                          className="truncate text-sm text-slate-500"
                          title={
                            item.NamaFile ||
                            item.NamaTugas ||
                            "-"
                          }
                        >
                          {item.NamaFile ||
                            item.NamaTugas ||
                            "-"}
                        </span>

                        {/* AKSI */}

                        <div className="flex items-center justify-end">

                          <button
                            type="button"
                            aria-label={`Hapus tugas ${
                              item.NamaTugas ||
                              item.NamaFile ||
                              ""
                            }`}
                            onClick={() =>
                              openDeleteTugasModal(
                                item
                              )
                            }
                            className="text-slate-500 transition-colors hover:text-red-500"
                          >

                            <Trash2
                              className="h-4 w-4"
                              strokeWidth={
                                1.8
                              }
                            />

                          </button>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          </div>

          {/* =================================================
              RIGHT SIDEBAR
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
                  {
                    dropdownLabel
                  }
                </span>

                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    tipeKelasOpen
                      ? "rotate-180"
                      : ""
                  }`}
                  strokeWidth={
                    2
                  }
                />

              </button>

              {tipeKelasOpen && (

                <div className="absolute right-0 z-10 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

                  {tipeKelasOptions.map(
                    (
                      tipe,
                      index
                    ) => (

                      <button
                        type="button"
                        key={
                          tipe
                        }
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
                        {
                          tipe
                        }
                      </button>

                    )
                  )}

                </div>

              )}

            </div>

            {/* =================================================
                DAFTAR KELAS
            ================================================= */}

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">

              {loadingKelas ? (

                <div className="py-4 text-center text-sm text-slate-400">
                  Memuat kelas...
                </div>

              ) : kelasError ? (

                <div className="py-4 text-center">

                  <p className="text-sm text-red-500">
                    Gagal memuat
                    kelas.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      kelasError
                    }
                  </p>

                </div>

              ) : !selectedTipeKelas ? (

                <div className="py-4 text-center text-sm text-slate-400">
                  Pilih tipe
                  kelas terlebih
                  dahulu.
                </div>

              ) : kelasList.length === 0 ? (

                <div className="py-4 text-center text-sm text-slate-400">
                  Tidak ada
                  kelas untuk
                  tipe ini.
                </div>

              ) : (

                <div className="flex flex-col gap-3">

                  {kelasList.map(
                    (kelas) => {

                      const kodeKelas =
                        kelas.kode_kelas ??
                        kelas.KelasID ??
                        kelas.kelas_id ??
                        kelas.KodeKelas;

                      const active =
                        String(
                          selectedKelas
                        ) ===
                        String(
                          kodeKelas
                        );

                      return (

                        <button
                          type="button"
                          key={`${kodeKelas}-${selectedTipeKelas}`}
                          onClick={() =>
                            selectKelas(
                              kodeKelas
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
                              kodeKelas
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

        {/* =================================================
            DELETE FILE MODAL
        ================================================= */}

        {deleteModalOpen &&
          deletingFile && (

            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">

              <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">

                <div className="flex flex-col items-center text-center">

                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">

                    <AlertTriangle
                      className="h-6 w-6 text-red-500"
                      strokeWidth={
                        1.8
                      }
                    />

                  </div>

                  <h2 className="text-base font-bold text-slate-900">
                    Hapus file
                    ini?
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">

                    Apakah kamu
                    yakin ingin
                    menghapus{" "}

                    <span className="font-medium text-slate-700">
                      {
                        deletingFile.name
                      }
                    </span>

                    ? Tindakan
                    ini tidak
                    bisa
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

                      setDeletingFile(
                        null
                      );
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

        {/* =================================================
            DELETE TUGAS MODAL
        ================================================= */}

        {deleteTugasModalOpen &&
          deletingTugas && (

            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">

              <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">

                <div className="flex flex-col items-center text-center">

                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">

                    <AlertTriangle
                      className="h-6 w-6 text-red-500"
                      strokeWidth={
                        1.8
                      }
                    />

                  </div>

                  <h2 className="text-base font-bold text-slate-900">
                    Hapus tugas
                    ini?
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">

                    Apakah kamu
                    yakin ingin
                    menghapus
                    tugas{" "}

                    <span className="font-medium text-slate-700">

                      {deletingTugas.NamaClient ||
                        deletingTugas.NamaTugas ||
                        deletingTugas.NamaFile ||
                        "-"}

                    </span>

                    ?

                    <br />

                    Tindakan ini
                    tidak bisa
                    dibatalkan.

                  </p>

                </div>

                <div className="mt-6 flex justify-center gap-3">

                  <button
                    type="button"
                    disabled={
                      deletingTugasLoading
                    }
                    onClick={() => {
                      setDeleteTugasModalOpen(
                        false
                      );

                      setDeletingTugas(
                        null
                      );
                    }}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    disabled={
                      deletingTugasLoading
                    }
                    onClick={
                      handleConfirmDeleteTugas
                    }
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingTugasLoading
                      ? "Menghapus..."
                      : "Ya, Hapus"}
                  </button>

                </div>

              </div>

            </div>

          )}

      </div>
    </div>
  );
}