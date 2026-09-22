"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import AlertSuccess from "@/components/alert/alert_success";
import AlertError from "@/components/alert/alert_error";

const parseNumericValue = (value) => {
  if (value === null || value === undefined || value === "") return 0;

  const stringValue = String(value).replace(/[^\d-]/g, "");
  if (!stringValue) return 0;

  return Number(stringValue);
};

const formatNumericValue = (value) => {
  if (value === null || value === undefined || value === "") return "";

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "";

  return numericValue.toLocaleString("id-ID");
};

const createEmptyRow = (index = 1) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}-${index}`,
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

const initialRows = [
  {
    id: "row-1",
    no: 1,
    nama: "BRRIBA",
    satuan: "Unit",
    jumlahMenurutNeraca: "960",
    jumlahMenurutSik: "340",
    jumlahFisik: "380",
    selisihSistemDenganFisik: "40",
    selisihSistemDenganNeraca: "-620",
    keterangan: "",
  },
  {
    id: "row-2",
    no: 2,
    nama: "Nama persediaan",
    satuan: "Unit",
    jumlahMenurutNeraca: "0",
    jumlahMenurutSik: "0",
    jumlahFisik: "0",
    selisihSistemDenganFisik: "0",
    selisihSistemDenganNeraca: "0",
    keterangan: "",
  },
];

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

export default function StokOpnameTab() {
  const [rows, setRows] = useState(initialRows);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddRow = () => {
    setRows((currentRows) => {
      const nextIndex = currentRows.length + 1;
      return [...currentRows, createEmptyRow(nextIndex)];
    });
  };

  const handleFieldChange = (rowId, field, value) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) return row;

        const nextRow = {
          ...row,
          [field]: value,
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
    const row = rows.find((currentRow) => currentRow.id === rowId);

    if (row && isRowEmpty(row)) {
      setRows((currentRows) =>
        currentRows
          .filter((currentRow) => currentRow.id !== rowId)
          .map((currentRow, index) => ({ ...currentRow, no: index + 1 }))
      );
      setSuccessMessage("Baris kosong berhasil dihapus.");
      setErrorMessage("");
      return;
    }

    setDeleteRowId(rowId);
  };

  const confirmDeleteRow = () => {
    const rowId = deleteRowId;

    if (!rowId) {
      setErrorMessage("Tidak ada baris yang dipilih untuk dihapus.");
      setDeleteRowId(null);
      return;
    }

    setRows((currentRows) => {
      const filteredRows = currentRows
        .filter((row) => row.id !== rowId)
        .map((row, index) => ({ ...row, no: index + 1 }));
      return filteredRows;
    });

    setDeleteRowId(null);
    setSuccessMessage("Baris berhasil dihapus.");
    setErrorMessage("");
  };

  const handleSave = () => {
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

    console.log("Stok opname data:", rows);
    setSuccessMessage("Data stok opname berhasil disimpan.");
    setErrorMessage("");
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
                key={row.id}
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
                    handleFieldChange(row.id, "nama", event.target.value)
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
                    handleFieldChange(row.id, "satuan", event.target.value)
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
                      row.id,
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
                      row.id,
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
                    handleFieldChange(row.id, "jumlahFisik", event.target.value)
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
                    handleFieldChange(row.id, "keterangan", event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-[#DCE5EF] bg-white px-3 font-poppins text-sm text-[#475569] text-left outline-none transition focus:border-[#38BDF8]"
                  placeholder="Keterangan"
                />
              </div>

              <div className="flex h-10 items-center justify-center px-1">
                <button
                  type="button"
                  aria-label={`Hapus baris ${index + 1}`}
                  onClick={() => handleDeleteRow(row.id)}
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
          <AddDataButton onClick={handleAddRow} />
        </div>

        {rows.length > 0 && (
          <div className="mt-5 flex justify-end">
            <SaveButton onClick={handleSave} />
          </div>
        )}
      </div>
    </>
  );
}
