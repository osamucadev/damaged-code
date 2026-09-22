import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import enMessages from "../../messages/en.json";
import { renderWithIntl } from "@/test/intl";

import HomePage from "./page";

/*
 * The page is a server component, so the server side translation boundary is
 * replaced with the real English catalog.
 */
vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: "home") => (key: keyof typeof enMessages.home) =>
    enMessages[namespace][key],
}));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        status: "ok",
        service: "damaged-code-api",
        uptime: 1,
        timestamp: "2026-09-22T20:00:00.000Z",
      }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HomePage", () => {
  it("renders the product heading", async () => {
    renderWithIntl(await HomePage());

    expect(screen.getByRole("heading", { name: "Damaged Code" })).toBeInTheDocument();
  });

  it("shows the episode explorer", async () => {
    renderWithIntl(await HomePage());

    expect(await screen.findByRole("heading", { name: "Episodes" })).toBeInTheDocument();
  });

  it("shows the API status area", async () => {
    renderWithIntl(await HomePage());

    expect(
      await screen.findByRole("heading", { name: "API status" }),
    ).toBeInTheDocument();
  });
});
