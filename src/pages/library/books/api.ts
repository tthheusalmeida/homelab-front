import { api } from "#lib/api";

import type {
  BookDetail,
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

export function readBook(id: string) {
  return api<BookReading>(`${path(id)}/read`);
}

export function searchBook(id: string, q: string) {
  return api<BookSearchHit[]>(`${path(id)}/search?q=${encodeURIComponent(q)}`);
}
