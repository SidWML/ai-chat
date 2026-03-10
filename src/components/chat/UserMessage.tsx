"use client";

import type { ChatMessage } from "./ChatContainer";

interface UserMessageProps {
  message: ChatMessage;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end ci-fade-up">
      <div
        className="max-w-[80%] rounded-2xl rounded-tr-lg px-4 py-3"
        style={{
          background: "linear-gradient(135deg, var(--ci-navy), var(--ci-navy-light))",
          boxShadow: "var(--ci-shadow-sm)",
        }}
      >
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-white">
          {message.content}
        </p>
      </div>
    </div>
  );
}
