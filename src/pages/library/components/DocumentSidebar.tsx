import { BookOpenText, ChevronRight, Info } from "lucide-react";

import { Button } from "#ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#ui/card";
import { scrollToId } from "#lib/scroll";
import type { Heading } from "#lib/markdown";

import { OutlineNav } from "#components/OutlineNav";

interface DocumentSidebarProps {
  /** Títulos do texto, para o "Sumário". */
  headings: Heading[];
  /** Título sendo lido agora (destacado no sumário). */
  activeId?: string;
  /** Abre a janela "Sobre a página". */
  onOpenAbout: () => void;
  /** Entra no modo leitura. */
  onStartReading: () => void;
}

/**
 * Painel fixo ao lado do texto: "Sumário" dos títulos (com o trecho em leitura
 * em destaque), o botão do modo leitura e o botão que abre a janela "Sobre a
 * página". Fica visível enquanto o texto rola (em telas largas).
 */
export function DocumentSidebar({
  headings,
  activeId,
  onOpenAbout,
  onStartReading,
}: DocumentSidebarProps) {
  return (
    <aside
      aria-label="Informações da página"
      className="space-y-4 lg:sticky lg:top-4 lg:self-start"
    >
      {headings.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sumário</CardTitle>
          </CardHeader>

          <CardContent>
            <OutlineNav
              ariaLabel="Sumário"
              className="max-h-[60dvh]"
              items={headings.map((heading) => ({
                id: heading.id,
                label: heading.text,
                level: heading.level,
              }))}
              activeId={activeId}
              onSelect={scrollToId}
            />
          </CardContent>
        </Card>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        onClick={onStartReading}
      >
        <BookOpenText /> Modo leitura
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={onOpenAbout}
      >
        <span className="inline-flex items-center gap-2">
          <Info /> Sobre a página
        </span>

        <ChevronRight />
      </Button>
    </aside>
  );
}
