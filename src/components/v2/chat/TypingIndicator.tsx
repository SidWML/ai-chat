export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 v2-fade-up">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, var(--ci-coral), var(--ci-coral-light))" }}>
        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
      </div>
      <div className="rounded-2xl rounded-tl-lg px-4 py-3" style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)", boxShadow: "var(--ci-shadow-sm)" }}>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => <span key={i} className="h-2 w-2 rounded-full" style={{ background: "var(--ci-coral)", animation: `v2-typing-dot 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
        </div>
      </div>
    </div>
  );
}
