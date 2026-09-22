"use client";

import { useEffect, useState } from "react";

import {
  User,
  CalendarDays,
  Plus,
  Trash2,
  Check,
} from "lucide-react";

import {
  getPersediaan,
} from "@/services/mahasiswa/tugas/audit/persediaan/persediaan";

import useProsedur from "@/hooks/mahasiswa/tugas/audit/pengujian_substantif/persediaan/prosedur/use_prosedur";

import AlertSuccess from "@/components/alert/alert_success";
import AlertError from "@/components/alert/alert_error";
import ConfirmationPopup from "@/components/popup/confirmation_popup"

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const DEFAULT_DATE = getTodayDate();

function normalizeDate(value) {
  if (!value) {
    return DEFAULT_DATE;
  }

  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // Format MM/DD/YYYY
  const slashParts = value.split("/");

  if (slashParts.length === 3) {
    const [month, day, year] = slashParts;

    if (
      month.length === 2 &&
      day.length === 2 &&
      year.length === 4
    ) {
      return `${year}-${month}-${day}`;
    }
  }

  return DEFAULT_DATE;
}

function createEmptyRow(no) {
  return {
    no,
    prosedur: "",
    index: `C.${no}`,
    tanggal: DEFAULT_DATE,
    checklist: false,
  };
}

export default function ProsedurTab({ auditId }) {

  const [persediaanId, setPersediaanId] = useState(null);
  const [isPersediaanLoading, setIsPersediaanLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [kesimpulan, setKesimpulan] = useState("");

  const [alert, setAlert] = useState({
    type: null,
    message: "",
  });

  const showSuccess = (message) => {
    setAlert({
      type: "success",
      message,
    });
  };

  const showError = (message) => {
    setAlert({
      type: "error",
      message,
    });
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchPersediaan = async () => {
      if (!auditId) {
        setIsPersediaanLoading(false);
        return;
      }

      try {
        setIsPersediaanLoading(true);

        const data = await getPersediaan(auditId);

        console.log("DATA PERSEDIAAN:", data);

        setPersediaanId(data?.PersediaanID ?? null);
        setKesimpulan(data?.Kesimpulan ?? "");
      } catch (error) {
        console.error("Gagal mengambil data persediaan:", error);
        setPersediaanId(null);
        setKesimpulan("");
      } finally {
        setIsPersediaanLoading(false);
      }
    };

    fetchPersediaan();
  }, [auditId]);

  const {
    prosedurList,
    isLoading,
    handleBulkSave,
    handleDelete,
    isSaving,
  } = useProsedur({
    persediaanId,
  });

  useEffect(() => {
    const mappedRows = prosedurList.map((item, index) => ({
      id: item.id,
      no: index + 1,
      prosedur: item.prosedur ?? "",
      index: item.index ?? `C.${index + 1}`,
      tanggal: normalizeDate(item.tanggal),
      checklist: item.checklist ?? false,
    }));

    setRows(mappedRows);
  }, [prosedurList]);

  // ============================
  // HANDLE ROW CHANGE
  // ============================

  const handleRowChange = (no, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.no === no
          ? {
            ...row,
            [field]: value,
          }
          : row
      )
    );
  };

  // ============================
  // HANDLE ADD ROW
  // ============================

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      createEmptyRow(prev.length + 1),
    ]);
  };

  // ============================
  // HANDLE DELETE ROW
  // ============================

  const handleDeleteRow = async (no) => {
    const row = rows.find((item) => item.no === no);

    if (!row) {
      return;
    }

    if (row.id) {
      const result = await handleDelete(row.id);

      if (!result.success) {
        showError(result.message);
        return;
      }

      showSuccess("Data prosedur berhasil dihapus.");
      setDeleteTarget(null);
      return;
    }

    setRows((prev) => {
      const filteredRows = prev.filter(
        (item) => item.no !== no
      );

      return filteredRows.map((item, index) => ({
        ...item,
        no: index + 1,
        index:
          item.index?.trim() === `C.${no}`
            ? `C.${index + 1}`
            : item.index,
      }));
    });

    showSuccess("Data prosedur berhasil dihapus.");
    setDeleteTarget(null);
  };

  const validateRow = (row) => {
    if (!row.prosedur?.trim()) {
      return `Prosedur pada data nomor ${row.no} wajib diisi.`;
    }

    if (!row.tanggal) {
      return `Tanggal pada data nomor ${row.no} wajib diisi.`;
    }

    return null;
  };

  // ============================
  // HANDLE SAVE
  // ============================

  const handleSave = async () => {
    if (rows.length === 0) {
      showError("Belum ada data prosedur yang ditambahkan.");
      return;
    }

    for (const row of rows) {
      const validationError = validateRow(row);

      if (validationError) {
        showError(validationError);
        return;
      }
    }

    try {
      const prosedurs = rows.map((row) => ({
        id: row.id ?? null,
        nama_prosedur: row.prosedur.trim(),
        index: row.index?.trim() || null,
        tanggal: row.tanggal,
        checkbox: Boolean(row.checklist),
      }));

      const result = await handleBulkSave({
        Kesimpulan: kesimpulan?.trim() || null,
        prosedurs,
      });

      if (!result.success) {
        showError(result.message);
        return;
      }

      showSuccess("Data prosedur dan kesimpulan berhasil disimpan.");
    } catch (error) {
      console.error("Gagal menyimpan data:", error);

      showError(
        error.response?.data?.message ||
        "Gagal menyimpan data prosedur."
      );
    }
  };

  if (isPersediaanLoading) {
    return (
      <div className="flex justify-center py-10">
        <span className="font-poppins text-sm text-[#64748B]">
          Memuat data persediaan...
        </span>
      </div>
    );
  }

  if (!persediaanId) {
    return (
      <div className="py-10 text-center">
        <span className="font-poppins text-sm text-[#64748B]">
          Data persediaan tidak ditemukan.
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <span className="font-poppins text-sm text-[#64748B]">
          Memuat data prosedur...
        </span>
      </div>
    );
  }

  return (
    <div>
      <ConfirmationPopup
        isOpen={!!deleteTarget}
        message="Hapus data prosedur?"
        subText={
          deleteTarget
            ? `Prosedur "${deleteTarget.prosedur || "ini"}" akan dihapus.`
            : ""
        }
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={() => {
          if (deleteTarget) {
            handleDeleteRow(deleteTarget.no);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {alert.type === "success" && (
        <AlertSuccess
          message={alert.message}
          onClose={() =>
            setAlert({
              type: null,
              message: "",
            })
          }
        />
      )}

      {alert.type === "error" && (
        <AlertError
          message={alert.message}
          onClose={() =>
            setAlert({
              type: null,
              message: "",
            })
          }
        />
      )}
      {/* ================= INFO AKUN ================= */}

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* NAMA AKUN */}
          <div>
            <label className="mb-2 block font-poppins text-[11px] font-semibold text-[#475569]">
              Nama Akun
            </label>

            <div className="flex h-12 items-center gap-3 rounded-xl border border-[#DCE5EF] bg-[#F8FAFC] px-4">
              <User
                size={16}
                strokeWidth={1.8}
                className="text-[#64748B]"
              />

              <span className="font-poppins text-sm text-[#64748B]">
                Persediaan
              </span>
            </div>
          </div>

          {/* KODE AKUN */}
          <div>
            <label className="mb-2 block font-poppins text-[11px] font-semibold text-[#475569]">
              Kode Akun
            </label>

            <div className="flex h-12 items-center gap-3 rounded-xl border border-[#DCE5EF] bg-[#F8FAFC] px-4">
              <CalendarDays
                size={16}
                strokeWidth={1.8}
                className="text-[#64748B]"
              />

              <span className="font-poppins text-sm text-[#64748B]">
                1-1300
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="mt-4 overflow-hidden rounded-xl border border-[#DCE5EF]">
        {/* HEADER */}
        <div
          className="
            grid
            grid-cols-[55px_minmax(350px,1fr)_130px_190px_100px_70px]
            border-b
            border-[#DCE5EF]
            bg-[#F8FAFC]
            px-4
            py-3
          "
        >
          <div className="font-poppins text-[11px] font-semibold text-[#64748B]">
            NO
          </div>

          <div className="font-poppins text-[11px] font-semibold text-[#64748B]">
            PROSEDUR
          </div>

          <div className="font-poppins text-[11px] font-semibold text-[#64748B]">
            INDEX
          </div>

          <div className="font-poppins text-[11px] font-semibold text-[#64748B]">
            TANGGAL
          </div>

          <div className="text-center font-poppins text-[11px] font-semibold text-[#64748B]">
            CHECKLIST
          </div>

          <div className="text-center font-poppins text-[11px] font-semibold text-[#64748B]">
            AKSI
          </div>
        </div>

        {/* BODY */}
        {rows.map((item) => (
          <div
            key={item.no}
            className="
              grid
              grid-cols-[55px_minmax(350px,1fr)_130px_190px_100px_70px]
              items-center
              border-b
              border-[#EEF2F6]
              px-4
              py-2
              last:border-b-0
            "
          >
            {/* NO */}
            <div className="font-poppins text-sm text-[#475569]">
              {item.no}
            </div>

            {/* PROSEDUR */}
            <div className="pr-5">
              <input
                type="text"
                value={item.prosedur}
                onChange={(event) =>
                  handleRowChange(
                    item.no,
                    "prosedur",
                    event.target.value
                  )
                }
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-[#DCE5EF]
                  bg-white
                  px-3
                  font-poppins
                  text-sm
                  text-[#475569]
                  outline-none
                  transition
                  focus:border-[#38BDF8]
                "
              />
            </div>

            {/* INDEX */}
            <div>
              <input
                type="text"
                value={item.index}
                onChange={(event) =>
                  handleRowChange(
                    item.no,
                    "index",
                    event.target.value
                  )
                }
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-[#DCE5EF]
                  bg-white
                  px-3
                  font-poppins
                  text-sm
                  text-[#475569]
                  outline-none
                  transition
                  focus:border-[#38BDF8]
                "
              />
            </div>

            {/* TANGGAL */}
            <div className="pl-2">
              <input
                type="date"
                value={item.tanggal}
                onChange={(event) =>
                  handleRowChange(
                    item.no,
                    "tanggal",
                    event.target.value
                  )
                }
                className="
                  h-10
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-[#DCE5EF]
                  bg-white
                  px-3
                  font-poppins
                  text-sm
                  text-[#475569]
                  outline-none
                  transition
                  focus:border-[#38BDF8]
                "
              />
            </div>

            {/* CHECKLIST */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() =>
                  handleRowChange(
                    item.no,
                    "checklist",
                    !item.checklist
                  )
                }
                className={`
      flex
      h-5
      w-5
      items-center
      justify-center
      rounded-md
      border
      transition
      ${item.checklist
                    ? "border-[#38BDF8] bg-[#38BDF8]"
                    : "border-[#CBD5E1] bg-white hover:border-[#38BDF8]"
                  }
    `}
                aria-label={
                  item.checklist
                    ? `Checklist prosedur ${item.no} selesai`
                    : `Checklist prosedur ${item.no} belum selesai`
                }
              >
                {item.checklist && (
                  <Check
                    size={13}
                    strokeWidth={3}
                    className="text-white"
                  />
                )}
              </button>
            </div>

            {/* AKSI */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                className="
                  text-[#EF4444]
                  transition
                  hover:scale-110
                "
                aria-label={`Hapus prosedur ${item.no}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= TAMBAH DATA ================= */}

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={handleAddRow}
          className="
            flex
            items-center
            gap-2
            rounded-lg
            bg-[#32C5FF]
            px-6
            py-2.5
            font-poppins
            text-sm
            font-medium
            text-white
            transition
            hover:bg-[#279ECD]
          "
        >
          <Plus size={15} />
          Tambah Data
        </button>
      </div>

      {/* ================= KESIMPULAN ================= */}

      <div className="mt-5">
        <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
          Kesimpulan
        </label>

        <textarea
          rows={3}
          value={kesimpulan}
          onChange={(event) =>
            setKesimpulan(event.target.value)
          }
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-[#DCE5EF]
            bg-[#F8FAFC]
            p-4
            font-poppins
            text-sm
            text-[#64748B]
            outline-none
            transition
            focus:border-[#38BDF8]
          "
        />
      </div>

      {/* ================= BUTTON ================= */}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="
            rounded-lg
            bg-[#05A80B]
            px-6
            py-2.5
            font-poppins
            text-sm
            font-medium
            text-white
            transition
            hover:bg-[#04930A]
          "
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  );
}