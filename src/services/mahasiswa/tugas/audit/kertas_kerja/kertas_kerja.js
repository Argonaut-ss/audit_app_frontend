import api from "@/services/api";

export async function getKertasKerja(jwbKasusId) {
    const response = await api.get(`/api/kertas-kerja/${jwbKasusId}`);

    return response.data;
}
