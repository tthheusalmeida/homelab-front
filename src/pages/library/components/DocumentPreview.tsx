import { Folder } from "lucide-react";

import { Badge } from "#ui/badge";
import { Card, CardContent, CardHeader } from "#ui/card";

import { CategoryBreadcrumb } from "./CategoryBreadcrumb";

interface DocumentPreviewProps {
  title: string;
  category: string[];
  tags: string[];
  /** Trecho do conteúdo, quando houver (ex.: início do artigo). */
  excerpt?: string;
}

/** Mostra como o documento vai aparecer no Acervo e onde será guardado. */
export function DocumentPreview({
  title,
  category,
  tags,
  excerpt,
}: DocumentPreviewProps) {
  return (
    <section aria-label="Como vai ficar na biblioteca" className="space-y-2">
      <p className="text-sm font-medium">Como vai ficar na biblioteca</p>

      <Card className="border-dashed">
        <CardHeader className="space-y-1.5">
          <span className="text-sm font-semibold">
            {title.trim() || "Sem título ainda"}
          </span>

          <CategoryBreadcrumb category={category} label="Categoria na prévia" />
        </CardHeader>

        <CardContent className="space-y-3">
          {excerpt?.trim() && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {excerpt.trim()}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Sem tags</span>
            )}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Folder className="size-3.5" />
            Pasta:{" "}
            <code>
              {["biblioteca", ...category.filter((name) => name.trim())].join(
                " / ",
              )}
            </code>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
