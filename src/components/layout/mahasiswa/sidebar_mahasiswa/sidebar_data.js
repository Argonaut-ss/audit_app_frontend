import KelasIcon from "@/assets/icons/sidebar/kelas.svg";
import TugasIcon from "@/assets/icons/sidebar/tugas.svg";
import StandarAuditIcon from "@/assets/icons/sidebar/standar_audit.svg";

const sidebarData = [
  {
    id: 1,
    title: "Kelas",
    href: "/mahasiswa/kelas",
    icon: KelasIcon,
  },
  {
    id: 2,
    title: "Tugas",
    icon: TugasIcon,
    children: [
      {
        id: 1,
        title: "Data Klien",
        href: "/mahasiswa/tugas/data_klien",
      },
      {
        id: 2,
        title: "Audit",
        href: "/mahasiswa/tugas/audit",
      },
    ],
  },
  {
    id: 3,
    title: "Standar Audit",
    href: "/mahasiswa/standar-audit",
    icon: StandarAuditIcon,
  },
];

export default sidebarData;