"use client";

import type { ProcessingState, ProcessingStep } from "@/lib/canvas-types";
import { IconSparkles } from "@/components/v2/ui/Icons";

interface ProcessingIndicatorProps {
  state: ProcessingState;
}

const STEP_CONFIG: Record<ProcessingStep, { label: string; icon: string; color: string }> = {
  thinking: { label: "Thinking", icon: "brain", color: "var(--ci-navy)" },
  "selecting-database": { label: "Selecting database", icon: "db", color: "#336791" },
  "generating-query": { label: "Generating query", icon: "code", color: "#D97706" },
  executing: { label: "Executing query", icon: "play", color: "#16A34A" },
  rendering: { label: "Building results", icon: "chart", color: "#7C3AED" },
  complete: { label: "Done", icon: "check", color: "var(--ci-success)" },
  error: { label: "Error", icon: "x", color: "#EF4444" },
};

function StepIcon({ step }: { step: string }) {
  const cfg = STEP_CONFIG[step as ProcessingStep];
  if (!cfg) return null;
  const { icon, color } = cfg;
  return (
    <div
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
      style={{ background: `${color}15` }}
    >
      {icon === "brain" && (
        <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={1.5}>
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4v4l2.5 2.5" strokeLinecap="round" />
        </svg>
      )}
      {icon === "db" && (
        <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={1.5}>
          <ellipse cx="8" cy="4" rx="5" ry="2" />
          <path d="M3 4v8c0 1.1 2.24 2 5 2s5-.9 5-2V4" />
          <path d="M3 8c0 1.1 2.24 2 5 2s5-.9 5-2" />
        </svg>
      )}
      {icon === "code" && (
        <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
          <path d="M5 4L2 8l3 4" />
          <path d="M11 4l3 4-3 4" />
        </svg>
      )}
      {icon === "play" && (
        <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill={color}>
          <path d="M4 3l10 5-10 5V3z" />
        </svg>
      )}
      {icon === "chart" && (
        <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
          <rect x="2" y="8" width="3" height="6" rx="0.5" />
          <rect x="6.5" y="4" width="3" height="10" rx="0.5" />
          <rect x="11" y="2" width="3" height="12" rx="0.5" />
        </svg>
      )}
      {icon === "check" && (
        <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
          <path d="M3 8l4 4 6-8" />
        </svg>
      )}
      {icon === "x" && (
        <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      )}
    </div>
  );
}

export function ProcessingIndicator({ state }: ProcessingIndicatorProps) {
  const cfg = STEP_CONFIG[state.step] ?? STEP_CONFIG.thinking;

  return (
    <div className="flex items-start gap-3 v2-fade-up">
      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "linear-gradient(135deg, var(--ci-coral), var(--ci-coral-light))",
        }}
      >
        <IconSparkles className="h-3.5 w-3.5 text-white" />
      </div>

      {/* Processing card */}
      <div
        className="rounded-2xl rounded-tl-lg px-4 py-3"
        style={{
          background: "var(--ci-bg-surface)",
          border: "1px solid var(--ci-border)",
          boxShadow: "var(--ci-shadow-sm)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <StepIcon step={state.step} />

          <span className="text-[12px] font-medium" style={{ color: "var(--ci-text-secondary)" }}>
            {state.message || cfg.label}
          </span>

          {/* Animated dots */}
          <div className="flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: cfg.color,
                  animation: `v2-typing-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {state.progress != null && state.progress > 0 && (
          <div className="mt-2 h-1 overflow-hidden rounded-full" style={{ background: "var(--ci-border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, state.progress)}%`, background: cfg.color }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
