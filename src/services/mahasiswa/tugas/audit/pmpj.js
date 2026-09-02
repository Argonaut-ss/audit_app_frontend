import api from "@/services/api";

export async function getPmpjRiskConfig() {
  const response = await api.get('/api/pmpj/risk-config');
  return response.data?.data ?? [];
}

export async function getPmpj(jwbKasusId) {
  const response = await api.get(`/api/pmpj/${jwbKasusId}`);
  return response.data?.data ?? null;
}

export async function updatePmpj(jwbKasusId, data) {
  const payload = {
    Nama: data.nama ?? data.Nama ?? null,
    Jabatan: data.jabatan ?? data.Jabatan ?? null,
    Alamat: data.alamat ?? data.Alamat ?? null,
    NamaPerusahaan: data.namaPerusahaan ?? data.NamaPerusahaan ?? null,
    AlamatPerusahaan: data.alamatPerusahaan ?? data.AlamatPerusahaan ?? null,
    TahunPeriode: data.tahunPeriode ?? data.TahunPeriode ?? null,
    NamaFileKTP: data.NamaFileKTP ?? data.namaFileKtp ?? null,
    FileKTP: data.fileKtp ?? data.FileKTP ?? null,
    risk_rows: Array.isArray(data.risk_rows)
      ? data.risk_rows.map((row, index) => ({
          profile_name: row.profile_name ?? row.profile ?? row.profileName ?? null,
          profile_type: row.profile_type ?? row.category ?? row.profileType ?? null,
          selected_category: row.selected_category ?? row.category ?? row.selectedCategory ?? null,
          risk_level: row.risk_level ?? row.risk ?? row.riskLevel ?? null,
          sort_order: row.sort_order ?? index,
        }))
      : [],
  };

  const response = await api.put(`/api/pmpj/${jwbKasusId}`, payload);
  return response.data;
}
