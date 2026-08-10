import MahasiswaIcon from "@/assets/icons/sidebar/mahasiswa.svg";
import DosenIcon from "@/assets/icons/sidebar/dosen.svg";
import KelasIcon from "@/assets/icons/sidebar/kelas.svg";
import TugasIcon from "@/assets/icons/sidebar/tugas.svg";

const sidebarData = [
  {
    id: 1,
    title: "Mahasiswa",
    href: "/admin/mahasiswa",
    icon: MahasiswaIcon,
  },
  {
    id: 2,
    title: "Dosen",
    href: "/admin/dosen",
    icon: DosenIcon,
  },
  {
    id: 3,
    title: "Kelas",
    href: "/admin/kelas",
    icon: KelasIcon,
  },
  {
    id: 4,
    title: "Tugas",
    href: "/admin/tugas",
    icon: TugasIcon,
  },
];

export default sidebarData;