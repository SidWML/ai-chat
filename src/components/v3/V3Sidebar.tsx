"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MOCK_CHATS } from "@/lib/mock-data";
import {
  IconPlus,
  IconChat,
  IconSettings,
  IconSearch,
  IconTrash,
  IconPanelLeft,
  IconGrid,
  IconLogout,
} from "@/components/v2/ui/Icons";

function groupByDate(chats: typeof MOCK_CHATS) {
  const now = Date.now();
  const day = 86400000;
  const groups: { label: string; chats: typeof MOCK_CHATS }[] = [];
  const today: typeof MOCK_CHATS = [];
  const yesterday: typeof MOCK_CHATS = [];
  const week: typeof MOCK_CHATS = [];
  const older: typeof MOCK_CHATS = [];

  for (const chat of chats) {
    const diff = now - new Date(chat.updatedAt).getTime();
    if (diff < day) today.push(chat);
    else if (diff < day * 2) yesterday.push(chat);
    else if (diff < day * 7) week.push(chat);
    else older.push(chat);
  }

  if (today.length) groups.push({ label: "Today", chats: today });
  if (yesterday.length) groups.push({ label: "Yesterday", chats: yesterday });
  if (week.length) groups.push({ label: "Previous 7 days", chats: week });
  if (older.length) groups.push({ label: "Older", chats: older });
  return groups;
}

interface V3SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function V3Sidebar({ isOpen, onToggle, onClose }: V3SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  const filteredChats = searchQuery
    ? MOCK_CHATS.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_CHATS;

  const groups = groupByDate(filteredChats);
  const activeChatId = pathname?.split("/chat/")?.[1];
  const isDashboards = pathname?.includes("/dashboards");
  const isSettings = pathname?.includes("/settings");

  const handleNewChat = () => {
    router.push("/v3/chat");
    if (window.innerWidth < 1024) onClose();
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/v3/chat/${chatId}`);
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden v3-fade-in"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col transition-transform duration-200 ease-out lg:relative lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:-translate-x-full"
        }`}
        style={{
          background: "var(--v3-bg-sidebar)",
          borderRight: "1px solid var(--v3-border)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <img className="v3-logo h-6" src="/logo.svg" alt="CInsights" />

          </div>
          <button
            onClick={onToggle}
            style={{ color: "var(--v3-text-muted)", padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; e.currentTarget.style.color = "var(--v3-text-secondary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--v3-text-muted)"; }}
          >
            <IconPanelLeft className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 pb-3">
          <button
            onClick={handleNewChat}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid var(--v3-border)",
              background: "var(--v3-bg-surface)",
              color: "var(--v3-text)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--v3-border-hover)"; e.currentTarget.style.background = "var(--v3-bg-elevated)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--v3-border)"; e.currentTarget.style.background = "var(--v3-bg-surface)"; }}
          >
            <IconPlus className="h-4 w-4" style={{ color: "var(--v3-accent)" }} />
            New Chat
          </button>
        </div>

        {/* Nav items */}
        <div className="px-3 pb-2 flex flex-col gap-0.5">
          <button
            onClick={() => { router.push("/v3/dashboards"); if (window.innerWidth < 1024) onClose(); }}
            className={isDashboards ? "v3-sidebar-active" : ""}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 12px",
              borderRadius: 10,
              border: "none",
              background: isDashboards ? "var(--v3-accent-subtle)" : "transparent",
              color: isDashboards ? "var(--v3-text)" : "var(--v3-text-secondary)",
              fontSize: 13,
              fontWeight: isDashboards ? 500 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => { if (!isDashboards) e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
            onMouseLeave={(e) => { if (!isDashboards) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ color: isDashboards ? "var(--v3-accent)" : "var(--v3-text-muted)", display: "flex" }}><IconGrid className="h-4 w-4" /></span>
            Dashboards
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 v3-input-glow"
            style={{
              background: "var(--v3-bg-input)",
              border: "1px solid var(--v3-border)",
              transition: "all 0.15s",
            }}
          >
            <IconSearch className="h-3.5 w-3.5" style={{ color: "var(--v3-text-muted)" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 12,
                color: "var(--v3-text)",
              }}
            />
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto v3-scroll px-2">
          {groups.length === 0 && (
            <div style={{ padding: "32px 12px", textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "var(--v3-text-muted)" }}>
                {searchQuery ? "No chats found" : "No conversations yet"}
              </p>
            </div>
          )}
          {groups.map((group) => (
            <div key={group.label} style={{ marginBottom: 8 }}>
              <div style={{ padding: "8px 12px" }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--v3-text-dimmed)" }}>
                  {group.label}
                </span>
              </div>
              {group.chats.map((chat) => {
                const isActive = activeChatId === chat.id;
                return (
                  <button
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    onMouseEnter={() => setHoveredChat(chat.id)}
                    onMouseLeave={() => setHoveredChat(null)}
                    className={isActive ? "v3-sidebar-active" : ""}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "none",
                      background: isActive ? "var(--v3-accent-subtle)" : hoveredChat === chat.id ? "var(--v3-bg-hover)" : "transparent",
                      color: isActive ? "var(--v3-text)" : "var(--v3-text-secondary)",
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      cursor: "pointer",
                      transition: "all 0.12s",
                      textAlign: "left",
                    }}
                  >
                    <IconChat className="h-3.5 w-3.5 shrink-0" style={{ color: isActive ? "var(--v3-accent)" : "var(--v3-text-muted)" }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {chat.title}
                    </span>
                    {hoveredChat === chat.id && !isActive && (
                      <IconTrash className="h-3 w-3 shrink-0" style={{ color: "var(--v3-text-muted)", opacity: 0.5 }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer — Profile + actions */}
        <div style={{ borderTop: "1px solid var(--v3-border)", padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 10,
                background: "var(--v3-gradient)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0,
              }}
            >
              AJ
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "var(--v3-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Alex Johnson
              </p>
              <p style={{ fontSize: 10, color: "var(--v3-text-muted)", margin: 0 }}>
                Pro Plan
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
              <button
                onClick={() => { router.push("/v3/settings"); if (window.innerWidth < 1024) onClose(); }}
                title="Settings"
                style={{
                  width: 28, height: 28, borderRadius: 8, border: "none",
                  background: isSettings ? "var(--v3-accent-subtle)" : "transparent",
                  color: isSettings ? "var(--v3-accent)" : "var(--v3-text-muted)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; e.currentTarget.style.color = "var(--v3-text-secondary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isSettings ? "var(--v3-accent-subtle)" : "transparent"; e.currentTarget.style.color = isSettings ? "var(--v3-accent)" : "var(--v3-text-muted)"; }}
              >
                <IconSettings className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { router.push("/"); }}
                title="Log out"
                style={{
                  width: 28, height: 28, borderRadius: 8, border: "none",
                  background: "transparent",
                  color: "var(--v3-text-muted)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; e.currentTarget.style.color = "var(--v3-error, #DC2626)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--v3-text-muted)"; }}
              >
                <IconLogout className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
