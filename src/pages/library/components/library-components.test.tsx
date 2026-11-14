import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

const publishState = { mutate: vi.fn(), isPending: false, isError: false };
const categoriesData = {
  data: [
    { name: "Ciência", path: ["Ciência"], count: 1, children: [] },
  ] as unknown[],
};

vi.mock("../hooks/useLibrary", () => ({
  useCategories: () => categoriesData,
  usePublishDocument: () => publishState,
}));

// O painel de sugestão tem testes próprios; aqui só interessa o preenchimento.
vi.mock("./SuggestionPanel", () => ({
  SuggestionPanel: ({
    onSuggestion,
  }: {
    onSuggestion: (suggestion: unknown) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onSuggestion({
          title: "Título sugerido",
          category: ["Física", "Ótica"],
          tags: ["luz"],
          model: "gemini-3.1-flash-lite",
        })
      }
    >
      aplicar sugestão
    </button>
  ),
}));

import type { CategoryNode, DocumentSummary } from "../types/library.types";

import { CategoryBreadcrumb } from "./CategoryBreadcrumb";
import { CategoryTree } from "./CategoryTree";
import { DocumentStatusBadge, DocumentTypeBadge } from "./DocumentBadges";
import { DocumentCard } from "./DocumentCard";
import { PublishDialog } from "./PublishDialog";

const doc = (overrides: Partial<DocumentSummary> = {}): DocumentSummary => ({
  id: "id1",
  title: "Práticas da Primeira Maneira",
  type: "summary",
  source: "video",
  status: "published",
  category: ["Ciência", "DevOps"],
  tags: ["devops", "ci"],
  createdAt: "2026-03-05T10:00:00.000Z",
  updatedAt: "2026-03-05T10:00:00.000Z",
  fileName: "praticas_id1.md",
  preview: "Resumo do conteúdo",
  ...overrides,
});

describe("DocumentTypeBadge / DocumentStatusBadge", () => {
  it.each([
    ["summary", "Resumo"],
    ["transcription", "Transcrição"],
    ["article", "Criação"],
  ] as const)("when the type is %s, should show %s", (type, label) => {
    render(<DocumentTypeBadge type={type} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each([
    ["pending", "Pendente"],
    ["published", "Na biblioteca"],
    ["archived", "Removido"],
  ] as const)("when the status is %s, should show %s", (status, label) => {
    render(<DocumentStatusBadge status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe("CategoryBreadcrumb", () => {
  it("when there is a category, should show every level in order", () => {
    render(<CategoryBreadcrumb category={["A", "B", "C"]} />);

    expect(
      screen.getByRole("navigation", { name: "Categoria" }),
    ).toHaveTextContent("ABC");
  });

  it("when the category is empty, should show Sem categoria", () => {
    render(<CategoryBreadcrumb category={[]} />);

    expect(screen.getByText("Sem categoria")).toBeInTheDocument();
  });
});

describe("DocumentCard", () => {
  const setup = (document = doc(), actions?: React.ReactNode) =>
    render(
      <MemoryRouter>
        <DocumentCard document={document} actions={actions} />
      </MemoryRouter>,
    );

  it("when rendered, should link the title to the document page", () => {
    setup();

    expect(
      screen.getByRole("link", { name: "Práticas da Primeira Maneira" }),
    ).toHaveAttribute("href", "/library/id1");
  });

  it("when rendered, should show type, category, tags, preview and date", () => {
    setup();

    expect(screen.getByText("Resumo")).toBeInTheDocument();
    expect(screen.getByText("DevOps")).toBeInTheDocument();
    expect(screen.getByText("devops")).toBeInTheDocument();
    expect(screen.getByText("ci")).toBeInTheDocument();
    expect(screen.getByText("Resumo do conteúdo")).toBeInTheDocument();
    expect(screen.getByText(/05\/03\/2026/)).toBeInTheDocument();
  });

  it("when the document has no preview, should not render an empty paragraph", () => {
    setup(doc({ preview: "" }));

    expect(screen.queryByText("Resumo do conteúdo")).not.toBeInTheDocument();
  });

  it("when matched by content, should say so", () => {
    setup(doc({ matchedIn: "content" }));

    expect(screen.getByText(/Encontrado no conteúdo/)).toBeInTheDocument();
  });

  it("when matched by metadata, should not say matched by content", () => {
    setup(doc({ matchedIn: "metadata" }));

    expect(
      screen.queryByText(/Encontrado no conteúdo/),
    ).not.toBeInTheDocument();
  });

  it("when there are more than 3 tags, should show 3 and +N", () => {
    setup(doc({ tags: ["a", "b", "c", "d", "e"] }));

    expect(screen.queryByText("d")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  describe("list variant", () => {
    const setupList = (document = doc()) =>
      render(
        <MemoryRouter>
          <DocumentCard document={document} variant="list" />
        </MemoryRouter>,
      );

    it("when rendered, should show title, type, category and date but not the preview", () => {
      setupList();

      expect(
        screen.getByRole("link", { name: "Práticas da Primeira Maneira" }),
      ).toHaveAttribute("href", "/library/id1");
      expect(screen.getByText("Resumo")).toBeInTheDocument();
      expect(screen.getByText("DevOps")).toBeInTheDocument();
      expect(screen.getByText(/05\/03\/2026/)).toBeInTheDocument();
      expect(screen.queryByText("Resumo do conteúdo")).not.toBeInTheDocument();
    });

    it("when matched by content, should say so", () => {
      setupList(doc({ matchedIn: "content" }));

      expect(screen.getByText(/Encontrado no conteúdo/)).toBeInTheDocument();
    });
  });

  it("when actions are given, should render them", () => {
    setup(doc(), <button>Descartar</button>);

    expect(
      screen.getByRole("button", { name: "Descartar" }),
    ).toBeInTheDocument();
  });
});

const tree: CategoryNode[] = [
  {
    name: "Ciência",
    path: ["Ciência"],
    count: 3,
    children: [
      {
        name: "DevOps",
        path: ["Ciência", "DevOps"],
        count: 2,
        children: [
          {
            name: "Práticas",
            path: ["Ciência", "DevOps", "Práticas"],
            count: 1,
            children: [],
          },
        ],
      },
    ],
  },
  { name: "Química", path: ["Química"], count: 1, children: [] },
];

describe("CategoryTree", () => {
  it("when rendered, should show the root categories with counts and collapsed children", () => {
    render(<CategoryTree nodes={tree} selected={[]} onSelect={() => {}} />);

    expect(screen.getByRole("button", { name: /^Ciência/ })).toHaveTextContent(
      "3",
    );
    expect(
      screen.getByRole("button", { name: /^Química/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^DevOps/ }),
    ).not.toBeInTheDocument();
  });

  it("when the expand button is clicked, should reveal the children; clicking again collapses", async () => {
    const user = userEvent.setup();
    render(<CategoryTree nodes={tree} selected={[]} onSelect={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Expandir Ciência" }));
    expect(screen.getByRole("button", { name: /^DevOps/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Recolher Ciência" }));
    expect(
      screen.queryByRole("button", { name: /^DevOps/ }),
    ).not.toBeInTheDocument();
  });

  it("when a category is clicked, should call onSelect with its full path", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CategoryTree nodes={tree} selected={[]} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Expandir Ciência" }));

    await user.click(screen.getByRole("button", { name: /^DevOps/ }));

    expect(onSelect).toHaveBeenCalledWith(["Ciência", "DevOps"]);
  });

  it("when Todas as categorias is clicked, should call onSelect with an empty path", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CategoryTree nodes={tree} selected={["Química"]} onSelect={onSelect} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Todas as categorias" }),
    );

    expect(onSelect).toHaveBeenCalledWith([]);
  });

  it("when a deep category is selected, should keep its ancestors open and mark it as current", () => {
    render(
      <CategoryTree
        nodes={tree}
        selected={["Ciência", "DevOps", "Práticas"]}
        onSelect={() => {}}
      />,
    );

    const current = screen.getByRole("button", { name: /^Práticas/ });
    expect(current).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: /^DevOps/ })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("when nothing is selected, should mark Todas as the current one", () => {
    render(<CategoryTree nodes={tree} selected={[]} onSelect={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Todas as categorias" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("when there are no categories, should still show the Todas button", () => {
    render(<CategoryTree nodes={[]} selected={[]} onSelect={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Todas as categorias" }),
    ).toBeInTheDocument();
  });
});

describe("PublishDialog", () => {
  const setup = (document: DocumentSummary | null, onOpenChange = vi.fn()) => {
    render(<PublishDialog document={document} onOpenChange={onOpenChange} />);
    return { onOpenChange, user: userEvent.setup() };
  };

  beforeEach(() => {
    publishState.mutate.mockReset();
    publishState.isPending = false;
    publishState.isError = false;
  });

  it("when there is no document, should stay closed", () => {
    setup(null);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("when a pending document is given, should open prefilled with its title and tags", () => {
    setup(doc({ status: "pending", category: [], tags: ["x"] }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Adicionar à biblioteca"),
    ).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Título")).toHaveValue(
      "Práticas da Primeira Maneira",
    );
    // A tag aparece no campo e na prévia de como vai ficar.
    expect(within(dialog).getAllByText("x")).toHaveLength(2);
    expect(
      within(dialog).getByRole("region", {
        name: "Como vai ficar na biblioteca",
      }),
    ).toBeInTheDocument();
  });

  it("when the document has no category, should keep the submit button disabled", () => {
    setup(doc({ status: "pending", category: [] }));

    expect(screen.getByRole("button", { name: "Adicionar" })).toBeDisabled();
  });

  it("when an archived document is given, should say Readicionar and prefill the category", () => {
    setup(doc({ status: "archived", category: ["Ciência", "DevOps"] }));

    expect(screen.getByText("Readicionar à biblioteca")).toBeInTheDocument();
    expect(screen.getByLabelText("Categoria")).toHaveValue("Ciência");
    expect(screen.getByLabelText("Subcategoria")).toHaveValue("DevOps");
    expect(screen.getByRole("button", { name: "Readicionar" })).toBeEnabled();
  });

  it("when a suggestion is applied, should fill title, category and tags for review", async () => {
    const { user } = setup(
      doc({ status: "pending", category: [], tags: ["x"] }),
    );

    await user.click(screen.getByRole("button", { name: "aplicar sugestão" }));

    expect(screen.getByLabelText("Título")).toHaveValue("Título sugerido");
    expect(screen.getByLabelText("Categoria")).toHaveValue("Física");
    expect(screen.getByLabelText("Subcategoria")).toHaveValue("Ótica");
    expect(screen.queryByText("x")).not.toBeInTheDocument();
    expect(screen.getAllByText("luz").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Adicionar" })).toBeEnabled();
    expect(publishState.mutate).not.toHaveBeenCalled();
  });

  it("when the title is cleared, should disable the submit button", async () => {
    const { user } = setup(doc({ status: "archived" }));

    await user.clear(screen.getByLabelText("Título"));

    expect(screen.getByRole("button", { name: "Readicionar" })).toBeDisabled();
  });

  it("when submitted, should publish with id, trimmed title, category and tags", async () => {
    const { user } = setup(doc({ status: "archived", tags: ["a"] }));

    await user.clear(screen.getByLabelText("Título"));
    await user.type(screen.getByLabelText("Título"), "  Novo título ");
    await user.click(screen.getByRole("button", { name: "Readicionar" }));

    expect(publishState.mutate).toHaveBeenCalledWith(
      {
        id: "id1",
        input: {
          title: "Novo título",
          category: ["Ciência", "DevOps"],
          tags: ["a"],
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("when the publish succeeds, should close the dialog", async () => {
    publishState.mutate.mockImplementation(
      (_variables: unknown, options: { onSuccess: () => void }) =>
        options.onSuccess(),
    );
    const { user, onOpenChange } = setup(doc({ status: "archived" }));

    await user.click(screen.getByRole("button", { name: "Readicionar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("when the publish fails, should show an error message", () => {
    publishState.isError = true;
    setup(doc({ status: "archived" }));

    expect(screen.getByText(/Não foi possível adicionar/)).toBeInTheDocument();
  });

  it("when pending, should disable the form controls", () => {
    publishState.isPending = true;
    setup(doc({ status: "archived" }));

    expect(screen.getByLabelText("Título")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Readicionar" })).toBeDisabled();
  });

  it("when cancel is clicked, should close without publishing", async () => {
    const { user, onOpenChange } = setup(doc({ status: "archived" }));

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(publishState.mutate).not.toHaveBeenCalled();
  });
});
