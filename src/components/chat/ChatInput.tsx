"use client";

import { useState, useRef, useEffect } from "react";
import { IconSend } from "@/components/v2/ui/Icons";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="mx-auto max-w-3xl">
        <div
          className="relative rounded-2xl transition-all ci-input-glow"
          style={{
            background: "var(--ci-bg-surface)",
            border: "1px solid var(--ci-border)",
            boxShadow: "var(--ci-shadow-md)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your data..."
            rows={1}
            disabled={disabled}
            className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-[13px] leading-relaxed outline-none placeholder:text-[var(--ci-text-muted)] disabled:opacity-50"
            style={{ color: "var(--ci-text)" }}
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all hover:shadow-lg active:scale-95 disabled:opacity-30 disabled:hover:shadow-none"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg, var(--ci-navy), #5A6B8A)"
                : "var(--ci-border)",
            }}
          >
            <IconSend className="h-4 w-4" />
          </button>
        </div>
        <p
          className="mt-2 text-center text-[10px]"
          style={{ color: "var(--ci-text-muted)" }}
        >
          CInsights AI can make mistakes. Always verify important data.
        </p>
      </div>
    </div>
  );
}
