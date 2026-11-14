import { ChevronRight } from "lucide-react";

interface CategoryBreadcrumbProps {
  category: string[];
  /** Rótulo de acessibilidade; muda quando há um campo "Categoria" na tela. */
  label?: string;
}

export function CategoryBreadcrumb({
  category,
  label = "Categoria",
}: CategoryBreadcrumbProps) {
  if (category.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">Sem categoria</span>
    );
  }

  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
    >
      {category.map((name, index) => (
        <span key={`${index}-${name}`} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="size-3" />}

          {name}
        </span>
      ))}
    </nav>
  );
}
