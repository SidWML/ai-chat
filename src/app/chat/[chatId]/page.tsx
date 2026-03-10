"use client";

import { useParams } from "next/navigation";
import { ChatContainer } from "@/components/chat/ChatContainer";

export default function ChatIdPage() {
  const params = useParams();
  const chatId = params?.chatId as string | undefined;
  return <ChatContainer chatId={chatId} />;
}
