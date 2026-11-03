
"use client";

import {
    Info,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";

const formatRupiah = (value) =>
    `Rp ${Number(value ?? 0).toLocaleString("id-ID")}`;

export default function RincianAjeRjePopup({
    isOpen,
    loading = false,
    error = "",
    data = null,
    onClose,
}) {
    if (!isOpen) return null;

    const rincianJurnal = data?.rincian_jurnal ?? [];

    const totalDebit = Number(data?.TotalDebit ?? 0);
    const totalKredit = Number(data?.TotalKredit ?? 0);

    const totalAjeRje = Number(
        data?.AJE_RJE ?? totalDebit - totalKredit
    );

    const saldoNormal = String(
        data?.SaldoNormal ?? ""
    ).toLowerCase();

    const isDebit = saldoNormal === "debit";
    const isNegative = totalAjeRje < 0;

    return (
        <div
            className="
                fixed inset-0 z-[9999]
                flex items-center justify-center
                bg-black/40 px-4 py-6
            "
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="
                w-full max-w-[530px]
                overflow-hidden rounded-2xl
                bg-white shadow-2xl
            ">
                {/* HEADER */}
                <div className="
                    bg-gradient-to-r
                    from-[#0EA5E9]
                    to-[#38BDF8]
                    px-6 py-6
                    text-white
                ">
                    <h2 className="
                        font-poppins text-lg
                        font-bold
                    ">
                        Asal Nilai AJE/RJE
                    </h2>

                    <p className="
                        mt-1 font-poppins
                        text-xs text-white/90
                    ">
                        Rincian jurnal koreksi pembentuk nilai AJE/RJE
                    </p>
                </div>

                {/* RINGKASAN AKUN */}
                <div className="
                    bg-[#F8FAFC]
                    px-5 py-4
                ">
                    <h3 className="
                        mb-3 font-poppins
                        text-[11px] font-semibold
                        uppercase text-[#94A3B8]
                    ">
                        Ringkasan Akun
                    </h3>

                    <div className="
                        grid grid-cols-2 gap-3
                    ">
                        <div className="
                            rounded-xl
                            border border-[#E2E8F0]
                            bg-white px-3 py-3
                        ">
                            <p className="
                                mb-1 font-poppins
                                text-[10px] text-[#94A3B8]
                            ">
                                Akun
                            </p>

                            <p className="
                                truncate font-poppins
                                text-sm font-semibold
                                text-[#334155]
                            ">
                                {data?.NamaAkun ?? "-"}
                            </p>
                        </div>

                        <div className="
                            rounded-xl
                            border border-[#E2E8F0]
                            bg-white px-3 py-3
                        ">
                            <p className="
                                mb-1 font-poppins
                                text-[10px] text-[#94A3B8]
                            ">
                                Saldo Normal
                            </p>

                            <p className={`
                                font-poppins text-sm
                                font-semibold
                                ${
                                    isDebit
                                        ? "text-[#16A34A]"
                                        : "text-[#DC2626]"
                                }
                            `}>
                                {data?.SaldoNormal ?? "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* DAFTAR JURNAL */}
                <div className="px-5 py-4">
                    <h3 className="
                        mb-3 font-poppins
                        text-[11px] font-semibold
                        uppercase text-[#94A3B8]
                    ">
                        Daftar Jurnal
                    </h3>

                    {loading ? (
                        <div className="
                            flex min-h-48
                            flex-col items-center
                            justify-center gap-3
                        ">
                            <LoaderCircle
                                size={28}
                                className="
                                    animate-spin
                                    text-[#0EA5E9]
                                "
                            />

                            <p className="
                                font-poppins text-xs
                                text-[#94A3B8]
                            ">
                                Mengambil rincian jurnal...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="
                            flex min-h-48
                            flex-col items-center
                            justify-center gap-3
                            text-center
                        ">
                            <AlertCircle
                                size={28}
                                className="text-red-500"
                            />

                            <p className="
                                font-poppins text-xs
                                text-red-600
                            ">
                                {error}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="
                                overflow-hidden
                                border border-[#E2E8F0]
                                rounded-lg
                            ">
                                <table className="
                                    w-full
                                    border-collapse
                                ">
                                    <thead>
                                        <tr className="bg-[#F8FAFC]">
                                            <th className="
                                                w-[40px]
                                                px-2 py-3
                                                text-center
                                                font-poppins
                                                text-xs
                                                font-semibold
                                                uppercase
                                                text-[#94A3B8]
                                            ">
                                                No
                                            </th>

                                            <th className="
                                                px-2 py-3
                                                text-left
                                                font-poppins
                                                text-xs
                                                font-semibold
                                                uppercase
                                                text-[#94A3B8]
                                            ">
                                                Posisi Jurnal
                                            </th>

                                            <th className="
                                                px-2 py-3
                                                text-left
                                                font-poppins
                                                text-xs
                                                font-semibold
                                                uppercase
                                                text-[#94A3B8]
                                            ">
                                                Sumber
                                            </th>

                                            <th className="
                                                px-3 py-3
                                                text-right
                                                font-poppins
                                                text-xs
                                                font-semibold
                                                uppercase
                                                text-[#94A3B8]
                                            ">
                                                Nilai
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rincianJurnal.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="
                                                        px-3 py-8
                                                        text-center
                                                        font-poppins
                                                        text-xs
                                                        text-[#94A3B8]
                                                    "
                                                >
                                                    Tidak ada rincian jurnal.
                                                </td>
                                            </tr>
                                        ) : (
                                            rincianJurnal.map((item, index) => {
                                                const posisi = String(
                                                    item.posisi ?? ""
                                                ).toLowerCase();

                                                const isKredit =
                                                    posisi === "kredit";

                                                return (
                                                    <tr
                                                        key={`${item.no ?? index}-${index}`}
                                                        className="
                                                            border-b
                                                            border-[#F1F5F9]
                                                            last:border-0
                                                        "
                                                    >
                                                        {/* NOMOR */}
                                                        <td className="
                                                            px-2 py-3
                                                            text-center
                                                            font-poppins
                                                            text-xs
                                                            text-[#64748B]
                                                        ">
                                                            {item.no ?? index + 1}
                                                        </td>

                                                        {/* POSISI */}
                                                        <td className="px-2 py-3">
                                                            <span className={`
                                                                inline-flex
                                                                items-center
                                                                rounded-full
                                                                border
                                                                px-2 py-1
                                                                font-poppins
                                                                text-xs
                                                                font-semibold
                                                                ${
                                                                    isKredit
                                                                        ? "border-[#FECACA] bg-[#FEF2F2] text-[#EF4444]"
                                                                        : "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]"
                                                                }
                                                            `}>
                                                                {item.posisi ?? "-"}
                                                            </span>
                                                        </td>

                                                        {/* SUMBER */}
                                                        <td className="
                                                            px-2 py-3
                                                            font-poppins
                                                            text-xs
                                                            text-[#64748B]
                                                        ">
                                                            {item.sumber ?? "-"}
                                                        </td>

                                                        {/* NILAI */}
                                                        <td className="
                                                            whitespace-nowrap
                                                            px-3 py-3
                                                            text-right
                                                            font-poppins
                                                            text-xs
                                                            font-semibold
                                                            text-[#64748B]
                                                        ">
                                                            {formatRupiah(item.nilai)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>

                                    {/* TOTAL AJE/RJE */}
                                    <tfoot>
                                        <tr className={`
                                            ${
                                                isNegative
                                                    ? "bg-[#FFF7F7]"
                                                    : "bg-[#F0FDF4]"
                                            }
                                        `}>
                                            <td
                                                colSpan={3}
                                                className="
                                                    px-3 py-3
                                                    font-poppins
                                                    text-sm
                                                    font-semibold
                                                    text-[#64748B]
                                                "
                                            >
                                                Total AJE/RJE
                                            </td>

                                            <td className={`
                                                whitespace-nowrap
                                                px-3 py-3
                                                text-right
                                                font-poppins
                                                text-sm
                                                font-bold
                                                ${
                                                    isNegative
                                                        ? "text-[#EF4444]"
                                                        : "text-[#16A34A]"
                                                }
                                            `}>
                                                {formatRupiah(totalAjeRje)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* INFORMASI PERHITUNGAN */}
                            <div className="
                                mt-4 flex items-start
                                gap-2 rounded-xl
                                bg-[#EFF6FF]
                                px-3 py-3
                            ">
                                <Info
                                    size={17}
                                    className="
                                        mt-0.5 shrink-0
                                        text-[#0EA5E9]
                                    "
                                />

                                <p className="
                                    font-poppins
                                    text-[10px]
                                    leading-relaxed
                                    text-[#475569]
                                ">
                                    Dari jurnal koreksi di atas, diperoleh
                                    Total Debit{" "}
                                    <strong>
                                        {formatRupiah(totalDebit)}
                                    </strong>{" "}
                                    dan Total Kredit{" "}
                                    <strong>
                                        {formatRupiah(totalKredit)}
                                    </strong>
                                    . Karena saldo normal akun ini{" "}
                                    <strong>
                                        {data?.SaldoNormal ?? "-"}
                                    </strong>
                                    , nilai AJE/RJE dihitung dari selisih{" "}
                                    {isDebit ? (
                                        <>
                                            Debit dikurangi Kredit:{" "}
                                        </>
                                    ) : (
                                        <>
                                            Kredit dikurangi Debit:{" "}
                                        </>
                                    )}
                                    <strong>
                                        {formatRupiah(
                                            isDebit
                                                ? totalDebit - totalKredit
                                                : totalKredit - totalDebit
                                        )}
                                    </strong>
                                    .
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* FOOTER */}
                <div className="
                    flex justify-end
                    border-t border-[#E2E8F0]
                    px-5 py-3
                ">
                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-xl
                            bg-[#DC2626]
                            px-5 py-2
                            font-poppins
                            text-xs font-semibold
                            text-white
                            transition
                            hover:bg-[#B91C1C]
                        "
                    >
                        Keluar
                    </button>
                </div>
            </div>
        </div>
    );
}
