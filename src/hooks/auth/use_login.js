"use client";

import { useState } from "react";
import { login } from "@/services/auth/auth";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);

      const result = await login(credentials);

      // Simpan token untuk request API berikutnya
      localStorage.setItem("token", result.token);

      // Simpan informasi user
      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      return result;
    } catch (error) {
      console.error(
        "Login gagal:",
        error.response?.data || error.message
      );

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleLogin,
  };
};