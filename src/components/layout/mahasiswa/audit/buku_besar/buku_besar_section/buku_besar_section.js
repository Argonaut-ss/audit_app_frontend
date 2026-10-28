"use client";

import { useRef } from "react";
import {
    Plus,
    Trash2,
    CalendarDays,
} from "lucide-react";

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
            className="
                flex
                h-10
                min-w-0
                items-center
                overflow-hidden
                rounded-lg
                bg-[#F1F5F9]
            "
        >
            <span
                className="
                    flex
                    h-full
                    items-center
                    border-r
                    border-white
                    px-3
                    font-poppins
                    text-sm
                    text-[#64748B]
                "
            >
                Rp
            </span>

            <input
                type="text"
                inputMode="decimal"
                value={value ?? ""}
                readOnly={readOnly}
                onChange={(event) =>
                    onChange?.(event.target.value)
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
                    text-[#334155]
                    outline-none
                    ${readOnly
                        ? "cursor-default"
                        : "focus:bg-[#EAF9FF]"
                    }
                `}
            />
        </div>
    );
}

// ============================
// BUKU BESAR SECTION FORM
// ============================

export default function BukuBesarSectionForm({
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
                {/* Kolom akun */}
                {/* SUBJUDUL KOLOM AKUN */}
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

                        {/* NOMINAL PER BOOK */}
                        <AmountField
                            value={row.perBook}
                            onChange={(value) =>
                                onRowChange(
                                    row.id,
                                    "perBook",
                                    value
                                )
                            }
                        />

                        {/* NOMINAL AJE/RJE */}
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

                        {/* AUDITED BERJALAN */}
                        <AmountField
                            value={row.auditedBerjalan}
                            onChange={(value) =>
                                onRowChange(
                                    row.id,
                                    "auditedBerjalan",
                                    value
                                )
                            }
                        />

                        {/* AUDITED SEBELUM */}
                        <AmountField
                            value={row.auditedSebelum}
                            onChange={(value) =>
                                onRowChange(
                                    row.id,
                                    "auditedSebelum",
                                    value
                                )
                            }
                        />

                        {/* HAPUS BARIS */}
                        <button
                            type="button"
                            onClick={() =>
                                onRemoveRow(row.id)
                            }
                            aria-label={`Hapus baris ${row.account || ""
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