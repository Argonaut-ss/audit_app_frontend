"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";

/* =====================================================
   LOCAL STORAGE KEY
===================================================== */

const STORAGE_KEY =
  "konfirmasi_piutang_data";

/* =====================================================
   DUMMY DATA
===================================================== */

const INITIAL_DATA = [
  {
    id: 1,
    namaCustomer: "Toko Asat",
    kotaCustomer: "Jakarta",
    jumlah: 20000000,
    namaFile:
      "3. Jawaban Balasan Konfirmasi Piutang PT CKM_699bb961e.docx",
    file: null,
  },
  {
    id: 2,
    namaCustomer: "PT Maju Jaya",
    kotaCustomer: "Bandung",
    jumlah: 15000000,
    namaFile:
      "Konfirmasi Piutang PT Maju Jaya.docx",
    file: null,
  },
  {
    id: 3,
    namaCustomer: "CV Berkah Abadi",
    kotaCustomer: "Surabaya",
    jumlah: 27500000,
    namaFile:
      "Konfirmasi Piutang CV Berkah Abadi.pdf",
    file: null,
  },
  {
    id: 4,
    namaCustomer: "PT Sinar Mandiri",
    kotaCustomer: "Medan",
    jumlah: 12500000,
    namaFile:
      "Konfirmasi Piutang PT Sinar Mandiri.docx",
    file: null,
  },
  {
    id: 5,
    namaCustomer: "Toko Sejahtera",
    kotaCustomer: "Bekasi",
    jumlah: 30000000,
    namaFile:
      "Konfirmasi Piutang Toko Sejahtera.pdf",
    file: null,
  },
  {
    id: 6,
    namaCustomer: "PT Cahaya Baru",
    kotaCustomer: "Tangerang",
    jumlah: 18500000,
    namaFile:
      "Konfirmasi Piutang PT Cahaya Baru.docx",
    file: null,
  },
  {
    id: 7,
    namaCustomer: "CV Sentosa",
    kotaCustomer: "Bogor",
    jumlah: 22000000,
    namaFile:
      "Konfirmasi Piutang CV Sentosa.pdf",
    file: null,
  },
  {
    id: 8,
    namaCustomer: "PT Nusantara",
    kotaCustomer: "Semarang",
    jumlah: 34000000,
    namaFile:
      "Konfirmasi Piutang PT Nusantara.docx",
    file: null,
  },
  {
    id: 9,
    namaCustomer: "Toko Makmur",
    kotaCustomer: "Depok",
    jumlah: 16500000,
    namaFile:
      "Konfirmasi Piutang Toko Makmur.pdf",
    file: null,
  },
  {
    id: 10,
    namaCustomer: "PT Karya Utama",
    kotaCustomer: "Palembang",
    jumlah: 25000000,
    namaFile:
      "Konfirmasi Piutang PT Karya Utama.docx",
    file: null,
  },
];

/* =====================================================
   INITIAL FORM
===================================================== */

const INITIAL_FORM = {
  namaCustomer: "",
  kotaCustomer: "",
  jumlah: "",
  file: null,
  namaFile: "",
};

/* =====================================================
   HELPERS
===================================================== */

const formatNumber = (value) => {
  const number =
    Number(value) || 0;

  return new Intl.NumberFormat(
    "id-ID"
  ).format(number);
};

const formatInputRupiah = (value) => {
  const onlyNumber =
    String(value).replace(
      /\D/g,
      ""
    );

  if (!onlyNumber) {
    return "";
  }

  return new Intl.NumberFormat(
    "id-ID"
  ).format(
    Number(onlyNumber)
  );
};

/* =====================================================
   PAGE
===================================================== */

export default function KonfirmasiPiutangPage() {
  /* =====================================================
     DATA
  ===================================================== */

  const [
    dataList,
    setDataList,
  ] = useState(
    INITIAL_DATA
  );

  const [
    storageLoaded,
    setStorageLoaded,
  ] = useState(false);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const itemsPerPage = 10;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        dataList.length /
          itemsPerPage
      )
    );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const endIndex =
    startIndex +
    itemsPerPage;

  const currentData =
    dataList.slice(
      startIndex,
      endIndex
    );

  const showingFrom =
    dataList.length === 0
      ? 0
      : startIndex + 1;

  const showingTo =
    dataList.length === 0
      ? 0
      : Math.min(
          startIndex +
            currentData.length,
          dataList.length
        );

  /* =====================================================
     MODAL
  ===================================================== */

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    modalMode,
    setModalMode,
  ] = useState(
    "create"
  );

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const modalTimerRef =
    useRef(null);

  /* =====================================================
     FORM
  ===================================================== */

  const [
    formData,
    setFormData,
  ] = useState({
    ...INITIAL_FORM,
  });

  const fileInputRef =
    useRef(null);

  /* =====================================================
     DELETE
  ===================================================== */

  const [
    deleteModalOpen,
    setDeleteModalOpen,
  ] = useState(false);

  const [
    deletingData,
    setDeletingData,
  ] = useState(null);

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
     ALERT HELPERS
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
     LOAD LOCAL STORAGE
  ===================================================== */

  useEffect(() => {
    try {
      const savedData =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (
        savedData !== null
      ) {
        const parsedData =
          JSON.parse(
            savedData
          );

        if (
          Array.isArray(
            parsedData
          )
        ) {
          setDataList(
            parsedData.map(
              (item) => ({
                ...item,
                file:
                  null,
              })
            )
          );
        }
      } else {
        const initialData =
          INITIAL_DATA.map(
            (item) => ({
              ...item,
              file:
                null,
            })
          );

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            initialData
          )
        );

        setDataList(
          INITIAL_DATA
        );
      }
    } catch (error) {
      console.error(
        "Gagal membaca Konfirmasi Piutang:",
        error
      );

      setDataList(
        INITIAL_DATA
      );
    } finally {
      setStorageLoaded(
        true
      );
    }
  }, []);

  /* =====================================================
     SAVE LOCAL STORAGE
  ===================================================== */

  useEffect(() => {
    if (!storageLoaded) {
      return;
    }

    try {
      const dataToSave =
        dataList.map(
          (item) => ({
            id:
              item.id,

            namaCustomer:
              item.namaCustomer,

            kotaCustomer:
              item.kotaCustomer,

            jumlah:
              item.jumlah,

            namaFile:
              item.namaFile,

            file:
              null,
          })
        );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          dataToSave
        )
      );
    } catch (error) {
      console.error(
        "Gagal menyimpan Konfirmasi Piutang:",
        error
      );
    }
  }, [
    dataList,
    storageLoaded,
  ]);

  /* =====================================================
     KEEP PAGINATION VALID
  ===================================================== */

  useEffect(() => {
    const maxPage =
      Math.max(
        1,
        Math.ceil(
          dataList.length /
            itemsPerPage
        )
      );

    if (
      currentPage >
      maxPage
    ) {
      setCurrentPage(
        maxPage
      );
    }
  }, [
    dataList.length,
    currentPage,
  ]);

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      if (
        modalTimerRef.current
      ) {
        clearTimeout(
          modalTimerRef.current
        );
      }
    };
  }, []);

  /* =====================================================
     BODY LOCK
  ===================================================== */

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, [
    modalOpen,
  ]);

  /* =====================================================
     ESCAPE
  ===================================================== */

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const handleEscape = (
      event
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        closeModal();
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
    modalOpen,
  ]);

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (
    field,
    value
  ) => {
    setFormData(
      (previous) => ({
        ...previous,
        [field]:
          value,
      })
    );
  };

  /* =====================================================
     OPEN CREATE
  ===================================================== */

  const openCreateModal =
    () => {
      if (
        modalTimerRef.current
      ) {
        clearTimeout(
          modalTimerRef.current
        );
      }

      setModalMode(
        "create"
      );

      setEditingId(
        null
      );

      setFormData({
        ...INITIAL_FORM,
      });

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      setModalOpen(
        true
      );

      requestAnimationFrame(
        () => {
          requestAnimationFrame(
            () => {
              setModalVisible(
                true
              );
            }
          );
        }
      );
    };

  /* =====================================================
     OPEN EDIT
  ===================================================== */

  const openEditModal =
    (item) => {
      if (
        modalTimerRef.current
      ) {
        clearTimeout(
          modalTimerRef.current
        );
      }

      setModalMode(
        "edit"
      );

      setEditingId(
        item.id
      );

      setFormData({
        namaCustomer:
          item.namaCustomer ||
          "",

        kotaCustomer:
          item.kotaCustomer ||
          "",

        jumlah:
          item.jumlah
            ? formatInputRupiah(
                item.jumlah
              )
            : "",

        file:
          null,

        namaFile:
          item.namaFile ||
          "",
      });

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      setModalOpen(
        true
      );

      requestAnimationFrame(
        () => {
          requestAnimationFrame(
            () => {
              setModalVisible(
                true
              );
            }
          );
        }
      );
    };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal =
    () => {
      if (
        modalTimerRef.current
      ) {
        clearTimeout(
          modalTimerRef.current
        );
      }

      setModalVisible(
        false
      );

      modalTimerRef.current =
        setTimeout(
          () => {
            setModalOpen(
              false
            );

            setEditingId(
              null
            );

            setFormData({
              ...INITIAL_FORM,
            });

            if (
              fileInputRef.current
            ) {
              fileInputRef.current.value =
                "";
            }
          },
          280
        );
    };

  /* =====================================================
     FILE SELECTED
  ===================================================== */

  const handleFileSelected =
    (event) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      const maxSize =
        10 *
        1024 *
        1024;

      if (
        file.size >
        maxSize
      ) {
        showErrorAlert(
          "Ukuran File Terlalu Besar",
          "Ukuran file maksimal 10MB."
        );

        event.target.value =
          "";

        return;
      }

      setFormData(
        (previous) => ({
          ...previous,

          file,

          namaFile:
            file.name,
        })
      );
    };

  /* =====================================================
     REMOVE SELECTED FILE
  ===================================================== */

  const removeSelectedFile =
    () => {
      let oldFileName =
        "";

      if (
        modalMode ===
        "edit"
      ) {
        const oldData =
          dataList.find(
            (item) =>
              String(
                item.id
              ) ===
              String(
                editingId
              )
          );

        oldFileName =
          oldData?.namaFile ||
          "";
      }

      setFormData(
        (previous) => ({
          ...previous,

          file:
            null,

          namaFile:
            oldFileName,
        })
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit =
    () => {
      const namaCustomer =
        formData.namaCustomer.trim();

      const kotaCustomer =
        formData.kotaCustomer.trim();

      const jumlah =
        Number(
          String(
            formData.jumlah
          ).replace(
            /\D/g,
            ""
          )
        );

      if (!namaCustomer) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Nama Customer wajib diisi."
        );

        return;
      }

      if (!kotaCustomer) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Kota Customer wajib diisi."
        );

        return;
      }

      if (
        !jumlah ||
        jumlah <= 0
      ) {
        showErrorAlert(
          "Jumlah Tidak Valid",
          "Jumlah wajib diisi dan harus lebih dari 0."
        );

        return;
      }

      if (
        modalMode ===
          "create" &&
        !formData.file
      ) {
        showErrorAlert(
          "File Belum Dipilih",
          "File Konfirmasi Piutang wajib di-upload."
        );

        return;
      }

      /* =================================================
         CREATE
      ================================================= */

      if (
        modalMode ===
        "create"
      ) {
        const newData = {
          id:
            Date.now(),

          namaCustomer,

          kotaCustomer,

          jumlah,

          namaFile:
            formData.file.name,

          file:
            formData.file,
        };

        setDataList(
          (previous) => [
            newData,
            ...previous,
          ]
        );

        setCurrentPage(
          1
        );

        showSuccessAlert(
          "Berhasil ditambah",
          "Data Konfirmasi Piutang berhasil ditambahkan."
        );

        closeModal();

        return;
      }

      /* =================================================
         EDIT
      ================================================= */

      if (
        modalMode ===
        "edit"
      ) {
        setDataList(
          (previous) =>
            previous.map(
              (item) => {
                if (
                  String(
                    item.id
                  ) !==
                  String(
                    editingId
                  )
                ) {
                  return item;
                }

                return {
                  ...item,

                  namaCustomer,

                  kotaCustomer,

                  jumlah,

                  namaFile:
                    formData.file
                      ? formData.file.name
                      : item.namaFile,

                  file:
                    formData.file
                      ? formData.file
                      : item.file,
                };
              }
            )
        );

        showSuccessAlert(
          "Berhasil diubah",
          "Data Konfirmasi Piutang berhasil diperbarui."
        );

        closeModal();
      }
    };

  /* =====================================================
     DELETE
  ===================================================== */

  const openDeleteModal =
    (item) => {
      setDeletingData(
        item
      );

      setDeleteModalOpen(
        true
      );
    };

  const handleConfirmDelete =
    () => {
      if (!deletingData) {
        return;
      }

      setDataList(
        (previous) =>
          previous.filter(
            (item) =>
              String(
                item.id
              ) !==
              String(
                deletingData.id
              )
          )
      );

      setDeleteModalOpen(
        false
      );

      setDeletingData(
        null
      );

      showSuccessAlert(
        "Berhasil dihapus",
        "Data Konfirmasi Piutang berhasil dihapus."
      );
    };

  /* =====================================================
     DOWNLOAD
  ===================================================== */

  const handleDownload =
    (item) => {
      if (
        item.file
      ) {
        const url =
          URL.createObjectURL(
            item.file
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          url;

        link.download =
          item.namaFile ||
          "konfirmasi-piutang";

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        URL.revokeObjectURL(
          url
        );

        return;
      }

      showErrorAlert(
        "File Belum Tersedia",
        "Nama file masih tersimpan, tetapi file asli belum tersedia setelah refresh. Setelah backend selesai, file akan diambil langsung dari database."
      );
    };

  /* =====================================================
     PAGINATION
  ===================================================== */

  const goPrevious =
    () => {
      setCurrentPage(
        (previous) =>
          Math.max(
            1,
            previous - 1
          )
      );
    };

  const goNext =
    () => {
      setCurrentPage(
        (previous) =>
          Math.min(
            totalPages,
            previous + 1
          )
      );
    };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="font-poppins text-[#334155]">
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
          DELETE CONFIRMATION
      ================================================= */}

      <ConfirmationPopup
        isOpen={
          deleteModalOpen
        }
        message="Apakah Anda yakin ingin menghapus data Konfirmasi Piutang?"
        subText={
          deletingData
            ? deletingData.namaCustomer
            : ""
        }
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={
          handleConfirmDelete
        }
        onCancel={() => {
          setDeleteModalOpen(
            false
          );

          setDeletingData(
            null
          );
        }}
      />

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">

        {/* =================================================
            TAMBAH DATA
        ================================================= */}

        <div className="flex justify-end">

          <button
            type="button"
            onClick={
              openCreateModal
            }
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-[#38BDF8]
              px-5
              py-2.5
              font-poppins
              text-sm
              font-medium
              text-white
              transition
              hover:bg-[#22AFE8]
              active:scale-[0.98]
            "
          >
            <Plus
              size={15}
            />

            Tambah Data
          </button>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="mt-4 overflow-hidden rounded-xl border border-[#DCE5EF]">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] border-collapse">

              {/* =============================================
                  HEADER
              ============================================== */}

              <thead className="bg-[#F8FAFC]">

                <tr className="border-b border-[#DCE5EF]">

                  <th className="w-[65px] px-4 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    NO
                  </th>

                  <th className="w-[240px] px-4 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    NAMA CUSTOMER
                  </th>

                  <th className="w-[220px] px-4 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    JUMLAH
                  </th>

                  <th className="px-4 py-3 text-left font-poppins text-[11px] font-semibold text-[#64748B]">
                    FILE KONFIRMASI PIUTANG
                  </th>

                  <th className="w-[120px] px-4 py-3 text-center font-poppins text-[11px] font-semibold text-[#64748B]">
                    AKSI
                  </th>

                </tr>

              </thead>

              {/* =============================================
                  BODY
              ============================================== */}

              <tbody>

                {currentData.length > 0 ? (

                  currentData.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={
                          item.id
                        }
                        className="
                          border-b
                          border-[#EEF2F6]
                          bg-white
                          transition
                          duration-200
                          hover:bg-[#FCFDFE]
                          last:border-b-0
                        "
                      >

                        {/* =================================
                            NO
                        ================================== */}

                        <td className="px-4 py-3 font-poppins text-sm text-[#475569]">
                          {startIndex +
                            index +
                            1}
                        </td>

                        {/* =================================
                            CUSTOMER
                        ================================== */}

                        <td className="px-4 py-3">

                          <span
                            title={
                              item.namaCustomer
                            }
                            className="
                              block
                              truncate
                              font-poppins
                              text-sm
                              text-[#475569]
                            "
                          >
                            {
                              item.namaCustomer
                            }
                          </span>

                        </td>

                        {/* =================================
                            JUMLAH
                        ================================== */}

                        <td className="px-4 py-3">

                          <div
                            className="
                              flex
                              h-10
                              max-w-[190px]
                              overflow-hidden
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-[#F8FAFC]
                            "
                          >

                            <span
                              className="
                                flex
                                items-center
                                border-r
                                border-[#DCE5EF]
                                px-3
                                font-poppins
                                text-sm
                                text-[#64748B]
                              "
                            >
                              Rp
                            </span>

                            <span
                              className="
                                flex
                                min-w-0
                                flex-1
                                items-center
                                truncate
                                px-3
                                font-poppins
                                text-sm
                                text-[#64748B]
                              "
                            >
                              {formatNumber(
                                item.jumlah
                              )}
                            </span>

                          </div>

                        </td>

                        {/* =================================
                            FILE
                        ================================== */}

                        <td className="px-4 py-3">

                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                item
                              )
                            }
                            title={
                              item.namaFile
                            }
                            className="
                              block
                              max-w-[520px]
                              truncate
                              text-left
                              font-poppins
                              text-sm
                              font-normal
                              text-[#475569]
                              transition
                              duration-200
                              hover:text-[#0EA5E9]
                            "
                          >
                            {item.namaFile ||
                              "Tidak ada file"}
                          </button>

                        </td>

                        {/* =================================
                            AKSI
                        ================================== */}

                        <td className="px-4 py-3">

                          <div className="flex items-center justify-center gap-2">

                            {/* EDIT */}

                            <button
                              type="button"
                              title="Edit"
                              onClick={() =>
                                openEditModal(
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
                                hover:bg-[#F1F5F9]
                                active:scale-90
                              "
                            >
                              <Pencil
                                size={15}
                                strokeWidth={
                                  1.8
                                }
                              />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              title="Hapus"
                              onClick={() =>
                                openDeleteModal(
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
                                size={15}
                                strokeWidth={
                                  1.8
                                }
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
                      className="
                        h-[160px]
                        text-center
                        font-poppins
                        text-sm
                        text-[#94A3B8]
                      "
                    >
                      Belum ada data Konfirmasi Piutang.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div
          className="
            mt-4
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <p className="font-poppins text-sm text-[#64748B]">
            Showing{" "}
            {showingFrom}{" "}
            to{" "}
            {showingTo}{" "}
            of{" "}
            {dataList.length}{" "}
            entries
          </p>

          <div className="flex items-center gap-2">

            {/* PREVIOUS */}

            <button
              type="button"
              disabled={
                currentPage ===
                1
              }
              onClick={
                goPrevious
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-[#DCE5EF]
                bg-white
                text-[#475569]
                transition
                duration-200
                hover:bg-[#F8FAFC]
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <ChevronLeft
                size={16}
              />
            </button>

            {/* PAGE */}

            <div
              className="
                flex
                h-9
                min-w-[36px]
                items-center
                justify-center
                rounded-lg
                bg-[#E0F2FE]
                px-3
                font-poppins
                text-sm
                font-semibold
                text-[#0EA5E9]
              "
            >
              {
                currentPage
              }
            </div>

            {/* NEXT */}

            <button
              type="button"
              disabled={
                currentPage >=
                totalPages
              }
              onClick={
                goNext
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-[#DCE5EF]
                bg-white
                text-[#475569]
                transition
                duration-200
                hover:bg-[#F8FAFC]
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <ChevronRight
                size={16}
              />
            </button>

          </div>

        </div>

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {modalOpen && (

        <div
          className={`
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            overflow-y-auto
            p-4
            transition-all
            duration-[280ms]

            ${
              modalVisible
                ? `
                  bg-black/40
                  opacity-100
                  backdrop-blur-[2px]
                `
                : `
                  bg-black/0
                  opacity-0
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
              closeModal();
            }
          }}
        >

          <div
            className={`
              my-auto
              w-full
              max-w-[600px]
              overflow-hidden
              rounded-xl
              bg-white
              transition-all
              duration-[280ms]

              ${
                modalVisible
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
                  `
              }
            `}
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            {/* =============================================
                HEADER
            ============================================== */}

            <div
              className="
                flex
                items-center
                justify-between
                bg-[#38BDF8]
                px-6
                py-5
                text-white
              "
            >

              <div>

                <h2 className="font-poppins text-lg font-semibold">
                  {modalMode ===
                  "create"
                    ? "Tambah Data"
                    : "Edit Data"}
                </h2>

                <p className="mt-1 font-poppins text-sm text-white/80">
                  {modalMode ===
                  "create"
                    ? "Tambahkan data Konfirmasi Piutang"
                    : "Perbarui data Konfirmasi Piutang"}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  transition
                  hover:bg-white/10
                "
              >
                <X
                  size={19}
                />
              </button>

            </div>

            {/* =============================================
                BODY
            ============================================== */}

            <div className="max-h-[70vh] overflow-y-auto px-6 py-6">

              {/* =========================================
                  NAMA CUSTOMER
              ========================================== */}

              <div>

                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Nama Customer
                </label>

                <input
                  type="text"
                  value={
                    formData.namaCustomer
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "namaCustomer",
                      event.target.value
                    )
                  }
                  placeholder="Masukkan nama customer"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#DCE5EF]
                    bg-white
                    px-4
                    font-poppins
                    text-sm
                    text-[#475569]
                    outline-none
                    transition
                    focus:border-[#38BDF8]
                  "
                />

              </div>

              {/* =========================================
                  KOTA CUSTOMER
              ========================================== */}

              <div className="mt-5">

                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Kota Customer
                </label>

                <input
                  type="text"
                  value={
                    formData.kotaCustomer
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "kotaCustomer",
                      event.target.value
                    )
                  }
                  placeholder="Masukkan kota customer"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#DCE5EF]
                    bg-white
                    px-4
                    font-poppins
                    text-sm
                    text-[#475569]
                    outline-none
                    transition
                    focus:border-[#38BDF8]
                  "
                />

              </div>

              {/* =========================================
                  JUMLAH
              ========================================== */}

              <div className="mt-5">

                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Jumlah
                </label>

                <div
                  className="
                    flex
                    h-12
                    overflow-hidden
                    rounded-xl
                    border
                    border-[#DCE5EF]
                    bg-white
                    transition
                    focus-within:border-[#38BDF8]
                  "
                >

                  <span
                    className="
                      flex
                      items-center
                      border-r
                      border-[#DCE5EF]
                      bg-[#F8FAFC]
                      px-4
                      font-poppins
                      text-sm
                      text-[#64748B]
                    "
                  >
                    Rp
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      formData.jumlah
                    }
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "jumlah",
                        formatInputRupiah(
                          event.target.value
                        )
                      )
                    }
                    placeholder="0"
                    className="
                      min-w-0
                      flex-1
                      bg-transparent
                      px-4
                      font-poppins
                      text-sm
                      text-[#475569]
                      outline-none
                    "
                  />

                </div>

              </div>

              {/* =========================================
                  FILE
              ========================================== */}

              <div className="mt-5">

                <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
                  Upload File
                </label>

                {/* FILE EXISTING */}

                {modalMode ===
                  "edit" &&
                  formData.namaFile &&
                  !formData.file && (

                    <div
                      className="
                        mb-3
                        rounded-xl
                        border
                        border-[#DCE5EF]
                        bg-[#F8FAFC]
                        px-4
                        py-3
                      "
                    >

                      <p className="font-poppins text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
                        File saat ini
                      </p>

                      <p
                        title={
                          formData.namaFile
                        }
                        className="
                          mt-1
                          truncate
                          font-poppins
                          text-sm
                          font-medium
                          text-[#38BDF8]
                        "
                      >
                        {
                          formData.namaFile
                        }
                      </p>

                    </div>

                  )}

                {/* FILE INPUT */}

                <div
                  className="
                    flex
                    min-h-12
                    items-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-[#DCE5EF]
                    bg-white
                    transition
                    focus-within:border-[#38BDF8]
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="
                      flex
                      h-12
                      shrink-0
                      items-center
                      gap-2
                      border-r
                      border-[#DCE5EF]
                      px-4
                      font-poppins
                      text-sm
                      font-medium
                      text-[#475569]
                      transition
                      hover:bg-[#F8FAFC]
                    "
                  >
                    <Upload
                      size={15}
                    />

                    Choose File
                  </button>

                  <div className="min-w-0 flex-1 px-4">

                    {formData.file ? (

                      <span
                        title={
                          formData.file.name
                        }
                        className="
                          block
                          truncate
                          font-poppins
                          text-sm
                          text-[#38BDF8]
                        "
                      >
                        {
                          formData.file.name
                        }
                      </span>

                    ) : (

                      <span className="block truncate font-poppins text-sm text-[#94A3B8]">
                        {modalMode ===
                        "edit"
                          ? "Pilih file baru jika ingin mengganti"
                          : "Pilih file yang akan di-upload"}
                      </span>

                    )}

                  </div>

                  {formData.file && (

                    <button
                      type="button"
                      onClick={
                        removeSelectedFile
                      }
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        text-[#94A3B8]
                        transition
                        duration-200
                        hover:bg-red-50
                        hover:text-red-500
                      "
                    >
                      <X
                        size={15}
                      />
                    </button>

                  )}

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    className="hidden"
                    onChange={
                      handleFileSelected
                    }
                  />

                </div>

                <p className="mt-2 font-poppins text-[11px] text-[#94A3B8]">
                  Maksimal ukuran file 10MB.
                </p>

              </div>

            </div>

            {/* =============================================
                FOOTER
            ============================================== */}

            <div
              className="
                flex
                items-center
                justify-end
                gap-3
                border-t
                border-[#DCE5EF]
                px-6
                py-4
              "
            >

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="
                  rounded-lg
                  border
                  border-[#DCE5EF]
                  bg-white
                  px-6
                  py-2.5
                  font-poppins
                  text-sm
                  font-medium
                  text-[#64748B]
                  transition
                  hover:bg-[#F8FAFC]
                "
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  handleSubmit
                }
                className="
                  rounded-lg
                  bg-[#22A58A]
                  px-6
                  py-2.5
                  font-poppins
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-[#1B8C76]
                "
              >
                {modalMode ===
                "create"
                  ? "Simpan"
                  : "Update"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}