import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/intl";

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
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(healthPayload)));

    renderWithIntl(<ApiHealthStatus />);

    expect(await screen.findByText("Online")).toBeInTheDocument();
    expect(
      screen.getByText("The project API answered the health check."),
    ).toBeInTheDocument();
    expect(screen.getByText("damaged-code-api")).toBeInTheDocument();
  });

  it("reports that the API is unreachable when the health call fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));

    renderWithIntl(<ApiHealthStatus />);

    expect(await screen.findByText("Unreachable")).toBeInTheDocument();
    expect(screen.getByText("connection refused")).toBeInTheDocument();
  });

  it("queries the project BFF instead of an external service", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(healthPayload));
    vi.stubGlobal("fetch", fetchMock);

    renderWithIntl(<ApiHealthStatus />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:4000/health",
        expect.objectContaining({ cache: "no-store" }),
      );
    });
  });

  it("checks the API again when the user asks for a new check", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("connection refused"))
      .mockResolvedValue(Response.json(healthPayload));
    vi.stubGlobal("fetch", fetchMock);

    renderWithIntl(<ApiHealthStatus />);

    expect(await screen.findByText("Unreachable")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /check again/i }));

    expect(await screen.findByText("Online")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("renders its strings in Portuguese when that locale is active", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(healthPayload)));

    renderWithIntl(<ApiHealthStatus />, { locale: "pt-BR" });

    expect(await screen.findByText("Online")).toBeInTheDocument();
    expect(
      screen.getByText("A API do projeto respondeu à verificação de saúde."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verificar novamente/i })).toBeInTheDocument();
  });

  it("always shows which endpoint it is reporting on", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(healthPayload)));

    renderWithIntl(<ApiHealthStatus />);

    expect(
      await screen.findByText("http://localhost:4000/health"),
    ).toBeInTheDocument();
  });
});
