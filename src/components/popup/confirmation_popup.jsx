"use client";

import { useEffect, useState } from "react";

export default function ConfirmationPopup({
  isOpen,
  message = "Apa anda yakin?",
  confirmText = "Ya",
  cancelText = "Tidak",
  onConfirm,
  onCancel,
  onClose,
  closeOnBackdrop = true,
}) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setDisplayMessage(message);
        setShouldRender(true);
        setIsExiting(false);
      }, 0);

      return () => clearTimeout(timer);
    }

    if (shouldRender) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 0);

      const removeTimer = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, 220);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [isOpen, message, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    onClose?.();
  };

  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-5 ${
        isExiting ? "confirmation-backdrop-out" : "confirmation-backdrop-in"
      }`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-popup-message"
        className={`w-full max-w-[520px] rounded-xl bg-white px-7 py-6 text-center shadow-2xl sm:px-8 sm:py-7 ${
          isExiting ? "confirmation-popup-out" : "confirmation-popup-in"
        }`}
      >
        <div className="mb-5 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF3D7] sm:h-24 sm:w-24">
            <svg
              viewBox="0 0 120 120"
              className="h-16 w-16 sm:h-20 sm:w-20"
              aria-hidden="true"
            >
              <g transform="translate(8.4 5) scale(0.86)">
                <path
                  d="M60 17.5c4.2 0 8 2.2 10.1 5.8l38.2 66.2c2.1 3.6 2.1 8.1 0 11.7-2.1 3.6-5.9 5.8-10.1 5.8H21.8c-4.2 0-8-2.2-10.1-5.8-2.1-3.6-2.1-8.1 0-11.7l38.2-66.2c2.1-3.6 5.9-5.8 10.1-5.8Z"
                  fill="#FFB13B"
                />
                <path
                  d="M60 42v27"
                  stroke="#FFFFFF"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <circle cx="60" cy="84" r="5.8" fill="#FFFFFF" />
              </g>
            </svg>
          </div>
        </div>

        <p
          id="confirmation-popup-message"
          className="mx-auto max-w-[440px] text-balance font-poppins text-lg font-semibold leading-snug text-gray-950 sm:text-xl"
        >
          {displayMessage}
        </p>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="h-11 rounded-lg bg-[#E52B2B] px-6 font-poppins text-sm font-bold text-white transition hover:bg-[#D91F1F] focus:outline-none focus:ring-2 focus:ring-[#E52B2B] focus:ring-offset-2"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="h-11 rounded-lg bg-[#05A80B] px-6 font-poppins text-sm font-bold text-white transition hover:bg-[#04930A] focus:outline-none focus:ring-2 focus:ring-[#05A80B] focus:ring-offset-2"
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .confirmation-backdrop-in {
          animation: confirmationBackdropIn 0.18s ease-out forwards;
        }

        .confirmation-backdrop-out {
          animation: confirmationBackdropOut 0.22s ease-in forwards;
        }

        .confirmation-popup-in {
          animation: confirmationPopupIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        }

        .confirmation-popup-out {
          animation: confirmationPopupOut 0.2s ease-in forwards;
        }

        @keyframes confirmationBackdropIn {
          from {
            background: rgb(0 0 0 / 0);
          }
          to {
            background: rgb(0 0 0 / 0.7);
          }
        }

        @keyframes confirmationBackdropOut {
          from {
            background: rgb(0 0 0 / 0.7);
          }
          to {
            background: rgb(0 0 0 / 0);
          }
        }

        @keyframes confirmationPopupIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes confirmationPopupOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(10px) scale(0.97);
          }
        }
      `}</style>
    </div>
  );
}
