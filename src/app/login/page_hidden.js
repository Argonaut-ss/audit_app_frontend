"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Lock, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import logoBinus from "@/assets/icons/sidebar/logo_binus.png";

function PlexusBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrame;
    let width = 0;
    let height = 0;
    let points = [];
    const pointer = {
      x: 0,
      y: 0,
      active: false,
      isPointer: true,
    };

    const createPoints = () => {
      const count = Math.max(42, Math.min(95, Math.floor((width * height) / 22000)));

      points = Array.from({ length: count }, (_, index) => {
        const cluster = index % 5;
        const anchorX = ((cluster + 0.4) / 5) * width;
        const driftX = (Math.random() - 0.5) * width * 0.28;

        return {
          x: Math.max(0, Math.min(width, anchorX + driftX)),
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          radius: Math.random() * 1.4 + 1,
        };
      });
    };

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      createPoints();
    };

    const movePointer = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const leavePointer = () => {
      pointer.active = false;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      points.forEach((point) => {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < -40) point.x = width + 40;
        if (point.x > width + 40) point.x = -40;
        if (point.y < -40) point.y = height + 40;
        if (point.y > height + 40) point.y = -40;
      });

      const visiblePoints = pointer.active ? [...points, pointer] : points;

      for (let i = 0; i < visiblePoints.length; i += 1) {
        for (let j = i + 1; j < visiblePoints.length; j += 1) {
          const a = visiblePoints[i];
          const b = visiblePoints[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const hasPointer = a.isPointer || b.isPointer;
          const maxDistance = hasPointer ? (width < 768 ? 150 : 215) : width < 768 ? 118 : 158;

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * (hasPointer ? 0.72 : 0.34);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.66)";
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", movePointer);
    window.addEventListener("pointerleave", leavePointer);
    window.addEventListener("blur", leavePointer);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", movePointer);
      window.removeEventListener("pointerleave", leavePointer);
      window.removeEventListener("blur", leavePointer);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ userId: "", password: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    router.push("/admin/mahasiswa");
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#13aad7] text-[#4f5b6b]">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#3d82d5_0%,#22a6dd_45%,#03d0d6_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_78%_42%,rgba(255,255,255,0.12),transparent_30%)]" />
      <PlexusBackground />

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
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="h-full min-w-0 flex-1 bg-transparent text-[18px] text-[#4c5968] outline-none placeholder:text-[#687383]"
                  placeholder="Password"
                  autoComplete="current-password"
                />
              </label>

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-md bg-[#08a8d7] text-[18px] font-bold text-white transition hover:bg-[#0797c4] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#08a8d7]"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
