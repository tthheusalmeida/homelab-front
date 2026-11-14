import { useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  BookOpenText,
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
import { ReadingMode } from "#components/ReadingMode";
import { useActiveSection } from "#hooks/use-active-section";
import { useDebouncedValue } from "#hooks/use-debounced-value";

import { BookContent } from "./components/BookContent";
import { BookCover } from "./components/BookCover";
import { BookDetailsDialog } from "./components/BookDetailsDialog";
import { BookFormDialog } from "./components/BookFormDialog";
import { BookOrganizerDialog } from "./components/BookOrganizerDialog";
import { BookOutline } from "./components/BookOutline";
import { BookSidebar } from "./components/BookSidebar";
import { useBook, useBookReading, useBookSearch, useDeleteBook } from "./hooks";
import { chapterElementId, goToElement, hitTargetId } from "./reader";
import type { BookSearchHit } from "./types";

type Modal = "organize" | "edit" | "delete" | "details" | null;

export function BookPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const reading = useBookReading(bookId);
  const detail = useBook(bookId);
  const remove = useDeleteBook();

  const [modal, setModal] = useState<Modal>(null);
  const [search, setSearch] = useState("");
  const [reader, setReader] = useState(false);

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

  // Capítulo em leitura agora (destacado no sumário).
  const chapterIds = useMemo(
    () =>
      (reading.data?.modules ?? []).flatMap((module) =>
        module.chapters.map((chapter) => chapterElementId(chapter.documentId)),
      ),
    [reading.data],
  );
  const activeChapterId = useActiveSection(chapterIds)?.replace(
    /^chapter-/,
    "",
  );

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

  if (reader && totalChapters > 0) {
    return (
      <ReadingMode
        title={book.title}
        onExit={() => setReader(false)}
        toc={
          <BookOutline
            modules={modules}
            activeChapterId={activeChapterId}
            className="max-h-[70dvh]"
            onSelectChapter={(documentId) =>
              goToElement(chapterElementId(documentId))
            }
          />
        }
      >
        <div className="mx-auto w-full max-w-3xl">
          <BookContent
            reading
            modules={modules}
            onGoToChapter={(documentId) =>
              goToElement(chapterElementId(documentId))
            }
          />
        </div>
      </ReadingMode>
    );
  }

  function handleHit(hit: BookSearchHit) {
    goToElement(hitTargetId(hit, contents.get(hit.documentId) ?? ""));
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
          {totalChapters > 0 && (
            <Button variant="default" onClick={() => setReader(true)}>
              <BookOpenText /> Modo leitura
            </Button>
          )}

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
          description="Use Organizar para adicionar páginas da biblioteca e definir a ordem."
          action={
            <Button variant="secondary" onClick={() => setModal("organize")}>
              <ListOrdered /> Organizar
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="mx-auto w-full min-w-0 max-w-3xl px-4 sm:px-8">
            <BookContent
              modules={modules}
              onGoToChapter={(documentId) =>
                goToElement(chapterElementId(documentId))
              }
            />
          </div>

          <BookSidebar
            modules={modules}
            activeChapterId={activeChapterId}
            query={search}
            onQueryChange={setSearch}
            hits={results.data}
            isSearching={results.isFetching}
            onSelectChapter={(documentId) =>
              goToElement(chapterElementId(documentId))
            }
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
        description="Só o livro é excluído. As páginas continuam na biblioteca."
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
