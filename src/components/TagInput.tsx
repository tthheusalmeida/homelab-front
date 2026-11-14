import { useState, type KeyboardEvent } from "react";

import { X } from "lucide-react";

import { Badge } from "#ui/badge";
import { Input } from "#ui/input";
import { normalizeKey } from "#lib/text";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Digite e pressione Enter",
  disabled,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();

    if (!tag) {
      return;
    }

    if (!value.some((own) => normalizeKey(own) === normalizeKey(tag))) {
      onChange([...value, tag]);
    }

    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
      return;
    }

    if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="space-y-2">
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={placeholder}
        aria-label="Adicionar tag"
        disabled={disabled}
      />

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary" className="gap-1">
                {tag}

                <button
                  type="button"
                  aria-label={`Remover tag ${tag}`}
                  disabled={disabled}
                  onClick={() => onChange(value.filter((own) => own !== tag))}
                  className="rounded-full hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
