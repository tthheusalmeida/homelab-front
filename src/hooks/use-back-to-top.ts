import { useCallback, useEffect, useRef, useState } from "react";

export interface BackToTop {
  /** O leitor já desceu o bastante para valer mostrar o botão? (falso na hora em que ele clica para subir) */
  visible: boolean;
  /** Volta ao topo da área de rolagem (suave). */
  toTop: () => void;
}

/**
 * Diz quando mostrar o "voltar ao topo" e leva até lá. Só acompanha a rolagem
 * de quem contém `container` (a janela ou a área de rolagem do app / do modo
 * leitura), ignorando listas internas com rolagem própria (como o sumário).
 */
export function useBackToTop(
  container: HTMLElement | null,
  threshold = 400,
): BackToTop {
  const [visible, setVisible] = useState(false);
  const scroller = useRef<Element | null>(null);
  // Depois de clicar em "voltar ao topo" o botão some na hora e fica escondido
  // enquanto a página sobe (a rolagem suave demora a cruzar o limite).
  const goingUp = useRef(false);
  const lastTop = useRef(0);

  useEffect(() => {
    if (!container) {
      return;
    }

    const onScroll = (event: Event) => {
      const target = event.target;
      const isDocument = target === document;

      if (
        !isDocument &&
        !(target instanceof Element && target.contains(container))
      ) {
        return;
      }

      const element = isDocument
        ? document.documentElement
        : (target as Element);

      scroller.current = element;

      const top = element.scrollTop;
      const scrollingDown = top > lastTop.current;

      lastTop.current = top;

      if (goingUp.current) {
        // O leitor desceu de novo (ou chegou ao topo): volta ao comportamento normal.
        if (scrollingDown || top <= 0) {
          goingUp.current = false;
        } else {
          setVisible(false);
          return;
        }
      }

      setVisible(top > threshold);
    };

    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });

    return () => document.removeEventListener("scroll", onScroll, true);
  }, [container, threshold]);

  const toTop = useCallback(() => {
    const element = scroller.current ?? document.documentElement;

    goingUp.current = true;
    setVisible(false);
    element.scrollTo?.({ top: 0, behavior: "smooth" });
  }, []);

  return { visible, toTop };
}
