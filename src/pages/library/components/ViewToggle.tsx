import { LayoutGrid, List, Rows3 } from "lucide-react";

import { Button } from "#ui/button";

export const viewModes = ["list", "card", "grid"] as const;
export type ViewMode = (typeof viewModes)[number];

const options = [
  { id: "list", label: "Lista", icon: List },
  { id: "card", label: "Cartões", icon: Rows3 },
  { id: "grid", label: "Grade", icon: LayoutGrid },
] as const;

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

/** Alterna entre lista (mais densa), cartões e grade. */
export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Modo de visualização"
      className="inline-flex gap-1"
    >
      {options.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          size="icon-sm"
          variant={value === id ? "default" : "outline"}
          aria-label={label}
          aria-pressed={value === id}
          title={label}
          onClick={() => onChange(id)}
        >
          <Icon />
        </Button>
      ))}
    </div>
  );
}
