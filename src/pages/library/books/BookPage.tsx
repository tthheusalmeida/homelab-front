import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  BookOpenText,
  Download,
  Info,
  ListOrdered,
  MoreHorizontal,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "#ui/button";
import { Card, CardContent } from "#ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#ui/dropdown-menu";
import { extractHeadings } from "#lib/markdown";

import { BackToTopButton } from "#components/BackToTopButton";
import { ConfirmDialog } from "#components/ConfirmDialog";
import { EmptyState } from "#components/EmptyState";
import { ErrorState } from "#components/ErrorState";
import { LoadingState } from "#components/LoadingState";
import { ReadingMode } from "#components/ReadingMode";
import { useActiveSection } from "#hooks/use-active-section";
import { useDebouncedValue } from "#hooks/use-debounced-value";
import { useTextHighlight } from "#hooks/use-text-highlight";

import { BookCompletedDialog } from "./components/BookCompletedDialog";
import { BookContent } from "./components/BookContent";
import { BookCover } from "./components/BookCover";
import { BookDetailsDialog } from "./components/BookDetailsDialog";
import { BookFindBar } from "./components/BookFindBar";
import { BookFormDialog } from "./components/BookFormDialog";
import { BookOrganizerDialog } from "./components/BookOrganizerDialog";
import { BookOutline } from "./components/BookOutline";
import { BookPrintView } from "./components/BookPrintView";
import { BookProgressCard } from "./components/BookProgressCard";
import { BookSidebar } from "./components/BookSidebar";
import {
  useBook,
  useBookReading,
  useBookSearch,
  useDeleteBook,
  useResetBookProgress,
  useSaveBookPosition,
  useSetChapterRead,
} from "./hooks";
import {
  chapterElementId,
  goToElement,
  headingElementId,
  hitTargetId,
} from "./reader";
import { bookStats } from "./stats";
import type { BookSearchHit } from "./types";

type Modal = "organize" | "edit" | "delete" | "details" | "reset" | null;

/** Tempo parado num ponto antes de guardá-lo como "onde parei". */
const SAVE_POSITION_DELAY_MS = 1500;

export function BookPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const reading = useBookReading(bookId);
  const detail = useBook(bookId);
  const remove = useDeleteBook();
  const setRead = useSetChapterRead();
  const resetProgress = useResetBookProgress();
  const { mutate: persistPosition } = useSaveBookPosition();

  const [modal, setModal] = useState<Modal>(null);
  const [search, setSearch] = useState("");
  const [reader, setReader] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const findInput = useRef<HTMLInputElement>(null);
  const userScrolled = useRef(false);
  const lastSaved = useRef<string | undefined>(undefined);
  const seededPosition = useRef(false);
  const continued = useRef(false);

  const query = useDebouncedValue(search);
  const results = useBookSearch(bookId, query);
  const find = useTextHighlight(container, query, reading.data);

  const contents = useMemo(() => {
    const map = new Map<string, string>();

    for (const module of reading.data?.modules ?? []) {
      for (const chapter of module.chapters) {
        map.set(chapter.documentId, chapter.content);
      }
    }

    return map;
  }, [reading.data]);

  // Todos os pontos que identificam "onde estou": cada capítulo e seus títulos,
  // na ordem do livro; `owner` diz a que capítulo cada um pertence.
  const { positionIds, owner } = useMemo(() => {
    const ids: string[] = [];
    const owners = new Map<string, string>();

    for (const module of reading.data?.modules ?? []) {
      for (const chapter of module.chapters) {
        const chapterId = chapterElementId(chapter.documentId);

        ids.push(chapterId);
        owners.set(chapterId, chapter.documentId);

        for (const heading of extractHeadings(chapter.content)) {
          const id = headingElementId(chapter.documentId, heading.id);

          ids.push(id);
          owners.set(id, chapter.documentId);
        }
      }
    }

    return { positionIds: ids, owner: owners };
  }, [reading.data]);

  const activeElementId = useActiveSection(positionIds);
  const activeChapterId = activeElementId
    ? owner.get(activeElementId)
    : undefined;

  const continueReading = useCallback(() => {
    const position = reading.data?.book.lastPosition;

    if (!position) {
      return;
    }

    goToElement(
      document.getElementById(position.elementId)
        ? position.elementId
        : chapterElementId(position.documentId),
    );
  }, [reading.data]);

  // Ctrl+K leva para a busca do livro (Enter vai para a próxima ocorrência).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        findInput.current?.focus();
        findInput.current?.select();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Só guarda a posição depois que o leitor rolou a página de verdade (para a
  // abertura não sobrescrever o "onde parei" com o começo do livro).
  useEffect(() => {
    const mark = () => {
      userScrolled.current = true;
    };

    document.addEventListener("scroll", mark, { capture: true, once: true });

    return () => document.removeEventListener("scroll", mark, true);
  }, []);

  // O ponto já guardado no servidor (lido uma vez, ao abrir o livro).
  const savedElementId = reading.data?.book.lastPosition?.elementId;

  useEffect(() => {
    if (reading.data && !seededPosition.current) {
      seededPosition.current = true;
      lastSaved.current = savedElementId;
    }
  }, [reading.data, savedElementId]);

  useEffect(() => {
    if (
      !bookId ||
      !userScrolled.current ||
      !activeElementId ||
      activeElementId === lastSaved.current
    ) {
      return;
    }

    const documentId = owner.get(activeElementId);

    if (!documentId) {
      return;
    }

    const timer = window.setTimeout(() => {
      lastSaved.current = activeElementId;
      persistPosition({
        id: bookId,
        position: { documentId, elementId: activeElementId },
      });
    }, SAVE_POSITION_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [activeElementId, bookId, owner, persistPosition]);

  // "Continuar" da estante abre o livro já no ponto onde parou.
  const wantsContinue = params.get("continuar") === "1";

  useEffect(() => {
    if (!wantsContinue || continued.current || !reading.data) {
      return;
    }

    continued.current = true;
    setParams({}, { replace: true });
    window.requestAnimationFrame(continueReading);
  }, [wantsContinue, reading.data, continueReading, setParams]);

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
  const stats = bookStats(reading.data);
  const totalChapters = stats.chapters;
  const readIds = book.readDocumentIds;
  const readCount = readIds.filter((id) => contents.has(id)).length;
  const completed = book.completedAt !== null;

  function handleToggleRead(documentId: string, read: boolean) {
    const wasCompleted = completed;

    setRead.mutate(
      { id: book.id, documentId, read },
      {
        onSuccess: (updated) => {
          if (updated.completedAt && !wasCompleted) {
            setCelebrate(true);
          }
        },
      },
    );
  }

  function handleReset() {
    resetProgress.mutate(book.id, { onSuccess: () => setModal(null) });
  }

  function handleHit(hit: BookSearchHit) {
    goToElement(hitTargetId(hit, contents.get(hit.documentId) ?? ""));
  }

  function handleDelete() {
    remove.mutate(book.id, {
      onSuccess: () => navigate("/library/books"),
    });
  }

  const goToChapter = (documentId: string) =>
    goToElement(chapterElementId(documentId));

  const findBar = (
    <BookFindBar
      value={search}
      onChange={setSearch}
      count={find.count}
      index={find.index}
      onNext={find.next}
      onPrev={find.prev}
      inputRef={findInput}
    />
  );

  const celebration = (
    <BookCompletedDialog
      open={celebrate}
      onOpenChange={setCelebrate}
      title={book.title}
      chapters={stats.chapters}
      words={stats.words}
      minutes={stats.minutes}
    />
  );

  if (reader && totalChapters > 0) {
    return (
      <>
        <ReadingMode
          title={book.title}
          onExit={() => setReader(false)}
          actions={findBar}
          toc={
            <div className="space-y-4">
              <BookProgressCard
                read={readCount}
                total={totalChapters}
                completedAt={book.completedAt}
              />

              <BookOutline
                modules={modules}
                activeChapterId={activeChapterId}
                readIds={readIds}
                className="max-h-[60dvh]"
                onSelectChapter={goToChapter}
              />
            </div>
          }
        >
          <div ref={setContainer} className="mx-auto w-full max-w-3xl">
            <BookContent
              reading
              modules={modules}
              readIds={readIds}
              onToggleRead={handleToggleRead}
              onGoToChapter={goToChapter}
            />

            <BackToTopButton container={container} />
          </div>
        </ReadingMode>

        {celebration}
      </>
    );
  }

  const canContinue = book.lastPosition !== null && totalChapters > 0;
  const hasProgress = readIds.length > 0 || book.lastPosition !== null;

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
          completed={completed}
          className="mx-auto w-40"
        />

        <h1 className="text-3xl font-semibold tracking-tight">{book.title}</h1>

        {book.description && (
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            {book.description}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          {canContinue && (
            <Button onClick={continueReading}>
              <Play /> Continuar de onde parou
            </Button>
          )}

          {totalChapters > 0 && (
            <Button
              variant={canContinue ? "outline" : "default"}
              onClick={() => setReader(true)}
            >
              <BookOpenText /> Modo leitura
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  <MoreHorizontal /> Mais ações
                </Button>
              }
            />

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setModal("details")}>
                <Info /> Detalhes
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setModal("organize")}>
                <ListOrdered /> Organizar
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setModal("edit")}>
                <Pencil /> Editar dados e capa
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={!hasProgress}
                onClick={() => setModal("reset")}
              >
                <RotateCcw /> Zerar progresso
              </DropdownMenuItem>

              {totalChapters > 0 && (
                <DropdownMenuItem onClick={() => setPrinting(true)}>
                  <Download /> Exportar PDF
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => setModal("delete")}
              >
                <Trash2 /> Excluir livro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <div
            ref={setContainer}
            className="mx-auto w-full min-w-0 max-w-3xl px-4 sm:px-8"
          >
            <BookContent
              modules={modules}
              readIds={readIds}
              onToggleRead={handleToggleRead}
              onGoToChapter={goToChapter}
            />

            <BackToTopButton container={container} />
          </div>

          <BookSidebar
            modules={modules}
            activeChapterId={activeChapterId}
            readIds={readIds}
            readCount={readCount}
            completedAt={book.completedAt}
            query={search}
            findBar={findBar}
            hits={results.data}
            isSearching={results.isFetching}
            onSelectChapter={goToChapter}
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

      <ConfirmDialog
        open={modal === "reset"}
        onOpenChange={(open) => setModal(open ? "reset" : null)}
        title="Zerar o progresso?"
        description="Todos os capítulos voltam a não lidos e o ponto de “continuar de onde parou” é apagado. O livro e as páginas não mudam."
        confirmLabel="Zerar progresso"
        destructive
        isPending={resetProgress.isPending}
        errorMessage={
          resetProgress.isError
            ? "Não foi possível zerar o progresso. Tente novamente."
            : undefined
        }
        onConfirm={handleReset}
      />

      {celebration}

      {printing && (
        <BookPrintView
          reading={reading.data}
          onDone={() => setPrinting(false)}
        />
      )}
    </article>
  );
}
