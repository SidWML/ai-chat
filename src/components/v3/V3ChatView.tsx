"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconArrowUp } from "@/components/v2/ui/Icons";
import { useCanvas } from "@/components/v2/canvas/CanvasProvider";
import { IconCollection } from "@/components/v2/ui/Icons";
import type { CanvasBlock } from "@/lib/canvas-types";

/* ── Types ── */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/* ── Markdown-lite renderer (no dependencies) ── */

function renderContent(text: string) {
  // Simple formatting: **bold**, `code`, line breaks
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Headers
    if (line.startsWith("### ")) return <h4 key={i} style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: "12px 0 4px" }}>{line.slice(4)}</h4>;
    if (line.startsWith("## ")) return <h3 key={i} style={{ fontSize: 15, fontWeight: 600, color: "var(--v3-text)", margin: "14px 0 6px" }}>{line.slice(3)}</h3>;
    // Bullets
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <span style={{ color: "var(--v3-accent)", marginTop: 2 }}>&#x2022;</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s/);
    if (numMatch) {
      return (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <span style={{ color: "var(--v3-accent)", fontWeight: 500, minWidth: 16 }}>{numMatch[1]}.</span>
          <span>{formatInline(line.slice(numMatch[0].length))}</span>
        </div>
      );
    }
    // Empty line
    if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
    // Regular
    return <p key={i} style={{ margin: "0 0 4px", lineHeight: 1.7 }}>{formatInline(line)}</p>;
  });
}

function formatInline(text: string) {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ fontWeight: 600, color: "var(--v3-text)" }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} style={{ fontSize: "0.85em", padding: "2px 6px", borderRadius: 6, background: "var(--v3-bg-active)", color: "var(--v3-accent)", fontFamily: "var(--font-geist-mono), monospace" }}>{part.slice(1, -1)}</code>;
    return part;
  });
}

/* ── Mock AI responses ── */

const MOCK_RESPONSES: Record<string, string> = {
  revenue: "Based on the latest data, here's a summary:\n\n### Revenue Overview\n- **Total Revenue (YTD):** $2.4M across all regions\n- **Monthly Growth:** 12.5% month-over-month\n- **Top Region:** North America contributing 38% of total revenue\n\nThe trend shows strong upward momentum, particularly in the enterprise segment which grew **23%** compared to last quarter.\n\nWould you like me to break this down further by product line or customer segment?",
  customer: "Here's your customer analysis:\n\n### Customer Segments\n1. **Enterprise** — 120 accounts, $8,500 avg LTV\n2. **Mid-Market** — 340 accounts, $3,200 avg LTV\n3. **SMB** — 890 accounts, $800 avg LTV\n4. **Startup** — 450 accounts, $350 avg LTV\n\nRetention rates are strongest in Enterprise at **92%**, with SMB showing improvement this quarter at **78%** (up from 71%).\n\nThe data suggests focusing acquisition efforts on Mid-Market could yield the highest ROI.",
  default: "I've analyzed the data and here are the key insights:\n\n### Summary\n- Your data shows **positive trends** across most metrics\n- There are **3 areas** that may need attention\n- Overall performance is **above industry benchmarks**\n\nI can dive deeper into any specific area. Just ask about:\n- Revenue breakdown\n- Customer analytics\n- Product performance\n- Regional analysis\n\nWhat would you like to explore?",
};

function getAIResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("revenue") || q.includes("sales") || q.includes("money")) return MOCK_RESPONSES.revenue;
  if (q.includes("customer") || q.includes("user") || q.includes("segment") || q.includes("churn")) return MOCK_RESPONSES.customer;
  return MOCK_RESPONSES.default;
}

/* ── Mock canvas blocks for AI responses ── */

function getMockBlocks(query: string): CanvasBlock[] {
  const q = query.toLowerCase();
  const ts = Date.now();

  if (q.includes("revenue") || q.includes("sales") || q.includes("money")) {
    const tableRows = [
      { Month: "January", Revenue: "$198K", Growth: "+8%", Region: "All" },
      { Month: "February", Revenue: "$215K", Growth: "+12%", Region: "All" },
      { Month: "March", Revenue: "$242K", Growth: "+14%", Region: "All" },
      { Month: "April", Revenue: "$231K", Growth: "-5%", Region: "All" },
      { Month: "May", Revenue: "$268K", Growth: "+16%", Region: "All" },
      { Month: "June", Revenue: "$290K", Growth: "+8%", Region: "All" },
    ];
    return [
      {
        id: `block-chart-${ts}`,
        type: "chart",
        title: "Revenue by Region",
        status: "ready",
        data: {
          chartType: "bar",
          data: {
            labels: ["North America", "Europe", "Asia Pacific", "Latin America"],
            datasets: [{ name: "Revenue ($K)", data: [912, 634, 528, 326], color: "#6366F1" }],
          },
        },
      },
      {
        id: `block-table-${ts}`,
        type: "table",
        title: "Monthly Revenue Breakdown",
        status: "ready",
        data: {
          columns: Object.keys(tableRows[0]),
          rows: tableRows,
        },
      },
      {
        id: `block-code-${ts}`,
        type: "code",
        title: "SQL Query",
        status: "ready",
        content: "SELECT region, SUM(amount) as revenue,\n  COUNT(DISTINCT customer_id) as customers\nFROM transactions\nWHERE date >= '2024-01-01'\nGROUP BY region\nORDER BY revenue DESC;",
      },
    ];
  }

  if (q.includes("customer") || q.includes("user") || q.includes("segment") || q.includes("churn")) {
    const tableRows = [
      { Segment: "Enterprise", Accounts: "120", "Avg LTV": "$8,500", Retention: "92%", Growth: "+15%" },
      { Segment: "Mid-Market", Accounts: "340", "Avg LTV": "$3,200", Retention: "85%", Growth: "+22%" },
      { Segment: "SMB", Accounts: "890", "Avg LTV": "$800", Retention: "78%", Growth: "+10%" },
      { Segment: "Startup", Accounts: "450", "Avg LTV": "$350", Retention: "65%", Growth: "+34%" },
    ];
    return [
      {
        id: `block-chart-${ts}`,
        type: "chart",
        title: "Customer Segments",
        status: "ready",
        data: {
          chartType: "pie",
          data: {
            labels: ["Enterprise", "Mid-Market", "SMB", "Startup"],
            datasets: [{ name: "Accounts", data: [120, 340, 890, 450], colors: ["#6366F1", "#F472B6", "#34D399", "#FBBF24"] }],
          },
        },
      },
      {
        id: `block-table-${ts}`,
        type: "table",
        title: "Segment Analysis",
        status: "ready",
        data: {
          columns: Object.keys(tableRows[0]),
          rows: tableRows,
        },
      },
    ];
  }

  // Default: show a simple chart + text block
  return [
    {
      id: `block-chart-${ts}`,
      type: "chart",
      title: "Performance Overview",
      status: "ready",
      data: {
        chartType: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            { name: "This Year", data: [42, 48, 55, 52, 63, 71], color: "#6366F1" },
            { name: "Last Year", data: [35, 38, 42, 45, 48, 52], color: "#5C6070" },
          ],
        },
      },
    },
    {
      id: `block-text-${ts}`,
      type: "text",
      title: "Key Insights",
      status: "ready",
      content: "Performance is trending above last year across all months. The strongest growth was in May (+31%) and June (+37%). Consider investigating the drivers behind the Q2 acceleration.",
    },
  ];
}

/* ── Typing indicator ── */

function TypingIndicator() {
  return (
    <div className="v3-fade-in" style={{ display: "flex", alignItems: "center", gap: 6, padding: "16px 0" }}>
      <div
        style={{
          width: 28, height: 28, borderRadius: 10,
          background: "var(--v3-gradient)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <img src="/chat-logo.svg" alt="" style={{ width: 18, height: 18 }} />
      </div>
      <div style={{ display: "flex", gap: 4, padding: "8px 12px", borderRadius: 12, background: "var(--v3-bg-surface)" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--v3-accent)",
              animation: `v3-typing-pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Empty State ── */

function EmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const suggestions = [
    { label: "Revenue breakdown", desc: "by region this quarter", query: "Show me the revenue breakdown by region for this quarter" },
    { label: "Customer segments", desc: "distribution & LTV", query: "Analyze our customer segments and their lifetime value" },
    { label: "Product performance", desc: "top sellers & trends", query: "What are our top performing products this month?" },
    { label: "Growth metrics", desc: "MoM & YoY trends", query: "Show me our growth metrics month over month" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div className="v3-slide-up" style={{ textAlign: "center", maxWidth: 520 }}>
        {/* Logo */}
        <div
          style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 24px",
            background: "var(--v3-gradient)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--v3-shadow-glow)",
          }}
        >
          <img src="/chat-logo.svg" alt="CInsights" style={{ width: 36, height: 36 }} />
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--v3-text)", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
          What can I help you with?
        </h1>
        <p style={{ fontSize: 15, color: "var(--v3-text-muted)", margin: "0 0 36px", lineHeight: 1.6 }}>
          Ask anything about your data — I&#39;ll analyze and visualize it for you.
        </p>

        {/* Suggestions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 440, margin: "0 auto" }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(s.query)}
              className="v3-fade-up"
              style={{
                animationDelay: `${i * 0.06}s`,
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid var(--v3-border)",
                background: "var(--v3-bg-surface)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--v3-border-hover)";
                e.currentTarget.style.background = "var(--v3-bg-elevated)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--v3-border)";
                e.currentTarget.style.background = "var(--v3-bg-surface)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--v3-text)", margin: 0 }}>
                {s.label}
              </p>
              <p style={{ fontSize: 11, color: "var(--v3-text-muted)", margin: "3px 0 0" }}>
                {s.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Chat View ── */

interface V3ChatViewProps {
  chatId?: string;
}

export function V3ChatView({ chatId }: V3ChatViewProps) {
  const router = useRouter();
  const { isOpen: isCanvasOpen, blocks: canvasBlocks, setBlocks, openCanvas, toggleCanvas } = useCanvas();
  // openCanvas: used for auto-opening after AI response; toggleCanvas: used for the top-bar button
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSend = (text?: string) => {
    const message = text || input.trim();
    if (!message || isStreaming) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Simulate AI response with typing delay
    const response = getAIResponse(message);
    const queryText = message;
    setTimeout(() => {
      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(false);

      // Generate canvas blocks for the response
      const blocks = getMockBlocks(queryText);
      if (blocks.length) {
        setBlocks(blocks);
        openCanvas();
      }
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--v3-bg)" }}>
      {/* Top bar with canvas toggle — visible when there are messages */}
      {messages.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "8px 16px",
            borderBottom: "1px solid var(--v3-border)",
            flexShrink: 0,
          }}
        >
          {canvasBlocks.length > 0 && (
            <button
              onClick={toggleCanvas}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid var(--v3-border)",
                background: isCanvasOpen ? "var(--v3-accent-subtle)" : "var(--v3-bg-surface)",
                color: isCanvasOpen ? "var(--v3-accent)" : "var(--v3-text-secondary)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isCanvasOpen) {
                  e.currentTarget.style.borderColor = "var(--v3-border-hover)";
                  e.currentTarget.style.background = "var(--v3-bg-elevated)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isCanvasOpen) {
                  e.currentTarget.style.borderColor = "var(--v3-border)";
                  e.currentTarget.style.background = "var(--v3-bg-surface)";
                }
              }}
            >
              <IconCollection className="h-3.5 w-3.5" />
              Results
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "1px 5px",
                  borderRadius: 6,
                  background: isCanvasOpen ? "var(--v3-accent)" : "var(--v3-bg-active)",
                  color: isCanvasOpen ? "#fff" : "var(--v3-text-muted)",
                }}
              >
                {canvasBlocks.length}
              </span>
            </button>
          )}
        </div>
      )}

      {messages.length === 0 && !isStreaming ? (
        <EmptyState onSuggestionClick={handleSend} />
      ) : (
        /* Messages */
        <div className="v3-scroll" style={{ flex: 1, overflowY: "auto", padding: "24px 0" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="v3-fade-up"
                style={{ marginBottom: 24 }}
              >
                {msg.role === "user" ? (
                  /* User message */
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "12px 18px",
                        borderRadius: "20px 20px 4px 20px",
                        background: "var(--v3-accent)",
                        color: "#fff",
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  /* Assistant message */
                  <div style={{ display: "flex", gap: 12 }}>
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: 10, flexShrink: 0, marginTop: 2,
                        background: "var(--v3-gradient)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <img src="/chat-logo.svg" alt="" style={{ width: 18, height: 18 }} />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        padding: "14px 18px",
                        borderRadius: "4px 20px 20px 20px",
                        background: "var(--v3-bg-surface)",
                        border: "1px solid var(--v3-border)",
                        color: "var(--v3-text-secondary)",
                        fontSize: 14,
                        lineHeight: 1.7,
                      }}
                    >
                      {renderContent(msg.content)}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isStreaming && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input area */}
      <div style={{ padding: "0 24px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            className="v3-input-glow"
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 18,
              background: "var(--v3-bg-surface)",
              border: "1px solid var(--v3-border)",
              boxShadow: "var(--v3-shadow-sm)",
              transition: "all 0.2s",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your data..."
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: 14,
                lineHeight: 1.5,
                color: "var(--v3-text)",
                maxHeight: 160,
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              style={{
                width: 36, height: 36, borderRadius: 12, border: "none",
                background: input.trim() && !isStreaming ? "var(--v3-accent)" : "var(--v3-bg-elevated)",
                color: input.trim() && !isStreaming ? "#fff" : "var(--v3-text-muted)",
                cursor: input.trim() && !isStreaming ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              <IconArrowUp className="h-4 w-4" />
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: "var(--v3-text-dimmed)", marginTop: 8 }}>
            CInsights AI can analyze your data. Results are based on connected databases.
          </p>
        </div>
      </div>
    </div>
  );
}
