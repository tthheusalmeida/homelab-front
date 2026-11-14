import { useEffect, useState } from "react";

/**
 * Entre os ids, o da seção que o leitor está lendo: a última cuja borda de cima
 * já passou do `offset` (distância do topo da tela). Antes de qualquer uma
 * chegar lá, vale a primeira que existe na página. Sem nenhuma na página, nada.
 */
export function findActiveId(
  ids: string[],
  topOf: (id: string) => number | null,
  offset = 120,
): string | undefined {
  let active: string | undefined;
  let first: string | undefined;

  for (const id of ids) {
    const top = topOf(id);

    if (top === null) {
      continue;
    }

    first ??= id;

    if (top <= offset) {
      active = id;
    }
  }

  return active ?? first;
}

const topOfElement = (id: string) =>
  document.getElementById(id)?.getBoundingClientRect().top ?? null;

/**
 * Acompanha a rolagem (da janela ou de qualquer área com rolagem, como o modo
 * leitura) e devolve o id da seção sendo lida, para destacar no sumário.
 */
export function useActiveSection(
  ids: string[],
  offset = 120,
): string | undefined {
  const [active, setActive] = useState<string>();
  const key = ids.join("\u0000");

  useEffect(() => {
    const list = key === "" ? [] : key.split("\u0000");
    let frame = 0;

    const update = () => {
      frame = 0;
      setActive(findActiveId(list, topOfElement, offset));
    };

    const schedule = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    // `capture` pega a rolagem de qualquer elemento, não só a da janela.
    document.addEventListener("scroll", schedule, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", schedule);

    return () => {
      document.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);

      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [key, offset]);

  return active;
}
