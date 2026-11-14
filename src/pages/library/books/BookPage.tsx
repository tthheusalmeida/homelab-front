import { useMemo, useState } from "react";

import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Info,
  ListOrdered,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "#ui/button";
import { Card, CardContent } from "#ui/card";

import { ConfirmDialog } from "#components/ConfirmDialog";
import { EmptyState } from "#components/EmptyState";
import { ErrorState } from "#components/ErrorState";
import { LoadingState } from "#components/LoadingState";
import { MarkdownMessage } from "#components/MarkdownMessage";
import { useDebouncedValue } from "#hooks/use-debounced-value";

import { BookCover } from "./components/BookCover";
import { BookDetailsDialog } from "./components/BookDetailsDialog";
import { BookFormDialog } from "./components/BookFormDialog";
import { BookOrganizerDialog } from "./components/BookOrganizerDialog";
import { BookSidebar } from "./components/BookSidebar";
import { useBook, useBookReading, useBookSearch, useDeleteBook } from "./hooks";
import { chapterElementId, hitTargetId } from "./reader";
import type { BookSearchHit } from "./types";

type Modal = "organize" | "edit" | "delete" | "details" | null;

/** Rola até o elemento e destaca por um instante. */
function goTo(elementId: string) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.scrollIntoView?.({ behavior: "smooth", block: "start" });
  element.classList.add("bg-primary/15", "rounded-md");
  window.setTimeout(
    () => element.classList.remove("bg-primary/15", "rounded-md"),
    1800,
  );
}

export function BookPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const reading = useBookReading(bookId);
  const detail = useBook(bookId);
  const remove = useDeleteBook();

  const [modal, setModal] = useState<Modal>(null);
  const [search, setSearch] = useState("");

  const query = useDebouncedValue(search);
  const results = useBookSearch(bookId, query);

  const contents = useMemo(() => {
    const map = new Map<string, string>();

    for (const module of reading.data?.modules ?? []) {
      for (const chapter of module.chapters) {
        map.set(chapter.documentId, chapter.content);
      }
    }

    return map;
  }, [reading.data]);

  if (reading.isLoading) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center">
        <LoadingState message="Carregando" />
      </div>
    );
  }

  if (reading.isError || !reading.data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <ErrorState
            primaryMessage="Oops! não foi possível abrir o livro."
            secondaryMessage="Ele pode ter sido removido ou o servidor está indisponível."
            actionLabel="Voltar aos livros"
            action={() => navigate("/library/books")}
          />
        </CardContent>
      </Card>
    );
  }

  const { book, modules } = reading.data;
  const totalChapters = modules.reduce(
    (sum, module) => sum + module.chapters.length,
    0,
  );
  // Capítulos na ordem de leitura (para o "Próximo" do fim de cada um).
  const chapterOrder = modules.flatMap((module) => module.chapters);
  let chapterNumber = 0;

  function handleHit(hit: BookSearchHit) {
    goTo(hitTargetId(hit, contents.get(hit.documentId) ?? ""));
  }

  function handleDelete() {
    remove.mutate(book.id, {
      onSuccess: () => navigate("/library/books"),
    });
  }

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/library/books")}
        >
          <ArrowLeft /> Livros
        </Button>
      </div>

      <header className="space-y-4 border-b pb-6 pt-4 text-center">
        <BookCover
          title={book.title}
          kind={book.kind}
          subtitle={book.subtitle}
          color={book.coverColor}
          imageUrl={book.coverImageUrl}
          className="mx-auto w-40"
        />

        <h1 className="text-3xl font-semibold tracking-tight">{book.title}</h1>

        {book.description && (
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            {book.description}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => setModal("details")}>
            <Info /> Detalhes
          </Button>

          <Button variant="outline" onClick={() => setModal("organize")}>
            <ListOrdered /> Organizar
          </Button>

          <Button variant="outline" onClick={() => setModal("edit")}>
            <Pencil /> Editar dados e capa
          </Button>

          <Button variant="destructive" onClick={() => setModal("delete")}>
            <Trash2 /> Excluir livro
          </Button>
        </div>
      </header>

      {totalChapters === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Este livro ainda não tem capítulos"
          description="Use Organizar para adicionar documentos da biblioteca e definir a ordem."
          action={
            <Button variant="secondary" onClick={() => setModal("organize")}>
              <ListOrdered /> Organizar
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="mx-auto w-full min-w-0 max-w-3xl space-y-16 px-4 sm:px-8">
            {modules.map((module) => (
              <section key={module.id} className="space-y-10">
                {module.title && (
                  <div className="rounded-xl bg-primary/10 px-6 py-5">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {module.title}
                    </h2>
                  </div>
                )}

                {module.chapters.map((chapter) => {
                  chapterNumber += 1;
                  const position = chapterNumber;
                  const next = chapterOrder[position];

                  return (
                    <section
                      key={chapter.documentId}
                      id={chapterElementId(chapter.documentId)}
                      aria-label={chapter.title}
                      className="scroll-mt-4 overflow-hidden rounded-xl border-2 bg-card shadow-sm"
                    >
                      <header className="flex flex-wrap items-center justify-between gap-2 border-b-2 bg-muted px-6 py-4">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                            Capítulo {position}
                          </p>

                          <p className="truncate text-lg font-semibold">
                            {chapter.title}
                          </p>
                        </div>

                        <Link
                          to={`/library/${chapter.documentId}`}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Abrir documento
                        </Link>
                      </header>

                      <div className="px-6 py-6 sm:px-10">
                        <MarkdownMessage
                          content={chapter.content}
                          headingIds
                          idPrefix={chapter.documentId}
                        />
                      </div>

                      <footer className="flex flex-wrap items-center justify-between gap-2 border-t-2 bg-muted px-6 py-3 text-xs text-muted-foreground">
                        <span>Fim do capítulo {position}</span>

                        {next && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() =>
                              goTo(chapterElementId(next.documentId))
                            }
                          >
                            Próximo: {next.title} <ArrowRight />
                          </Button>
                        )}
                      </footer>
                    </section>
                  );
                })}
              </section>
            ))}
          </div>

          <BookSidebar
            modules={modules}
            query={search}
            onQueryChange={setSearch}
            hits={results.data}
            isSearching={results.isFetching}
            onSelectChapter={(documentId) => goTo(chapterElementId(documentId))}
            onSelectHit={handleHit}
          />
        </div>
      )}

      {detail.data && (
        <BookOrganizerDialog
          open={modal === "organize"}
          onOpenChange={(open) => setModal(open ? "organize" : null)}
          book={detail.data}
        />
      )}

      <BookDetailsDialog
        open={modal === "details"}
        onOpenChange={(open) => setModal(open ? "details" : null)}
        reading={reading.data}
      />

      <BookFormDialog
        open={modal === "edit"}
        onOpenChange={(open) => setModal(open ? "edit" : null)}
        book={book}
      />

      <ConfirmDialog
        open={modal === "delete"}
        onOpenChange={(open) => setModal(open ? "delete" : null)}
        title="Excluir o livro?"
        description="Só o livro é excluído. Os documentos continuam na biblioteca."
        confirmLabel="Excluir"
        destructive
        isPending={remove.isPending}
        errorMessage={
          remove.isError
            ? "Não foi possível excluir o livro. Tente novamente."
            : undefined
        }
        onConfirm={handleDelete}
      />
    </article>
  );
}
