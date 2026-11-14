import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

type QueryState = { data?: unknown; isLoading: boolean; isError: boolean };

const jobTypes: QueryState = { isLoading: false, isError: false };
const jobs: QueryState = { isLoading: false, isError: false };
const usage: QueryState = { isLoading: false, isError: false };
const useAiUsageSpy = vi.fn();

vi.mock("./jobs/create/hooks/useJobsTypes", () => ({
  useJobTypes: () => jobTypes,
}));
vi.mock("./jobs/create/components/JobForm", () => ({
  JobForm: ({ jobType }: { jobType: { type: string } }) => (
    <div>form:{jobType.type}</div>
  ),
}));
vi.mock("./jobs/track/hooks/useJobs", () => ({ useJobs: () => jobs }));
vi.mock("./ai/usage/hooks/useAiUsage", () => ({
  useAiUsage: (params: unknown) => {
    useAiUsageSpy(params);
    return usage;
  },
}));
vi.mock("./ai/usage/components/UsageTimeline", () => ({
  UsageTimeline: () => <div>timeline</div>,
}));
vi.mock("./ai/usage/components/ProviderUsage", () => ({
  ProviderUsage: () => <div>by-provider</div>,
}));
vi.mock("./ai/usage/components/ModelUsage", () => ({
  ModelUsage: () => <div>by-model</div>,
}));

import { CreatePage } from "./jobs/create/CreatePage";
import { TrackPage } from "./jobs/track/TrackPage";
import { UsagePage } from "./ai/usage/UsagePage";

const usageData = {
  summary: {
    totalRequests: 1500,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 2_500_000,
    estimatedCost: 1.234,
    averageLatencyMs: 1500,
  },
  timeline: [],
  byProvider: [],
  byModel: [],
  recentRequests: [
    {
      id: "r1",
      provider: "gemini",
      model: "gemini-3.5-flash",
      operation: "chat",
      inputTokens: 1,
      outputTokens: 1,
      totalTokens: 1200,
      estimatedCost: 0.00123,
      latencyMs: 800,
      success: false,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

function reset(state: QueryState) {
  state.data = undefined;
  state.isLoading = false;
  state.isError = false;
}

describe("CreatePage", () => {
  beforeEach(() => reset(jobTypes));

  it("when job types are loading, should show the loading state", () => {
    jobTypes.isLoading = true;
    render(<CreatePage />);

    expect(screen.getByText("Carregando")).toBeInTheDocument();
  });

  it("when loading job types fails, should show the error message", () => {
    jobTypes.isError = true;
    render(<CreatePage />);

    expect(
      screen.getByText(/falha ao carregar os tipos de jobs/),
    ).toBeInTheDocument();
  });

  it("when job types load, should list them", () => {
    jobTypes.data = [{ type: "video-to-summary", label: "Resumo", description: "d" }];
    render(<CreatePage />);

    expect(screen.getByText("Resumo")).toBeInTheDocument();
  });

  it("when a type is selected, should open the dialog with its form", async () => {
    jobTypes.data = [{ type: "video-to-summary", label: "Resumo", description: "d" }];
    const user = userEvent.setup();
    render(<CreatePage />);

    await user.click(screen.getByRole("button", { name: /criar/i }));

    expect(await screen.findByText("form:video-to-summary")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveTextContent("Resumo");
  });
});

describe("TrackPage", () => {
  beforeEach(() => reset(jobs));

  it("when jobs are loading, should show the loading state", () => {
    jobs.isLoading = true;
    render(<TrackPage />);

    expect(screen.getByText("Carregando")).toBeInTheDocument();
  });

  it("when loading jobs fails, should show the error message", () => {
    jobs.isError = true;
    render(<TrackPage />);

    expect(screen.getByText(/falha ao carregar os jobs/)).toBeInTheDocument();
  });

  it("when jobs load, should list them", () => {
    jobs.data = [
      {
        id: "j1",
        name: "n",
        label: "Resumo de vídeo",
        status: "pending",
        createdAt: "2026-01-01T00:00:00.000Z",
        completedAt: "",
        steps: [],
      },
    ];
    render(<TrackPage />);

    expect(screen.getByText("Resumo de vídeo")).toBeInTheDocument();
  });
});

describe("UsagePage", () => {
  beforeEach(() => {
    reset(usage);
    useAiUsageSpy.mockClear();
  });

  it("when usage is loading, should show the loading state", () => {
    usage.isLoading = true;
    render(<UsagePage />);

    expect(screen.getByText("Carregando")).toBeInTheDocument();
  });

  it("when loading usage fails, should show the error message", () => {
    usage.isError = true;
    render(<UsagePage />);

    expect(screen.getByText(/falha ao carregar o uso de IA/)).toBeInTheDocument();
  });

  it("when usage loads, should show summary values formatted", () => {
    usage.data = usageData;
    render(<UsagePage />);

    expect(screen.getByText("1.5K")).toBeInTheDocument();
    expect(screen.getByText("2.5M")).toBeInTheDocument();
    expect(screen.getByText("$1.23")).toBeInTheDocument();
    expect(screen.getByText("1.5s")).toBeInTheDocument();
  });

  it("when usage loads, should show recent requests with cost to 4 decimals and failed status", () => {
    usage.data = usageData;
    render(<UsagePage />);

    expect(screen.getByText("gemini-3.5-flash")).toBeInTheDocument();
    expect(screen.getByText("$0.0012")).toBeInTheDocument();
    expect(screen.getByText("1.2K")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("when a provider button is clicked, should request usage filtered by it", async () => {
    usage.data = usageData;
    const user = userEvent.setup();
    render(<UsagePage />);
    expect(useAiUsageSpy).toHaveBeenLastCalledWith({ provider: undefined });

    await user.click(screen.getByRole("button", { name: "Gemini" }));
    expect(useAiUsageSpy).toHaveBeenLastCalledWith({ provider: "gemini" });

    await user.click(screen.getByRole("button", { name: "Todos" }));
    expect(useAiUsageSpy).toHaveBeenLastCalledWith({ provider: undefined });
  });
});
