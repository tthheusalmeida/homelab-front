import { useState } from "react";

import { Button } from "#ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#ui/dialog";

import { SearchInput } from "#components/SearchInput";
import { normalizeKey } from "#lib/text";

interface TagCount {
  tag: string;
  count: number;
}

interface TagFilterProps {
  tags: TagCount[];
  selected: string[];
  onToggle: (tag: string) => void;
  /** Quantas tags aparecem na barra (as mais usadas); as outras ficam na janela. */
  limit?: number;
}

function TagButton({
  item,
  active,
  onToggle,
}: {
  item: TagCount;
  active: boolean;
  onToggle: (tag: string) => void;
}) {
  return (
    <Button
      size="xs"
      variant={active ? "default" : "outline"}
      aria-pressed={active}
      onClick={() => onToggle(item.tag)}
    >
      {item.tag} · {item.count}
    </Button>
  );
}

/**
 * Filtro por tag enxuto: mostra as mais usadas (e as selecionadas) e deixa o
 * resto atrás de "+N tags", numa janela com busca.
 */
export function TagFilter({
  tags,
  selected,
  onToggle,
  limit = 8,
}: TagFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const sorted = [...tags].sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  );
  const visible = sorted.filter(
    (item, index) => index < limit || selected.includes(item.tag),
  );
  const hidden = sorted.length - visible.length;

  const query = normalizeKey(search);
  const matches = sorted.filter((item) =>
    normalizeKey(item.tag).includes(query),
  );

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Filtrar por tag"
    >
      {visible.map((item) => (
        <TagButton
          key={item.tag}
          item={item}
          active={selected.includes(item.tag)}
          onToggle={onToggle}
        />
      ))}

      {hidden > 0 && (
        <Button size="xs" variant="ghost" onClick={() => setOpen(true)}>
          +{hidden} tags
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          setSearch("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Todas as tags</DialogTitle>

            <DialogDescription>
              Escolha uma ou mais tags para filtrar as páginas.
            </DialogDescription>
          </DialogHeader>

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar tag..."
          />

          <div className="flex max-h-72 flex-wrap gap-1.5 overflow-y-auto">
            {matches.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma tag encontrada.
              </p>
            ) : (
              matches.map((item) => (
                <TagButton
                  key={item.tag}
                  item={item}
                  active={selected.includes(item.tag)}
                  onToggle={onToggle}
                />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
