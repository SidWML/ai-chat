"use client";

import { useEffect } from "react";
import { IconCheck, IconX } from "@/components/v2/ui/Icons";

interface ToastProps {
  open: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ open, type, title, message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, onClose, duration]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes ciToastSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg"
        style={{
          background: type === "success" ? "#16A34A" : "#EF4444",
          color: "#fff",
          animation: "ciToastSlideUp 0.3s ease-out",
        }}
      >
        {type === "success" ? (
          <IconCheck className="h-4 w-4 shrink-0" />
        ) : (
          <IconX className="h-4 w-4 shrink-0" />
        )}
        <div>
          <p className="text-[13px] font-semibold">{title}</p>
          <p className="text-[11px] opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="ml-2 shrink-0 opacity-70 hover:opacity-100">
          <IconX className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}
