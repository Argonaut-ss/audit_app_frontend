"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, CalendarDays } from "lucide-react";

import Dropdown from "@/components/layout/mahasiswa/audit/buku_besar/dropdown/dropdown";

// Ukuran grid harus sama pada header, baris data, dan total.
const GRID_CLASS = `
    grid
    grid-cols-[minmax(150px,1.2fr)_minmax(120px,1fr)_minmax(115px,0.9fr)_16px_minmax(140px,1fr)_minmax(140px,1fr)_24px]
    gap-2
`;

// ============================
// FORMAT TANGGAL INDONESIA
// ============================

function formatDate(value) {
    if (!value) return "";

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) return "";

    const [, year, month, day] = match;

    return `${day}/${month}/${year}`;
}

// ============================
// PARSE NOMINAL
// ============================

function parseAmount(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const normalized = String(value)
        .replace(/\./g, "")
        .replace(/,/g, ".")
        .replace(/[^\d.-]/g, "");

    const amount = Number(normalized);

    return Number.isFinite(amount) ? amount : 0;
}

// ============================
// FORMAT NOMINAL
// ============================

function formatAmount(value) {
    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 2,
    }).format(value);
}

// ============================
// DATE FIELD
// ============================

function DateField({
    value,
    onChange,
    disabled = false,
}) {
    const dateRef = useRef(null);

    return (
        <div
            className={`
                relative
                flex
                h-10
                min-w-0
                items-center
                rounded-lg
                border
                border-[#DCE5EF]
                px-3
                ${disabled
                    ? "cursor-not-allowed bg-[#F1F5F9]"
                    : "bg-white"
                }
            `}
        >
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    const picker = dateRef.current;

                    if (picker?.showPicker) {
                        picker.showPicker();
                    } else {
                        picker?.click();
                    }
                }}
                className={`
                    flex
                    min-w-0
                    flex-1
                    items-center
                    gap-2
                    text-left
                    ${disabled
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }
                `}
            >
                <CalendarDays
                    size={16}
                    className="shrink-0 text-[#64748B]"
                />

                <span
                    className={`
                        truncate
                        font-poppins
                        text-sm
                        ${value
                            ? "text-[#64748B]"
                            : "text-[#94A3B8]"
                        }
                    `}
                >
                    {formatDate(value) || "Tanggal"}
                </span>
            </button>

            <input
                ref={dateRef}
                type="date"
                value={value || ""}
                disabled={disabled}
                onChange={(event) =>
                    onChange?.(event.target.value)
                }
                tabIndex={-1}
                aria-label="Pilih tanggal"
                className="
                    pointer-events-none
                    absolute
                    h-px
                    w-px
                    opacity-0
                "
            />
        </div>
    );
}

// ============================
// AMOUNT FIELD
// ============================

function AmountField({
    value,
    onChange,
    readOnly = false,
}) {
    return (
        <div
            className={`
                flex
                h-10
                min-w-0
                items-center
                overflow-hidden
                rounded-lg
                ${readOnly
                    ? "bg-[#F1F5F9] cursor-not-allowed select-none"
                    : "border border-[#DCE5EF] bg-white focus-within:border-[#38BDF8]"
                }
            `}
        >
            <span
                className={`
                    flex
                    h-full
                    items-center
                    border-r
                    px-3
                    font-poppins
                    text-sm
                    text-[#64748B]
                    ${readOnly
                        ? "border-white bg-[#F1F5F9]"
                        : "border-[#DCE5EF] bg-white"
                    }
                `}
            >
                Rp
            </span>

            <input
                type="text"
                inputMode="decimal"
                value={value ?? ""}
                readOnly={readOnly}
                disabled={readOnly}
                tabIndex={readOnly ? -1 : 0}
                onChange={(event) =>
                    !readOnly && onChange?.(event.target.value)
                }
                className={`
                    h-full
                    min-w-0
                    flex-1
                    bg-transparent
                    px-2
                    text-right
                    font-poppins
                    text-sm
                    outline-none
                    ${readOnly
                        ? "cursor-not-allowed text-[#64748B] pointer-events-none"
                        : "text-[#334155] focus:bg-[#EAF9FF]"
                    }
                `}
            />
        </div>
    );
}

// ============================
// KOMPONEN SECTION FORM
// ============================

function SectionForm({
    title,
    subtitle = "",
    accountOptions = [],
    rows = [],
    dates,
    onDateChange,
    onRowChange,
    onAddRow,
    onRemoveRow,
}) {
    // Hitung total setiap kolom.
    const total = (field) =>
        rows.reduce(
            (sum, row) =>
                sum + parseAmount(row[field]),
            0
        );

    return (
        <section className="px-5 py-6">
            {/* JUDUL KELOMPOK */}
            <div className="mb-4 flex items-center justify-between">
                <h3
                    className="
                        font-poppins
                        text-sm
                        font-semibold
                        uppercase
                        text-[#334155]
                    "
                >
                    {title}
                </h3>
            </div>

            {/* HEADER KOLOM */}
            <div
                className={`
                    ${GRID_CLASS}
                    items-end
                `}
            >
                {/* Kolom akun / subjudul */}
                <div className="flex h-10 min-w-0 items-center font-poppins text-sm text-[#64748B]">
                    {subtitle}
                </div>

                {/* PER BOOK */}
                <div className="min-w-0">
                    <p
                        className="
                            mb-3
                            text-center
                            font-poppins
                            text-sm
                            font-semibold
                            text-[#334155]
                        "
                    >
                        Per Book
                    </p>

                    <DateField
                        value={dates?.perBook ?? ""}
                        disabled
                        onChange={(value) =>
                            onDateChange(
                                "perBook",
                                value
                            )
                        }
                    />
                </div>

                {/* AJE/RJE */}
                <div className="min-w-0">
                    <p
                        className="
                            mb-3
                            text-center
                            font-poppins
                            text-sm
                            font-semibold
                            text-[#334155]
                        "
                    >
                        AJE/RJE
                    </p>

                    <div className="h-10" />
                </div>

                {/* Ruang untuk ikon pada baris data */}
                <div />

                {/* AUDITED BERJALAN */}
                <div className="min-w-0">
                    <p
                        className="
                            mb-3
                            text-center
                            font-poppins
                            text-sm
                            font-semibold
                            text-[#334155]
                        "
                    >
                        Audited Berjalan
                    </p>

                    <DateField
                        value={
                            dates?.auditedBerjalan ?? ""
                        }
                        disabled
                        onChange={(value) =>
                            onDateChange(
                                "auditedBerjalan",
                                value
                            )
                        }
                    />
                </div>

                {/* AUDITED SEBELUM */}
                <div className="min-w-0">
                    <p
                        className="
                            mb-3
                            text-center
                            font-poppins
                            text-sm
                            font-semibold
                            text-[#334155]
                        "
                    >
                        Audited Sebelum
                    </p>

                    <DateField
                        value={
                            dates?.auditedSebelum ?? ""
                        }
                        onChange={(value) =>
                            onDateChange(
                                "auditedSebelum",
                                value
                            )
                        }
                    />
                </div>

                {/* TAMBAH BARIS */}
                <button
                    type="button"
                    onClick={onAddRow}
                    aria-label={`Tambah baris ${title}`}
                    className="
                        mb-3
                        flex
                        h-5
                        w-6
                        items-center
                        justify-center
                        text-[#05A80B]
                        transition
                        hover:scale-110
                    "
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* BARIS DATA */}
            <div className="mt-4 space-y-3">
                {rows.map((row) => (
                    <div
                        key={row.id}
                        className={`
                            ${GRID_CLASS}
                            items-center
                        `}
                    >
                        {/* NAMA AKUN */}
                        <div className="flex min-w-0 items-center gap-2">
                            <span
                                className="
                                    flex h-4 w-4 shrink-0
                                    items-center justify-center
                                    rounded-full border border-[#38BDF8]
                                "
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
                            </span>

                            <Dropdown
                                options={accountOptions}
                                value={row.account ?? ""}
                                onChange={(value) =>
                                    onRowChange(
                                        row.id,
                                        "account",
                                        value
                                    )
                                }
                                placeholder="Pilih akun"
                                searchable
                                showCheck
                                className="min-w-0 flex-1"
                            />
                        </div>

                        {/* NOMINAL PER BOOK (KOTAK ABU-ABU - TIDAK BISA DIEDIT) */}
                        <AmountField
                            value={row.perBook}
                            readOnly
                        />

                        {/* NOMINAL AJE/RJE (KOTAK PUTIH - BISA DIEDIT) */}
                        <AmountField
                            value={row.ajeRje}
                            onChange={(value) =>
                                onRowChange(
                                    row.id,
                                    "ajeRje",
                                    value
                                )
                            }
                        />

                        {/* IKON BULAT */}
                        <span
                            className="
                                flex
                                h-4
                                w-4
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-[#38BDF8]
                            "
                        >
                            <span
                                className="
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-[#38BDF8]
                                "
                            />
                        </span>

                        {/* AUDITED BERJALAN (KOTAK ABU-ABU - TIDAK BISA DIEDIT) */}
                        <AmountField
                            value={row.auditedBerjalan}
                            readOnly
                        />

                        {/* AUDITED SEBELUM (KOTAK ABU-ABU - TIDAK BISA DIEDIT) */}
                        <AmountField
                            value={row.auditedSebelum}
                            readOnly
                        />

                        {/* HAPUS BARIS */}
                        <button
                            type="button"
                            onClick={() =>
                                onRemoveRow(row.id)
                            }
                            aria-label={`Hapus baris ${
                                row.account || ""
                            }`}
                            className="
                                flex
                                h-10
                                w-6
                                items-center
                                justify-center
                                text-[#EF4444]
                                transition
                                hover:scale-110
                            "
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* TOTAL */}
            <div
                className={`
                    ${GRID_CLASS}
                    mt-4
                    items-center
                `}
            >
                <p
                    className="
                        font-poppins
                        text-sm
                        font-semibold
                        text-[#334155]
                    "
                >
                    Total
                </p>

                <AmountField
                    value={formatAmount(
                        total("perBook")
                    )}
                    readOnly
                />

                <AmountField
                    value={formatAmount(
                        total("ajeRje")
                    )}
                    readOnly
                />

                <div />

                <AmountField
                    value={formatAmount(
                        total("auditedBerjalan")
                    )}
                    readOnly
                />

                <AmountField
                    value={formatAmount(
                        total("auditedSebelum")
                    )}
                    readOnly
                />

                <div />
            </div>
        </section>
    );
}

// ============================
// DATA AWAL PERSEDIAAN
// ============================

const initialPersediaanRows = [
    {
        id: "persediaan-1",
        account: "Persediaan Barang Dagang",
        perBook: "10.003.525.000",
        ajeRje: "-263.869.270",
        auditedBerjalan: "9.739.655.730",
        auditedSebelum: "8.497.338.192",
    },
    {
        id: "persediaan-2",
        account: "Bahan Habis Pakai",
        perBook: "162.697.591",
        ajeRje: "",
        auditedBerjalan: "162.697.591",
        auditedSebelum: "177.975.273",
    },
];

const ACCOUNT_DEFAULT_VALUES = {
    "Persediaan Barang Dagang": {
        perBook: "10.003.525.000",
        auditedSebelum: "8.497.338.192",
    },
    "Bahan Habis Pakai": {
        perBook: "162.697.591",
        auditedSebelum: "177.975.273",
    },
};

const persediaanAccountOptions = [
    "Persediaan Barang Dagang",
    "Bahan Habis Pakai",
    "Persediaan Bahan Baku",
    "Persediaan Barang Dalam Proses",
    "Persediaan Barang Jadi",
    "Persediaan Dalam Perjalanan",
];

const initialDates = {
    perBook: "2022-12-31",
    auditedBerjalan: "2022-12-31",
    auditedSebelum: "",
};

// ============================
// KOMPONEN UTAMA PERSEDIAAN
// ============================

export default function Persediaan({
    onSave,
    isSaving = false,
}) {
    // =========================
    // STATE PERSEDIAAN
    // =========================

    const [persediaanRows, setPersediaanRows] =
        useState(initialPersediaanRows);

    const [persediaanDates, setPersediaanDates] =
        useState(initialDates);

    // =========================
    // HANDLE PERUBAHAN BARIS
    // =========================

    const handleRowChange = (
        setRows,
        rowId,
        field,
        value
    ) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id !== rowId) return row;

                const updated = {
                    ...row,
                    [field]: value,
                };

                // Jika akun diubah, isi default perBook dan auditedSebelum jika tersedia
                if (field === "account" && ACCOUNT_DEFAULT_VALUES[value]) {
                    const defaults = ACCOUNT_DEFAULT_VALUES[value];
                    updated.perBook = defaults.perBook;
                    updated.auditedSebelum = defaults.auditedSebelum;
                }

                // Hitung otomatis Audited Berjalan = Per Book + AJE/RJE
                const perBookNum = parseAmount(updated.perBook);
                const ajeRjeNum = parseAmount(updated.ajeRje);
                updated.auditedBerjalan = formatAmount(
                    perBookNum + ajeRjeNum
                );

                return updated;
            })
        );
    };

    // =========================
    // HANDLE PERUBAHAN TANGGAL
    // =========================

    const handleDateChange = (
        setDates,
        field,
        value
    ) => {
        setDates((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // =========================
    // HANDLE TAMBAH BARIS
    // =========================

    const handleAddRow = (
        setRows,
        prefix,
        defaultAccount
    ) => {
        const defaults = ACCOUNT_DEFAULT_VALUES[defaultAccount] || {
            perBook: "0",
            auditedSebelum: "0",
        };

        const newRow = {
            id: `${prefix}-${crypto.randomUUID()}`,
            account: defaultAccount,
            perBook: defaults.perBook,
            ajeRje: "",
            auditedBerjalan: defaults.perBook,
            auditedSebelum: defaults.auditedSebelum,
        };

        setRows((prev) => [
            ...prev,
            newRow,
        ]);
    };

    // =========================
    // HANDLE HAPUS BARIS
    // =========================

    const handleRemoveRow = (
        setRows,
        rowId
    ) => {
        setRows((prev) =>
            prev.filter(
                (row) => row.id !== rowId
            )
        );
    };

    // =========================
    // HANDLE SIMPAN
    // =========================

    const handleSave = async () => {
        if (!onSave) {
            console.warn(
                "Handler onSave belum dihubungkan ke API Buku Besar."
            );
            return;
        }

        const payload = {
            persediaanDates,
            persediaanRows,
        };

        await onSave(payload);
    };

    return (
        <div className="overflow-hidden rounded-xl bg-white">

            {/* =========================
                KELOMPOK 1:
                PERSEDIAAN
            ========================= */}

            <SectionForm
                title="Persediaan"
                subtitle="Persediaan"
                accountOptions={persediaanAccountOptions}
                rows={persediaanRows}
                dates={persediaanDates}
                onDateChange={(field, value) =>
                    handleDateChange(
                        setPersediaanDates,
                        field,
                        value
                    )
                }
                onRowChange={(
                    rowId,
                    field,
                    value
                ) =>
                    handleRowChange(
                        setPersediaanRows,
                        rowId,
                        field,
                        value
                    )
                }
                onAddRow={() =>
                    handleAddRow(
                        setPersediaanRows,
                        "persediaan",
                        persediaanAccountOptions[0] ||
                            "Persediaan Barang Dagang"
                    )
                }
                onRemoveRow={(rowId) =>
                    handleRemoveRow(
                        setPersediaanRows,
                        rowId
                    )
                }
            />


            {/* =========================
                TOMBOL SIMPAN
            ========================= */}

            <div className="flex justify-end px-5 py-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="
                        min-w-[100px]
                        rounded-lg
                        bg-[#05A80B]
                        px-5
                        py-2.5
                        font-poppins
                        text-xs
                        font-semibold
                        text-white
                        transition
                        hover:bg-[#04930A]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >
                    {isSaving
                        ? "Menyimpan..."
                        : "Simpan"}
                </button>
            </div>

        </div>
    );
}

