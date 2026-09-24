"use client";

import { useEffect, useMemo, useState } from "react";
// import { Trash2 } from "lucide-react"; // dipakai jika fitur hapus baris diaktifkan

import SaveButton from "@/components/button/save_button";
import AddDataButton from "@/components/button/add_data_button";
import Dropdown from "@/components/ui/dropdown/dropdown";
import AlertSuccess from "@/components/alert/alert_success";
import AlertError from "@/components/alert/alert_error";
import { getPersediaan } from "@/services/mahasiswa/tugas/audit/persediaan/persediaan";
import { getStokOpnamePersediaan } from "@/services/mahasiswa/tugas/audit/persediaan/stok_opname/stok_opname";
import {
  getTestPricingPersediaan,
  saveTestPricingPersediaan,
  // deleteTestPricingPersediaan, // dipakai jika fitur hapus baris diaktifkan
} from "@/services/mahasiswa/tugas/audit/persediaan/test_pricing/test_pricing";

let nextClientKey = 0;

/* =====================================================
   INITIAL DATA
===================================================== */

const initialPricingRows = [
  {
    id: 1,
    jenisPersediaan: "BRR18A",
    satuan: "Unit",
    hargaAudit: 850000,
    kuantitasAudit: 380,
    hargaPerusahaan: 850000,
    kuantitasPerusahaan: 340,
  },
  {
    id: 2,
    jenisPersediaan: "DUR18D",
    satuan: "Unit",
    hargaAudit: 850000,
    kuantitasAudit: 105,
    hargaPerusahaan: 850000,
    kuantitasPerusahaan: 110,
  },
  {
    id: 3,
    jenisPersediaan: "GRR16G",
    satuan: "Unit",
    hargaAudit: 860000,
    kuantitasAudit: 300,
    hargaPerusahaan: 860000,
    kuantitasPerusahaan: 250,
  },
  {
    id: 4,
    jenisPersediaan: "YHR20Y",
    satuan: "Unit",
    hargaAudit: 880000,
    kuantitasAudit: 118,
    hargaPerusahaan: 880000,
    kuantitasPerusahaan: 120,
  },
  {
    id: 5,
    jenisPersediaan: "DRR12D",
    satuan: "Unit",
    hargaAudit: 700000,
    kuantitasAudit: 100,
    hargaPerusahaan: 700000,
    kuantitasPerusahaan: 100,
  },
  {
    id: 6,
    jenisPersediaan: "DRR12E",
    satuan: "Unit",
    hargaAudit: 750000,
    kuantitasAudit: 65,
    hargaPerusahaan: 750000,
    kuantitasPerusahaan: 65,
  },
  {
    id: 7,
    jenisPersediaan: "AUR13A",
    satuan: "Unit",
    hargaAudit: 800000,
    kuantitasAudit: 63,
    hargaPerusahaan: 800000,
    kuantitasPerusahaan: 65,
  },
  {
    id: 8,
    jenisPersediaan: "AUR13B",
    satuan: "Unit",
    hargaAudit: 850000,
    kuantitasAudit: 198,
    hargaPerusahaan: 850000,
    kuantitasPerusahaan: 200,
  },
  {
    id: 9,
    jenisPersediaan: "CRR14C",
    satuan: "Unit",
    hargaAudit: 870000,
    kuantitasAudit: 388,
    hargaPerusahaan: 870000,
    kuantitasPerusahaan: 390,
  },
  {
    id: 10,
    jenisPersediaan: "CRR14F",
    satuan: "Unit",
    hargaAudit: 880000,
    kuantitasAudit: 146,
    hargaPerusahaan: 880000,
    kuantitasPerusahaan: 150,
  },
  {
    id: 11,
    jenisPersediaan: "GUR15G",
    satuan: "Unit",
    hargaAudit: 900000,
    kuantitasAudit: 378,
    hargaPerusahaan: 900000,
    kuantitasPerusahaan: 378,
  },
  {
    id: 12,
    jenisPersediaan: "GUR15H",
    satuan: "Unit",
    hargaAudit: 920000,
    kuantitasAudit: 592,
    hargaPerusahaan: 920000,
    kuantitasPerusahaan: 592,
  },
  {
    id: 13,
    jenisPersediaan: "DUR16D",
    satuan: "Unit",
    hargaAudit: 845000,
    kuantitasAudit: 43,
    hargaPerusahaan: 845000,
    kuantitasPerusahaan: 45,
  },
  {
    id: 14,
    jenisPersediaan: "BRR18A",
    satuan: "Unit",
    hargaAudit: 1,
    kuantitasAudit: 1,
    hargaPerusahaan: 1,
    kuantitasPerusahaan: 1,
  },
];

/* =====================================================
   FORMAT
===================================================== */

const formatRupiah = (value) => {
  const number = Number(value || 0);

  return `Rp ${number.toLocaleString("id-ID")}`;
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  return number.toLocaleString("id-ID");
};

/* =====================================================
   PAGE
===================================================== */

const normalizePricingRow = (item) => ({
  clientKey: `saved-${item.TestPricingID}`,
  id: item.TestPricingID,
  stokOpnameId: item.StokOpnameID,
  jenisPersediaan: item.NamaPersediaan ?? "",
  satuan: item.Satuan ?? "",
  hargaAudit: Number(item.HargaAudit ?? 0),
  kuantitasAudit: Number(item.KuantitasAudit ?? 0),
  hargaPerusahaan: Number(item.HargaPerusahaan ?? 0),
  kuantitasPerusahaan: Number(item.KuantitasPerusahaan ?? 0),
  jumlahAudit: Number(item.JumlahAudit ?? 0),
  jumlahPerusahaan: Number(item.JumlahPerusahaan ?? 0),
  selisih: Number(item.Selisih ?? 0),
});

// Baris baru (belum tersimpan): id null, StokOpnameID dipilih via dropdown.
const createEmptyPricingRow = () => ({
  clientKey: `new-${++nextClientKey}`,
  id: null,
  stokOpnameId: null,
  jenisPersediaan: "",
  satuan: "",
  hargaAudit: 0,
  kuantitasAudit: 0,
  hargaPerusahaan: 0,
  kuantitasPerusahaan: 0,
  jumlahAudit: 0,
  jumlahPerusahaan: 0,
  selisih: 0,
});

export default function TestPricingTable({ auditId, refetchToken = 0 }) {
  const [persediaanId, setPersediaanId] = useState(null);
  const [rows, setRows] = useState(auditId ? [] : initialPricingRows);
  const [stokOpnameOptions, setStokOpnameOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(auditId));
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [showSuccessAlert, setShowSuccessAlert] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!auditId) {
      setIsLoading(false);
      setErrorMessage("Audit ID tidak tersedia.");
      return undefined;
    }

    let isMounted = true;

    setIsLoading(true);
    setErrorMessage("");

    getPersediaan(auditId)
      .then((persediaan) => {
        if (!isMounted) return null;

        const resolvedPersediaanId = persediaan?.PersediaanID ?? null;
        setPersediaanId(resolvedPersediaanId);

        if (!resolvedPersediaanId) {
          throw new Error("Data persediaan tidak tersedia.");
        }

        // Ambil data test pricing + daftar stok opname (untuk opsi dropdown baris baru).
        return Promise.all([
          getTestPricingPersediaan(resolvedPersediaanId),
          getStokOpnamePersediaan(resolvedPersediaanId),
        ]);
      })
      .then((result) => {
        if (!isMounted || !result) return;

        const [items, stokOpnameList] = result;

        if (items) setRows(items.map(normalizePricingRow));

        setStokOpnameOptions(
          (stokOpnameList ?? []).map((item) => ({
            value: String(item.StokOpnameID),
            label: item.NamaPersediaan || `Stok Opname #${item.StokOpnameID}`,
            satuan: item.Satuan ?? "",
          }))
        );
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(
          error.response?.data?.message ??
            error.message ??
            "Data test pricing gagal dimuat."
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
    // refetchToken naik saat Stok Opname disimpan -> memicu fetch ulang data turunan.
  }, [auditId, refetchToken]);

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleInputChange = (clientKey, field, value) => {
    const isNumericField = [
      "hargaAudit",
      "kuantitasAudit",
      "hargaPerusahaan",
      "kuantitasPerusahaan",
    ].includes(field);

    if (!isNumericField) {
      return;
    }

    const numericValue = String(value).replace(
      /[^\d]/g,
      ""
    );

    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.clientKey !== clientKey) {
          return row;
        }

        return {
          ...row,

          [field]:
            numericValue === ""
              ? 0
              : Number(numericValue),
        };
      })
    );
  };

  /* =====================================================
     TAMBAH BARIS BARU (Test Pricing 1:banyak)
  ===================================================== */

  const handleAddRow = () => {
    setRows((currentRows) => [...currentRows, createEmptyPricingRow()]);
  };

  // Pilih persediaan (Stok Opname) untuk baris baru -> isi StokOpnameID, nama & satuan.
  const handleStokOpnameChange = (clientKey, stokOpnameValue) => {
    const option = stokOpnameOptions.find(
      (opt) => opt.value === String(stokOpnameValue)
    );

    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.clientKey !== clientKey) return row;

        return {
          ...row,
          stokOpnameId: stokOpnameValue ? Number(stokOpnameValue) : null,
          jenisPersediaan: option?.label ?? "",
          satuan: option?.satuan ?? "",
        };
      })
    );
  };

  // Hapus baris — aktifkan jika fitur delete diperlukan.
  // const handleDeleteRow = async (row) => {
  //   try {
  //     if (row.id) await deleteTestPricingPersediaan(row.id);
  //     setRows((currentRows) =>
  //       currentRows.filter((item) => item.clientKey !== row.clientKey)
  //     );
  //   } catch (error) {
  //     setErrorMessage(
  //       error.response?.data?.message ?? "Baris test pricing gagal dihapus."
  //     );
  //   }
  // };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      row.jenisPersediaan
        .toLowerCase()
        .includes(query)
    );
  }, [rows, searchTerm]);

  /* =====================================================
     CALCULATION
  ===================================================== */

  const calculatedRows = useMemo(() => {
    return filteredRows.map((row) => {
      const jumlahAudit =
        Number(row.hargaAudit || 0) *
        Number(row.kuantitasAudit || 0);

      const jumlahPerusahaan =
        Number(row.hargaPerusahaan || 0) *
        Number(row.kuantitasPerusahaan || 0);

      const selisih =
        jumlahAudit - jumlahPerusahaan;

      return {
        ...row,
        jumlahAudit,
        jumlahPerusahaan,
        selisih,
      };
    });
  }, [filteredRows]);

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = async () => {
    if (!persediaanId || isLoading || isSaving) return;

    // Baris baru wajib memilih persediaan (StokOpnameID) sebelum disimpan.
    if (rows.some((row) => !row.stokOpnameId)) {
      setErrorMessage(
        "Masih ada baris yang belum memilih persediaan. Pilih persediaan atau hapus baris tersebut."
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const savedRows = await saveTestPricingPersediaan(
        persediaanId,
        rows.map((row) => ({
          TestPricingID: row.id,
          StokOpnameID: row.stokOpnameId,
          HargaAudit: Number(row.hargaAudit || 0),
          KuantitasAudit: Number(row.kuantitasAudit || 0),
          HargaPerusahaan: Number(row.hargaPerusahaan || 0),
          KuantitasPerusahaan: Number(row.kuantitasPerusahaan || 0),
        }))
      );

      setRows(savedRows.map(normalizePricingRow));
      setShowSuccessAlert(true);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ??
          "Data pricing gagal disimpan."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="font-poppins text-[#334155]">
      {/* =================================================
         SUCCESS ALERT
      ================================================= */}

      {showSuccessAlert && (
        <AlertSuccess
          message="Data pricing berhasil disimpan."
          onClose={() =>
            setShowSuccessAlert(false)
          }
        />
      )}

      <AlertError
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      {/* =================================================
         MAIN CARD
      ================================================= */}

      <div
        className="
          rounded-xl
          border
          border-[#DCE5EF]
          bg-white
          p-4
        "
      >
        {/* =================================================
           TOP
        ================================================= */}

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

          <div className="flex items-center gap-8">
            {/* FIFO */}

            <div
              className="
                flex
                h-[52px]
                w-[90px]
                shrink-0
                items-center
                justify-center
                rounded-[12px]
                border
                border-[#E2E8F0]
                bg-[#F1F5F9]
                p-[2px]
              "
            >
              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  rounded-[10px]
                  border
                  border-[#E2E8F0]
                  bg-white
                "
              >
                <span
                  className="
                    font-poppins
                    font-semibold
                    text-[#0EA5E9]
                  "
                >
                  FIFO
                </span>
              </div>
            </div>

            {/* TITLE */}

            <h2
              className="
                font-poppins
                text-sm
                font-semibold
                text-[#64748B]
              "
            >
              Pricing Test
            </h2>
          </div>

          {/* SEARCH */}

          <div
            className="
              relative
              w-full
              sm:w-[280px]
            "
          >
            <span
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-[#94A3B8]
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6"
                />

                <path d="m16 16 4.5 4.5" />
              </svg>
            </span>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Cari Nama Persediaan"
              className="
                h-10
                w-full
                rounded-xl
                border
                border-[#DCE5EF]
                bg-white
                pl-9
                pr-3
                font-poppins
                text-sm
                text-[#475569]
                outline-none
                placeholder:text-[#94A3B8]
                transition
                focus:border-[#38BDF8]
              "
            />
          </div>
        </div>

        {/* =================================================
           TABLE
        ================================================= */}

        <div
          className="
            mt-4
            overflow-x-auto
            rounded-xl
            border
            border-[#DCE5EF]
          "
        >
          <table
            className="
              w-full
              min-w-[1750px]
              border-collapse
            "
          >
            {/* =================================================
               HEADER
            ================================================= */}

            <thead className="bg-[#F8FAFC]">
              <tr>
                {/* NO */}

                <th
                  rowSpan={2}
                  className="
                    w-[60px]
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  No
                </th>

                {/* JENIS PERSEDIAAN */}

                <th
                  rowSpan={2}
                  className="
                    min-w-[230px]
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  Jenis Persediaan
                </th>

                {/* SATUAN */}

                <th
                  rowSpan={2}
                  className="
                    min-w-[130px]
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  Satuan
                </th>

                {/* AUDIT */}

                <th
                  colSpan={3}
                  className="
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  Menurut Audit
                </th>

                {/* PERUSAHAAN */}

                <th
                  colSpan={3}
                  className="
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  Menurut Perusahaan
                </th>

                {/* SELISIH */}

                <th
                  rowSpan={2}
                  className="
                    min-w-[200px]
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  Selisih
                </th>
              </tr>

              {/* SUB HEADER */}

              <tr>
                <th
                  className="
                    min-w-[200px]
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  Harga
                </th>

                <th
                  className="
                    min-w-[160px]
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  Kuantitas
                </th>

                <th
                  className="
                    min-w-[210px]
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  Jumlah
                </th>

                <th
                  className="
                    min-w-[200px]
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  Harga
                </th>

                <th
                  className="
                    min-w-[160px]
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  Kuantitas
                </th>

                <th
                  className="
                    min-w-[210px]
                    border-b
                    border-[#DCE5EF]
                    px-3
                    py-3
                    text-center
                    font-poppins
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#64748B]
                  "
                >
                  Jumlah
                </th>
              </tr>
            </thead>

            {/* =================================================
               BODY
            ================================================= */}

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="h-[160px] text-center font-poppins text-sm text-[#94A3B8]"
                  >
                    Memuat data pricing...
                  </td>
                </tr>
              ) : calculatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="
                      h-[160px]
                      text-center
                      font-poppins
                      text-sm
                      text-[#94A3B8]
                    "
                  >
                    Tidak ada data yang sesuai.
                  </td>
                </tr>
              ) : (
                calculatedRows.map(
                  (row, index) => {
                    const selisihPositif =
                      row.selisih > 0;

                    const selisihNegatif =
                      row.selisih < 0;

                    return (
                      <tr
                        key={row.clientKey ?? row.id}
                        className="
                          border-b
                          border-[#EDF2F7]
                        "
                      >
                        {/* NO */}

                        <td
                          className="
                            px-3
                            py-2
                            text-center
                            font-poppins
                            text-sm
                            text-[#475569]
                          "
                        >
                          {index + 1}
                        </td>

                        {/* JENIS PERSEDIAAN */}

                        <td
                          className="
                            min-w-[230px]
                            px-3
                            py-2
                          "
                        >
                          {row.id === null ? (
                            <Dropdown
                              options={stokOpnameOptions}
                              value={
                                row.stokOpnameId
                                  ? String(row.stokOpnameId)
                                  : ""
                              }
                              onChange={(value) =>
                                handleStokOpnameChange(
                                  row.clientKey,
                                  value
                                )
                              }
                              placeholder="Pilih Persediaan"
                              searchable
                              searchPlaceholder="Cari nama persediaan..."
                              showCheck={false}
                              className="[&_button]:h-10 [&_button]:rounded-xl [&_button]:text-sm"
                            />
                          ) : (
                            <input
                              type="text"
                              value={
                                row.jenisPersediaan
                              }
                              readOnly
                              className="
                                h-10
                                w-full
                                cursor-not-allowed
                                rounded-xl
                                border
                                border-[#DCE5EF]
                                bg-[#F8FAFC]
                                px-3
                                font-poppins
                                text-sm
                                text-[#64748B]
                                outline-none
                              "
                            />
                          )}
                        </td>

                        {/* SATUAN */}

                        <td
                          className="
                            min-w-[130px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            value={row.satuan}
                            readOnly
                            className="
                              h-10
                              w-full
                              cursor-not-allowed
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-[#F8FAFC]
                              px-3
                              font-poppins
                              text-sm
                              text-[#64748B]
                              outline-none
                            "
                          />
                        </td>

                        {/* HARGA AUDIT */}

                        <td
                          className="
                            min-w-[200px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatRupiah(
                              row.hargaAudit
                            )}
                            onChange={(event) =>
                              handleInputChange(
                                row.clientKey,
                                "hargaAudit",
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
                        </td>

                        {/* KUANTITAS AUDIT */}

                        <td
                          className="
                            min-w-[160px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatNumber(
                              row.kuantitasAudit
                            )}
                            onChange={(event) =>
                              handleInputChange(
                                row.clientKey,
                                "kuantitasAudit",
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
                        </td>

                        {/* JUMLAH AUDIT */}

                        <td
                          className="
                            min-w-[210px]
                            px-3
                            py-2
                          "
                        >
                          <div
                            className="
                              flex
                              h-10
                              w-full
                              items-center
                              whitespace-nowrap
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-[#F8FAFC]
                              px-3
                            "
                          >
                            <span
                              className="
                                shrink-0
                                font-poppins
                                text-sm
                                text-[#64748B]
                              "
                            >
                              Rp
                            </span>

                            <span
                              className="
                                shrink-0
                                pl-3
                                font-poppins
                                text-sm
                                text-[#475569]
                              "
                            >
                              {formatNumber(
                                row.jumlahAudit
                              )}
                            </span>
                          </div>
                        </td>

                        {/* HARGA PERUSAHAAN */}

                        <td
                          className="
                            min-w-[200px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatRupiah(
                              row.hargaPerusahaan
                            )}
                            onChange={(event) =>
                              handleInputChange(
                                row.clientKey,
                                "hargaPerusahaan",
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
                        </td>

                        {/* KUANTITAS PERUSAHAAN */}

                        <td
                          className="
                            min-w-[160px]
                            px-3
                            py-2
                          "
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatNumber(
                              row.kuantitasPerusahaan
                            )}
                            onChange={(event) =>
                              handleInputChange(
                                row.clientKey,
                                "kuantitasPerusahaan",
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
                        </td>

                        {/* JUMLAH PERUSAHAAN */}

                        <td
                          className="
                            min-w-[210px]
                            px-3
                            py-2
                          "
                        >
                          <div
                            className="
                              flex
                              h-10
                              w-full
                              items-center
                              whitespace-nowrap
                              rounded-xl
                              border
                              border-[#DCE5EF]
                              bg-[#F8FAFC]
                              px-3
                            "
                          >
                            <span
                              className="
                                shrink-0
                                font-poppins
                                text-sm
                                text-[#64748B]
                              "
                            >
                              Rp
                            </span>

                            <span
                              className="
                                shrink-0
                                pl-3
                                font-poppins
                                text-sm
                                text-[#475569]
                              "
                            >
                              {formatNumber(
                                row.jumlahPerusahaan
                              )}
                            </span>
                          </div>
                        </td>

                        {/* SELISIH */}

                        <td
                          className="
                            min-w-[200px]
                            px-3
                            py-2
                          "
                        >
                          <div
                            className="
                              flex
                              h-10
                              w-full
                              items-center
                              justify-end
                              whitespace-nowrap
                              rounded-xl
                              px-3
                              font-poppins
                              text-sm
                              font-semibold
                            "
                          >
                            <span
                              className={
                                selisihPositif
                                  ? "text-[#16A34A]"
                                  : selisihNegatif
                                  ? "text-[#EF4444]"
                                  : "text-[#475569]"
                              }
                            >
                              {selisihNegatif
                                ? "-Rp "
                                : "Rp "}
                              {formatNumber(
                                Math.abs(
                                  row.selisih
                                )
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
           TAMBAH DATA (Test Pricing 1:banyak)
        ================================================= */}

        <div className="mt-5 flex justify-center">
          <AddDataButton
            onClick={handleAddRow}
            disabled={isLoading || isSaving || !persediaanId}
          />
        </div>

        {/* =================================================
           BOTTOM
        ================================================= */}

        <div
          className="
            mt-5
            flex
            justify-end
          "
        >
          <SaveButton
            onClick={handleSave}
            label="Simpan"
            disabled={isLoading || isSaving || !persediaanId || rows.length === 0}
            isSaving={isSaving}
            savingLabel="Menyimpan..."
          />
        </div>
      </div>
    </div>
  );
}