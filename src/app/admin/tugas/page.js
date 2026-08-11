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
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);

  const fileInputRef = useRef(null);

  const [tugasList, setTugasList] = useState([]);
  const [loadingTugas, setLoadingTugas] = useState(false);
  const [tugasError, setTugasError] = useState(null);

  const [kelasList, setKelasList] = useState([]);
  const [loadingKelas, setLoadingKelas] = useState(false);
  const [kelasError, setKelasError] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState(null);

  const [tipeKelasOpen, setTipeKelasOpen] = useState(false);
  const [selectedTipeKelas, setSelectedTipeKelas] =
    useState(null);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);
  const [deletingFile, setDeletingFile] =
    useState(null);

  const [creating, setCreating] = useState(false);

  const [errorAlert, setErrorAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");

  const showErrorAlert = (message) => {
    setErrorAlert(message);

    setTimeout(() => {
      setErrorAlert("");
    }, 5000);
  };

  const showSuccessAlert = (message) => {
    setSuccessAlert(message);

    setTimeout(() => {
      setSuccessAlert("");
    }, 5000);
  };

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
              .toLowerCase()}|${String(tipeKelas)
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

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      showErrorAlert("File harus berupa PDF.");

      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showErrorAlert(
        "Ukuran file maksimal 10MB."
      );

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

    setSelectedFileId(newFile.id);

    e.target.value = "";
  };

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

  const selectKelas = (kelasID) => {
    setSelectedKelas((prev) =>
      prev === kelasID
        ? null
        : kelasID
    );
  };

  const selectTipeKelas = (tipe) => {
    setSelectedTipeKelas(tipe);
    setTipeKelasOpen(false);
  };

  const handleCreate = async () => {
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

    const kelas = kelasList.find(
      (item) =>
        String(
          item.kode_kelas ??
            item.KelasID ??
            item.kelas_id ??
            item.KodeKelas
        ) ===
        String(selectedKelas)
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

    const tipeKelas =
      tipeKelasBackendMap[selectedTipeKelas];

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

      const namaTugas =
        selectedFile.name.replace(
          /\.pdf$/i,
          ""
        );

      const formData = new FormData();

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
        KelasID: kodeKelas,
        TipeKelas: tipeKelas,
        NamaTugas: namaTugas,
        NamaFile: selectedFile.name,
        FileType: selectedFile.file.type,
        FileSize: selectedFile.file.size,
      });

      console.log(
        "================================"
      );

      for (const [key, value] of formData.entries()) {
        console.log(
          "FormData:",
          key,
          value
        );
      }

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

      console.log(
        "Tugas berhasil dibuat."
      );

      await fetchTugas();

      setFiles((prev) =>
        prev.filter(
          (file) =>
            file.id !== selectedFileId
        )
      );

      setSelectedFileId(null);

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

  const canCreate =
    Boolean(
      selectedTipeKelas &&
        selectedFileId &&
        selectedKelas &&
        !creating
    );

  const dropdownLabel =
    selectedTipeKelas ||
    "Tipe Kelas";

  return (
    <div
      className="relative bg-slate-50 overflow-y-auto"
      style={{
        height: "100vh",
      }}
    >
      {errorAlert && (
        <div className="fixed right-6 top-6 z-[9999] w-[380px] overflow-hidden rounded-xl border border-red-200 bg-white shadow-xl">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle
                  className="h-5 w-5 text-red-500"
                  strokeWidth={2}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900">
                  Gagal Membuat Tugas
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {errorAlert}
                </p>
              </div>

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

      {successAlert && (
        <div className="fixed right-6 top-6 z-[9999] w-[380px] overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-xl">
          <div className="p-4">
            <div className="flex items-start gap-3">
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

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900">
                  Berhasil
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {successAlert}
                </p>
              </div>

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

      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          TUGAS
        </h1>

        <div className="mt-8 flex gap-8">
          <div className="flex-1">
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
                            strokeWidth={1.8}
                          />
                        </button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>

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

          <div className="w-48 shrink-0">
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
                            {kodeKelas}
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
      </div>
    </div>
  );
}