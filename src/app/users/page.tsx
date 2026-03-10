"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_USERS, AppUser } from "@/lib/mock-features";
import { IconArrowLeft, IconPlus } from "@/components/v2/ui/Icons";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

const ROLE_BADGE: Record<AppUser["role"], { bg: string; color: string }> = {
  admin: { bg: "rgba(60, 76, 115, 0.1)", color: "var(--ci-navy)" },
  editor: { bg: "rgba(59, 130, 246, 0.08)", color: "#3B82F6" },
  viewer: { bg: "var(--ci-bg-wash)", color: "var(--ci-text-tertiary)" },
};

const STATUS_BADGE: Record<AppUser["status"], { bg: string; color: string; dot: string }> = {
  active: { bg: "var(--ci-success-bg)", color: "var(--ci-success)", dot: "var(--ci-success)" },
  inactive: { bg: "var(--ci-error-bg)", color: "var(--ci-error)", dot: "var(--ci-error)" },
};

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_USERS.filter((user) => {
    const q = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen ci-fade-in" style={{ background: "var(--ci-bg)" }}>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/chat"
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
            style={{
              background: "var(--ci-bg-surface)",
              border: "1px solid var(--ci-border)",
              color: "var(--ci-text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--ci-border-hover)";
              e.currentTarget.style.boxShadow = "var(--ci-shadow-sm)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--ci-border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1
              className="text-[22px] font-bold"
              style={{ color: "var(--ci-text)" }}
            >
              Users
            </h1>
            <p className="text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>
              Manage team members and permissions
            </p>
          </div>
        </div>

        {/* Toolbar: Search + Invite */}
        <div className="mb-6 flex items-center gap-3 ci-fade-up">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--ci-text-tertiary)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full rounded-xl py-2.5 pl-10 pr-4 text-[13px] outline-none transition-all"
              style={{
                background: "var(--ci-bg-surface)",
                border: "1px solid var(--ci-border)",
                color: "var(--ci-text)",
                boxShadow: "var(--ci-shadow-xs)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--ci-border-focus)";
                e.currentTarget.style.boxShadow = "var(--ci-shadow-focus)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--ci-border)";
                e.currentTarget.style.boxShadow = "var(--ci-shadow-xs)";
              }}
            />
          </div>
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium text-white transition-all hover:shadow-lg active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, var(--ci-navy), var(--ci-navy-light))",
              boxShadow: "var(--ci-shadow-sm)",
            }}
          >
            <IconPlus className="h-3.5 w-3.5" />
            Invite User
          </button>
        </div>

        {/* Count */}
        <p
          className="mb-4 text-[13px]"
          style={{ color: "var(--ci-text-tertiary)" }}
        >
          {filtered.length} {filtered.length === 1 ? "user" : "users"}
          {search && ` matching "${search}"`}
        </p>

        {/* Table */}
        <div
          className="ci-fade-up overflow-hidden rounded-xl"
          style={{
            background: "var(--ci-bg-surface)",
            border: "1px solid var(--ci-border)",
            boxShadow: "var(--ci-shadow-sm)",
            animationDelay: "0.05s",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--ci-bg-wash)" }}>
                {["Name", "Email", "Role", "Status", "Last Login"].map(
                  (header, i) => (
                    <th
                      key={header}
                      style={{
                        padding: "12px 16px",
                        textAlign: i >= 2 && i <= 3 ? "center" : i === 4 ? "right" : "left",
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "var(--ci-text-tertiary)",
                        borderBottom: "1px solid var(--ci-border)",
                      }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "40px 16px",
                      textAlign: "center",
                      color: "var(--ci-text-tertiary)",
                      fontSize: 13,
                    }}
                  >
                    No users found matching your search.
                  </td>
                </tr>
              )}
              {filtered.map((user, i) => {
                const role = ROLE_BADGE[user.role];
                const status = STATUS_BADGE[user.status];
                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom:
                        i < filtered.length - 1
                          ? "1px solid var(--ci-border)"
                          : "none",
                      transition: "background 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--ci-bg-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Name + Avatar */}
                    <td style={{ padding: "14px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "var(--ci-accent-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--ci-navy)",
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <span
                          style={{
                            fontWeight: 500,
                            color: "var(--ci-text)",
                          }}
                        >
                          {user.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td
                      style={{
                        padding: "14px 16px",
                        color: "var(--ci-text-secondary)",
                      }}
                    >
                      {user.email}
                    </td>

                    {/* Role */}
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 10,
                          background: role.bg,
                          color: role.color,
                          textTransform: "capitalize",
                        }}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 10,
                          background: status.bg,
                          color: status.color,
                          textTransform: "capitalize",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: status.dot,
                          }}
                        />
                        {user.status}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td
                      style={{
                        padding: "14px 16px",
                        textAlign: "right",
                        color: "var(--ci-text-tertiary)",
                        fontSize: 12,
                      }}
                    >
                      {user.lastLogin ? timeAgo(user.lastLogin) : "Never"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
