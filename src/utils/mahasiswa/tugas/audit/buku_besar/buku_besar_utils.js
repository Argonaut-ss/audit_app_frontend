
export const formatNominal = (value) => {
    return Number(value ?? 0).toLocaleString("id-ID");
};

export const mapBukuBesarRows = (rows = []) => {
    return rows.map((item) => {
        const perBook = Number(item.PerBook ?? 0);
        const ajeRje = Number(item.AJE_RJE ?? 0);

        // Audited Berjalan dihitung di frontend
        const auditedBerjalan = perBook + ajeRje;

        return {
            id: String(item.COAID),
            account: item.NamaAkun,
            perBook: formatNominal(perBook),
            ajeRje: formatNominal(ajeRje),
            auditedBerjalan: formatNominal(auditedBerjalan),
            auditedSebelum: formatNominal(item.AuditSebelum),
        };
    });
};
