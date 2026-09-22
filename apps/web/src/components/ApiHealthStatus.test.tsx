import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiHealthStatus } from "./ApiHealthStatus";

const healthPayload = {
  status: "ok",
  service: "damaged-code-api",
  uptime: 12.5,
  timestamp: "2026-09-22T20:00:00.000Z",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ApiHealthStatus", () => {
  it("reports that the API is reachable when the health call succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json(healthPayload)),
    );

    render(<ApiHealthStatus />);

    expect(screen.getByRole("status")).toHaveTextContent("Checking the API...");

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "API reachable: damaged-code-api",
      );
    });
  });

  it("reports that the API is unreachable when the health call fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connection refused")),
    );

    render(<ApiHealthStatus />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "API unreachable: connection refused",
      );
    });
  });

  it("queries the project BFF instead of an external service", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(healthPayload));
    vi.stubGlobal("fetch", fetchMock);

    render(<ApiHealthStatus />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:4000/health",
        expect.objectContaining({ cache: "no-store" }),
      );
    });
  });
});
