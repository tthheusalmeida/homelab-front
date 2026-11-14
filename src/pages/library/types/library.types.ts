export type DocumentType = "summary" | "transcription" | "article";
export type DocumentSource = "video" | "manual";
export type DocumentStatus = "pending" | "published" | "archived";

export const documentTypeLabels: Record<DocumentType, string> = {
  summary: "Resumo",
  transcription: "Transcrição",
  article: "Criação",
};

export const documentSourceLabels: Record<DocumentSource, string> = {
  video: "Vídeo",
  manual: "Manual",
};

export type SortOption = "title" | "recent";

export const sortLabels: Record<SortOption, string> = {
  title: "A–Z",
  recent: "Mais recentes",
};

export interface DocumentMeta {
  id: string;
  title: string;
  type: DocumentType;
  source: DocumentSource;
  sourceUrl?: string;
  status: DocumentStatus;
  category: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSummary extends DocumentMeta {
  fileName: string;
  preview: string;
  matchedIn?: "metadata" | "content";
}

export interface DocumentDetail {
  meta: DocumentMeta;
  content: string;
}

export interface CategoryNode {
  name: string;
  path: string[];
  count: number;
  children: CategoryNode[];
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface IndexError {
  file: string;
  message: string;
}

export interface IndexStatus {
  total: number;
  errors: IndexError[];
}

export interface LibraryFilters {
  q?: string;
  category?: string[];
  type?: DocumentType;
  source?: DocumentSource;
  tags?: string[];
  status?: DocumentStatus;
  sort?: SortOption;
}

export interface PublishInput {
  title?: string;
  category: string[];
  tags?: string[];
}

export interface CreateArticleInput {
  title: string;
  category: string[];
  tags?: string[];
  content: string;
}

export interface ClassificationSuggestion {
  title: string;
  category: string[];
  tags: string[];
  /** Modelo do Gemini que gerou a sugestão. */
  model: string;
}

export interface UpdateDocumentInput {
  title?: string;
  category?: string[];
  tags?: string[];
  content?: string;
}
