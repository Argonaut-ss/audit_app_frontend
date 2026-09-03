import api from "@/services/api";

/* =====================================
   GET IDENTIFIKASI
===================================== */

export async function getIdentifikasi(jwbKasusId) {
  const response = await api.get(
    `/api/identifikasi/${jwbKasusId}`
  );

  return response.data?.data ?? null;
}


/* =====================================
   UPDATE IDENTIFIKASI
===================================== */

export async function updateIdentifikasi(
  jwbKasusId,
  data
) {
  // Laravel method spoofing untuk
  // multipart/form-data + update
  data.append("_method", "PUT");

  const response = await api.post(
    `/api/identifikasi/${jwbKasusId}`,
    data
  );

  return response.data;
}