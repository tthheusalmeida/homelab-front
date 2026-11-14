import { cn } from "#lib/utils";

export interface OutlineItem {
  id: string;
  label: string;
  /** Nível do título (1 a 3); níveis mais fundos ficam recuados. */
  level?: number;
}

interface OutlineNavProps {
  items: OutlineItem[];
  /** Item sendo lido agora; fica destacado. */
  activeId?: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
  className?: string;
}

/**
 * Lista de títulos clicáveis (sumário). O item que está sendo lido aparece em
 * destaque (cor e peso da fonte) e com `aria-current`.
 */
export function OutlineNav({
  items,
  activeId,
  onSelect,
  ariaLabel,
  className,
}: OutlineNavProps) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className={cn("space-y-1.5 overflow-y-auto pr-1", className)}>
        {items.map((item) => {
          const active = item.id === activeId;

          return (
            <li
              key={item.id}
              style={{ paddingLeft: `${((item.level ?? 1) - 1) * 0.75}rem` }}
            >
              <button
                type="button"
                aria-current={active ? "location" : undefined}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "w-full text-left text-sm hover:underline",
                  active
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
