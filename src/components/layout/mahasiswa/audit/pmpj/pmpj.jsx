"use client";

import { useRef, useState } from "react";
import {
    Briefcase,
    Calendar,
    ChevronDown,
    FileText,
    MapPin,
    Save,
    Search,
    Shield,
    UserRound,
} from "lucide-react";

const defaultForm = {
    nama: "Sony Warsono",
    jabatan: "Direktur Utama",
    alamat: "JL TATA SURYA 12 AB",
    namaPerusahaan: "PT Cakra Manglinggilan",
    alamatPerusahaan: "Jalan Ringroad Utara 212, Sleman Yogyakarta",
    tahunPeriode: "2022",
    fileKtp: "2. KTP DIREKTUR 69892e5f7f22928082.pdf",
};

const defaultRiskRows = [
    {
        profile: "Profil Pengguna Jasa",
        category: "Pedagang",
        risk: "Rendah",
    },
    {
        profile: "Profil Bisnis Pengguna Jasa",
        category: "Pertanian, Perkebunan Peternakan & Perikanan",
        risk: "Rendah",
    },
    {
        profile: "Profil Domisili Pengguna Jasa",
        category: "Daerah lainnya",
        risk: "Rendah",
    },
    {
        profile: "Kriteria Khusus / Tambahan",
        category:
            "Pengguna jasa atau BO melakukan transaksi dengan pihak dari negara beresiko tinggi sesuai daftar rekomenda...",
        risk: "Tinggi",
    },
];

const categoryOptions = [
    [
        "Direksi, Komisaris dan Pejabat Struktural lainnya pada BUMN/BUMD",
        "Pejabat yang membidangi sektor minyak, gas, mineral dan batubara",
        "Korporasi Non UMKM",
        "BUMN/BUMD",
        "Pengusaha/Wiraswasta",
        "Pegawai Swasta",
        "Profesional dan Konsultan",
        "Korporasi UMKM",
        "Pedagang",
        "Pengurus/Pegawai LSM/organisasi tidak berbadan hukum lainnya",
        "Pengrajin",
        "Lain-Lain",
    ],
    [
        "Perdagangan Kendaraan Bermotor",
        "Properti",
        "Perdagangan Berjangka Komoditi",
        "Asuransi Jiwa",
        "Manufaktur",
        "Perdagangan Barang dan/atau Jasa Lainnya",
        "Transportasi dan Telekomunikasi",
        "Hotel dan Pariwisata",
        "Pertanian, Perkebunan Peternakan & Perikanan",
        "Lain-Lain",
    ],
    [
        "DKI Jakarta",
        "Sumatera Utara",
        "Jawa Timur",
        "Jawa Barat",
        "Papua",
        "Riau",
        "Bali",
        "Daerah lainnya",
    ],
    [
        "Pengguna jasa atau BO melakukan transaksi dengan pihak dari negara beresiko tinggi sesuai daftar rekomendasi Financial Action Task Force (FATF)",
        "Tidak ada kriteria lainnya",
    ],
];

const highRiskCategories = new Set(categoryOptions[0].slice(0, 4));
const mediumRiskCategories = new Set(categoryOptions[0].slice(4, 8));
const businessHighRiskCategories = new Set(categoryOptions[1].slice(0, 2));
const businessMediumRiskCategories = new Set(categoryOptions[1].slice(2, 5));
const domicileHighRiskCategories = new Set(categoryOptions[2].slice(0, 3));
const domicileMediumRiskCategories = new Set(categoryOptions[2].slice(3, 7));

function getProfileRisk(category, profileIndex) {
    if (profileIndex === 3) return "Tinggi";

    if (profileIndex === 1) {
        if (businessHighRiskCategories.has(category)) return "Tinggi";
        if (businessMediumRiskCategories.has(category)) return "Menengah";
        return "Rendah";
    }

    if (profileIndex === 2) {
        if (domicileHighRiskCategories.has(category)) return "Tinggi";
        if (domicileMediumRiskCategories.has(category)) return "Menengah";
        return "Rendah";
    }

    if (highRiskCategories.has(category)) return "Tinggi";
    if (mediumRiskCategories.has(category)) return "Menengah";
    return "Rendah";
}

export default function Pmpj({ data = {}, onSave }) {
    const [form, setForm] = useState({ ...defaultForm, ...data });
    const [riskRows, setRiskRows] = useState(defaultRiskRows);
    const [openRiskIndex, setOpenRiskIndex] = useState(null);

    function updateForm(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateRisk(index, category) {
        setRiskRows((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index
                    ? {
                          ...row,
                          category,
                          ...([0, 1, 2, 3].includes(rowIndex) && {
                              risk: getProfileRisk(category, rowIndex),
                          }),
                      }
                    : row,
            ),
        );
    }

    function handleSubmit(event) {
        event.preventDefault();
        onSave?.({ ...form, penilaianRisiko: riskRows });
    }

    return (
        <div className="rounded-b-xl bg-white px-5 pb-8 pt-5">
            <div className="mb-5 flex items-start gap-3">
                <SectionIcon icon={UserRound} />
                <div>
                    <h2 className="font-poppins text-lg font-semibold text-[#1F2937]">
                        PMPJ (Prinsip Mengenali Pengguna Jasa)
                    </h2>
                    <p className="font-poppins text-sm text-[#7B8794]">
                        Lengkapi identitas, menganalisa profil, dan mengklasifikasikan risiko pengguna jasa.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <section className="rounded-xl border border-[#DCE5EF] bg-white p-5">
                    <SectionHeading icon={FileText} title="Identitas Pengguna Jasa" description="Data kontak, perusahaan, dan dokumen identitas." />
                    <div className="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
                        <InputField label="Nama" icon={UserRound} value={form.nama} onChange={(value) => updateForm("nama", value)} />
                        <InputField label="Jabatan" icon={Briefcase} value={form.jabatan} onChange={(value) => updateForm("jabatan", value)} />
                        <InputField className="md:col-span-2" label="Alamat" icon={MapPin} value={form.alamat} onChange={(value) => updateForm("alamat", value)} />
                        <InputField label="Nama Perusahaan" icon={UserRound} value={form.namaPerusahaan} onChange={(value) => updateForm("namaPerusahaan", value)} />
                        <InputField label="Alamat Perusahaan" icon={MapPin} value={form.alamatPerusahaan} onChange={(value) => updateForm("alamatPerusahaan", value)} />
                        <InputField label="Tahun Periode Audit" icon={Calendar} value={form.tahunPeriode} onChange={(value) => updateForm("tahunPeriode", value)} />
                        <FileField value={form.fileKtp} onChange={(value) => updateForm("fileKtp", value)} />
                    </div>
                </section>

                <section className="rounded-xl border border-[#DCE5EF] bg-white p-5">
                    <SectionHeading icon={Search} title="Analisis Profil" description="Ringkasan profil klien untuk penilaian PMPJ." />
                    <div className="mt-4 space-y-2">
                        <ProfileRow label="Pengguna Jasa" value={form.namaPerusahaan} />
                        <ProfileRow label="Profil Pengguna Jasa" value="PT" />
                        <ProfileRow label="Profil Domisili" value={form.alamatPerusahaan} />
                        <ProfileRow label="Beneficial Owner" value={form.nama} />
                    </div>
                </section>

                <section className="rounded-xl border border-[#DCE5EF] bg-white p-5">
                    <SectionHeading icon={Shield} title="Penilaian Risiko" description="Pilih kategori profil untuk menentukan tingkat risiko." />
                    <div className="mt-4 overflow-visible">
                        <div className="min-w-[720px]">
                            <div className="grid grid-cols-[38px_190px_minmax(300px,1fr)_82px] gap-3 bg-[#F8FAFC] px-3 py-3.5 font-poppins text-xs font-semibold uppercase text-[#607089]">
                                <span>No</span><span>Jenis Profil</span><span>Kategori Profil</span><span className="text-center">Resiko</span>
                            </div>
                            {riskRows.map((row, index) => (
                                <div key={row.profile} className="grid grid-cols-[38px_190px_minmax(300px,1fr)_82px] items-center gap-3 border-b border-[#EEF2F6] px-3 py-3 font-poppins text-xs text-[#526176]">
                                    <span>{index + 1}</span>
                                    <span>{row.profile}</span>
                                    <CategoryDropdown
                                        value={row.category}
                                        options={categoryOptions[index]}
                                        isOpen={openRiskIndex === index}
                                        onToggle={() => setOpenRiskIndex(openRiskIndex === index ? null : index)}
                                        onChange={(category) => {
                                            updateRisk(index, category);
                                            setOpenRiskIndex(null);
                                        }}
                                    />
                                    <RiskBadge risk={row.risk} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="flex h-10 items-center gap-2 rounded-md bg-[#009D0B] px-5 font-poppins text-sm font-semibold text-white hover:bg-[#008509]">
                            <Save size={16} /> Simpan
                        </button>
                    </div>
                </section>
            </form>
        </div>
    );
}

function SectionIcon({ icon: Icon }) {
    return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F7FE]"><Icon size={20} strokeWidth={1.8} className="text-[#38BDF8]" /></div>;
}

function SectionHeading({ icon: Icon, title, description }) {
    return <div className="flex items-start gap-3"><SectionIcon icon={Icon} /><div><h3 className="font-poppins text-base font-semibold text-[#1F2937]">{title}</h3><p className="font-poppins text-xs text-[#7B8794]">{description}</p></div></div>;
}

function InputField({ label, icon: Icon, value, onChange, className = "" }) {
    return <label className={`block ${className}`}><span className="mb-1 block font-poppins text-xs font-semibold text-[#26364D]">{label}</span><span className="flex h-10 overflow-hidden rounded-md border border-[#D5DFEA] focus-within:border-[#38BDF8]"><span className="flex w-10 shrink-0 items-center justify-center border-r border-[#D5DFEA] text-[#718096]"><Icon size={15} strokeWidth={1.6} /></span><input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 px-3 font-poppins text-xs text-[#526176] outline-none" /></span></label>;
}

function FileField({ value, onChange }) {
    const inputRef = useRef(null);

    return (
        <div>
            <span className="mb-1 block font-poppins text-xs font-semibold text-[#26364D]">
                File KTP
            </span>
            <div className="flex h-10 overflow-hidden rounded-md border border-[#D5DFEA]">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="shrink-0 border-r border-[#D5DFEA] bg-[#F8FAFC] px-4 font-poppins text-xs text-[#526176] hover:bg-[#F1F5F9]"
                >
                    Choose File
                </button>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="min-w-0 flex-1 truncate px-3 text-left font-poppins text-xs text-[#718096]"
                >
                    {value || "No file chosen"}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => onChange(event.target.files?.[0]?.name || value)}
                    className="hidden"
                />
            </div>
        </div>
    );
}

function ProfileRow({ label, value }) {
    return <div className="grid grid-cols-[150px_8px_minmax(0,1fr)] items-center gap-2 font-poppins text-xs"><span className="font-semibold text-[#26364D]">{label}</span><span>:</span><span className="h-9 rounded-md border border-[#D5DFEA] px-3 py-2 text-[#526176]">{value}</span></div>;
}

function CategoryDropdown({ value, options, isOpen, onToggle, onChange }) {
    return (
        <div className="relative min-w-0">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={onToggle}
                className="flex h-10 w-full items-center justify-between gap-2 rounded border border-[#D5DFEA] bg-white px-3 text-left text-xs text-[#526176] outline-none hover:border-[#38BDF8] focus:border-[#38BDF8]"
            >
                <span className="truncate">{value}</span>
                <ChevronDown size={13} className="shrink-0 text-[#526176]" />
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    className="absolute left-0 top-full z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-[#CBD5E1] bg-white py-1 shadow-lg"
                >
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            role="option"
                            aria-selected={option === value}
                            onClick={() => onChange(option)}
                            className={`block w-full px-3 py-2.5 text-left text-xs ${option === value ? "bg-[#F1F5F9] font-semibold text-[#0F4C81]" : "text-[#526176]"} hover:bg-[#E8F7FE]`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function RiskBadge({ risk }) {
    const isHigh = risk === "Tinggi";
    const isMedium = risk === "Menengah";
    return <span className={`inline-flex w-20 justify-center whitespace-nowrap rounded px-2 py-1.5 text-[11px] font-semibold ${isHigh ? "bg-[#FDE8E8] text-[#EF4444]" : isMedium ? "bg-[#FFF4D6] text-[#D97706]" : "bg-[#D9FBEA] text-[#16A34A]"}`}>{risk}</span>;
}
