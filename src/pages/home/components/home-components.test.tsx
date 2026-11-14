import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { HealthService } from "../types/services.types";
import { services } from "../types/services.types";

import { HomeBaseSection } from "./BaseSection";
import { OverviewCard } from "./OverviewCard";
import { OverviewSection } from "./OverviewSection";
import { ServiceCard } from "./ServiceCard";
import { ServiceGrid } from "./ServiceGrid";
import { ServiceStatus } from "./ServiceStatus";
import { SystemStatus } from "./SystemStatus";

const health: HealthService = {
  service: "ai",
  description: "Serviços de IA",
  checks: [
    { service: "api", description: "API do HomeLab", status: "ok" },
    { service: "ollama", description: "Local", status: "error" },
  ],
};

describe("SystemStatus", () => {
  it("when loading, should show Verificando", () => {
    render(<SystemStatus isLoading allOnline={false} allOffline={false} />);

    expect(screen.getByText("Verificando")).toBeInTheDocument();
  });

  it("when everything is online, should show the operational message", () => {
    render(<SystemStatus isLoading={false} allOnline allOffline={false} />);

    expect(
      screen.getByText("Todos os sistemas operacionais"),
    ).toBeInTheDocument();
  });

  it("when everything is offline, should show the outage message", () => {
    render(<SystemStatus isLoading={false} allOnline={false} allOffline />);

    expect(
      screen.getByText("TODOS OS SISTEMAS FORA DO AR"),
    ).toBeInTheDocument();
  });

  it("when only some systems are down, should show the partial message", () => {
    render(
      <SystemStatus isLoading={false} allOnline={false} allOffline={false} />,
    );

    expect(
      screen.getByText("Alguns sistemas estão fora do ar"),
    ).toBeInTheDocument();
  });

  it("when loading wins over the other flags, should still show Verificando", () => {
    render(<SystemStatus isLoading allOnline allOffline />);

    expect(screen.getByText("Verificando")).toBeInTheDocument();
  });
});

describe("OverviewSection", () => {
  const base = {
    queries: [],
    services: [],
    isLoading: false,
    allOnline: false,
    allOffline: false,
    hasOffline: false,
  };

  it("when all services are online, should show the total and online count only", () => {
    render(
      <OverviewSection
        health={{ ...base, total: 3, online: 3, offline: 0 }}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("3 online")).toBeInTheDocument();
    expect(screen.queryByText(/offline/)).not.toBeInTheDocument();
  });

  it("when some services are offline, should also show the offline count", () => {
    render(
      <OverviewSection
        health={{ ...base, total: 3, online: 2, offline: 1 }}
      />,
    );

    expect(screen.getByText("2 online")).toBeInTheDocument();
    expect(screen.getByText("1 offline")).toBeInTheDocument();
  });
});

describe("OverviewCard", () => {
  it("when given label, value and description, should render them", () => {
    render(<OverviewCard label="Serviços" value={4} description="ok" />);

    expect(screen.getByText("Serviços")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});

describe("HomeBaseSection", () => {
  it("when titleMono is given, should render it; otherwise not", () => {
    const { rerender } = render(
      <HomeBaseSection title="T" subtitle="S" titleMono="/x">
        <p>conteúdo</p>
      </HomeBaseSection>,
    );

    expect(screen.getByText("/x")).toBeInTheDocument();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();

    rerender(
      <HomeBaseSection title="T" subtitle="S">
        <p>conteúdo</p>
      </HomeBaseSection>,
    );
    expect(screen.queryByText("/x")).not.toBeInTheDocument();
  });
});

describe("ServiceStatus", () => {
  it("when loading, should pulse; when error, red; otherwise green", () => {
    const { container, rerender } = render(
      <ServiceStatus isLoading isError={false} />,
    );
    expect(container.firstChild).toHaveClass("animate-pulse");

    rerender(<ServiceStatus isLoading={false} isError />);
    expect(container.firstChild).toHaveClass("bg-red-500");

    rerender(<ServiceStatus isLoading={false} isError={false} />);
    expect(container.firstChild).toHaveClass("bg-emerald-500");
  });
});

describe("ServiceCard", () => {
  it("when loading, should show the verifying message instead of checks", () => {
    render(<ServiceCard service={services[0]} isLoading />);

    expect(screen.getByText("Verificando serviços...")).toBeInTheDocument();
  });

  it("when health is loaded, should list each check with its formatted name", () => {
    render(<ServiceCard service={services[1]} health={health} isLoading={false} />);

    expect(screen.getByText("API")).toBeInTheDocument();
    expect(screen.getByText("Ollama")).toBeInTheDocument();
    expect(screen.getByText("API do HomeLab")).toBeInTheDocument();
  });

  it("when health is loaded, should prefer the health description over the service one", () => {
    render(<ServiceCard service={services[1]} health={health} isLoading={false} />);

    expect(screen.getByText("Serviços de IA")).toBeInTheDocument();
    expect(screen.queryByText(services[1].description)).not.toBeInTheDocument();
  });

  it("when there is no health data, should fall back to the service description", () => {
    render(<ServiceCard service={services[0]} isLoading={false} />);

    expect(screen.getByText(services[0].description)).toBeInTheDocument();
  });

  it("when rendered, should link to the service url in a new tab", () => {
    render(<ServiceCard service={services[0]} isLoading={false} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", services[0].url);
    expect(link).toHaveAttribute("target", "_blank");
  });
});

describe("ServiceGrid", () => {
  it("when given one query per service, should render a card for each configured service", () => {
    render(
      <ServiceGrid
        queries={services.map(() => ({ data: health, isLoading: false }))}
      />,
    );

    for (const service of services) {
      expect(screen.getByText(service.name)).toBeInTheDocument();
    }
  });
});
