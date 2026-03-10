"use client";

import { MOCK_CHATS } from "@/lib/mock-data";
import { ChatHistoryItem } from "./ChatHistoryItem";

function groupByDate(chats: typeof MOCK_CHATS) {
  const now = Date.now();
  const groups: { label: string; chats: typeof MOCK_CHATS }[] = [];
  const today: typeof MOCK_CHATS = [];
  const yesterday: typeof MOCK_CHATS = [];
  const week: typeof MOCK_CHATS = [];
  const older: typeof MOCK_CHATS = [];

  for (const chat of chats) {
    const age = now - new Date(chat.updatedAt).getTime();
    const days = age / (1000 * 60 * 60 * 24);
    if (days < 1) today.push(chat);
    else if (days < 2) yesterday.push(chat);
    else if (days < 7) week.push(chat);
    else older.push(chat);
  }

  if (today.length) groups.push({ label: "Today", chats: today });
  if (yesterday.length) groups.push({ label: "Yesterday", chats: yesterday });
  if (week.length) groups.push({ label: "Previous 7 days", chats: week });
  if (older.length) groups.push({ label: "Older", chats: older });

  return groups;
}

export function ChatHistoryList() {
  const groups = groupByDate(MOCK_CHATS);

  if (groups.length === 0) {
    return (
      <p className="px-4 py-3 text-xs text-zinc-400">No conversations yet</p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-4 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            {group.label}
          </p>
          {group.chats.map((chat) => (
            <ChatHistoryItem key={chat.id} chat={chat} />
          ))}
        </div>
      ))}
    </div>
  );
}
