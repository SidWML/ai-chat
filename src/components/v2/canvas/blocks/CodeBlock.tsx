"use client";

import { useState, useCallback } from "react";
import type { CanvasBlock } from "@/lib/canvas-types";
import { IconCopy, IconCheck } from "@/components/v2/ui/Icons";

function detectLanguage(block: CanvasBlock): string {
  if (block.data && typeof block.data === "object" && "language" in (block.data as Record<string, unknown>)) {
    return String((block.data as Record<string, unknown>).language);
  }
  const content = block.content ?? "";
  if (/^\s*SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP/im.test(content)) return "SQL";
  if (/^\s*(def |import |from |class )/m.test(content)) return "Python";
  if (/^\s*(function |const |let |var |import |export )/m.test(content)) return "JavaScript";
  if (/^\s*(interface |type |export (type|interface))/m.test(content)) return "TypeScript";
  return "Code";
}

function tokenize(line: string): Array<{ text: string; color: string }> {
  const tokens: Array<{ text: string; color: string }> = [];
  const keywords =
    /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|ON|AND|OR|NOT|IN|AS|ORDER|BY|GROUP|HAVING|LIMIT|INSERT|UPDATE|DELETE|CREATE|TABLE|INDEX|ALTER|DROP|SET|VALUES|INTO|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|UNION|ALL|EXISTS|BETWEEN|LIKE|IS|NULL|TRUE|FALSE|def|return|import|from|class|if|else|elif|for|while|try|except|finally|with|yield|lambda|pass|break|continue|function|const|let|var|export|default|interface|type|async|await|new|this|throw|catch|typeof|instanceof)\b/gi;
  const strings = /('[^']*'|"[^"]*"|`[^`]*`)/g;
  const numbers = /\b(\d+\.?\d*)\b/g;
  const comments = /(--.*$|\/\/.*$|#.*$)/gm;

  let remaining = line;
  let pos = 0;

  // Simple approach: just color the whole line with basic heuristics
  const parts: Array<{ start: number; end: number; color: string }> = [];

  let m: RegExpExecArray | null;

  // Find comments
  comments.lastIndex = 0;
  while ((m = comments.exec(line)) !== null) {
    parts.push({ start: m.index, end: m.index + m[0].length, color: "#8A8880" });
  }

  // Find strings
  strings.lastIndex = 0;
  while ((m = strings.exec(line)) !== null) {
    parts.push({ start: m.index, end: m.index + m[0].length, color: "#16A34A" });
  }

  // Find keywords
  keywords.lastIndex = 0;
  while ((m = keywords.exec(line)) !== null) {
    parts.push({ start: m.index, end: m.index + m[0].length, color: "#CF384D" });
  }

  // Find numbers
  numbers.lastIndex = 0;
  while ((m = numbers.exec(line)) !== null) {
    parts.push({ start: m.index, end: m.index + m[0].length, color: "#D97706" });
  }

  // Sort by priority and position
  parts.sort((a, b) => a.start - b.start);

  // Build tokens, resolving overlaps by first-come-first-served
  let cursor = 0;
  for (const part of parts) {
    if (part.start < cursor) continue;
    if (part.start > cursor) {
      tokens.push({ text: line.slice(cursor, part.start), color: "#E8E5E1" });
    }
    tokens.push({ text: line.slice(part.start, part.end), color: part.color });
    cursor = part.end;
  }
  if (cursor < line.length) {
    tokens.push({ text: line.slice(cursor), color: "#E8E5E1" });
  }
  if (tokens.length === 0) {
    tokens.push({ text: remaining, color: "#E8E5E1" });
  }

  return tokens;
}

export function CodeBlock({ block }: { block: CanvasBlock }) {
  const [copied, setCopied] = useState(false);
  const code = block.content ?? "";
  const language = detectLanguage(block);
  const lines = code.split("\n");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="relative overflow-hidden rounded-b-xl">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: "var(--ci-navy-dark)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-1 text-[11px] transition-colors"
          style={{
            color: "rgba(255,255,255,0.6)",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {copied ? (
            <>
              <IconCheck className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <IconCopy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div
        className="overflow-x-auto p-4"
        style={{
          background: "var(--ci-navy)",
          fontFamily: "var(--font-geist-mono), monospace",
        }}
      >
        <table className="border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="leading-5">
                <td
                  className="select-none pr-4 text-right text-[12px] align-top"
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    minWidth: "2.5rem",
                    userSelect: "none",
                  }}
                >
                  {i + 1}
                </td>
                <td className="text-[12px] whitespace-pre">
                  {tokenize(line).map((token, j) => (
                    <span key={j} style={{ color: token.color }}>
                      {token.text}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
