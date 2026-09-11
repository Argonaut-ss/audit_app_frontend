"use client";

import { useEffect, useState } from "react";

import {
  Wallet,
  Layers3,
  Share2,
  Clock3,
  Hash,
  X,
} from "lucide-react";

import Dropdown from "@/components/layout/mahasiswa/audit/coa/coa_dropdown";

const initialFormData = {
  NamaAkun: "",
  MappingGroup: "",
  MapKelompok: "",
  MappingTop: "",
  SubMappingTop: "",
  NoAkun: "",
  Saldo: "",
};

export default function CoaForm({
  isOpen,
  mode = "create",
  initialData = null,
  onClose,
  onSubmit,
  isSubmitting = false,

}) {
  const [formData, setFormData] =
    useState(initialFormData);

  // useEffect(() => {
  //   if (isOpen) {
  //     setFormData(initialFormData);
  //   }
  // }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (mode === "edit" && initialData) {
      setFormData({
        NamaAkun: initialData.namaAkun ?? "",
        MappingGroup:
          initialData.mappingGroup ?? "",
        MapKelompok:
          initialData.mapKelompok ?? "",
        MappingTop:
          initialData.mappingTop ?? "",
        SubMappingTop:
          initialData.subMappingTop ?? "",
        NoAkun: initialData.noAkun ?? "",
        Saldo: initialData.saldo ?? "",
      });

      return;
    }

    setFormData(initialFormData);
  }, [isOpen, mode, initialData]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [field]: value,
      };

      if (field === "MappingTop") {
        const hasSubMapping =
          value in subMappingTopOptionsByMapping;

        if (!hasSubMapping) {
          updatedData.SubMappingTop = "";
        }
      }

      return updatedData;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit(formData);
  };

  const mappingGroupOptions = [
    { value: "Aset", label: "Aset" },
    { value: "Liabilitas", label: "Liabilitas" },
    { value: "Ekuitas", label: "Ekuitas" },
    { value: "Pendapatan", label: "Pendapatan" },
    { value: "Beban", label: "Beban" },
  ];

  const saldoOptions = [
    { value: "Debit", label: "Debit" },
    { value: "Kredit", label: "Kredit" },
  ];

  const mapKelompokOptions = [
    { value: "Aset Lancar", label: "Aset Lancar" },
    { value: "Aset Tidak Lancar", label: "Aset Tidak Lancar" },
    { value: "Liabilitas Jangka Pendek", label: "Liabilitas Jangka Pendek" },
    { value: "Liabilitas Jangka Panjang", label: "Liabilitas Jangka Panjang" },
    { value: "Ekuitas", label: "Ekuitas" },
    { value: "Pendapatan", label: "Pendapatan" },
    { value: "HPP", label: "HPP" },
    { value: "Beban Operasional", label: "Beban Operasional" },
    { value: "Pendapatan Lain-Lain", label: "Pendapatan Lain-Lain" },
    { value: "Beban Lain-Lain", label: "Beban Lain-Lain" },
    { value: "Komprehensif Lain-Lain", label: "Komprehensif Lain-Lain" },
    { value: "Beban Pajak", label: "Beban Pajak" },
    { value: "Pajak Penghasilan", label: "Pajak Penghasilan" },
  ];

  const mappingTopOptions = [
    { value: "Kas dan Setara Kas", label: "Kas dan Setara Kas" },
    { value: "Piutang", label: "Piutang" },
    { value: "Persediaan", label: "Persediaan" },
    { value: "Aset Lain-Lain", label: "Aset Lain-Lain" },
    { value: "Aset Tetap", label: "Aset Tetap" },
    { value: "Utang Usaha", label: "Utang Usaha" },
    { value: "Utang Bank", label: "Utang Bank" },
    { value: "Utang Pajak", label: "Utang Pajak" },
    { value: "Utang Pembiayaan", label: "Utang Pembiayaan" },
    { value: "Utang Lain-Lain", label: "Utang Lain-Lain" },
    { value: "Ekuitas", label: "Ekuitas" },
    { value: "Penjualan", label: "Penjualan" },
    { value: "Beban Pokok Penjualan", label: "Beban Pokok Penjualan" },
    { value: "Beban Usaha", label: "Beban Usaha" },
    {
      value: "Pendapatan (Beban) Lain-Lain",
      label: "Pendapatan (Beban) Lain-Lain",
    },
    { value: "Pajak Penghasilan", label: "Pajak Penghasilan" },
  ];

  const subMappingTopOptionsByMapping = {
    "Kas dan Setara Kas": [
      {
        value: "Kas dan Setara Kas",
        label: "Kas dan Setara Kas",
      },
      {
        value: "Rincian Setara Kas - Bank",
        label: "Rincian Setara Kas - Bank",
      },
    ],

    "Aset Tetap": [
      {
        value: "Aset Tetap",
        label: "Aset Tetap",
      },
      {
        value: "Akumulasi Penyusutan Aset Tetap",
        label: "Akumulasi Penyusutan Aset Tetap",
      },
    ],

    "Pendapatan (Beban) Lain-Lain": [
      {
        value: "Pendapatan Lain-Lain",
        label: "Pendapatan Lain-Lain",
      },
      {
        value: "Beban Lain-Lain",
        label: "Beban Lain-Lain",
      },
    ],
  };

  const currentSubMappingTopOptions =
    subMappingTopOptionsByMapping[formData.MappingTop] ?? [];

  const showSubMappingTop =
    formData.MappingTop in subMappingTopOptionsByMapping;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-5">
      <div className="flex max-h-[90vh] w-full max-w-[540px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#16A8E8] to-[#3FAFF0] px-7 py-5">
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <Wallet
                className="h-6 w-6 text-white"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 className="font-poppins text-lg font-semibold text-white">
                {mode === "edit"
                  ? "Edit Chart of Account"
                  : "Tambah Chart of Account"}
              </h2>

              <p className="font-poppins text-sm text-white/90">
                {mode === "edit"
                  ? "Perbarui data akun untuk kebutuhan audit"
                  : "Lengkapi data akun untuk kebutuhan audit"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/80 transition hover:text-white disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="space-y-5 px-7 py-7">

            {/* NAMA AKUN */}
            <div>
              <label className="mb-2 block font-poppins text-sm font-semibold text-[#334155]">
                Nama Akun
              </label>

              <div className="flex h-11 overflow-hidden rounded-lg border border-[#D8E2EE]">
                <div className="flex w-12 items-center justify-center border-r border-[#D8E2EE]">
                  <Wallet
                    className="h-5 w-5 text-[#64748B]"
                    strokeWidth={1.8}
                  />
                </div>

                <input
                  type="text"
                  value={formData.NamaAkun}
                  onChange={(event) =>
                    handleChange(
                      "NamaAkun",
                      event.target.value
                    )
                  }
                  placeholder="Nama Akun"
                  className="min-w-0 flex-1 px-4 font-poppins text-sm text-[#334155] outline-none placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            {/* KELOMPOK AKUN UTAMA */}
            <div>
              <label className="mb-2 block font-poppins text-sm font-semibold text-[#334155]">
                Kelompok Akun Utama
              </label>

              <div className="flex h-11 overflow-hidden rounded-lg border border-[#D8E2EE]">
                <div className="flex w-12 items-center justify-center border-r border-[#D8E2EE]">
                  <Layers3
                    className="h-5 w-5 text-[#64748B]"
                    strokeWidth={1.8}
                  />
                </div>

                <Dropdown
                  options={mappingGroupOptions}
                  value={formData.MappingGroup}
                  onChange={(value) =>
                    handleChange("MappingGroup", value)
                  }
                  placeholder="Pilih Group Akun"
                  className="flex-1"
                  triggerClassName="rounded-none border-0 hover:border-0 focus:border-0"
                />
              </div>
            </div>

            {/* KELOMPOK SUB AKUN */}
            <div>
              <label className="mb-2 block font-poppins text-sm font-semibold text-[#334155]">
                Kelompok Sub Akun
              </label>

              <div className="flex h-11 overflow-hidden rounded-lg border border-[#D8E2EE]">
                <div className="flex w-12 items-center justify-center border-r border-[#D8E2EE]">
                  <Share2
                    className="h-5 w-5 text-[#64748B]"
                    strokeWidth={1.8}
                  />
                </div>

                <Dropdown
                  options={mapKelompokOptions}
                  value={formData.MapKelompok}
                  onChange={(value) =>
                    handleChange("MapKelompok", value)
                  }
                  placeholder="Pilih Kelompok Sub Akun"
                  className="flex-1"
                  triggerClassName="rounded-none border-0 hover:border-0 focus:border-0"
                />
              </div>
            </div>

            {/* MAPPING TOP SCHEDULE */}
            <div>
              <label className="mb-2 block font-poppins text-sm font-semibold text-[#334155]">
                Mapping Top Schedule
              </label>

              <div className="flex h-11 overflow-hidden rounded-lg border border-[#D8E2EE]">
                <div className="flex w-12 items-center justify-center border-r border-[#D8E2EE]">
                  <Clock3
                    className="h-5 w-5 text-[#64748B]"
                    strokeWidth={1.8}
                  />
                </div>

                <Dropdown
                  options={mappingTopOptions}
                  value={formData.MappingTop}
                  onChange={(value) =>
                    handleChange("MappingTop", value)
                  }
                  placeholder="Pilih Kelompok Mapping Top Schedule"
                  className="flex-1"
                  triggerClassName="rounded-none border-0 hover:border-0 focus:border-0"
                />
              </div>
            </div>

            {/* SUB MAPPING TOP SCHEDULE */}
            {showSubMappingTop && (
              <div>
                <label className="mb-2 block font-poppins text-sm font-semibold text-[#334155]">
                  Sub Mapping Top Schedule
                </label>

                <div className="flex h-11 overflow-hidden rounded-lg border border-[#D8E2EE]">
                  <div className="flex w-12 shrink-0 items-center justify-center border-r border-[#D8E2EE]">
                    <Clock3
                      className="h-5 w-5 text-[#64748B]"
                      strokeWidth={1.8}
                    />
                  </div>

                  <Dropdown
                    options={currentSubMappingTopOptions}
                    value={formData.SubMappingTop}
                    onChange={(value) =>
                      handleChange("SubMappingTop", value)
                    }
                    placeholder="Pilih Sub Mapping Top Schedule"
                    className="flex-1"
                    triggerClassName="rounded-none border-0 hover:border-0 focus:border-0"
                  />
                </div>
              </div>
            )}

            {/* NO AKUN */}
            <div>
              <label className="mb-2 block font-poppins text-sm font-semibold text-[#334155]">
                No Akun
              </label>

              <div className="flex h-11 overflow-hidden rounded-lg border border-[#D8E2EE]">
                <div className="flex w-12 items-center justify-center border-r border-[#D8E2EE]">
                  <Hash
                    className="h-5 w-5 text-[#64748B]"
                    strokeWidth={1.8}
                  />
                </div>

                <input
                  type="text"
                  value={formData.NoAkun}
                  onChange={(event) =>
                    handleChange(
                      "NoAkun",
                      event.target.value
                    )
                  }
                  placeholder="No Akun"
                  className="min-w-0 flex-1 px-4 font-poppins text-sm text-[#334155] outline-none placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            {/* SALDO NORMAL */}
            <div>
              <label className="mb-2 block font-poppins text-sm font-semibold text-[#334155]">
                Saldo Normal
              </label>

              <div className="flex h-11 overflow-hidden rounded-lg border border-[#D8E2EE]">
                <div className="flex w-12 items-center justify-center border-r border-[#D8E2EE]">
                  <Wallet
                    className="h-5 w-5 text-[#64748B]"
                    strokeWidth={1.8}
                  />
                </div>

                <Dropdown
                  options={saldoOptions}
                  value={formData.Saldo}
                  onChange={(value) =>
                    handleChange("Saldo", value)
                  }
                  placeholder="Pilih Saldo Normal"
                  className="flex-1"
                  triggerClassName="rounded-none border-0 hover:border-0 focus:border-0"
                />
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 border-t border-[#E2E8F0] px-7 py-5">

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 rounded-lg bg-[#E52B2B] px-7 font-poppins text-sm font-bold text-white transition hover:bg-[#D91F1F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-lg bg-[#05A80B] px-7 font-poppins text-sm font-bold text-white transition hover:bg-[#04930A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? mode === "edit"
                  ? "Memperbarui..."
                  : "Menyimpan..."
                : mode === "edit"
                  ? "Update"
                  : "Simpan"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}