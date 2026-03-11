const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface LangChainMessage {
  role: "human" | "assistant" | "system";
  content: string;
}

export interface SendMessageParams {
  threadId: string;
  messages: LangChainMessage | LangChainMessage[];
  connectionId?: string | null;
}

/* ── Demo / mock responses when no backend is running ── */

const DEMO_RESPONSES: Record<string, { text: string; blocks?: any[] }> = {
  revenue: {
    text: "Here's a breakdown of your revenue over the last 6 months. The data shows a strong upward trend with Q4 performing particularly well across all regions.",
    blocks: [
      {
        id: "chart-revenue",
        type: "chart",
        title: "Monthly Revenue Trend",
        chartType: "bar",
        data: {
          labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
          datasets: [{ name: "Revenue ($K)", data: [420, 485, 612, 538, 590, 680], color: "#6366F1" }],
        },
      },
      {
        id: "table-revenue",
        type: "table",
        title: "Revenue by Region",
        columns: ["Region", "Revenue", "Growth", "Orders"],
        rows: [
          { Region: "North America", Revenue: "$912K", Growth: "+12.4%", Orders: "3,241" },
          { Region: "Europe", Revenue: "$634K", Growth: "+8.7%", Orders: "2,187" },
          { Region: "Asia Pacific", Revenue: "$528K", Growth: "+22.1%", Orders: "1,893" },
          { Region: "Latin America", Revenue: "$326K", Growth: "+15.3%", Orders: "1,102" },
        ],
      },
    ],
  },
  product: {
    text: "Here are your top-selling products ranked by total revenue. Electronics and premium items continue to dominate.",
    blocks: [
      {
        id: "table-products",
        type: "table",
        title: "Top Products by Revenue",
        columns: ["Product", "Category", "Units Sold", "Revenue", "Margin"],
        rows: [
          { Product: "Pro Laptop 16\"", Category: "Electronics", "Units Sold": "2,341", Revenue: "$2.8M", Margin: "24%" },
          { Product: "Wireless Earbuds", Category: "Electronics", "Units Sold": "8,712", Revenue: "$1.3M", Margin: "42%" },
          { Product: "Smart Watch Ultra", Category: "Wearables", "Units Sold": "3,456", Revenue: "$1.0M", Margin: "35%" },
          { Product: "Standing Desk", Category: "Furniture", "Units Sold": "1,203", Revenue: "$720K", Margin: "28%" },
          { Product: "Ergonomic Chair", Category: "Furniture", "Units Sold": "987", Revenue: "$494K", Margin: "31%" },
        ],
      },
    ],
  },
  customer: {
    text: "Here's an overview of your customer segments. High-value enterprise customers make up only 12% of the base but contribute 45% of revenue.",
    blocks: [
      {
        id: "chart-customers",
        type: "chart",
        title: "Revenue by Customer Segment",
        chartType: "bar",
        data: {
          labels: ["Enterprise", "Mid-Market", "SMB", "Individual"],
          datasets: [{ name: "Revenue ($K)", data: [1350, 820, 540, 290], color: "#6366F1" }],
        },
      },
      {
        id: "table-customers",
        type: "table",
        title: "Top Customers",
        columns: ["Customer", "Segment", "Lifetime Value", "Orders", "Last Order"],
        rows: [
          { Customer: "Acme Corp", Segment: "Enterprise", "Lifetime Value": "$284K", Orders: "47", "Last Order": "2 days ago" },
          { Customer: "TechStart Inc", Segment: "Mid-Market", "Lifetime Value": "$156K", Orders: "32", "Last Order": "1 week ago" },
          { Customer: "Global Retail", Segment: "Enterprise", "Lifetime Value": "$142K", Orders: "28", "Last Order": "3 days ago" },
          { Customer: "DataFlow Ltd", Segment: "Mid-Market", "Lifetime Value": "$98K", Orders: "19", "Last Order": "5 days ago" },
        ],
      },
    ],
  },
  default: {
    text: "Based on your query, here are the results from the database. The analysis covers the most recent data available.",
    blocks: [
      {
        id: "table-default",
        type: "table",
        title: "Query Results",
        columns: ["Metric", "Current", "Previous", "Change"],
        rows: [
          { Metric: "Total Revenue", Current: "$3.2M", Previous: "$2.8M", Change: "+14.2%" },
          { Metric: "Active Users", Current: "24,531", Previous: "21,890", Change: "+12.1%" },
          { Metric: "Conversion Rate", Current: "3.8%", Previous: "3.2%", Change: "+18.7%" },
          { Metric: "Avg Order Value", Current: "$127", Previous: "$118", Change: "+7.6%" },
          { Metric: "Customer Satisfaction", Current: "4.6/5", Previous: "4.4/5", Change: "+4.5%" },
        ],
      },
    ],
  },
};

function getDemoResponse(query: string) {
  const q = query.toLowerCase();
  if (q.includes("revenue") || q.includes("sales") || q.includes("money")) return DEMO_RESPONSES.revenue;
  if (q.includes("product") || q.includes("selling") || q.includes("item")) return DEMO_RESPONSES.product;
  if (q.includes("customer") || q.includes("user") || q.includes("segment")) return DEMO_RESPONSES.customer;
  return DEMO_RESPONSES.default;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ── API functions with demo fallback ── */

export async function createThread(): Promise<{ thread_id: string }> {
  try {
    const res = await fetch(`${API_BASE}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error(`Failed to create thread: ${res.status}`);
    return res.json();
  } catch {
    // Demo mode — generate a fake thread ID
    return { thread_id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  }
}

export async function getThreadState(threadId: string) {
  try {
    const res = await fetch(`${API_BASE}/threads/${threadId}/state`);
    if (!res.ok) throw new Error(`Failed to get thread state: ${res.status}`);
    return res.json();
  } catch {
    // Demo mode — return empty state
    return { values: { messages: [] } };
  }
}

export async function* sendMessageStream(
  params: SendMessageParams
): AsyncGenerator<{ event: string; data: unknown }> {
  const msgs = Array.isArray(params.messages)
    ? params.messages
    : [params.messages];

  // Try real API first
  try {
    const body = {
      assistant_id: "canvas_agent",
      input: {
        messages: msgs,
        ...(params.connectionId ? { connection_id: params.connectionId } : {}),
      },
      stream_mode: ["messages"],
      on_disconnect: "cancel",
    };

    const res = await fetch(
      `${API_BASE}/threads/${params.threadId}/runs/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) throw new Error(`Stream failed: ${res.status}`);
    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      let currentEvent = "message";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          const dataStr = line.slice(6);
          try {
            const data = JSON.parse(dataStr);
            yield { event: currentEvent, data };
          } catch {
            yield { event: currentEvent, data: dataStr };
          }
        }
      }
    }
    return;
  } catch {
    // Fall through to demo mode
  }

  // Demo mode — simulate streaming response
  const query = msgs.map((m) => m.content).join(" ");
  const demo = getDemoResponse(query);
  const words = demo.text.split(" ");

  // Stream text word by word
  let accumulated = "";
  for (let i = 0; i < words.length; i++) {
    accumulated += (i > 0 ? " " : "") + words[i];
    yield {
      event: "updates",
      data: {
        ops: [{ path: "/streamed_output_str/-", value: (i > 0 ? " " : "") + words[i] }],
      },
    };
    await delay(30 + Math.random() * 40);
  }

  // After text is done, yield canvas blocks if available
  if (demo.blocks?.length) {
    yield {
      event: "updates",
      data: {
        ops: [{ path: "/canvas", value: { blocks: demo.blocks } }],
      },
    };
  }
}
