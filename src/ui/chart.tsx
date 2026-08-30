import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { cn } from "../lib/utils";

type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used inside a ChartContainer");
  }

  return context;
}

interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-sector]:outline-none",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

interface ChartTooltipContentProps extends React.ComponentProps<
  typeof Tooltip
> {
  hideLabel?: boolean;
  hideIndicator?: boolean;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  hideIndicator = false,
  labelFormatter,
}: ChartTooltipContentProps & {
  active?: boolean;
  payload?: any[];
  label?: string;
  labelFormatter?: (value: string) => React.ReactNode;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  const formattedLabel = labelFormatter ? labelFormatter(label ?? "") : label;

  return (
    <div className="grid min-w-32 gap-2 rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      {!hideLabel && (
        <div className="font-medium text-foreground">{formattedLabel}</div>
      )}

      <div className="grid gap-1.5">
        {payload.map((item) => {
          const key = item.dataKey as string;
          const itemConfig = config[key];

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {!hideIndicator && (
                  <div
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: itemConfig?.color,
                    }}
                  />
                )}

                <span className="text-muted-foreground">
                  {itemConfig?.label ?? key}
                </span>
              </div>

              <span className="font-mono font-medium tabular-nums text-foreground">
                {item.value?.toLocaleString("pt-BR")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { BarChart, Bar, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip };
