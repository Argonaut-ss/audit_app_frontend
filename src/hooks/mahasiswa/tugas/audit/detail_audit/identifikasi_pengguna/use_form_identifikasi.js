"use client";

import {
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";

import {
  updateIdentifikasi,
} from "@/services/mahasiswa/tugas/audit/identifikasi_pengguna";

import {
  initialFormIdentifikasi,
  mapIdentifikasiToForm,
  mapExistingFiles,
  buildIdentifikasiFormData,
} from "@/utils/mahasiswa/tugas/audit/identifikasi_pengguna/form_identifikasi";


export default function useFormIdentifikasi({
  data,
  onSuccess,
}) {
  const params = useParams();


  // =============================
  // FORM
  // =============================

  const [form, setForm] =
    useState(initialFormIdentifikasi);


  // =============================
  // FILE
  // =============================

  const [fileAkta, setFileAkta] =
    useState(null);

  const [fileNPWP, setFileNPWP] =
    useState(null);

  const [
    fileStrukturOrganisasi,
    setFileStrukturOrganisasi,
  ] = useState(null);


  // =============================
  // EXISTING FILE
  // =============================

  const [
    existingFiles,
    setExistingFiles,
  ] = useState({
    akta: false,
    npwp: false,
    struktur: false,
  });


  // =============================
  // SUBMIT
  // =============================

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");


  // =============================
  // PREFILL
  // =============================

  useEffect(() => {
    if (!data) return;

    setForm(
      mapIdentifikasiToForm(data)
    );

    setExistingFiles(
      mapExistingFiles(data)
    );

  }, [data]);


  // =============================
  // INPUT CHANGE
  // =============================

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  // =============================
  // SUBMIT
  // =============================

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const formData =
        buildIdentifikasiFormData({
          form,
          fileAkta,
          fileNPWP,
          fileStrukturOrganisasi,
        });


      await updateIdentifikasi(
        params.id,
        formData
      );


      if (onSuccess) {
        await onSuccess();
      }

    } catch (error) {

      console.error(
        "Gagal menyimpan identifikasi:",
        error
      );

      const errors =
        error.response?.data?.errors;

      if (errors) {
        const firstError =
          Object.values(errors)?.[0]?.[0];

        setSubmitError(
          firstError ||
          "Gagal menyimpan data identifikasi."
        );

      } else {

        setSubmitError(
          error.response?.data?.message ||
          error.message ||
          "Gagal menyimpan data identifikasi."
        );
      }

    } finally {
      setIsSubmitting(false);
    }
  }


  return {
    form,
    existingFiles,

    fileAkta,
    fileNPWP,
    fileStrukturOrganisasi,

    isSubmitting,
    submitError,

    handleChange,
    handleSubmit,

    setFileAkta,
    setFileNPWP,
    setFileStrukturOrganisasi,
  };
}