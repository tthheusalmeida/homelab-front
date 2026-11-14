import type { ReactNode } from "react";

import { Badge } from "#ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#ui/dialog";
import { formatDateTime } from "#lib/format";

import { bookStats, formatReadingTime } from "../stats";
import { bookKindLabels, type BookReading } from "../types";
import { BookCover } from "./BookCover";

interface BookDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reading: BookReading;
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>

      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

/** Ficha do livro: capa, dados, números de leitura e a estrutura completa. */
export function BookDetailsDialog({
  open,
  onOpenChange,
  reading,
}: BookDetailsDialogProps) {
  const { book } = reading;
  const stats = bookStats(reading);
  let number = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes do livro</DialogTitle>

          <DialogDescription>
            Dados, números de leitura e a estrutura do livro.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-[11rem_1fr]">
          <BookCover
            title={book.title}
            kind={book.kind}
            subtitle={book.subtitle}
            color={book.coverColor}
            imageUrl={book.coverImageUrl}
          />

          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{book.title}</h3>

              {book.subtitle && (
                <p className="text-sm text-muted-foreground">{book.subtitle}</p>
              )}

              <Badge variant="secondary">{bookKindLabels[book.kind]}</Badge>
            </div>

            {book.description && <p className="text-sm">{book.description}</p>}

            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Fact label="Módulos">{stats.modules}</Fact>

              <Fact label="Capítulos">{stats.chapters}</Fact>

              <Fact label="Palavras">
                {stats.words.toLocaleString("pt-BR")}
              </Fact>

              <Fact label="Leitura estimada">
                {formatReadingTime(stats.minutes)}
              </Fact>

              <Fact label="Criado em">{formatDateTime(book.createdAt)}</Fact>

              <Fact label="Atualizado em">
                {formatDateTime(book.updatedAt)}
              </Fact>
            </dl>
          </div>
        </div>

        <section aria-label="Estrutura do livro" className="space-y-3">
          <h3 className="text-sm font-semibold">Estrutura</h3>

          {stats.chapters === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este livro ainda não tem capítulos.
            </p>
          ) : (
            <ul className="space-y-3">
              {reading.modules.map((module) => (
                <li key={module.id} className="space-y-1">
                  {module.title && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {module.title}
                    </p>
                  )}

                  <ol className="space-y-1">
                    {module.chapters.map((chapter) => {
                      number += 1;

                      return (
                        <li
                          key={chapter.documentId}
                          className="flex items-center justify-between gap-3 rounded-md border px-3 py-1.5 text-sm"
                        >
                          <span className="min-w-0 truncate">
                            {number}. {chapter.title}
                          </span>

                          <span className="shrink-0 text-xs text-muted-foreground">
                            {(
                              stats.wordsByChapter.get(chapter.documentId) ?? 0
                            ).toLocaleString("pt-BR")}{" "}
                            palavras
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </li>
              ))}
            </ul>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}
