import { ArrowUp } from "lucide-react";

import { Button } from "#ui/button";
import { cn } from "#lib/utils";
import { useBackToTop } from "#hooks/use-back-to-top";

interface BackToTopButtonProps {
  /** Coluna do texto: o botão só reage à rolagem de quem contém esse elemento. */
  container: HTMLElement | null;
}

/**
 * Botão "Voltar ao topo" para textos longos. Fica fixo no canto de baixo, do
 * lado direito da página (fora do texto, então não cobre o que está sendo
 * lido). Só aparece depois de descer um pouco e some de novo no começo; ao
 * clicar, some na hora (com transição) enquanto a página sobe. Funciona pelo
 * teclado.
 */
export function BackToTopButton({ container }: BackToTopButtonProps) {
  const { visible, toTop } = useBackToTop(container);

  // Sempre no DOM, para poder sumir com transição: escondido ele fica fora do
  // teclado e dos leitores de tela (invisible + aria-hidden) e não recebe cliques.
  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      data-slot="back-to-top"
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed right-4 bottom-4 z-40 shadow-md ring-1 ring-foreground/10 transition-[opacity,transform,visibility] duration-300 motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none invisible translate-y-3 opacity-0",
      )}
      onClick={toTop}
    >
      <ArrowUp />
    </Button>
  );
}
