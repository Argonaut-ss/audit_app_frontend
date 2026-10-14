"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";

import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import AlertError from "@/components/alert/alert_error";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
);

const WAWANCARA_ENDPOINT = `${API_URL}/api/wawancara-aset-lain`;
const WAWANCARA_BULK_SAVE_ENDPOINT = `${WAWANCARA_ENDPOINT}/bulk-save`;

const INITIAL_QUESTIONS = [
  {
    id: "default-1",
    WawancaraID: null,
    pertanyaan:
      "Jelaskan dan sebutkan jenis aset lain-lain yang dimiliki oleh perusahaan?",
    jawaban: "",
    fixed: true,
  },
  {
    id: "default-2",
    WawancaraID: null,
    pertanyaan:
      "Bagaimana perlakuan dan pencatatan aset lain-lain dalam perusahaan?",
    jawaban: "",
    fixed: true,
  },
  {
    id: "default-3",
    WawancaraID: null,
    pertanyaan:
      "Apa metode amortisasi yang digunakan perusahaan untuk aset lain-lain?",
    jawaban: "",
    fixed: true,
  },
  {
    id: "default-4",
    WawancaraID: null,
    pertanyaan:
      "Apakah ada prosedur yang dilakukan untuk memastikan bahwa semua pembayaran sesuai dengan kebijakan internal perusahaan?",
    jawaban: "",
    fixed: true,
  },
];

function normalizeId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getErrorMessage(result, fallback) {
  if (result?.errors && typeof result.errors === "object") {
    const messages = Object.values(result.errors).flat();

    if (messages.length > 0) {
      return messages.join("\n");
    }
  }

  return result?.message || fallback;
}

function getWawancaraId(item) {
  return normalizeId(
    item?.WawancaraID ??
      item?.wawancaraID ??
      item?.wawancara_id
  );
}

function getWawancaraQuestion(item) {
  return item?.Pertanyaan ?? item?.pertanyaan ?? "";
}

function getWawancaraAnswer(item) {
  return item?.Jawaban ?? item?.jawaban ?? "";
}


export default function WawancaraPage({
  jwbKasusId: jwbKasusIdProp,
  auditId,
  refetchToken = 0,
  onSaved,
}) {
  const params = useParams();
  const searchParams = useSearchParams();

  const activeJwbKasusId = useMemo(() => {
    const fromProp = normalizeId(jwbKasusIdProp);

    if (fromProp) return fromProp;

    const fromParams = normalizeId(
      params?.JwbKasusID ??
        params?.jwbKasusId ??
        params?.jwb_kasus_id
    );

    if (fromParams) return fromParams;

    const fromSearchParams = normalizeId(
      searchParams?.get("JwbKasusID") ??
        searchParams?.get("jwbKasusId") ??
        searchParams?.get("jwb_kasus_id")
    );

    if (fromSearchParams) return fromSearchParams;

    return normalizeId(params?.id);
  }, [jwbKasusIdProp, params, searchParams]);


  const [asetLainId, setAsetLainId] = useState(null);

  const [questions, setQuestions] = useState(() =>
    INITIAL_QUESTIONS.map((item) => ({ ...item }))
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorAlert, setErrorAlert] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingData, setDeletingData] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const rowRefs = useRef({});
  const requestVersionRef = useRef(0);


  const showError = useCallback((title, message) => {
    setErrorAlert({ title, message });
    setSuccessAlert(null);
  }, []);

  const showSuccess = useCallback((title, message) => {
    setSuccessAlert({ title, message });
    setErrorAlert(null);
  }, []);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    const isFormData =
      typeof FormData !== "undefined" &&
      options.body instanceof FormData;

    const headers = {
      Accept: "application/json",
      ...(options.body && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
      cache: options.cache || "no-store",
    });
  }, []);

  const loadWawancara = useCallback(
    async (jwbKasusId) => {
      const requestVersion = ++requestVersionRef.current;

      setLoading(true);
      setErrorAlert(null);

      try {
        setAsetLainId(null);

        if (!jwbKasusId) {
          throw new Error(
            "JwbKasusID tidak ditemukan. Pastikan halaman menyediakan ID kasus yang benar."
          );
        }

          const asetResponse = await fetchWithAuth(
          `${API_URL}/api/aset-lain/${encodeURIComponent(jwbKasusId)}`,
          { method: "GET" }
        );

        const asetResult = await parseResponse(asetResponse);

        if (!asetResponse.ok) {
          throw new Error(
            getErrorMessage(
              asetResult,
              "Gagal mengambil data aset lain."
            )
          );
        }

        const resolvedAsetLainId = normalizeId(
          asetResult?.data?.AsetLainID
        );

        if (!resolvedAsetLainId) {
          throw new Error(
            "AsetLainID tidak ditemukan dalam respons API Aset Lain."
          );
        }

        if (requestVersion !== requestVersionRef.current) return;

        setAsetLainId(resolvedAsetLainId);

        // LANGKAH 2: Ambil wawancara berdasarkan AsetLainID.
        const wawancaraResponse = await fetchWithAuth(
          `${WAWANCARA_ENDPOINT}?AsetLainID=${encodeURIComponent(
            resolvedAsetLainId
          )}&_=${Date.now()}`,
          { method: "GET" }
        );

        const wawancaraResult = await parseResponse(wawancaraResponse);

        if (!wawancaraResponse.ok) {
          throw new Error(
            getErrorMessage(
              wawancaraResult,
              "Gagal mengambil data wawancara aset lain-lain."
            )
          );
        }

        if (requestVersion !== requestVersionRef.current) return;

        const rows = Array.isArray(wawancaraResult)
          ? wawancaraResult
          : Array.isArray(wawancaraResult?.data)
            ? wawancaraResult.data
            : [];

        const savedRows = rows.map((item, index) => ({
          id: getWawancaraId(item) ?? `saved-${index}`,
          WawancaraID: getWawancaraId(item),
          pertanyaan: getWawancaraQuestion(item),
          jawaban: getWawancaraAnswer(item) ?? "",
          fixed: false,
        }));

        const remainingSavedRows = [...savedRows];

        const defaultRows = INITIAL_QUESTIONS.map((defaultItem) => {
          const savedIndex = remainingSavedRows.findIndex(
            (savedItem) =>
              savedItem.pertanyaan.trim() ===
              defaultItem.pertanyaan.trim()
          );

          if (savedIndex === -1) {
            return { ...defaultItem };
          }

          const [savedItem] = remainingSavedRows.splice(savedIndex, 1);

          return {
            ...defaultItem,
            id: savedItem.id,
            WawancaraID: savedItem.WawancaraID,
            pertanyaan: savedItem.pertanyaan,
            jawaban: savedItem.jawaban,
            fixed: true,
          };
        });

        setQuestions([...defaultRows, ...remainingSavedRows]);
      } catch (error) {
        if (requestVersion !== requestVersionRef.current) return;

        setAsetLainId(null);
        setQuestions(INITIAL_QUESTIONS.map((item) => ({ ...item })));

        showError(
          "Gagal Memuat Data",
          error?.message ||
            "Terjadi kesalahan saat mengambil data wawancara."
        );
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchWithAuth, showError]
  );

  useEffect(() => {
    loadWawancara(activeJwbKasusId);

    return () => {
      requestVersionRef.current += 1;
    };
  }, [activeJwbKasusId, refetchToken, loadWawancara]);

  const resizeRowFields = useCallback((rowElement) => {
    if (!rowElement) return;

    const fields = Array.from(
      rowElement.querySelectorAll("textarea.field")
    );

    if (!fields.length) return;

    fields.forEach((field) => {
      field.style.height = "64px";
    });

    const maxHeight = Math.max(
      64,
      ...fields.map((field) => field.scrollHeight)
    );

    fields.forEach((field) => {
      field.style.height = `${maxHeight}px`;
    });
  }, []);

  const resizeAllRows = useCallback(() => {
    Object.values(rowRefs.current).forEach((rowElement) => {
      resizeRowFields(rowElement);
    });
  }, [resizeRowFields]);

  useEffect(() => {
    const frame = requestAnimationFrame(resizeAllRows);

    return () => cancelAnimationFrame(frame);
  }, [questions, loading, resizeAllRows]);

  const updateQuestion = (id, field, value) => {
    setQuestions((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

    setErrorAlert(null);
    setSuccessAlert(null);
  };

  const addQuestion = () => {
    const newId =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `question-${Date.now()}-${Math.random()}`;

    setQuestions((previous) => [
      ...previous,
      {
        id: newId,
        WawancaraID: null,
        pertanyaan: "",
        jawaban: "",
        fixed: false,
      },
    ]);

    setErrorAlert(null);
    setSuccessAlert(null);
  };

  const openDeleteConfirmation = (item) => {
    if (item.fixed || saving || deleting) return;

    setDeletingData(item);
    setDeleteModalOpen(true);
  };

  const closeDeleteConfirmation = () => {
    if (deleting) return;

    setDeleteModalOpen(false);
    setDeletingData(null);
  };

  const confirmDelete = async () => {
    if (!deletingData || deletingData.fixed || deleting) return;

    const itemToDelete = deletingData;

    if (!itemToDelete.WawancaraID) {
      setQuestions((previous) =>
        previous.filter((item) => item.id !== itemToDelete.id)
      );

      setDeleteModalOpen(false);
      setDeletingData(null);

      showSuccess("Berhasil", "Pertanyaan berhasil dihapus.");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetchWithAuth(
        `${WAWANCARA_ENDPOINT}/${itemToDelete.WawancaraID}`,
        { method: "DELETE" }
      );

      const result = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Gagal menghapus pertanyaan.")
        );
      }

      setQuestions((previous) =>
        previous.filter((item) => item.id !== itemToDelete.id)
      );

      setDeleteModalOpen(false);
      setDeletingData(null);

      showSuccess("Berhasil", "Pertanyaan berhasil dihapus.");
    } catch (error) {
      showError(
        "Gagal Menghapus",
        error?.message ||
          "Terjadi kesalahan saat menghapus pertanyaan."
      );
    } finally {
      setDeleting(false);
    }
  };

  const saveQuestions = async () => {
    if (saving) return;

    if (!asetLainId) {
      showError(
        "ID Aset Belum Tersedia",
        "AsetLainID belum tersedia. Pastikan data aset lain berhasil dimuat."
      );
      return;
    }

    const filledRows = questions.filter(
      (item) =>
        item.pertanyaan.trim() !== "" ||
        item.jawaban.trim() !== ""
    );

    if (filledRows.length === 0) {
      showError(
        "Validasi Gagal",
        "Tidak ada data wawancara yang dapat disimpan."
      );
      return;
    }

    const hasEmptyQuestion = filledRows.some(
      (item) => !item.pertanyaan.trim()
    );

    if (hasEmptyQuestion) {
      showError(
        "Validasi Gagal",
        "Pertanyaan tidak boleh kosong jika jawaban atau data pada baris tersebut diisi."
      );
      return;
    }

    const payload = {
      AsetLainID: asetLainId,
      rows: filledRows.map((item) => ({
        ...(item.WawancaraID
          ? { WawancaraID: item.WawancaraID }
          : {}),
        Pertanyaan: item.pertanyaan.trim(),
        Jawaban: item.jawaban.trim() || null,
      })),
    };

    setSaving(true);
    setErrorAlert(null);
    setSuccessAlert(null);

    try {
      const response = await fetchWithAuth(
        WAWANCARA_BULK_SAVE_ENDPOINT,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const result = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            result,
            "Gagal menyimpan data wawancara."
          )
        );
      }

      await loadWawancara(activeJwbKasusId);

      showSuccess("Berhasil", "Data wawancara berhasil disimpan.");

      if (typeof onSaved === "function") {
        onSaved(result);
      }
    } catch (error) {
      showError(
        "Gagal Menyimpan",
        error?.message ||
          "Terjadi kesalahan saat menyimpan data wawancara."
      );
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    content: {
      width: "100%",
      minWidth: 0,
      fontFamily: "inherit",
      fontSize: 12,
      color: "#334155",
    },
    tableWrapper: {
      width: "100%",
      minWidth: 0,
      overflowX: "auto",
      border: "1px solid #dce5ef",
      borderRadius: 10,
      background: "#ffffff",
    },
    table: {
      width: "100%",
      minWidth: 720,
      tableLayout: "fixed",
      borderCollapse: "separate",
      borderSpacing: 0,
    },
    header: {
      padding: "16px 12px",
      borderBottom: "1px solid #dce5ef",
      background: "#f8fafc",
      color: "#64748b",
      fontFamily: "inherit",
      fontSize: 11,
      fontWeight: 600,
      textAlign: "left",
      verticalAlign: "middle",
    },
    cell: {
      padding: "12px 10px",
      borderBottom: "1px solid #edf1f6",
      verticalAlign: "top",
    },
    numberCell: {
      padding: "12px 4px",
      color: "#475569",
      fontSize: 12,
      fontWeight: 400,
      textAlign: "center",
      verticalAlign: "middle",
      borderBottom: "1px solid #edf1f6",
    },
    field: {
      display: "block",
      boxSizing: "border-box",
      width: "100%",
      minWidth: 0,
      height: 64,
      minHeight: 64,
      margin: 0,
      padding: 12,
      border: "1px solid #dce5ef",
      borderRadius: 8,
      outline: "none",
      background: "#ffffff",
      color: "#475569",
      fontFamily: "inherit",
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.5,
      overflowX: "hidden",
      overflowY: "hidden",
      overflowWrap: "anywhere",
      whiteSpace: "pre-wrap",
      resize: "none",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    },
    actionCell: {
      padding: "14px 4px",
      textAlign: "center",
      verticalAlign: "middle",
      borderBottom: "1px solid #edf1f6",
    },
    deleteButton: {
      display: "inline-flex",
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      borderRadius: 8,
      background: "transparent",
      color: "#ef4444",
      cursor: "pointer",
    },
    addContainer: {
      display: "flex",
      justifyContent: "center",
      paddingTop: 26,
    },
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      marginTop: 24,
    },
    loading: {
      padding: "18px 12px",
      color: "#64748b",
      fontSize: 12,
      textAlign: "center",
    },
  };

  return (
    <div className="font-poppins" style={styles.content}>
      {errorAlert && (
        <div style={{ marginBottom: 16 }}>
          <AlertError
            title={errorAlert.title}
            message={errorAlert.message}
            onClose={() => setErrorAlert(null)}
          />
        </div>
      )}

      {successAlert && (
        <div style={{ marginBottom: 16 }}>
          <AlertSuccess
            title={successAlert.title}
            message={successAlert.message}
            onClose={() => setSuccessAlert(null)}
          />
        </div>
      )}

      <ConfirmationPopup
        isOpen={deleteModalOpen}
        message="Apakah Anda yakin ingin menghapus pertanyaan ini?"
        subText={deletingData?.pertanyaan || "Pertanyaan baru"}
        confirmText={deleting ? "Menghapus..." : "Hapus"}
        cancelText="Batal"
        onConfirm={confirmDelete}
        onCancel={closeDeleteConfirmation}
      />

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th
                style={{
                  ...styles.header,
                  width: 65,
                  textAlign: "center",
                }}
              >
                NO
              </th>
              <th style={{ ...styles.header, width: "34%" }}>
                PERTANYAAN
              </th>
              <th style={styles.header}>JAWABAN</th>
              <th
                style={{
                  ...styles.header,
                  width: 65,
                  textAlign: "center",
                }}
              >
                AKSI
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={styles.loading}>
                  Memuat data wawancara...
                </td>
              </tr>
            ) : (
              questions.map((item, index) => (
                <tr
                  key={item.id}
                  ref={(element) => {
                    if (element) {
                      rowRefs.current[item.id] = element;
                    } else {
                      delete rowRefs.current[item.id];
                    }
                  }}
                >
                  <td style={styles.numberCell}>{index + 1}</td>

                  <td style={styles.cell}>
                    <textarea
                      className="field"
                      rows={2}
                      value={item.pertanyaan}
                      placeholder={item.fixed ? "" : "Tulis pertanyaan..."}
                      aria-label={`Pertanyaan ${index + 1}`}
                      disabled={saving}
                      style={styles.field}
                      onFocus={(event) => {
                        event.currentTarget.style.borderColor = "#38bdf8";
                        event.currentTarget.style.boxShadow =
                          "0 0 0 2px rgb(56 189 248 / 10%)";
                      }}
                      onBlur={(event) => {
                        event.currentTarget.style.borderColor = "#dce5ef";
                        event.currentTarget.style.boxShadow = "none";
                      }}
                      onChange={(event) => {
                        updateQuestion(
                          item.id,
                          "pertanyaan",
                          event.target.value
                        );
                        resizeRowFields(event.currentTarget.closest("tr"));
                      }}
                      onInput={(event) => {
                        resizeRowFields(event.currentTarget.closest("tr"));
                      }}
                    />
                  </td>

                  <td style={styles.cell}>
                    <textarea
                      className="field"
                      rows={2}
                      value={item.jawaban}
                      placeholder="Tulis jawaban..."
                      aria-label={`Jawaban ${index + 1}`}
                      disabled={saving}
                      style={styles.field}
                      onFocus={(event) => {
                        event.currentTarget.style.borderColor = "#38bdf8";
                        event.currentTarget.style.boxShadow =
                          "0 0 0 2px rgb(56 189 248 / 10%)";
                      }}
                      onBlur={(event) => {
                        event.currentTarget.style.borderColor = "#dce5ef";
                        event.currentTarget.style.boxShadow = "none";
                      }}
                      onChange={(event) => {
                        updateQuestion(
                          item.id,
                          "jawaban",
                          event.target.value
                        );
                        resizeRowFields(event.currentTarget.closest("tr"));
                      }}
                      onInput={(event) => {
                        resizeRowFields(event.currentTarget.closest("tr"));
                      }}
                    />
                  </td>

                  <td style={styles.actionCell}>
                    {!item.fixed && (
                      <button
                        type="button"
                        title="Hapus pertanyaan"
                        aria-label={`Hapus pertanyaan ${index + 1}`}
                        disabled={saving || deleting}
                        style={{
                          ...styles.deleteButton,
                          opacity: saving || deleting ? 0.5 : 1,
                          cursor:
                            saving || deleting ? "not-allowed" : "pointer",
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background = "#fef2f2";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background =
                            "transparent";
                        }}
                        onClick={() => openDeleteConfirmation(item)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.addContainer}>
        <AddDataButton
          onClick={addQuestion}
          label="Tambah Data"
        />
      </div>

      <div style={styles.footer}>
        <div style={{ flex: 1, minWidth: 0 }} />

        <SaveButton
          onClick={saveQuestions}
          disabled={loading || saving || !asetLainId}
        />
      </div>
    </div>
  );
}
