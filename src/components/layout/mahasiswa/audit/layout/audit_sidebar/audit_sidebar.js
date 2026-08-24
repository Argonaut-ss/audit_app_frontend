"use client";

import {
  FileText,
  ClipboardList,
  BookOpen,
  CalendarDays,
} from "lucide-react";

const menuItems = [
  {
    label: "Detail Audit",
    icon: FileText,
  },
  {
    label: "Verifikasi Permintaan Data",
    icon: ClipboardList,
  },
  {
    label: "Pengujian Substantif",
    icon: BookOpen,
  },
  {
    label: "Top Schedule",
    icon: CalendarDays,
  },
];

export default function AuditSidebar() {
  return (
    <aside
      className="
        group
        fixed
        left-[285px]
        top-[95px]
        z-[100]
        w-[72px]
        overflow-hidden
        rounded-[20px]
        bg-white
        shadow-md
        transition-[width]
        duration-300
        ease-in-out
        hover:w-[300px]
      "
    >
      <div className="flex flex-col gap-2 px-2 py-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === 0;

          return (
            <button
              key={item.label}
              type="button"
              className={`
              flex
              h-[52px]
              w-full
              shrink-0
              items-center
              rounded-xl
              transition-all
              duration-300
              ${isActive
                  ? "bg-[#38BDF8] text-white"
                  : "text-[#596275] hover:bg-[#E0F2FE]"
                }
            `}
            >
              {/* ICON */}
              <div
                className="
                  flex
                  w-[52px]
                  shrink-0
                  items-center
                  justify-center
                "
              >
                <Icon
                  size={21}
                  strokeWidth={1.8}
                  className="shrink-0"
                />
              </div>

              {/* LABEL */}
              <span
                className={`
                  ml-1
                  whitespace-nowrap
                  font-poppins
                  text-sm
                  font-medium
                  opacity-0
                  transition-opacity
                  duration-200
                  group-hover:opacity-100
                  ${isActive
                    ? "text-white"
                    : "text-[#596275]"
                  }
                `}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}