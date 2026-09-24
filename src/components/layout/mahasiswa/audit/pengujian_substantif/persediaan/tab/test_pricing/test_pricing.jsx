"use client";

import { useMemo, useState } from "react";

import AddDataButton from "@/components/button/add_data_button";
import SaveButton from "@/components/button/save_button";
import AlertSuccess from "@/components/alert/alert_success";

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

export default function TestPricingTable() {
  const [rows, setRows] = useState(initialPricingRows);

  const [searchTerm, setSearchTerm] = useState("");

  const [showSuccessAlert, setShowSuccessAlert] =
    useState(false);

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleInputChange = (id, field, value) => {
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
        if (row.id !== id) {
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
     ADD DATA
  ===================================================== */

  const handleAddData = () => {
    const newRow = {
      id: Date.now(),

      jenisPersediaan: "",

      satuan: "Unit",

      hargaAudit: 0,

      kuantitasAudit: 0,

      hargaPerusahaan: 0,

      kuantitasPerusahaan: 0,
    };

    setRows((previous) => [
      ...previous,
      newRow,
    ]);
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = () => {
    console.log("Pricing data:", rows);

    setShowSuccessAlert(true);
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
              {calculatedRows.length === 0 ? (
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
                        key={row.id}
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
                                row.id,
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
                                row.id,
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
                                row.id,
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
                                row.id,
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
           TAMBAH DATA
        ================================================= */}

        <div
          className="
            mt-4
            flex
            justify-center
          "
        >
          <AddDataButton
            onClick={handleAddData}
            label="Tambah Data"
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
          />
        </div>
      </div>
    </div>
  );
}