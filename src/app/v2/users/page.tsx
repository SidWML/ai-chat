"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_USERS, AppUser } from "@/lib/mock-features";
import { ROUTES } from "@/lib/constants";
import { IconArrowLeft, IconPlus, IconChat } from "@/components/v2/ui/Icons";

const ROLE_BADGES: Record<
  AppUser["role"],
  { label: string; bg: string; color: string }
> = {
  admin: { label: "Admin", bg: "var(--ci-navy)", color: "#fff" },
  editor: { label: "Editor", bg: "#2563EB", color: "#fff" },
  viewer: { label: "Viewer", bg: "#6B7280", color: "#fff" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return "Never";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Never";
  }
}

export default function V2UsersPage() {
  const [search, setSearch] = useState("");

  const filteredUsers = MOCK_USERS.filter((user) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--ci-bg)" }}
    >
      {/* Header */}
      <div
        className="v2-fade-in flex shrink-0 items-center justify-between px-8 py-4"
        style={{
          borderBottom: "1px solid var(--ci-border)",
          background: "var(--ci-bg-surface)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.V2_CHAT}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            style={{ color: "var(--ci-text-muted)" }}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Link>
          <h1
            className="text-[16px] font-bold"
            style={{ color: "var(--ci-text)" }}
          >
            Users
          </h1>
        </div>
        <Link
          href={ROUTES.V2_CHAT}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-black/5"
          style={{ color: "var(--ci-text-secondary)" }}
        >
          <IconChat className="h-4 w-4" />
          Back to Chat
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-8">
        <div className="mx-auto w-full max-w-5xl">
          {/* Section header */}
          <div className="v2-fade-up mb-6 flex items-center justify-between">
            <div>
              <p
                className="text-[15px] font-bold"
                style={{ color: "var(--ci-text)" }}
              >
                Team Members
              </p>
              <p
                className="mt-0.5 text-[12px]"
                style={{ color: "var(--ci-text-muted)" }}
              >
                Manage user access, roles, and permissions.
              </p>
            </div>
            <button
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
              }}
            >
              <IconPlus className="h-3.5 w-3.5" />
              Invite User
            </button>
          </div>

          {/* Search input */}
          <div
            className="v2-fade-up mb-5"
            style={{ animationDelay: "40ms" }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all focus:ring-2"
              style={{
                background: "var(--ci-bg-surface)",
                border: "1px solid var(--ci-border)",
                color: "var(--ci-text)",
              }}
            />
          </div>

          {/* User cards */}
          <div className="space-y-3">
            {filteredUsers.map((user, i) => {
              const role = ROLE_BADGES[user.role];
              const isActive = user.status === "active";

              return (
                <div
                  key={user.id}
                  className="v2-fade-up group rounded-2xl transition-all hover:shadow-md"
                  style={{
                    background: "var(--ci-bg-surface)",
                    border: "1px solid var(--ci-border)",
                    animationDelay: `${60 + i * 40}ms`,
                  }}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Avatar with initials */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                      style={{ background: "var(--ci-navy)" }}
                    >
                      {getInitials(user.name)}
                    </div>

                    {/* Name + Email */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[13px] font-semibold"
                        style={{ color: "var(--ci-text)" }}
                      >
                        {user.name}
                      </p>
                      <p
                        className="truncate text-[12px]"
                        style={{ color: "var(--ci-text-muted)" }}
                      >
                        {user.email}
                      </p>
                    </div>

                    {/* Role badge */}
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: role.bg,
                        color: role.color,
                      }}
                    >
                      {role.label}
                    </span>

                    {/* Status */}
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: isActive ? "#22C55E" : "#EF4444",
                          boxShadow: isActive
                            ? "0 0 6px rgba(34, 197, 94, 0.4)"
                            : "0 0 6px rgba(239, 68, 68, 0.4)",
                        }}
                      />
                      <span
                        className="text-[11px] font-medium capitalize"
                        style={{ color: isActive ? "#22C55E" : "#EF4444" }}
                      >
                        {user.status}
                      </span>
                    </span>

                    {/* Last login */}
                    <span
                      className="shrink-0 text-[11px]"
                      style={{ color: "var(--ci-text-muted)" }}
                    >
                      {formatRelativeTime(user.lastLogin)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Empty search state */}
            {filteredUsers.length === 0 && (
              <div
                className="v2-fade-in rounded-2xl p-10 text-center"
                style={{
                  background: "var(--ci-bg-surface)",
                  border: "2px dashed var(--ci-border)",
                }}
              >
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: "var(--ci-text)" }}
                >
                  No users found
                </p>
                <p
                  className="mt-1 text-[12px]"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Try a different search term.
                </p>
              </div>
            )}
          </div>

          {/* Summary footer */}
          <div
            className="v2-fade-up mt-4 flex items-center justify-between"
            style={{ animationDelay: "200ms" }}
          >
            <p
              className="text-[12px]"
              style={{ color: "var(--ci-text-muted)" }}
            >
              Showing {filteredUsers.length} of {MOCK_USERS.length} users
            </p>
            <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-1.5 text-[11px]"
                style={{ color: "var(--ci-text-muted)" }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: "#22C55E" }}
                />
                {MOCK_USERS.filter((u) => u.status === "active").length} active
              </span>
              <span
                className="flex items-center gap-1.5 text-[11px]"
                style={{ color: "var(--ci-text-muted)" }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: "#EF4444" }}
                />
                {MOCK_USERS.filter((u) => u.status === "inactive").length}{" "}
                inactive
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
