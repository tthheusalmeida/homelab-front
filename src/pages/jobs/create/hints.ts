/** Título, categoria e tags opcionais do documento que o job vai gerar. */
export interface DocumentHints {
  title?: string;
  category?: string[];
  tags?: string[];
}

/** Envia só o que foi preenchido; vazio fica de fora e vale o padrão do back. */
export function buildDocumentHints(input: {
  title: string;
  category: string[];
  tags: string[];
}): DocumentHints {
  const title = input.title.trim();
  const category = input.category.filter((name) => name.trim() !== "");

  return {
    ...(title ? { title } : {}),
    ...(category.length > 0 ? { category } : {}),
    ...(input.tags.length > 0 ? { tags: input.tags } : {}),
  };
}
