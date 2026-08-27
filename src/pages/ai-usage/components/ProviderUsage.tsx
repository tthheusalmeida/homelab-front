import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";

import type { AiProviderUsage } from "../types/aiUsage.types";

interface ProviderUsageProps {
  data: AiProviderUsage[];
}

export function ProviderUsage({ data }: ProviderUsageProps) {
  const total = data.reduce((sum, provider) => sum + provider.totalTokens, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso por provedor</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {data.map((provider) => {
          const percentage =
            total > 0 ? (provider.totalTokens / total) * 100 : 0;

          return (
            <div key={provider.provider} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">
                  {provider.provider}
                </span>

                <span className="text-sm text-muted-foreground">
                  {percentage.toFixed(1)}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{provider.requests.toLocaleString()} requests</span>

                <span>{provider.totalTokens.toLocaleString()} tokens</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
