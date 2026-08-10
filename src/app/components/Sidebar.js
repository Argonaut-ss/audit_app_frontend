"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, GraduationCap, ListChecks, ClipboardList } from "lucide-react";

const menuItems = [
  { label: "Mahasiswa", href: "/admin/mahasiswa", icon: LayoutGrid },
  { label: "Dosen", href: "/admin/dosen", icon: GraduationCap },
  { label: "Kelas", href: "/admin/kelas", icon: ListChecks },
  { label: "Tugas", href: "/admin/tugas", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-6 py-6">
      <div className="mb-10 text-2xl font-extrabold tracking-tight text-sky-500">
        LOGO
      </div>

      <p className="mb-3 text-xs font-semibold tracking-widest text-slate-400">
        MENU
      </p>

      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                active
                  ? "bg-sky-50 text-sky-600"
                  : "text-slate-700 hover:bg-slate-50 hover:text-sky-500"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] ${
                  active ? "text-sky-500" : "text-slate-400"
                }`}
                strokeWidth={2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}