"use client";

import {
  ClipboardList,
  Grid2X2,
  Loader2,
  Search,
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

/* =====================================================
   API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/* =====================================================
   CHECKLIST KIRI
===================================================== */

const LEFT_CHECKLIST = [
  {
    key: "DetailPermintaan",
    label: "Detail Verifikasi Permintaan Data",
  },
  {
    key: "SPK",
    label: "Surat Perjanjian Kerja Sama (SPK)",
  },
  {
    key: "SuratTugasKAP",
    label: "Surat Tugas KAP",
  },
  {
    key: "PenugasanKlien",
    label: "Surat Penugasan Klien",
  },
  {
    key: "PernyataanLKA",
    label: "Surat Pernyataan LKA",
  },
  {
    key: "PernyataanPMPJ",
    label: "Formulir Pernyataan PMPJ",
  },
  {
    key: "RepresentationLetter",
    label: "Surat Representation Letter (SRM)",
  },
  {
    key: "AktaPendirian",
    label: "Akta Pendirian",
  },
  {
    key: "SKKPendirian",
    label: "SK Kemenkumham Akta Pendirian",
  },
  {
    key: "AktaPerubahan",
    label: "Akta Perubahan Terpadu",
  },
  {
    key: "SKKPerubahan",
    label: "SK Kemenkumham Akta Perubahan",
  },
  {
    key: "SIUP",
    label: "SIUP",
  },
  {
    key: "NIB",
    label: "NIB",
  },
  {
    key: "NPWPPerusahaan",
    label: "NPWP Perusahaan",
  },
  {
    key: "NPWPDirektur",
    label: "NPWP Direktur",
  },
  {
    key: "StrukturOrganisasi",
    label: "Struktur Organisasi",
  },
  {
    key: "RUPS",
    label: "Hasil Rapat Umum Pemegang Saham",
  },
  {
    key: "AuditSebelumnya",
    label: "Laporan Audit Tahun Sebelumnya",
  },
  {
    key: "LaporanKeuangan",
    label: "Laporan Keuangan Periode Audit",
  },
  {
    key: "BukuBesar",
    label: "Buku Besar",
  },
  {
    key: "CashCount",
    label: "Berita Acara Cash Count",
  },
  {
    key: "MutasiKas",
    label: "Rincian Mutasi Kas",
  },
  {
    key: "RekeningKoranBank",
    label: "Rekening Koran Bank",
  },
  {
    key: "AKBank",
    label: "Alamat Konfirmasi Bank",
  },
  {
    key: "RincianPiutang",
    label: "Daftar Rincian Piutang",
  },
  {
    key: "AKPiutang",
    label: "Alamat Konfirmasi Piutang",
  },
  {
    key: "KonfirmasiPiutang",
    label: "Konfirmasi Piutang",
  },
  {
    key: "PelunasanPiutang",
    label: "Bukti Pelunasan Piutang Setelah Tanggal Neraca",
  },
];

/* =====================================================
   CHECKLIST KANAN
===================================================== */

const RIGHT_CHECKLIST = [
  {
    key: "RincianPersediaan",
    label: "Daftar Rincian Persediaan",
  },
  {
    key: "HargaPersediaan",
    label: "Daftar Rincian Harga Persediaan",
  },
  {
    key: "StokOpname",
    label: "Hasil Stok Opname Persediaan",
  },
  {
    key: "MutasiPersediaan",
    label: "Mutasi Persediaan",
  },
  {
    key: "MutasiAset",
    label: "Daftar Rincian Mutasi Aset",
  },
  {
    key: "ObservasiAsset",
    label: "Observasi Aset",
  },
  {
    key: "KepemilikanAset",
    label: "Bukti Penambahan Dan Kepemilikan Aset",
  },
  {
    key: "PenjualanAset",
    label: "Bukti Penjualan Aset",
  },
  {
    key: "AsetLain",
    label: "Daftar Rincian Aset Lain - Lain",
  },
  {
    key: "DokumenSewa",
    label: "Dokumen Sewa",
  },
  {
    key: "PolisAssurance",
    label: "Polis Assurance",
  },
  {
    key: "UtangUsaha",
    label: "Daftar Rincian Utang Usaha",
  },
  {
    key: "AKiUtang",
    label: "Alamat Konfirmasi Utang",
  },
  {
    key: "KonfirmasiUtang",
    label: "Konfirmasi Utang Usaha",
  },
  {
    key: "PelunasanUtang",
    label: "Bukti Pelunasan Utang Usaha Setelah Tanggal Neraca",
  },
  {
    key: "RekeningUtangBank",
    label: "Rekening Koran Utang Bank",
  },
  {
    key: "KonfirmasiBank",
    label: "Konfirmasi Bank",
  },
  {
    key: "PembayaranPajak",
    label: "Bukti Pembayaran Pajak",
  },
  {
    key: "UtangLain",
    label: "Daftar Rincian Utang Lain - Lain",
  },
  {
    key: "PenambahanModal",
    label: "Berita Acara Penambahan Modal",
  },
  {
    key: "PenarikanModal",
    label: "Berita Acara Penarikan Modal",
  },
  {
    key: "PembagianModal",
    label: "Berita Acara Pembagian Modal",
  },
  {
    key: "PembagianDeviden",
    label: "Berita Acara Pembagian Deviden",
  },
  {
    key: "SamplingPendapatan",
    label: "Bukti Sampling Pendapatan",
  },
  {
    key: "SamplingBeban",
    label: "Bukti Sampling Beban",
  },
  {
    key: "SPTBadanSebelumnya",
    label: "SPT Badan Tahun Sebelumnya",
  },
  {
    key: "PerhitunganPajakBadan",
    label: "Perhitungan Pajak Badan",
  },
  {
    key: "SPTDanSPP",
    label: "SPT Dan SSP",
  },
];

/* =====================================================
   SEMUA CHECKLIST
===================================================== */

const CHECKLIST_ITEMS = [
  ...LEFT_CHECKLIST,
  ...RIGHT_CHECKLIST,
];

const CHECKLIST_FIELDS =
  CHECKLIST_ITEMS.map(
    (item) => item.key
  );

/* =====================================================
   INITIAL CHECKLIST
===================================================== */

const createInitialChecklist =
  () => {
    return CHECKLIST_FIELDS.reduce(
      (
        result,
        field
      ) => {
        result[field] =
          false;

        return result;
      },
      {}
    );
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

const fetchWithAuth =
  async (
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
  };

/* =====================================================
   PARSE RESPONSE
===================================================== */

const parseResponse =
  async (
    response
  ) => {
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
   DATABASE -> CHECKLIST
===================================================== */

const mapChecklistFromDatabase =
  (
    data
  ) => {
    const initial =
      createInitialChecklist();

    CHECKLIST_FIELDS.forEach(
      (
        field
      ) => {
        initial[field] =
          Boolean(
            data?.[
              field
            ]
          );
      }
    );

    return initial;
  };

/* =====================================================
   CHECKLIST ITEM
===================================================== */

function ChecklistItem({
  item,
  checked,
  disabled,
  onChange,
}) {
  return (
    <label
      className="
        flex
        min-h-[34px]
        cursor-pointer
        items-center
        gap-[11px]
        rounded-md
        px-2
        py-[6px]
        transition-colors
        duration-150
        hover:bg-[#f8fafc]
      "
    >
      <input
        type="checkbox"
        checked={
          checked
        }
        disabled={
          disabled
        }
        onChange={
          onChange
        }
        className="
          h-[15px]
          w-[15px]
          shrink-0
          cursor-pointer
          rounded-[3px]
          border
          border-[#9ba8b8]
          accent-[#27b4ed]
          disabled:cursor-not-allowed
        "
      />

      <span
        className="
          font-poppins
          text-[12px]
          font-normal
          leading-[18px]
          text-[#5f6e84]
        "
      >
        {item.label}
      </span>
    </label>
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function DetailVerifikasiPage({
  detilVerifikasiId:
    propDetilVerifikasiId,
}) {
  const params =
    useParams();

  const searchParams =
    useSearchParams();

  /* =====================================================
     ROUTE ID

     [id] = DetilVerifikasiID
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
     QUERY DETAIL ID
  ===================================================== */

  const queryDetilVerifikasiId =
    useMemo(() => {
      return (
        searchParams.get(
          "detilVerifikasiId"
        ) ||
        searchParams.get(
          "DetilVerifikasiID"
        ) ||
        searchParams.get(
          "detil_verifikasi_id"
        ) ||
        ""
      );
    }, [
      searchParams,
    ]);

  /* =====================================================
     INITIAL DETAIL ID

     Supaya ID langsung tersedia tanpa
     menunggu response API.
  ===================================================== */

  const getInitialDetailId =
    () => {
      const directId =
        propDetilVerifikasiId ||
        queryDetilVerifikasiId ||
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
            "activeDetilVerifikasiId"
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
    detilVerifikasiId,
    setDetilVerifikasiId,
  ] = useState(
    getInitialDetailId
  );

  /*
   * Nilai JwbKasusID hanya disimpan
   * dari response detil-verifikasi.
   *
   * Tidak ada request /api/jwb-kasus.
   */
  const [
    ,
    setJwbKasusId,
  ] = useState("");

  /* =====================================================
     CHECKLIST
  ===================================================== */

  const [
    checklist,
    setChecklist,
  ] = useState(
    createInitialChecklist
  );

  /* =====================================================
     SEARCH
  ===================================================== */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  /* =====================================================
     LOADING / SAVING

     Loading hanya digunakan untuk men-disable
     interaksi sementara API refresh berjalan.

     Tidak ada full page loading lagi.
  ===================================================== */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
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

  useEffect(
    () => {
      return () => {
        clearAlertTimer();
      };
    },
    [
      clearAlertTimer,
    ]
  );

  /* =====================================================
     SAVE JWB KASUS ID

     Hanya dari response detil-verifikasi.
  ===================================================== */

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

  /* =====================================================
     SAVE DETAIL ID
  ===================================================== */

  const saveDetilVerifikasiId =
    useCallback(
      (
        id
      ) => {
        if (!id) {
          return;
        }

        const value =
          String(id);

        setDetilVerifikasiId(
          value
        );

        if (
          typeof window !==
          "undefined"
        ) {
          sessionStorage.setItem(
            "activeDetilVerifikasiId",
            value
          );
        }
      },
      []
    );

  /* =====================================================
     APPLY DATABASE DATA
  ===================================================== */

  const applyDatabaseData =
    useCallback(
      (
        data
      ) => {
        if (!data) {
          return;
        }

        const mapped =
          mapChecklistFromDatabase(
            data
          );

        setChecklist(
          mapped
        );

        if (
          data
            ?.DetilVerifikasiID
        ) {
          saveDetilVerifikasiId(
            data
              .DetilVerifikasiID
          );
        }

        /*
         * JwbKasusID langsung dari
         * response detil-verifikasi.
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
      },
      [
        saveDetilVerifikasiId,
        saveJwbKasusId,
      ]
    );

  /* =====================================================
     GET DETAIL BY ID

     HANYA:
     GET /api/detil-verifikasi/{DetilVerifikasiID}

     Tidak ada /api/jwb-kasus.
  ===================================================== */

  const getDetailById =
    useCallback(
      async (
        id
      ) => {
        if (!id) {
          return null;
        }

        const response =
          await fetchWithAuth(
            `${API_URL}/api/detil-verifikasi/${id}`,
            {
              method:
                "GET",

              /*
               * Data tetap fresh dari backend.
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
              "Gagal mengambil detail verifikasi."
          );
        }

        /*
         * Support:
         *
         * {
         *   data: {...}
         * }
         *
         * maupun:
         *
         * {...}
         */
        const source =
          result?.data &&
          !Array.isArray(
            result.data
          )
            ? result.data
            : result;

        if (!source) {
          return null;
        }

        applyDatabaseData(
          source
        );

        return source;
      },
      [
        applyDatabaseData,
      ]
    );

  /* =====================================================
     RESOLVE DETAIL

     API berjalan di background.
     UI tidak ditahan oleh spinner.
  ===================================================== */

  const resolveDetail =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

          let storedDetailId =
            "";

          if (
            typeof window !==
            "undefined"
          ) {
            storedDetailId =
              sessionStorage.getItem(
                "activeDetilVerifikasiId"
              ) ||
              "";
          }

          const targetDetailId =
            propDetilVerifikasiId ||
            queryDetilVerifikasiId ||
            routeId ||
            storedDetailId ||
            "";

          if (
            !targetDetailId
          ) {
            setDetilVerifikasiId(
              ""
            );

            setJwbKasusId(
              ""
            );

            setChecklist(
              createInitialChecklist()
            );

            showErrorAlert(
              "Detail Verifikasi Tidak Ditemukan",
              "DetilVerifikasiID belum tersedia."
            );

            return;
          }

          /*
           * ID langsung tersedia di UI.
           */
          const targetId =
            String(
              targetDetailId
            );

          setDetilVerifikasiId(
            targetId
          );

          /*
           * GET tetap dilakukan.
           *
           * Tetapi halaman sudah tampil
           * sebelum response selesai.
           */
          const result =
            await getDetailById(
              targetId
            );

          if (!result) {
            setDetilVerifikasiId(
              ""
            );

            setJwbKasusId(
              ""
            );

            setChecklist(
              createInitialChecklist()
            );

            /*
             * Jika ID session sudah tidak valid,
             * hapus session lama.
             */
            if (
              typeof window !==
                "undefined" &&
              String(
                storedDetailId
              ) ===
                String(
                  targetId
                )
            ) {
              sessionStorage.removeItem(
                "activeDetilVerifikasiId"
              );
            }

            showErrorAlert(
              "Detail Verifikasi Tidak Ditemukan",
              `Detail Verifikasi dengan ID ${targetId} tidak ditemukan.`
            );
          }
        } catch (
          error
        ) {
          console.error(
            "ERROR RESOLVE DETAIL VERIFIKASI:",
            error
          );

          /*
           * Jangan blank seluruh halaman.
           * UI tetap tampil.
           */
          showErrorAlert(
            "Gagal Mengambil Data",
            error?.message ||
              "Gagal mengambil detail verifikasi."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        propDetilVerifikasiId,
        queryDetilVerifikasiId,
        routeId,
        getDetailById,
        showErrorAlert,
      ]
    );

  /* =====================================================
     LOAD DETAIL
  ===================================================== */

  useEffect(
    () => {
      resolveDetail();
    },
    [
      resolveDetail,
    ]
  );

  /* =====================================================
     CHECKBOX
  ===================================================== */

  const handleChecklistChange =
    (
      field
    ) => {
      /*
       * Jangan izinkan perubahan selama
       * initial data masih diambil.
       */
      if (
        saving ||
        loading
      ) {
        return;
      }

      setChecklist(
        (
          previous
        ) => ({
          ...previous,

          [field]:
            !previous[
              field
            ],
        })
      );
    };

  /* =====================================================
     SELECT ALL
  ===================================================== */

  const allChecked =
    useMemo(
      () => {
        return (
          CHECKLIST_FIELDS.length >
            0 &&
          CHECKLIST_FIELDS.every(
            (
              field
            ) =>
              Boolean(
                checklist[
                  field
                ]
              )
          )
        );
      },
      [
        checklist,
      ]
    );

  const handleSelectAll =
    () => {
      if (
        saving ||
        loading
      ) {
        return;
      }

      const nextValue =
        !allChecked;

      setChecklist(
        (
          previous
        ) => {
          const next = {
            ...previous,
          };

          CHECKLIST_FIELDS.forEach(
            (
              field
            ) => {
              next[field] =
                nextValue;
            }
          );

          return next;
        }
      );
    };

  /* =====================================================
     CHECKED COUNT
  ===================================================== */

  const checkedCount =
    useMemo(
      () => {
        return CHECKLIST_FIELDS.filter(
          (
            field
          ) =>
            Boolean(
              checklist[
                field
              ]
            )
        ).length;
      },
      [
        checklist,
      ]
    );

  const totalChecklist =
    CHECKLIST_FIELDS.length;

  /* =====================================================
     SEARCH
  ===================================================== */

  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();

  const filteredLeft =
    useMemo(
      () => {
        if (
          !normalizedSearch
        ) {
          return LEFT_CHECKLIST;
        }

        return LEFT_CHECKLIST.filter(
          (
            item
          ) =>
            item.label
              .toLowerCase()
              .includes(
                normalizedSearch
              )
        );
      },
      [
        normalizedSearch,
      ]
    );

  const filteredRight =
    useMemo(
      () => {
        if (
          !normalizedSearch
        ) {
          return RIGHT_CHECKLIST;
        }

        return RIGHT_CHECKLIST.filter(
          (
            item
          ) =>
            item.label
              .toLowerCase()
              .includes(
                normalizedSearch
              )
        );
      },
      [
        normalizedSearch,
      ]
    );

  const noSearchResult =
    filteredLeft.length ===
      0 &&
    filteredRight.length ===
      0;

  /* =====================================================
     SAVE

     PUT /api/detil-verifikasi/{DetilVerifikasiID}
  ===================================================== */

  const handleSave =
    async () => {
      if (
        loading
      ) {
        return;
      }

      if (
        !detilVerifikasiId
      ) {
        showErrorAlert(
          "Data Tidak Tersedia",
          "DetilVerifikasiID belum ditemukan."
        );

        return;
      }

      try {
        setSaving(
          true
        );

        const payload =
          CHECKLIST_FIELDS.reduce(
            (
              result,
              field
            ) => {
              result[field] =
                Boolean(
                  checklist[
                    field
                  ]
                );

              return result;
            },
            {}
          );

        const response =
          await fetchWithAuth(
            `${API_URL}/api/detil-verifikasi/${detilVerifikasiId}`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (
          !response.ok
        ) {
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
              "Detail verifikasi gagal disimpan."
          );
        }

        /*
         * Jika PUT mengembalikan data lengkap,
         * langsung apply tanpa GET tambahan.
         */
        if (
          result?.data &&
          !Array.isArray(
            result.data
          )
        ) {
          applyDatabaseData(
            result.data
          );
        } else {
          /*
           * Jika backend hanya return message / ID,
           * refresh tetap menggunakan resource
           * detil-verifikasi yang sama.
           */
          await getDetailById(
            detilVerifikasiId
          );
        }

        showSuccessAlert(
          "Berhasil Disimpan",
          result?.message ||
            "Detail verifikasi berhasil diperbarui."
        );
      } catch (
        error
      ) {
        console.error(
          "ERROR SAVE DETAIL VERIFIKASI:",
          error
        );

        showErrorAlert(
          "Gagal Menyimpan",
          error?.message ||
            "Detail verifikasi gagal disimpan."
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* =====================================================
     RENDER

     Tidak ada lagi:
     if (loading) return <Loading />
  ===================================================== */

  return (
    <>
      {/* =================================================
          ERROR ALERT
      ================================================== */}

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

      {/* =================================================
          SUCCESS ALERT
      ================================================== */}

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

      {/* =================================================
          PAGE OUTER
      ================================================== */}

      <div
        className="
          min-h-full
          w-full
          bg-[#f7f9fc]
          px-4
          pb-7
          pt-[40px]
          sm:px-5
          lg:px-6
        "
      >
        {/* ===============================================
            WHITE CONTENT
        ================================================ */}

        <div
          className="
            min-h-full
            w-full
            rounded-xl
            bg-white
            px-5
            pb-7
            pt-6
            sm:px-6
            lg:px-7
          "
        >
          {/* =============================================
              PAGE HEADER
          ============================================== */}

          <div
            className="
              flex
              items-center
              gap-[14px]
            "
          >
            <div
              className="
                flex
                h-[42px]
                w-[42px]
                shrink-0
                items-center
                justify-center
                rounded-[9px]
                bg-[#eef9fe]
                text-[#25b4ee]
              "
            >
              <ClipboardList
                size={21}
                strokeWidth={
                  1.8
                }
              />
            </div>

            <div>
              <h1
                className="
                  font-poppins
                  text-[19px]
                  font-semibold
                  leading-[24px]
                  text-[#172033]
                "
              >
                Detail Verifikasi Permintaan Data
              </h1>

              <p
                className="
                  mt-[2px]
                  font-poppins
                  text-[12px]
                  font-normal
                  text-[#7a8799]
                "
              >
                Checklist dokumen pendukung yang dibutuhkan untuk proses audit
              </p>
            </div>
          </div>

          {/* =============================================
              CHECKLIST CARD
          ============================================== */}

          <div
            className="
              mt-7
              rounded-[12px]
              border
              border-[#d9e2ec]
              bg-white
              px-5
              pb-5
              pt-5
            "
          >
            {/* ===========================================
                CARD HEADER
            ============================================ */}

            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              {/* LEFT */}

              <div
                className="
                  flex
                  items-center
                  gap-[11px]
                "
              >
                <div
                  className="
                    flex
                    h-[34px]
                    w-[34px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[7px]
                    bg-[#eef9fe]
                    text-[#25b4ee]
                  "
                >
                  <Grid2X2
                    size={17}
                    strokeWidth={
                      1.8
                    }
                  />
                </div>

                <h2
                  className="
                    font-poppins
                    text-[14px]
                    font-semibold
                    text-[#162033]
                  "
                >
                  Checklist Dokumen
                </h2>

                <div
                  className="
                    rounded-full
                    bg-[#e9f7fe]
                    px-[9px]
                    py-[3px]
                    font-poppins
                    text-[10px]
                    font-medium
                    text-[#1baee9]
                  "
                >
                  {checkedCount}/
                  {totalChecklist} dipilih
                </div>
              </div>

              {/* SEARCH */}

              <div
                className="
                  relative
                  w-full
                  sm:w-[240px]
                "
              >
                <Search
                  size={15}
                  strokeWidth={
                    1.8
                  }
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-[#9dacbd]
                  "
                />

                <input
                  type="text"
                  value={
                    searchQuery
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchQuery(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Cari Kategori"
                  className="
                    h-[36px]
                    w-full
                    rounded-[7px]
                    border
                    border-[#d8e1eb]
                    bg-white
                    pl-9
                    pr-3
                    font-poppins
                    text-[11px]
                    text-[#52647b]
                    outline-none
                    transition
                    placeholder:text-[#a5b1bf]
                    focus:border-[#42baf0]
                    focus:ring-2
                    focus:ring-[#42baf0]/10
                  "
                />
              </div>
            </div>

            {/* ===========================================
                PILIH SEMUA
            ============================================ */}

            <label
              className={`
                mt-6
                flex
                h-[43px]
                items-center
                gap-[12px]
                rounded-[6px]
                border
                border-[#dde5ed]
                bg-[#f5f7f9]
                px-4

                ${
                  loading ||
                  saving
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
            >
              <input
                type="checkbox"
                checked={
                  allChecked
                }
                disabled={
                  loading ||
                  saving
                }
                onChange={
                  handleSelectAll
                }
                className="
                  h-[16px]
                  w-[16px]
                  cursor-pointer
                  rounded-[3px]
                  border
                  border-[#929ead]
                  accent-[#27b4ed]
                  disabled:cursor-not-allowed
                "
              />

              <span
                className="
                  font-poppins
                  text-[12px]
                  font-semibold
                  text-[#263347]
                "
              >
                Pilih Semua
              </span>
            </label>

            {/* ===========================================
                CHECKLIST
            ============================================ */}

            <div
              className="
                mt-2
                min-h-[400px]
              "
            >
              {noSearchResult ? (
                <div
                  className="
                    flex
                    min-h-[240px]
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >
                  <Search
                    size={28}
                    strokeWidth={
                      1.5
                    }
                    className="
                      text-[#b6c1ce]
                    "
                  />

                  <p
                    className="
                      mt-3
                      font-poppins
                      text-[13px]
                      font-medium
                      text-[#617188]
                    "
                  >
                    Checklist tidak ditemukan
                  </p>

                  <p
                    className="
                      mt-1
                      font-poppins
                      text-[11px]
                      text-[#98a6b8]
                    "
                  >
                    Coba gunakan kata pencarian lainnya.
                  </p>
                </div>
              ) : (
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-x-[70px]
                    lg:grid-cols-2
                  "
                >
                  {/* LEFT */}

                  <div>
                    {filteredLeft.map(
                      (
                        item
                      ) => (
                        <ChecklistItem
                          key={
                            item.key
                          }
                          item={
                            item
                          }
                          checked={Boolean(
                            checklist[
                              item.key
                            ]
                          )}
                          disabled={
                            loading ||
                            saving
                          }
                          onChange={() =>
                            handleChecklistChange(
                              item.key
                            )
                          }
                        />
                      )
                    )}
                  </div>

                  {/* RIGHT */}

                  <div>
                    {filteredRight.map(
                      (
                        item
                      ) => (
                        <ChecklistItem
                          key={
                            item.key
                          }
                          item={
                            item
                          }
                          checked={Boolean(
                            checklist[
                              item.key
                            ]
                          )}
                          disabled={
                            loading ||
                            saving
                          }
                          onChange={() =>
                            handleChecklistChange(
                              item.key
                            )
                          }
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ===========================================
                DIVIDER
            ============================================ */}

            <div
              className="
                mt-3
                border-t
                border-[#dfe6ed]
              "
            />

            {/* ===========================================
                SAVE
            ============================================ */}

            <div
              className="
                flex
                justify-end
                pb-1
                pt-5
              "
            >
              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  loading ||
                  saving ||
                  !detilVerifikasiId
                }
                className="
                  flex
                  h-[39px]
                  min-w-[91px]
                  items-center
                  justify-center
                  rounded-[7px]
                  bg-[#08a818]
                  px-5
                  font-poppins
                  text-[12px]
                  font-semibold
                  text-white
                  shadow-sm
                  transition-colors
                  duration-150
                  hover:bg-[#079617]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {saving ? (
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Loader2
                      size={15}
                      className="
                        animate-spin
                      "
                    />

                    <span>
                      Menyimpan...
                    </span>
                  </div>
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}