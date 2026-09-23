import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import enMessages from "../../messages/en.json";
import { renderWithIntl } from "@/test/intl";

import NotFound from "./not-found";

vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: "notFound" | "home") =>
    (key: keyof (typeof enMessages)[typeof namespace]) => enMessages[namespace][key],
}));

describe("NotFound", () => {
  it("renders a branded heading rather than a generic error page", async () => {
    renderWithIntl(await NotFound());

    expect(
      screen.getByRole("heading", { level: 1, name: "404 // Signal lost" }),
    ).toBeInTheDocument();
  });

  it("links the primary action back to the archive", async () => {
    renderWithIntl(await NotFound());

    expect(screen.getByRole("link", { name: /return to archive/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("keeps the GitHub link as a secondary action", async () => {
    renderWithIntl(await NotFound());

    expect(screen.getByRole("link", { name: /view on github/i })).toHaveAttribute(
      "href",
      "https://github.com/osamucadev/damaged-code",
    );
  });
});
