"use client";

import KasSetaraKas from "./tab/kas_dan_setara_kas/kas_setara_kas";
import Persediaan from "./tab/persediaan/persediaan";
import Piutang from "./tab/piutang/piutang"
import AsetLain from "./tab/aset_lain/aset_lain"
import AsetTetap from "./tab/aset_tetap/aset_tetap";
import UtangUsaha from "./tab/utang_usaha/utang_usaha"
import UtangBank from "./tab/utang_bank/utang_bank.js"
import Ekuitas from "./tab/ekuitas/ekuitas"
import UtangPajak from "./tab/utang_pajak/utang_pajak"
import Penjualan from "./tab/penjualan/penjualan"
import PendapatanBebanLainLain from "./tab/pendapatan_beban_lain_lain/pendapatan_beban_lain_lain";
import BebanPokokPenjualan from "./tab/beban_pokok_penjualan/beban_pokok_penjualan"
import BebanUsaha from "./tab/beban_usaha/beban_usaha"
import PajakPenghasilan from "./tab/pajak_penghasilan/pajak_penghasilan"

export default function BukuBesarContent({ accountCode, jwbKasusId }) {

    switch (accountCode) {
        case "A":
            return <KasSetaraKas jwbKasusId={jwbKasusId} />;

        case "B":
            return <Piutang jwbKasusId={jwbKasusId} />;

        case "C":
            return <Persediaan jwbKasusId={jwbKasusId} />;

        case "D":
            return <AsetLain jwbKasusId={jwbKasusId} />;

        case "E":
            return <AsetTetap jwbKasusId={jwbKasusId} />;

        case "F":
            return <UtangUsaha jwbKasusId={jwbKasusId} />;

        case "G":
            return <UtangBank jwbKasusId={jwbKasusId} />;

        case "H":
            return <UtangPajak jwbKasusId={jwbKasusId} />;

        case "I":
            return <Ekuitas jwbKasusId={jwbKasusId} />;

        case "J":
            return <Penjualan jwbKasusId={jwbKasusId} />;

        case "K":
            return <BebanPokokPenjualan jwbKasusId={jwbKasusId} />;

        case "L":
            return <BebanUsaha jwbKasusId={jwbKasusId} />;

        case "M":
            return <PendapatanBebanLainLain jwbKasusId={jwbKasusId} />

        case "N":
            return <PajakPenghasilan jwbKasusId={jwbKasusId} />

        default:
            return (
                // <div className="rounded-xl border border-[#DCE5EF] bg-white p-5">
                <div>
                    Konten Buku Besar belum tersedia.
                </div>
            );
    }
}