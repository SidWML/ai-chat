"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface EmptyStateProps {
  onSuggestion: (text: string) => void;
}

const suggestions = [
  {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    text: "Show me the top 10 customers by revenue",
  },
  {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    text: "What were last month's conversion rates?",
  },
  {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    text: "Map all store locations near New York",
  },
  {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    text: "Which products are running low on stock?",
  },
];

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pt-16 pb-8">
      {/* Logo */}
      <Image
        src="/logo.svg"
        alt="CInsights"
        width={160}
        height={44}
        className="mb-6 ci-fade-up"
        priority
      />

      <h2
        className="mb-2 text-[22px] font-bold ci-fade-up"
        style={{ color: "var(--ci-text)", animationDelay: "0.05s" }}
      >
        What can I help you find?
      </h2>
      <p
        className="mb-10 max-w-md text-center text-[14px] leading-relaxed ci-fade-up"
        style={{ color: "var(--ci-text-tertiary)", animationDelay: "0.1s" }}
      >
        Ask questions about your data in plain English. I'll query your databases and show results with tables, charts, and maps.
      </p>

      <div className="grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2">
        {suggestions.map((s, i) => (
          <button
            key={s.text}
            onClick={() => onSuggestion(s.text)}
            className="ci-fade-up flex items-start gap-3 rounded-xl px-4 py-3.5 text-left transition-all hover:shadow-md active:scale-[0.98]"
            style={{
              background: "var(--ci-bg-surface)",
              border: "1px solid var(--ci-border)",
              boxShadow: "var(--ci-shadow-xs)",
              animationDelay: `${0.15 + i * 0.05}s`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--ci-border-hover)";
              e.currentTarget.style.background = "var(--ci-bg-elevated)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--ci-border)";
              e.currentTarget.style.background = "var(--ci-bg-surface)";
            }}
          >
            <div
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--ci-accent-subtle)", color: "var(--ci-navy)" }}
            >
              {s.icon}
            </div>
            <span
              className="text-[13px] leading-snug"
              style={{ color: "var(--ci-text-secondary)" }}
            >
              {s.text}
            </span>
          </button>
        ))}
      </div>

      {/* Dashboards quick access */}
      <div
        className="mt-8 ci-fade-up"
        style={{ animationDelay: "0.4s" }}
      >
        <Link
          href={ROUTES.DASHBOARDS}
          className="flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-[13px] font-medium transition-all hover:shadow-md active:scale-[0.98]"
          style={{
            background: "var(--ci-bg-surface)",
            border: "1px solid var(--ci-border)",
            boxShadow: "var(--ci-shadow-xs)",
            color: "var(--ci-text-secondary)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--ci-border-hover)";
            e.currentTarget.style.color = "var(--ci-navy)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--ci-border)";
            e.currentTarget.style.color = "var(--ci-text-secondary)";
          }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          View Dashboards
        </Link>
      </div>
    </div>
  );
}
