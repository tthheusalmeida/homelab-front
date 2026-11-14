import { ChevronRight, Info } from "lucide-react";

import { Button } from "#ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#ui/card";
import type { Heading } from "#lib/markdown";

interface DocumentSidebarProps {
  /** Títulos do texto, para o "Sumário". */
  headings: Heading[];
  /** Abre a janela "Sobre o documento". */
  onOpenAbout: () => void;
}

function scrollToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView?.({
    behavior: "smooth",
    block: "start",
  });
}

/**
 * Painel fixo ao lado do texto: "Sumário" dos títulos e o botão que abre a
 * janela "Sobre o documento". Fica visível enquanto o texto rola (em telas
 * largas).
 */
export function DocumentSidebar({
  headings,
  onOpenAbout,
}: DocumentSidebarProps) {
  return (
    <aside
      aria-label="Informações do documento"
      className="space-y-4 lg:sticky lg:top-4 lg:self-start"
    >
      {headings.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sumário</CardTitle>
          </CardHeader>

          <CardContent>
            <nav aria-label="Sumário">
              <ul className="max-h-[60dvh] space-y-1.5 overflow-y-auto pr-1">
                {headings.map((heading) => (
                  <li
                    key={heading.id}
                    style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
                  >
                    <button
                      type="button"
                      onClick={() => scrollToHeading(heading.id)}
                      className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </CardContent>
        </Card>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={onOpenAbout}
      >
        <span className="inline-flex items-center gap-2">
          <Info /> Sobre o documento
        </span>

        <ChevronRight />
      </Button>
    </aside>
  );
}
