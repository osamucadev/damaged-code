import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import enMessages from "../../messages/en.json";

import { SiteFooter } from "./SiteFooter";

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: keyof typeof enMessages.home) => enMessages.home[key],
}));

describe("SiteFooter", () => {
  it("links the author signature to the portfolio", async () => {
    render(await SiteFooter());

    expect(screen.getByRole("link", { name: "With 💜 by Samuel Caetité" })).toHaveAttribute(
      "href",
      "https://samuelcaetite.dev",
    );
  });
});
