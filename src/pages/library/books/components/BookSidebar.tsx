import { Card, CardContent, CardHeader, CardTitle } from "#ui/card";

import { SearchInput } from "#components/SearchInput";

import type { BookReading, BookSearchHit } from "../types";

interface BookSidebarProps {
  modules: BookReading["modules"];
  query: string;
  onQueryChange: (value: string) => void;
  /** `undefined` enquanto a pesquisa não rodou (consulta curta). */
  hits?: BookSearchHit[];
  isSearching?: boolean;
  onSelectChapter: (documentId: string) => void;
  onSelectHit: (hit: BookSearchHit) => void;
}

/**
 * Painel fixo do livro: pesquisa dentro dele (com trechos que levam ao ponto)
 * e o sumário de módulos e capítulos.
 */
export function BookSidebar({
  modules,
  query,
  onQueryChange,
  hits,
  isSearching,
  onSelectChapter,
  onSelectHit,
}: BookSidebarProps) {
  const searching = query.trim().length >= 2;
  let chapterNumber = 0;

  return (
    <aside
      aria-label="Painel do livro"
      className="space-y-4 lg:sticky lg:top-4 lg:self-start"
    >
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder="Pesquisar no livro..."
      />

      {searching && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {isSearching || !hits
                ? "Pesquisando..."
                : `${hits.length} resultado(s)`}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {hits && hits.length === 0 && !isSearching ? (
              <p className="text-sm text-muted-foreground">
                Nada encontrado neste livro.
              </p>
            ) : (
              <ul
                aria-label="Resultados da pesquisa"
                className="max-h-[45dvh] space-y-2 overflow-y-auto pr-1"
              >
                {(hits ?? []).map((hit) => (
                  <li key={`${hit.documentId}-${hit.line}`}>
                    <button
                      type="button"
                      onClick={() => onSelectHit(hit)}
                      className="w-full space-y-0.5 rounded-md border p-2 text-left hover:bg-accent"
                    >
                      <span className="block text-xs font-medium">
                        {hit.chapterTitle}
                        {hit.moduleTitle && (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            · {hit.moduleTitle}
                          </span>
                        )}
                      </span>

                      <span className="block text-xs text-muted-foreground">
                        {hit.snippet}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sumário do livro</CardTitle>
        </CardHeader>

        <CardContent>
          <nav aria-label="Sumário do livro">
            <ul className="max-h-[50dvh] space-y-3 overflow-y-auto pr-1">
              {modules.map((module) => (
                <li key={module.id} className="space-y-1">
                  {module.title && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {module.title}
                    </p>
                  )}

                  <ul className="space-y-1">
                    {module.chapters.map((chapter) => {
                      chapterNumber += 1;

                      return (
                        <li key={chapter.documentId}>
                          <button
                            type="button"
                            onClick={() => onSelectChapter(chapter.documentId)}
                            className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:underline"
                          >
                            {chapterNumber}. {chapter.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}
