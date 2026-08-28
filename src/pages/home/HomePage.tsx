export function HomePage() {
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
        <section className="border-b border-border pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div>
                <h1 className="flex flex-col gap-0.5 tracking-tight">
                  <span className="text-sm text-muted-foreground ">
                    Bem-vindo,{" "}
                  </span>
                  <span className="font-semibold text-3xl">Matheus</span>
                </h1>

                <p className="mt-4 text-muted-foreground text-xs">
                  Central de controle do HomeLab.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end font-mono text-xs text-muted-foreground">
              <span>Status</span>
              <span className="flex gap-1 items-center mt-1 text-foreground">
                <div className="size-2 rounded-full bg-emerald-500" />
                <span className="uppercase"> ALL SYSTEMS OPERATIONAL</span>
              </span>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Serviços</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">12</div>
            <div className="mt-1 text-xs text-emerald-500">12 online</div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Uptime</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">
              99.98%
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              últimos 30 dias
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">
              Última atualização
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">
              agora
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              monitoramento ativo
            </div>
          </div>
        </section>

        {/* Services */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-medium tracking-tight">Serviços</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Acesso rápido aos serviços do seu ambiente.
              </p>
            </div>

            <span className="font-mono text-xs text-muted-foreground">
              /services
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Open WebUI",
                description: "Interface para modelos de IA locais",
                status: "online",
              },
              {
                name: "Grafana",
                description: "Métricas e observabilidade",
                status: "online",
              },
              {
                name: "Prometheus",
                description: "Monitoramento e métricas",
                status: "online",
              },
            ].map((service) => (
              <button
                key={service.name}
                className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-medium">{service.name}</span>
                  </div>

                  <p className="mt-1 truncate pl-4 text-xs text-muted-foreground">
                    {service.description}
                  </p>
                </div>

                <span className="ml-4 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
