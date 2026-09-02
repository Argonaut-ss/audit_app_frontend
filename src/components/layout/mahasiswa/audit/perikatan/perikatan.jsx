"use client";

import {
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useSearchParams,
} from "next/navigation";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";

/* =====================================================
   API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/* =====================================================
   DOCUMENT CONFIG
===================================================== */

const DOCUMENT_CONFIG = [
  {
    key: "FileProposal",
    label: "File Proposal",
    tableLabel: "Proposal Audit",
  },
  {
    key: "FileSPK",
    label: "File SPK",
    tableLabel: "File SPK",
  },
  {
    key: "FileSuratTugas",
    label: "File Surat Tugas",
    tableLabel: "Surat Tugas",
  },
  {
    key: "FilePenugasan",
    label: "File Surat Penugasan",
    tableLabel: "Penugasan",
  },
  {
    key: "FileIndependensi",
    label: "Surat Independensi",
    tableLabel: "Surat Independensi",
  },
];

/* =====================================================
   INITIAL FILES
===================================================== */

const INITIAL_FILES = {
  FileProposal: null,
  FileSPK: null,
  FileSuratTugas: null,
  FilePenugasan: null,
  FileIndependensi: null,
};

/* =====================================================
   AUTH
===================================================== */

function getAuthToken() {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    "token"
  );
}

async function fetchWithAuth(
  url,
  options = {}
) {
  const token =
    getAuthToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  return fetch(
    url,
    {
      ...options,

      headers: {
        Accept:
          "application/json",

        Authorization:
          `Bearer ${token}`,

        ...(options.headers ||
          {}),
      },
    }
  );
}

/* =====================================================
   PARSE RESPONSE
===================================================== */

async function parseResponse(
  response
) {
  let text = "";

  try {
    text =
      await response.text();
  } catch {
    return null;
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    return {
      raw: text,
    };
  }
}

/* =====================================================
   TABLE METADATA
===================================================== */

function getMetadataKey(
  perikatanId
) {
  if (!perikatanId) {
    return null;
  }

  return (
    "perikatan_table_" +
    String(
      perikatanId
    )
  );
}

function loadTableMetadata(
  perikatanId
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const key =
    getMetadataKey(
      perikatanId
    );

  if (!key) {
    return [];
  }

  try {
    const stored =
      sessionStorage.getItem(
        key
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(
        stored
      );

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "ERROR LOAD TABLE METADATA:",
      error
    );

    return [];
  }
}

function saveTableMetadata(
  perikatanId,
  rows
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const key =
    getMetadataKey(
      perikatanId
    );

  if (!key) {
    return;
  }

  try {
    sessionStorage.setItem(
      key,
      JSON.stringify(
        Array.isArray(
          rows
        )
          ? rows
          : []
      )
    );
  } catch (error) {
    console.error(
      "ERROR SAVE TABLE METADATA:",
      error
    );
  }
}

/* =====================================================
   PAGE
===================================================== */

export default function PerikatanPage({
  perikatanId:
    propPerikatanId,
}) {
  const params =
    useParams();

  const searchParams =
    useSearchParams();

  /* =====================================================
     ROUTE ID

     [id] dianggap sebagai PerikatanID.
  ===================================================== */

  const routeId =
    useMemo(() => {
      if (
        !params?.id
      ) {
        return "";
      }

      return String(
        params.id
      );
    }, [
      params,
    ]);

  /* =====================================================
     QUERY PERIKATAN ID
  ===================================================== */

  const queryPerikatanId =
    useMemo(() => {
      return (
        searchParams.get(
          "perikatanId"
        ) ||
        searchParams.get(
          "PerikatanID"
        ) ||
        searchParams.get(
          "perikatan_id"
        ) ||
        ""
      );
    }, [
      searchParams,
    ]);

  /* =====================================================
     INITIAL PERIKATAN ID

     Digunakan supaya ID langsung tersedia ketika
     component pertama kali tampil.

     Tidak perlu menunggu response API.
  ===================================================== */

  const getInitialPerikatanId =
    () => {
      const directId =
        propPerikatanId ||
        queryPerikatanId ||
        routeId ||
        "";

      if (directId) {
        return String(
          directId
        );
      }

      if (
        typeof window !==
        "undefined"
      ) {
        return (
          sessionStorage.getItem(
            "activePerikatanId"
          ) ||
          ""
        );
      }

      return "";
    };

  /* =====================================================
     IDS
  ===================================================== */

  const [
    perikatanId,
    setPerikatanId,
  ] = useState(
    getInitialPerikatanId
  );

  const [
    jwbKasusId,
    setJwbKasusId,
  ] = useState("");

  const [
    kasusId,
    setKasusId,
  ] = useState("");

  /* =====================================================
     PERIKATAN
  ===================================================== */

  const [
    perikatan,
    setPerikatan,
  ] = useState(null);

  /*
   * Loading sekarang hanya menandakan
   * proses refresh data di background.
   *
   * Loading tidak lagi mengganti seluruh UI
   * dengan spinner.
   */
  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =====================================================
     TABLE

     Metadata langsung dibaca ketika component mount.
     Jadi tabel bisa langsung muncul tanpa menunggu API.
  ===================================================== */

  const [
    uploadedDocuments,
    setUploadedDocuments,
  ] = useState(
    () => {
      const id =
        getInitialPerikatanId();

      if (!id) {
        return [];
      }

      return loadTableMetadata(
        id
      );
    }
  );

  /* =====================================================
     UPLOAD MODAL
  ===================================================== */

  const [
    uploadModalOpen,
    setUploadModalOpen,
  ] = useState(false);

  const [
    uploadModalVisible,
    setUploadModalVisible,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    files,
    setFiles,
  ] = useState({
    ...INITIAL_FILES,
  });

  /* =====================================================
     DELETE
  ===================================================== */

  const [
    deleteModalOpen,
    setDeleteModalOpen,
  ] = useState(false);

  const [
    deletingDocument,
    setDeletingDocument,
  ] = useState(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  /* =====================================================
     ALERT
  ===================================================== */

  const [
    errorAlert,
    setErrorAlert,
  ] = useState(null);

  const [
    successAlert,
    setSuccessAlert,
  ] = useState(null);

  const alertTimerRef =
    useRef(null);

  /* =====================================================
     REFS
  ===================================================== */

  const inputRefs =
    useRef({});

  const modalTimerRef =
    useRef(null);

  /* =====================================================
     TIMER
  ===================================================== */

  const clearAlertTimer =
    useCallback(
      () => {
        if (
          alertTimerRef.current
        ) {
          clearTimeout(
            alertTimerRef.current
          );

          alertTimerRef.current =
            null;
        }
      },
      []
    );

  const clearModalTimer =
    useCallback(
      () => {
        if (
          modalTimerRef.current
        ) {
          clearTimeout(
            modalTimerRef.current
          );

          modalTimerRef.current =
            null;
        }
      },
      []
    );

  /* =====================================================
     ALERT
  ===================================================== */

  const showErrorAlert =
    useCallback(
      (
        title,
        message
      ) => {
        clearAlertTimer();

        setSuccessAlert(
          null
        );

        setErrorAlert({
          title,
          message,
        });

        alertTimerRef.current =
          setTimeout(
            () => {
              setErrorAlert(
                null
              );
            },
            4500
          );
      },
      [
        clearAlertTimer,
      ]
    );

  const showSuccessAlert =
    useCallback(
      (
        title,
        message
      ) => {
        clearAlertTimer();

        setErrorAlert(
          null
        );

        setSuccessAlert({
          title,
          message,
        });

        alertTimerRef.current =
          setTimeout(
            () => {
              setSuccessAlert(
                null
              );
            },
            3500
          );
      },
      [
        clearAlertTimer,
      ]
    );

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(
    () => {
      return () => {
        clearAlertTimer();
        clearModalTimer();
      };
    },
    [
      clearAlertTimer,
      clearModalTimer,
    ]
  );

  /* =====================================================
     SAVE IDS
  ===================================================== */

  const savePerikatanId =
    useCallback(
      (
        id
      ) => {
        if (!id) {
          return;
        }

        const value =
          String(id);

        setPerikatanId(
          value
        );

        if (
          typeof window !==
          "undefined"
        ) {
          sessionStorage.setItem(
            "activePerikatanId",
            value
          );
        }
      },
      []
    );

  const saveJwbKasusId =
    useCallback(
      (
        id
      ) => {
        if (!id) {
          return;
        }

        const value =
          String(id);

        setJwbKasusId(
          value
        );

        if (
          typeof window !==
          "undefined"
        ) {
          sessionStorage.setItem(
            "activeJwbKasusId",
            value
          );
        }
      },
      []
    );

  const saveKasusId =
    useCallback(
      (
        id
      ) => {
        if (!id) {
          return;
        }

        const value =
          String(id);

        setKasusId(
          value
        );

        if (
          typeof window !==
          "undefined"
        ) {
          sessionStorage.setItem(
            "activeKasusId",
            value
          );
        }
      },
      []
    );

  /* =====================================================
     APPLY PERIKATAN
  ===================================================== */

  const applyPerikatanData =
    useCallback(
      (
        data
      ) => {
        if (!data) {
          return;
        }

        setPerikatan(
          data
        );

        if (
          data
            ?.PerikatanID
        ) {
          savePerikatanId(
            data
              .PerikatanID
          );
        }

        /*
         * JwbKasusID langsung dari Perikatan.
         */
        if (
          data
            ?.JwbKasusID
        ) {
          saveJwbKasusId(
            data
              .JwbKasusID
          );
        }

        /*
         * Support nama relasi Laravel.
         */
        const relatedJwbKasus =
          data
            ?.jwb_kasus ||
          data
            ?.jwbKasus ||
          data
            ?.JwbKasus ||
          null;

        if (
          relatedJwbKasus
            ?.JwbKasusID
        ) {
          saveJwbKasusId(
            relatedJwbKasus
              .JwbKasusID
          );
        }

        if (
          relatedJwbKasus
            ?.KasusID
        ) {
          saveKasusId(
            relatedJwbKasus
              .KasusID
          );
        }
      },
      [
        savePerikatanId,
        saveJwbKasusId,
        saveKasusId,
      ]
    );

  /* =====================================================
     GET PERIKATAN

     HANYA:
     GET /api/perikatan/{PerikatanID}
  ===================================================== */

  const getPerikatanById =
    useCallback(
      async (
        targetPerikatanId
      ) => {
        if (
          !targetPerikatanId
        ) {
          return null;
        }

        const response =
          await fetchWithAuth(
            `${API_URL}/api/perikatan/${targetPerikatanId}`,
            {
              method:
                "GET",

              /*
               * Tetap ambil data terbaru.
               */
              cache:
                "no-store",
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (
          !response.ok
        ) {
          if (
            response.status ===
            404
          ) {
            return null;
          }

          throw new Error(
            result?.message ||
              result?.error ||
              "Gagal mengambil data Perikatan."
          );
        }

        applyPerikatanData(
          result
        );

        /*
         * Metadata tabel bisa langsung dipulihkan.
         */
        const rows =
          loadTableMetadata(
            result
              ?.PerikatanID ||
              targetPerikatanId
          );

        setUploadedDocuments(
          rows
        );

        return result;
      },
      [
        applyPerikatanData,
      ]
    );

  /* =====================================================
     RESOLVE PERIKATAN

     Tidak menahan render halaman lagi.
  ===================================================== */

  const resolvePerikatan =
    useCallback(
      async () => {
        try {
          /*
           * Hanya tanda refresh background.
           * UI tetap tampil.
           */
          setLoading(
            true
          );

          let storedPerikatanId =
            "";

          if (
            typeof window !==
            "undefined"
          ) {
            storedPerikatanId =
              sessionStorage.getItem(
                "activePerikatanId"
              ) ||
              "";
          }

          const targetPerikatanId =
            propPerikatanId ||
            queryPerikatanId ||
            routeId ||
            storedPerikatanId ||
            "";

          if (
            !targetPerikatanId
          ) {
            setPerikatan(
              null
            );

            setPerikatanId(
              ""
            );

            setJwbKasusId(
              ""
            );

            setKasusId(
              ""
            );

            setUploadedDocuments(
              []
            );

            return;
          }

          /*
           * Langsung set ID terlebih dahulu
           * sebelum request API selesai.
           */
          const targetId =
            String(
              targetPerikatanId
            );

          setPerikatanId(
            targetId
          );

          /*
           * Tampilkan metadata yang tersimpan
           * sesegera mungkin.
           */
          const cachedRows =
            loadTableMetadata(
              targetId
            );

          setUploadedDocuments(
            cachedRows
          );

          /*
           * Setelah UI sudah tampil,
           * refresh data dari backend.
           */
          const result =
            await getPerikatanById(
              targetId
            );

          if (!result) {
            setPerikatan(
              null
            );

            setPerikatanId(
              ""
            );

            setJwbKasusId(
              ""
            );

            setKasusId(
              ""
            );

            setUploadedDocuments(
              []
            );

            showErrorAlert(
              "Perikatan belum ditemukan",
              `PerikatanID ${targetId} tidak ditemukan.`
            );

            return;
          }
        } catch (
          error
        ) {
          console.error(
            "ERROR RESOLVE PERIKATAN:",
            error
          );

          /*
           * Kalau API error,
           * jangan langsung hilangkan UI/cache.
           *
           * Supaya user tidak melihat page berkedip.
           */
          showErrorAlert(
            "Gagal Mengambil Data",
            error?.message ||
              "Gagal mengambil data Perikatan."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        propPerikatanId,
        queryPerikatanId,
        routeId,
        getPerikatanById,
        showErrorAlert,
      ]
    );

  /* =====================================================
     LOAD / REFRESH BACKGROUND
  ===================================================== */

  useEffect(
    () => {
      const timerId =
        setTimeout(
          () => {
            void resolvePerikatan();
          },
          0
        );

      return () => {
        clearTimeout(
          timerId
        );
      };
    },
    [
      resolvePerikatan,
    ]
  );

  /* =====================================================
     REFRESH PERIKATAN
  ===================================================== */

  const fetchPerikatan =
    useCallback(
      async () => {
        if (
          !perikatanId
        ) {
          return null;
        }

        return getPerikatanById(
          perikatanId
        );
      },
      [
        perikatanId,
        getPerikatanById,
      ]
    );

  /* =====================================================
     DATE TIME
  ===================================================== */

  function getCurrentDateTime() {
    const now =
      new Date();

    const date =
      new Intl.DateTimeFormat(
        "id-ID",
        {
          day:
            "2-digit",

          month:
            "2-digit",

          year:
            "numeric",

          timeZone:
            "Asia/Jakarta",
        }
      ).format(
        now
      );

    const time =
      new Intl.DateTimeFormat(
        "id-ID",
        {
          hour:
            "2-digit",

          minute:
            "2-digit",

          hour12:
            false,

          timeZone:
            "Asia/Jakarta",
        }
      )
        .format(
          now
        )
        .replace(
          ".",
          ":"
        );

    return `${date} ${time} WIB`;
  }

  /* =====================================================
     UPDATE TABLE
  ===================================================== */

  function updateUploadedTable(
    selectedDocuments
  ) {
    const uploadTime =
      getCurrentDateTime();

    const newRows =
      selectedDocuments.map(
        (
          document
        ) => {
          const file =
            files[
              document.key
            ];

          return {
            field:
              document.key,

            jenis:
              document.tableLabel,

            fileName:
              file?.name ||
              document.tableLabel,

            uploadTime,
          };
        }
      );

    setUploadedDocuments(
      (
        previous
      ) => {
        const merged = [
          ...previous,
        ];

        newRows.forEach(
          (
            newRow
          ) => {
            const index =
              merged.findIndex(
                (
                  row
                ) =>
                  row.field ===
                  newRow.field
              );

            if (
              index >=
              0
            ) {
              merged[
                index
              ] =
                newRow;
            } else {
              merged.push(
                newRow
              );
            }
          }
        );

        merged.sort(
          (
            a,
            b
          ) => {
            const indexA =
              DOCUMENT_CONFIG.findIndex(
                (
                  item
                ) =>
                  item.key ===
                  a.field
              );

            const indexB =
              DOCUMENT_CONFIG.findIndex(
                (
                  item
                ) =>
                  item.key ===
                  b.field
              );

            return (
              indexA -
              indexB
            );
          }
        );

        saveTableMetadata(
          perikatanId,
          merged
        );

        return [
          ...merged,
        ];
      }
    );
  }

  /* =====================================================
     OPEN UPLOAD MODAL
  ===================================================== */

  function openUploadModal() {
    if (
      !perikatanId
    ) {
      showErrorAlert(
        "Data Perikatan belum tersedia",
        "PerikatanID belum tersedia."
      );

      return;
    }

    clearModalTimer();

    setFiles({
      ...INITIAL_FILES,
    });

    setUploadModalOpen(
      true
    );

    requestAnimationFrame(
      () => {
        requestAnimationFrame(
          () => {
            setUploadModalVisible(
              true
            );
          }
        );
      }
    );
  }

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeUploadModal =
    useCallback(
      () => {
        if (
          uploading
        ) {
          return;
        }

        clearModalTimer();

        setUploadModalVisible(
          false
        );

        modalTimerRef.current =
          setTimeout(
            () => {
              setUploadModalOpen(
                false
              );

              setFiles({
                ...INITIAL_FILES,
              });

              Object.values(
                inputRefs.current
              ).forEach(
                (
                  input
                ) => {
                  if (
                    input
                  ) {
                    input.value =
                      "";
                  }
                }
              );
            },
            280
          );
      },
      [
        clearModalTimer,
        uploading,
      ]
    );

  function closeUploadAfterSuccess() {
    clearModalTimer();

    setUploadModalVisible(
      false
    );

    modalTimerRef.current =
      setTimeout(
        () => {
          setUploadModalOpen(
            false
          );

          setFiles({
            ...INITIAL_FILES,
          });

          Object.values(
            inputRefs.current
          ).forEach(
            (
              input
            ) => {
              if (
                input
              ) {
                input.value =
                  "";
              }
            }
          );
        },
        280
      );
  }

  /* =====================================================
     ESCAPE
  ===================================================== */

  useEffect(
    () => {
      if (
        !uploadModalOpen
      ) {
        return;
      }

      function handleEscape(
        event
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          closeUploadModal();
        }
      }

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
    },
    [
      closeUploadModal,
      uploadModalOpen,
      uploading,
    ]
  );

  /* =====================================================
     BODY SCROLL LOCK
  ===================================================== */

  useEffect(
    () => {
      if (
        !uploadModalOpen
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
    },
    [
      uploadModalOpen,
    ]
  );

  /* =====================================================
     VALIDATE FILE
  ===================================================== */

  function validateFile(
    file
  ) {
    if (!file) {
      return false;
    }

    const extension =
      file.name
        .split(
          "."
        )
        .pop()
        ?.toLowerCase();

    const allowedExtensions =
      [
        "pdf",
        "doc",
        "docx",
      ];

    if (
      !allowedExtensions.includes(
        extension
      )
    ) {
      showErrorAlert(
        "File Tidak Valid",
        "File harus berupa PDF, DOC, atau DOCX."
      );

      return false;
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
        "File Terlalu Besar",
        "Ukuran maksimal file adalah 10 MB."
      );

      return false;
    }

    return true;
  }

  /* =====================================================
     FILE CHANGE
  ===================================================== */

  function handleFileChange(
    field,
    file
  ) {
    if (!file) {
      return;
    }

    if (
      !validateFile(
        file
      )
    ) {
      if (
        inputRefs.current[
          field
        ]
      ) {
        inputRefs.current[
          field
        ].value =
          "";
      }

      return;
    }

    setFiles(
      (
        previous
      ) => ({
        ...previous,

        [field]:
          file,
      })
    );
  }

  /* =====================================================
     REMOVE SELECTED FILE
  ===================================================== */

  function removeSelectedFile(
    field
  ) {
    if (
      uploading
    ) {
      return;
    }

    setFiles(
      (
        previous
      ) => ({
        ...previous,

        [field]:
          null,
      })
    );

    if (
      inputRefs.current[
        field
      ]
    ) {
      inputRefs.current[
        field
      ].value =
        "";
    }
  }

  /* =====================================================
     SELECTED FILES
  ===================================================== */

  function getSelectedFiles() {
    return DOCUMENT_CONFIG.filter(
      (
        document
      ) =>
        files[
          document.key
        ] instanceof
        File
    );
  }

  /* =====================================================
     RESET FORM
  ===================================================== */

  function resetUploadForm() {
    setFiles({
      ...INITIAL_FILES,
    });

    Object.values(
      inputRefs.current
    ).forEach(
      (
        input
      ) => {
        if (
          input
        ) {
          input.value =
            "";
        }
      }
    );
  }

  /* =====================================================
     UPLOAD
  ===================================================== */

  async function handleUpload() {
    const selectedDocuments =
      getSelectedFiles();

    if (
      selectedDocuments.length ===
      0
    ) {
      showErrorAlert(
        "Belum Ada File",
        "Pilih minimal satu file yang akan diupload."
      );

      return;
    }

    if (
      !perikatanId
    ) {
      showErrorAlert(
        "Data Perikatan belum tersedia",
        "PerikatanID belum tersedia."
      );

      return;
    }

    try {
      setUploading(
        true
      );

      const successfulUploads =
        [];

      for (
        const document
        of selectedDocuments
      ) {
        const file =
          files[
            document.key
          ];

        if (
          !(
            file instanceof
            File
          )
        ) {
          continue;
        }

        const formData =
          new FormData();

        formData.append(
          document.key,
          file,
          file.name
        );

        const response =
          await fetchWithAuth(
            `${API_URL}/api/perikatan/${perikatanId}`,
            {
              method:
                "POST",

              body:
                formData,
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (
          !response.ok
        ) {
          let errorMessage =
            `Gagal menyimpan ${document.label}.`;

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

            if (
              firstError
            ) {
              errorMessage =
                String(
                  firstError
                );
            }
          } else if (
            typeof result?.message ===
            "string"
          ) {
            errorMessage =
              result.message;
          } else if (
            typeof result?.error ===
            "string"
          ) {
            errorMessage =
              result.error;
          } else if (
            typeof result?.raw ===
            "string"
          ) {
            errorMessage =
              result.raw;
          }

          throw new Error(
            `${document.label}: ${errorMessage}`
          );
        }

        if (
          result
            ?.data
            ?.JwbKasusID
        ) {
          saveJwbKasusId(
            result
              .data
              .JwbKasusID
          );
        }

        successfulUploads.push(
          document
        );
      }

      if (
        successfulUploads.length ===
        0
      ) {
        throw new Error(
          "Tidak ada file yang berhasil disimpan."
        );
      }

      updateUploadedTable(
        successfulUploads
      );

      /*
       * Refresh data background.
       */
      try {
        await fetchPerikatan();
      } catch {
        //
      }

      resetUploadForm();

      closeUploadAfterSuccess();

      showSuccessAlert(
        "Upload Berhasil",
        `${successfulUploads.length} file berhasil disimpan.`
      );
    } catch (
      error
    ) {
      console.error(
        "ERROR UPLOAD PERIKATAN:",
        error
      );

      showErrorAlert(
        "Upload Gagal",
        error?.message ||
          "Tidak dapat terhubung ke server."
      );
    } finally {
      setUploading(
        false
      );
    }
  }

  /* =====================================================
     DELETE MODAL
  ===================================================== */

  function openDeleteConfirmation(
    document
  ) {
    if (
      !document ||
      deleting
    ) {
      return;
    }

    setDeletingDocument(
      document
    );

    setDeleteModalOpen(
      true
    );
  }

  function closeDeleteConfirmation() {
    if (
      deleting
    ) {
      return;
    }

    setDeleteModalOpen(
      false
    );

    setDeletingDocument(
      null
    );
  }

  /* =====================================================
     DELETE FILE
  ===================================================== */

  async function handleConfirmDelete() {
    const document =
      deletingDocument;

    if (
      !perikatanId ||
      !document?.field
    ) {
      setDeleteModalOpen(
        false
      );

      setDeletingDocument(
        null
      );

      showErrorAlert(
        "Penghapusan Gagal",
        "PerikatanID atau jenis file tidak tersedia."
      );

      return;
    }

    try {
      setDeleting(
        true
      );

      const response =
        await fetchWithAuth(
          `${API_URL}/api/perikatan/${perikatanId}/${document.field}`,
          {
            method:
              "DELETE",
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (
        !response.ok
      ) {
        throw new Error(
          result?.message ||
            result?.error ||
            "File gagal dihapus."
        );
      }

      if (
        result
          ?.data
          ?.JwbKasusID
      ) {
        saveJwbKasusId(
          result
            .data
            .JwbKasusID
        );
      }

      setUploadedDocuments(
        (
          previous
        ) => {
          const next =
            previous.filter(
              (
                row
              ) =>
                row.field !==
                document.field
            );

          saveTableMetadata(
            perikatanId,
            next
          );

          return next;
        }
      );

      setDeleteModalOpen(
        false
      );

      setDeletingDocument(
        null
      );

      showSuccessAlert(
        "File Dihapus",
        result?.message ||
          `${document.jenis} berhasil dihapus.`
      );
    } catch (
      error
    ) {
      console.error(
        "ERROR DELETE PERIKATAN:",
        error
      );

      showErrorAlert(
        "Penghapusan Gagal",
        error?.message ||
          "File gagal dihapus."
      );
    } finally {
      setDeleting(
        false
      );
    }
  }

  /* =====================================================
     RENDER

     Tidak ada lagi:
     if (loading) return <Spinner />
  ===================================================== */

  return (
    <>
      {/* ===============================================
          ALERT ERROR
      ================================================ */}

      {errorAlert && (
        <AlertError
          title={
            errorAlert.title
          }
          message={
            errorAlert.message
          }
          onClose={() =>
            setErrorAlert(
              null
            )
          }
        />
      )}

      {/* ===============================================
          ALERT SUCCESS
      ================================================ */}

      {successAlert && (
        <AlertSuccess
          title={
            successAlert.title
          }
          message={
            successAlert.message
          }
          onClose={() =>
            setSuccessAlert(
              null
            )
          }
        />
      )}

      {/* ===============================================
          DELETE CONFIRMATION
      ================================================ */}

      <ConfirmationPopup
        isOpen={
          deleteModalOpen
        }
        message="Apakah kamu yakin ingin menghapus file?"
        subText={
          deletingDocument
            ? deletingDocument
                .fileName ||
              deletingDocument
                .jenis ||
              ""
            : ""
        }
        confirmText={
          deleting
            ? "Menghapus..."
            : "Ya, Hapus"
        }
        cancelText="Batal"
        onConfirm={
          handleConfirmDelete
        }
        onCancel={
          closeDeleteConfirmation
        }
      />

      {/* ===============================================
          PAGE
      ================================================ */}

      <div
        className="
          min-h-full
          w-full
          rounded-b-xl
          bg-white
          p-5
        "
      >
        {/* =============================================
            HEADER
        ============================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            pb-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-[#E8F7FE]
              "
            >
              <FileText
                size={20}
                strokeWidth={
                  1.8
                }
                className="
                  text-[#38BDF8]
                "
              />
            </div>

            <div>
              <h2
                className="
                  font-poppins
                  text-lg
                  font-semibold
                  text-[#1F2937]
                "
              >
                Detail Perikatan
              </h2>

              <p
                className="
                  font-poppins
                  text-sm
                  text-[#7B8794]
                "
              >
                Unggah & lengkapi dokumen perikatan audit
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              openUploadModal
            }
            disabled={
              !perikatanId
            }
            className="
              flex
              h-[42px]
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-[#2bb5ed]
              px-5
              font-poppins
              text-[13px]
              font-semibold
              text-white
              shadow-sm
              transition
              duration-200
              hover:-translate-y-[1px]
              hover:bg-[#20a7df]
              hover:shadow-md
              active:translate-y-0
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Upload
              size={16}
            />

            Tambah Data
          </button>
        </div>

        {/* =============================================
            STATUS

            Jangan tampilkan warning selama
            background request masih berjalan.
        ============================================== */}

        {!loading &&
          !perikatanId && (
            <div
              className="
                pb-5
              "
            >
              <div
                className="
                  rounded-xl
                  border
                  border-amber-200
                  bg-amber-50
                  px-5
                  py-4
                "
              >
                <p
                  className="
                    font-poppins
                    text-[14px]
                    font-semibold
                    text-amber-700
                  "
                >
                  Data Perikatan belum tersedia
                </p>

                <p
                  className="
                    mt-1
                    font-poppins
                    text-[12px]
                    leading-5
                    text-amber-600
                  "
                >
                  PerikatanID belum ditemukan. Pastikan halaman sebelumnya mengirim PerikatanID.
                </p>
              </div>
            </div>
          )}

        {/* =============================================
            TABLE CARD
        ============================================== */}

        <div
          className="
            w-full
          "
        >
          <div
            className="
              w-full
              overflow-hidden
              rounded-xl
              border
              border-[#dce5ef]
              bg-white
              px-5
              pb-6
              pt-5
            "
          >
            <div
              className="
                overflow-x-auto
              "
            >
              <table
                className="
                  w-full
                  min-w-[900px]
                  border-collapse
                "
              >
                <thead>
                  <tr
                    className="
                      bg-[#f6f8fb]
                    "
                  >
                    <th
                      className="
                        w-[70px]
                        px-5
                        py-4
                        text-left
                        font-poppins
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.04em]
                        text-[#64758d]
                      "
                    >
                      NO
                    </th>

                    <th
                      className="
                        w-[210px]
                        px-5
                        py-4
                        text-left
                        font-poppins
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.04em]
                        text-[#64758d]
                      "
                    >
                      JENIS
                    </th>

                    <th
                      className="
                        px-5
                        py-4
                        text-left
                        font-poppins
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.04em]
                        text-[#64758d]
                      "
                    >
                      FILE
                    </th>

                    <th
                      className="
                        w-[215px]
                        px-5
                        py-4
                        text-left
                        font-poppins
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.04em]
                        text-[#64758d]
                      "
                    >
                      WAKTU UNGGAH
                    </th>

                    <th
                      className="
                        w-[85px]
                        px-5
                        py-4
                        text-center
                        font-poppins
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.04em]
                        text-[#64758d]
                      "
                    >
                      AKSI
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {uploadedDocuments.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={
                          5
                        }
                        className="
                          border-t
                          border-[#e6ebf2]
                          px-5
                          py-16
                          text-center
                        "
                      >
                        <div
                          className="
                            flex
                            flex-col
                            items-center
                            justify-center
                          "
                        >
                          <div
                            className="
                              flex
                              h-14
                              w-14
                              items-center
                              justify-center
                              rounded-xl
                              bg-[#eaf8fe]
                              text-[#2bb5ed]
                            "
                          >
                            <FileText
                              size={25}
                            />
                          </div>

                          <div
                            className="
                              mt-4
                              font-poppins
                              text-[15px]
                              font-semibold
                              text-[#40516b]
                            "
                          >
                            Belum ada dokumen perikatan
                          </div>

                          <div
                            className="
                              mt-1
                              font-poppins
                              text-[13px]
                              text-[#96a6bd]
                            "
                          >
                            Klik Tambah Data untuk menambahkan dokumen.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    uploadedDocuments.map(
                      (
                        document,
                        index
                      ) => (
                        <tr
                          key={
                            document.field
                          }
                          className="
                            border-t
                            border-[#e6ebf2]
                            transition
                            hover:bg-slate-50/50
                          "
                        >
                          <td
                            className="
                              px-5
                              py-5
                              font-poppins
                              text-[13px]
                              text-[#40516b]
                            "
                          >
                            {index +
                              1}
                          </td>

                          <td
                            className="
                              px-5
                              py-5
                              font-poppins
                              text-[13px]
                              font-medium
                              text-[#40516b]
                            "
                          >
                            {
                              document.jenis
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-5
                            "
                          >
                            <span
                              className="
                                break-all
                                font-poppins
                                text-[13px]
                                font-medium
                                text-[#2bb5ed]
                              "
                            >
                              {
                                document.fileName
                              }
                            </span>
                          </td>

                          <td
                            className="
                              px-5
                              py-5
                              font-poppins
                              text-[13px]
                              text-[#40516b]
                            "
                          >
                            {
                              document.uploadTime
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-5
                              text-center
                            "
                          >
                            <button
                              type="button"
                              onClick={() =>
                                openDeleteConfirmation(
                                  document
                                )
                              }
                              disabled={
                                deleting
                              }
                              title="Hapus dokumen"
                              className="
                                inline-flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                bg-[#fff0f1]
                                text-[#ff4555]
                                transition
                                duration-200
                                hover:scale-105
                                hover:bg-[#ffe3e6]
                                active:scale-95
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              <Trash2
                                size={
                                  17
                                }
                              />
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ===============================================
          UPLOAD MODAL
      ================================================ */}

      {uploadModalOpen && (
        <div
          className={`
            fixed
            inset-0
            z-[9998]
            flex
            items-center
            justify-center
            p-4
            transition-all
            duration-300
            ease-out

            ${
              uploadModalVisible
                ? `
                  bg-black/35
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
              closeUploadModal();
            }
          }}
        >
          <div
            className={`
              w-full
              max-w-[640px]
              overflow-hidden
              rounded-[14px]
              bg-white
              transform-gpu
              transition-all
              duration-300
              ease-out

              ${
                uploadModalVisible
                  ? `
                    translate-y-0
                    scale-100
                    opacity-100
                    shadow-[0_24px_70px_rgba(15,23,42,0.24)]
                  `
                  : `
                    translate-y-5
                    scale-[0.96]
                    opacity-0
                    shadow-[0_10px_30px_rgba(15,23,42,0.08)]
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
                MODAL HEADER
            ========================================== */}

            <div
              className="
                flex
                min-h-[94px]
                items-center
                justify-between
                gap-4
                bg-gradient-to-r
                from-[#32b8f1]
                to-[#19ace8]
                px-8
                py-5
                text-white
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    h-[48px]
                    w-[48px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[13px]
                    bg-white/15
                  "
                >
                  <Upload
                    size={
                      24
                    }
                    strokeWidth={
                      1.9
                    }
                  />
                </div>

                <div>
                  <h3
                    className="
                      font-poppins
                      text-[18px]
                      font-bold
                      leading-tight
                    "
                  >
                    Upload Data Perikatan
                  </h3>

                  <p
                    className="
                      mt-1
                      font-poppins
                      text-[13px]
                      text-white/90
                    "
                  >
                    Unggah file dokumen perikatan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  closeUploadModal
                }
                disabled={
                  uploading
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
                  disabled:opacity-50
                "
              >
                <X
                  size={
                    20
                  }
                />
              </button>
            </div>

            {/* =========================================
                MODAL BODY
            ========================================== */}

            <div
              className="
                px-8
                py-7
              "
            >
              <div
                className="
                  space-y-6
                "
              >
                {DOCUMENT_CONFIG.map(
                  (
                    document
                  ) => {
                    const selectedFile =
                      files[
                        document.key
                      ];

                    return (
                      <div
                        key={
                          document.key
                        }
                      >
                        <label
                          className="
                            mb-2.5
                            block
                            font-poppins
                            text-[14px]
                            font-bold
                            text-[#18243a]
                          "
                        >
                          {
                            document.label
                          }
                        </label>

                        <div
                          className="
                            flex
                            h-[40px]
                            w-full
                            overflow-hidden
                            rounded-[7px]
                            border
                            border-[#cdd8e6]
                            bg-white
                            transition
                            duration-200
                            focus-within:border-[#2bb5ed]
                            focus-within:ring-2
                            focus-within:ring-[#2bb5ed]/10
                          "
                        >
                          <button
                            type="button"
                            disabled={
                              uploading
                            }
                            onClick={() =>
                              inputRefs.current[
                                document.key
                              ]?.click()
                            }
                            className="
                              flex
                              h-full
                              shrink-0
                              items-center
                              justify-center
                              border-r
                              border-[#cdd8e6]
                              bg-white
                              px-4
                              font-poppins
                              text-[13px]
                              font-medium
                              text-[#172033]
                              transition
                              duration-200
                              hover:bg-[#f5f9fc]
                              active:bg-[#edf4f8]
                              disabled:opacity-60
                            "
                          >
                            Choose File
                          </button>

                          <div
                            className="
                              flex
                              min-w-0
                              flex-1
                              items-center
                              px-4
                            "
                          >
                            {selectedFile ? (
                              <span
                                className="
                                  truncate
                                  font-poppins
                                  text-[13px]
                                  text-[#16aef0]
                                "
                              >
                                {
                                  selectedFile.name
                                }
                              </span>
                            ) : (
                              <span
                                className="
                                  truncate
                                  font-poppins
                                  text-[13px]
                                  text-[#7b8aa2]
                                "
                              >
                                Pilih File yang akan di Upload
                              </span>
                            )}
                          </div>

                          {selectedFile && (
                            <button
                              type="button"
                              disabled={
                                uploading
                              }
                              onClick={() =>
                                removeSelectedFile(
                                  document.key
                                )
                              }
                              className="
                                flex
                                h-full
                                w-10
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
                                size={
                                  15
                                }
                              />
                            </button>
                          )}

                          <input
                            ref={(
                              element
                            ) => {
                              inputRefs.current[
                                document.key
                              ] =
                                element;
                            }}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            disabled={
                              uploading
                            }
                            onChange={(
                              event
                            ) => {
                              const file =
                                event
                                  .target
                                  .files?.[0];

                              if (
                                file
                              ) {
                                handleFileChange(
                                  document.key,
                                  file
                                );
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* =========================================
                MODAL FOOTER
            ========================================== */}

            <div
              className="
                flex
                min-h-[78px]
                items-center
                justify-end
                border-t
                border-[#e7edf3]
                bg-white
                px-8
              "
            >
              <button
                type="button"
                onClick={
                  handleUpload
                }
                disabled={
                  uploading
                }
                className="
                  flex
                  h-[40px]
                  min-w-[120px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[8px]
                  bg-[#00a614]
                  px-5
                  font-poppins
                  text-[14px]
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  duration-200
                  hover:-translate-y-[1px]
                  hover:bg-[#009313]
                  hover:shadow-md
                  active:translate-y-0
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {uploading ? (
                  <>
                    <Loader2
                      size={
                        17
                      }
                      className="
                        animate-spin
                      "
                    />

                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FileText
                      size={
                        16
                      }
                    />

                    Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}