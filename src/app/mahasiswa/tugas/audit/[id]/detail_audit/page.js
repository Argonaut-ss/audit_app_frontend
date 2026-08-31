"use client";

import { useState } from "react";

import useIdentifikasi from "@/hooks/mahasiswa/tugas/audit/detail_audit/identifikasi_pengguna/use_idetifikasi";

import ProfilKlien from "@/components/layout/mahasiswa/audit/layout/header/profil_klien";
import AuditTab from "@/components/layout/mahasiswa/audit/audit_tab/audit_tab";
import IdentifikasiPengguna from "@/components/layout/mahasiswa/audit/identifikasi_pengguna/identifikasi_pengguna";
import Perikatan from "@/components/layout/mahasiswa/audit/perikatan/perikatan";
import Pmpj from "@/components/layout/mahasiswa/audit/pmpj/pmpj";
import FormIdentifikasi from "@/components/layout/mahasiswa/audit/identifikasi_pengguna/form_identifikasi";

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState("identifikasi");
  const [showIdentifikasiForm, setShowIdentifikasiForm] = useState(false);

  const {
    identifikasiData,
    loadingIdentifikasi,
    identifikasiError,
    fetchIdentifikasi,
  } = useIdentifikasi();

  return (
    <main className="w-full pr-6">
      <ProfilKlien />

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

        {activeTab === "pmpj" && <Pmpj />}
      </div>
    </main>
  );
}