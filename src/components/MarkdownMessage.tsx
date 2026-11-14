import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
}

// Links abrem em nova aba sem vazar o referrer; imagens (por URL) nunca
// passam da largura do texto. HTML cru não é renderizado (segurança).
const components: Components = {
  a: ({ node: _node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
  img: ({ node: _node, alt, ...props }) => (
    <img
      {...props}
      alt={alt ?? ""}
      loading="lazy"
      referrerPolicy="no-referrer"
      className="h-auto max-w-full rounded-md"
    />
  ),
};

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
