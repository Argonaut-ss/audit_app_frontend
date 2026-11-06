import api from "@/services/api";

export async function getRekapJurnalKoreksi(jwbKasusId) {
    const response = await api.get(`/api/rekap-jurnal-koreksi/${jwbKasusId}`);

    return response.data?.data ?? {};
}
