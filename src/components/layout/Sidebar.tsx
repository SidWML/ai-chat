"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/providers/SidebarProvider";
import { useAuth } from "@/providers/AuthProvider";
import { MOCK_CHATS } from "@/lib/mock-data";
import Image from "next/image";
import {
  IconPlus,
  IconChat,
  IconSettings,
  IconSearch,
  IconTrash,
  IconPanelLeft,
  IconLogout,
  IconGrid,
} from "@/components/v2/ui/Icons";
import { ROUTES } from "@/lib/constants";

/* ─── Date grouping helper ─── */

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

export function Sidebar() {
  const { isOpen, close, toggle } = useSidebar();
  const { user, logout } = useAuth();
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

  const handleNewChat = () => {
    router.push("/chat");
    if (window.innerWidth < 1024) close();
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
    if (window.innerWidth < 1024) close();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden ci-fade-in"
          onClick={close}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col transition-transform duration-200 ease-out lg:relative lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:-translate-x-full"
        }`}
        style={{
          background: "var(--ci-bg-sidebar)",
          borderRight: "1px solid var(--ci-border)",
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-4">
          <Image
            src="/logo.svg"
            alt="CInsights"
            width={120}
            height={33}
            priority
          />
          <button
            onClick={toggle}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "var(--ci-text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--ci-bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <IconPanelLeft className="h-4 w-4" />
          </button>
        </div>

        {/* ── New Chat Button ── */}
        <div className="px-3 pb-3">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-white transition-all hover:shadow-lg active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, var(--ci-navy), var(--ci-navy-light))",
              boxShadow: "var(--ci-shadow-sm)",
            }}
          >
            <IconPlus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* ── Dashboards Button ── */}
        <div className="px-3 pb-2">
          <button
            onClick={() => {
              router.push(ROUTES.DASHBOARDS);
              if (window.innerWidth < 1024) close();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all active:scale-[0.98]"
            style={{
              background: pathname === ROUTES.DASHBOARDS ? "var(--ci-accent-subtle)" : "var(--ci-bg-surface)",
              border: "1px solid var(--ci-border)",
              color: pathname === ROUTES.DASHBOARDS ? "var(--ci-navy)" : "var(--ci-text-secondary)",
              fontWeight: pathname === ROUTES.DASHBOARDS ? 600 : 500,
            }}
            onMouseEnter={(e) => {
              if (pathname !== ROUTES.DASHBOARDS) e.currentTarget.style.background = "var(--ci-bg-hover)";
            }}
            onMouseLeave={(e) => {
              if (pathname !== ROUTES.DASHBOARDS) e.currentTarget.style.background = "var(--ci-bg-surface)";
            }}
          >
            <IconGrid className="h-4 w-4" style={{ color: pathname === ROUTES.DASHBOARDS ? "var(--ci-navy)" : "var(--ci-text-muted)" }} />
            Dashboards
            <span
              className="ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ background: "var(--ci-accent-subtle)", color: "var(--ci-navy)" }}
            >
              3
            </span>
          </button>
        </div>

        {/* ── Search ── */}
        <div className="px-3 pb-2">
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all ci-input-glow"
            style={{
              background: "var(--ci-bg-surface)",
              border: "1px solid var(--ci-border)",
            }}
          >
            <IconSearch
              className="h-3.5 w-3.5"
              style={{ color: "var(--ci-text-muted)" }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--ci-text-muted)]"
              style={{ color: "var(--ci-text)" }}
            />
          </div>
        </div>

        {/* ── Chat History ── */}
        <div className="flex-1 overflow-y-auto ci-scrollbar px-2">
          {groups.length === 0 && (
            <div className="px-3 py-8 text-center">
              <p
                className="text-[12px]"
                style={{ color: "var(--ci-text-muted)" }}
              >
                {searchQuery ? "No chats found" : "No conversations yet"}
              </p>
            </div>
          )}
          {groups.map((group) => (
            <div key={group.label} className="mb-2">
              <div className="px-3 py-2">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--ci-text-muted)" }}
                >
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
                    className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all ${
                      isActive ? "ci-sidebar-active" : ""
                    }`}
                    style={{
                      background: isActive
                        ? "var(--ci-accent-subtle)"
                        : hoveredChat === chat.id
                        ? "var(--ci-bg-hover)"
                        : "transparent",
                    }}
                  >
                    <IconChat
                      className="h-3.5 w-3.5 shrink-0"
                      style={{
                        color: isActive
                          ? "var(--ci-navy)"
                          : "var(--ci-text-muted)",
                      }}
                    />
                    <span
                      className="flex-1 truncate text-[13px]"
                      style={{
                        color: isActive
                          ? "var(--ci-navy)"
                          : "var(--ci-text-secondary)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {chat.title}
                    </span>
                    {hoveredChat === chat.id && !isActive && (
                      <IconTrash
                        className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
                        style={{ color: "var(--ci-text-muted)" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div
          className="mt-auto flex flex-col gap-1 px-3 py-3"
          style={{ borderTop: "1px solid var(--ci-border)" }}
        >
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors"
            style={{ color: "var(--ci-text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--ci-bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <IconSettings className="h-4 w-4" />
            Settings
          </button>

          {user && (
            <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--ci-navy), var(--ci-accent-vivid))",
                }}
              >
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="truncate text-[12px] font-medium"
                  style={{ color: "var(--ci-text)" }}
                >
                  {user.name}
                </p>
                <p
                  className="truncate text-[10px]"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  {user.email}
                </p>
              </div>
              <button
                onClick={logout}
                className="rounded-md p-1 transition-colors"
                style={{ color: "var(--ci-text-muted)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--ci-bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                title="Sign out"
              >
                <IconLogout className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
