import { useState } from "react";

import { Loader2 } from "lucide-react";

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

import { useAddBookChapter, useBooks, useCreateBook } from "../hooks";
import { bookKindLabels } from "../types";

interface AddToBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
}

/**
 * Escolhe um livro para receber o documento (no fim do último módulo) ou cria
 * um livro novo já com ele. Fecha ao concluir.
 */
export function AddToBookDialog({
  open,
  onOpenChange,
  documentId,
}: AddToBookDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar a um livro</DialogTitle>

          <DialogDescription>
            A página entra no fim do livro; depois você pode mudar a ordem em
            Organizar.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <Picker documentId={documentId} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Picker({
  documentId,
  onDone,
}: {
  documentId: string;
  onDone: () => void;
}) {
  const [newTitle, setNewTitle] = useState("");

  const books = useBooks(documentId);
  const add = useAddBookChapter();
  const create = useCreateBook();

  const busy = add.isPending || create.isPending;
  const failed = add.isError || create.isError;

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    create.mutate(
      { title: newTitle.trim() },
      {
        onSuccess: (book) =>
          add.mutate({ id: book.id, documentId }, { onSuccess: onDone }),
      },
    );
  }

  return (
    <div className="space-y-4">
      {books.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (books.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Você ainda não tem livros. Crie o primeiro abaixo.
        </p>
      ) : (
        <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
          {books.data!.map((book) => (
            <li
              key={book.id}
              className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm"
            >
              <span className="min-w-0 flex-1 truncate">{book.title}</span>

              <Badge variant="secondary">{bookKindLabels[book.kind]}</Badge>

              <Button
                type="button"
                size="xs"
                variant="outline"
                aria-label={
                  book.containsDocument
                    ? `${book.title}: já está no livro`
                    : `Adicionar ao livro ${book.title}`
                }
                disabled={busy || book.containsDocument}
                onClick={() =>
                  add.mutate({ id: book.id, documentId }, { onSuccess: onDone })
                }
              >
                {book.containsDocument ? "Já está" : "Adicionar"}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          aria-label="Nome do novo livro"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="Novo livro (ex.: Pós em DevOps)"
          disabled={busy}
        />

        <Button type="submit" disabled={busy || newTitle.trim() === ""}>
          {busy && <Loader2 className="animate-spin" />}
          Criar e adicionar
        </Button>
      </form>

      {failed && (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível adicionar ao livro. Tente novamente.
        </p>
      )}
    </div>
  );
}
