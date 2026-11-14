import { api } from "#lib/api";

import type {
  BookDetail,
  BookPosition,
  BookReading,
  BookSearchHit,
  BookSummary,
  CreateBookInput,
  ModuleDraft,
  UpdateBookInput,
} from "./types";

const base = "/library/books";
const path = (id: string) => `${base}/${encodeURIComponent(id)}`;

export function getBooks(documentId?: string) {
  const query = documentId
    ? `?documentId=${encodeURIComponent(documentId)}`
    : "";

  return api<BookSummary[]>(`${base}${query}`);
}

export function getBook(id: string) {
  return api<BookDetail>(path(id));
}

export function createBook(input: CreateBookInput) {
  return api<BookDetail>(base, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateBook(id: string, input: UpdateBookInput) {
  return api<BookDetail>(path(id), {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteBook(id: string) {
  return api<void>(path(id), { method: "DELETE" });
}

export function setBookStructure(id: string, modules: ModuleDraft[]) {
  return api<BookDetail>(`${path(id)}/structure`, {
    method: "PUT",
    body: JSON.stringify({ modules }),
  });
}

export function addBookChapter(
  id: string,
  documentId: string,
  moduleId?: string,
) {
  return api<BookDetail>(`${path(id)}/chapters`, {
    method: "POST",
    body: JSON.stringify(moduleId ? { documentId, moduleId } : { documentId }),
  });
}

export function setChapterRead(id: string, documentId: string, read: boolean) {
  return api<BookDetail>(
    `${path(id)}/chapters/${encodeURIComponent(documentId)}/read`,
    { method: "PUT", body: JSON.stringify({ read }) },
  );
}

/** Zera o progresso do livro (capítulos lidos, posição e conclusão). */
export function resetBookProgress(id: string) {
  return api<BookDetail>(`${path(id)}/progress`, { method: "DELETE" });
}

export function saveBookPosition(id: string, position: BookPosition) {
  return api<BookDetail>(`${path(id)}/position`, {
    method: "PUT",
    body: JSON.stringify(position),
  });
}

export function readBook(id: string) {
  return api<BookReading>(`${path(id)}/read`);
}

export function searchBook(id: string, q: string) {
  return api<BookSearchHit[]>(`${path(id)}/search?q=${encodeURIComponent(q)}`);
}
