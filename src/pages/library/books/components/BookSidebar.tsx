import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "#ui/card";

import type { BookReading, BookSearchHit } from "../types";
import { BookOutline } from "./BookOutline";
import { BookProgressCard } from "./BookProgressCard";

interface BookSidebarProps {
  modules: BookReading["modules"];
  /** Capítulo sendo lido agora (id do documento). */
  activeChapterId?: string;
  /** Capítulos já lidos (id do documento). */
  readIds?: string[];
  /** Quantos capítulos disponíveis já foram lidos (para a barra de progresso). */
  readCount?: number;
  /** Quando o livro foi concluído; com ele o quadro mostra a data no lugar do progresso. */
  completedAt?: string | null;
  /** Texto digitado na busca (decide se os resultados aparecem). */
  query: string;
  /** Campo de busca (com próxima/anterior); vem de fora porque o modo leitura usa o mesmo. */
  findBar: ReactNode;
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
  activeChapterId,
  readIds,
  readCount = 0,
  completedAt = null,
  query,
  findBar,
  hits,
  isSearching,
  onSelectChapter,
  onSelectHit,
}: BookSidebarProps) {
  const searching = query.trim().length >= 2;
  const totalChapters = modules.reduce(
    (sum, module) => sum + module.chapters.length,
    0,
  );

  return (
    <aside
      aria-label="Painel do livro"
      className="space-y-4 lg:sticky lg:top-4 lg:self-start"
    >
      {findBar}

      <BookProgressCard
        read={readCount}
        total={totalChapters}
        completedAt={completedAt}
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
          <BookOutline
            modules={modules}
            activeChapterId={activeChapterId}
            readIds={readIds}
            onSelectChapter={onSelectChapter}
            className="max-h-[50dvh]"
          />
        </CardContent>
      </Card>
    </aside>
  );
}
