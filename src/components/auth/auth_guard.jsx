"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children, allowedRoles = [] }) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // Belum login
    if (!token || !userData) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);

      // Kalau route punya batasan role
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
      ) {
        // Redirect ke halaman sesuai role
        if (user.role === "admin") {
          router.replace("/admin/mahasiswa");
        } else if (user.role === "mahasiswa") {
          router.replace("/mahasiswa/kelas");
        } else if (user.role === "dosen") {
          router.replace("/dosen");
        } else {
          router.replace("/login");
        }

        return;
      }

      setChecking(false);
    } catch (error) {
      console.error("Data user tidak valid:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      router.replace("/login");
    }
  }, [router, pathname, allowedRoles]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FC]">
        <p className="font-poppins text-sm text-[#6B7589]">
          Loading...
        </p>
      </div>
    );
  }

  return children;
}