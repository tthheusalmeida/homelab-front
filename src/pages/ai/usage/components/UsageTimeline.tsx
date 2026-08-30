import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  ChartTooltipContent,
  Tooltip,
  XAxis,
  YAxis,
} from "../../../../ui/chart";

import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";

import type { AiUsageTimeline } from "../types/aiUsage.types";

interface UsageTimelineProps {
  data: AiUsageTimeline[];
}

const chartConfig = {
  totalTokens: {
    label: "Tokens",
    color: "var(--chart-1)",
  },
};

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

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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

  console.log(data);

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
              tickFormatter={(value) => value.toLocaleString("pt-BR")}
            />

            <Tooltip
              cursor={{
                fill: "var(--muted)",
                opacity: 0.3,
              }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDate(value as string)}
                />
              }
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
