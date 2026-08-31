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
   INITIAL FILE
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

const getAuthToken = () => {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    "token"
  );
};

const fetchWithAuth = async (
  url,
  options = {}
) => {
  const token =
    getAuthToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  return fetch(url, {
    ...options,

    headers: {
      Accept:
        "application/json",

      Authorization:
        `Bearer ${token}`,

      ...(options.headers ||
        {}),
    },
  });
};

/* =====================================================
   RESPONSE PARSER
===================================================== */

const parseResponse =
  async (response) => {
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
  };

/* =====================================================
   EXTRACT ARRAY
===================================================== */

const extractArray =
  (result) => {
    if (
      Array.isArray(result)
    ) {
      return result;
    }

    if (
      Array.isArray(
        result?.data
      )
    ) {
      return result.data;
    }

    if (
      Array.isArray(
        result?.jwb_kasus
      )
    ) {
      return result.jwb_kasus;
    }

    if (
      Array.isArray(
        result?.jawaban
      )
    ) {
      return result.jawaban;
    }

    return [];
  };

/* =====================================================
   SESSION STORAGE TABLE
===================================================== */

const getMetadataKey =
  (perikatanId) => {
    if (!perikatanId) {
      return null;
    }

    return (
      "perikatan_table_" +
      String(perikatanId)
    );
  };

const loadTableMetadata =
  (perikatanId) => {
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
  };

const saveTableMetadata =
  (
    perikatanId,
    rows
  ) => {
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
          Array.isArray(rows)
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
  };

/* =====================================================
   COMPONENT
===================================================== */

export default function PerikatanPage({
  perikatanId:
    propPerikatanId,

  jwbKasusId:
    propJwbKasusId,

  kasusId:
    propKasusId,
}) {
  const params =
    useParams();

  const searchParams =
    useSearchParams();

  /* =====================================================
     ROUTE ID
  ===================================================== */

  const routeId =
    useMemo(() => {
      if (!params?.id) {
        return "";
      }

      return String(
        params.id
      );
    }, [params]);

  /* =====================================================
     QUERY PARAM
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
    }, [searchParams]);

  const queryJwbKasusId =
    useMemo(() => {
      return (
        searchParams.get(
          "jwbKasusId"
        ) ||
        searchParams.get(
          "JwbKasusID"
        ) ||
        searchParams.get(
          "jwb_kasus_id"
        ) ||
        ""
      );
    }, [searchParams]);

  const queryKasusId =
    useMemo(() => {
      return (
        searchParams.get(
          "kasusId"
        ) ||
        searchParams.get(
          "KasusID"
        ) ||
        searchParams.get(
          "kasus_id"
        ) ||
        ""
      );
    }, [searchParams]);

  /* =====================================================
     IDS
  ===================================================== */

  const [
    perikatanId,
    setPerikatanId,
  ] = useState("");

  const [
    jwbKasusId,
    setJwbKasusId,
  ] = useState("");

  const [
    kasusId,
    setKasusId,
  ] = useState("");

  /* =====================================================
     DATA
  ===================================================== */

  const [
    perikatan,
    setPerikatan,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =====================================================
     TABLE
  ===================================================== */

  const [
    uploadedDocuments,
    setUploadedDocuments,
  ] = useState([]);

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
     DELETE CONFIRMATION
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
     INPUT REF
  ===================================================== */

  const inputRefs =
    useRef({});

  /* =====================================================
     MODAL TIMER REF
  ===================================================== */

  const modalTimerRef =
    useRef(null);

  /* =====================================================
     ALERT FUNCTIONS
  ===================================================== */

  const clearAlertTimer =
    useCallback(() => {
      if (
        alertTimerRef.current
      ) {
        clearTimeout(
          alertTimerRef.current
        );

        alertTimerRef.current =
          null;
      }
    }, []);

  const clearModalTimer =
    useCallback(() => {
      if (
        modalTimerRef.current
      ) {
        clearTimeout(
          modalTimerRef.current
        );

        modalTimerRef.current =
          null;
      }
    }, []);

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
          setTimeout(() => {
            setErrorAlert(
              null
            );
          }, 4500);
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
          setTimeout(() => {
            setSuccessAlert(
              null
            );
          }, 3500);
      },
      [
        clearAlertTimer,
      ]
    );

  useEffect(() => {
    return () => {
      clearAlertTimer();
      clearModalTimer();
    };
  }, [
    clearAlertTimer,
    clearModalTimer,
  ]);

  /* =====================================================
     SAVE IDS
  ===================================================== */

  const savePerikatanId =
    useCallback(
      (id) => {
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
      (id) => {
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
      (id) => {
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
     LOAD TABLE METADATA
  ===================================================== */

  useEffect(() => {
    if (
      !perikatanId
    ) {
      return;
    }

    const rows =
      loadTableMetadata(
        perikatanId
      );

    setUploadedDocuments(
      rows
    );
  }, [
    perikatanId,
  ]);

  /* =====================================================
     GET PERIKATAN
  ===================================================== */

  const getPerikatanById =
    useCallback(
      async (
        targetPerikatanId,
        expectedJwbKasusId =
          null
      ) => {
        if (
          !targetPerikatanId
        ) {
          return null;
        }

        try {
          const response =
            await fetchWithAuth(
              `${API_URL}/api/perikatan/${targetPerikatanId}`,
              {
                method:
                  "GET",

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
            return null;
          }

          if (
            expectedJwbKasusId &&
            String(
              result?.JwbKasusID
            ) !==
              String(
                expectedJwbKasusId
              )
          ) {
            return null;
          }

          const storedRows =
            loadTableMetadata(
              targetPerikatanId
            );

          setUploadedDocuments(
            storedRows
          );

          return result;
        } catch (error) {
          console.error(
            "ERROR GET PERIKATAN:",
            error
          );

          return null;
        }
      },
      []
    );

  /* =====================================================
     RESOLVE PERIKATAN
  ===================================================== */

  const resolvePerikatan =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

          setPerikatan(
            null
          );

          const directPerikatanId =
            propPerikatanId ||
            queryPerikatanId ||
            "";

          if (
            directPerikatanId
          ) {
            const result =
              await getPerikatanById(
                directPerikatanId
              );

            if (result) {
              setPerikatan(
                result
              );

              savePerikatanId(
                result.PerikatanID
              );

              if (
                result.JwbKasusID
              ) {
                saveJwbKasusId(
                  result.JwbKasusID
                );
              }

              return;
            }
          }

          const jwbResponse =
            await fetchWithAuth(
              `${API_URL}/api/jwb-kasus`,
              {
                method:
                  "GET",

                cache:
                  "no-store",
              }
            );

          const jwbResult =
            await parseResponse(
              jwbResponse
            );

          if (
            !jwbResponse.ok
          ) {
            const firstError =
              jwbResult?.errors
                ? Object.values(
                    jwbResult.errors
                  )?.[0]?.[0]
                : null;

            throw new Error(
              firstError ||
                jwbResult?.message ||
                jwbResult?.error ||
                "Gagal mengambil data JwbKasus."
            );
          }

          const jwbList =
            extractArray(
              jwbResult
            );

          if (
            jwbList.length ===
            0
          ) {
            setJwbKasusId(
              ""
            );

            setPerikatanId(
              ""
            );

            setUploadedDocuments(
              []
            );

            return;
          }

          let currentJwb =
            null;

          if (
            propJwbKasusId
          ) {
            currentJwb =
              jwbList.find(
                (item) =>
                  String(
                    item
                      ?.JwbKasusID
                  ) ===
                  String(
                    propJwbKasusId
                  )
              );
          }

          if (
            !currentJwb &&
            queryJwbKasusId
          ) {
            currentJwb =
              jwbList.find(
                (item) =>
                  String(
                    item
                      ?.JwbKasusID
                  ) ===
                  String(
                    queryJwbKasusId
                  )
              );
          }

          if (
            !currentJwb &&
            propKasusId
          ) {
            currentJwb =
              jwbList.find(
                (item) =>
                  String(
                    item?.KasusID
                  ) ===
                  String(
                    propKasusId
                  )
              );
          }

          if (
            !currentJwb &&
            queryKasusId
          ) {
            currentJwb =
              jwbList.find(
                (item) =>
                  String(
                    item?.KasusID
                  ) ===
                  String(
                    queryKasusId
                  )
              );
          }

          if (
            !currentJwb &&
            routeId
          ) {
            currentJwb =
              jwbList.find(
                (item) =>
                  String(
                    item
                      ?.JwbKasusID
                  ) ===
                  String(
                    routeId
                  )
              );
          }

          if (
            !currentJwb &&
            routeId
          ) {
            currentJwb =
              jwbList.find(
                (item) =>
                  String(
                    item?.KasusID
                  ) ===
                  String(
                    routeId
                  )
              );
          }

          if (
            !currentJwb &&
            typeof window !==
              "undefined"
          ) {
            const storedJwb =
              sessionStorage.getItem(
                "activeJwbKasusId"
              );

            if (
              storedJwb
            ) {
              currentJwb =
                jwbList.find(
                  (item) =>
                    String(
                      item
                        ?.JwbKasusID
                    ) ===
                    String(
                      storedJwb
                    )
                );
            }
          }

          if (
            !currentJwb &&
            jwbList.length ===
              1
          ) {
            currentJwb =
              jwbList[0];
          }

          if (
            !currentJwb
          ) {
            setJwbKasusId(
              ""
            );

            setPerikatanId(
              ""
            );

            setUploadedDocuments(
              []
            );

            return;
          }

          const resolvedJwbKasusId =
            String(
              currentJwb
                .JwbKasusID
            );

          saveJwbKasusId(
            resolvedJwbKasusId
          );

          if (
            currentJwb.KasusID
          ) {
            saveKasusId(
              currentJwb.KasusID
            );
          }

          const nestedPerikatanId =
            currentJwb
              ?.perikatan
              ?.PerikatanID ||
            currentJwb
              ?.Perikatan
              ?.PerikatanID ||
            currentJwb
              ?.PerikatanID ||
            currentJwb
              ?.perikatan_id ||
            "";

          if (
            nestedPerikatanId
          ) {
            const result =
              await getPerikatanById(
                nestedPerikatanId,
                resolvedJwbKasusId
              );

            if (result) {
              setPerikatan(
                result
              );

              savePerikatanId(
                result.PerikatanID
              );

              return;
            }
          }

          if (
            typeof window !==
            "undefined"
          ) {
            const storedPerikatanId =
              sessionStorage.getItem(
                "activePerikatanId"
              );

            if (
              storedPerikatanId
            ) {
              const result =
                await getPerikatanById(
                  storedPerikatanId,
                  resolvedJwbKasusId
                );

              if (result) {
                setPerikatan(
                  result
                );

                savePerikatanId(
                  result.PerikatanID
                );

                return;
              }

              sessionStorage.removeItem(
                "activePerikatanId"
              );
            }
          }

          const fallbackResult =
            await getPerikatanById(
              resolvedJwbKasusId,
              resolvedJwbKasusId
            );

          if (
            fallbackResult
          ) {
            setPerikatan(
              fallbackResult
            );

            savePerikatanId(
              fallbackResult
                .PerikatanID
            );

            return;
          }

          setPerikatan(
            null
          );

          setPerikatanId(
            ""
          );

          setUploadedDocuments(
            []
          );

          showErrorAlert(
            "Perikatan belum ditemukan",
            `JwbKasusID ${resolvedJwbKasusId} sudah ditemukan, tetapi PerikatanID yang sesuai belum dapat ditemukan.`
          );
        } catch (error) {
          console.error(
            "ERROR RESOLVE PERIKATAN:",
            error
          );

          setPerikatan(
            null
          );

          setPerikatanId(
            ""
          );

          setUploadedDocuments(
            []
          );

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
        propJwbKasusId,
        propKasusId,
        queryPerikatanId,
        queryJwbKasusId,
        queryKasusId,
        routeId,
        getPerikatanById,
        savePerikatanId,
        saveJwbKasusId,
        saveKasusId,
        showErrorAlert,
      ]
    );

  useEffect(() => {
    resolvePerikatan();
  }, [
    resolvePerikatan,
  ]);

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

        const result =
          await getPerikatanById(
            perikatanId,
            jwbKasusId ||
              null
          );

        if (!result) {
          return null;
        }

        setPerikatan(
          result
        );

        if (
          result.PerikatanID
        ) {
          savePerikatanId(
            result.PerikatanID
          );
        }

        if (
          result.JwbKasusID
        ) {
          saveJwbKasusId(
            result.JwbKasusID
          );
        }

        return result;
      },
      [
        perikatanId,
        jwbKasusId,
        getPerikatanById,
        savePerikatanId,
        saveJwbKasusId,
      ]
    );

  /* =====================================================
     DATE TIME
  ===================================================== */

  const getCurrentDateTime =
    () => {
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
        ).format(now);

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
          .format(now)
          .replace(
            ".",
            ":"
          );

      return (
        `${date} ` +
        `${time} WIB`
      );
    };

  /* =====================================================
     UPDATE TABLE AFTER UPLOAD
  ===================================================== */

  const updateUploadedTable =
    (
      selectedDocuments
    ) => {
      const uploadTime =
        getCurrentDateTime();

      const newRows =
        selectedDocuments.map(
          (document) => {
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
        (previous) => {
          const merged = [
            ...previous,
          ];

          newRows.forEach(
            (newRow) => {
              const index =
                merged.findIndex(
                  (row) =>
                    row.field ===
                    newRow.field
                );

              if (
                index >= 0
              ) {
                merged[index] =
                  newRow;
              } else {
                merged.push(
                  newRow
                );
              }
            }
          );

          const sorted =
            merged.sort(
              (a, b) => {
                const indexA =
                  DOCUMENT_CONFIG.findIndex(
                    (item) =>
                      item.key ===
                      a.field
                  );

                const indexB =
                  DOCUMENT_CONFIG.findIndex(
                    (item) =>
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
            sorted
          );

          return sorted;
        }
      );
    };

  /* =====================================================
     OPEN UPLOAD MODAL
  ===================================================== */

  const openUploadModal =
    () => {
      if (
        !perikatanId
      ) {
        showErrorAlert(
          "Data Perikatan belum tersedia",
          jwbKasusId
            ? `JwbKasusID ${jwbKasusId} sudah ditemukan, tetapi PerikatanID belum tersedia.`
            : "Data JwbKasus belum ditemukan."
        );

        return;
      }

      clearModalTimer();

      setFiles({
        ...INITIAL_FILES,
      });

      /*
       * STEP 1
       * Mount modal terlebih dahulu.
       */
      setUploadModalOpen(
        true
      );

      /*
       * STEP 2
       * Tunggu browser render modal,
       * kemudian aktifkan animasi.
       */
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
    };

  /* =====================================================
     CLOSE UPLOAD MODAL
  ===================================================== */

  const closeUploadModal =
    () => {
      if (
        uploading
      ) {
        return;
      }

      clearModalTimer();

      /*
       * Jalankan animasi keluar dulu.
       */
      setUploadModalVisible(
        false
      );

      /*
       * Setelah animasi selesai,
       * baru modal di-unmount.
       */
      modalTimerRef.current =
        setTimeout(() => {
          setUploadModalOpen(
            false
          );

          setFiles({
            ...INITIAL_FILES,
          });

          Object.values(
            inputRefs.current
          ).forEach(
            (input) => {
              if (input) {
                input.value =
                  "";
              }
            }
          );
        }, 280);
    };

  /* =====================================================
     CLOSE UPLOAD AFTER SUCCESS

     Berbeda dengan close biasa karena pada saat upload
     sukses state uploading masih true.
  ===================================================== */

  const closeUploadAfterSuccess =
    () => {
      clearModalTimer();

      setUploadModalVisible(
        false
      );

      modalTimerRef.current =
        setTimeout(() => {
          setUploadModalOpen(
            false
          );

          setFiles({
            ...INITIAL_FILES,
          });

          Object.values(
            inputRefs.current
          ).forEach(
            (input) => {
              if (input) {
                input.value =
                  "";
              }
            }
          );
        }, 280);
    };

  /* =====================================================
     ESC KEY
  ===================================================== */

  useEffect(() => {
    if (
      !uploadModalOpen
    ) {
      return;
    }

    const handleEscape =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          closeUploadModal();
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
    uploadModalOpen,
    uploading,
  ]);

  /* =====================================================
     BODY SCROLL LOCK
  ===================================================== */

  useEffect(() => {
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
  }, [
    uploadModalOpen,
  ]);

  /* =====================================================
     FILE VALIDATION
  ===================================================== */

  const validateFile =
    (file) => {
      if (!file) {
        return false;
      }

      const extension =
        file.name
          .split(".")
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
    };

  /* =====================================================
     FILE CHANGE
  ===================================================== */

  const handleFileChange =
    (
      field,
      file
    ) => {
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
        (previous) => ({
          ...previous,

          [field]:
            file,
        })
      );
    };

  /* =====================================================
     REMOVE SELECTED FILE
  ===================================================== */

  const removeSelectedFile =
    (field) => {
      if (
        uploading
      ) {
        return;
      }

      setFiles(
        (previous) => ({
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
    };

  /* =====================================================
     SELECTED FILES
  ===================================================== */

  const getSelectedFiles =
    () => {
      return DOCUMENT_CONFIG.filter(
        (document) =>
          files[
            document.key
          ] instanceof
          File
      );
    };

  /* =====================================================
     RESET UPLOAD FORM
  ===================================================== */

  const resetUploadForm =
    () => {
      setFiles({
        ...INITIAL_FILES,
      });

      Object.values(
        inputRefs.current
      ).forEach(
        (input) => {
          if (input) {
            input.value =
              "";
          }
        }
      );
    };

  /* =====================================================
     UPLOAD
  ===================================================== */

  const handleUpload =
    async () => {
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
                "string" &&
              result.raw.trim()
            ) {
              errorMessage =
                result.raw;
            }

            throw new Error(
              `${document.label}: ${errorMessage}`
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

        try {
          await fetchPerikatan();
        } catch {
          //
        }

        resetUploadForm();

        /*
         * Tutup menggunakan animasi.
         */
        closeUploadAfterSuccess();

        showSuccessAlert(
          "Upload Berhasil",
          `${successfulUploads.length} file berhasil disimpan.`
        );
      } catch (error) {
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
    };

  /* =====================================================
     OPEN DELETE CONFIRMATION
  ===================================================== */

  const openDeleteConfirmation =
    (document) => {
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
    };

  /* =====================================================
     CLOSE DELETE CONFIRMATION
  ===================================================== */

  const closeDeleteConfirmation =
    () => {
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
    };

  /* =====================================================
     CONFIRM DELETE
  ===================================================== */

  const handleConfirmDelete =
    async () => {
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

        setUploadedDocuments(
          (previous) => {
            const next =
              previous.filter(
                (row) =>
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
      } catch (error) {
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
    };

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading
  ) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={30}
            className="animate-spin text-[#2bb5ed]"
          />

          <span className="text-sm text-slate-500">
            Memuat perikatan...
          </span>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
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
            ? deletingDocument.fileName ||
              deletingDocument.jenis ||
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

      <div className="min-h-full w-full bg-white">
        {/* =============================================
            HEADER
        ============================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            px-6
            pb-5
            pt-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            lg:px-7
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-[48px]
                w-[48px]
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#eaf8fe]
                text-[#2bb5ed]
              "
            >
              <FileText
                size={24}
                strokeWidth={
                  1.9
                }
              />
            </div>

            <div>
              <h2 className="font-poppins text-lg font-semibold text-[#1F2937]">
                Detail Perikatan
              </h2>

              <p className="font-poppins text-sm text-[#7B8794]">
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
        ============================================== */}

        {!perikatanId && (
          <div className="px-6 pb-5 lg:px-7">
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
              <p className="text-[14px] font-semibold text-amber-700">
                Data Perikatan belum tersedia
              </p>

              <p className="mt-1 text-[12px] leading-5 text-amber-600">
                {jwbKasusId
                  ? `JwbKasusID ${jwbKasusId} sudah ditemukan, tetapi PerikatanID belum berhasil ditemukan.`
                  : "Data JwbKasus untuk kasus yang sedang dipilih belum ditemukan."}
              </p>
            </div>
          </div>
        )}

        {/* =============================================
            TABLE
        ============================================== */}

        <div className="px-6 pb-6 lg:px-7">
          <div
            className="
              overflow-hidden
              rounded-xl
              border
              border-[#dce5ef]
              bg-white
              p-5
            "
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-[#f6f8fb]">
                    <th className="w-[70px] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.04em] text-[#64758d]">
                      NO
                    </th>

                    <th className="w-[210px] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.04em] text-[#64758d]">
                      JENIS
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.04em] text-[#64758d]">
                      FILE
                    </th>

                    <th className="w-[215px] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.04em] text-[#64758d]">
                      WAKTU UNGGAH
                    </th>

                    <th className="w-[85px] px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-[#64758d]">
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
                        className="border-t border-[#e6ebf2] px-5 py-16 text-center"
                      >
                        <div className="flex flex-col items-center justify-center">
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
                              size={
                                25
                              }
                            />
                          </div>

                          <div className="mt-4 text-[15px] font-semibold text-[#40516b]">
                            Belum ada dokumen perikatan
                          </div>

                          <div className="mt-1 text-[13px] text-[#96a6bd]">
                            Klik Upload Data untuk menambahkan dokumen.
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
                          className="border-t border-[#e6ebf2] transition hover:bg-slate-50/50"
                        >
                          <td className="px-5 py-5 text-[13px] text-[#40516b]">
                            {index +
                              1}
                          </td>

                          <td className="px-5 py-5 text-[13px] font-medium text-[#40516b]">
                            {
                              document.jenis
                            }
                          </td>

                          <td className="px-5 py-5">
                            <span className="break-all text-[13px] font-medium text-[#2bb5ed]">
                              {
                                document.fileName
                              }
                            </span>
                          </td>

                          <td className="px-5 py-5 text-[13px] text-[#40516b]">
                            {
                              document.uploadTime
                            }
                          </td>

                          <td className="px-5 py-5 text-center">
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
          {/* =========================================
              MODAL CONTAINER
          ========================================== */}

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
              <div className="flex items-center gap-4">
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
                  <h3 className="text-[18px] font-bold leading-tight">
                    Upload Data Perikatan
                  </h3>

                  <p className="mt-1 text-[13px] text-white/90">
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

            <div className="px-8 py-7">
              <div className="space-y-6">
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
                        <label className="mb-2.5 block text-[14px] font-bold text-[#18243a]">
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

                          <div className="flex min-w-0 flex-1 items-center px-4">
                            {selectedFile ? (
                              <span className="truncate text-[13px] text-[#16aef0]">
                                {
                                  selectedFile.name
                                }
                              </span>
                            ) : (
                              <span className="truncate text-[13px] text-[#7b8aa2]">
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
                      className="animate-spin"
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