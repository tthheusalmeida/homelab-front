import type { useSystemHealth } from "../hooks/useSystemHealth";

import { OverviewCard, type OverviewCardProps } from "./OverviewCard";

interface OverviewSectionProps {
  health: ReturnType<typeof useSystemHealth>;
}

export function OverviewSection({ health }: OverviewSectionProps) {
  const cards: OverviewCardProps[] = [
    {
      label: "Serviços",
      value: health.total,
      description: (
        <>
          <span className="text-emerald-500">{health.online} online</span>

          {health.offline > 0 && (
            <>
              {" · "}

              <span className="text-red-500">{health.offline} offline</span>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <section className="grid gap-2 sm:grid-cols-3">
      {cards.map((card) => (
        <OverviewCard key={card.label} {...card} />
      ))}
    </section>
  );
}
