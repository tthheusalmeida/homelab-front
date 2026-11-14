import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addBookChapter,
  createBook,
  deleteBook,
  getBook,
  getBooks,
  readBook,
  searchBook,
  setBookStructure,
  updateBook,
} from "./api";
import type { CreateBookInput, ModuleDraft, UpdateBookInput } from "./types";

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
