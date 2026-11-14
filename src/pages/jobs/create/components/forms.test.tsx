import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mutate = vi.fn();
const mutationState = { isPending: false, isError: false };

vi.mock("../hooks/useCreateVideoToTranscript", () => ({
  useCreateVideoToTranscript: () => ({ mutate, ...mutationState }),
}));
vi.mock("../hooks/useCreateVideoToSummary", () => ({
  useCreateVideoToSummary: () => ({ mutate, ...mutationState }),
}));
vi.mock("../../../ai/chat/hooks/useAiProviders", () => ({
  useAiProviders: () => ({ data: [], isLoading: false }),
}));
vi.mock("../../../ai/chat/hooks/useAiModels", () => ({
  useAiModels: () => ({ data: [], isLoading: false }),
}));
vi.mock("../../../ai/chat/hooks/useAiThinking", () => ({
  useAiThinking: () => ({ data: [], isLoading: false }),
}));
vi.mock("../../../library/hooks/useLibrary", () => ({
  useCategories: () => ({ data: [] }),
}));

import { JobForm } from "./JobForm";
import { JobTypeCard } from "./JobTypeCard";
import { JobTypeList } from "./JobTypeList";
import { VideoToSummaryForm } from "./VideoToSummaryForm";
import { VideoToTranscriptForm } from "./VideoToTranscriptForm";

const jobType = (type: string) => ({
  type,
  label: `Label ${type}`,
  description: `Descrição ${type}`,
});

describe("VideoToTranscriptForm", () => {
  beforeEach(() => {
    mutate.mockReset();
    mutationState.isPending = false;
    mutationState.isError = false;
  });

  it("when the url is empty, should disable the submit button", () => {
    render(<VideoToTranscriptForm />);

    expect(screen.getByRole("button", { name: /criar/i })).toBeDisabled();
  });

  it("when a url is typed and submitted, should create the job with it", async () => {
    const user = userEvent.setup();
    render(<VideoToTranscriptForm />);

    await user.type(
      screen.getByLabelText("URL do vídeo"),
      "https://x.com/v.mp4",
    );
    await user.click(screen.getByRole("button", { name: /criar/i }));

    expect(mutate).toHaveBeenCalledWith(
      { url: "https://x.com/v.mp4" },
      expect.any(Object),
    );
  });

  it("when title, category and tags are filled, should send them with the url", async () => {
    const user = userEvent.setup();
    render(<VideoToTranscriptForm />);

    await user.type(
      screen.getByLabelText("URL do vídeo"),
      "https://x.com/v.mp4",
    );
    await user.type(screen.getByLabelText("Título"), "  Aula 3 ");
    await user.type(screen.getByLabelText("Categoria"), "Tecnologia");
    await user.type(screen.getByLabelText("Subcategoria"), "DevOps");
    await user.type(screen.getByLabelText("Adicionar tag"), "docker{Enter}");
    await user.click(screen.getByRole("button", { name: /criar/i }));

    expect(mutate).toHaveBeenCalledWith(
      {
        url: "https://x.com/v.mp4",
        title: "Aula 3",
        category: ["Tecnologia", "DevOps"],
        tags: ["docker"],
      },
      expect.any(Object),
    );
  });

  it("when the document fields are left empty, should not send title, category or tags", async () => {
    const user = userEvent.setup();
    render(<VideoToTranscriptForm />);

    await user.type(screen.getByLabelText("Título"), "   ");
    await user.type(
      screen.getByLabelText("URL do vídeo"),
      "https://x.com/v.mp4",
    );
    await user.click(screen.getByRole("button", { name: /criar/i }));

    expect(mutate).toHaveBeenCalledWith(
      { url: "https://x.com/v.mp4" },
      expect.any(Object),
    );
  });

  it("when the title is empty, should show the default title as placeholder", () => {
    render(<VideoToTranscriptForm />);

    expect(screen.getByLabelText("Título")).toHaveAttribute(
      "placeholder",
      "Se vazio: Transcrição de vídeo",
    );
  });

  it("when the mutation is pending, should disable the document fields too", () => {
    mutationState.isPending = true;
    render(<VideoToTranscriptForm />);

    expect(screen.getByLabelText("Título")).toBeDisabled();
    expect(screen.getByLabelText("Categoria")).toBeDisabled();
    expect(screen.getByLabelText("Adicionar tag")).toBeDisabled();
  });

  it("when the url is only whitespace, should keep the submit button disabled", async () => {
    const user = userEvent.setup();
    render(<VideoToTranscriptForm />);

    await user.type(screen.getByLabelText("URL do vídeo"), "   ");

    expect(screen.getByRole("button", { name: /criar/i })).toBeDisabled();
  });

  it("when the mutation is pending, should disable input and button", () => {
    mutationState.isPending = true;
    render(<VideoToTranscriptForm />);

    expect(screen.getByLabelText("URL do vídeo")).toBeDisabled();
    expect(screen.getByRole("button", { name: /criar/i })).toBeDisabled();
  });

  it("when the mutation fails, should show the error message", () => {
    mutationState.isError = true;
    render(<VideoToTranscriptForm />);

    expect(
      screen.getByText(/Não foi possível criar o job/),
    ).toBeInTheDocument();
  });
});

describe("VideoToSummaryForm", () => {
  beforeEach(() => {
    mutate.mockReset();
    mutationState.isPending = false;
    mutationState.isError = false;
  });

  it("when provider, model and thinking are not chosen, should keep submit disabled even with a url", async () => {
    const user = userEvent.setup();
    render(<VideoToSummaryForm />);

    await user.type(
      screen.getByLabelText("URL do vídeo"),
      "https://x.com/v.mp4",
    );

    expect(screen.getByRole("button", { name: /criar/i })).toBeDisabled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("when the mutation fails, should show the error message", () => {
    mutationState.isError = true;
    render(<VideoToSummaryForm />);

    expect(
      screen.getByText(/Não foi possível criar o job/),
    ).toBeInTheDocument();
  });

  it("when the title is empty, should show the default summary title as placeholder", () => {
    render(<VideoToSummaryForm />);

    expect(screen.getByLabelText("Título")).toHaveAttribute(
      "placeholder",
      "Se vazio: Resumo de vídeo",
    );
  });

  it("when the mutation is pending, should disable the url input", () => {
    mutationState.isPending = true;
    render(<VideoToSummaryForm />);

    expect(screen.getByLabelText("URL do vídeo")).toBeDisabled();
  });
});

describe("JobForm", () => {
  it("when type is video-to-transcript, should render the transcript form", () => {
    render(<JobForm jobType={jobType("video-to-transcript")} />);

    expect(screen.getByText(/que deseja transcrever/)).toBeInTheDocument();
  });

  it("when type is video-to-summary, should render the summary form", () => {
    render(<JobForm jobType={jobType("video-to-summary")} />);

    expect(screen.getByText(/que deseja resumir/)).toBeInTheDocument();
  });

  it("when type is unknown, should render nothing", () => {
    const { container } = render(<JobForm jobType={jobType("outro")} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("JobTypeCard / JobTypeList", () => {
  it("when the card button is clicked, should call onSelect with the job type", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const type = jobType("video-to-summary");
    render(<JobTypeCard jobType={type} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: /criar/i }));

    expect(onSelect).toHaveBeenCalledWith(type);
  });

  it("when the list is rendered, should show label and description of each type", () => {
    render(
      <JobTypeList
        jobTypes={[jobType("a"), jobType("b")]}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("Label a")).toBeInTheDocument();
    expect(screen.getByText("Descrição b")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /criar/i })).toHaveLength(2);
  });
});
