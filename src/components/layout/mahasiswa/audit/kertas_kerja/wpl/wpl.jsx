const tables = [
    { rows: [
        ["Pendapatan Usaha", "59.370.347.100", "−2.460.130.000", "56.910.217.100", "49.971.281.078"],
        ["HPP", "50.017.563.600", "−2.058.390.000", "47.959.173.600", "42.486.690.960"],
        ["LABA KOTOR", "9.352.783.500", "−401.740.000", "8.951.043.500", "7.484.590.118", true],
    ] },
    { rows: [
        ["Beban Usaha", "2.537.126.598", "1.192.855.683", "3.729.982.281", "1.953.317.605"],
        ["LABA (RUGI) USAHA", "6.815.656.902", "−1.594.595.683", "5.221.061.219", "5.531.272.513", true],
    ] },
    { rows: [
        ["Pendapatan Lain-Lain", "53.504.550", "0", "53.504.550", "44.863.630"],
        ["Beban Lain-Lain", "79.200.000", "325.788.498", "404.988.498", "36.000.000"],
        ["LABA BERSIH SEBELUM PAJAK", "6.789.961.452", "−1.920.384.181", "4.869.577.271", "5.540.136.143", true],
    ] },
    { rows: [
        ["Pajak Penghasilan", "736.938.908", "0", "736.938.908", "605.469.976"],
        ["LABA BERSIH SETELAH PAJAK", "6.053.022.544", "−1.920.384.181", "4.132.638.363", "4.934.666.167", true],
    ] },
];

export default function Wpl() {
    return (
        <div className="space-y-3">
            {tables.map((table, tableIndex) => (
                <div key={`wpl-table-${tableIndex}`} className="overflow-hidden rounded-xl border border-[#DCE5EF] bg-white">
                    {table.rows.map((row) => {
                        const [label, ...values] = row;
                        const isTotal = row[5] === true;

                        return (
                            <div
                                key={label}
                                className={`grid min-w-[720px] grid-cols-[1.4fr_repeat(4,1fr)] border-t border-[#E8EEF4] first:border-t-0 ${
                                    isTotal
                                        ? "bg-[#F8FAFC] font-bold text-[#1E293B]"
                                        : "text-[#64748B]"
                                }`}
                            >
                                <span className="px-5 py-2.5 text-left font-poppins text-xs">
                                    {label}
                                </span>
                                {values.slice(0, 4).map((value, index) => (
                                    <span
                                        key={`${label}-${index}`}
                                        className={`mx-auto w-[72%] px-3 py-2.5 text-right font-poppins text-xs ${
                                            index === 0
                                                ? "-translate-x-4"
                                                : index === 1
                                                  ? "-translate-x-5"
                                                  : index === 2
                                                    ? "-translate-x-4"
                                                    : index === 3
                                                        ? "-translate-x-4"
                                                  : ""
                                        }`}
                                    >
                                        {value}
                                    </span>
                                ))}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
