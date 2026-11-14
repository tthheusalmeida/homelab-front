import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

type QueryState = {
  data?: unknown;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

const documents: QueryState = {
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};
const categories: QueryState = { ...documents, data: [] };
const tags: QueryState = { ...documents, data: [] };
const useDocumentsSpy = vi.fn();

vi.mock("./hooks/useLibrary", () => ({
  useDocuments: (filters: unknown) => {
    useDocumentsSpy(filters);
    return documents;
  },
  useCategories: () => categories,
  useTags: () => tags,
}));

// Select nativo no lugar do select do base-ui, para poder escolher opções.
vi.mock("#components/OptionSelect", () => ({
  OptionSelect: ({
    value,
    options,
    label,
    placeholder,
    onValueChange,
  }: {
    value?: string;
    options: { id: string; label: string }[];
    label?: string;
    placeholder: string;
    onValueChange: (value: string) => void;
  }) => (
    <select
      aria-label={label ?? placeholder}
      value={value ?? ""}
      onChange={(event) => onValueChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

import { LibraryPage, initialCategory } from "./LibraryPage";

const doc = (id: string, title: string) => ({
  id,
  title,
  type: "summary",
  source: "video",
  status: "published",
  category: ["Ciência"],
  tags: [],
  createdAt: "2026-03-05T10:00:00.000Z",
  updatedAt: "2026-03-05T10:00:00.000Z",
  fileName: `${id}.md`,
  preview: "",
});

const lastFilters = () =>
  useDocumentsSpy.mock.calls[
    useDocumentsSpy.mock.calls.length - 1
  ][0] as Record<string, unknown>;

const renderPage = () =>
  render(
    <MemoryRouter>
      <LibraryPage />
    </MemoryRouter>,
  );

describe("initialCategory", () => {
  it.each([
    [{ category: ["A", "B"] }, ["A", "B"]],
    [{ category: "A" }, []],
    [{ category: [1] }, []],
    [null, []],
    [undefined, []],
  ])("when the state is %j, should return %j", (state, expected) => {
    expect(initialCategory(state)).toEqual(expected);
  });
});

describe("LibraryPage", () => {
  beforeEach(() => {
    Object.assign(documents, {
      data: [doc("1", "Docker"), doc("2", "Kubernetes")],
      isLoading: false,
      isError: false,
    });
    categories.data = [
      { name: "Ciência", path: ["Ciência"], count: 2, children: [] },
    ];
    tags.data = [{ tag: "devops", count: 2 }];
    vi.mocked(documents.refetch).mockReset();
    useDocumentsSpy.mockClear();
    window.localStorage.clear();
  });

  it("when opened with a category in the navigation state, should filter by it", () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/library", state: { category: ["Ciência"] } },
        ]}
      >
        <LibraryPage />
      </MemoryRouter>,
    );

    expect(lastFilters().category).toEqual(["Ciência"]);
  });

  it("when rendered, should keep the search field compact beside the filters", () => {
    renderPage();

    const search = screen.getByLabelText("Pesquisar na biblioteca...");

    expect(search.parentElement).toHaveClass("sm:w-64");
  });

  it("when documents are loading, should show the loading state", () => {
    documents.isLoading = true;
    renderPage();

    expect(screen.getByText("Carregando")).toBeInTheDocument();
  });

  it("when loading fails, should show the error and retry on demand", async () => {
    documents.isError = true;
    const user = userEvent.setup();
    renderPage();

    expect(
      screen.getByText(/falha ao carregar a biblioteca/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Tentar novamente/ }));

    expect(documents.refetch).toHaveBeenCalledOnce();
  });

  it("when there are documents, should list them with the total", () => {
    renderPage();

    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
    expect(screen.getByText("2 página(s)")).toBeInTheDocument();
  });

  it("when the library is empty and there are no filters, should invite going to the inbox", () => {
    documents.data = [];
    renderPage();

    expect(screen.getByText("A biblioteca está vazia")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ir para a Entrada/ }),
    ).toHaveAttribute("href", "/library/inbox");
  });

  it("when a search has no results, should say so and offer to clear the filters", async () => {
    documents.data = [];
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: "Todas as categorias" }),
    );
    await user.click(screen.getByRole("button", { name: /^Ciência/ }));

    expect(screen.getByText("Nenhum resultado encontrado")).toBeInTheDocument();
    expect(
      screen.queryByText("A biblioteca está vazia"),
    ).not.toBeInTheDocument();
  });

  it("when the first render happens, should query without filters and sorted by title", () => {
    renderPage();

    expect(lastFilters()).toEqual({
      q: "",
      category: [],
      type: undefined,
      source: undefined,
      tags: [],
      sort: "title",
    });
  });

  it("when text is typed, should query by it after the debounce", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByRole("searchbox"), "docker");

    await waitFor(() => expect(lastFilters().q).toBe("docker"));
  });

  it("when a type is chosen, should filter by it; choosing all clears it", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText("Tipo"), "transcription");
    expect(lastFilters().type).toBe("transcription");

    await user.selectOptions(screen.getByLabelText("Tipo"), "all");
    expect(lastFilters().type).toBeUndefined();
  });

  it("when a source is chosen, should filter by it", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText("Origem"), "manual");

    expect(lastFilters().source).toBe("manual");
  });

  it("when the sort changes, should query with the new order", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText("Ordenar por"), "recent");

    expect(lastFilters().sort).toBe("recent");
  });

  it("when a tag is clicked, should filter by it; clicking again removes it", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /devops/ }));
    expect(lastFilters().tags).toEqual(["devops"]);
    expect(screen.getByRole("button", { name: /devops/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: /devops/ }));
    expect(lastFilters().tags).toEqual([]);
  });

  it("when a category is selected in the tree, should filter by its path", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /^Ciência/ }));

    expect(lastFilters().category).toEqual(["Ciência"]);
  });

  it("when filters are active, should show Limpar filtros and reset everything", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(
      screen.queryByRole("button", { name: "Limpar filtros" }),
    ).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Tipo"), "summary");
    await user.click(screen.getByRole("button", { name: /devops/ }));
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(lastFilters()).toMatchObject({
      type: undefined,
      source: undefined,
      tags: [],
      category: [],
    });
  });

  it("when opened, should list the documents in the compact list view", () => {
    renderPage();

    expect(screen.getByRole("button", { name: "Lista" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("when another view is chosen, should switch the layout and remember it", async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();

    await user.click(screen.getByRole("button", { name: "Grade" }));
    unmount();
    renderPage();

    expect(screen.getByRole("button", { name: "Grade" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("when there are many tags, should show only the most used with a +N tags button", () => {
    tags.data = Array.from({ length: 12 }, (_, index) => ({
      tag: `t${index}`,
      count: 20 - index,
    }));
    renderPage();

    expect(screen.getByRole("button", { name: "+4 tags" })).toBeInTheDocument();
  });

  it("when there are no tags, should not render the tag filter", () => {
    tags.data = [];
    renderPage();

    expect(screen.queryByLabelText("Filtrar por tag")).not.toBeInTheDocument();
  });
});
