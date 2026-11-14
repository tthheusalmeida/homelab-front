import { describe, expect, it } from "vitest";

import { services } from "./services.types";

describe("services", () => {
  it("when reading the service urls, should derive them from VITE_API_URL", () => {
    const api = import.meta.env.VITE_API_URL;

    expect(services.map((service) => service.healthUrl)).toEqual([
      `${api}/health/system`,
      `${api}/health/ai`,
    ]);
  });

  it("when reading each service, should link to the same url used for the health check", () => {
    for (const service of services) {
      expect(service.url).toBe(service.healthUrl);
    }
  });
});
