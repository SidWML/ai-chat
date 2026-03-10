"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/providers/SidebarProvider";
import { useAuth } from "@/lib/v2/auth";
import { useSearchThreads, useConnections, useCollections, useDeleteThread, useCreateCollection, useDeleteCollection } from "@/lib/v2/queries";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import {
  IconPlus, IconChat, IconDatabase, IconCollection, IconSettings,
  IconLogout, IconSearch, IconGrid, IconTable,
} from "@/components/v2/ui/Icons";

const DB_COLORS: Record<string, string> = {
  postgresql: "#336791", mysql: "#00758F", mssql: "#CC2927",
};

type Tab = "chats" | "databases" | "collections";

export function Sidebar() {
  const { isOpen, close } = useSidebar();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [tab, setTab] = useState<Tab>("chats");
  const [search, setSearch] = useState("");

  const { data: threads } = useSearchThreads({ limit: 50 });
  const { data: connectionsData } = useConnections();
  const { data: collections } = useCollections();
  const deleteThread = useDeleteThread();
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();

  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>([]);

  const threadList = threads ?? [];
  const connectionList = connectionsData?.items ?? [];
  const collectionList = collections ?? [];

  const filteredThreads = threadList.filter(t =>
    (t.title ?? "Untitled").toLowerCase().includes(search.toLowerCase())
  );
  const filteredConnections = connectionList.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCollections = collectionList.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden" onClick={close} />}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )} style={{ background: "var(--ci-bg-sidebar)", borderRight: "1px solid var(--ci-border)" }}>

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: "1px solid var(--ci-border)" }}>
          <img src="/logo.svg" alt={APP_NAME} className="h-7" style={{ objectFit: "contain" }} />
        </div>

        {/* New Conversation */}
        <div className="px-3 pt-3">
          <Link href={ROUTES.V2_CHAT} className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)", boxShadow: "var(--ci-shadow-sm)" }}>
            <IconPlus className="h-3.5 w-3.5" strokeWidth={2.5} />
            New Conversation
          </Link>
        </div>

        {/* Search */}
        <div className="px-3 pt-3">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2" style={{ color: "var(--ci-text-muted)" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg py-1.5 pl-8 pr-3 text-[12px] outline-none transition-all focus:ring-2"
              style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)", color: "var(--ci-text-secondary)" }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 pt-3">
          {(["chats", "databases", "collections"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn("flex-1 rounded-lg py-1.5 text-[11px] font-semibold capitalize transition-all", tab === t ? "shadow-sm" : "hover:bg-white/50")}
              style={tab === t ? { background: "var(--ci-bg-surface)", color: "var(--ci-navy)", boxShadow: "var(--ci-shadow-sm)" } : { color: "var(--ci-text-muted)" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 pt-2 pb-2 v2-scrollbar">
          {tab === "chats" && (
            <div className="space-y-1">
              {filteredThreads.length === 0 && (
                <p className="px-3 py-4 text-center text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                  {search ? "No conversations found" : "No conversations yet"}
                </p>
              )}
              {filteredThreads.map((thread: any) => {
                const isActive = pathname === `${ROUTES.V2_CHAT}/${thread.thread_id}`;
                return (
                  <div key={thread.thread_id} className="group relative">
                    <Link href={`${ROUTES.V2_CHAT}/${thread.thread_id}`}
                      className={cn("flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all", isActive ? "shadow-sm" : "hover:bg-white/60")}
                      style={isActive ? { background: "var(--ci-bg-surface)", boxShadow: "var(--ci-shadow-sm)" } : {}}>
                      <IconChat className="h-3.5 w-3.5 shrink-0" style={{ color: isActive ? "var(--ci-navy)" : "var(--ci-text-muted)" }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium" style={{ color: isActive ? "var(--ci-text)" : "var(--ci-text-secondary)" }}>{thread.title ?? "Untitled"}</p>
                        <p className="truncate text-[10px]" style={{ color: "var(--ci-text-muted)" }}>
                          {thread.connection_name && <span>{thread.connection_name} &middot; </span>}
                          {new Date(thread.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteThread.mutate(thread.thread_id); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50"
                      style={{ color: "var(--ci-text-muted)" }}
                      title="Delete conversation"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {tab === "databases" && (
            <div className="space-y-1">
              {filteredConnections.length === 0 && (
                <p className="px-3 py-4 text-center text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                  {search ? "No databases found" : "No databases connected"}
                </p>
              )}
              {filteredConnections.map((conn: any) => (
                <Link key={conn.id} href={`${ROUTES.V2_EXPLORER}?connection=${conn.id}`}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all hover:bg-white/60">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white" style={{ background: DB_COLORS[conn.type] || "var(--ci-navy)" }}>
                    {conn.type.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium" style={{ color: "var(--ci-text-secondary)" }}>{conn.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--ci-text-muted)" }}>{conn.type} &middot; {conn.tables_count ?? 0} tables</p>
                  </div>
                  <span className="h-2 w-2 rounded-full" style={{ background: conn.status === "active" ? "#22C55E" : "#EF4444" }} />
                </Link>
              ))}
              <Link href={ROUTES.V2_SETTINGS}
                className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-all hover:bg-white/60"
                style={{ color: "var(--ci-navy)", border: "1px dashed var(--ci-border)" }}>
                <IconPlus className="h-3 w-3" /> Add Connection
              </Link>
            </div>
          )}
          {tab === "collections" && (
            <div className="space-y-1">
              {filteredCollections.length === 0 && !showCreateCollection && (
                <p className="px-3 py-4 text-center text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                  {search ? "No collections found" : "No collections yet"}
                </p>
              )}
              {filteredCollections.map((col: any) => (
                <div key={col.id} className="group relative">
                  <Link href={`${ROUTES.V2_CHAT}?collection=${col.id}`}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all hover:bg-white/60">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: col.color || "var(--ci-navy)" }}>
                      <IconCollection className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium" style={{ color: "var(--ci-text-secondary)" }}>{col.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--ci-text-muted)" }}>{col.connection_ids?.length ?? col.database_ids?.length ?? col.databaseIds?.length ?? 0} databases</p>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCollection.mutate(col.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50"
                    style={{ color: "var(--ci-text-muted)" }}
                    title="Delete collection"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              ))}
              {showCreateCollection && (
                <div className="rounded-xl p-3 space-y-2" style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}>
                  <input
                    value={newCollectionName}
                    onChange={e => setNewCollectionName(e.target.value)}
                    placeholder="Collection name"
                    className="w-full rounded-lg px-3 py-1.5 text-[12px] outline-none transition-all focus:ring-2"
                    style={{ background: "var(--ci-bg-sidebar)", border: "1px solid var(--ci-border)", color: "var(--ci-text)" }}
                    autoFocus
                  />
                  <textarea
                    value={newCollectionDesc}
                    onChange={e => setNewCollectionDesc(e.target.value)}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full rounded-lg px-3 py-1.5 text-[12px] outline-none transition-all focus:ring-2 resize-none"
                    style={{ background: "var(--ci-bg-sidebar)", border: "1px solid var(--ci-border)", color: "var(--ci-text)" }}
                  />
                  {connectionList.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium mb-1" style={{ color: "var(--ci-text-muted)" }}>Add databases</p>
                      <div className="max-h-28 overflow-y-auto space-y-0.5 v2-scrollbar">
                        {connectionList.map((conn: any) => (
                          <label key={conn.id} className="flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] cursor-pointer hover:bg-white/60" style={{ color: "var(--ci-text-secondary)" }}>
                            <input
                              type="checkbox"
                              checked={selectedConnectionIds.includes(conn.id)}
                              onChange={e => {
                                setSelectedConnectionIds(prev =>
                                  e.target.checked
                                    ? [...prev, conn.id]
                                    : prev.filter(id => id !== conn.id)
                                );
                              }}
                              className="rounded"
                            />
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-[7px] font-bold text-white" style={{ background: DB_COLORS[conn.type] || "var(--ci-navy)" }}>
                                {conn.type?.slice(0, 2).toUpperCase()}
                              </span>
                              <span className="truncate">{conn.name}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        if (!newCollectionName.trim()) return;
                        createCollection.mutate(
                          { name: newCollectionName.trim(), description: newCollectionDesc.trim() || undefined, connection_ids: selectedConnectionIds },
                          {
                            onSuccess: () => {
                              setShowCreateCollection(false);
                              setNewCollectionName("");
                              setNewCollectionDesc("");
                              setSelectedConnectionIds([]);
                            },
                          }
                        );
                      }}
                      disabled={!newCollectionName.trim() || createCollection.isPending}
                      className="flex-1 rounded-lg py-1.5 text-[11px] font-semibold text-white transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}
                    >
                      {createCollection.isPending ? "Creating..." : "Create"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateCollection(false);
                        setNewCollectionName("");
                        setNewCollectionDesc("");
                        setSelectedConnectionIds([]);
                      }}
                      className="rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all hover:bg-white/60"
                      style={{ color: "var(--ci-text-muted)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {!showCreateCollection && (
                <button
                  onClick={() => setShowCreateCollection(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-all hover:bg-white/60"
                  style={{ color: "var(--ci-navy)", border: "1px dashed var(--ci-border)" }}
                >
                  <IconPlus className="h-3 w-3" /> Create Collection
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom section */}
        <div className="px-3 pb-3 pt-2 space-y-1" style={{ borderTop: "1px solid var(--ci-border)" }}>
          {user && (
            <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg, var(--ci-navy), var(--ci-coral))" }}>
                {(user.full_name ?? "U").charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold" style={{ color: "var(--ci-text)" }}>{user.full_name}</p>
                <p className="truncate text-[10px]" style={{ color: "var(--ci-text-muted)" }}>{user.email}</p>
              </div>
              <Link href={ROUTES.V2_SETTINGS} className="rounded-lg p-1.5 transition-colors hover:bg-white/60" style={{ color: "var(--ci-text-muted)" }} title="Settings">
                <IconSettings className="h-3.5 w-3.5" />
              </Link>
              <button onClick={logout} className="rounded-lg p-1.5 transition-colors hover:bg-red-50" style={{ color: "var(--ci-text-muted)" }} title="Log out">
                <IconLogout className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
