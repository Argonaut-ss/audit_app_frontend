"use client";

import { useState } from "react";

import ProfilKlien from "@/components/layout/mahasiswa/audit/layout/header/profil_klien";
import AuditTab from "@/components/layout/mahasiswa/audit/audit_tab/audit_tab";
import IdentifikasiPengguna from "@/components/layout/mahasiswa/audit/identifikasi_pengguna/identifikasi_pengguna";
import Perikatan from "@/components/layout/mahasiswa/audit/perikatan/perikatan";
import Pmpj from "@/components/layout/mahasiswa/audit/pmpj/pmpj";

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState("identifikasi");

  return (
    <main className="w-full pr-6">
      <ProfilKlien />

      <div className="mt-4">
        <AuditTab
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {activeTab === "identifikasi" && (
          <IdentifikasiPengguna />
        )}

        {activeTab === "perikatan" && (
          <Perikatan/>
        )}

        {activeTab === "pmpj" && (
          <Pmpj/>
        )}
      </div>
    </main>
  );
}