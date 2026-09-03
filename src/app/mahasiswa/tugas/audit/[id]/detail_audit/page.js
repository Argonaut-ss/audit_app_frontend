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

const [successAlert, setSuccessAlert] = useState(null);
  const [errorAlert, setErrorAlert] = useState(null);

export default function AuditPage() {
  const params = useParams();

  const [activeTab, setActiveTab] =
    useState("identifikasi");

  const [
    showIdentifikasiForm,
    setShowIdentifikasiForm,
  ] = useState(false);

  const [successAlert, setSuccessAlert] = useState(null);
  const [errorAlert, setErrorAlert] = useState(null);

  // =====================================
  // IDENTIFIKASI
  // =====================================

  const {
    identifikasiData,
    profilKlienData,
    loadingIdentifikasi,
    identifikasiError,
    fetchIdentifikasi,
  } = useIdentifikasi();


  // =====================================
  // PMPJ
  // =====================================

  const {
    pmpjData,
    loadingPmpj,
    pmpjError,
    fetchPmpj,
  } = usePmpj();


  // =====================================
  // GABUNGKAN DATA IDENTIFIKASI
  // =====================================
  // Struktur ini diperlukan oleh:
  // FormIdentifikasi
  // IdentifikasiPengguna
  //
  // {
  //   profil_klien: {...},
  //   detail_identifikasi: {...}
  // }

  const auditIdentifikasiData = {
    profil_klien:
      profilKlienData ?? {},

    detail_identifikasi:
      identifikasiData ?? {},
  };


  // =====================================
  // REFRESH DATA IDENTIFIKASI
  // =====================================

  const handleRefresh = async () => {
    await fetchIdentifikasi();
  };


  return (
    <main className="w-full pr-6">

      <AlertSuccess
        title={successAlert?.title}
        message={successAlert?.message}
        onClose={() => setSuccessAlert(null)}
      />
      <AlertError
        title={errorAlert?.title}
        message={errorAlert?.message}
        onClose={() => setErrorAlert(null)}
      />
      {/* =====================================
          PROFIL KLIEN
      ===================================== */}

      <ProfilKlien
        data={profilKlienData}
      />


      {/* =====================================
          AUDIT TAB
      ===================================== */}

      <div className="mt-4">

        <AuditTab
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />


        {/* =====================================
            TAB IDENTIFIKASI
        ===================================== */}

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

              /* =====================================
                  FORM IDENTIFIKASI
              ===================================== */

              <FormIdentifikasi
                data={auditIdentifikasiData}

                onCancel={() =>
                  setShowIdentifikasiForm(false)
                }

                onSuccess={async () => {
                  await handleRefresh();

                  setShowIdentifikasiForm(false);

                  setSuccessAlert({
                    title: "Berhasil",
                    message: "Data identifikasi berhasil disimpan.",
                  });
                }}
              />

            ) : (

              /* =====================================
                  DETAIL IDENTIFIKASI
              ===================================== */

              <IdentifikasiPengguna
                data={auditIdentifikasiData}

                onEdit={() =>
                  setShowIdentifikasiForm(true)
                }
              />

            )}

          </>

        )}


        {/* =====================================
            TAB PERIKATAN
        ===================================== */}

        {activeTab === "perikatan" && (
          <Perikatan />
        )}


        {/* =====================================
            TAB PMPJ
        ===================================== */}

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
                onSaved={async (result) => {
                  await fetchPmpj();
                  setSuccessAlert({
                    title: "Berhasil disimpan",
                    message: result?.message || "Data PMPJ berhasil disimpan.",
                  });
                }}
                onError={(error) => {
                  setErrorAlert({
                    title: "Gagal menyimpan",
                    message: error?.message || "Data PMPJ gagal disimpan.",
                  });
                }}
              />

            )}

          </>

        )}

      </div>

    </main>
  );
}