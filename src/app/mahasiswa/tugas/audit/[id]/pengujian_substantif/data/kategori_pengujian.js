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
      status: "Selesai",
      statusType: "success",
      tahapan: [
        {
          title: "Prosedur",
          completed: true,
        },
        {
          title: "Dokumen",
          completed: true,
        },
        {
          title: "Cash Count",
          completed: true,
        },
        {
          title: "Rekap Mutasi Kas",
          completed: true,
        },
        {
          title: "Uji Mutasi Kas",
          completed: true,
        },
      ],
    },
  
    {
      id: 2,
      title: "Setara Kas",
      path: "setara_kas",
      icon: Landmark,
      status: "Belum selesai",
      statusType: "warning",
      tahapan: [
        {
          title: "Prosedur",
          completed: true,
        },
        {
          title: "Dokumen",
          completed: true,
        },
        {
          title: "Rekening Koran",
          completed: true,
        },
        {
          title: "Cek Saldo",
          completed: true,
        },
        {
          title: "Rekonsiliasi Bank",
          completed: true,
        },
        {
          title: "Rekap Balasan Konfirmasi",
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
          completed: false,
        },
        {
          title: "Dokumen",
          completed: false,
        },
        {
          title: "Konfirmasi Piutang",
          completed: false,
        },
        {
          title: "Rekap Balasan Konfirmasi",
          completed: false,
        },
        {
          title: "Prosedur Alternatif",
          completed: false,
        },
        {
          title: "Rekonsiliasi Piutang",
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
      tahapan: [],
    },
  
    {
      id: 5,
      title: "Aset Tetap",
      path: "aset_tetap",
      icon: Building2,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [],
    },
  
    {
      id: 6,
      title: "Aset Lain-lain",
      path: "aset_lain_lain",
      icon: Boxes,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [],
    },
  
    {
      id: 7,
      title: "Utang Usaha",
      path: "utang_usaha",
      icon: CreditCard,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [],
    },
  
    {
      id: 8,
      title: "Pendapatan Usaha",
      path: "pendapatan_usaha",
      icon: CircleDollarSign,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [],
    },
  
    {
      id: 9,
      title: "Beban Usaha",
      path: "beban_usaha",
      icon: Receipt,
      status: "Belum diisi",
      statusType: "danger",
      tahapan: [],
    },
  ];