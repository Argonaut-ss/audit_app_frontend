import api from "@/services/api";

/**
 * Mengambil status checklist dari seluruh 9 modul Pengujian Substantif
 * dalam 1 request batch tunggal ke backend.
 *
 * @param {string|number} jwbKasusId
 * @returns {Promise<Record<string, Record<string, boolean>>>}
 */
export async function getPengujianSubstantifStatus(jwbKasusId) {
  const response = await api.get(`/api/pengujian-substantif/${jwbKasusId}`);
  return response.data?.data ?? {};
}

