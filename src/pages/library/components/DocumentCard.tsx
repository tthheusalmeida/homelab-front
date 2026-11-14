import type { ReactNode } from "react";

import { Link } from "react-router";

import { Badge } from "#ui/badge";
import { Card, CardContent, CardHeader } from "#ui/card";
import { formatDate } from "#lib/format";

import type { DocumentSummary } from "../types/library.types";

import { CategoryBreadcrumb } from "./CategoryBreadcrumb";
import { DocumentTypeBadge } from "./DocumentBadges";

interface DocumentCardProps {
  document: DocumentSummary;
  /** Botões de ação (ex.: na Entrada), exibidos no rodapé do cartão. */
  actions?: ReactNode;
}

export function DocumentCard({ document, actions }: DocumentCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/library/${document.id}`}
            className="min-w-0 truncate text-sm font-semibold hover:underline"
          >
            {document.title}
          </Link>

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
          {document.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}

          <span className="ml-auto text-xs text-muted-foreground">
            {document.matchedIn === "content" && "Encontrado no conteúdo · "}
            {formatDate(document.createdAt)}
          </span>
        </div>

        {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
      </CardContent>
    </Card>
  );
}
