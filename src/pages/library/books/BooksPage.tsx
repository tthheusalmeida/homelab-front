import { useState } from "react";

import { Link, useNavigate } from "react-router";
import { BookOpen, Plus } from "lucide-react";

import { Button } from "#ui/button";
import { Card, CardContent } from "#ui/card";

import { EmptyState } from "#components/EmptyState";
import { ErrorState } from "#components/ErrorState";
import { LoadingState } from "#components/LoadingState";

import { BookCover } from "./components/BookCover";
import { BookFormDialog } from "./components/BookFormDialog";
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
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {books.data.map((book) => (
            <div key={book.id} className="group relative space-y-3">
              <BookCover
                title={book.title}
                kind={book.kind}
                subtitle={book.subtitle}
                color={book.coverColor}
                imageUrl={book.coverImageUrl}
                className="transition-transform group-hover:-translate-y-1"
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
