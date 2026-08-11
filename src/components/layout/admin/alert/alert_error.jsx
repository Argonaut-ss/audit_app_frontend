"use client";

import { AlertTriangle, X } from "lucide-react";

export default function AlertError({ message, onClose }) {
if (!message) {
return null;
}

return ( <div className="fixed right-6 top-6 z-[9999] w-[380px] overflow-hidden rounded-xl border border-red-200 bg-white shadow-xl"> <div className="p-4"> <div className="flex items-start gap-3"> <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100"> <AlertTriangle
           className="h-5 w-5 text-red-500"
           strokeWidth={2}
         /> </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-slate-900">
          Gagal Membuat Tugas
        </h3>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
      >
        <X
          className="h-4 w-4"
          strokeWidth={2}
        />
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

  <style jsx>{`
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
