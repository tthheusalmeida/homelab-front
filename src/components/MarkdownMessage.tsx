import { Children, isValidElement, useMemo, type ReactNode } from "react";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { headingIdsByLine, slugifyHeading } from "#lib/markdown";
import { cn } from "#lib/utils";

interface MarkdownMessageProps {
  content: string;
  /** Dá um `id` a cada título, para âncoras e índice (ex.: página do documento). */
  headingIds?: boolean;
  /**
   * Prefixo dos ids (`<prefixo>-<id>`), para vários textos na mesma página sem
   * repetir id (ex.: capítulos de um livro). Só vale com `headingIds`.
   */
  idPrefix?: string;
  /** Tamanho do texto: `sm` (padrão, chat) ou `base` (leitura em página). */
  size?: "sm" | "base";
  /** Classes extras no texto (ex.: tipografia de página). */
  className?: string;
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

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }

  return Children.toArray(node).map(textOf).join("");
}

type HeadingProps = {
  node?: { position?: { start: { line: number } } };
  children?: ReactNode;
};

/** Títulos com id, vindo do mapa linha → id calculado como o do sumário. */
function withHeadingIds(ids: Map<number, string>, prefix?: string): Components {
  const heading =
    (Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") =>
    ({ node, children, ...props }: HeadingProps) => (
      <Tag
        {...props}
        id={`${prefix ? `${prefix}-` : ""}${
          ids.get(node?.position?.start.line ?? -1) ??
          slugifyHeading(textOf(children))
        }`}
      >
        {children}
      </Tag>
    );

  return {
    ...components,
    h1: heading("h1"),
    h2: heading("h2"),
    h3: heading("h3"),
    h4: heading("h4"),
    h5: heading("h5"),
    h6: heading("h6"),
  };
}

export function MarkdownMessage({
  content,
  headingIds,
  idPrefix,
  size = "sm",
  className,
}: MarkdownMessageProps) {
  const mapping = useMemo(
    () =>
      headingIds
        ? withHeadingIds(headingIdsByLine(content), idPrefix)
        : components,
    [content, headingIds, idPrefix],
  );

  return (
    <div
      className={cn(
        "prose max-w-none dark:prose-invert",
        size === "base" ? "prose-base" : "prose-sm",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mapping}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
