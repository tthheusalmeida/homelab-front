import type { BookCoverColor } from "./types";

/** Cores da capa: rótulo, degradê da capa e cor da amostra no seletor. */
export const bookCoverColors: {
  id: BookCoverColor;
  label: string;
  gradient: string;
  swatch: string;
}[] = [
  {
    id: "blue",
    label: "Azul",
    gradient: "from-blue-600 to-blue-900",
    swatch: "bg-blue-600",
  },
  {
    id: "emerald",
    label: "Verde",
    gradient: "from-emerald-600 to-emerald-900",
    swatch: "bg-emerald-600",
  },
  {
    id: "violet",
    label: "Roxo",
    gradient: "from-violet-600 to-violet-900",
    swatch: "bg-violet-600",
  },
  {
    id: "amber",
    label: "Laranja",
    gradient: "from-amber-500 to-amber-800",
    swatch: "bg-amber-500",
  },
  {
    id: "rose",
    label: "Rosa",
    gradient: "from-rose-600 to-rose-900",
    swatch: "bg-rose-600",
  },
  {
    id: "slate",
    label: "Grafite",
    gradient: "from-slate-600 to-slate-900",
    swatch: "bg-slate-600",
  },
];

export const DEFAULT_COVER_COLOR: BookCoverColor = "blue";

export function gradientOf(color: BookCoverColor | undefined): string {
  return (
    bookCoverColors.find((option) => option.id === color)?.gradient ??
    bookCoverColors[0].gradient
  );
}

/** Texto vazio é válido (sem imagem); senão precisa ser uma URL http(s). */
export function isValidCoverImageUrl(value: string): boolean {
  const url = value.trim();

  if (url === "") {
    return true;
  }

  try {
    const { protocol } = new URL(url);

    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
