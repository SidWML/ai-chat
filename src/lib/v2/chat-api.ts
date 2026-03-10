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

export async function createThread(): Promise<{ thread_id: string }> {
  const res = await fetch(`${API_BASE}/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`Failed to create thread: ${res.status}`);
  return res.json();
}

export async function getThreadState(threadId: string) {
  const res = await fetch(`${API_BASE}/threads/${threadId}/state`);
  if (!res.ok) throw new Error(`Failed to get thread state: ${res.status}`);
  return res.json();
}

export async function* sendMessageStream(
  params: SendMessageParams
): AsyncGenerator<{ event: string; data: unknown }> {
  const msgs = Array.isArray(params.messages)
    ? params.messages
    : [params.messages];

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
}
