"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Trash2,
  ChevronDown,
  Pencil,
  X,
  Upload,
} from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";

/* =====================================================
   TIPE KELAS
===================================================== */

const tipeKelasOptions = [
  "Ujian",
  "Tugas",
  "Sandbox",
];

const tipeKelasBackendMap = {
  Ujian: "Ujian",
  Tugas: "Tugas",
  Sandbox: "Sandbox",
};

/* =====================================================
   API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/* =====================================================
   AUTH
===================================================== */

const getAuthToken = () => {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  return localStorage.getItem("token");
};

const fetchWithAuth = async (
  url,
  options = {}
) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  return fetch(url, {
    ...options,

    headers: {
      Accept: "application/json",

      Authorization: `Bearer ${token}`,

      ...(options.headers || {}),
    },
  });
};

export default function TugasPage() {
  /* =====================================================
     FILE CREATE
  ===================================================== */

  const [
    files,
    setFiles,
  ] = useState([]);

  const [
    selectedFileId,
    setSelectedFileId,
  ] = useState(null);

  const fileInputRef =
    useRef(null);

  /* =====================================================
     TUGAS
  ===================================================== */

  const [
    tugasList,
    setTugasList,
  ] = useState([]);

  const [
    loadingTugas,
    setLoadingTugas,
  ] = useState(false);

  const [
    tugasError,
    setTugasError,
  ] = useState(null);

  /* =====================================================
     KELAS
  ===================================================== */

  const [
    kelasList,
    setKelasList,
  ] = useState([]);

  const [
    loadingKelas,
    setLoadingKelas,
  ] = useState(false);

  const [
    kelasError,
    setKelasError,
  ] = useState(null);

  const [
    selectedKelas,
    setSelectedKelas,
  ] = useState(null);

  /* =====================================================
     TIPE KELAS
  ===================================================== */

  const [
    tipeKelasOpen,
    setTipeKelasOpen,
  ] = useState(false);

  const [
    selectedTipeKelas,
    setSelectedTipeKelas,
  ] = useState(null);

  /* =====================================================
     FORM CREATE
  ===================================================== */

  const [
    namaPerusahaan,
    setNamaPerusahaan,
  ] = useState("");

  const [
    creating,
    setCreating,
  ] = useState(false);

  /* =====================================================
     DELETE FILE POPUP
  ===================================================== */

  const [
    deleteModalOpen,
    setDeleteModalOpen,
  ] = useState(false);

  const [
    deletingFile,
    setDeletingFile,
  ] = useState(null);

  /* =====================================================
     DELETE TUGAS POPUP
  ===================================================== */

  const [
    deleteTugasModalOpen,
    setDeleteTugasModalOpen,
  ] = useState(false);

  const [
    deletingTugas,
    setDeletingTugas,
  ] = useState(null);

  const [
    deletingTugasLoading,
    setDeletingTugasLoading,
  ] = useState(false);

  /* =====================================================
     EDIT TUGAS POPUP
  ===================================================== */

  const [
    editTugasModalOpen,
    setEditTugasModalOpen,
  ] = useState(false);

  const [
    editTugasModalVisible,
    setEditTugasModalVisible,
  ] = useState(false);

  const [
    editingTugas,
    setEditingTugas,
  ] = useState(null);

  const [
    editNamaPerusahaan,
    setEditNamaPerusahaan,
  ] = useState("");

  const [
    editFile,
    setEditFile,
  ] = useState(null);

  const [
    updatingTugas,
    setUpdatingTugas,
  ] = useState(false);

  const editFileInputRef =
    useRef(null);

  const editModalTimerRef =
    useRef(null);

  /* =====================================================
     ALERT
  ===================================================== */

  const [
    errorAlert,
    setErrorAlert,
  ] = useState({
    title: "",
    message: "",
  });

  const [
    successAlert,
    setSuccessAlert,
  ] = useState({
    title: "",
    message: "",
  });

  /* =====================================================
     ALERT FUNCTION
  ===================================================== */

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

  /* =====================================================
     PARSE RESPONSE
  ===================================================== */

  const parseResponse =
    async (
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

  /* =====================================================
     CLEANUP TIMER
  ===================================================== */

  useEffect(() => {
    return () => {
      if (
        editModalTimerRef.current
      ) {
        clearTimeout(
          editModalTimerRef.current
        );
      }
    };
  }, []);

  /* =====================================================
     FETCH KELAS
  ===================================================== */

  useEffect(() => {
    const fetchKelas =
      async () => {
        if (
          !selectedTipeKelas
        ) {
          setKelasList([]);
          setSelectedKelas(null);

          return;
        }

        try {
          setLoadingKelas(true);
          setKelasError(null);
          setSelectedKelas(null);

          const response =
            await fetchWithAuth(
              `${API_URL}/api/kelas`,
              {
                method: "GET",
                cache: "no-store",
              }
            );

          const result =
            await parseResponse(
              response
            );

          if (
            response.status === 401
          ) {
            throw new Error(
              "Token login tidak valid atau sudah tidak aktif. Silakan login kembali."
            );
          }

          if (
            response.status === 403
          ) {
            throw new Error(
              "Kamu tidak memiliki akses ke data kelas."
            );
          }

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
            data.filter(
              (kelas) => {
                const tipeDatabase =
                  kelas.tipe_kelas ??
                  kelas.TipeKelas ??
                  kelas.tipeKelas ??
                  "";

                return (
                  String(
                    tipeDatabase
                  )
                    .trim()
                    .toLowerCase() ===
                  String(
                    selectedTipeKelas
                  )
                    .trim()
                    .toLowerCase()
                );
              }
            );

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
          setLoadingKelas(false);
        }
      };

    fetchKelas();
  }, [
    selectedTipeKelas,
  ]);

  /* =====================================================
     FETCH TUGAS
  ===================================================== */

  const fetchTugas =
    async () => {
      try {
        setLoadingTugas(true);
        setTugasError(null);

        const response =
          await fetchWithAuth(
            `${API_URL}/api/kasus`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (
          response.status === 401
        ) {
          throw new Error(
            "Token login tidak valid atau sudah tidak aktif. Silakan login kembali."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            "Kamu tidak memiliki akses ke data tugas."
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              result?.raw ||
              `Gagal mengambil data tugas. Status: ${response.status}`
          );
        }

        let data = [];

        if (
          Array.isArray(result)
        ) {
          data = result;
        } else if (
          Array.isArray(
            result?.data
          )
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

  /* =====================================================
     UPLOAD FILE CREATE
  ===================================================== */

  const handleUploadButtonClick =
    () => {
      fileInputRef.current?.click();
    };

  const handleFileSelected =
    (event) => {
      const file =
        event.target
          .files?.[0];

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

        event.target.value = "";

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

        event.target.value = "";

        return;
      }

      const newFile = {
        id: Date.now(),
        name: file.name,
        file,
      };

      setFiles(
        (previous) => [
          ...previous,
          newFile,
        ]
      );

      setSelectedFileId(
        newFile.id
      );

      event.target.value = "";
    };

  /* =====================================================
     DELETE FILE CREATE
  ===================================================== */

  const openDeleteModal =
    (file) => {
      setDeletingFile(file);
      setDeleteModalOpen(true);
    };

  const handleConfirmDelete =
    () => {
      if (!deletingFile) {
        return;
      }

      setFiles(
        (previous) =>
          previous.filter(
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

  /* =====================================================
     OPEN EDIT TUGAS
  ===================================================== */

  const openEditTugasModal =
    (tugas) => {
      setEditingTugas(tugas);

      setEditNamaPerusahaan(
        tugas?.NamaClient || ""
      );

      setEditFile(null);

      if (
        editFileInputRef.current
      ) {
        editFileInputRef.current.value =
          "";
      }

      if (
        editModalTimerRef.current
      ) {
        clearTimeout(
          editModalTimerRef.current
        );

        editModalTimerRef.current =
          null;
      }

      /*
       * Render dahulu.
       */
      setEditTugasModalOpen(true);

      /*
       * Setelah elemen masuk DOM,
       * jalankan transition.
       */
      requestAnimationFrame(
        () => {
          requestAnimationFrame(
            () => {
              setEditTugasModalVisible(
                true
              );
            }
          );
        }
      );
    };

  /* =====================================================
     RESET EDIT FORM
  ===================================================== */

  const resetEditForm =
    () => {
      setEditingTugas(null);
      setEditNamaPerusahaan("");
      setEditFile(null);

      if (
        editFileInputRef.current
      ) {
        editFileInputRef.current.value =
          "";
      }
    };

  /* =====================================================
     CLOSE EDIT TUGAS
  ===================================================== */

  const closeEditTugasModal =
    () => {
      if (updatingTugas) {
        return;
      }

      if (
        editModalTimerRef.current
      ) {
        clearTimeout(
          editModalTimerRef.current
        );

        editModalTimerRef.current =
          null;
      }

      /*
       * Jalankan exit animation.
       */
      setEditTugasModalVisible(
        false
      );

      /*
       * Setelah 300ms baru benar-benar
       * unmount popup.
       */
      editModalTimerRef.current =
        setTimeout(
          () => {
            setEditTugasModalOpen(
              false
            );

            resetEditForm();

            editModalTimerRef.current =
              null;
          },
          300
        );
    };

  /* =====================================================
     ESCAPE POPUP
  ===================================================== */

  useEffect(() => {
    if (
      !editTugasModalOpen
    ) {
      return;
    }

    const handleEscape =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          closeEditTugasModal();
        }
      };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    editTugasModalOpen,
    updatingTugas,
  ]);

  /* =====================================================
     BODY SCROLL LOCK
  ===================================================== */

  useEffect(() => {
    if (
      !editTugasModalOpen
    ) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    editTugasModalOpen,
  ]);

  /* =====================================================
     EDIT FILE
  ===================================================== */

  const handleEditFileSelected =
    (event) => {
      const file =
        event.target
          .files?.[0];

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

        event.target.value = "";

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

        event.target.value = "";

        return;
      }

      setEditFile(file);
    };

  /* =====================================================
     UPDATE TUGAS
  ===================================================== */

  const handleUpdateTugas =
    async () => {
      if (!editingTugas) {
        return;
      }

      if (
        !editNamaPerusahaan.trim()
      ) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Nama perusahaan wajib diisi."
        );

        return;
      }

      const kasusId =
        editingTugas.KasusID ??
        editingTugas.kasus_id;

      if (!kasusId) {
        showErrorAlert(
          "Data Tidak Valid",
          "ID tugas tidak ditemukan."
        );

        return;
      }

      try {
        setUpdatingTugas(true);

        const formData =
          new FormData();

        /*
         * Laravel Method Spoofing
         */
        formData.append(
          "_method",
          "PUT"
        );

        /*
         * Backend akan update
         * DataClient berdasarkan
         * ClientID milik Kasus.
         */
        formData.append(
          "NamaClient",
          editNamaPerusahaan.trim()
        );

        /*
         * File tidak wajib diganti.
         */
        if (
          editFile instanceof File
        ) {
          formData.append(
            "file",
            editFile,
            editFile.name
          );
        }

        const response =
          await fetchWithAuth(
            `${API_URL}/api/kasus/${kasusId}`,
            {
              method: "POST",
              body: formData,
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (
          response.status === 401
        ) {
          throw new Error(
            "Token login tidak valid atau sudah tidak aktif. Silakan login kembali."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            "Kamu tidak memiliki izin untuk mengubah tugas ini."
          );
        }

        if (
          response.status === 404
        ) {
          throw new Error(
            "Data tugas tidak ditemukan."
          );
        }

        if (!response.ok) {
          let errorMessage =
            result?.message ||
            result?.error ||
            result?.raw ||
            `Gagal mengubah tugas. Status: ${response.status}`;

          if (
            result?.errors &&
            typeof result.errors ===
              "object"
          ) {
            const values =
              Object.values(
                result.errors
              );

            const firstError =
              Array.isArray(
                values?.[0]
              )
                ? values?.[0]?.[0]
                : values?.[0];

            if (firstError) {
              errorMessage =
                String(
                  firstError
                );
            }
          }

          throw new Error(
            String(
              errorMessage
            )
          );
        }

        /*
         * Refresh tabel admin.
         */
        await fetchTugas();

        /*
         * Exit animation setelah
         * update berhasil.
         */
        if (
          editModalTimerRef.current
        ) {
          clearTimeout(
            editModalTimerRef.current
          );
        }

        setEditTugasModalVisible(
          false
        );

        editModalTimerRef.current =
          setTimeout(
            () => {
              setEditTugasModalOpen(
                false
              );

              resetEditForm();

              editModalTimerRef.current =
                null;
            },
            300
          );

        showSuccessAlert(
          "Berhasil diubah",
          result?.message ||
            "Tugas berhasil diperbarui."
        );
      } catch (error) {
        console.error(
          "ERROR UPDATE TUGAS:",
          error
        );

        showErrorAlert(
          "Gagal diubah",
          error?.message ||
            "Gagal memperbarui tugas."
        );
      } finally {
        setUpdatingTugas(false);
      }
    };

  /* =====================================================
     DELETE TUGAS
  ===================================================== */

  const openDeleteTugasModal =
    (tugas) => {
      setDeletingTugas(tugas);

      setDeleteTugasModalOpen(
        true
      );
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
          await fetchWithAuth(
            `${API_URL}/api/kasus/${kasusId}`,
            {
              method: "DELETE",
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (
          response.status === 401
        ) {
          throw new Error(
            "Token login tidak valid atau sudah tidak aktif. Silakan login kembali."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            "Kamu tidak memiliki izin untuk menghapus tugas ini."
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              result?.raw ||
              `Gagal menghapus tugas. Status: ${response.status}`
          );
        }

        setTugasList(
          (previous) =>
            previous.filter(
              (item) => {
                const itemId =
                  item.KasusID ??
                  item.kasus_id;

                return (
                  String(itemId) !==
                  String(kasusId)
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

  /* =====================================================
     SELECT KELAS
  ===================================================== */

  const selectKelas =
    (kelasID) => {
      setSelectedKelas(
        (previous) =>
          previous === kelasID
            ? null
            : kelasID
      );
    };

  /* =====================================================
     SELECT TIPE KELAS
  ===================================================== */

  const selectTipeKelas =
    (tipe) => {
      setSelectedTipeKelas(
        tipe
      );

      setTipeKelasOpen(false);
    };

  /* =====================================================
     CREATE TUGAS
  ===================================================== */

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
        ] ||
        selectedTipeKelas;

      const kelasSudahMemilikiTugas =
        tugasList.some(
          (item) => {
            const kelasTugas =
              item.NamaKelas ??
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
          "kode_kelas",
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
          await fetchWithAuth(
            `${API_URL}/api/kasus`,
            {
              method: "POST",
              body: formData,
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (
          response.status === 401
        ) {
          throw new Error(
            "Token login tidak valid atau sudah tidak aktif. Silakan login kembali."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            "Kamu tidak memiliki izin untuk membuat tugas."
          );
        }

        if (!response.ok) {
          let errorMessage =
            result?.message ||
            result?.error ||
            result?.raw ||
            `Gagal membuat tugas. Status: ${response.status}`;

          if (
            result?.errors &&
            typeof result.errors ===
              "object"
          ) {
            const values =
              Object.values(
                result.errors
              );

            const firstError =
              Array.isArray(
                values?.[0]
              )
                ? values?.[0]?.[0]
                : values?.[0];

            if (firstError) {
              errorMessage =
                String(firstError);
            }
          }

          throw new Error(
            String(errorMessage)
          );
        }

        await fetchTugas();

        setFiles(
          (previous) =>
            previous.filter(
              (file) =>
                file.id !==
                selectedFileId
            )
        );

        setSelectedFileId(null);

        setNamaPerusahaan("");

        showSuccessAlert(
          "Berhasil ditambah",
          "Tugas berhasil dibuat dan disimpan."
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

  /* =====================================================
     CREATE CONDITION
  ===================================================== */

  const canCreate =
    Boolean(
      namaPerusahaan.trim() &&
        selectedTipeKelas &&
        selectedFileId &&
        selectedKelas &&
        !creating
    );

  const dropdownLabel =
    selectedTipeKelas ||
    "Tipe Kelas";

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="min-h-screen px-10 py-10 font-poppins">

      {/* =================================================
          ALERT SUCCESS
      ================================================= */}

      <AlertSuccess
        title={
          successAlert.title
        }
        message={
          successAlert.message
        }
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
        title={
          errorAlert.title
        }
        message={
          errorAlert.message
        }
        onClose={() =>
          setErrorAlert({
            title: "",
            message: "",
          })
        }
      />

      {/* =================================================
          POPUP DELETE FILE
      ================================================= */}

      <ConfirmationPopup
        isOpen={
          deleteModalOpen
        }
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
          POPUP DELETE TUGAS
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
          POPUP EDIT TUGAS
      ================================================= */}

      {editTugasModalOpen && (
        <div
          className={`
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            p-4
            transition-all
            duration-300
            ease-out

            ${
              editTugasModalVisible
                ? `
                  bg-black/40
                  opacity-100
                  backdrop-blur-[2px]
                `
                : `
                  bg-black/0
                  opacity-0
                  backdrop-blur-0
                `
            }
          `}
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeEditTugasModal();
            }
          }}
        >
          <div
            className={`
              w-full
              max-w-[520px]
              overflow-hidden
              rounded-[14px]
              bg-white
              transform-gpu
              transition-all
              duration-300
              ease-[cubic-bezier(0.22,1,0.36,1)]

              ${
                editTugasModalVisible
                  ? `
                    translate-y-0
                    scale-100
                    opacity-100
                    shadow-[0_24px_70px_rgba(15,23,42,0.25)]
                  `
                  : `
                    translate-y-4
                    scale-[0.97]
                    opacity-0
                    shadow-[0_8px_25px_rgba(15,23,42,0.08)]
                  `
              }
            `}
            onMouseDown={(
              event
            ) => {
              event.stopPropagation();
            }}
          >
            {/* =========================================
                HEADER
            ========================================== */}

            <div
              className="
                flex
                items-center
                justify-between
                bg-gradient-to-r
                from-[#42A5F5]
                to-[#2196F3]
                px-6
                py-5
                text-white
              "
            >
              <div>
                <h2
                  className="
                    font-poppins
                    text-[18px]
                    font-semibold
                  "
                >
                  Edit Tugas
                </h2>

                <p
                  className="
                    mt-1
                    font-poppins
                    text-[12px]
                    text-white/80
                  "
                >
                  Ubah nama perusahaan atau file tugas
                </p>
              </div>

              <button
                type="button"
                disabled={
                  updatingTugas
                }
                onClick={
                  closeEditTugasModal
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  transition
                  duration-200
                  hover:bg-white/10
                  active:scale-90
                  disabled:opacity-50
                "
              >
                <X
                  size={19}
                />
              </button>
            </div>

            {/* =========================================
                BODY
            ========================================== */}

            <div
              className="
                px-6
                py-6
              "
            >
              {/* NAMA PERUSAHAAN */}

              <div>
                <label
                  htmlFor="edit-nama-perusahaan"
                  className="
                    mb-2
                    block
                    font-poppins
                    text-[13px]
                    font-semibold
                    text-[#536176]
                  "
                >
                  Nama Perusahaan
                </label>

                <input
                  id="edit-nama-perusahaan"
                  type="text"
                  value={
                    editNamaPerusahaan
                  }
                  disabled={
                    updatingTugas
                  }
                  onChange={(
                    event
                  ) =>
                    setEditNamaPerusahaan(
                      event.target.value
                    )
                  }
                  placeholder="Masukkan nama perusahaan"
                  className="
                    h-[44px]
                    w-full
                    rounded-[7px]
                    border
                    border-[#D9DEE8]
                    bg-white
                    px-4
                    font-poppins
                    text-[13px]
                    text-[#293144]
                    outline-none
                    transition
                    duration-200
                    focus:border-[#42A5F5]
                    focus:ring-1
                    focus:ring-[#42A5F5]
                    disabled:bg-slate-50
                  "
                />
              </div>

              {/* FILE */}

              <div className="mt-5">
                <label
                  className="
                    mb-2
                    block
                    font-poppins
                    text-[13px]
                    font-semibold
                    text-[#536176]
                  "
                >
                  Tambah File
                </label>

                {/* FILE SAAT INI */}

                {editingTugas?.NamaFile && (
                  <div
                    className="
                      mb-3
                      rounded-[7px]
                      border
                      border-[#e4e9ef]
                      bg-[#f8fafc]
                      px-4
                      py-3
                    "
                  >
                    <p
                      className="
                        font-poppins
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-wide
                        text-[#94a3b8]
                      "
                    >
                      File saat ini
                    </p>

                    <p
                      title={
                        editingTugas.NamaFile
                      }
                      className="
                        mt-1
                        truncate
                        font-poppins
                        text-[12px]
                        font-medium
                        text-[#42A5F5]
                      "
                    >
                      {
                        editingTugas.NamaFile
                      }
                    </p>
                  </div>
                )}

                {/* FILE BARU */}

                <div
                  className="
                    flex
                    min-h-[44px]
                    items-center
                    overflow-hidden
                    rounded-[7px]
                    border
                    border-[#D9DEE8]
                    bg-white
                    transition
                    duration-200
                    focus-within:border-[#42A5F5]
                    focus-within:ring-1
                    focus-within:ring-[#42A5F5]/20
                  "
                >
                  <button
                    type="button"
                    disabled={
                      updatingTugas
                    }
                    onClick={() =>
                      editFileInputRef.current?.click()
                    }
                    className="
                      flex
                      h-[44px]
                      shrink-0
                      items-center
                      justify-center
                      gap-2
                      border-r
                      border-[#D9DEE8]
                      px-4
                      font-poppins
                      text-[12px]
                      font-medium
                      text-[#293144]
                      transition
                      duration-200
                      hover:bg-[#F5F9FF]
                      active:bg-[#edf4f8]
                      disabled:opacity-50
                    "
                  >
                    <Upload
                      size={15}
                    />

                    Choose File
                  </button>

                  <div
                    className="
                      min-w-0
                      flex-1
                      px-4
                    "
                  >
                    {editFile ? (
                      <span
                        title={
                          editFile.name
                        }
                        className="
                          block
                          truncate
                          font-poppins
                          text-[12px]
                          font-medium
                          text-[#42A5F5]
                        "
                      >
                        {
                          editFile.name
                        }
                      </span>
                    ) : (
                      <span
                        className="
                          block
                          truncate
                          font-poppins
                          text-[12px]
                          text-[#9CA3AF]
                        "
                      >
                        Pilih file baru jika ingin mengganti
                      </span>
                    )}
                  </div>

                  {editFile && (
                    <button
                      type="button"
                      disabled={
                        updatingTugas
                      }
                      onClick={() => {
                        setEditFile(null);

                        if (
                          editFileInputRef.current
                        ) {
                          editFileInputRef.current.value =
                            "";
                        }
                      }}
                      className="
                        flex
                        h-[44px]
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        text-slate-400
                        transition
                        duration-200
                        hover:bg-red-50
                        hover:text-red-500
                        active:scale-90
                        disabled:opacity-50
                      "
                    >
                      <X
                        size={15}
                      />
                    </button>
                  )}

                  <input
                    ref={
                      editFileInputRef
                    }
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={
                      updatingTugas
                    }
                    onChange={
                      handleEditFileSelected
                    }
                  />
                </div>

                <p
                  className="
                    mt-2
                    font-poppins
                    text-[11px]
                    text-[#9CA3AF]
                  "
                >
                  Kosongkan jika tidak ingin mengganti file. Maksimal 10MB.
                </p>
              </div>
            </div>

            {/* =========================================
                FOOTER
            ========================================== */}

            <div
              className="
                flex
                items-center
                justify-end
                gap-3
                border-t
                border-[#E5E7EB]
                px-6
                py-4
              "
            >
              <button
                type="button"
                disabled={
                  updatingTugas
                }
                onClick={
                  closeEditTugasModal
                }
                className="
                  h-[40px]
                  rounded-[7px]
                  border
                  border-[#D9DEE8]
                  bg-white
                  px-5
                  font-poppins
                  text-[13px]
                  font-semibold
                  text-[#536176]
                  transition
                  duration-200
                  hover:bg-slate-50
                  active:scale-[0.97]
                  disabled:opacity-50
                "
              >
                Batal
              </button>

              <button
                type="button"
                disabled={
                  updatingTugas ||
                  !editNamaPerusahaan.trim()
                }
                onClick={
                  handleUpdateTugas
                }
                className="
                  h-[40px]
                  min-w-[120px]
                  rounded-[7px]
                  bg-[#42A5F5]
                  px-5
                  font-poppins
                  text-[13px]
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  duration-200
                  hover:-translate-y-[1px]
                  hover:bg-[#2196F3]
                  hover:shadow-md
                  active:translate-y-0
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {updatingTugas
                  ? "Menyimpan..."
                  : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            className="
              h-[46px]
              w-[155px]
              rounded-[7px]
              bg-[#42A5F5]
              font-poppins
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#2196F3]
            "
          >
            + Tambah File
          </button>

          <input
            ref={
              fileInputRef
            }
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
                  <th className="w-[8%] px-6 pb-4 pt-6 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    NO
                  </th>

                  <th className="px-6 pb-4 pt-6 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    NAMA FILE
                  </th>

                  <th className="w-[12%] px-6 pb-4 pt-6 text-center font-poppins text-xs font-semibold text-[#6B7589]">
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
                        key={file.id}
                        className="border-b border-[#E5E7EB]"
                      >
                        <td className="px-6 py-4 font-poppins text-sm text-[#293144]">
                          {index + 1}
                        </td>

                        <td className="max-w-0 px-6 py-4 font-poppins text-sm text-[#293144]">
                          <span className="block truncate">
                            {file.name}
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
                            className="
                              text-black
                              transition
                              hover:text-red-500
                            "
                          >
                            <Trash2
                              size={16}
                              strokeWidth={1.8}
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
                      Belum ada file yang diunggah.
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
              onChange={(
                event
              ) =>
                setNamaPerusahaan(
                  event.target.value
                )
              }
              placeholder="Masukkan nama perusahaan"
              className="
                h-[46px]
                w-full
                rounded-[7px]
                border
                border-[#D9DEE8]
                bg-white
                px-4
                font-poppins
                text-sm
                text-[#293144]
                outline-none
                transition
                focus:border-[#42A5F5]
                focus:ring-1
                focus:ring-[#42A5F5]
              "
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
              className="
                h-[46px]
                w-[155px]
                rounded-[7px]
                bg-[#42A5F5]
                font-poppins
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#2196F3]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {creating
                ? "Creating..."
                : "+ Tambah Tugas"}
            </button>

            {!canCreate &&
              !creating && (
                <span className="font-poppins text-xs text-[#9CA3AF]">
                  Isi nama perusahaan, pilih Tipe Kelas, satu kelas, dan satu file.
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
                  <th className="w-[7%] px-6 pb-4 pt-8 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    NO
                  </th>

                  <th className="w-[20%] px-6 pb-4 pt-8 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    KELAS
                  </th>

                  <th className="w-[28%] px-6 pb-4 pt-8 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    NAMA PERUSAHAAN
                  </th>

                  <th className="w-[30%] px-6 pb-4 pt-8 text-left font-poppins text-xs font-semibold text-[#6B7589]">
                    NAMA FILE
                  </th>

                  <th className="w-[10%] px-6 pb-4 pt-8 text-center font-poppins text-xs font-semibold text-[#6B7589]">
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
                      Memuat tugas...
                    </td>
                  </tr>
                ) : tugasError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-[180px] text-center align-middle font-poppins text-sm text-red-500"
                    >
                      {tugasError}
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

                        {/* =====================================
                            AKSI
                        ====================================== */}

                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">

                            {/* EDIT */}

                            <button
                              type="button"
                              title="Edit Tugas"
                              aria-label={`Edit tugas ${
                                item.NamaTugas ||
                                item.NamaFile ||
                                ""
                              }`}
                              onClick={() =>
                                openEditTugasModal(
                                  item
                                )
                              }
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-md
                                text-black
                                transition
                                duration-200
                                hover:bg-gray-100
                                hover:text-black
                                active:scale-90
                              "
                            >
                              <Pencil
                                size={16}
                                strokeWidth={1.8}
                              />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              title="Hapus Tugas"
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
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-md
                                text-black
                                transition
                                duration-200
                                hover:bg-red-50
                                hover:text-red-500
                                active:scale-90
                              "
                            >
                              <Trash2
                                size={16}
                                strokeWidth={1.8}
                              />
                            </button>
                          </div>
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
              className="
                flex
                h-[46px]
                w-full
                items-center
                justify-between
                rounded-[7px]
                border
                border-[#D9DEE8]
                bg-white
                px-4
                font-poppins
                text-sm
                font-semibold
                text-[#293144]
                transition
                hover:border-[#42A5F5]
              "
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
                strokeWidth={2}
              />
            </button>

            {tipeKelasOpen && (
              <div
                className="
                  absolute
                  right-0
                  z-20
                  mt-2
                  w-full
                  overflow-hidden
                  rounded-[7px]
                  border
                  border-[#D9DEE8]
                  bg-white
                  shadow-md
                "
              >
                {tipeKelasOptions.map(
                  (
                    tipe,
                    index
                  ) => (
                    <button
                      type="button"
                      key={tipe}
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
                      {tipe}
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
                Memuat kelas...
              </div>
            ) : kelasError ? (
              <div className="py-5 text-center">
                <p className="font-poppins text-sm text-red-500">
                  {kelasError}
                </p>
              </div>
            ) : !selectedTipeKelas ? (
              <div className="py-5 text-center font-poppins text-sm text-[#9CA3AF]">
                Pilih tipe kelas terlebih dahulu.
              </div>
            ) : kelasList.length ===
              0 ? (
              <div className="py-5 text-center font-poppins text-sm text-[#9CA3AF]">
                Tidak ada kelas untuk tipe ini.
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
    </div>
  );
}