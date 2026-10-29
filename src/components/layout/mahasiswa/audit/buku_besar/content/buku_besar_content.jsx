"use client";

import KasSetaraKas from "./tab/kas_dan_setara_kas/kas_setara_kas";
import Persediaan from "./tab/persediaan/persediaan";
import Piutang from "./tab/piutang/piutang"
// import AsetLain from "./tab/aset_lain/aset_lain"
// import AsetTetap from "./tab/aset_tetap/aset_tetap"
// import UtangUsaha from "./tab/utang_usaha/utang_usaha"
// import UtangBank from "./tab/utang_bank/utang_bank"
// import UtangPajak from "./tab/utang_pajak/utang_pajak"
// import UtangPembiayaan from "./tab/utang_pembiayaan/utang_pembiayaan"
// import UtangLain from "./tab/utang_lain/utang_lain"
// import Ekuitas from "./tab/ekuitas/ekuitas"
// import Penjualan from "./tab/penjualan/penjualan"

export default function BukuBesarContent({ accountCode, jwbKasusId }) {
    
    switch (accountCode) {
        case "A":
            return <KasSetaraKas jwbKasusId={jwbKasusId} />;

        case "B":
            return <Piutang jwbKasusId={jwbKasusId} />;

        case "C":
            return <Persediaan jwbKasusId={jwbKasusId} />;

        case "E":
            return <div>Konten Buku Besar Aset Tetap</div>;

        default:
            return (
                // <div className="rounded-xl border border-[#DCE5EF] bg-white p-5">
                <div>
                    Konten Buku Besar belum tersedia.
                </div>
            );
    }
}