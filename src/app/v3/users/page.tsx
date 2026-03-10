"use client";

import { useState } from "react";
import { V3Sidebar } from "@/components/v3/V3Sidebar";
import { MOCK_USERS, AppUser } from "@/lib/mock-features";
import { IconPlus, IconSearch, IconPanelLeft } from "@/components/v2/ui/Icons";

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
  admin: { bg: "rgba(99, 102, 241, 0.12)", color: "#A78BFA" },
  editor: { bg: "rgba(59, 130, 246, 0.12)", color: "#60A5FA" },
  viewer: { bg: "rgba(255, 255, 255, 0.05)", color: "var(--v3-text-muted)" },
};

const STATUS_DOT: Record<AppUser["status"], string> = {
  active: "var(--v3-success)",
  inactive: "var(--v3-text-dimmed)",
};

export default function V3UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div style={{ display: "flex", height: "100vh", background: "var(--v3-bg)" }}>
      <V3Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderBottom: "1px solid var(--v3-border)", flexShrink: 0 }}>
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", color: "var(--v3-text-muted)", cursor: "pointer", display: "flex" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <IconPanelLeft className="h-4 w-4" />
            </button>
          )}
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--v3-accent)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.02em" }}>
            Users
          </h1>
          <span style={{ fontSize: 12, color: "var(--v3-text-muted)", marginLeft: 4 }}>
            Manage team members and permissions
          </span>
        </div>

        <div className="v3-scroll" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Toolbar */}
            <div className="v3-fade-up" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              {/* Search */}
              <div style={{ position: "relative", flex: 1 }}>
                <IconSearch className="h-4 w-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--v3-text-muted)", pointerEvents: "none" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or role..."
                  style={{
                    width: "100%", padding: "10px 14px 10px 38px", borderRadius: 12,
                    border: "1px solid var(--v3-border)", background: "var(--v3-bg-input)",
                    color: "var(--v3-text)", fontSize: 13, outline: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--v3-accent)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px var(--v3-accent-subtle)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--v3-border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Invite button */}
              <button
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 18px", borderRadius: 12, border: "none",
                  background: "var(--v3-gradient)", color: "#fff",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "opacity 0.15s, transform 0.1s",
                  boxShadow: "var(--v3-shadow-sm)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <IconPlus className="h-3.5 w-3.5" />
                Invite User
              </button>
            </div>

            {/* Count */}
            <p style={{ fontSize: 12, color: "var(--v3-text-muted)", marginBottom: 12 }}>
              {filtered.length} {filtered.length === 1 ? "user" : "users"}
              {search && ` matching "${search}"`}
            </p>

            {/* Table */}
            <div
              className="v3-fade-up"
              style={{
                borderRadius: 16, overflow: "hidden",
                background: "var(--v3-bg-surface)",
                border: "1px solid var(--v3-border)",
                boxShadow: "var(--v3-shadow-sm)",
                animationDelay: "0.05s",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--v3-bg-wash)" }}>
                    {["Name", "Email", "Role", "Status", "Last Login"].map((header, i) => (
                      <th
                        key={header}
                        style={{
                          padding: "12px 16px",
                          textAlign: i >= 2 && i <= 3 ? "center" : i === 4 ? "right" : "left",
                          fontWeight: 600, fontSize: 10, textTransform: "uppercase",
                          letterSpacing: "0.06em", color: "var(--v3-text-muted)",
                          borderBottom: "1px solid var(--v3-border)",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: "48px 16px", textAlign: "center",
                          color: "var(--v3-text-muted)", fontSize: 13,
                        }}
                      >
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                  {filtered.map((user, i) => {
                    const role = ROLE_BADGE[user.role];
                    const dotColor = STATUS_DOT[user.status];
                    return (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: i < filtered.length - 1 ? "1px solid var(--v3-border)" : "none",
                          transition: "background 0.15s", cursor: "pointer",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        {/* Name + Avatar */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 34, height: 34, borderRadius: "50%",
                                background: "var(--v3-gradient-subtle)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "var(--v3-accent)", fontSize: 11, fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(user.name)}
                            </div>
                            <span style={{ fontWeight: 500, color: "var(--v3-text)" }}>
                              {user.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: "14px 16px", color: "var(--v3-text-secondary)" }}>
                          {user.email}
                        </td>

                        {/* Role */}
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block", fontSize: 10, fontWeight: 600,
                              padding: "3px 10px", borderRadius: 10,
                              background: role.bg, color: role.color,
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
                              display: "inline-flex", alignItems: "center", gap: 5,
                              fontSize: 11, fontWeight: 500, color: "var(--v3-text-secondary)",
                              textTransform: "capitalize",
                            }}
                          >
                            <span
                              style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: dotColor, flexShrink: 0,
                              }}
                            />
                            {user.status}
                          </span>
                        </td>

                        {/* Last Login */}
                        <td style={{ padding: "14px 16px", textAlign: "right", color: "var(--v3-text-muted)", fontSize: 12 }}>
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
      </div>
    </div>
  );
}
