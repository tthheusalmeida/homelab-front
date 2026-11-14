import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addBookChapter,
  createBook,
  deleteBook,
  getBook,
  getBooks,
  readBook,
  resetBookProgress,
  saveBookPosition,
  searchBook,
  setChapterRead,
  setBookStructure,
  updateBook,
} from "./api";
import type {
  BookPosition,
  CreateBookInput,
  ModuleDraft,
  UpdateBookInput,
} from "./types";

// Fica dentro da chave "library": qualquer mudança na biblioteca (ex.: um
// documento removido) também atualiza os livros.
const BOOKS_KEY = ["library", "books"] as const;

export function useBooks(documentId?: string) {
  return useQuery({
    queryKey: [...BOOKS_KEY, "list", documentId ?? null],
    queryFn: () => getBooks(documentId),
  });
}

export function useBook(id?: string) {
  return useQuery({
    queryKey: [...BOOKS_KEY, "detail", id],
    queryFn: () => getBook(id!),
    enabled: Boolean(id),
  });
}

export function useBookReading(id?: string) {
  return useQuery({
    queryKey: [...BOOKS_KEY, "reading", id],
    queryFn: () => readBook(id!),
    enabled: Boolean(id),
  });
}

/** Pesquisa dentro do livro; só roda com 2 ou mais caracteres. */
export function useBookSearch(id: string | undefined, q: string) {
  const query = q.trim();

  return useQuery({
    queryKey: [...BOOKS_KEY, "search", id, query],
    queryFn: () => searchBook(id!, query),
    enabled: Boolean(id) && query.length >= 2,
  });
}

function useInvalidateBooks() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: BOOKS_KEY });
}

export function useCreateBook() {
  const invalidate = useInvalidateBooks();

  return useMutation({
    mutationFn: (input: CreateBookInput) => createBook(input),
    onSuccess: invalidate,
  });
}

export function useUpdateBook() {
  const invalidate = useInvalidateBooks();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBookInput }) =>
      updateBook(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteBook() {
  const invalidate = useInvalidateBooks();

  return useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: invalidate,
  });
}

export function useSetBookStructure() {
  const invalidate = useInvalidateBooks();

  return useMutation({
    mutationFn: ({ id, modules }: { id: string; modules: ModuleDraft[] }) =>
      setBookStructure(id, modules),
    onSuccess: invalidate,
  });
}

export function useAddBookChapter() {
  const invalidate = useInvalidateBooks();

  return useMutation({
    mutationFn: ({
      id,
      documentId,
      moduleId,
    }: {
      id: string;
      documentId: string;
      moduleId?: string;
    }) => addBookChapter(id, documentId, moduleId),
    onSuccess: invalidate,
  });
}

/** Marca ou desmarca um capítulo como lido (atualiza leitura, detalhes e estante). */
export function useSetChapterRead() {
  const invalidate = useInvalidateBooks();

  return useMutation({
    mutationFn: ({
      id,
      documentId,
      read,
    }: {
      id: string;
      documentId: string;
      read: boolean;
    }) => setChapterRead(id, documentId, read),
    onSuccess: invalidate,
  });
}

/**
 * Guarda o último ponto lido. Não invalida a leitura (o texto não muda e
 * recarregar a cada rolagem seria desperdício); a estante pega o valor novo
 * na próxima vez que for aberta.
 */
export function useSaveBookPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, position }: { id: string; position: BookPosition }) =>
      saveBookPosition(id, position),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...BOOKS_KEY, "list"] }),
  });
}

/** Zera o progresso do livro de uma vez (atualiza leitura, detalhes e estante). */
export function useResetBookProgress() {
  const invalidate = useInvalidateBooks();

  return useMutation({
    mutationFn: (id: string) => resetBookProgress(id),
    onSuccess: invalidate,
  });
}
