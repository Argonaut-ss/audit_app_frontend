"use client";

import { useState } from "react";
import { logout } from "@/services/auth/auth";

export const useLogout = () => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);

      await logout();

      // Hapus session di browser
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect ke login
      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Logout gagal:",
        error.response?.data || error.message
      );

      // Tetap bersihkan local session
      // supaya user tidak terjebak dalam session lama
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleLogout,
  };
};