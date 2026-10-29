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

// Menyimpan data Buku Besar (tanggal dan/atau baris akun).
export async function updateBukuBesar({
    jwbKasusId,
    top,
    tanggalAuditSblm,
    items,
}) {
    const payload = {
        Top: top,
        TanggalAuditSblm: tanggalAuditSblm || null,
        ...(items !== undefined ? { items } : {}),
    };

    const response = await api.put(
        `/api/buku-besar/${jwbKasusId}`,
        payload
    );

    return response.data;
}