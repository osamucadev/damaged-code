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

    expect(await screen.findByRole("heading", { name: "Episode archive" })).toBeInTheDocument();
  });

  it("shows the API status area", async () => {
    renderWithIntl(await HomePage());

    expect(
      await screen.findByRole("heading", { name: "API status" }),
    ).toBeInTheDocument();
  });

  it("links prominently to the source repository", async () => {
    renderWithIntl(await HomePage());

    expect(screen.getByRole("link", { name: /view on github/i })).toHaveAttribute(
      "href",
      "https://github.com/osamucadev/damaged-code",
    );
  });

  it("links to the Android release APK", async () => {
    renderWithIntl(await HomePage());

    expect(screen.getByRole("link", { name: /download android/i })).toHaveAttribute(
      "href",
      "https://github.com/osamucadev/damaged-code/releases/download/v0.1.0/damaged-code-android-v0.1.0.apk",
    );
  });

  it("links to the public Storybook", async () => {
    renderWithIntl(await HomePage());

    expect(screen.getByRole("link", { name: "Storybook" })).toHaveAttribute(
      "href",
      "https://sb.zrp.samuelcaetite.dev",
    );
  });

  it("links to the production Swagger UI", async () => {
    renderWithIntl(await HomePage());

    expect(screen.getByRole("link", { name: /swagger api/i })).toHaveAttribute(
      "href",
      "https://us-central1-samuelcaetitedev.cloudfunctions.net/damagedCodeApi/docs/#/",
    );
  });
});
