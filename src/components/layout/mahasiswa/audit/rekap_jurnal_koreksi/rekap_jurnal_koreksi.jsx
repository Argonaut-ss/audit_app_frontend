"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { useParams } from "next/navigation";

import Dropdown from "@/components/ui/dropdown/dropdown";
import { getRekapJurnalKoreksi } from "@/services/mahasiswa/tugas/audit/rekap_jurnal_koreksi/rekap_jurnal_koreksi";

const formatAmount = (amount) =>
    `Rp ${new Intl.NumberFormat("id-ID").format(Number(amount) || 0)}`;

function JournalSection({ section }) {
    return (
        <section className="mt-7 rounded-xl border border-[#DCE5EF] bg-white p-4">
            <div className="flex items-center justify-between border-b border-[#EEF2F7] pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7FE]">
                        <FileText size={18} strokeWidth={1.8} className="text-[#20A9E5]" />
                    </div>
                    <h2 className="font-poppins text-sm font-semibold text-[#334155]">
                        {section.nama_pengujian}
                    </h2>
                </div>
                <span className="rounded-lg bg-[#F1F5F9] px-3 py-1.5 font-poppins text-[10px] font-medium text-[#475569]">
                    {section.daftar_jurnal.length} entri
                </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-[#DCE5EF]">
                <div className="grid grid-cols-[2fr_1.7fr_1.5fr_1.3fr] bg-[#F8FAFC] px-4 py-3 font-poppins text-[10px] font-semibold uppercase text-[#64748B]">
                    <span>Nama Akun</span>
                    <span>Nomor Akun</span>
                    <span className="text-right">Debet</span>
                    <span className="text-right">Kredit</span>
                </div>

                {section.daftar_jurnal.map((journal) => (
                    <div key={journal.id}>
                        {journal.rincian.map((account, index) => (
                            <div
                                key={`${journal.id}-${account.COAID}-${index}`}
                                className="grid grid-cols-[2fr_1.7fr_1.5fr_1.3fr] items-center border-t border-[#E8EEF4] px-4 py-3 font-poppins text-sm text-[#334155]"
                            >
                                <span className={index > 0 ? "pl-8" : ""}>
                                    {account.NamaAkun || "-"}
                                </span>
                                <span className="text-[#64748B]">{account.NoAkun || "-"}</span>
                                <span className={`text-right ${account.Debit ? "font-medium" : "text-[#94A3B8]"}`}>
                                    {formatAmount(account.Debit)}
                                </span>
                                <span className={`text-right ${account.Kredit ? "font-medium" : "text-[#94A3B8]"}`}>
                                    {formatAmount(account.Kredit)}
                                </span>
                            </div>
                        ))}

                        <div className="border-t border-[#EEF2F6] bg-[#F8FAFC] px-4 py-3 font-poppins text-xs italic text-[#64748B]">
                            <span className="mr-3 not-italic text-[9px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                                Keterangan:
                            </span>
                            {journal.keterangan || "-"}
                        </div>
                        <div className="grid grid-cols-[2fr_1.7fr_1.5fr_1.3fr] border-t border-[#DCE5EF] bg-[#F8FAFC] px-4 py-3 font-poppins text-sm font-semibold text-[#334155]">
                            <span>Total</span>
                            <span />
                            <span className="text-right">{formatAmount(journal.TotalDebit)}</span>
                            <span className="text-right">{formatAmount(journal.TotalKredit)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function RekapJurnalKoreksi() {
    const params = useParams();
    const [selectedAccount, setSelectedAccount] = useState("");
    const [rekap, setRekap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!params?.id) return undefined;

        let cancelled = false;

        const fetchRekap = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await getRekapJurnalKoreksi(params.id);

                if (!cancelled) setRekap(data);
            } catch (requestError) {
                if (cancelled) return;

                console.error("Gagal mengambil rekap jurnal koreksi:", requestError);
                setError(
                    requestError.response?.data?.message ||
                        requestError.message ||
                        "Gagal mengambil rekap jurnal koreksi."
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchRekap();

        return () => {
            cancelled = true;
        };
    }, [params?.id]);

    const accountOptions = useMemo(
        () =>
            (rekap?.filter_akun || []).map((account) => ({
                value: String(account.COAID),
                label: `${account.NamaAkun} (${account.NoAkun})`,
            })),
        [rekap]
    );

    const filteredSections = useMemo(() => {
        if (!selectedAccount) return rekap?.daftar_pengujian || [];

        return (rekap?.daftar_pengujian || [])
            .map((section) => ({
                ...section,
                daftar_jurnal: section.daftar_jurnal.filter((journal) =>
                    journal.rincian.some(
                        (account) => String(account.COAID) === selectedAccount
                    )
                ),
            }))
            .filter((section) => section.daftar_jurnal.length > 0);
    }, [rekap, selectedAccount]);

    return (
        <div className="px-5 pb-5 pt-8">
            <div className="ml-2 w-full max-w-[320px]">
                <Dropdown
                    options={accountOptions}
                    value={selectedAccount}
                    onChange={setSelectedAccount}
                    placeholder="Filter berdasarkan akun"
                    searchable
                    searchPlaceholder="Cari akun..."
                    clearable
                />
            </div>

            <div className="mt-8 border-b border-[#DCE5EF]" />

            {loading && (
                <p className="py-8 text-center font-poppins text-sm text-[#64748B]">
                    Memuat rekap jurnal koreksi...
                </p>
            )}

            {!loading && error && (
                <p className="py-8 text-center font-poppins text-sm text-red-600">
                    {error}
                </p>
            )}

            {!loading && !error && filteredSections.length === 0 && (
                <p className="py-8 text-center font-poppins text-sm text-[#64748B]">
                    Tidak ada data jurnal koreksi.
                </p>
            )}

            {!loading &&
                !error &&
                filteredSections.map((section) => (
                    <JournalSection key={section.nama_pengujian} section={section} />
                ))}
        </div>
    );
}
