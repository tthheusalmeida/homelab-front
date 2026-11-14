import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const suggestState = { mutate: vi.fn(), isPending: false, isError: false };
const modelsState: { data?: { id: string; label: string }[] } = {};

vi.mock("../hooks/useLibrary", () => ({
  useSuggestClassification: () => suggestState,
}));

vi.mock("../../ai/chat/hooks/useAiModels", () => ({
  useAiModels: () => modelsState,
}));

import { SuggestionPanel } from "./SuggestionPanel";

const suggestion = {
  title: "Novo",
  category: ["A", "B"],
  tags: ["x"],
  model: "gemini-3.1-flash-lite",
};

describe("SuggestionPanel", () => {
  const setup = (disabled = false) => {
    const onSuggestion = vi.fn();

    render(
      <SuggestionPanel
        documentId="id1"
        onSuggestion={onSuggestion}
        disabled={disabled}
      />,
    );

    return { onSuggestion, user: userEvent.setup() };
  };

  beforeEach(() => {
    suggestState.mutate.mockReset();
    suggestState.isPending = false;
    suggestState.isError = false;
    modelsState.data = [{ id: "gemini-3.5-flash", label: "Gemini 3.5 Flash" }];
  });

  it("when clicked with the default model, should ask for a suggestion without a model id", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: "Sugerir com IA" }));

    expect(suggestState.mutate).toHaveBeenCalledWith(
      { id: "id1", modelId: undefined },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("when the default model is shown, should label it as the cheapest", () => {
    setup();

    expect(screen.getByText("Mais barato (automático)")).toBeInTheDocument();
  });

  it("when the suggestion arrives, should hand it over and say which model was used", async () => {
    suggestState.mutate.mockImplementation(
      (_variables: unknown, options: { onSuccess: (s: unknown) => void }) =>
        options.onSuccess(suggestion),
    );
    const { user, onSuggestion } = setup();

    await user.click(screen.getByRole("button", { name: "Sugerir com IA" }));

    expect(onSuggestion).toHaveBeenCalledWith(suggestion);
    expect(
      screen.getByText("Sugestão preenchida com gemini-3.1-flash-lite."),
    ).toBeInTheDocument();
  });

  it("when the request fails, should show an error message", () => {
    suggestState.isError = true;
    setup();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível obter a sugestão",
    );
  });

  it("when the request is pending, should disable the button", () => {
    suggestState.isPending = true;
    setup();

    expect(screen.getByRole("button", { name: "Sugerir com IA" })).toBeDisabled();
  });

  it("when disabled, should disable the button", () => {
    setup(true);

    expect(screen.getByRole("button", { name: "Sugerir com IA" })).toBeDisabled();
  });

  it("when the models are still loading, should still offer the automatic option", () => {
    modelsState.data = undefined;
    setup();

    expect(screen.getByText("Mais barato (automático)")).toBeInTheDocument();
  });
});
