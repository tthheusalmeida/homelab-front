import { useMemo, useState } from "react";

import {
  FolderPlus,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "#ui/badge";
import { Button } from "#ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#ui/dialog";
import { Input } from "#ui/input";
import { cn } from "#lib/utils";

import { SearchInput } from "#components/SearchInput";
import { useDebouncedValue } from "#hooks/use-debounced-value";

import { useDocuments } from "../../hooks/useLibrary";
import { useSetBookStructure } from "../hooks";
import {
  addChapters,
  addModule,
  dropChapter,
  dropModule,
  dropSide,
  removeChapter,
  removeModule,
  renameModule,
  sameStructure,
  toDrafts,
} from "../organizer";
import type { BookDetail } from "../types";

interface BookOrganizerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: BookDetail;
}

/** O que está sendo arrastado. */
type Drag = { kind: "chapter" | "module"; id: string } | null;

/** Onde vai cair: posição de inserção num módulo (capítulo) ou na lista (módulo). */
type Over =
  | { kind: "chapter"; moduleId: string; index: number }
  | { kind: "module"; index: number }
  | null;

/** Janela (tela cheia) para organizar por arrastar e soltar e adicionar documentos. */
export function BookOrganizerDialog({
  open,
  onOpenChange,
  book,
}: BookOrganizerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none sm:max-w-none">
        {open && <Organizer book={book} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function Organizer({
  book,
  onClose,
}: {
  book: BookDetail;
  onClose: () => void;
}) {
  const initial = useMemo(() => toDrafts(book), [book]);

  const [modules, setModules] = useState(initial);
  // Títulos conhecidos (os do livro + os dos documentos adicionados agora).
  const [known, setKnown] = useState(() => {
    const map = new Map<string, { title: string; available: boolean }>();

    for (const module of book.modules) {
      for (const chapter of module.chapters) {
        map.set(chapter.documentId, {
          title: chapter.title,
          available: chapter.available,
        });
      }
    }

    return map;
  });
  const [search, setSearch] = useState("");
  const [drag, setDrag] = useState<Drag>(null);
  const [over, setOver] = useState<Over>(null);

  const save = useSetBookStructure();
  const q = useDebouncedValue(search);
  const documents = useDocuments({ q, sort: "title" });

  const inBook = new Set(modules.flatMap((module) => module.documentIds));
  const candidates = (documents.data ?? []).filter(
    (document) => !inBook.has(document.id),
  );
  const canSave = !sameStructure(modules, initial) && !save.isPending;

  function handleAdd(document: { id: string; title: string }) {
    setKnown((current) =>
      new Map(current).set(document.id, {
        title: document.title,
        available: true,
      }),
    );
    setModules((current) => addChapters(current, [document.id]));
  }

  function handleSave() {
    save.mutate({ id: book.id, modules }, { onSuccess: onClose });
  }

  function endDrag() {
    setDrag(null);
    setOver(null);
  }

  /** Aplica o último ponto de queda calculado nos eventos de arrastar. */
  function commitDrop() {
    if (drag?.kind === "chapter" && over?.kind === "chapter") {
      setModules((current) =>
        dropChapter(current, drag.id, over.moduleId, over.index),
      );
    }

    if (drag?.kind === "module" && over?.kind === "module") {
      setModules((current) => dropModule(current, drag.id, over.index));
    }

    endDrag();
  }

  function startDrag(
    event: React.DragEvent,
    next: NonNullable<Drag>,
    image?: Element | null,
  ) {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    // Firefox só inicia o arrasto com algum dado.
    event.dataTransfer.setData("text/plain", next.id);

    if (image) {
      event.dataTransfer.setDragImage?.(image, 0, 0);
    }

    setDrag(next);
  }

  let chapterNumber = 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Organizar “{book.title}”</DialogTitle>

        <DialogDescription>
          Arraste capítulos e módulos pelo ícone para mudar a ordem, inclusive
          de um módulo para outro. Uma página só aparece uma vez no livro.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <section aria-label="Estrutura do livro" className="space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setModules((current) =>
                addModule(current, globalThis.crypto.randomUUID()),
              )
            }
          >
            <FolderPlus /> Novo módulo
          </Button>

          {modules.map((module, moduleIndex) => {
            const moduleBefore =
              over?.kind === "module" && over.index === moduleIndex;
            const moduleAfter =
              over?.kind === "module" &&
              over.index === modules.length &&
              moduleIndex === modules.length - 1;
            const chapterTarget =
              over?.kind === "chapter" && over.moduleId === module.id;

            return (
              <div
                key={module.id}
                data-module={module.id}
                className={cn(
                  "space-y-2 rounded-lg border p-3",
                  moduleBefore && "border-t-4 border-t-primary",
                  moduleAfter && "border-b-4 border-b-primary",
                  chapterTarget &&
                    module.documentIds.length === 0 &&
                    "bg-accent",
                )}
                onDragOver={(event) => {
                  if (drag?.kind === "chapter") {
                    event.preventDefault();
                    setOver({
                      kind: "chapter",
                      moduleId: module.id,
                      index: module.documentIds.length,
                    });
                  } else if (drag?.kind === "module") {
                    event.preventDefault();
                    const side = dropSide(
                      event.clientY,
                      event.currentTarget.getBoundingClientRect(),
                    );

                    setOver({
                      kind: "module",
                      index: side === "before" ? moduleIndex : moduleIndex + 1,
                    });
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  commitDrop();
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    role="button"
                    tabIndex={-1}
                    draggable
                    aria-label={`Arrastar módulo ${moduleIndex + 1}`}
                    title="Arraste para reordenar o módulo"
                    className="cursor-grab text-muted-foreground active:cursor-grabbing"
                    onDragStart={(event) =>
                      startDrag(
                        event,
                        { kind: "module", id: module.id },
                        event.currentTarget.closest("[data-module]"),
                      )
                    }
                    onDragEnd={endDrag}
                  >
                    <GripVertical className="size-5" />
                  </span>

                  <Input
                    aria-label={`Título do módulo ${moduleIndex + 1}`}
                    value={module.title}
                    placeholder="Sem título (capítulos soltos)"
                    onChange={(event) =>
                      setModules((current) =>
                        renameModule(current, module.id, event.target.value),
                      )
                    }
                  />

                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    aria-label={`Remover módulo ${moduleIndex + 1}`}
                    disabled={modules.length <= 1}
                    onClick={() =>
                      setModules((current) => removeModule(current, module.id))
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>

                {module.documentIds.length === 0 ? (
                  <p className="px-1 text-sm text-muted-foreground">
                    Nenhum capítulo neste módulo. Arraste capítulos para cá.
                  </p>
                ) : (
                  <ol className="space-y-1">
                    {module.documentIds.map((documentId, chapterIndex) => {
                      chapterNumber += 1;
                      const info = known.get(documentId);
                      const title = info?.title ?? "Página indisponível";
                      const markBefore =
                        chapterTarget && over.index === chapterIndex;
                      const markAfter =
                        chapterTarget &&
                        over.index === module.documentIds.length &&
                        chapterIndex === module.documentIds.length - 1;

                      return (
                        <li
                          key={documentId}
                          draggable
                          className={cn(
                            "flex cursor-grab items-center gap-2 rounded-md border px-2 py-1.5 text-sm active:cursor-grabbing",
                            drag?.id === documentId && "opacity-40",
                            markBefore && "border-t-4 border-t-primary",
                            markAfter && "border-b-4 border-b-primary",
                          )}
                          onDragStart={(event) =>
                            startDrag(event, {
                              kind: "chapter",
                              id: documentId,
                            })
                          }
                          onDragEnd={endDrag}
                          onDragOver={(event) => {
                            if (drag?.kind !== "chapter") {
                              return;
                            }

                            event.preventDefault();
                            event.stopPropagation();

                            const side = dropSide(
                              event.clientY,
                              event.currentTarget.getBoundingClientRect(),
                            );

                            setOver({
                              kind: "chapter",
                              moduleId: module.id,
                              index:
                                side === "before"
                                  ? chapterIndex
                                  : chapterIndex + 1,
                            });
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            commitDrop();
                          }}
                        >
                          <GripVertical className="size-4 shrink-0 text-muted-foreground" />

                          <span className="w-6 shrink-0 text-xs text-muted-foreground">
                            {chapterNumber}.
                          </span>

                          <span className="min-w-0 flex-1 truncate">
                            {title}
                          </span>

                          {info && !info.available && (
                            <Badge variant="outline">Indisponível</Badge>
                          )}

                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Remover ${title} do livro`}
                            onClick={() =>
                              setModules((current) =>
                                removeChapter(current, documentId),
                              )
                            }
                          >
                            <X />
                          </Button>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            );
          })}
        </section>

        <section aria-label="Adicionar páginas" className="space-y-3">
          <h3 className="text-sm font-semibold">Adicionar páginas</h3>

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar na biblioteca..."
          />

          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {documents.isLoading
                ? "Carregando..."
                : "Nenhuma página disponível para adicionar."}
            </p>
          ) : (
            <ul className="max-h-[60dvh] space-y-1 overflow-y-auto pr-1">
              {candidates.map((document) => (
                <li
                  key={document.id}
                  className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{document.title}</span>

                    <span className="block truncate text-xs text-muted-foreground">
                      {document.category.join(" › ")}
                    </span>
                  </span>

                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    aria-label={`Adicionar ${document.title}`}
                    onClick={() => handleAdd(document)}
                  >
                    <Plus /> Adicionar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {save.isError && (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível salvar o livro. Tente novamente.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={save.isPending}
          onClick={onClose}
        >
          Cancelar
        </Button>

        <Button type="button" disabled={!canSave} onClick={handleSave}>
          {save.isPending && <Loader2 className="animate-spin" />}
          Salvar
        </Button>
      </div>
    </>
  );
}
