"use client";

import { CheckCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function AlertSuccess({ message, onClose, title }) {
  const [isExiting, setIsExiting] = useState(false);
  const header = title?.trim() ? title : "Berhasil";

  useEffect(() => {
    if (message) {
      setIsExiting(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, 3000); 

      return () => clearTimeout(timer);
    }
  }, [message]);

  function handleClose() {
    setIsExiting(true); 
    
    setTimeout(() => {
      if (onClose) onClose();
      setIsExiting(false); 
    }, 400); 
  }

  if (!message && !isExiting) {
    return null;
  }

  return (
    <div
      className={`fixed right-6 top-6 z-[9999] w-[380px] overflow-hidden rounded-xl border border-green-200 bg-white shadow-xl ${
        isExiting ? "slide-out" : "slide-in"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Ikon Centang Hijau */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
            <CheckCircle
              className="h-5 w-5 text-green-600"
              strokeWidth={2}
            />
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900">{header}</h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Garis Progress Hijau */}
      <div className="h-1 w-full bg-green-100">
        <div
          className="h-full bg-green-500"
          style={{
            animation: "successAlertProgress 3s linear forwards",
          }}
        />
      </div>

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

        @keyframes successAlertProgress {
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