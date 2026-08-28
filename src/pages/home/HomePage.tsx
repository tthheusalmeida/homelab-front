import { OverviewSection } from "./components/OverviewSection";
import { ServicesSection } from "./components/ServicesSection";
import { SystemStatus } from "./components/SystemStatus";

import { useSystemHealth } from "./hooks/useSystemHealth";

export function HomePage() {
  const health = useSystemHealth();

  return (
    <div className="min-h-[80dvh] bg-background text-foreground">
      <div className="mx-auto  space-y-8">
        {/* Terminal */}
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span>root@homelab:~$</span>
          <span>./home</span>
          <span className="inline-block h-3.5 w-1 animate-pulse bg-muted-foreground" />
        </div>

        {/* Hero */}
        <section className="border-b border-border pb-4 select-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div>
                <h1 className="flex flex-col gap-0.5 tracking-tight">
                  <span className="text-sm text-muted-foreground ">
                    Bem-vindo,
                  </span>
                  <span className="font-semibold text-3xl">Matheus</span>
                </h1>

                <p className="mt-4 text-muted-foreground text-xs">
                  Central de controle do HomeLab.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end font-mono text-xs text-muted-foreground">
              <span>/status</span>
              <SystemStatus
                isLoading={health.isLoading}
                allOnline={health.allOnline}
                allOffline={health.allOffline}
              />
            </div>
          </div>
        </section>

        <OverviewSection health={health} />

        <ServicesSection />
      </div>
    </div>
  );
}
