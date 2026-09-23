import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/intl";

import { EpisodeBrowser } from "./EpisodeBrowser";

const episodes = [
  { id: 1, code: "S01E01", name: "Pilot", airDate: "December 2, 2013", characterCount: 19 },
  { id: 12, code: "S02E01", name: "A Rickle in Time", airDate: "July 26, 2015", characterCount: 12 },
];

afterEach(() => vi.unstubAllGlobals());

describe("EpisodeBrowser", () => {
  it("organizes episode links by season", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ data: episodes, meta: { total: 2 } })));

    renderWithIntl(<EpisodeBrowser />);

    expect(await screen.findByRole("link", { name: /open S01E01 Pilot/i })).toHaveAttribute(
      "href",
      "/episodes/1",
    );
    expect(screen.queryByText("A Rickle in Time")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /season 2/i }));

    expect(screen.getByRole("link", { name: /open S02E01 A Rickle in Time/i })).toHaveAttribute(
      "href",
      "/episodes/12",
    );
  });

  it("shows loading and error states", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    renderWithIntl(<EpisodeBrowser />);

    expect(screen.getByText("Loading episodes...")).toBeInTheDocument();
    expect(await screen.findByText("The episode list could not be loaded.")).toBeInTheDocument();
  });
});
