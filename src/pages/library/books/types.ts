export type BookKind = "pos" | "course" | "study" | "book";

export const bookKindLabels: Record<BookKind, string> = {
  pos: "Pós-graduação",
  course: "Curso",
  study: "Estudo",
  book: "Livro",
};

export const bookKindOptions = (
  Object.entries(bookKindLabels) as [BookKind, string][]
).map(([id, label]) => ({ id, label }));

export type BookCoverColor =
  "blue" | "emerald" | "violet" | "amber" | "rose" | "slate";

/** Campos da capa; o texto da capa é o título, o subtítulo e o tipo. */
export interface BookCoverData {
  subtitle: string;
  coverColor: BookCoverColor;
  /** URL http(s) da imagem; vazio = só a cor. */
  coverImageUrl: string;
}

export interface BookSummary extends BookCoverData {
  id: string;
  title: string;
  kind: BookKind;
  description: string;
  chapterCount: number;
  moduleCount: number;
  updatedAt: string;
  /** Só quando a lista é pedida para um documento. */
  containsDocument?: boolean;
}

export interface BookChapter {
  documentId: string;
  title: string;
  category: string[];
  /** `false` quando o documento saiu da biblioteca ou foi apagado. */
  available: boolean;
}

export interface BookModule {
  id: string;
  /** Vazio = capítulos soltos, sem cabeçalho de módulo. */
  title: string;
  chapters: BookChapter[];
}

export interface BookDetail extends BookCoverData {
  id: string;
  title: string;
  kind: BookKind;
  description: string;
  createdAt: string;
  updatedAt: string;
  modules: BookModule[];
}

export interface ReadingChapter extends BookChapter {
  content: string;
}

export interface BookReading {
  book: Omit<BookDetail, "modules">;
  modules: {
    id: string;
    title: string;
    chapters: ReadingChapter[];
  }[];
}

export interface BookSearchHit {
  documentId: string;
  chapterTitle: string;
  moduleId: string;
  moduleTitle: string;
  line: number;
  snippet: string;
}

export interface CreateBookInput extends Partial<BookCoverData> {
  title: string;
  kind?: BookKind;
  description?: string;
}

export type UpdateBookInput = Partial<CreateBookInput>;

/** Módulo como enviado ao salvar a estrutura (só ids de documentos). */
export interface ModuleDraft {
  id: string;
  title: string;
  documentIds: string[];
}
