import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TextPartProps {
  text: string;
}

export function TextPart({ text }: TextPartProps) {
  return (
    <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:text-zinc-100 dark:prose-pre:bg-zinc-800 prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-zinc-800 dark:prose-code:bg-zinc-800 dark:prose-code:text-zinc-200">
      <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
    </div>
  );
}
