import React from "react";

interface HomeBaseSection {
  title: string;
  subtitle: string;
  titleMono?: string;
  children: React.ReactNode;
}

export function HomeBaseSection({
  title,
  subtitle,
  titleMono,
  children,
}: HomeBaseSection) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between select-none">
        <div>
          <h2 className="text-lg font-medium tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>

        {titleMono && (
          <span className="font-mono text-xs text-muted-foreground">
            {titleMono}
          </span>
        )}
      </div>

      {children}
    </section>
  );
}
