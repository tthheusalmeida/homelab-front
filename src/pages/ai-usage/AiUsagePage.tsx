import { useState } from "react";
import { CalendarDays } from "lucide-react";

import { useAiUsage } from "./hooks/useAiUsage";

import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";

import { UsageSummary } from "./components/UsageSummary";
import { UsageTimeline } from "./components/UsageTimeline";
import { ProviderUsage } from "./components/ProviderUsage";
import { ModelUsage } from "./components/ModelUsage";
import { RecentRequests } from "./components/RecentRequests";

export function AiUsagePage() {
  const [provider, setProvider] = useState<string>();

  const { data, isLoading, isError } = useAiUsage({
    provider,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <span className="text-sm text-muted-foreground">
          Loading AI usage...
        </span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">Failed to load AI usage</p>

          <p className="mt-1 text-sm text-muted-foreground">Try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Usage</h1>

          <p className="text-sm text-muted-foreground">
            Monitora o consumo de AI, custo e performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={!provider ? "secondary" : "outline"}
            size="sm"
            onClick={() => setProvider(undefined)}
          >
            Todos
          </Button>

          <Button
            variant={provider === "ollama" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setProvider("ollama")}
          >
            Ollama
          </Button>

          <Button
            variant={provider === "gemini" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setProvider("gemini")}
          >
            Gemini
          </Button>

          <Button
            variant={provider === "groq" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setProvider("groq")}
          >
            Groq
          </Button>

          <Button variant="outline" size="icon">
            <CalendarDays className="size-4" />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <UsageSummary data={data.summary} />

      {/* Timeline */}
      <UsageTimeline data={data.timeline} />

      {/* Providers + Models */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProviderUsage data={data.byProvider} />

        <ModelUsage data={data.byModel} />
      </div>

      {/* Requests */}
      <RecentRequests data={data.recentRequests} />
    </main>
  );
}
