"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const SidebarItem = ({ item }) => {
  const pathname = usePathname();

  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={`
        mx-4
        flex items-center gap-2
        h-16
        px-6
        rounded-xl
        transition-all duration-200
        ${isActive
          ? "bg-[#EEF8FF] text-[#2C3A4B]"
          : "hover:bg-gray-100 text-[#5B6472]"
        }
      `}
    >
      <Image
        src={item.icon}
        alt={item.title}
        width={20}
        height={20}
      />

      <span className="text-sm font-semibold">
        {item.title}
      </span>
    </Link>
  );
};

export default SidebarItem;