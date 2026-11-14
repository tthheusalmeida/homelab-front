import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

import { Button } from "#ui/button";
import { Input } from "#ui/input";

interface BookFindBarProps {
  value: string;
  onChange: (value: string) => void;
  /** Ocorrências do termo no texto do livro. */
  count: number;
  /** Ocorrência atual (0 a count-1). */
  index: number;
  onNext: () => void;
  onPrev: () => void;
  /** Para focar o campo de fora (Ctrl+K). */
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
}

/**
 * Campo de busca dentro do livro: mostra "3 de 12" e navega entre as
 * ocorrências (Enter = próxima, Shift+Enter = anterior, Esc limpa; Ctrl+K foca
 * o campo).
 */
export function BookFindBar({
  value,
  onChange,
  count,
  index,
  onNext,
  onPrev,
  inputRef,
  className,
}: BookFindBarProps) {
  const searching = value.trim().length >= 2;

  return (
    <div className={className}>
      <div className="relative flex items-center gap-1">
        <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />

        <Input
          ref={inputRef}
          type="search"
          value={value}
          placeholder="Pesquisar no livro... (Ctrl+K)"
          aria-label="Pesquisar no livro"
          className="pl-8"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();

              if (event.shiftKey) {
                onPrev();
              } else {
                onNext();
              }
            }

            if (event.key === "Escape" && value !== "") {
              event.preventDefault();
              event.stopPropagation();
              onChange("");
            }
          }}
        />
      </div>

      {searching && (
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span aria-live="polite">
            {count === 0 ? "Nenhuma ocorrência" : `${index + 1} de ${count}`}
          </span>

          <div className="flex gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Ocorrência anterior"
              disabled={count === 0}
              onClick={onPrev}
            >
              <ChevronUp />
            </Button>

            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Próxima ocorrência"
              disabled={count === 0}
              onClick={onNext}
            >
              <ChevronDown />
            </Button>

            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Limpar pesquisa"
              onClick={() => onChange("")}
            >
              <X />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
