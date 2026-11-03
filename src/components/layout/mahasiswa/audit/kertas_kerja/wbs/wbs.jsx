const columns = ["Per Book", "AJE/RJE", "Audited Berjalan", "Audited Sebelum"];

const sections = [
    {
        title: "ASET",
        tone: "green",
        groups: [
            {
                title: "Aset Lancar",
                rows: [
                    ["Kas dan Setara Kas", "10.503.688.356", "−264.599.270", "10.239.089.086", "8.922.205.102"],
                    ["Piutang", "15.938.721.861", "−3.533.423.824", "12.405.298.037", "13.425.635.018"],
                    ["Persediaan", "10.166.222.591", "2.029.708.641", "12.195.931.232", "8.675.313.465"],
                    ["Aset Lain-Lain", "1.212.785.408", "0", "1.212.785.408", "990.408.728"],
                    ["Total Aset Lancar", "37.821.418.216", "−1.768.314.453", "36.053.103.763", "32.013.562.313", true],
                ],
            },
            {
                title: "Aset Tidak Lancar",
                rows: [
                    ["Aset Tetap", "6.714.342.814", "4.000.000", "6.718.342.814", "7.205.756.875"],
                    ["Total Aset Tidak Lancar", "6.714.342.814", "4.000.000", "6.718.342.814", "7.205.756.875", true],
                ],
            },
        ],
        total: ["TOTAL ASET", "44.535.761.030", "−1.764.314.453", "42.771.446.577", "39.219.319.188"],
    },
    {
        title: "LIABILITAS",
        tone: "red",
        groups: [
            {
                title: "Liabilitas Jangka Pendek",
                rows: [
                    ["Utang Usaha", "10.360.509.500", "−162.500.000", "10.198.009.500", "10.429.838.605"],
                    ["Utang Pajak", "896.288.908", "314.568.498", "1.210.857.406", "1.413.469.976"],
                    ["Total Liabilitas Jangka Pendek", "11.256.798.408", "152.068.498", "11.408.866.906", "11.843.308.581", true],
                ],
            },
            {
                title: "Liabilitas Jangka Panjang",
                rows: [
                    ["Utang Bank", "10.807.643.856", "0", "10.807.643.856", "10.957.714.385"],
                    ["Total Liabilitas Jangka Panjang", "10.807.643.856", "0", "10.807.643.856", "10.957.714.385", true],
                ],
            },
        ],
        total: ["TOTAL LIABILITAS", "22.064.442.264", "152.068.498", "22.216.510.762", "22.801.022.966"],
    },
    {
        title: "EKUITAS",
        tone: "amber",
        groups: [
            {
                title: "Ekuitas",
                rows: [
                    ["Saldo Laba", "10.818.296.222", "0", "10.818.296.222", "5.883.630.055"],
                    ["Modal Saham", "5.600.000.000", "0", "5.600.000.000", "5.600.000.000"],
                    ["Dividen", "0", "0", "0", "0"],
                    ["Saldo Laba Tahun Berjalan", "6.053.022.544", "−1.920.384.181", "4.132.638.363", "4.934.666.167"],
                    ["TOTAL EKUITAS", "22.471.318.766", "−1.920.384.181", "20.550.934.585", "16.418.296.222", true],
                ],
            },
        ],
        total: null,
    },
];

const toneStyles = {
    green: {
        header: "bg-[#F0FDF4] text-[#16803B]",
        total: "text-[#16803B]",
    },
    red: {
        header: "bg-[#FFF7F7] text-[#D62828]",
        total: "text-[#D62828]",
    },
    amber: {
        header: "bg-[#FFFCF0] text-[#B77900]",
        total: "text-[#B77900]",
    },
};

function DataRow({ row }) {
    const [label, ...values] = row;
    const isTotal = row[5] === true;

    return (
        <tr
            className={`border-t border-[#E8EEF4] ${
                isTotal ? "font-semibold text-[#334155]" : "text-[#64748B]"
            }`}
        >
            <td className="px-4 py-2.5 text-left font-poppins text-xs">
                {label}
            </td>
            {values.slice(0, 4).map((value, index) => (
                <td
                    key={`${label}-${index}`}
                    className="px-3 py-2.5 text-right font-poppins text-xs"
                >
                    {value}
                </td>
            ))}
        </tr>
    );
}

function TotalRow({ row, className }) {
    const [label, ...values] = row;

    return (
        <div className={`border-t border-[#DCE5EF] px-4 py-3 ${className}`}>
            <div className="grid grid-cols-[1.4fr_repeat(4,1fr)] items-center">
                <span className="font-poppins text-xs font-bold">{label}</span>
                {values.map((value, index) => (
                    <span
                        key={`${label}-${index}`}
                        className="px-3 text-right font-poppins text-xs font-bold"
                    >
                        {value}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function Wbs() {
    return (
        <div className="space-y-3">
            {sections.map((section) => (
                <section
                    key={section.title}
                    className="overflow-hidden rounded-xl border border-[#DCE5EF] bg-white"
                >
                    <div className={`border-b border-[#DCE5EF] px-4 py-3 ${toneStyles[section.tone].header}`}>
                        <h2 className="font-poppins text-xs font-bold">
                            {section.title}
                        </h2>
                    </div>

                    {section.groups.map((group) => (
                        <div key={`${section.title}-${group.title}`}>
                            <div className="border-b border-[#E8EEF4] px-4 py-2.5 font-poppins text-xs text-[#94A3B8]">
                                {group.title}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] table-fixed border-collapse">
                                    <thead className="sr-only">
                                        <tr>
                                            <th>Keterangan</th>
                                            {columns.map((column) => (
                                                <th key={column}>{column}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.rows.map((row) => (
                                            <DataRow key={row[0]} row={row} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {section.total && (
                        <TotalRow
                            row={section.total}
                            className={toneStyles[section.tone].total}
                        />
                    )}
                </section>
            ))}

            <TotalRow
                row={[
                    "TOTAL LIABILITAS DAN EKUITAS",
                    "44.535.761.030",
                    "−1.768.315.683",
                    "42.767.445.347",
                    "39.219.319.188",
                ]}
                className="rounded-xl border border-[#DCE5EF] bg-[#F8FAFC] text-[#1E293B]"
            />
        </div>
    );
}
