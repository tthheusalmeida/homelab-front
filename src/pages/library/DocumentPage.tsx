import { useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "#ui/button";
import { Card, CardContent } from "#ui/card";

import { ConfirmDialog } from "#components/ConfirmDialog";
import { ErrorState } from "#components/ErrorState";
import { LoadingState } from "#components/LoadingState";
import { MarkdownMessage } from "#components/MarkdownMessage";
import { extractHeadings } from "#lib/markdown";

import { CategoryBreadcrumb } from "./components/CategoryBreadcrumb";
import { DocumentTypeBadge } from "./components/DocumentBadges";
import { DocumentAboutDialog } from "./components/DocumentAboutDialog";
import { DocumentSidebar } from "./components/DocumentSidebar";
import { EditDocumentDialog } from "./components/EditDocumentDialog";
import { useArchiveDocument, useDocument } from "./hooks/useLibrary";

type Modal = "about" | "edit" | "remove" | null;

export function DocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Uma janela por vez: Editar e Remover fecham a "Sobre" e devolvem para ela.
  const [modal, setModal] = useState<Modal>(null);

  const { data, isLoading, isError } = useDocument(id);
  const archive = useArchiveDocument();

  const headings = useMemo(
    () => extractHeadings(data?.content ?? ""),
    [data?.content],
  );

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

  const published = meta.status === "published";

  function handleArchive() {
    archive.mutate(meta.id, {
      onSuccess: () =>
        navigate("/library", { state: { category: meta.category } }),
    });
  }

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft /> Voltar
        </Button>

        <CategoryBreadcrumb category={meta.category} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0 space-y-6">
          <header className="space-y-4 border-b pb-6 pt-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              {meta.title}
            </h1>

            <div className="flex justify-center">
              <DocumentTypeBadge type={meta.type} />
            </div>
          </header>

          <div className="mx-auto w-full max-w-3xl px-4 sm:px-8">
            <MarkdownMessage content={content} headingIds />
          </div>
        </div>

        <DocumentSidebar
          headings={headings}
          onOpenAbout={() => setModal("about")}
        />
      </div>

      <DocumentAboutDialog
        open={modal === "about"}
        onOpenChange={(open) => setModal(open ? "about" : null)}
        meta={meta}
        onEdit={published ? () => setModal("edit") : undefined}
        onRemove={published ? () => setModal("remove") : undefined}
      />

      <EditDocumentDialog
        open={modal === "edit"}
        onOpenChange={(open) => setModal(open ? "edit" : "about")}
        document={data}
      />

      <ConfirmDialog
        open={modal === "remove"}
        onOpenChange={(open) => setModal(open ? "remove" : "about")}
        title="Remover da biblioteca?"
        description="O documento deixa de aparecer na biblioteca, mas o arquivo é mantido e pode ser readicionado pela Entrada."
        confirmLabel="Remover"
        destructive
        isPending={archive.isPending}
        errorMessage={
          archive.isError
            ? "Não foi possível remover. Tente novamente."
            : undefined
        }
        onConfirm={handleArchive}
      />
    </article>
  );
}
