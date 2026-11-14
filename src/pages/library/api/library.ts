import { api } from "#lib/api";

import type {
  CategoryNode,
  ClassificationSuggestion,
  CreateArticleInput,
  DocumentDetail,
  DocumentSummary,
  IndexStatus,
  LibraryFilters,
  PublishInput,
  UpdateDocumentInput,
  TagCount,
} from "../types/library.types";

export function buildDocumentsQuery(filters: LibraryFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.q?.trim()) {
    params.set("q", filters.q.trim());
  }

  // `category` e `tag` repetem o parâmetro (um por nível / por tag).
  filters.category?.forEach((name) => params.append("category", name));
  filters.tags?.forEach((tag) => params.append("tag", tag));

  if (filters.type) params.set("type", filters.type);
  if (filters.source) params.set("source", filters.source);
  if (filters.status) params.set("status", filters.status);
  if (filters.sort) params.set("sort", filters.sort);

  return params.toString();
}

export function getDocuments(filters: LibraryFilters = {}) {
  const query = buildDocumentsQuery(filters);

  return api<DocumentSummary[]>(
    `/library/documents${query ? `?${query}` : ""}`,
  );
}

export function getDocument(id: string) {
  return api<DocumentDetail>(`/library/documents/${encodeURIComponent(id)}`);
}

export function getInbox() {
  return api<DocumentSummary[]>("/library/inbox");
}

export function getCategories() {
  return api<CategoryNode[]>("/library/categories");
}

export function getTags() {
  return api<TagCount[]>("/library/tags");
}

export function getIndexStatus() {
  return api<IndexStatus>("/library/index");
}

export function reindex() {
  return api<{ indexed: number; errors: IndexStatus["errors"] }>(
    "/library/reindex",
    { method: "POST" },
  );
}

export function publishDocument(id: string, input: PublishInput) {
  return api<DocumentDetail>(
    `/library/documents/${encodeURIComponent(id)}/publish`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function archiveDocument(id: string) {
  return api<DocumentDetail>(
    `/library/documents/${encodeURIComponent(id)}/archive`,
    { method: "POST" },
  );
}

export function discardDocument(id: string) {
  return api<void>(`/library/documents/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function createArticle(input: CreateArticleInput) {
  return api<DocumentDetail>("/library/documents/article", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function suggestClassification(id: string, modelId?: string) {
  return api<ClassificationSuggestion>(
    `/library/documents/${encodeURIComponent(id)}/suggest`,
    { method: "POST", body: JSON.stringify(modelId ? { modelId } : {}) },
  );
}

export function updateDocument(id: string, input: UpdateDocumentInput) {
  return api<DocumentDetail>(`/library/documents/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
