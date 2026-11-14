import type { ReactNode } from "react";

import { Link } from "react-router";

import { Card, CardContent, CardHeader } from "#ui/card";
import { cn } from "#lib/utils";
import { formatDate } from "#lib/format";

import type { DocumentSummary } from "../types/library.types";

import { CategoryBreadcrumb } from "./CategoryBreadcrumb";
import { DocumentTypeBadge } from "./DocumentBadges";
import { TagBadges } from "./TagBadges";

interface DocumentCardProps {
  document: DocumentSummary;
  /** Botões de ação (ex.: na Entrada), exibidos no rodapé do cartão. */
  actions?: ReactNode;
  /**
   * `list`: uma linha por documento (sem prévia); `card`: cartão com prévia
   * (padrão); `grid`: o mesmo cartão, para usar em colunas.
   */
  variant?: "list" | "card" | "grid";
}

function DocumentDate({ document }: { document: DocumentSummary }) {
  return (
    <span className="shrink-0 text-xs text-muted-foreground">
      {document.matchedIn === "content" && "Encontrado no conteúdo · "}
      {formatDate(document.createdAt)}
    </span>
  );
}

export function DocumentCard({
  document,
  actions,
  variant = "card",
}: DocumentCardProps) {
  const title = (
    <Link
      to={`/library/${document.id}`}
      className="min-w-0 truncate text-sm font-semibold hover:underline"
    >
      {document.title}
    </Link>
  );

  if (variant === "list") {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            {title}

            <DocumentTypeBadge type={document.type} />
          </div>

          <CategoryBreadcrumb category={document.category} />
        </div>

        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          <TagBadges tags={document.tags} />
        </div>

        <DocumentDate document={document} />

        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
    );
  }

  return (
    <Card className={cn(variant === "grid" && "h-full")}>
      <CardHeader className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {title}

          <DocumentTypeBadge type={document.type} />
        </div>

        <CategoryBreadcrumb category={document.category} />
      </CardHeader>

      <CardContent className="space-y-3">
        {document.preview && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {document.preview}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <TagBadges tags={document.tags} />

          <span className="ml-auto">
            <DocumentDate document={document} />
          </span>
        </div>

        {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
      </CardContent>
    </Card>
  );
}
