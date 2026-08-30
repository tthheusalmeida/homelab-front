import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";

import type { AiUsageTimeline } from "../types/aiUsage.types";

interface UsageTimelineProps {
  data: AiUsageTimeline[];
}

function getLastSevenDays() {
  const days: string[] = [];

  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);

    date.setDate(today.getDate() - i);

    days.push(
      [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-"),
    );
  }

  return days;
}

export function UsageTimeline({ data }: UsageTimelineProps) {
  const lastSevenDays = getLastSevenDays();

  const timeline = lastSevenDays.map((date) => {
    return (
      data.find((item) => item.date === date) ?? {
        date,
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
      }
    );
  });

  const maxTokens = Math.max(...timeline.map((item) => item.totalTokens), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumo de tokens</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex h-72 items-end gap-2">
          {timeline.map((item) => {
            const height =
              maxTokens > 0 ? (item.totalTokens / maxTokens) * 100 : 0;

            return (
              <div
                key={item.date}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-sm bg-primary/80 transition-all"
                    style={{ height: `${height}%` }}
                    title={`${item.totalTokens.toLocaleString()} tokens`}
                  />
                </div>

                <span className="text-[10px] text-muted-foreground">
                  {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                    },
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
