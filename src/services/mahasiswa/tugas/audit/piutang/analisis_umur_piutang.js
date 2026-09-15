import api from "@/services/api";

const basePath = (jwbKasusId) =>
  `/api/jwb-kasus/${jwbKasusId}/analisis-umur-piutang`;

/**
 * Ambil data analisis umur piutang.
 * @returns {{ rows: Array, SaldoAuditor: number, SaldoBB: number, Selisih: number }}
 */
export async function getAnalisisUmur(jwbKasusId) {
  const response = await api.get(basePath(jwbKasusId));
  return response.data?.data ?? { rows: [], SaldoAuditor: 0, SaldoBB: 0, Selisih: 0 };
}

/**
 * Simpan (sync/replace) seluruh data analisis umur piutang.
 * @param {number} jwbKasusId
 * @param {{ rows: Array<{ KelompokUmur: string, Jumlah: number, Kerugian: number }>, SaldoBB: number }} payload
 * @returns {{ rows: Array, SaldoAuditor: number, SaldoBB: number, Selisih: number }}
 */
export async function syncAnalisisUmur(jwbKasusId, payload) {
  const response = await api.post(basePath(jwbKasusId), payload);
  return response.data?.data ?? { rows: [], SaldoAuditor: 0, SaldoBB: 0, Selisih: 0 };
}

