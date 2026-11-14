import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("../api/services", () => ({ checkService: vi.fn() }));

import { createWrapper } from "../../../test/utils";
import { checkService } from "../api/services";
import { services } from "../types/services.types";

import { useSystemHealth } from "./useSystemHealth";

const check = (status: "ok" | "error") => ({
  service: "s",
  description: "d",
  status,
});

function mockChecks(checks: ReturnType<typeof check>[]) {
  vi.mocked(checkService).mockResolvedValue({
    service: "x",
    description: "d",
    checks,
  });
}

function render() {
  return renderHook(() => useSystemHealth(), { wrapper: createWrapper() });
}

describe("useSystemHealth", () => {
  beforeEach(() => {
    vi.mocked(checkService).mockReset();
  });

  it("when mounted, should query every configured service health url", async () => {
    mockChecks([]);

    render();

    await waitFor(() =>
      expect(checkService).toHaveBeenCalledTimes(services.length),
    );
    for (const service of services) {
      expect(checkService).toHaveBeenCalledWith(service.healthUrl);
    }
  });

  it("when every check is ok, should report all online", async () => {
    mockChecks([check("ok"), check("ok")]);

    const { result } = render();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current).toMatchObject({
      total: services.length * 2,
      online: services.length * 2,
      offline: 0,
      allOnline: true,
      allOffline: false,
      hasOffline: false,
    });
  });

  it("when every check is error, should report all offline", async () => {
    mockChecks([check("error")]);

    const { result } = render();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current).toMatchObject({
      allOnline: false,
      allOffline: true,
      hasOffline: true,
    });
  });

  it("when checks are mixed, should be neither all online nor all offline", async () => {
    mockChecks([check("ok"), check("error")]);

    const { result } = render();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.allOnline).toBe(false);
    expect(result.current.allOffline).toBe(false);
    expect(result.current.hasOffline).toBe(true);
  });

  it("when every service request fails, should report zero checks and not all online", async () => {
    vi.mocked(checkService).mockRejectedValue(new Error("down"));

    const { result } = render();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current).toMatchObject({
      total: 0,
      services: [],
      allOnline: false,
      allOffline: false,
    });
  });
});
