import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EpisodeLinkCard } from "./EpisodeLinkCard";

describe("EpisodeLinkCard", () => {
  it("links to the episode and exposes the current page state", () => {
    render(
      <ul>
        <EpisodeLinkCard
          code="S03E07"
          current
          currentLabel="Current"
          href="/episodes/28"
          label="Open The Ricklantis Mixup"
          meta="40 characters"
          name="The Ricklantis Mixup"
        />
      </ul>,
    );

    expect(screen.getByRole("link", { name: "Open The Ricklantis Mixup" })).toHaveAttribute(
      "href",
      "/episodes/28",
    );
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });
});
