"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Eye,
  Pencil,
  Search,
  X,
} from "lucide-react";

import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/* =====================================================
   AUTH
===================================================== */

const getAuthToken = () => {
  if (typeof window === "undefined") {
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

/* =====================================================
   INITIAL FORM
===================================================== */

const INITIAL_FORM = {
  // KAP
  kapName: "",
  kapAddress: "",
  kapEmail: "",
  kapPhone: "",
  kapWebsite: "",
  kapLogo: "",

  // CLIENT
  companyName: "",
  companyAddress: "",
  companyEmail: "",
  companyPhone: "",
  companyWebsite: "",
  npwp: "",
  companyType: "",
  companyLogo: "",
};

const COMPANY_TYPES = [
  "PT",
  "CV",
  "Firma",
  "Perorangan",
];

/* =====================================================
   INITIALS
===================================================== */

const getInitials = (name) => {
  if (!name) {
    return "?";
  }

  const cleaned = String(name)
    .trim()
    .replace(/^(PT|CV|KAP)\s+/i, "");

  const words = cleaned
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

/* =====================================================
   CIRCLE LOGO
===================================================== */

function CircleLogo({
  logo,
  name,
  size = "small",
}) {
  const [imageUrl, setImageUrl] =
    useState("");

  const [imageError, setImageError] =
    useState(false);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    const loadLogo = async () => {
      setImageUrl("");
      setImageError(false);

      if (!logo) {
        return;
      }

      /*
       * LOGO BARU DARI INPUT FILE
       */

      if (
        typeof File !== "undefined" &&
        logo instanceof File
      ) {
        objectUrl =
          URL.createObjectURL(
            logo
          );

        if (!cancelled) {
          setImageUrl(
            objectUrl
          );
        }

        return;
      }

      /*
       * LOGO DARI DATABASE
       *
       * Logo disimpan sebagai BLOB.
       *
       * URL yang diterima adalah
       * endpoint API logo.
       *
       * Endpoint membutuhkan
       * Bearer Token.
       */

      try {
        const response =
          await fetchWithAuth(
            String(logo),
            {
              method: "GET",
              cache: "no-store",
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "Gagal mengambil logo."
          );
        }

        const blob =
          await response.blob();

        if (
          !blob ||
          blob.size === 0
        ) {
          throw new Error(
            "Logo kosong."
          );
        }

        objectUrl =
          URL.createObjectURL(
            blob
          );

        if (!cancelled) {
          setImageUrl(
            objectUrl
          );
        }
      } catch (error) {
        console.error(
          "ERROR LOAD LOGO:",
          error
        );

        if (!cancelled) {
          setImageError(
            true
          );
        }
      }
    };

    loadLogo();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(
          objectUrl
        );
      }
    };
  }, [logo]);

  const sizeClasses =
    size === "large"
      ? "h-[140px] w-[140px] text-[34px]"
      : "h-10 w-10 text-[11px]";

  if (
    imageUrl &&
    !imageError
  ) {
    return (
      <img
        src={imageUrl}
        alt={name || "Logo"}
        onError={() => {
          setImageError(
            true
          );
        }}
        className={`${sizeClasses} shrink-0 rounded-full border border-slate-200 bg-white object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-full bg-[#1f2937] font-bold text-white shadow-sm`}
    >
      {getInitials(name)}
    </div>
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function DataKlienPage() {
  /* =====================================================
     DATA
  ===================================================== */

  const [kelasList, setKelasList] =
    useState([]);

  const [kasusList, setKasusList] =
    useState([]);

  const [clientData, setClientData] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  /* =====================================================
     SEARCH
  ===================================================== */

  const [searchQuery, setSearchQuery] =
    useState("");

  /* =====================================================
     EDIT MODAL
  ===================================================== */

  const [
    editModalOpen,
    setEditModalOpen,
  ] = useState(false);

  const [
    editModalVisible,
    setEditModalVisible,
  ] = useState(false);

  const [
    selectedClient,
    setSelectedClient,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState({
    ...INITIAL_FORM,
  });

  const [
    formDirty,
    setFormDirty,
  ] = useState(false);

  const [
    savingClient,
    setSavingClient,
  ] = useState(false);

  /* =====================================================
     DETAIL MODAL
  ===================================================== */

  const [
    detailModalOpen,
    setDetailModalOpen,
  ] = useState(false);

  const [
    detailModalVisible,
    setDetailModalVisible,
  ] = useState(false);

  const [
    detailClient,
    setDetailClient,
  ] = useState(null);

  /* =====================================================
     CONFIRMATION
  ===================================================== */

  const [
    closeConfirmOpen,
    setCloseConfirmOpen,
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

  /* =====================================================
     FILE INPUT
  ===================================================== */

  const kapLogoInputRef =
    useRef(null);

  const companyLogoInputRef =
    useRef(null);

  /* =====================================================
     ALERT HELPER
  ===================================================== */

  const showErrorAlert = (
    title,
    message
  ) => {
    setErrorAlert({
      title,
      message,
    });

    window.setTimeout(() => {
      setErrorAlert(null);
    }, 3400);
  };

  const showSuccessAlert = (
    title,
    message
  ) => {
    setSuccessAlert({
      title,
      message,
    });

    window.setTimeout(() => {
      setSuccessAlert(null);
    }, 3400);
  };

  /* =====================================================
     PARSE RESPONSE
  ===================================================== */

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

  /* =====================================================
     EXTRACT ARRAY
  ===================================================== */

  const extractArray = (
    result
  ) => {
    if (Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    if (
      Array.isArray(
        result?.kelas
      )
    ) {
      return result.kelas;
    }

    if (
      Array.isArray(
        result?.kasus
      )
    ) {
      return result.kasus;
    }

    if (
      Array.isArray(
        result?.clients
      )
    ) {
      return result.clients;
    }

    if (
      Array.isArray(
        result?.data?.kelas
      )
    ) {
      return result.data.kelas;
    }

    if (
      Array.isArray(
        result?.data?.kasus
      )
    ) {
      return result.data.kasus;
    }

    if (
      Array.isArray(
        result?.data?.clients
      )
    ) {
      return result.data.clients;
    }

    return [];
  };

  /* =====================================================
     NORMALIZE TIPE KELAS
  ===================================================== */

  const normalizeTipeKelas = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const normalized =
      String(value)
        .trim()
        .toLowerCase();

    if (normalized === "uts") {
      return "UTS";
    }

    if (normalized === "uas") {
      return "UAS";
    }

    if (
      normalized === "tugas"
    ) {
      return "Tugas";
    }

    if (
      normalized === "sandbox"
    ) {
      return "Sandbox";
    }

    return String(value);
  };

  /* =====================================================
     GETTERS
  ===================================================== */

  const getKodeKelas = (
    item
  ) => {
    return String(
      item?.kode_kelas ??
        item?.KodeKelas ??
        item?.kodeKelas ??
        item?.NamaKelas ??
        item?.nama_kelas ??
        item?.kelas?.kode_kelas ??
        ""
    ).trim();
  };

  const getTipeKelas = (
    item
  ) => {
    return normalizeTipeKelas(
      item?.tipe_kelas ??
        item?.TipeKelas ??
        item?.tipeKelas ??
        item?.kelas?.tipe_kelas ??
        ""
    );
  };

  const getKasusId = (
    item
  ) => {
    return (
      item?.KasusID ??
      item?.kasus_id ??
      item?.kasusId ??
      item?.kasus?.KasusID ??
      null
    );
  };

  const getClientId = (
    item
  ) => {
    return (
      item?.ClientID ??
      item?.client_id ??
      item?.clientId ??
      item?.client?.ClientID ??
      null
    );
  };

  const getKelasId = (
    item
  ) => {
    return (
      item?.id ??
      item?.KelasID ??
      item?.kelas_id ??
      null
    );
  };

  /* =====================================================
     LOGO URL
     DATABASE BLOB
===================================================== */

  const getLogoUrl = (
    logo,
    clientId,
    type
  ) => {
    /*
     * FILE BARU DARI INPUT
     */

    if (
      typeof File !== "undefined" &&
      logo instanceof File
    ) {
      return logo;
    }

    /*
     * LOGO DARI DATABASE
     *
     * Logo tidak menggunakan
     * path file.
     *
     * Logo diambil dari endpoint
     * yang mengembalikan BLOB.
     */

    if (
      !clientId ||
      !type
    ) {
      return "";
    }

    if (
      type === "kantor"
    ) {
      return `${API_URL}/api/data-client/${clientId}/logo-kantor`;
    }

    if (
      type === "perusahaan"
    ) {
      return `${API_URL}/api/data-client/${clientId}/logo-perusahaan`;
    }

    return "";
  };

  /* =====================================================
     NORMALIZE CLIENT
  ===================================================== */

  const normalizeClientData = (
    data
  ) => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item) => {
        const clientId =
          item?.ClientID ??
          item?.client_id ??
          item?.id ??
          null;

        return {
          clientId:

            clientId,

          /* =====================
             KAP
          ===================== */

          kapName:
            item?.NamaKantor ??
            item?.nama_kantor ??
            "",

          kapAddress:
            item?.AlamatKantor ??
            item?.alamat_kantor ??
            "",

          kapEmail:
            item?.EmailKantor ??
            item?.email_kantor ??
            "",

          kapPhone:
            item?.HPKantor ??
            item?.hp_kantor ??
            "",

          kapWebsite:
            item?.URLKantor ??
            item?.url_kantor ??
            "",

          kapLogo:
            getLogoUrl(
              item?.LogoKantor ??
                item?.logo_kantor ??
                "",
              clientId,
              "kantor"
            ),

          /* =====================
             CLIENT
          ===================== */

          companyName:
            item?.NamaClient ??
            item?.nama_client ??
            "",

          companyAddress:
            item?.AlamatClient ??
            item?.alamat_client ??
            "",

          companyEmail:
            item?.EmailClient ??
            item?.email_client ??
            "",

          companyPhone:
            item?.HPClient ??
            item?.hp_client ??
            "",

          companyWebsite:
            item?.URLClient ??
            item?.url_client ??
            "",

          npwp:
            item?.NPWP ??
            item?.npwp ??
            "",

          companyType:
            item?.JenisClient ??
            item?.jenis_client ??
            "",

          companyLogo:
            getLogoUrl(
              item?.LogoPerusahaan ??
                item?.logo_perusahaan ??
                "",
              clientId,
              "perusahaan"
            ),
        };
      })
      .filter(
        (item) =>
          item.clientId !== null &&
          item.clientId !== undefined
      );
  };

  /* =====================================================
     FETCH ALL DATA
  ===================================================== */

  const fetchAllData =
    async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          kelasResponse,
          kasusResponse,
          clientResponse,
        ] = await Promise.all([
          fetchWithAuth(
            `${API_URL}/api/kelas`,
            {
              method: "GET",
              cache: "no-store",
            }
          ),

          fetchWithAuth(
            `${API_URL}/api/kasus`,
            {
              method: "GET",
              cache: "no-store",
            }
          ),

          fetchWithAuth(
            `${API_URL}/api/data-client`,
            {
              method: "GET",
              cache: "no-store",
            }
          ),
        ]);

        const [
          kelasResult,
          kasusResult,
          clientResult,
        ] = await Promise.all([
          parseResponse(
            kelasResponse
          ),

          parseResponse(
            kasusResponse
          ),

          parseResponse(
            clientResponse
          ),
        ]);

        if (
          !kelasResponse.ok
        ) {
          throw new Error(
            kelasResult?.message ||
              "Gagal mengambil data kelas."
          );
        }

        if (
          !kasusResponse.ok
        ) {
          throw new Error(
            kasusResult?.message ||
              "Gagal mengambil data kasus."
          );
        }

        if (
          !clientResponse.ok
        ) {
          throw new Error(
            clientResult?.message ||
              "Gagal mengambil data client."
          );
        }

        const kelasRaw =
          extractArray(
            kelasResult
          );

        const kasusRaw =
          extractArray(
            kasusResult
          );

        const clientRaw =
          extractArray(
            clientResult
          );

        const normalizedClients =
          normalizeClientData(
            clientRaw
          );

        setKelasList(
          kelasRaw
        );

        setKasusList(
          kasusRaw
        );

        setClientData(
          normalizedClients
        );
      } catch (err) {
        console.error(
          "ERROR FETCH:",
          err
        );

        setError(
          err?.message ||
            "Gagal memuat data."
        );

        setKelasList([]);
        setKasusList([]);
        setClientData([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchAllData();
  }, []);

  /* =====================================================
     ASSIGNMENT

     FLOW BARU:

     /api/kasus
     = SUMBER UTAMA ROW

     /api/data-client
     = DETAIL KLIEN

     /api/kelas
     = TIPE KELAS SAJA

     HASIL:

     Kelas dibuat
     -> belum muncul

     Kasus dibuat
     -> row muncul

     Kasus dihapus
     -> row hilang
  ===================================================== */

  const assignmentList =
    useMemo(() => {
      return kasusList
        .map(
          (
            kasus,
            index
          ) => {
            const kasusId =
              getKasusId(
                kasus
              );

            const clientId =
              getClientId(
                kasus
              );

            /*
             * Cari kelas berdasarkan
             * KasusID yang sama.
             *
             * Kelas hanya dipakai
             * untuk mengambil tipe kelas.
             */
            const matchedKelas =
              kelasList.find(
                (kelas) => {
                  const kelasKasusId =
                    getKasusId(
                      kelas
                    );

                  if (
                    kasusId === null ||
                    kasusId ===
                      undefined ||
                    kelasKasusId ===
                      null ||
                    kelasKasusId ===
                      undefined
                  ) {
                    return false;
                  }

                  return (
                    String(
                      kelasKasusId
                    ) ===
                    String(
                      kasusId
                    )
                  );
                }
              );

            const tipeKelas =
              (matchedKelas
                ? getTipeKelas(
                    matchedKelas
                  )
                : "") ||
              getTipeKelas(
                kasus
              ) ||
              "";

            return {
              key:
                `kasus-${
                  kasusId ??
                  index
                }`,

              kasusId,

              clientId,

              kelasId:
                matchedKelas
                  ? getKelasId(
                      matchedKelas
                    )
                  : null,

              kodeKelas:
                matchedKelas
                  ? getKodeKelas(
                      matchedKelas
                    )
                  : getKodeKelas(
                      kasus
                    ),

              tipeKelas,
            };
          }
        )

        /*
         * WAJIB ADA KASUS.
         *
         * Kalau Kasus sudah dihapus
         * maka item tidak akan masuk.
         */
        .filter(
          (item) =>
            item.kasusId !==
              null &&
            item.kasusId !==
              undefined
        );
    }, [
      kasusList,
      kelasList,
    ]);

  /* =====================================================
     ASSIGNED CLIENT DATA
  ===================================================== */

  const assignedClientData =
    useMemo(() => {
      return assignmentList.map(
        (
          assignment,
          index
        ) => {
          /*
           * ClientID berasal
           * dari Kasus.
           *
           * Setelah itu dicocokkan
           * dengan /api/data-client.
           */
          const matchedClient =
            assignment.clientId !==
              null &&
            assignment.clientId !==
              undefined
              ? clientData.find(
                  (client) =>
                    String(
                      client.clientId
                    ) ===
                    String(
                      assignment.clientId
                    )
                )
              : null;

          /*
           * Nama perusahaan sudah
           * dibuat oleh Admin ketika
           * membuat Kasus.
           */
          const assignedCompanyName =
            matchedClient?.companyName ||
            "";

          /*
           * Kalau NamaKantor ada,
           * berarti mahasiswa sudah
           * mengisi Data Klien.
           */
          const isSubmitted =
            Boolean(
              matchedClient?.kapName
            );

          /* =====================
             SUDAH DIISI
          ===================== */

          if (
            matchedClient &&
            isSubmitted
          ) {
            return {
              ...matchedClient,

              assignmentKey:
                assignment.key,

              kasusId:
                assignment.kasusId,

              clientId:
                assignment.clientId,

              kelasId:
                assignment.kelasId,

              kodeKelas:
                assignment.kodeKelas,

              tipeKelas:
                assignment.tipeKelas,

              assignedCompanyName,

              isSubmitted:
                true,
            };
          }

          /* =====================
             BARU DIBUAT ADMIN
          ===================== */

          return {
            assignmentKey:
              assignment.key,

            kasusId:
              assignment.kasusId,

            clientId:
              assignment.clientId,

            kelasId:
              assignment.kelasId,

            kodeKelas:
              assignment.kodeKelas,

            tipeKelas:
              assignment.tipeKelas,

            /*
             * NamaClient tetap
             * disimpan internal agar
             * muncul otomatis saat
             * Pencil diklik.
             */
            assignedCompanyName,

            isSubmitted:
              false,

            // KAP
            kapName: "",
            kapAddress: "",
            kapEmail: "",
            kapPhone: "",
            kapWebsite: "",
            kapLogo: "",

            // CLIENT
            companyName: "",
            companyAddress: "",
            companyEmail: "",
            companyPhone: "",
            companyWebsite: "",
            npwp: "",
            companyType: "",
            companyLogo: "",

            rowIndex:
              index,
          };
        }
      );
    }, [
      assignmentList,
      clientData,
    ]);

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredClientData =
    useMemo(() => {
      const keyword =
        searchQuery
          .trim()
          .toLowerCase();

      if (!keyword) {
        return assignedClientData;
      }

      return assignedClientData.filter(
        (item) =>
          String(
            item.kodeKelas ||
              ""
          )
            .toLowerCase()
            .includes(keyword) ||

          String(
            item.tipeKelas ||
              ""
          )
            .toLowerCase()
            .includes(keyword) ||

          String(
            item.companyName ||
              ""
          )
            .toLowerCase()
            .includes(keyword) ||

          String(
            item.assignedCompanyName ||
              ""
          )
            .toLowerCase()
            .includes(keyword) ||

          String(
            item.kapName ||
              ""
          )
            .toLowerCase()
            .includes(keyword)
      );
    }, [
      assignedClientData,
      searchQuery,
    ]);

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleFormChange = (
    field,
    value
  ) => {
    setFormData(
      (prev) => ({
        ...prev,
        [field]: value,
      })
    );

    setFormDirty(true);
  };

  /* =====================================================
     LOGO CHANGE
  ===================================================== */

  const handleLogoChange = (
    field,
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      showErrorAlert(
        "Format Tidak Valid",
        "Logo harus berupa PNG, JPG, JPEG, atau WEBP."
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      showErrorAlert(
        "Ukuran File Terlalu Besar",
        "Ukuran logo maksimal 2MB."
      );

      event.target.value =
        "";

      return;
    }

    setFormData(
      (prev) => ({
        ...prev,
        [field]: file,
      })
    );

    setFormDirty(true);
  };

  /* =====================================================
     OPEN EDIT
  ===================================================== */

  const openEditModal = (
    client
  ) => {
    const matchedClient =
      client.clientId !== null &&
      client.clientId !== undefined
        ? clientData.find(
            (item) =>
              String(
                item.clientId
              ) ===
              String(
                client.clientId
              )
          )
        : null;

    /*
     * NamaClient yang dibuat Admin
     * menjadi Nama Perusahaan
     * pada popup mahasiswa.
     */
    const companyNameFromAdmin =
      matchedClient?.companyName ||
      client.assignedCompanyName ||
      client.companyName ||
      "";

    setSelectedClient({
      ...client,

      clientId:
        client.clientId ??
        matchedClient?.clientId ??
        null,
    });

    /* =====================
       SUDAH DIISI
    ===================== */

    if (
      client.isSubmitted
    ) {
      setFormData({
        kapName:
          matchedClient?.kapName ||
          client.kapName ||
          "",

        kapAddress:
          matchedClient?.kapAddress ||
          client.kapAddress ||
          "",

        kapEmail:
          matchedClient?.kapEmail ||
          client.kapEmail ||
          "",

        kapPhone:
          matchedClient?.kapPhone ||
          client.kapPhone ||
          "",

        kapWebsite:
          matchedClient?.kapWebsite ||
          client.kapWebsite ||
          "",

        kapLogo:
          matchedClient?.kapLogo ||
          client.kapLogo ||
          "",

        companyName:
          companyNameFromAdmin,

        companyAddress:
          matchedClient?.companyAddress ||
          client.companyAddress ||
          "",

        companyEmail:
          matchedClient?.companyEmail ||
          client.companyEmail ||
          "",

        companyPhone:
          matchedClient?.companyPhone ||
          client.companyPhone ||
          "",

        companyWebsite:
          matchedClient?.companyWebsite ||
          client.companyWebsite ||
          "",

        npwp:
          matchedClient?.npwp ||
          client.npwp ||
          "",

        companyType:
          matchedClient?.companyType ||
          client.companyType ||
          "",

        companyLogo:
          matchedClient?.companyLogo ||
          client.companyLogo ||
          "",
      });
    } else {
      /*
       * Kasus baru dibuat Admin.
       *
       * Semua field kosong,
       * kecuali Nama Perusahaan.
       */
      setFormData({
        ...INITIAL_FORM,

        companyName:
          companyNameFromAdmin,
      });
    }

    setFormDirty(false);

    setCloseConfirmOpen(
      false
    );

    setEditModalOpen(
      true
    );

    setEditModalVisible(
      false
    );

    requestAnimationFrame(
      () => {
        requestAnimationFrame(
          () => {
            setEditModalVisible(
              true
            );
          }
        );
      }
    );

    if (
      kapLogoInputRef.current
    ) {
      kapLogoInputRef.current.value =
        "";
    }

    if (
      companyLogoInputRef.current
    ) {
      companyLogoInputRef.current.value =
        "";
    }
  };

  /* =====================================================
     CLOSE EDIT
  ===================================================== */

  const reallyCloseEditModal =
    () => {
      if (savingClient) {
        return;
      }

      setCloseConfirmOpen(
        false
      );

      setEditModalVisible(
        false
      );

      window.setTimeout(
        () => {
          setEditModalOpen(
            false
          );

          setSelectedClient(
            null
          );

          setFormData({
            ...INITIAL_FORM,
          });

          setFormDirty(
            false
          );
        },
        300
      );
    };

  const requestCloseEditModal =
    () => {
      if (savingClient) {
        return;
      }

      if (formDirty) {
        setCloseConfirmOpen(
          true
        );

        return;
      }

      reallyCloseEditModal();
    };

  /* =====================================================
     SAVE CLIENT
  ===================================================== */

  const handleSaveClient =
    async () => {
      if (!selectedClient) {
        return;
      }

      if (
        !formData.companyName.trim()
      ) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Nama perusahaan wajib diisi."
        );

        return;
      }

      if (
        !formData.kapName.trim()
      ) {
        showErrorAlert(
          "Data Belum Lengkap",
          "Nama Kantor Akuntan Publik wajib diisi."
        );

        return;
      }

      /*
       * Normalnya DataClient sudah
       * dibuat bersama Kasus.
       *
       * Jadi biasanya ini UPDATE.
       */
      const isCreate =
        selectedClient.clientId ===
          null ||
        selectedClient.clientId ===
          undefined;

      try {
        setSavingClient(
          true
        );

        const form =
          new FormData();

        /* =====================
           UPDATE
        ===================== */

        if (!isCreate) {
          form.append(
            "_method",
            "PUT"
          );
        }

        /* =====================
           FALLBACK CREATE
        ===================== */

        if (
          isCreate &&
          selectedClient.kasusId
        ) {
          form.append(
            "KasusID",
            String(
              selectedClient.kasusId
            )
          );
        }

        /* =====================
           CLIENT
        ===================== */

        form.append(
          "NamaClient",
          formData.companyName.trim()
        );

        form.append(
          "JenisClient",
          formData.companyType.trim()
        );

        form.append(
          "NPWP",
          formData.npwp.trim()
        );

        form.append(
          "AlamatClient",
          formData.companyAddress.trim()
        );

        form.append(
          "HPClient",
          formData.companyPhone.trim()
        );

        form.append(
          "EmailClient",
          formData.companyEmail.trim()
        );

        form.append(
          "URLClient",
          formData.companyWebsite.trim()
        );

        /* =====================
           KAP
        ===================== */

        form.append(
          "NamaKantor",
          formData.kapName.trim()
        );

        form.append(
          "AlamatKantor",
          formData.kapAddress.trim()
        );

        form.append(
          "HPKantor",
          formData.kapPhone.trim()
        );

        form.append(
          "EmailKantor",
          formData.kapEmail.trim()
        );

        form.append(
          "URLKantor",
          formData.kapWebsite.trim()
        );

        /* =====================
           LOGO KAP
        ===================== */

        if (
          formData.kapLogo instanceof
          File
        ) {
          form.append(
            "LogoKantor",
            formData.kapLogo
          );
        }

        /* =====================
           LOGO PERUSAHAAN
        ===================== */

        if (
          formData.companyLogo instanceof
          File
        ) {
          form.append(
            "LogoPerusahaan",
            formData.companyLogo
          );
        }

        const endpoint =
          isCreate
            ? `${API_URL}/api/data-client`
            : `${API_URL}/api/data-client/${selectedClient.clientId}`;

        const response =
          await fetchWithAuth(
            endpoint,
            {
              method: "POST",
              body: form,
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (!response.ok) {
          const firstError =
            result?.errors
              ? Object.values(
                  result.errors
                )?.[0]?.[0]
              : null;

          throw new Error(
            firstError ||
              result?.message ||
              result?.error ||
              "Gagal menyimpan data."
          );
        }

        /*
         * Refresh kembali:
         *
         * Kasus
         * Kelas
         * DataClient
         */
        await fetchAllData();

        showSuccessAlert(
          "Berhasil Disimpan",
          result?.message ||
            "Data client berhasil disimpan."
        );

        setFormDirty(
          false
        );

        setEditModalVisible(
          false
        );

        window.setTimeout(
          () => {
            setEditModalOpen(
              false
            );

            setSelectedClient(
              null
            );

            setCloseConfirmOpen(
              false
            );

            setFormData({
              ...INITIAL_FORM,
            });
          },
          300
        );
      } catch (err) {
        console.error(
          "ERROR SAVE:",
          err
        );

        showErrorAlert(
          "Gagal Menyimpan",
          err?.message ||
            "Data client gagal disimpan."
        );
      } finally {
        setSavingClient(
          false
        );
      }
    };

  /* =====================================================
     DETAIL
  ===================================================== */

  const openDetailModal = (
    client
  ) => {
    setDetailClient(
      client
    );

    setDetailModalOpen(
      true
    );

    setDetailModalVisible(
      false
    );

    requestAnimationFrame(
      () => {
        requestAnimationFrame(
          () => {
            setDetailModalVisible(
              true
            );
          }
        );
      }
    );
  };

  const closeDetailModal =
    () => {
      setDetailModalVisible(
        false
      );

      window.setTimeout(
        () => {
          setDetailModalOpen(
            false
          );

          setDetailClient(
            null
          );
        },
        300
      );
    };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-gray-700">

      {/* =====================
          ALERT ERROR
      ===================== */}

      {errorAlert && (
        <AlertError
          title={
            errorAlert.title
          }
          message={
            errorAlert.message
          }
          onClose={() =>
            setErrorAlert(null)
          }
        />
      )}

      {/* =====================
          ALERT SUCCESS
      ===================== */}

      {successAlert && (
        <AlertSuccess
          title={
            successAlert.title
          }
          message={
            successAlert.message
          }
          onClose={() =>
            setSuccessAlert(null)
          }
        />
      )}

      {/* =====================
          CONFIRM CLOSE
      ===================== */}

      <ConfirmationPopup
        isOpen={
          closeConfirmOpen
        }
        message="Data belum disimpan."
        subText="Perubahan yang belum disimpan akan hilang. Apakah kamu yakin ingin keluar?"
        confirmText="Ya, Keluar"
        cancelText="Tetap Edit"
        onConfirm={
          reallyCloseEditModal
        }
        onCancel={() =>
          setCloseConfirmOpen(
            false
          )
        }
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="px-6 py-9 lg:px-10">

        {/* TITLE */}

        <div className="mb-8">
          <h1 className="text-[25px] font-semibold text-[#293244] lg:text-[27px]">
            DATA KLIEN
          </h1>
        </div>

        {/* SEARCH */}

        <div className="mb-4">
          <div className="flex h-[47px] w-full max-w-[360px] items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">

            <Search className="h-[18px] w-[18px] text-[#4b78e8]" />

            <input
              type="text"
              value={
                searchQuery
              }
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Cari data klien..."
              className="w-full bg-transparent text-[13px] outline-none"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}

          </div>
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <section className="w-full overflow-hidden rounded-lg bg-white shadow-[0_4px_18px_rgba(41,49,68,0.04)]">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] table-fixed border-collapse">

              <colgroup>
                <col className="w-[60px]" />
                <col className="w-[105px]" />
                <col className="w-[220px]" />
                <col className="w-[230px]" />
                <col className="w-[145px]" />
                <col className="w-[190px]" />
                <col className="w-[85px]" />
              </colgroup>

              <thead>
                <tr className="border-b border-[#D9DEE8]">

                  <th className="px-2 py-4 text-center text-[11px] font-semibold text-[#6B7589]">
                    No
                  </th>

                  <th className="px-2 py-4 text-center text-[11px] font-semibold text-[#6B7589]">
                    Tipe Kelas
                  </th>

                  <th className="px-2 py-4 text-center text-[11px] font-semibold text-[#6B7589]">
                    Kantor Akuntan Publik
                  </th>

                  <th className="px-2 py-4 text-center text-[11px] font-semibold text-[#6B7589]">
                    Klien
                  </th>

                  <th className="px-2 py-4 text-center text-[11px] font-semibold text-[#6B7589]">
                    Bentuk Perusahaan
                  </th>

                  <th className="px-2 py-4 text-center text-[11px] font-semibold text-[#6B7589]">
                    Alamat
                  </th>

                  <th className="px-2 py-4 text-center text-[11px] font-semibold text-[#6B7589]">
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-14 text-center text-sm text-slate-400"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-14 text-center text-sm text-red-500"
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredClientData.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-14 text-center text-sm text-slate-500"
                    >
                      Belum ada data.
                    </td>
                  </tr>
                ) : (
                  filteredClientData.map(
                    (
                      client,
                      index
                    ) => (
                      <tr
                        key={
                          client.assignmentKey
                        }
                        className="border-b border-[#E5E7EB]"
                      >

                        {/* NO */}

                        <td className="px-2 py-5 text-center text-[11px]">
                          {index + 1}
                        </td>

                        {/* TIPE KELAS */}

                        <td className="px-2 py-5 text-center text-[11px]">
                          {client.tipeKelas ||
                            "-"}
                        </td>

                        {/* KAP */}

                        <td className="px-3 py-5 text-[11px]">

                          {client.isSubmitted ? (
                            <div className="flex items-center gap-3">

                              <CircleLogo
                                logo={
                                  client.kapLogo
                                }
                                name={
                                  client.kapName
                                }
                              />

                              <span className="min-w-0 truncate font-medium text-slate-700">
                                {client.kapName ||
                                  "-"}
                              </span>

                            </div>
                          ) : (
                            <div className="text-center">
                              -
                            </div>
                          )}

                        </td>

                        {/* CLIENT */}

                        <td className="px-3 py-5 text-[11px]">

                          {client.isSubmitted ? (
                            <div className="flex items-center gap-3">

                              <CircleLogo
                                logo={
                                  client.companyLogo
                                }
                                name={
                                  client.companyName
                                }
                              />

                              <span className="min-w-0 truncate font-medium text-slate-700">
                                {client.companyName ||
                                  "-"}
                              </span>

                            </div>
                          ) : (
                            <div className="text-center">
                              -
                            </div>
                          )}

                        </td>

                        {/* BENTUK */}

                        <td className="px-2 py-5 text-center text-[11px]">
                          {client.isSubmitted
                            ? client.companyType ||
                              "-"
                            : "-"}
                        </td>

                        {/* ALAMAT */}

                        <td className="px-2 py-5 text-center text-[11px]">
                          <div className="mx-auto max-w-[175px] truncate">
                            {client.isSubmitted
                              ? client.companyAddress ||
                                "-"
                              : "-"}
                          </div>
                        </td>

                        {/* ACTION */}

                        <td className="px-2 py-5 text-center">

                          <div className="inline-flex items-center gap-1">

                            <button
                              type="button"
                              title="Edit Data"
                              onClick={() =>
                                openEditModal(
                                  client
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-sky-50 hover:text-sky-500"
                            >
                              <Pencil className="h-[17px] w-[17px]" />
                            </button>

                            <button
                              type="button"
                              title="Lihat Detail"
                              onClick={() =>
                                openDetailModal(
                                  client
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-sky-50 hover:text-sky-500"
                            >
                              <Eye className="h-[17px] w-[17px]" />
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>
            </table>

          </div>
        </section>
      </main>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editModalOpen && (
        <div
          className={`fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px] transition-all duration-300 ${
            editModalVisible
              ? "opacity-100"
              : "opacity-0"
          }`}
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              requestCloseEditModal();
            }
          }}
        >

          <div
            className={`flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[14px] bg-white shadow-2xl transition-all duration-300 ${
              editModalVisible
                ? "translate-y-0 scale-100"
                : "translate-y-2 scale-[0.98]"
            }`}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between px-7 pb-4 pt-6">

              <h2 className="text-[20px] font-bold text-[#293244]">
                Update Data Klien
              </h2>

              <button
                type="button"
                onClick={
                  requestCloseEditModal
                }
                disabled={
                  savingClient
                }
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* CONTENT */}

            <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-5 pt-2">

              <div className="grid grid-cols-1 gap-x-9 gap-y-6 lg:grid-cols-2">

                {/* =================================================
                    KAP
                ================================================= */}

                <section>

                  <h3 className="mb-5 text-center text-[15px] font-bold text-[#30384a]">
                    Input Detail Kantor Akuntan Publik
                  </h3>

                  {/* NAMA KAP */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Nama Kantor Akuntan Publik
                    </label>

                    <input
                      type="text"
                      value={
                        formData.kapName ||
                        ""
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "kapName",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* ALAMAT KAP */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Alamat Kantor Akuntan Publik
                    </label>

                    <input
                      type="text"
                      value={
                        formData.kapAddress ||
                        ""
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "kapAddress",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* EMAIL KAP */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Email Kantor Akuntan Publik
                    </label>

                    <input
                      type="email"
                      value={
                        formData.kapEmail ||
                        ""
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "kapEmail",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* TELEPON KAP */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Telepon Kantor Akuntan Publik
                    </label>

                    <input
                      type="tel"
                      value={
                        formData.kapPhone ||
                        ""
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "kapPhone",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* WEB KAP */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Web URL Kantor Akuntan Publik
                    </label>

                    <input
                      type="text"
                      value={
                        formData.kapWebsite ||
                        ""
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "kapWebsite",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* LOGO KAP */}

                  <div className="mb-2">

                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Logo Kantor Akuntan Publik
                    </label>

                    <div className="flex min-h-[42px] items-center gap-3 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-2.5 py-1.5">

                      {formData.kapLogo && (
                        <CircleLogo
                          logo={
                            formData.kapLogo
                          }
                          name={
                            formData.kapName
                          }
                        />
                      )}

                      <input
                        ref={
                          kapLogoInputRef
                        }
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={(event) =>
                          handleLogoChange(
                            "kapLogo",
                            event
                          )
                        }
                        className="min-w-0 flex-1 text-[11px] text-slate-500 file:mr-2 file:rounded file:border file:border-slate-300 file:bg-white file:px-2.5 file:py-1 file:text-[11px]"
                      />

                    </div>

                  </div>

                </section>

                {/* =================================================
                    CLIENT
                ================================================= */}

                <section>

                  <h3 className="mb-5 text-center text-[15px] font-bold text-[#30384a]">
                    Input Detail Klien
                  </h3>

                  {/* NAMA PERUSAHAAN */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Nama Perusahaan
                    </label>

                    <input
                      type="text"
                      value={
                        formData.companyName ||
                        ""
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "companyName",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* ALAMAT PERUSAHAAN */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Alamat Perusahaan
                    </label>

                    <input
                      type="text"
                      value={
                        formData.companyAddress ||
                        ""
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "companyAddress",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* EMAIL PERUSAHAAN */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Email Perusahaan
                    </label>

                    <input
                      type="email"
                      value={
                        formData.companyEmail ||
                        ""
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "companyEmail",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* TELEPON PERUSAHAAN */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Telepon Perusahaan
                    </label>

                    <input
                      type="tel"
                      value={
                        formData.companyPhone ||
                        ""
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "companyPhone",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* WEBSITE */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Web URL
                    </label>

                    <input
                      type="text"
                      value={
                        formData.companyWebsite ||
                        ""
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "companyWebsite",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* NPWP */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Nomor Pokok Wajib Pajak (NPWP)
                    </label>

                    <input
                      type="text"
                      value={
                        formData.npwp ||
                        ""
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "npwp",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* BENTUK PERUSAHAAN */}

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Bentuk Perusahaan
                    </label>

                    <select
                      value={
                        formData.companyType
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "companyType",
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-[12px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    >

                      <option value="">
                        Pilih Bentuk Perusahaan
                      </option>

                      {COMPANY_TYPES.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* LOGO PERUSAHAAN */}

                  <div className="mb-2">

                    <label className="mb-1.5 block text-[12px] font-semibold text-[#596477]">
                      Pilih Logo Perusahaan
                    </label>

                    <div className="flex min-h-[42px] items-center gap-3 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-2.5 py-1.5">

                      {formData.companyLogo && (
                        <CircleLogo
                          logo={
                            formData.companyLogo
                          }
                          name={
                            formData.companyName
                          }
                        />
                      )}

                      <input
                        ref={
                          companyLogoInputRef
                        }
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={(event) =>
                          handleLogoChange(
                            "companyLogo",
                            event
                          )
                        }
                        className="min-w-0 flex-1 text-[11px] text-slate-500 file:mr-2 file:rounded file:border file:border-slate-300 file:bg-white file:px-2.5 file:py-1 file:text-[11px]"
                      />

                    </div>

                  </div>

                </section>

              </div>
            </div>

            {/* FOOTER */}

            <div className="flex shrink-0 justify-end gap-3 px-7 pb-6 pt-3">

              <button
                type="button"
                onClick={
                  handleSaveClient
                }
                disabled={
                  savingClient
                }
                className="min-w-[94px] rounded-md bg-[#2cca39] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingClient
                  ? "Menyimpan..."
                  : "Simpan"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          DETAIL CLIENT
      ===================================================== */}

      {detailModalOpen &&
        detailClient && (
          <div
            className={`fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px] transition-opacity duration-300 ${
              detailModalVisible
                ? "opacity-100"
                : "opacity-0"
            }`}
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeDetailModal();
              }
            }}
          >

            <div
              className="w-full max-w-[670px] rounded-[14px] bg-white px-10 pb-9 pt-8 shadow-2xl"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >

              {/* HEADER */}

              <div className="mb-8 flex items-center gap-5">

                <button
                  type="button"
                  onClick={
                    closeDetailModal
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <h2 className="truncate text-[21px] font-bold text-[#293244]">

                  Detail Klien :{" "}

                  {detailClient.isSubmitted
                    ? detailClient.companyName ||
                      "-"
                    : "-"}

                </h2>

              </div>

              {/* COMPANY */}

              <div className="mb-9 flex items-center gap-8 pl-4">

                <CircleLogo
                  logo={
                    detailClient.isSubmitted
                      ? detailClient.companyLogo
                      : ""
                  }
                  name={
                    detailClient.companyName
                  }
                  size="large"
                />

                <div className="min-w-0">

                  <h3 className="mb-4 text-[17px] font-bold text-[#293244]">

                    {detailClient.isSubmitted
                      ? detailClient.companyName ||
                        "-"
                      : "-"}

                  </h3>

                  <p className="mb-3 text-[14px] text-[#606A7C]">

                    {detailClient.isSubmitted
                      ? detailClient.companyEmail ||
                        "-"
                      : "-"}

                  </p>

                  <p className="text-[14px] text-[#606A7C]">

                    {detailClient.isSubmitted
                      ? detailClient.companyPhone ||
                        "-"
                      : "-"}

                  </p>

                </div>

              </div>

              {/* DETAIL BAWAH */}

              <div className="space-y-[18px] px-4 text-[14px] text-[#586174]">

                <div className="grid grid-cols-[175px_1fr] gap-6">

                  <span>
                    Alamat
                  </span>

                  <span className="text-[#30384a]">
                    :{" "}
                    {detailClient.isSubmitted
                      ? detailClient.companyAddress ||
                        "-"
                      : "-"}
                  </span>

                </div>

                <div className="grid grid-cols-[175px_1fr] gap-6">

                  <span>
                    NPWP
                  </span>

                  <span className="text-[#30384a]">
                    :{" "}
                    {detailClient.isSubmitted
                      ? detailClient.npwp ||
                        "-"
                      : "-"}
                  </span>

                </div>

                <div className="grid grid-cols-[175px_1fr] gap-6">

                  <span>
                    Jenis
                  </span>

                  <span className="text-[#30384a]">
                    :{" "}
                    {detailClient.isSubmitted
                      ? detailClient.companyType ||
                        "-"
                      : "-"}
                  </span>

                </div>

                <div className="grid grid-cols-[175px_1fr] gap-6">

                  <span>
                    Website URL
                  </span>

                  <span className="break-all text-[#30384a]">
                    :{" "}
                    {detailClient.isSubmitted
                      ? detailClient.companyWebsite ||
                        "-"
                      : "-"}
                  </span>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}