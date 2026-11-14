import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import type { Job, JobStepType } from "../../types/job.types";

import { JobFlow } from "./JobFlow";
import { JobList } from "./JobList";
import { JobListItem } from "./JobListItem";
import { JobProcessingSteps } from "./JobProcessingSteps";
import { JobStatusBadge } from "./JobStatusBadge";
import { JobStep } from "./JobStep";

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: "job-1",
  name: "video-to-transcript",
  label: "Transcrição de vídeo",
  status: "pending",
  createdAt: "2026-01-01T10:00:00.000Z",
  completedAt: "",
  steps: [],
  ...overrides,
});

const steps: JobStepType[] = [
  { name: "a", label: "Etapa A", status: "completed" },
  { name: "b", label: "Etapa B", status: "running" },
  { name: "c", label: "Etapa C", status: "pending" },
];

describe("JobStatusBadge", () => {
  it.each([
    ["pending", "Pendente"],
    ["running", "Em execução"],
    ["completed", "Concluído"],
    ["failed", "Falhou"],
  ])("when status is %s, should show the label %s", (status, label) => {
    render(<JobStatusBadge status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe("JobStep", () => {
  it("when rendered, should show the label", () => {
    render(<JobStep label="Baixar" state="pending" />);

    expect(screen.getByText("Baixar")).toBeInTheDocument();
  });

  it("when state is active, should render the label in medium weight", () => {
    render(<JobStep label="Baixar" state="active" />);

    expect(screen.getByText("Baixar")).toHaveClass("font-medium");
  });

  it("when state is pending, should render the label muted", () => {
    render(<JobStep label="Baixar" state="pending" />);

    expect(screen.getByText("Baixar")).toHaveClass("text-muted-foreground");
  });

  it("when small, should render the compact mono label", () => {
    render(<JobStep small label="Baixar" state="completed" />);

    expect(screen.getByText("Baixar")).toHaveClass("text-xs", "font-mono");
  });
});

describe("JobProcessingSteps", () => {
  it("when given steps, should render one entry per step label", () => {
    render(<JobProcessingSteps steps={steps} />);

    expect(screen.getByText("Etapa A")).toBeInTheDocument();
    expect(screen.getByText("Etapa B")).toBeInTheDocument();
    expect(screen.getByText("Etapa C")).toBeInTheDocument();
  });

  it("when step status is running, should render it as active (bold)", () => {
    render(<JobProcessingSteps steps={steps} />);

    expect(screen.getByText("Etapa B")).toHaveClass("font-medium");
    expect(screen.getByText("Etapa C")).toHaveClass("text-muted-foreground");
  });
});

describe("JobFlow", () => {
  const flowLabel = (label: string) => screen.getByText(label);

  it("when status is pending, should mark Pendente active and the others pending", () => {
    render(<JobFlow status="pending" />);

    expect(flowLabel("Pendente")).toHaveClass("font-medium");
    expect(flowLabel("Processando")).toHaveClass("text-muted-foreground");
    expect(flowLabel("Concluído")).toHaveClass("text-muted-foreground");
  });

  it("when status is running, should mark Processando active and Pendente done", () => {
    render(<JobFlow status="running" />);

    expect(flowLabel("Processando")).toHaveClass("font-medium");
    expect(flowLabel("Pendente")).not.toHaveClass("font-medium");
    expect(flowLabel("Pendente")).not.toHaveClass("text-muted-foreground");
    expect(flowLabel("Concluído")).toHaveClass("text-muted-foreground");
  });

  it("when status is completed, should mark every phase as done", () => {
    render(<JobFlow status="completed" />);

    for (const label of ["Pendente", "Processando", "Concluído"]) {
      expect(flowLabel(label)).not.toHaveClass("font-medium");
      expect(flowLabel(label)).not.toHaveClass("text-muted-foreground");
    }
  });

  it("when status is running and there are steps, should show the processing steps", () => {
    render(<JobFlow status="running" steps={steps} />);

    expect(screen.getByText("Etapa B")).toBeInTheDocument();
  });

  it("when the job has steps, should show them whatever the job status is", () => {
    render(<JobFlow status="pending" steps={steps} />);

    expect(screen.getByText("Etapa B")).toBeInTheDocument();
  });

  it("when there are no steps, should not show the processing steps", () => {
    render(<JobFlow status="running" steps={[]} />);

    expect(screen.queryByText("Etapa A")).not.toBeInTheDocument();
  });
});

describe("JobListItem", () => {
  it("when rendered, should show label, id and creation date", () => {
    render(<JobListItem job={makeJob()} />);

    expect(screen.getByText("Transcrição de vídeo")).toBeInTheDocument();
    expect(screen.getByText("job-1")).toBeInTheDocument();
    expect(screen.getByText(/Criado em/)).toBeInTheDocument();
  });

  it("when the job has start and completion times, should show the duration", () => {
    render(
      <JobListItem
        job={makeJob({
          status: "completed",
          startedAt: "2026-01-01T10:00:00.000Z",
          completedAt: "2026-01-01T10:00:02.500Z",
        })}
      />,
    );

    expect(screen.getByText("2.5s")).toBeInTheDocument();
  });

  it("when the job has not completed, should not show a duration", () => {
    render(
      <JobListItem
        job={makeJob({
          status: "running",
          startedAt: "2026-01-01T10:00:00.000Z",
        })}
      />,
    );

    expect(screen.queryByText(/\d(ms|s|m|h)$/)).not.toBeInTheDocument();
  });

  it("when rendered, should show the status badge", () => {
    render(<JobListItem job={makeJob({ status: "failed" })} />);

    expect(screen.getByText("Falhou")).toBeInTheDocument();
  });
});

describe("JobList", () => {
  it("when given jobs, should sort them from newest to oldest", () => {
    const jobs = [
      makeJob({ id: "old", createdAt: "2026-01-01T00:00:00.000Z" }),
      makeJob({ id: "new", createdAt: "2026-03-01T00:00:00.000Z" }),
      makeJob({ id: "mid", createdAt: "2026-02-01T00:00:00.000Z" }),
    ];

    const { container } = render(<JobList jobs={jobs} />);

    const ids = within(container)
      .getAllByText(/^(old|new|mid)$/)
      .map((el) => el.textContent);
    expect(ids).toEqual(["new", "mid", "old"]);
  });

  it("when sorting, should not mutate the received array", () => {
    const jobs = [
      makeJob({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" }),
      makeJob({ id: "b", createdAt: "2026-02-01T00:00:00.000Z" }),
    ];

    render(<JobList jobs={jobs} />);

    expect(jobs.map((j) => j.id)).toEqual(["a", "b"]);
  });
});
