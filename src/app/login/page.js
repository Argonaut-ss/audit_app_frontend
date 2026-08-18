"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Lock, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import logoBinus from "@/assets/icons/sidebar/logo_binus.png";

import { useLogin } from "@/hooks/auth/use_login";

import AlertError from "@/components/alert/alert_error";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    userId: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [errorAlert, setErrorAlert] = useState({
    title: "",
    message: "",
  });

  const { loading, handleLogin } = useLogin();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const result = await handleLogin({
        email: form.userId,
        password: form.password,
      });

      console.log("Login berhasil:", result);

      switch (result.user.role) {
        case "admin":
          router.push("/admin/mahasiswa");
          break;

        case "mahasiswa":
          router.push("/mahasiswa/kelas");
          break;

        case "dosen":
          router.push("/dosen");
          break;

        default:
          console.error("Role tidak dikenali:", result.user.role);
      }
    } catch (error) {
      setErrorAlert({
        title: "Login gagal",
        message:
          error.response?.data?.message ||
          "Email atau password tidak valid.",
      });
      console.error("Login gagal");
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#13aad7] text-[#4f5b6b]">
      <AlertError
        title={errorAlert.title}
        message={errorAlert.message}
        onClose={() =>
          setErrorAlert({
            title: "",
            message: "",
          })
        }
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#3d82d5_0%,#22a6dd_45%,#03d0d6_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_78%_42%,rgba(255,255,255,0.12),transparent_30%)]" />
      {/* <PlexusBackground /> */}

      <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 py-14">
        <div className="relative flex w-full max-w-[438px] overflow-hidden rounded-lg bg-white shadow-[0_18px_44px_rgba(0,77,120,0.22)]">

          <div className="w-full px-8 pb-12 pt-9 sm:px-10">
            <div className="mx-auto mb-9 flex w-full justify-center">
              <Image
                src={logoBinus}
                alt="BINUS University"
                width={215}
                priority
                className="h-auto w-[215px] max-w-full"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="group flex h-[50px] items-center rounded-md border border-[#07a9e8] bg-white px-3 transition focus-within:ring-2 focus-within:ring-[#95daf5]">
                <UserRound className="mr-3 h-5 w-5 shrink-0 text-[#08a8e4]" aria-hidden="true" />
                <input
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  className="h-full min-w-0 flex-1 bg-transparent text-[18px] text-[#4c5968] outline-none placeholder:text-[#687383]"
                  placeholder="Email"
                  autoComplete="username"
                />
              </label>

              <label className="flex h-[50px] items-center rounded-md border border-[#c8c8c8] bg-white px-3 transition focus-within:border-[#07a9e8] focus-within:ring-2 focus-within:ring-[#c9ecfa]">
                <Lock className="mr-3 h-5 w-5 shrink-0 text-[#c0c3c7]" aria-hidden="true" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="h-full min-w-0 flex-1 bg-transparent text-[18px] text-[#4c5968] outline-none placeholder:text-[#687383]"
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded text-[#a8adb4] transition hover:text-[#08a8e4] focus:outline-none focus:ring-2 focus:ring-[#c9ecfa]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-md bg-[#08a8d7] text-[18px] font-bold text-white transition hover:bg-[#0797c4] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#08a8d7]"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
