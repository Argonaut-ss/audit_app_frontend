export const formatNominal = (value) => {
    if (value === null || value === undefined || value === "") return "0";
    const num = Number(value);
    return Number.isFinite(num) ? num.toLocaleString("id-ID") : String(value);
};

export const mapBukuBesarRows = (rows = [], subMapping = "") => {
    return (rows || []).map((item, index) => {
        const perBook = Number(item.PerBook ?? 0);
        const ajeRje = Number(item.AJE_RJE ?? 0);
        const auditedBerjalan =
            item.AuditedBerjalan !== undefined && item.AuditedBerjalan !== null
                ? Number(item.AuditedBerjalan)
                : perBook + ajeRje;
        const auditedSebelum = Number(item.AuditSebelum ?? 0);

        return {
            id: `${item.COAID ?? "row"}-${index}-${crypto.randomUUID()}`,
            COAID: item.COAID,
            NoAkun: item.NoAkun ?? "",
            SubMapping: item.SubMapping ?? subMapping ?? "",
            account: item.NamaAkun,
            perBook: formatNominal(perBook),
            ajeRje: formatNominal(ajeRje),
            auditedBerjalan: formatNominal(auditedBerjalan),
            auditedSebelum: formatNominal(auditedSebelum),
        };
    });
};
