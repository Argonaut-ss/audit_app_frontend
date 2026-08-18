"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  ChevronDown,
  LogOut,
} from "lucide-react";

import { useLogout } from "@/hooks/auth/use_logout";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { loading, handleLogout } = useLogout();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return;

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Gagal membaca user:", error);
    }
  }, []);

  const userName = user?.name || "User";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <nav className="relative flex h-[82px] w-full items-center justify-between bg-[#0EA5E9] px-10">

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
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setIsDropdownOpen((current) => !current)
          }
          className="flex items-center gap-3"
          aria-expanded={isDropdownOpen}
        >
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

          {/* Arrow */}
          <ChevronDown
            size={16}
            strokeWidth={1.8}
            className={`text-white transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-[52px] z-[200] w-[160px] rounded-lg bg-white p-2 shadow-lg">
            <button
              type="button"
              disabled={loading}
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left font-poppins text-sm text-[#293144] transition hover:bg-[#FFF1F1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut
                size={16}
                strokeWidth={1.8}
                className="text-[#596275] transition-colors duration-200 group-hover:text-red-500"
              />

              <span className="transition-colors duration-200 group-hover:text-red-500">
                {loading ? "Keluar..." : "Keluar"}
              </span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}