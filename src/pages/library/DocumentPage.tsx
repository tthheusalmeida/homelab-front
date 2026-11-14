import { useState } from "react";

import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";

import { Badge } from "#ui/badge";
import { Button } from "#ui/button";
import { Card, CardContent } from "#ui/card";
import { Separator } from "#ui/separator";

import { ConfirmDialog } from "#components/ConfirmDialog";
import { ErrorState } from "#components/ErrorState";
import { LoadingState } from "#components/LoadingState";
import { MarkdownMessage } from "#components/MarkdownMessage";
import { formatDateTime } from "#lib/format";

import { CategoryBreadcrumb } from "./components/CategoryBreadcrumb";
import {
  DocumentStatusBadge,
  DocumentTypeBadge,
} from "./components/DocumentBadges";
import { useArchiveDocument, useDocument } from "./hooks/useLibrary";
import { documentSourceLabels } from "./types/library.types";

export function DocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading, isError } = useDocument(id);
  const archive = useArchiveDocument();

  if (isLoading) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center">
        <LoadingState message="Carregando" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <ErrorState
            primaryMessage="Oops! não foi possível abrir o documento."
            secondaryMessage="Ele pode ter sido removido ou o servidor está indisponível."
            actionLabel="Voltar à biblioteca"
            action={() => navigate("/library")}
          />
        </CardContent>
      </Card>
    );
  }

  const { meta, content } = data;

  function handleArchive() {
    archive.mutate(meta.id, {
      onSuccess: () => navigate("/library"),
    });
  }

  return (
    <article className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft /> Voltar
      </Button>

      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>

        <CategoryBreadcrumb category={meta.category} />

        <div className="flex flex-wrap items-center gap-2">
          <DocumentTypeBadge type={meta.type} />
          <DocumentStatusBadge status={meta.status} />

          {meta.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {documentSourceLabels[meta.source]} · Criado em{" "}
          {formatDateTime(meta.createdAt)} · Atualizado em{" "}
          {formatDateTime(meta.updatedAt)}
        </p>

        {meta.sourceUrl && (
          <a
            href={meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="size-3" /> Fonte original
          </a>
        )}
      </header>

      <Separator />

      <MarkdownMessage content={content} />

      {meta.status === "published" && (
        <>
          <Separator />

          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 /> Remover da biblioteca
          </Button>

          {archive.isError && (
            <p className="text-sm text-destructive">
              Não foi possível remover. Tente novamente.
            </p>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remover da biblioteca?"
        description="O documento deixa de aparecer na biblioteca, mas o arquivo é mantido e pode ser readicionado pela Entrada."
        confirmLabel="Remover"
        destructive
        isPending={archive.isPending}
        onConfirm={handleArchive}
      />
    </article>
  );
}
