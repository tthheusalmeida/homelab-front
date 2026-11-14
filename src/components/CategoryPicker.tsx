import { useId } from "react";

import { Input } from "#ui/input";
import { Label } from "#ui/label";
import { normalizeKey } from "#lib/text";

export interface CategoryOption {
  name: string;
  children: CategoryOption[];
}

interface CategoryPickerProps {
  /** Níveis escolhidos, do mais amplo ao mais específico. */
  value: string[];
  onChange: (category: string[]) => void;
  /** Categorias existentes, usadas como sugestão em cada nível. */
  options: CategoryOption[];
  maxLevels?: number;
  disabled?: boolean;
}

const LEVEL_LABELS = [
  "Categoria",
  "Subcategoria",
  "Subcategoria 2",
  "Subcategoria 3",
];

export function CategoryPicker({
  value,
  onChange,
  options,
  maxLevels = 4,
  disabled,
}: CategoryPickerProps) {
  const id = useId();

  // Um nível só aparece depois que o anterior foi preenchido.
  const visibleLevels = Math.min(
    maxLevels,
    Math.max(1, value.filter((name) => name.trim() !== "").length + 1),
  );

  function suggestionsFor(level: number): CategoryOption[] {
    let current = options;

    for (let i = 0; i < level; i++) {
      const parent = current.find(
        (option) => normalizeKey(option.name) === normalizeKey(value[i] ?? ""),
      );

      if (!parent) {
        return [];
      }

      current = parent.children;
    }

    return current;
  }

  function handleChange(level: number, text: string) {
    const next = value.slice(0, level);

    next[level] = text;

    // Limpar um nível limpa os mais profundos; níveis vazios no fim saem.
    while (next.length > 0 && next[next.length - 1].trim() === "") {
      next.pop();
    }

    onChange(next);
  }

  const filled = value.filter((name) => name.trim() !== "");

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        A categoria é a <strong>pasta</strong> onde a página fica guardada,
        do mais amplo ao mais específico. Cada campo é um nível dentro do
        anterior. Ex.: Ciência › Química › Ligações. Para assuntos soltos que
        cruzam pastas, use as tags.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: visibleLevels }, (_, level) => {
        const inputId = `${id}-${level}`;
        const suggestions = suggestionsFor(level);
        const text = value[level] ?? "";
        const isNew =
          text.trim() !== "" &&
          !suggestions.some(
            (option) => normalizeKey(option.name) === normalizeKey(text),
          );

        return (
          <div key={level} className="space-y-1.5">
            <Label htmlFor={inputId}>
              {LEVEL_LABELS[level] ?? `Nível ${level + 1}`}
            </Label>

            <Input
              id={inputId}
              list={`${inputId}-options`}
              value={text}
              onChange={(event) => handleChange(level, event.target.value)}
              placeholder={
                suggestions.length > 0 ? "Escolha ou crie" : "Digite um nome"
              }
              disabled={disabled}
            />

            <datalist id={`${inputId}-options`}>
              {suggestions.map((option) => (
                <option key={option.name} value={option.name} />
              ))}
            </datalist>

            {isNew && (
              <p className="text-xs text-muted-foreground">Nova categoria</p>
            )}
          </div>
        );
        })}
      </div>

      {filled.length > 0 && (
        <p className="text-sm">
          Ficará em: <strong>{filled.join(" › ")}</strong>
        </p>
      )}
    </div>
  );
}
