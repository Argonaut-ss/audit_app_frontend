
import api from "@/services/api";

// KONSTANTA JENIS DOKUMEN

export const JENIS_FILE_LHA = [
    "laporan_hasil_audit",
    "laporan_auditor_independen",
    "surat_representasi_manajemen",
    "surat_pmpj",
    "persetujuan_jurnal_koreksi_audit",
    "pernyataan_direksi",
    "persetujuan_penerbitan_laporan_keuangan_audit",
    "persetujuan_penyerahan_lapkeu_audit",
];

// GET SEMUA LAPORAN HASIL AUDIT
export async function getLaporanHasilAudit() {
    const response = await api.get("/api/laporan-hasil-audit");

    return response.data;
}

// GET LAPORAN BERDASARKAN JWBKASUSID

export async function getLaporanHasilAuditByKasus(jwbKasusId) {
    const response = await getLaporanHasilAudit();

    const laporanList = response?.data ?? [];

    const laporan = laporanList.find(
        (item) => Number(item.JwbKasusID) === Number(jwbKasusId)
    );

    return {
        success: true,
        data: laporan ?? null,
    };
}

// SAVE LAPORAN HASIL AUDIT

export async function saveLaporanHasilAudit({
    laporanId = null,
    jwbKasusId,
    opiniAudit,
    files = [],
}) {
    const formData = new FormData();

    formData.append("JwbKasusID", jwbKasusId);
    formData.append("opini_audit", opiniAudit);

    files.forEach((document, index) => {
        formData.append(
            `files[${index}][jenis_file]`,
            document.jenis_file
        );

        formData.append(
            `files[${index}][tipe_input]`,
            document.tipe_input
        );

        if (document.tipe_input === "file" && document.file instanceof File) {
            formData.append(
                `files[${index}][file]`,
                document.file
            );
        }

        if (document.tipe_input === "link") {
            formData.append(
                `files[${index}][link]`,
                document.link ?? ""
            );
        }
    });

    // CREATE
    if (!laporanId) {
        const response = await api.post(
            "/api/laporan-hasil-audit",
            formData
        );

        return response.data;
    }

    // UPDATE
    // Laravel menerima multipart melalui POST dengan method spoofing.
    formData.append("_method", "PUT");

    const response = await api.post(
        `/api/laporan-hasil-audit/${laporanId}`,
        formData
    );

    return response.data;
}

// GET FILE LAPORAN HASIL AUDIT

export async function getFileLaporanHasilAudit(fileUrl) {
    const response = await api.get(fileUrl, {
        responseType: "blob",
    });

    return response.data;
}

// DELETE LAPORAN HASIL AUDIT

export async function deleteLaporanHasilAudit(laporanId) {
    const response = await api.delete(
        `/api/laporan-hasil-audit/${laporanId}`
    );

    return response.data;
}
