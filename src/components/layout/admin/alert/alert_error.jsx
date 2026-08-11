"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function AlertError({ message, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  // Timer otomatis dan reset state
  useEffect(() => {
    if (message) {
      setIsExiting(false); // Pastikan animasi masuk berjalan kalau ada pesan baru
      
      const timer = setTimeout(() => {
        handleClose();
      }, 5000); // 5 Detik

      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fungsi khusus untuk menahan unmount selama animasi keluar berjalan
  function handleClose() {
    setIsExiting(true); // Pemicu animasi slide-out
    
    setTimeout(() => {
      if (onClose) onClose();
      setIsExiting(false); // Reset state
    }, 400); // 400ms adalah durasi animasi CSS slideOutRight
  }

  // Jika tidak ada pesan dan tidak sedang proses keluar, hilangkan komponen
  if (!message && !isExiting) {
    return null;
  }

  return (
    <div
      // Tambahkan class dinamis slide-in dan slide-out di sini
      className={`fixed right-6 top-6 z-[9999] w-[380px] overflow-hidden rounded-xl border border-red-200 bg-white shadow-xl ${
        isExiting ? "slide-out" : "slide-in"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle
              className="h-5 w-5 text-red-500"
              strokeWidth={2}
            />
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900">
              Terjadi Kesalahan
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose} // Ubah ini jadi memanggil handleClose
            className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="h-1 w-full bg-red-100">
        <div
          className="h-full bg-red-500"
          style={{
            animation: "errorAlertProgress 5s linear forwards",
          }}
        />
      </div>

      {/* Tambahkan keyframes untuk animasi In dan Out di dalam style jsx ini */}
      <style jsx>{`
        .slide-in {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .slide-out {
          animation: slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes errorAlertProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}