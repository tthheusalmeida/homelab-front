import { useState } from "react";

import { Link } from "react-router";
import { Inbox, Plus, RefreshCw, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "#ui/button";
import { Card, CardContent } from "#ui/card";

import { ConfirmDialog } from "#components/ConfirmDialog";
import { EmptyState } from "#components/EmptyState";
import { ErrorState } from "#components/ErrorState";
import { LoadingState } from "#components/LoadingState";

import { DocumentCard } from "./components/DocumentCard";
import { PublishDialog } from "./components/PublishDialog";
import {
  useDiscardDocument,
  useDocuments,
  useIndexStatus,
  useInbox,
  useReindex,
} from "./hooks/useLibrary";
import type { DocumentSummary } from "./types/library.types";

type View = "pending" | "archived";

export function InboxPage() {
  const [view, setView] = useState<View>("pending");
  const [publishTarget, setPublishTarget] = useState<DocumentSummary | null>(
    null,
  );
  const [discardTarget, setDiscardTarget] = useState<DocumentSummary | null>(
    null,
  );

  const pending = useInbox();
  const archived = useDocuments({ status: "archived" });
  const indexStatus = useIndexStatus();

  const discard = useDiscardDocument();
  const reindex = useReindex();

  const current = view === "pending" ? pending : archived;

  function handleDiscard() {
    if (!discardTarget) {
      return;
    }

    discard.mutate(discardTarget.id, {
      onSuccess: () => setDiscardTarget(null),
    });
  }

  const errors = indexStatus.data?.errors ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entrada</h1>

          <p className="text-sm text-muted-foreground">
            Resumos e transcrições gerados. Decida o que entra na biblioteca e o
            que é descartado.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={reindex.isPending}
          onClick={() => reindex.mutate()}
        >
          <RefreshCw
            className={reindex.isPending ? "animate-spin" : undefined}
          />
          Reindexar
        </Button>
      </div>

      {errors.length > 0 && (
        <Card role="alert">
          <CardContent className="space-y-1 py-4">
            <p className="text-sm font-medium text-destructive">
              {errors.length} arquivo(s) não puderam ser lidos
            </p>

            <ul className="space-y-0.5 text-xs text-muted-foreground">
              {errors.map((error) => (
                <li key={`${error.file}-${error.message}`}>
                  <span className="font-mono">{error.file}</span> —{" "}
                  {error.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={view === "pending" ? "secondary" : "outline"}
          aria-pressed={view === "pending"}
          onClick={() => setView("pending")}
        >
          Pendentes ({pending.data?.length ?? 0})
        </Button>

        <Button
          size="sm"
          variant={view === "archived" ? "secondary" : "outline"}
          aria-pressed={view === "archived"}
          onClick={() => setView("archived")}
        >
          Removidos ({archived.data?.length ?? 0})
        </Button>
      </div>

      {current.isLoading ? (
        <div className="flex min-h-[40dvh] items-center justify-center">
          <LoadingState message="Carregando" />
        </div>
      ) : current.isError || !current.data ? (
        <Card>
          <CardContent className="py-10 text-center">
            <ErrorState
              primaryMessage="Oops! houve uma falha ao carregar as páginas."
              secondaryMessage="Tente novamente mais tarde."
              action={() => void current.refetch()}
            />
          </CardContent>
        </Card>
      ) : current.data.length === 0 ? (
        view === "pending" ? (
          <EmptyState
            icon={Inbox}
            title="Nada aguardando decisão"
            description="Os resumos e transcrições dos jobs concluídos aparecem aqui."
            action={
              <Link
                to="/jobs/create"
                className={buttonVariants({ variant: "secondary" })}
              >
                <Plus /> Criar job
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={Trash2}
            title="Nenhuma página removida"
            description="Páginas removidas da biblioteca ficam aqui e podem ser readicionados."
          />
        )
      ) : (
        <div className="space-y-3">
          {current.data.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              actions={
                <>
                  <Button size="sm" onClick={() => setPublishTarget(document)}>
                    <Plus />
                    {view === "pending"
                      ? "Adicionar à biblioteca"
                      : "Readicionar"}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDiscardTarget(document)}
                  >
                    <Trash2 /> Descartar
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}

      <PublishDialog
        document={publishTarget}
        onOpenChange={(open) => {
          if (!open) {
            setPublishTarget(null);
          }
        }}
      />

      <ConfirmDialog
        open={discardTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDiscardTarget(null);
          }
        }}
        title="Descartar página?"
        description={`"${discardTarget?.title ?? ""}" será apagada definitivamente. Essa ação não pode ser desfeita.`}
        confirmLabel="Descartar"
        destructive
        isPending={discard.isPending}
        onConfirm={handleDiscard}
      />

      {discard.isError && (
        <p className="text-sm text-destructive">
          Não foi possível descartar. Tente novamente.
        </p>
      )}
    </div>
  );
}
