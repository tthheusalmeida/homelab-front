import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

type QueryState = {
  data?: unknown[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

const pending: QueryState = {
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};
const archived: QueryState = { ...pending };
const indexStatus = { data: { total: 0, errors: [] as unknown[] } };
const discard = { mutate: vi.fn(), isPending: false, isError: false };
const reindex = { mutate: vi.fn(), isPending: false };
const useDocumentsSpy = vi.fn();

vi.mock("./hooks/useLibrary", () => ({
  useInbox: () => pending,
  useDocuments: (filters: unknown) => {
    useDocumentsSpy(filters);
    return archived;
  },
  useIndexStatus: () => indexStatus,
  useDiscardDocument: () => discard,
  useReindex: () => reindex,
}));

// O diálogo de publicação tem testes próprios; aqui só interessa a ligação.
vi.mock("./components/PublishDialog", () => ({
  PublishDialog: ({
    document,
    onOpenChange,
  }: {
    document: { title: string } | null;
    onOpenChange: (open: boolean) => void;
  }) =>
    document ? (
      <div role="dialog">
        publicar:{document.title}
        <button onClick={() => onOpenChange(false)}>fechar</button>
      </div>
    ) : null,
}));

import { InboxPage } from "./InboxPage";

const doc = (id: string, title: string, status = "pending") => ({
  id,
  title,
  type: "transcription",
  source: "video",
  status,
  category: [],
  tags: [],
  createdAt: "2026-03-05T10:00:00.000Z",
  updatedAt: "2026-03-05T10:00:00.000Z",
  fileName: `${id}.md`,
  preview: "",
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <InboxPage />
    </MemoryRouter>,
  );

describe("InboxPage", () => {
  beforeEach(() => {
    Object.assign(pending, {
      data: [doc("1", "Transcrição A"), doc("2", "Resumo B")],
      isLoading: false,
      isError: false,
    });
    Object.assign(archived, {
      data: [doc("3", "Antigo C", "archived")],
      isLoading: false,
      isError: false,
    });
    indexStatus.data = { total: 0, errors: [] };
    discard.mutate.mockReset();
    discard.isError = false;
    reindex.mutate.mockReset();
    reindex.isPending = false;
    useDocumentsSpy.mockClear();
  });

  it("when opened, should list the archived documents with status archived", () => {
    renderPage();

    expect(useDocumentsSpy).toHaveBeenCalledWith({ status: "archived" });
  });

  it("when there are pending documents, should list them with counters on the tabs", () => {
    renderPage();

    expect(screen.getByText("Transcrição A")).toBeInTheDocument();
    expect(screen.getByText("Resumo B")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Pendentes (2)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Removidos (1)" }),
    ).toBeInTheDocument();
  });

  it("when loading, should show the loading state", () => {
    pending.isLoading = true;
    renderPage();

    expect(screen.getByText("Carregando")).toBeInTheDocument();
  });

  it("when loading fails, should show the error and retry on demand", async () => {
    pending.isError = true;
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Tentar novamente/ }));

    expect(pending.refetch).toHaveBeenCalledOnce();
  });

  it("when nothing is pending, should show the empty state with a link to create jobs", () => {
    pending.data = [];
    renderPage();

    expect(screen.getByText("Nada aguardando decisão")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Criar job/ })).toHaveAttribute(
      "href",
      "/jobs/create",
    );
  });

  it("when the removed tab is chosen, should list the archived documents", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Removidos/ }));

    expect(screen.getByText("Antigo C")).toBeInTheDocument();
    expect(screen.queryByText("Transcrição A")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Readicionar/ }),
    ).toBeInTheDocument();
  });

  it("when nothing was removed, should show its own empty state", async () => {
    archived.data = [];
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Removidos/ }));

    expect(screen.getByText("Nenhuma página removida")).toBeInTheDocument();
  });

  it("when add is clicked on a pending document, should open the publish dialog for it", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getAllByRole("button", { name: /Adicionar à biblioteca/ })[0],
    );

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "publicar:Transcrição A",
    );
  });

  it("when the publish dialog is closed, should hide it", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(
      screen.getAllByRole("button", { name: /Adicionar à biblioteca/ })[0],
    );

    await user.click(screen.getByRole("button", { name: "fechar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("when discard is clicked, should ask for confirmation naming the document", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole("button", { name: /Descartar/ })[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Descartar página?")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Transcrição A");
    expect(discard.mutate).not.toHaveBeenCalled();
  });

  it("when discard is confirmed, should discard that document", async () => {
    discard.mutate.mockImplementation(
      (_id: string, options: { onSuccess: () => void }) => options.onSuccess(),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getAllByRole("button", { name: /Descartar/ })[0]);

    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Descartar",
      }),
    );

    expect(discard.mutate).toHaveBeenCalledWith("1", expect.any(Object));
    await waitFor(() =>
      expect(screen.queryByText("Descartar página?")).not.toBeInTheDocument(),
    );
  });

  it("when discard is cancelled, should keep the document", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getAllByRole("button", { name: /Descartar/ })[0]);

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(discard.mutate).not.toHaveBeenCalled();
  });

  it("when discard fails, should show an error message", () => {
    discard.isError = true;
    renderPage();

    expect(screen.getByText(/Não foi possível descartar/)).toBeInTheDocument();
  });

  it("when Reindexar is clicked, should rebuild the index", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Reindexar/ }));

    expect(reindex.mutate).toHaveBeenCalledOnce();
  });

  it("when reindexing, should disable the button", () => {
    reindex.isPending = true;
    renderPage();

    expect(screen.getByRole("button", { name: /Reindexar/ })).toBeDisabled();
  });

  it("when some files could not be indexed, should list them in an alert", () => {
    indexStatus.data = {
      total: 1,
      errors: [{ file: "ruim_id9.md", message: "Documento sem frontmatter." }],
    };
    renderPage();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("1 arquivo(s) não puderam ser lidos");
    expect(alert).toHaveTextContent("ruim_id9.md");
    expect(alert).toHaveTextContent("Documento sem frontmatter.");
  });

  it("when every file was indexed, should not show the alert", () => {
    renderPage();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
