import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "../../../../ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";

import type { AiUsageTimeline } from "../types/aiUsage.types";

import { formatDate, formatNumber } from "#lib/format";

interface UsageTimelineProps {
  data: AiUsageTimeline[];
}

interface UsageTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const chartConfig = {
  totalTokens: {
    label: "Tokens",
    color: "var(--chart-1)",
  },
};

function getLastSevenDays(): string[] {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);

    date.setDate(today.getDate() - (6 - index));

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  });
}

function createTimeline(data: AiUsageTimeline[]): AiUsageTimeline[] {
  return getLastSevenDays().map(
    (date) =>
      data.find((item) => item.date === date) ?? {
        date,
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
      },
  );
}

function UsageTooltip({ active, payload, label }: UsageTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const value = Number(payload[0].value);

  return (
    <div className="grid min-w-32 items-start gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{label && formatDate(label)}</div>

      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-xs"
          style={{
            backgroundColor: "var(--chart-1)",
          }}
        />

        <span className="text-muted-foreground">Tokens:</span>

        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatNumber(value)}
        </span>
      </div>
    </div>
  );
}

export function UsageTimeline({ data }: UsageTimelineProps) {
  const timeline = createTimeline(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumo de tokens</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart
            data={timeline}
            margin={{
              top: 8,
              right: 8,
              left: 8,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              width={45}
              tickFormatter={formatNumber}
            />

            <Tooltip
              cursor={{
                fill: "var(--muted)",
                opacity: 0.3,
              }}
              content={<UsageTooltip />}
            />

            <Bar
              dataKey="totalTokens"
              radius={[4, 4, 0, 0]}
              fill="var(--chart-1)"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
