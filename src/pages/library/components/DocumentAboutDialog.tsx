import type { ReactNode } from "react";

import { BookPlus, ExternalLink, Pencil, Trash2 } from "lucide-react";

import { Badge } from "#ui/badge";
import { Button } from "#ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#ui/dialog";
import { formatDateTime } from "#lib/format";

import {
  documentSourceLabels,
  type DocumentMeta,
} from "../types/library.types";

import { DocumentStatusBadge } from "./DocumentBadges";

interface DocumentAboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: DocumentMeta;
  /** Sem esta função o botão Editar não aparece (documento não publicado). */
  onEdit?: () => void;
  /** Sem esta função o botão Remover não aparece (documento não publicado). */
  onRemove?: () => void;
  /** Sem esta função o botão "Adicionar a um livro" não aparece. */
  onAddToBook?: () => void;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>

      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/**
 * Janela "Sobre a página": informações separadas por rótulo e, em documento
 * publicado, as ações Editar e Remover (cada uma abre a sua própria janela).
 */
export function DocumentAboutDialog({
  open,
  onOpenChange,
  meta,
  onEdit,
  onRemove,
  onAddToBook,
}: DocumentAboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sobre a página</DialogTitle>
        </DialogHeader>

        <dl className="space-y-4">
          <Row label="Situação">
            <DocumentStatusBadge status={meta.status} />
          </Row>

          <Row label="Origem">{documentSourceLabels[meta.source]}</Row>

          <Row label="Tags">
            {meta.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {meta.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">Sem tags</span>
            )}
          </Row>

          <Row label="Criado em">{formatDateTime(meta.createdAt)}</Row>

          <Row label="Atualizado em">{formatDateTime(meta.updatedAt)}</Row>

          {meta.sourceUrl && (
            <Row label="Fonte">
              <a
                href={meta.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="size-3.5" /> Fonte original
              </a>
            </Row>
          )}
        </dl>

        {(onEdit || onRemove || onAddToBook) && (
          <DialogFooter className="sm:flex-wrap">
            {onAddToBook && (
              <Button variant="outline" onClick={onAddToBook}>
                <BookPlus /> Adicionar a um livro
              </Button>
            )}

            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Pencil /> Editar
              </Button>
            )}

            {onRemove && (
              <Button variant="destructive" onClick={onRemove}>
                <Trash2 /> Remover da biblioteca
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
