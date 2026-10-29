
import api from "@/services/api";

// Mengambil data Buku Besar berdasarkan kasus dan mapping akun.
export async function getBukuBesar({
    jwbKasusId,
    top,
    subMapping,
}) {
    const response = await api.get(
        `/api/buku-besar/${jwbKasusId}`,
        {
            params: {
                Top: top,
                ...(subMapping ? { SubMapping: subMapping } : {}),
            },
        }
    );

    return response.data;
}

// Menyimpan tanggal Buku Besar.
export async function updateTanggalBukuBesar({
    jwbKasusId,
    top,
    tanggalPerBook,
    tanggalAuditJln,
    tanggalAuditSblm,
}) {
    const payload = {
        Top: top,
        TanggalPerBook: tanggalPerBook || null,
        TanggalAuditJln: tanggalAuditJln || null,
        TanggalAuditSblm: tanggalAuditSblm || null,
    };

    const response = await api.put(
        `/api/buku-besar/${jwbKasusId}`,
        payload
    );

    return response.data;
}
