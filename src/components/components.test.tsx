import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClockAndTime } from "./ClockAndTime";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { MarkdownMessage } from "./MarkdownMessage";

describe("ErrorState", () => {
  it("when only the primary message is given, should not show secondary or action", () => {
    render(<ErrorState primaryMessage="Falhou" />);

    expect(screen.getByText("Falhou")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("when a secondary message is given, should show it", () => {
    render(<ErrorState primaryMessage="Falhou" secondaryMessage="Tente depois" />);

    expect(screen.getByText("Tente depois")).toBeInTheDocument();
  });

  it("when an action is given, should show the default label and call it on click", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(<ErrorState primaryMessage="Falhou" action={action} />);

    await user.click(screen.getByRole("button", { name: /Tentar novamente/ }));

    expect(action).toHaveBeenCalledOnce();
  });

  it("when a custom action label is given, should use it", () => {
    render(
      <ErrorState primaryMessage="x" action={() => {}} actionLabel="Recarregar" />,
    );

    expect(screen.getByRole("button", { name: /Recarregar/ })).toBeInTheDocument();
  });
});

describe("LoadingState", () => {
  it("when loading (default), should show the message and three animated dots", () => {
    render(<LoadingState message="Carregando" />);

    expect(screen.getByText("Carregando")).toBeInTheDocument();
    expect(screen.getAllByText(".")).toHaveLength(3);
  });

  it("when loading is false, should show only the message", () => {
    render(<LoadingState message="Geração cancelada" loading={false} />);

    expect(screen.getByText("Geração cancelada")).toBeInTheDocument();
    expect(screen.queryByText(".")).not.toBeInTheDocument();
  });
});

describe("MarkdownMessage", () => {
  it("when content has markdown, should render formatted elements", () => {
    render(<MarkdownMessage content={"# Título\n\n**negrito**\n\n- item"} />);

    expect(screen.getByRole("heading", { name: "Título" })).toBeInTheDocument();
    expect(screen.getByText("negrito").tagName).toBe("STRONG");
    expect(screen.getByRole("listitem")).toHaveTextContent("item");
  });

  it("when content has a GFM table, should render a table", () => {
    render(<MarkdownMessage content={"| a | b |\n|---|---|\n| 1 | 2 |"} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});

describe("ClockAndTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 30, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("when rendered, should show the current time with seconds", () => {
    render(<ClockAndTime />);

    expect(screen.getByText("10:30:15")).toBeInTheDocument();
  });

  it("when a second passes, should update the time", () => {
    render(<ClockAndTime />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("10:30:16")).toBeInTheDocument();
  });

  it("when rendered, should show the date with capitalized weekday and month", () => {
    render(<ClockAndTime />);

    expect(
      screen.getByText(/^Segunda-Feira, 5 de Janeiro de 2026$/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Segunda-Feira/)).toBeInTheDocument();
    expect(screen.getByText(/Janeiro/)).toBeInTheDocument();
  });

  it("when unmounted, should stop the interval", () => {
    const clear = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = render(<ClockAndTime />);

    unmount();

    expect(clear).toHaveBeenCalled();
  });
});
