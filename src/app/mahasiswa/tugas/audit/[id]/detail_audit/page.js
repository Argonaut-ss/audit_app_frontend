"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import useIdentifikasi from "@/hooks/mahasiswa/tugas/audit/detail_audit/identifikasi_pengguna/use_idetifikasi";
import usePmpj from "@/hooks/mahasiswa/tugas/audit/detail_audit/pmpj/use_pmpj";

import ProfilKlien from "@/components/layout/mahasiswa/audit/layout/header/profil_klien";
import AuditTab from "@/components/layout/mahasiswa/audit/audit_tab/audit_tab";
import IdentifikasiPengguna from "@/components/layout/mahasiswa/audit/identifikasi_pengguna/identifikasi_pengguna";
import Perikatan from "@/components/layout/mahasiswa/audit/perikatan/perikatan";
import Pmpj from "@/components/layout/mahasiswa/audit/pmpj/pmpj";
import FormIdentifikasi from "@/components/layout/mahasiswa/audit/identifikasi_pengguna/form_identifikasi";

export default function AuditPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("identifikasi");
  const [showIdentifikasiForm, setShowIdentifikasiForm] = useState(false);

  const {
    identifikasiData,
    loadingIdentifikasi,
    identifikasiError,
    fetchIdentifikasi,
  } = useIdentifikasi();

  const {
    pmpjData,
    loadingPmpj,
    pmpjError,
    fetchPmpj,
  } = usePmpj();

  return (
    <main className="w-full pr-6">
      <ProfilKlien data={identifikasiData?.profil_klien} />

      <div className="mt-4">
        <AuditTab
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {activeTab === "identifikasi" && (
          <>
            {loadingIdentifikasi ? (
              <div className="rounded-b-xl bg-white p-5">
                <p className="font-poppins text-sm text-[#596275]">
                  Memuat data identifikasi...
                </p>
              </div>
            ) : identifikasiError ? (
              <div className="rounded-b-xl bg-white p-5">
                <p className="font-poppins text-sm text-red-500">
                  {identifikasiError}
                </p>
              </div>
            ) : showIdentifikasiForm ? (
              <FormIdentifikasi
                data={identifikasiData}
                onCancel={() => setShowIdentifikasiForm(false)}
                onSuccess={async () => {
                  await fetchIdentifikasi();
                  setShowIdentifikasiForm(false);
                }}
              />
            ) : (
              <IdentifikasiPengguna
                data={identifikasiData}
                onEdit={() => setShowIdentifikasiForm(true)}
              />
            )}
          </>
        )}

        {activeTab === "perikatan" && <Perikatan />}

        {activeTab === "pmpj" && (
          <>
            {loadingPmpj ? (
              <div className="rounded-b-xl bg-white p-5">
                <p className="font-poppins text-sm text-[#596275]">
                  Memuat data PMPJ...
                </p>
              </div>
            ) : pmpjError ? (
              <div className="rounded-b-xl bg-white p-5">
                <p className="font-poppins text-sm text-red-500">
                  {pmpjError}
                </p>
              </div>
            ) : (
              <Pmpj
                data={pmpjData || {}}
                onSave={async (payload) => {
                  const formData = new FormData();

                  formData.append("Nama", payload.nama || "");
                  formData.append("Jabatan", payload.jabatan || "");
                  formData.append("Alamat", payload.alamat || "");
                  formData.append("NamaPerusahaan", payload.namaPerusahaan || "");
                  formData.append("AlamatPerusahaan", payload.alamatPerusahaan || "");
                  formData.append("TahunPeriode", payload.tahunPeriode || "");

                  if (payload.fileKtpFile instanceof File) {
                    formData.append("FileKTP", payload.fileKtpFile);
                  }

                  const riskRows = Array.isArray(payload.penilaianRisiko)
                    ? payload.penilaianRisiko.map((row, index) => ({
                        profile_name: row.profile,
                        profile_type: row.category,
                        selected_category: row.category,
                        risk_level: row.risk,
                        sort_order: index,
                      }))
                    : [];

                  formData.append("risk_rows", JSON.stringify(riskRows));

                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pmpj/${params.id}`,
                    {
                      method: "PUT",
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: formData,
                    }
                  );

                  const result = await response.json();

                  if (!response.ok) {
                    throw new Error(
                      result?.message || "Gagal menyimpan data PMPJ"
                    );
                  }

                  await fetchPmpj();
                  return result;
                }}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}