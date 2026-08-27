import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";

import type { AiModelUsage } from "../types/aiUsage.types";

interface ModelUsageProps {
  data: AiModelUsage[];
}

export function ModelUsage({ data }: ModelUsageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso por modelo</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {data.map((model) => (
            <div
              key={`${model.provider}-${model.model}`}
              className="flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{model.model}</p>

                <p className="text-xs capitalize text-muted-foreground">
                  {model.provider}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-medium">
                  {model.totalTokens.toLocaleString()}
                </p>

                <p className="text-xs text-muted-foreground">tokens</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
