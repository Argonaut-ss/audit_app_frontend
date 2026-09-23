"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";

import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import AlertSuccess from "@/components/alert/alert_success";
import AlertError from "@/components/alert/alert_error";
import { getPersediaan } from "@/services/mahasiswa/tugas/audit/persediaan/persediaan";
import {
  deleteStokOpnamePersediaan,
  getStokOpnamePersediaan,
  saveStokOpnamePersediaan,
} from "@/services/mahasiswa/tugas/audit/persediaan/stok_opname/stok_opname";

const parseNumericValue = (value) => {
  if (value === null || value === undefined || value === "") return 0;

  const stringValue = String(value).replace(/[^\d-]/g, "");
  if (!stringValue) return 0;

  return Number(stringValue);
};

const normalizeNumericInput = (value) => String(value ?? "").replace(/\D/g, "");

const formatNumericValue = (value) => {
  if (value === null || value === undefined || value === "") return "";

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "";

  return numericValue.toLocaleString("id-ID");
};

const createEmptyRow = (index = 1) => ({
  id: null,
  clientId: `${Date.now()}-${Math.random().toString(16).slice(2)}-${index}`,
  no: index,
  nama: "",
  satuan: "",
  jumlahMenurutNeraca: "",
  jumlahMenurutSik: "",
  jumlahFisik: "",
  selisihSistemDenganFisik: "",
  selisihSistemDenganNeraca: "",
  keterangan: "",
});

const headerLabels = [
  "No",
  "Nama Persediaan",
  "Satuan",
  "Saldo Menurut Neraca",
  "Jumlah Sistem",
  "Jumlah Fisik",
  "Selisih Sistem Dengan Fisik",
  "Selisih Sistem Dengan Neraca",
  "Keterangan",
  "Aksi",
];

const headerWidths = [
  "56px",
  "minmax(170px, 1.8fr)",
  "100px",
  "120px",
  "120px",
  "120px",
  "120px",
  "120px",
  "170px",
  "52px",
];

const tableColumns = headerWidths.join(" ");
const editableRowFields = [
  "nama",
  "satuan",
  "jumlahMenurutNeraca",
  "jumlahMenurutSik",
  "jumlahFisik",
  "keterangan",
];

const isRowEmpty = (row) =>
  editableRowFields.every(
    (field) => String(row?.[field] ?? "").trim() === ""
  );

const normalizeRow = (item, index) => ({
  id: item.StokOpnameID,
  clientId: `saved-${item.StokOpnameID}`,
  no: index + 1,
  nama: item.NamaPersediaan ?? "",
  satuan: item.Satuan ?? "",
  jumlahMenurutNeraca: String(item.SaldoNeraca ?? ""),
  jumlahMenurutSik: String(item.JumlahSistem ?? ""),
  jumlahFisik: String(item.JumlahFisik ?? ""),
  selisihSistemDenganFisik: String(item.SelisihFisik ?? "0"),
  selisihSistemDenganNeraca: String(item.SelisihSistem ?? "0"),
  keterangan: item.Keterangan ?? "",
});

export default function StokOpnameTab() {
  const { id: auditId } = useParams();
  const [persediaanId, setPersediaanId] = useState(null);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(auditId));
  const [isSaving, setIsSaving] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!auditId) {
      setIsLoading(false);
      setErrorMessage("Persediaan ID tidak tersedia.");
      return undefined;
    }

    let isMounted = true;

    getPersediaan(auditId)
      .then((persediaan) => {
        if (!isMounted) return null;

        const resolvedPersediaanId = persediaan?.PersediaanID ?? null;
        setPersediaanId(resolvedPersediaanId);

        if (!resolvedPersediaanId) {
          throw new Error("Data persediaan tidak tersedia.");
        }

        return getStokOpnamePersediaan(resolvedPersediaanId);
      })
      .then((items) => {
        if (isMounted && items) setRows(items.map(normalizeRow));
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error.response?.data?.message ?? error.message ?? "Data stok opname gagal dimuat.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [auditId]);

  const handleAddRow = () => {
    setRows((currentRows) => {
      const nextIndex = currentRows.length + 1;
      return [...currentRows, createEmptyRow(nextIndex)];
    });
  };

  const handleFieldChange = (rowId, field, value) => {
    const nextFieldValue = [
      "jumlahMenurutNeraca",
      "jumlahMenurutSik",
      "jumlahFisik",
    ].includes(field)
      ? normalizeNumericInput(value)
      : value;

    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.clientId !== rowId) return row;

        const nextRow = {
          ...row,
          [field]: nextFieldValue,
        };

        const jumlahSistem = parseNumericValue(nextRow.jumlahMenurutSik);
        const jumlahFisik = parseNumericValue(nextRow.jumlahFisik);
        const saldoNeraca = parseNumericValue(nextRow.jumlahMenurutNeraca);

        nextRow.selisihSistemDenganFisik =
          jumlahFisik - jumlahSistem === 0
            ? "0"
            : String(jumlahFisik - jumlahSistem);

        nextRow.selisihSistemDenganNeraca =
          jumlahSistem - saldoNeraca === 0
            ? "0"
            : String(jumlahSistem - saldoNeraca);

        return nextRow;
      })
    );
  };

  const handleDeleteRow = (rowId) => {
    const row = rows.find((currentRow) => currentRow.clientId === rowId);

    if (row && isRowEmpty(row)) {
      setRows((currentRows) =>
        currentRows
          .filter((currentRow) => currentRow.clientId !== rowId)
          .map((currentRow, index) => ({ ...currentRow, no: index + 1 }))
      );
      setSuccessMessage("Baris kosong berhasil dihapus.");
      setErrorMessage("");
      return;
    }

    setDeleteRowId(rowId);
  };

  const confirmDeleteRow = async () => {
    const rowId = deleteRowId;
    const row = rows.find((currentRow) => currentRow.clientId === rowId);

    if (!rowId) {
      setErrorMessage("Tidak ada baris yang dipilih untuk dihapus.");
      setDeleteRowId(null);
      return;
    }

    try {
      if (row?.id) await deleteStokOpnamePersediaan(row.id);

      setRows((currentRows) => currentRows
        .filter((currentRow) => currentRow.clientId !== rowId)
        .map((currentRow, index) => ({ ...currentRow, no: index + 1 })));
      setDeleteRowId(null);
      setSuccessMessage("Baris berhasil dihapus.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? "Baris gagal dihapus.");
      setDeleteRowId(null);
    }
  };

  const handleSave = async () => {
    if (!persediaanId) {
      setErrorMessage("Data persediaan belum tersedia untuk disimpan.");
      return;
    }

    if (isLoading || isSaving) return;

    const hasEmptyRow = rows.some(isRowEmpty);

    if (hasEmptyRow) {
      setErrorMessage(
        "Data stok opname belum lengkap. Hapus atau isi semua baris kosong sebelum menyimpan."
      );
      setSuccessMessage("");
      return;
    }

    const hasValidData = rows.some((row) => {
      const nama = String(row.nama || "").trim();
      const satuan = String(row.satuan || "").trim();
      const jumlahNeraca = String(row.jumlahMenurutNeraca || "").trim();
      const jumlahSik = String(row.jumlahMenurutSik || "").trim();
      const jumlahFisik = String(row.jumlahFisik || "").trim();

      return (
        nama ||
        satuan ||
        jumlahNeraca ||
        jumlahSik ||
        jumlahFisik
      );
    });

    if (!hasValidData) {
      setErrorMessage("Data stok opname belum diisi. Silakan isi minimal satu baris.");
      setSuccessMessage("");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payloadRows = rows.map((row) => ({
        id: row.id,
        NamaPersediaan: row.nama.trim() || null,
        Satuan: row.satuan.trim() || null,
        SaldoNeraca: parseNumericValue(row.jumlahMenurutNeraca),
        JumlahSistem: parseNumericValue(row.jumlahMenurutSik),
        JumlahFisik: parseNumericValue(row.jumlahFisik),
        Keterangan: row.keterangan.trim() || null,
      }));
      const savedRows = await saveStokOpnamePersediaan(persediaanId, payloadRows);
      setRows(savedRows.map(normalizeRow));
      setSuccessMessage("Data stok opname berhasil disimpan.");
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? "Data stok opname gagal disimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ConfirmationPopup
        isOpen={Boolean(deleteRowId)}
        message="Hapus baris ini?"
        subText="Data yang dihapus tidak dapat dikembalikan."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDeleteRow}
        onCancel={() => setDeleteRowId(null)}
        onClose={() => setDeleteRowId(null)}
      />

      <AlertSuccess
        message={successMessage}
        title="Berhasil"
        onClose={() => setSuccessMessage("")}
      />

      <AlertError
        message={errorMessage}
        title="Gagal"
        onClose={() => setErrorMessage("")}
      />

      <div className="px-0 pb-4 pt-4">
        {rows.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-[#DCE5EF] bg-white">
            <div className="min-w-max">
          <div
            style={{ gridTemplateColumns: tableColumns }}
            className="grid min-w-max items-stretch border-b border-[#DCE5EF] bg-[#F8FAFC] px-2 py-2"
          >
            {headerLabels.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="flex min-h-[38px] items-center justify-start whitespace-normal break-words px-1 text-left font-poppins text-[10px] font-semibold uppercase leading-[1.15] text-[#64748B]"
                style={{ width: headerWidths[index] }}
              >
                {label}
              </div>
            ))}
          </div>

            {rows.map((row, index) => (
              <div
                key={row.clientId}
                style={{ gridTemplateColumns: tableColumns }}
                className="grid min-w-max items-center border-b border-[#EEF2F6] px-2 py-2 last:border-b-0"
              >
              <div className="flex h-10 items-center justify-center px-1 font-poppins text-sm text-[#64748B]">
                {index + 1}
              </div>

              <div className="px-1">
                <input
                  type="text"
                  value={row.nama}
                  onChange={(event) =>
                    handleFieldChange(row.clientId, "nama", event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] text-left outline-none transition focus:border-[#38BDF8]"
                  placeholder="Nama persediaan"
                />
              </div>

              <div className="px-1">
                <input
                  type="text"
                  value={row.satuan}
                  onChange={(event) =>
                    handleFieldChange(row.clientId, "satuan", event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] text-left outline-none transition focus:border-[#38BDF8]"
                  placeholder="Unit"
                />
              </div>

              <div className="px-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNumericValue(row.jumlahMenurutNeraca)}
                  onChange={(event) =>
                    handleFieldChange(
                      row.clientId,
                      "jumlahMenurutNeraca",
                      event.target.value
                    )
                  }
                  className="h-10 w-full rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] text-left outline-none transition focus:border-[#38BDF8]"
                />
              </div>

              <div className="px-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNumericValue(row.jumlahMenurutSik)}
                  onChange={(event) =>
                    handleFieldChange(
                      row.clientId,
                      "jumlahMenurutSik",
                      event.target.value
                    )
                  }
                  className="h-10 w-full rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] text-left outline-none transition focus:border-[#38BDF8]"
                />
              </div>

              <div className="px-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNumericValue(row.jumlahFisik)}
                  onChange={(event) =>
                    handleFieldChange(row.clientId, "jumlahFisik", event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] text-left outline-none transition focus:border-[#38BDF8]"
                />
              </div>

              <div className="px-1">
                <input
                  type="text"
                  value={formatNumericValue(row.selisihSistemDenganFisik)}
                  readOnly
                  className="h-10 w-full rounded-md border border-[#DCE5EF] bg-[#F1F5F9] px-3 font-poppins text-sm text-[#475569] text-left outline-none"
                />
              </div>

              <div className="px-1">
                <input
                  type="text"
                  value={formatNumericValue(row.selisihSistemDenganNeraca)}
                  readOnly
                  className="h-10 w-full rounded-md border border-[#DCE5EF] bg-[#F1F5F9] px-3 font-poppins text-sm text-[#475569] text-left outline-none"
                />
              </div>

              <div className="px-1">
                <input
                  type="text"
                  value={row.keterangan}
                  onChange={(event) =>
                    handleFieldChange(row.clientId, "keterangan", event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] text-left outline-none transition focus:border-[#38BDF8]"
                  placeholder="Keterangan"
                />
              </div>

              <div className="flex h-10 items-center justify-center px-1">
                <button
                  type="button"
                  aria-label={`Hapus baris ${index + 1}`}
                  onClick={() => handleDeleteRow(row.clientId)}
                  className="rounded p-1 text-[#F87171] transition hover:bg-[#FEF2F2]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              </div>
            ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[170px] items-center justify-center rounded-lg border border-[#DCE5EF] bg-white px-6 text-center">
            <p className="font-poppins text-sm font-medium text-[#64748B]">
              Tidak ada stok opname
            </p>
          </div>
        )}

        <div className={`${rows.length > 0 ? "mt-5" : "mt-4"} flex justify-center`}>
          <AddDataButton onClick={handleAddRow} disabled={isLoading || isSaving || !persediaanId} />
        </div>

        {rows.length > 0 && (
          <div className="mt-5 flex justify-end">
            <SaveButton onClick={handleSave} disabled={isLoading || isSaving} isSaving={isSaving} />
          </div>
        )}
      </div>
    </>
  );
}
