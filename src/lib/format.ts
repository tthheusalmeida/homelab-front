// Format Functions

export function formatDuration(ms: number): string {
  const format = (value: number) => Number(value.toFixed(2)).toString();

  if (ms < 1_000) {
    return `${ms}ms`;
  }

  const seconds = ms / 1_000;

  if (seconds < 60) {
    return `${format(seconds)}s`;
  }

  const minutes = seconds / 60;

  if (minutes < 60) {
    return `${format(minutes)}m`;
  }

  return `${format(minutes / 60)}h`;
}

export function formatNumber(value: number): string {
  const format = (value: number) => Number(value.toFixed(2)).toString();

  if (value >= 1_000_000_000) {
    return `${format(value / 1_000_000_000)}B`;
  }

  if (value >= 1_000_000) {
    return `${format(value / 1_000_000)}M`;
  }

  if (value >= 1_000) {
    return `${format(value / 1_000)}K`;
  }

  return value.toString();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseDate(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parseDate(date));
}

export function formatServiceName(name: string) {
  const names: Record<string, string> = {
    api: "API",
  };

  return names[name] ?? name.charAt(0).toUpperCase() + name.slice(1);
}

// Miscellaneous

function parseDate(date: string | Date): Date {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(`${date}T00:00:00`);
  }

  return new Date(date);
}
