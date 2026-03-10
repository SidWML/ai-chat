import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function TextPart({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-a:font-medium prose-a:no-underline prose-code:before:content-none prose-code:after:content-none" style={{ color: "var(--ci-text-secondary)" }}>
      <Markdown remarkPlugins={[remarkGfm]} components={{
        pre: ({ children }) => <pre className="overflow-x-auto rounded-xl p-3 text-[12px] text-white" style={{ background: "var(--ci-navy)" }}>{children}</pre>,
        code: ({ children, className }) => className ? <code className={className}>{children}</code> : <code className="rounded px-1 py-0.5 text-[12px] font-medium" style={{ background: "var(--ci-accent-subtle)", color: "var(--ci-navy)" }}>{children}</code>,
        table: ({ children }) => <div className="my-2 overflow-x-auto rounded-xl" style={{ border: "1px solid var(--ci-border)" }}><table className="w-full text-[12px]">{children}</table></div>,
        th: ({ children }) => <th className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text-tertiary)", borderBottom: "1px solid var(--ci-border)" }}>{children}</th>,
        td: ({ children }) => <td className="whitespace-nowrap px-3 py-2" style={{ color: "var(--ci-text-secondary)", borderBottom: "1px solid var(--ci-border)" }}>{children}</td>,
      }}>{text}</Markdown>
    </div>
  );
}
