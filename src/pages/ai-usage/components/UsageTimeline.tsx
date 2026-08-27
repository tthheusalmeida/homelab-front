import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";

import type { AiUsageTimeline as TimelineData } from "../types/aiUsage.types";

interface UsageTimelineProps {
  data: TimelineData[];
}

export function UsageTimeline({ data }: UsageTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumo de token</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex h-72 items-end gap-2">
          {data.map((item) => {
            const max = Math.max(...data.map((entry) => entry.tokens));
            const height = max > 0 ? (item.tokens / max) * 100 : 0;

            return (
              <div
                key={item.date}
                className="flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full rounded-sm bg-primary/80"
                  style={{ height: `${height}%` }}
                  title={`${item.tokens.toLocaleString()} tokens`}
                />

                <span className="text-[10px] text-muted-foreground">
                  {new Date(item.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
