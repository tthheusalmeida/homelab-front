import { Activity, Clock3, Coins, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";

import type { AiUsageSummary as UsageSummaryData } from "../types/aiUsage.types";

interface UsageSummaryProps {
  data: UsageSummaryData;
}

function formatTokens(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toString();
}

export function UsageSummary({ data }: UsageSummaryProps) {
  const items = [
    {
      title: "Requests",
      value: data.totalRequests.toLocaleString(),
      icon: Activity,
    },
    {
      title: "Tokens",
      value: formatTokens(data.totalTokens),
      icon: Database,
    },
    {
      title: "Custo estimado",
      value: `$${data.estimatedCost.toFixed(2)}`,
      icon: Coins,
    },
    {
      title: "Latencia média",
      value: `${data.averageLatencyMs}ms`,
      icon: Clock3,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>

              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">
                {item.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
