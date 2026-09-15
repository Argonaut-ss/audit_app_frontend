import api from "@/services/api";
import { getPiutang } from "@/services/mahasiswa/tugas/audit/piutang/piutang";

const basePath = "/api/analisis-umur-piutang";

async function resolvePiutangId(jwbKasusId) {
  const piutang = await getPiutang(jwbKasusId);
  const piutangId = piutang?.PiutangID;

  if (!piutangId) {
    throw new Error("Data piutang tidak tersedia.");
  }

  return piutangId;
}

/**
 * Ambil data analisis umur piutang.
 * @returns {{ rows: Array, SaldoAuditor: number, SaldoBB: number, Selisih: number }}
 */
export async function getAnalisisUmur(jwbKasusId) {
  const piutangId = await resolvePiutangId(jwbKasusId);
  const response = await api.get(basePath, {
    params: { PiutangID: piutangId },
  });

  return response.data?.data ?? { rows: [], SaldoAuditor: 0, SaldoBB: 0, Selisih: 0 };
}

/**
 * Simpan (sync/replace) seluruh data analisis umur piutang.
 * @param {number} jwbKasusId
 * @param {{ rows: Array<{ KelompokUmur: string, Jumlah: number, Kerugian: number }>, SaldoBB: number }} payload
 * @returns {{ rows: Array, SaldoAuditor: number, SaldoBB: number, Selisih: number }}
 */
export async function syncAnalisisUmur(jwbKasusId, payload) {
  const piutangId = await resolvePiutangId(jwbKasusId);
  const response = await api.post(basePath, {
    PiutangID: piutangId,
    ...payload,
  });

  return response.data?.data ?? { rows: [], SaldoAuditor: 0, SaldoBB: 0, Selisih: 0 };
}
