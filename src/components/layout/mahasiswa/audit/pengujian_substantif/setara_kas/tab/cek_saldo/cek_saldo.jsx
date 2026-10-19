
"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import AlertSuccess from "@/components/alert/alert_success";
import ConfirmationPopup from "@/components/popup/confirmation_popup";

import { getSetaraKas } from "@/services/mahasiswa/tugas/audit/setara_kas/setara_kas";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const API_ENDPOINT = `${API_URL}/api/cek-saldo-setara-kas`;

const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

const fetchWithAuth = async (url, options = {}) => {
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

async function apiRequest(url, options = {}) {
  const response = await fetchWithAuth(url, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationErrors = result.errors
      ? Object.values(result.errors).flat().join(" ")
      : "";

    throw new Error(
      validationErrors ||
        result.message ||
        `Request gagal dengan status ${response.status}.`
    );
  }

  return result;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value).replace(/[^\d-]/g, "");

  if (!cleaned || cleaned === "-") {
    return 0;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(toNumber(value));
}

function createEmptyRow() {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    cekSaldoId: null,
    namaBank: "",
    saldoBukuBesar: 0,
    saldoRekeningKoran: 0,
  };
}

function normalizeRow(item) {
  return {
    id: item.CekSaldoID,
    cekSaldoId: item.CekSaldoID,
    namaBank: item.NamaBank ?? "",
    saldoBukuBesar: toNumber(item.SaldoBukuBesar),
    saldoRekeningKoran: toNumber(item.SaldoRekeningKoran),
  };
}

function CurrencyInput({
  value,
  onChange,
  readOnly = false,
  disabled = false,
}) {
  return (
    <div
      className={`
        inline-flex h-10 min-w-[190px] w-max max-w-full
        items-center whitespace-nowrap rounded-xl
        border border-[#DCE5EF] px-3
        ${
          readOnly || disabled
            ? "bg-[#F8FAFC]"
            : "bg-white focus-within:border-[#38BDF8]"
        }
      `}
    >
      <span className="shrink-0 text-sm text-[#64748B]">Rp</span>

      {readOnly ? (
        <span className="shrink-0 pl-3 text-sm text-[#64748B]">
          {formatNumber(value)}
        </span>
      ) : (
        <input
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={formatNumber(value)}
          onChange={(event) => {
            const raw = event.target.value.replace(/\D/g, "");
            onChange(raw === "" ? 0 : Number(raw));
          }}
          className="
            min-w-[80px] w-full shrink-0
            bg-transparent pl-3 text-left
            text-sm text-[#475569] outline-none
            disabled:cursor-not-allowed
          "
        />
      )}
    </div>
  );
}

export default function CekSaldoPage({ auditId }) {
  const [setaraKasId, setSetaraKasId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(Boolean(auditId));
  const [saving, setSaving] = useState(false);

  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const [deletePopup, setDeletePopup] = useState({
    isOpen: false,
    rowId: null,
    namaBank: "",
  });

  const showAlert = (message) => {
    setAlert({ show: true, message });
  };

  const hideAlert = () => {
    setAlert({ show: false, message: "" });
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!auditId) {
        setSetaraKasId(null);
        setRows([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setSetaraKasId(null);
      setRows([]);

      try {
        const setaraKas = await getSetaraKas(auditId);
        const resolvedSetaraKasId = setaraKas?.SetaraKasID;

        if (!resolvedSetaraKasId) {
          throw new Error(
            "SetaraKasID tidak ditemukan untuk audit ini."
          );
        }

        if (!isMounted) return;

        setSetaraKasId(resolvedSetaraKasId);

        const result = await apiRequest(
          `${API_ENDPOINT}?SetaraKasID=${encodeURIComponent(
            resolvedSetaraKasId
          )}`
        );

        if (isMounted) {
          setRows(
            Array.isArray(result.data)
              ? result.data.map(normalizeRow)
              : []
          );
        }
      } catch (error) {
        console.error("Gagal mengambil data Cek Saldo:", error);

        if (isMounted) {
          setRows([]);
          setSetaraKasId(null);
          showAlert(
            error.message || "Gagal mengambil data Cek Saldo."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [auditId]);

  const updateRow = (id, field, value) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );

    hideAlert();
  };

  const addRow = () => {
    setRows((current) => [...current, createEmptyRow()]);
    hideAlert();
  };

  const openDeletePopup = (row) => {
    hideAlert();

    setDeletePopup({
      isOpen: true,
      rowId: row.id,
      namaBank: row.namaBank,
    });
  };

  const closeDeletePopup = () => {
    setDeletePopup({
      isOpen: false,
      rowId: null,
      namaBank: "",
    });
  };

  const confirmDelete = async () => {
    const rowId = deletePopup.rowId;

    if (rowId === null || rowId === undefined) {
      return;
    }

    const row = rows.find((item) => item.id === rowId);

    if (!row) {
      closeDeletePopup();
      return;
    }

    if (!row.cekSaldoId) {
      setRows((current) =>
        current.filter((item) => item.id !== rowId)
      );

      closeDeletePopup();
      showAlert("Baris data berhasil dihapus.");
      return;
    }

    setSaving(true);
    hideAlert();

    try {
      await apiRequest(`${API_ENDPOINT}/${row.cekSaldoId}`, {
        method: "DELETE",
      });

      setRows((current) =>
        current.filter((item) => item.id !== rowId)
      );

      closeDeletePopup();

      showAlert(
        row.namaBank
          ? `Data ${row.namaBank} berhasil dihapus.`
          : "Data bank berhasil dihapus."
      );
    } catch (error) {
      console.error("Gagal menghapus data Cek Saldo:", error);
      closeDeletePopup();
      showAlert(
        error.message || "Data Cek Saldo gagal dihapus."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    if (!setaraKasId) {
      showAlert("Data Setara Kas belum tersedia untuk audit ini.");
      return;
    }

    if (rows.length === 0) {
      showAlert("Tambahkan minimal satu baris sebelum menyimpan.");
      return;
    }

    if (rows.some((row) => !row.namaBank.trim())) {
      showAlert("Nama Bank wajib diisi pada setiap baris.");
      return;
    }

    setSaving(true);
    hideAlert();

    try {
      const payload = {
        SetaraKasID: Number(setaraKasId),
        rows: rows.map((row) => ({
          CekSaldoID: row.cekSaldoId ?? null,
          NamaBank: row.namaBank.trim(),
          SaldoBukuBesar: toNumber(row.saldoBukuBesar),
          SaldoRekeningKoran: toNumber(row.saldoRekeningKoran),
        })),
      };

      const result = await apiRequest(
        `${API_ENDPOINT}/bulk-save`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      setRows(
        Array.isArray(result.data)
          ? result.data.map(normalizeRow)
          : []
      );

      showAlert(
        result.message || "Data Cek Saldo berhasil disimpan."
      );
    } catch (error) {
      console.error("Gagal menyimpan data Cek Saldo:", error);
      showAlert(
        error.message || "Data Cek Saldo gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-poppins text-[#334155]">
      {alert.show && (
        <div className="mb-4">
          <AlertSuccess
            key={alert.message}
            message={alert.message}
            onClose={hideAlert}
          />
        </div>
      )}

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">
        <div className="overflow-x-auto rounded-xl border border-[#DCE5EF]">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead className="bg-[#F8FAFC]">
              <tr>
                {[
                  "No",
                  "Nama Bank",
                  "Saldo Buku Besar",
                  "Saldo Rekening Koran",
                  "Selisih",
                  "Aksi",
                ].map((header) => (
                  <th
                    key={header}
                    className="
                      border-b border-[#DCE5EF]
                      px-3 py-3 text-left
                      font-poppins text-[11px]
                      font-semibold uppercase
                      tracking-wide text-[#64748B]
                    "
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="h-[160px] text-center text-sm text-[#94A3B8]"
                  >
                    Memuat data Cek Saldo...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="h-[160px] text-center text-sm text-[#94A3B8]"
                  >
                    Belum ada data. Klik Tambah Data untuk menambahkan baris.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const selisih =
                    toNumber(row.saldoBukuBesar) -
                    toNumber(row.saldoRekeningKoran);

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[#EDF2F7] last:border-b-0"
                    >
                      <td className="px-3 py-2 text-sm text-[#475569]">
                        {index + 1}
                      </td>

                      <td className="min-w-[210px] px-3 py-2">
                        <input
                          type="text"
                          value={row.namaBank}
                          placeholder="Nama bank"
                          disabled={saving}
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "namaBank",
                              event.target.value
                            )
                          }
                          className="
                            h-10 w-full rounded-xl border border-[#DCE5EF]
                            bg-white px-3 text-sm text-[#475569] outline-none
                            transition focus:border-[#38BDF8] disabled:bg-[#F8FAFC]
                          "
                        />
                      </td>

                      <td className="px-3 py-2">
                        <CurrencyInput
                          value={row.saldoBukuBesar}
                          disabled={saving}
                          onChange={(value) =>
                            updateRow(row.id, "saldoBukuBesar", value)
                          }
                        />
                      </td>

                      <td className="px-3 py-2">
                        <CurrencyInput
                          value={row.saldoRekeningKoran}
                          disabled={saving}
                          onChange={(value) =>
                            updateRow(
                              row.id,
                              "saldoRekeningKoran",
                              value
                            )
                          }
                        />
                      </td>

                      <td className="px-3 py-2">
                        <CurrencyInput value={selisih} readOnly />
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            title="Hapus"
                            aria-label={`Hapus data ${
                              row.namaBank || index + 1
                            }`}
                            disabled={saving || loading}
                            onClick={() => openDeletePopup(row)}
                            className="
                              flex h-10 w-10 items-center justify-center rounded-xl
                              border border-[#FECACA] bg-[#FEF2F2] transition-colors
                              hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:opacity-50
                            "
                          >
                            <Trash2
                              size={16}
                              className="text-[#EF4444]"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center">
          <AddDataButton
            onClick={addRow}
            disabled={saving || loading || !setaraKasId}
            label="Tambah Data"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <SaveButton
            onClick={handleSave}
            disabled={saving || loading || !setaraKasId}
            isSaving={saving}
            label="Simpan"
            savingLabel="Menyimpan..."
          />
        </div>
      </div>

      <ConfirmationPopup
        isOpen={deletePopup.isOpen}
        message="Apakah Anda yakin ingin menghapus data ini?"
        subText={
          deletePopup.namaBank
            ? `Data ${deletePopup.namaBank} akan dihapus dari database.`
            : "Data bank ini akan dihapus dari database."
        }
        confirmText="Ya"
        cancelText="Tidak"
        onConfirm={confirmDelete}
        onCancel={closeDeletePopup}
        closeOnBackdrop={!saving}
      />
    </div>
  );
}
