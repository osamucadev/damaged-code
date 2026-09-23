import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithIntl } from "@/test/intl";

import { EpisodeNavigator } from "./EpisodeNavigator";

const episodes = [
  { id: 1, code: "S01E01", name: "Pilot", airDate: "December 2, 2013", characterCount: 19 },
  { id: 12, code: "S02E01", name: "A Rickle in Time", airDate: "July 26, 2015", characterCount: 16 },
];

describe("EpisodeNavigator", () => {
  it("exposes a compact disclosure without changing native episode links", () => {
    renderWithIntl(<EpisodeNavigator currentEpisode={episodes[0]!} episodes={episodes} />);

    const toggle = screen.getByRole("button", { name: "Browse episodes" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Close navigator" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Open S01E01 Pilot" })).toHaveAttribute("aria-current", "page");
  });

  it("switches seasons through native pressed buttons", () => {
    renderWithIntl(<EpisodeNavigator currentEpisode={episodes[0]!} episodes={episodes} />);

    const secondSeason = screen.getByRole("button", { name: "02" });
    fireEvent.click(secondSeason);

    expect(secondSeason).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Open S02E01 A Rickle in Time" })).toBeInTheDocument();
  });
});
