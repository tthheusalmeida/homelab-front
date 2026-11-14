import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

const sync = vi.fn();

vi.mock("./hooks/useLibrarySync", () => ({ useLibrarySync: () => sync() }));

import { LibraryLayout } from "./LibraryLayout";

describe("LibraryLayout", () => {
  it("when rendered, should keep the library in sync and show the child route", () => {
    render(
      <MemoryRouter initialEntries={["/library"]}>
        <Routes>
          <Route path="library" element={<LibraryLayout />}>
            <Route index element={<p>conteúdo filho</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(sync).toHaveBeenCalled();
    expect(screen.getByText("conteúdo filho")).toBeInTheDocument();
  });
});
