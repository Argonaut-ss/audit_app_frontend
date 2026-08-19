"use client";
import { useEffect, useState } from "react";

import { useKelas } from "@/hooks/mahasiswa/kelas/use_kelas";
import { Search, CircleHelp } from "lucide-react";

import KelasCard from "@/components/layout/mahasiswa/kelas/kelas_card";

export default function MahasiswaKelasPage() {
    const [search, setSearch] = useState("");

    const { kelasList, loading } = useKelas();

    const filteredKelas = kelasList.filter((kelas) => {
        const keyword = search.toLowerCase();

        return (
            kelas.kode_kelas?.toLowerCase().includes(keyword) ||
            kelas.tipe_kelas?.toLowerCase().includes(keyword) ||
            kelas.nama_perusahaan?.toLowerCase().includes(keyword) ||
            kelas.nama_dosen?.toLowerCase().includes(keyword)
        );
    });
    console.log(filteredKelas);

    return (
        <div className="min-h-screen px-10 py-10">

            {/* Title */}
            <div className="flex items-center gap-2">
                <h1 className="font-poppins text-[28px] font-semibold text-[#293144]">
                    DATA KELAS
                </h1>

                <CircleHelp
                    size={20}
                    strokeWidth={2}
                    className="text-[#20A9E5]"
                />
            </div>

            {/* Search */}
            <div className="mt-7">
                <div className="flex h-[46px] w-[340px] items-center rounded-lg border border-[#D9DEE8] bg-white px-4">
                    <Search
                        size={17}
                        strokeWidth={1.8}
                        className="mr-3 text-[#3B82F6]"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari Kelas"
                        className="w-full bg-transparent font-poppins text-sm text-[#293144] outline-none placeholder:text-[#888888]"
                    />
                </div>
            </div>

            {/* Card wrapper */}
            <div className="mt-4 rounded-xl bg-white p-4">
                {loading ? (
                    <div className="flex h-[250px] items-center justify-center">
                        <p className="font-poppins text-sm text-[#9CA3AF]">
                            Loading...
                        </p>
                    </div>
                ) : filteredKelas.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {filteredKelas.map((kelas) => (
                            <KelasCard
                                key={`${kelas.kode_kelas}-${kelas.kode_dosen}`}
                                kelas={kelas}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-[250px] items-center justify-center">
                        <p className="font-poppins text-sm text-[#9CA3AF]">
                            No Data
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}