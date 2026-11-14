import { useCallback, useEffect, useRef, useState } from "react";

import { findMatches, searchTerms } from "#lib/find";

const MATCH = "find-match";
const CURRENT = "find-current";

/** A CSS Custom Highlight API existe? (navegadores recentes; o jsdom não tem) */
function highlightsSupported() {
  return (
    typeof CSS !== "undefined" &&
    "highlights" in CSS &&
    typeof Highlight !== "undefined"
  );
}

function paint(name: string, ranges: Range[]) {
  if (!highlightsSupported()) {
    return;
  }

  if (ranges.length === 0) {
    CSS.highlights.delete(name);
  } else {
    CSS.highlights.set(name, new Highlight(...ranges));
  }
}

function collectRanges(container: HTMLElement, terms: string[]): Range[] {
  const ranges: Range[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    for (const { start, end } of findMatches(node.nodeValue ?? "", terms)) {
      const range = document.createRange();

      range.setStart(node, start);
      range.setEnd(node, end);
      ranges.push(range);
    }
  }

  return ranges;
}

function reveal(range: Range | undefined) {
  range?.startContainer.parentElement?.scrollIntoView?.({
    block: "center",
    behavior: "smooth",
  });
}

export interface TextHighlight {
  /** Quantas ocorrências foram achadas no texto. */
  count: number;
  /** Ocorrência atual (0 a count-1); -1 sem resultado. */
  index: number;
  next: () => void;
  prev: () => void;
}

/**
 * Destaca no texto todas as ocorrências dos termos da consulta (sem alterar o
 * HTML) e deixa ir para a próxima/anterior, rolando até ela. `version` muda
 * quando o texto é redesenhado, para refazer a busca.
 */
export function useTextHighlight(
  container: HTMLElement | null,
  query: string,
  version?: unknown,
): TextHighlight {
  const rangesRef = useRef<Range[]>([]);
  const revealedFor = useRef("");
  const [count, setCount] = useState(0);
  const [index, setIndex] = useState(-1);

  const termsKey = searchTerms(query).join("\u0000");

  useEffect(() => {
    const terms = termsKey === "" ? [] : termsKey.split("\u0000");
    const ranges =
      container && terms.length > 0 ? collectRanges(container, terms) : [];

    rangesRef.current = ranges;
    paint(MATCH, ranges);
    setCount(ranges.length);
    setIndex((current) => {
      if (ranges.length === 0) {
        return -1;
      }

      // Mesma consulta e o texto só foi redesenhado: fica onde estava.
      return revealedFor.current === termsKey && current >= 0
        ? Math.min(current, ranges.length - 1)
        : 0;
    });

    return () => paint(MATCH, []);
  }, [container, termsKey, version]);

  useEffect(() => {
    const range = rangesRef.current[index];

    paint(CURRENT, range ? [range] : []);

    if (!range) {
      revealedFor.current = "";
    } else if (revealedFor.current !== termsKey) {
      // Consulta nova: leva até a primeira ocorrência.
      revealedFor.current = termsKey;
      reveal(range);
    }

    return () => paint(CURRENT, []);
  }, [index, termsKey, count]);

  const go = useCallback((delta: 1 | -1) => {
    const total = rangesRef.current.length;

    if (total === 0) {
      return;
    }

    setIndex((current) => {
      const next = (current + delta + total) % total;

      reveal(rangesRef.current[next]);

      return next;
    });
  }, []);

  return {
    count,
    index,
    next: useCallback(() => go(1), [go]),
    prev: useCallback(() => go(-1), [go]),
  };
}
