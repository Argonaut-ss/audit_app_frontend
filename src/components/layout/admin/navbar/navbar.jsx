import Image from "next/image";
import burgerIcon from "@/assets/icons/navbar/burger.svg";
import { Menu, ChevronDown } from "lucide-react"

export default function Navbar({ user }) {
  const userName = user?.name || "Adrian Ananta";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <nav className="flex h-[82px] w-full items-center justify-between bg-[#0EA5E9] px-10">

      {/* Hamburger */}
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center"
        aria-label="Toggle sidebar"
      >
        <Menu
          size={22}
          strokeWidth={2}
          className="text-white"
        />
      </button>

      {/* Profile */}
      <div className="flex items-center gap-3">

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
          <span className="font-poppins text-sm font-semibold text-[#0EA5E9]">
            {initial}
          </span>
        </div>

        {/* Name */}
        <span className="font-poppins text-sm font-medium text-white">
          {userName}
        </span>

        {/* Dropdown */}
        <ChevronDown
          size={16}
          strokeWidth={1.8}
        />

      </div>
    </nav>
  );
}