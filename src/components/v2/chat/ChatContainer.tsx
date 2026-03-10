"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useCanvas } from "@/components/v2/canvas/CanvasProvider";
import { useConnectionStore } from "@/stores/v2/connectionStore";
import {
  createThread,
  getThreadState,
  sendMessageStream,
} from "@/lib/v2/chat-api";
import type { CanvasBlock, ProcessingState } from "@/lib/canvas-types";
import { EmptyState } from "@/components/v2/chat/EmptyState";
import { UserMessage } from "@/components/v2/chat/UserMessage";
import { AssistantMessage } from "@/components/v2/chat/AssistantMessage";
import type { ChatMessage, ChatMessageMeta } from "@/components/v2/chat/AssistantMessage";
import { ProcessingIndicator } from "@/components/v2/chat/ProcessingIndicator";
import { ChatInput } from "@/components/v2/chat/ChatInput";
export type { ChatMessage };

interface ChatContainerProps {
  chatId?: string;
}

/* ── Helpers ── */

function convertMockBlocks(blocks: any[]): CanvasBlock[] {
  return blocks.map((b: any) => ({
    id: b.id || b.block_id || `block-${Date.now()}`,
    type: (b.type === "python" ? "code" : b.type) as CanvasBlock["type"],
    title: b.title || "Result",
    content: b.content,
    data: b.type === "table"
      ? { columns: b.columns, rows: b.rows }
      : b.type === "chart"
      ? { chartType: b.chartType, data: b.data }
      : b.type === "map"
      ? { mapType: b.mapType, locations: b.locations, center: b.center, zoom: b.zoom }
      : b.data,
    status: "ready" as const,
  }));
}

function extractTextContent(
  content: string | Array<{ type: string; text?: string }>
): string {
  if (typeof content === "string") return content;
  return content.filter((c) => c.type === "text" && c.text).map((c) => c.text!).join("");
}

function generateMockSql(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("revenue") || q.includes("sales"))
    return "SELECT DATE_TRUNC('month', created_at) AS month,\n       SUM(amount) AS revenue,\n       COUNT(*) AS orders\nFROM orders\nWHERE created_at >= NOW() - INTERVAL '6 months'\nGROUP BY 1\nORDER BY 1;";
  if (q.includes("product") || q.includes("selling"))
    return "SELECT p.name AS product,\n       p.category,\n       p.price,\n       COUNT(oi.id) AS units_sold,\n       SUM(oi.quantity * oi.price) AS revenue\nFROM products p\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY 1, 2, 3\nORDER BY revenue DESC\nLIMIT 10;";
  if (q.includes("customer") || q.includes("user"))
    return "SELECT c.name AS customer,\n       c.segment,\n       SUM(o.total) AS lifetime_value,\n       COUNT(o.id) AS orders,\n       MAX(o.created_at) AS last_order\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY 1, 2\nORDER BY lifetime_value DESC\nLIMIT 10;";
  return "SELECT *\nFROM results\nWHERE created_at >= NOW() - INTERVAL '6 months'\nORDER BY created_at DESC\nLIMIT 100;";
}

/* ═══════════════════════════════════════════════════════
   Chat container (mock-server)
   ═══════════════════════════════════════════════════════ */

export function ChatContainer({ chatId }: ChatContainerProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setBlocks, openCanvas } = useCanvas();
  const activeConnectionId = useConnectionStore((s) => s.activeConnectionId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(chatId ?? null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastUserQuery = useRef<string>("");

  // Load existing thread
  useEffect(() => {
    if (!chatId) return;
    let cancelled = false;

    async function loadThread() {
      try {
        const state = await getThreadState(chatId!);
        if (cancelled) return;

        const rawMessages = state.values?.messages ?? state.messages;
        if (Array.isArray(rawMessages)) {
          const loaded: ChatMessage[] = rawMessages.map((m: any, i: number) => ({
            id: `${chatId}-${i}`,
            role: m.role === "human" ? ("user" as const) : ("assistant" as const),
            content: typeof m.content === "string" ? m.content : extractTextContent(m.content),
            timestamp: new Date(),
            metadata: m.role === "assistant" ? {
              databaseName: state.values?.connection_name || undefined,
              executionTimeMs: Math.floor(Math.random() * 200) + 80,
              queryExecuted: m.canvas ? generateMockSql(rawMessages[i - 1]?.content || "") : undefined,
            } : undefined,
          }));
          setMessages(loaded.filter((m) => m.role === "user" || m.role === "assistant"));

          const lastWithCanvas = [...rawMessages].reverse().find((m: any) => m.canvas);
          if (lastWithCanvas?.canvas?.blocks) {
            const blocks = convertMockBlocks(lastWithCanvas.canvas.blocks);
            if (blocks.length) { setBlocks(blocks); openCanvas(); }
          }
        }
      } catch (err) {
        if (!cancelled) { console.error("Failed to load thread:", err); setError("Failed to load conversation."); }
      }
    }

    loadThread();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isStreaming]);

  // Simple thinking indicator
  useEffect(() => {
    if (!isStreaming) { setProcessingState(null); return; }
    setProcessingState({ step: "thinking", message: "Thinking..." });
  }, [isStreaming]);

  const doSendMessage = useCallback(
    async (text: string, connectionId: string | null) => {
      setError(null);
      lastUserQuery.current = text;
      const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: text, timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      let currentThreadId = threadId;

      try {
        if (!currentThreadId) {
          const { thread_id } = await createThread();
          currentThreadId = thread_id;
          setThreadId(thread_id);
          router.replace(`/v2/chat/${thread_id}`);
        }

        let assistantText = "";
        const assistantMsgId = `assistant-${Date.now()}`;
        const streamStartTime = Date.now();

        const stream = sendMessageStream({
          threadId: currentThreadId,
          messages: [{ role: "human", content: text }],
          connectionId,
        });

        for await (const event of stream) {
          if (event.event === "updates" && event.data) {
            if (processingState) {
              setProcessingState({ step: "complete", message: "Done", progress: 100 });
              setTimeout(() => setProcessingState(null), 400);
            }

            const ops = (event.data as any)?.ops;
            if (Array.isArray(ops)) {
              for (const op of ops) {
                if (op.path?.includes("streamed_output_str") && op.value) {
                  assistantText += op.value;
                  setMessages((prev) => {
                    const existing = prev.find((m) => m.id === assistantMsgId);
                    if (existing) return prev.map((m) => m.id === assistantMsgId ? { ...m, content: assistantText } : m);
                    return [...prev, { id: assistantMsgId, role: "assistant" as const, content: assistantText, timestamp: new Date() }];
                  });
                }
              }
            }
          }
        }

        const executionTimeMs = Date.now() - streamStartTime;
        const metadata: ChatMessageMeta = {
          databaseName: "Production Analytics",
          executionTimeMs,
          queryExecuted: generateMockSql(text),
        };

        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === assistantMsgId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], metadata };
            return updated;
          }
          if (assistantText) {
            return [...prev, { id: assistantMsgId, role: "assistant" as const, content: assistantText, timestamp: new Date(), metadata }];
          }
          return prev;
        });

        try {
          const state = await getThreadState(currentThreadId);
          const allMessages = state.values?.messages ?? [];
          const lastAssistant = [...allMessages].reverse().find((m: any) => m.canvas);
          if (lastAssistant?.canvas?.blocks) {
            const blocks = convertMockBlocks(lastAssistant.canvas.blocks);
            if (blocks.length) { setBlocks(blocks); openCanvas(); }
          }
        } catch (stateErr) {
          console.error("Failed to fetch canvas:", stateErr);
        }
      } catch (err) {
        console.error("Stream error:", err);
        const errorMessage = err instanceof Error ? err.message : "Something went wrong";
        setError(errorMessage);
        setMessages((prev) => [...prev, { id: `error-${Date.now()}`, role: "assistant", content: `Sorry, I encountered an error: ${errorMessage}`, timestamp: new Date() }]);
      } finally {
        setIsStreaming(false);
      }
    },
    [threadId, router, setBlocks, openCanvas, processingState]
  );

  const handleSend = useCallback(
    (text: string) => {
      doSendMessage(text, activeConnectionId);
    },
    [activeConnectionId, doSendMessage]
  );

  const handleRegenerate = useCallback(
    (messageId: string) => {
      const idx = messages.findIndex((m) => m.id === messageId);
      if (idx < 1) return;
      const userMsg = messages.slice(0, idx).reverse().find((m) => m.role === "user");
      if (!userMsg) return;
      setMessages((prev) => prev.slice(0, idx));
      doSendMessage(userMsg.content, activeConnectionId);
    },
    [messages, activeConnectionId, doSendMessage]
  );

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--ci-bg)" }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto v2-scrollbar">
        {messages.length === 0 && !isStreaming ? (
          <EmptyState onSuggestion={handleSend} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((msg) =>
              msg.role === "user" ? (
                <UserMessage key={msg.id} message={msg} />
              ) : (
                <AssistantMessage key={msg.id} message={msg} onRegenerate={handleRegenerate} />
              )
            )}
            {isStreaming && processingState && <ProcessingIndicator state={processingState} />}
            {error && !isStreaming && (
              <div className="mx-auto max-w-md rounded-xl px-4 py-3 text-center text-[12px]"
                style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
