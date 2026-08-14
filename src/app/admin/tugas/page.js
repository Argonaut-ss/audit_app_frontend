"use client";

import { useEffect, useRef, useState } from "react";

import {
  Trash2,
  ChevronDown,
} from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";

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
  // TUGAS
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
  // FORM
  // =====================================================

  const [namaPerusahaan, setNamaPerusahaan] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  // =====================================================
  // DELETE FILE POPUP
  // =====================================================

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [deletingFile, setDeletingFile] =
    useState(null);

  // =====================================================
  // DELETE TUGAS POPUP
  // =====================================================

  const [deleteTugasModalOpen, setDeleteTugasModalOpen] =
    useState(false);

  const [deletingTugas, setDeletingTugas] =
    useState(null);

  const [deletingTugasLoading, setDeletingTugasLoading] =
    useState(false);

  // =====================================================
  // ALERT
  // =====================================================

  const [errorAlert, setErrorAlert] =
    useState({
      title: "",
      message: "",
    });

  const [successAlert, setSuccessAlert] =
    useState({
      title: "",
      message: "",
    });

  // =====================================================
  // ALERT FUNCTION
  // =====================================================

  const showErrorAlert = (
    title,
    message
  ) => {
    setErrorAlert({
      title,
      message,
    });
  };

  const showSuccessAlert = (
    title,
    message
  ) => {
    setSuccessAlert({
      title,
      message,
    });
  };

  // =====================================================
  // PARSE RESPONSE
  // =====================================================

  const parseResponse = async (
    response
  ) => {
    const text =
      await response.text();

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

        const response =
          await fetch(
            `${API_URL}/api/kelas`,
            {
              method: "GET",
              cache: "no-store",
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

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              result?.raw ||
              `Gagal mengambil data kelas. Status: ${response.status}`
          );
        }

        let data = [];

        if (
          Array.isArray(
            result?.data
          )
        ) {
          data = result.data;
        } else if (
          Array.isArray(result)
        ) {
          data = result;
        }

        const filteredKelas =
          data.filter((kelas) => {
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
          });

        const uniqueKelas = [];
        const seenKelas =
          new Set();

        filteredKelas.forEach(
          (kelas) => {
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
              `${String(
                kodeKelas
              )
                .trim()
                .toLowerCase()}|${String(
                tipeKelas
              )
                .trim()
                .toLowerCase()}`;

            if (
              !seenKelas.has(
                uniqueKey
              )
            ) {
              seenKelas.add(
                uniqueKey
              );

              uniqueKelas.push(
                kelas
              );
            }
          }
        );

        setKelasList(
          uniqueKelas
        );
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
        setLoadingKelas(
          false
        );
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

      const response =
        await fetch(
          `${API_URL}/api/kasus`,
          {
            method: "GET",
            cache: "no-store",
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
      } else if (
        Array.isArray(result?.data)
      ) {
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
  // UPLOAD FILE
  // =====================================================

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.type !==
      "application/pdf"
    ) {
      showErrorAlert(
        "Format Tidak Valid",
        "File harus berupa PDF."
      );

      e.target.value = "";
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      showErrorAlert(
        "Ukuran File Terlalu Besar",
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

    setSelectedFileId(
      newFile.id
    );

    e.target.value = "";
  };

  // =====================================================
  // DELETE FILE
  // =====================================================

  const openDeleteModal = (
    file
  ) => {
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
  // DELETE TUGAS
  // =====================================================

  const openDeleteTugasModal = (
    tugas
  ) => {
    setDeletingTugas(tugas);
    setDeleteTugasModalOpen(true);
  };

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
          "Data Tidak Valid",
          "ID tugas tidak ditemukan."
        );

        return;
      }

      try {
        setDeletingTugasLoading(
          true
        );

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

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              result?.raw ||
              `Gagal menghapus tugas. Status: ${response.status}`
          );
        }

        setTugasList(
          (prev) =>
            prev.filter(
              (item) => {
                const itemId =
                  item.KasusID ??
                  item.kasus_id;

                return (
                  String(
                    itemId
                  ) !==
                  String(
                    kasusId
                  )
                );
              }
            )
        );

        setDeleteTugasModalOpen(
          false
        );

        setDeletingTugas(null);

        showSuccessAlert(
          "Berhasil dihapus",
          "Tugas berhasil dihapus."
        );
      } catch (error) {
        console.error(
          "ERROR DELETE TUGAS:",
          error
        );

        showErrorAlert(
          "Gagal dihapus",
          error?.message ||
            "Gagal menghapus tugas."
        );
      } finally {
        setDeletingTugasLoading(
          false
        );
      }
    };

  // =====================================================
  // SELECT KELAS
  // =====================================================

  const selectKelas = (
    kelasID
  ) => {
    setSelectedKelas(
      (prev) =>
        prev === kelasID
          ? null
          : kelasID
    );
  };

  // =====================================================
  // SELECT TIPE KELAS
  // =====================================================

  const selectTipeKelas = (
    tipe
  ) => {
    setSelectedTipeKelas(
      tipe
    );

    setTipeKelasOpen(false);
  };

  // =====================================================
  // CREATE TUGAS
  // =====================================================

  const handleCreate =
    async () => {
      if (
        !namaPerusahaan.trim() ||
        !selectedTipeKelas ||
        !selectedFileId ||
        !selectedKelas
      ) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Isi nama perusahaan, pilih tipe kelas, satu kelas, dan satu file."
        );

        return;
      }

      const selectedFile =
        files.find(
          (file) =>
            file.id ===
            selectedFileId
        );

      if (!selectedFile) {
        showErrorAlert(
          "File Tidak Ditemukan",
          "File tidak ditemukan."
        );

        return;
      }

      if (!selectedFile.file) {
        showErrorAlert(
          "File Tidak Valid",
          "File tidak valid."
        );

        return;
      }

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
          "Kelas Tidak Ditemukan",
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
        tipeKelasBackendMap[
          selectedTipeKelas
        ];

      const kelasSudahMemilikiTugas =
        tugasList.some(
          (item) => {
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
              String(
                kelasTugas
              )
                .trim()
                .toLowerCase() ===
                String(
                  kodeKelas
                )
                  .trim()
                  .toLowerCase() &&
              String(
                tipeTugas
              )
                .trim()
                .toLowerCase() ===
                String(
                  tipeKelas
                )
                  .trim()
                  .toLowerCase()
            );
          }
        );

      if (
        kelasSudahMemilikiTugas
      ) {
        showErrorAlert(
          "Tugas Sudah Ada",
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

        formData.append(
          "NamaClient",
          namaPerusahaan.trim()
        );

        formData.append(
          "file",
          selectedFile.file,
          selectedFile.name
        );

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

        if (!response.ok) {
          const errorMessage =
            result?.message ||
            result?.error ||
            result?.raw ||
            `Gagal membuat tugas. Status: ${response.status}`;

          throw new Error(
            String(
              errorMessage
            )
          );
        }

        await fetchTugas();

        setFiles((prev) =>
          prev.filter(
            (file) =>
              file.id !==
              selectedFileId
          )
        );

        setSelectedFileId(null);
        setNamaPerusahaan("");

        showSuccessAlert(
          "Berhasil ditambah",
          "Tugas berhasil dibuat dan disimpan ke database."
        );
      } catch (error) {
        console.error(
          "ERROR CREATE TUGAS:",
          error
        );

        showErrorAlert(
          "Gagal ditambah",
          error?.message ||
            "Gagal membuat tugas."
        );
      } finally {
        setCreating(false);
      }
    };

  // =====================================================
  // CREATE CONDITION
  // =====================================================

  const canCreate = Boolean(
    namaPerusahaan.trim() &&
      selectedTipeKelas &&
      selectedFileId &&
      selectedKelas &&
      !creating
  );

  const dropdownLabel =
    selectedTipeKelas ||
    "Tipe Kelas";

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen px-10 py-10 font-poppins">

      {/* =================================================
          ALERT SUCCESS
      ================================================= */}

      <AlertSuccess
        title={successAlert.title}
        message={successAlert.message}
        onClose={() =>
          setSuccessAlert({
            title: "",
            message: "",
          })
        }
      />

      {/* =================================================
          ALERT ERROR
      ================================================= */}

      <AlertError
        title={errorAlert.title}
        message={errorAlert.message}
        onClose={() =>
          setErrorAlert({
            title: "",
            message: "",
          })
        }
      />

      {/* =================================================
          POPUP HAPUS FILE
      ================================================= */}

      <ConfirmationPopup
        isOpen={deleteModalOpen}
        message="Apakah Anda yakin ingin menghapus file?"
        subText={
          deletingFile
            ? deletingFile.name
            : ""
        }
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={
          handleConfirmDelete
        }
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeletingFile(null);
        }}
      />

      {/* =================================================
          POPUP HAPUS TUGAS
      ================================================= */}

      <ConfirmationPopup
        isOpen={
          deleteTugasModalOpen
        }
        message="Apakah Anda yakin ingin menghapus tugas?"
        subText={
          deletingTugas
            ? deletingTugas.NamaClient ||
              deletingTugas.NamaTugas ||
              deletingTugas.NamaFile ||
              "-"
            : ""
        }
        confirmText={
          deletingTugasLoading
            ? "Menghapus..."
            : "Hapus"
        }
        cancelText="Batal"
        onConfirm={
          handleConfirmDeleteTugas
        }
        onCancel={() => {
          if (
            deletingTugasLoading
          ) {
            return;
          }

          setDeleteTugasModalOpen(
            false
          );

          setDeletingTugas(null);
        }}
      />

      {/* =================================================
          TITLE
      ================================================= */}

      <h1 className="font-poppins text-[28px] font-semibold text-[#293144]">
        TUGAS
      </h1>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="mt-8 flex gap-8">

        {/* =================================================
            LEFT CONTENT
        ================================================= */}

        <div className="min-w-0 flex-1">

          {/* =================================================
              UPLOAD BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={
              handleUploadButtonClick
            }
            className="h-[46px] w-[155px] rounded-[7px] bg-[#42A5F5] font-poppins text-sm font-semibold text-white transition hover:bg-[#2196F3]"
          >
            + Upload File
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
              FILE TABLE
          ================================================= */}

          <div className="mt-4 overflow-hidden rounded-xl bg-white">

            <table className="w-full border-collapse">

              <thead>
                <tr className="border-b border-[#D9DEE8]">

                  <th className="w-[8%] px-6 pt-6 pb-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    NO
                  </th>

                  <th className="px-6 pt-6 pb-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    NAMA FILE
                  </th>

                  <th className="w-[12%] px-6 pt-6 pb-4 text-center font-poppins text-xs font-semibold text-[#6B7589]">
                    AKSI
                  </th>

                </tr>
              </thead>

              <tbody>

                {files.length > 0 ? (
                  files.map(
                    (
                      file,
                      index
                    ) => (
                      <tr
                        key={
                          file.id
                        }
                        className="border-b border-[#E5E7EB]"
                      >

                        <td className="px-6 py-4 font-poppins text-sm text-[#293144]">
                          {index + 1}
                        </td>

                        <td className="max-w-0 px-6 py-4 font-poppins text-sm text-[#293144]">
                          <span className="block truncate">
                            {
                              file.name
                            }
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">

                          <button
                            type="button"
                            aria-label={`Hapus ${file.name}`}
                            onClick={() =>
                              openDeleteModal(
                                file
                              )
                            }
                            className="text-black transition hover:text-red-500"
                          >
                            <Trash2
                              size={
                                16
                              }
                              strokeWidth={
                                1.8
                              }
                            />
                          </button>

                        </td>

                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="h-[120px] text-center align-middle font-poppins text-sm text-[#9CA3AF]"
                    >
                      Belum ada
                      file yang
                      diunggah.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              NAMA PERUSAHAAN
          ================================================= */}

          <div className="mt-5">

            <label
              htmlFor="nama-perusahaan"
              className="mb-2 block font-poppins text-sm font-semibold text-[#6B7589]"
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
              className="h-[46px] w-full rounded-[7px] border border-[#D9DEE8] bg-white px-4 font-poppins text-sm text-[#293144] outline-none transition focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]"
            />

          </div>

          {/* =================================================
              CREATE BUTTON
          ================================================= */}

          <div className="mt-5 flex items-center gap-4">

            <button
              type="button"
              onClick={
                handleCreate
              }
              disabled={
                !canCreate
              }
              className="h-[46px] w-[155px] rounded-[7px] bg-[#42A5F5] font-poppins text-sm font-semibold text-white transition hover:bg-[#2196F3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating
                ? "Creating..."
                : "Create"}
            </button>

            {!canCreate &&
              !creating && (
                <span className="font-poppins text-xs text-[#9CA3AF]">
                  Isi nama
                  perusahaan,
                  pilih Tipe
                  Kelas, satu
                  kelas, dan
                  satu file.
                </span>
              )}

          </div>

          {/* =================================================
              TUGAS TABLE
          ================================================= */}

          <div className="mt-6 overflow-hidden rounded-xl bg-white">

            <table className="w-full border-collapse">

              <thead className="bg-white">

                <tr className="border-b border-[#D9DEE8]">

                  <th className="w-[7%] px-6 pt-8 pb-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    NO
                  </th>

                  <th className="w-[20%] px-6 pt-8 pb-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    KELAS
                  </th>

                  <th className="w-[28%] px-6 pt-8 pb-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    NAMA PERUSAHAAN
                  </th>

                  <th className="w-[30%] px-6 pt-8 pb-4 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    NAMA FILE
                  </th>

                  <th className="w-[10%] px-6 pt-8 pb-4 text-center font-poppins text-xs font-semibold text-[#6B7589]">
                    AKSI
                  </th>

                </tr>

              </thead>

              <tbody>

                {loadingTugas ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-[180px] text-center align-middle font-poppins text-sm text-[#9CA3AF]"
                    >
                      Memuat
                      tugas...
                    </td>
                  </tr>
                ) : tugasError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-[180px] text-center align-middle font-poppins text-sm text-red-500"
                    >
                      Gagal
                      memuat
                      tugas.
                    </td>
                  </tr>
                ) : tugasList.length >
                  0 ? (
                  tugasList.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={
                          item.KasusID ||
                          item.kasus_id ||
                          index
                        }
                        className="border-b border-[#E5E7EB]"
                      >

                        <td className="px-6 py-4 font-poppins text-sm text-[#293144]">
                          {index + 1}
                        </td>

                        <td
                          className="max-w-0 px-6 py-4 font-poppins text-sm text-[#293144]"
                          title={`${item.NamaKelas || item.KelasID || "-"}${
                            item.TipeKelas
                              ? ` - ${item.TipeKelas}`
                              : ""
                          }`}
                        >
                          <span className="block truncate">
                            {item.NamaKelas ||
                              item.KelasID ||
                              "-"}{" "}
                            {item.TipeKelas
                              ? `- ${item.TipeKelas}`
                              : ""}
                          </span>
                        </td>

                        <td
                          className="max-w-0 px-6 py-4 font-poppins text-sm text-[#293144]"
                          title={
                            item.NamaClient ||
                            "-"
                          }
                        >
                          <span className="block truncate">
                            {item.NamaClient ||
                              "-"}
                          </span>
                        </td>

                        <td
                          className="max-w-0 px-6 py-4 font-poppins text-sm text-[#6B7589]"
                          title={
                            item.NamaFile ||
                            item.NamaTugas ||
                            "-"
                          }
                        >
                          <span className="block truncate">
                            {item.NamaFile ||
                              item.NamaTugas ||
                              "-"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">

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
                            className="text-black transition hover:text-red-500"
                          >
                            <Trash2
                              size={
                                16
                              }
                              strokeWidth={
                                1.8
                              }
                            />
                          </button>

                        </td>

                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-[220px] text-center align-middle font-poppins text-sm text-[#9CA3AF]"
                    >
                      No Data
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =================================================
            RIGHT SIDE
            TIPE KELAS TETAP DI SINI
        ================================================= */}

        <div className="w-48 shrink-0">

          {/* =================================================
              DROPDOWN TIPE KELAS
          ================================================= */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setTipeKelasOpen(
                  !tipeKelasOpen
                )
              }
              className="flex h-[46px] w-full items-center justify-between rounded-[7px] border border-[#D9DEE8] bg-white px-4 font-poppins text-sm font-semibold text-[#293144] transition hover:border-[#42A5F5]"
            >

              <span className="truncate">
                {
                  dropdownLabel
                }
              </span>

              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  tipeKelasOpen
                    ? "rotate-180"
                    : ""
                }`}
                strokeWidth={
                  2
                }
              />

            </button>

            {/* DROPDOWN LIST */}

            {tipeKelasOpen && (
              <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-[7px] border border-[#D9DEE8] bg-white shadow-md">

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
                      className={`block w-full px-4 py-3 text-left font-poppins text-sm transition hover:bg-[#F5F9FF] ${
                        index !==
                        tipeKelasOptions.length -
                          1
                          ? "border-b border-[#E5E7EB]"
                          : ""
                      } ${
                        selectedTipeKelas ===
                        tipe
                          ? "font-semibold text-[#42A5F5]"
                          : "text-[#293144]"
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
              LIST KELAS
          ================================================= */}

          <div className="mt-4 rounded-xl bg-white p-5">

            {loadingKelas ? (
              <div className="py-5 text-center font-poppins text-sm text-[#9CA3AF]">
                Memuat
                kelas...
              </div>
            ) : kelasError ? (
              <div className="py-5 text-center">

                <p className="font-poppins text-sm text-red-500">
                  Gagal memuat
                  kelas.
                </p>

              </div>
            ) : !selectedTipeKelas ? (
              <div className="py-5 text-center font-poppins text-sm text-[#9CA3AF]">
                Pilih tipe
                kelas terlebih
                dahulu.
              </div>
            ) : kelasList.length ===
              0 ? (
              <div className="py-5 text-center font-poppins text-sm text-[#9CA3AF]">
                Tidak ada
                kelas untuk
                tipe ini.
              </div>
            ) : (
              <div className="flex flex-col gap-4">

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
                          className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors ${
                            active
                              ? "bg-emerald-500"
                              : "bg-slate-300"
                          }`}
                        />

                        <span
                          className={`font-poppins text-sm ${
                            active
                              ? "font-semibold text-[#293144]"
                              : "text-[#6B7589]"
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

    </div>
  );
}