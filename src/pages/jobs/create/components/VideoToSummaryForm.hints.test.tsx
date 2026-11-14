import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mutate = vi.fn();

vi.mock("../hooks/useCreateVideoToSummary", () => ({
  useCreateVideoToSummary: () => ({
    mutate,
    isPending: false,
    isError: false,
  }),
}));
vi.mock("../../../ai/chat/hooks/useAiProviders", () => ({
  useAiProviders: () => ({
    data: [{ id: "gemini", label: "Gemini" }],
    isLoading: false,
  }),
}));
vi.mock("../../../ai/chat/hooks/useAiModels", () => ({
  useAiModels: () => ({
    data: [{ id: "m1", label: "Modelo 1" }],
    isLoading: false,
  }),
}));
vi.mock("../../../ai/chat/hooks/useAiThinking", () => ({
  useAiThinking: () => ({
    data: [{ id: "off", label: "Desativado" }],
    isLoading: false,
  }),
}));
vi.mock("../../../library/hooks/useLibrary", () => ({
  useCategories: () => ({ data: [] }),
}));

// O select real é do Base UI; aqui basta um select nativo para escolher.
vi.mock("#components/OptionSelect", () => ({
  OptionSelect: ({
    placeholder,
    options,
    value,
    disabled,
    onValueChange,
  }: {
    placeholder: string;
    options: { id: string; label: string }[];
    value?: string;
    disabled?: boolean;
    onValueChange: (value: string | null) => void;
  }) => (
    <select
      aria-label={placeholder}
      value={value ?? ""}
      disabled={disabled}
      onChange={(event) => onValueChange(event.target.value || null)}
    >
      <option value="">-</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

import { VideoToSummaryForm } from "./VideoToSummaryForm";

async function chooseModel(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText("Provedor"), "gemini");
  await user.selectOptions(screen.getByLabelText("Modelo"), "m1");
  await user.selectOptions(screen.getByLabelText("Thinking"), "off");
}

describe("VideoToSummaryForm — document fields", () => {
  beforeEach(() => mutate.mockReset());

  it("when title, category and tags are filled, should send them with the model choice", async () => {
    const user = userEvent.setup();
    render(<VideoToSummaryForm />);

    await user.type(
      screen.getByLabelText("URL do vídeo"),
      "https://x.com/v.mp4",
    );
    await chooseModel(user);
    await user.type(screen.getByLabelText("Título"), "Práticas");
    await user.type(screen.getByLabelText("Categoria"), "Tecnologia");
    await user.type(screen.getByLabelText("Adicionar tag"), "devops{Enter}");
    await user.click(screen.getByRole("button", { name: /criar/i }));

    expect(mutate).toHaveBeenCalledWith(
      {
        url: "https://x.com/v.mp4",
        providerId: "gemini",
        modelId: "m1",
        thinking: "off",
        detail: "detailed",
        title: "Práticas",
        category: ["Tecnologia"],
        tags: ["devops"],
      },
      expect.any(Object),
    );
  });

  it("when the document fields are empty, should send only url and model choice", async () => {
    const user = userEvent.setup();
    render(<VideoToSummaryForm />);

    await user.type(
      screen.getByLabelText("URL do vídeo"),
      "https://x.com/v.mp4",
    );
    await chooseModel(user);
    await user.click(screen.getByRole("button", { name: /criar/i }));

    expect(mutate).toHaveBeenCalledWith(
      {
        url: "https://x.com/v.mp4",
        providerId: "gemini",
        modelId: "m1",
        thinking: "off",
        detail: "detailed",
      },
      expect.any(Object),
    );
  });

  it("when a detail level is chosen, should send it", async () => {
    const user = userEvent.setup();
    render(<VideoToSummaryForm />);

    await user.type(
      screen.getByLabelText("URL do vídeo"),
      "https://x.com/v.mp4",
    );
    await chooseModel(user);
    await user.selectOptions(
      screen.getByLabelText("Nível de detalhe"),
      "study",
    );
    await user.click(screen.getByRole("button", { name: /criar/i }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ detail: "study" }),
      expect.any(Object),
    );
  });

  it("when opened, should start on Detalhado and describe the chosen level", async () => {
    const user = userEvent.setup();
    render(<VideoToSummaryForm />);

    expect(screen.getByLabelText("Nível de detalhe")).toHaveValue("detailed");
    expect(
      screen.getByText(/Mantém conceitos, explicações/),
    ).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText("Nível de detalhe"),
      "brief",
    );

    expect(screen.getByText(/Só as ideias essenciais/)).toBeInTheDocument();
  });
});
