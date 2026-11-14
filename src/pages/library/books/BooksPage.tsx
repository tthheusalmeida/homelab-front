import { useState } from "react";

import { Link, useNavigate } from "react-router";
import { BookOpen, Play, Plus } from "lucide-react";

import { Button } from "#ui/button";
import { Card, CardContent } from "#ui/card";

import { EmptyState } from "#components/EmptyState";
import { ErrorState } from "#components/ErrorState";
import { LoadingState } from "#components/LoadingState";

import { BookCover } from "./components/BookCover";
import { BookFormDialog } from "./components/BookFormDialog";
import { BookProgress } from "./components/BookProgress";
import { useBooks } from "./hooks";

/** Estante: os livros (coleções ordenadas de documentos). */
export function BooksPage() {
  const navigate = useNavigate();
  const books = useBooks();
  const [creating, setCreating] = useState(false);

  if (books.isLoading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <LoadingState message="Carregando" />
      </div>
    );
  }

  if (books.isError || !books.data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <ErrorState
            primaryMessage="Oops! não foi possível carregar os livros."
            secondaryMessage="Verifique se o servidor está disponível."
            actionLabel="Tentar novamente"
            action={() => void books.refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Livros</h1>

          <p className="text-sm text-muted-foreground">
            Reúna páginas em ordem para ler como um livro e pesquisar dentro
            dele.
          </p>
        </div>

        <Button onClick={() => setCreating(true)}>
          <Plus /> Novo livro
        </Button>
      </div>

      {books.data.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum livro ainda"
          description="Crie um livro e adicione os resumos das aulas, na ordem que quiser."
          action={
            <Button variant="secondary" onClick={() => setCreating(true)}>
              <Plus /> Criar o primeiro livro
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {books.data.map((book) => (
            <div key={book.id} className="group relative space-y-4 text-center">
              <BookCover
                title={book.title}
                kind={book.kind}
                subtitle={book.subtitle}
                color={book.coverColor}
                imageUrl={book.coverImageUrl}
                completed={book.completedAt !== null}
                className="mx-auto max-w-44 transition-transform duration-200 group-hover:-translate-y-1.5"
              />

              <div className="space-y-1">
                <Link
                  to={`/library/books/${book.id}`}
                  className="line-clamp-2 text-sm font-semibold hover:underline after:absolute after:inset-0"
                >
                  {book.title}
                </Link>

                {book.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {book.description}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {book.chapterCount} capítulo(s) · {book.moduleCount} módulo(s)
                </p>

                <BookProgress
                  read={book.readCount}
                  total={book.availableCount}
                  completed={book.completedAt !== null}
                  completedAt={book.completedAt}
                  className="pt-1"
                />

                {book.lastPosition && book.completedAt === null && (
                  <Link
                    to={`/library/books/${book.id}?continuar=1`}
                    className="relative z-10 inline-flex items-center gap-1 pt-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Play className="size-3" /> Continuar de onde parou
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <BookFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSaved={(book) => navigate(`/library/books/${book.id}`)}
      />
    </div>
  );
}
