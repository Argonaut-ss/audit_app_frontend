"use client";

import { useEffect, useState } from "react";

export default function EditDosenModal({
    isOpen,
    dosen,
    onClose,
    onSave,
}) {


    const [form, setForm] = useState({
        kode_dosen: "",
        name: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (dosen) {
            setForm({
                kode_dosen: dosen.kode_dosen || "",
                name: dosen.name || "",
                email: dosen.email || "",
                password: "",
            });
        }
    }, [dosen]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        onSave(form);
    };

    if (!isOpen || !dosen) {
        return null;
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-[835px] rounded-xl bg-white px-8 py-7 shadow-xl">

                {/* Header */}
                <div className="mb-7 flex items-center justify-between">
                    <h2 className="font-poppins text-xl font-bold text-[#293144]">
                        Update Data Dosen
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl font-bold text-[#888888] hover:text-black"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <div className="grid grid-cols-2 gap-x-9 gap-y-5">

                    {/* Kode Dosen*/}
                    <div>
                        <label className="mb-2 block font-poppins text-sm font-semibold text-[#596275]">
                            KODE DOSEN
                        </label>

                        <input
                            type="text"
                            name="kode_dosen"
                            value={form.kode_dosen}
                            disabled
                            className="h-[42px] w-full cursor-not-allowed rounded-md border border-[#D8DEE9] bg-[#F3F4F6] px-3 font-poppins text-sm text-[#9CA3AF] outline-none"
                        />
                    </div>

                    {/* Nama */}
                    <div>
                        <label className="mb-2 block font-poppins text-sm font-semibold text-[#596275]">
                            Nama
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            disabled
                            className="h-[42px] w-full cursor-not-allowed rounded-md border border-[#D8DEE9] bg-[#F3F4F6] px-3 font-poppins text-sm text-[#9CA3AF] outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="mb-2 block font-poppins text-sm font-semibold text-[#596275]">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            disabled
                            className="h-[42px] w-full cursor-not-allowed rounded-md border border-[#D8DEE9] bg-[#F3F4F6] px-3 font-poppins text-sm text-[#9CA3AF] outline-none"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-2 block font-poppins text-sm font-semibold text-[#596275]">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Masukkan password baru"
                            className="h-[42px] w-full rounded-md border border-[#D8DEE9] px-3 font-poppins text-sm text-[#293144] outline-none focus:border-[#3B82F6]"
                        />
                    </div>

                </div>

                {/* Buttons */}
                <div className="mt-7 flex justify-end gap-3">

                    {/* <button
                        type="button"
                        onClick={onClose}
                        className="h-[38px] rounded-md bg-[#E52B2B] px-6 font-poppins text-sm font-semibold text-white hover:bg-[#D91F1F]"
                    >
                        Keluar
                    </button> */}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="h-[38px] rounded-md bg-[#3B82F6] px-7 font-poppins text-sm font-semibold text-white hover:bg-[#2563EB]"
                    >
                        Simpan
                    </button>

                </div>
            </div>
        </div>
    );
}