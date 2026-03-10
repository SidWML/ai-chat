import { ChatContainer } from "@/components/v2/chat/ChatContainer";

export default async function V2ChatIdPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  return <ChatContainer chatId={chatId} />;
}
