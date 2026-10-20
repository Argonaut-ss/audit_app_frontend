import {
    Wallet,
    Landmark,
    HandCoins,
    Package,
    Building2,
    Boxes,
    CreditCard,
    CircleDollarSign,
    Receipt,
  } from "lucide-react";
  
  export const kategoriPengujian = [
    {
      id: 1,
      title: "Kas",
      path: "kas",
      icon: Wallet,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [
        {
          title: "Prosedur",
          checkKey: "ProsedurCheck",
          completed: false,
        },
        {
          title: "Dokumen",
          checkKey: "DokumenCheck",
          completed: false,
        },
        {
          title: "Cash Count",
          checkKey: "CashCountCheck",
          completed: false,
        },
        {
          title: "Rekap Mutasi Kas",
          checkKey: "RekapMutasiCheck",
          completed: false,
        },
        {
          title: "Uji Mutasi Kas",
          checkKey: "UjiMutasiCheck",
          completed: false,
        },
        {
          title: "Jurnal Koreksi",
          checkKey: "JurnalCheck",
          completed: false,
        },
      ],
    },
  
    {
      id: 2,
      title: "Setara Kas",
      path: "setara_kas",
      icon: Landmark,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [
        {
          title: "Prosedur",
          checkKey: "ProsedurCheck",
          completed: false,
        },
        {
          title: "Dokumen",
          checkKey: "DokumenCheck",
          completed: false,
        },
        {
          title: "Rekening Koran",
          checkKey: "RekeningCheck",
          completed: false,
        },
        {
          title: "Cek Saldo",
          checkKey: "CekSaldoCheck",
          completed: false,
        },
        {
          title: "Rekonsiliasi Bank",
          checkKey: "RekonsiliasiCheck",
          completed: false,
        },
        {
          title: "Konfirmasi Bank",
          checkKey: "KonfirmasiCheck",
          completed: false,
        },
        {
          title: "Rekap Balasan Konfirmasi",
          checkKey: "RekapCheck",
          completed: false,
        },
        {
          title: "Jurnal Koreksi",
          checkKey: "JurnalCheck",
          completed: false,
        },
      ],
    },
  
    {
      id: 3,
      title: "Piutang",
      path: "piutang",
      icon: HandCoins,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [
        {
          title: "Prosedur",
          checkKey: "ProsedurCheck",
          completed: false,
        },
        {
          title: "Dokumen",
          checkKey: "DokumenCheck",
          completed: false,
        },
        {
          title: "Konfirmasi Piutang",
          checkKey: "KonfirmasiCheck",
          completed: false,
        },
        {
          title: "Rekap Balasan Konfirmasi",
          checkKey: "RekapCheck",
          completed: false,
        },
        {
          title: "Prosedur Alternatif",
          checkKey: "ProsedurAltCheck",
          completed: false,
        },
        {
          title: "Rekonsiliasi Piutang",
          checkKey: "RekonsiliasiCheck",
          completed: false,
        },
        {
          title: "Analisis Umur Piutang",
          checkKey: "UmurCheck",
          completed: false,
        },
        {
          title: "Jurnal Koreksi",
          checkKey: "JurnalCheck",
          completed: false,
        },
      ],
    },
  
    {
      id: 4,
      title: "Persediaan",
      path: "persediaan",
      icon: Package,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [
        {
          title: "Prosedur",
          checkKey: "ProsedurCheck",
          completed: false,
        },
        {
          title: "Dokumen",
          checkKey: "DokumenCheck",
          completed: false,
        },
        {
          title: "Stok Opname",
          checkKey: "StockCheck",
          completed: false,
        },
        {
          title: "Mutasi Stok Opname",
          checkKey: "MutasiStockCheck",
          completed: false,
        },
        {
          title: "Uji Mutasi",
          checkKey: "UjiMutasiCheck",
          completed: false,
        },
        {
          title: "Test Pricing",
          checkKey: "TestPricingCheck",
          completed: false,
        },
        {
          title: "Jurnal Koreksi",
          checkKey: "JurnalCheck",
          completed: false,
        },
      ],
    },
  
    {
      id: 5,
      title: "Aset Tetap",
      path: "aset_tetap",
      icon: Building2,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [
        {
          title: "Prosedur",
          checkKey: "ProsedurCheck",
          completed: false,
        },
        {
          title: "Dokumen",
          checkKey: "DokumenCheck",
          completed: false,
        },
        {
          title: "Hasil Observasi Aset Lama",
          checkKey: "AsetLamaCheck",
          completed: false,
        },
        {
          title: "Penambahan Aset Baru",
          checkKey: "AsetBaruCheck",
          completed: false,
        },
        {
          title: "Uji Penyusutan",
          checkKey: "UjiPenyusutanCheck",
          completed: false,
        },
        {
          title: "Jurnal Koreksi",
          checkKey: "JurnalCheck",
          completed: false,
        },
      ],
    },
  
    {
      id: 6,
      title: "Aset Lain-lain",
      path: "aset_lain_lain",
      icon: Boxes,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [
        {
          title: "Prosedur",
          checkKey: "ProsedurCheck",
          completed: false,
        },
        {
          title: "Dokumen",
          checkKey: "DokumenCheck",
          completed: false,
        },
        {
          title: "Konfirmasi",
          checkKey: "KonfirmasiCheck",
          completed: false,
        },
        {
          title: "Rekap Balasan",
          checkKey: "RekapCheck",
          completed: false,
        },
        {
          title: "Dokumentasi Aset Lain Lain",
          checkKey: "DokumentasiCheck",
          completed: false,
        },
        {
          title: "Bukti Pendukung",
          checkKey: "BuktiPendukungCheck",
          completed: false,
        },
        {
          title: "Wawancara",
          checkKey: "WawancaraCheck",
          completed: false,
        },
        {
          title: "Jurnal Koreksi",
          checkKey: "JurnalCheck",
          completed: false,
        },
      ],
    },
  
    {
      id: 7,
      title: "Utang Usaha",
      path: "utang_usaha",
      icon: CreditCard,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [
        {
          title: "Prosedur",
          checkKey: "ProsedurCheck",
          completed: false,
        },
        {
          title: "Dokumen",
          checkKey: "DokumenCheck",
          completed: false,
        },
        {
          title: "Konfirmasi Utang",
          checkKey: "KonfirmasiCheck",
          completed: false,
        },
        {
          title: "Rekap Balasan",
          checkKey: "RekapCheck",
          completed: false,
        },
        {
          title: "Prosedur Alternatif",
          checkKey: "ProsedurAltCheck",
          completed: false,
        },
        {
          title: "Rekonsiliasi Utang",
          checkKey: "RekonsiliasiCheck",
          completed: false,
        },
        {
          title: "Jurnal Koreksi",
          checkKey: "JurnalCheck",
          completed: false,
        },
      ],
    },
  
    {
      id: 8,
      title: "Pendapatan Usaha",
      path: "pendapatan_usaha",
      icon: CircleDollarSign,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [
        {
          title: "Prosedur",
          checkKey: "ProsedurCheck",
          completed: false,
        },
        {
          title: "Dokumen",
          checkKey: "DokumenCheck",
          completed: false,
        },
        {
          title: "Cut Off",
          checkKey: "CutOffCheck",
          completed: false,
        },
        {
          title: "Vouching",
          checkKey: "VouchingCheck",
          completed: false,
        },
        {
          title: "Jurnal Koreksi",
          checkKey: "JurnalCheck",
          completed: false,
        },
      ],
    },
  
    {
      id: 9,
      title: "Beban Usaha",
      path: "beban_usaha",
      icon: Receipt,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [
        {
          title: "Prosedur",
          checkKey: "ProsedurCheck",
          completed: false,
        },
        {
          title: "Dokumen",
          checkKey: "DokumenCheck",
          completed: false,
        },
        {
          title: "Cut Off",
          checkKey: "CutOffCheck",
          completed: false,
        },
        {
          title: "Vouching",
          checkKey: "VouchingCheck",
          completed: false,
        },
        {
          title: "Jurnal Koreksi",
          checkKey: "JurnalCheck",
          completed: false,
        },
      ],
    },
  ];