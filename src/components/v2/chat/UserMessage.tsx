"use client";

import { useAuth } from "@/lib/v2/auth";
import type { ChatMessage } from "@/components/v2/chat/AssistantMessage";

export function UserMessage({ message }: { message: ChatMessage }) {
  const { user } = useAuth();

  return (
    <div className="flex items-start gap-3 v2-fade-up justify-end">
      <div
        className="max-w-[75%] rounded-2xl rounded-tr-lg px-4 py-3"
        style={{
          background: "var(--ci-navy)",
          color: "#F1F5F9",
          boxShadow: "var(--ci-shadow-sm)",
        }}
      >
        <p className="text-[13px] leading-relaxed">{message.content}</p>
      </div>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}
      >
        {user?.full_name?.charAt(0) ?? "U"}
      </div>
    </div>
  );
}
