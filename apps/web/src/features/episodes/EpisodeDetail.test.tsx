import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/intl";

import { EpisodeDetail } from "./EpisodeDetail";

const episodes = [
  { id: 27, code: "S03E06", name: "Rest and Ricklaxation", airDate: "August 27, 2017", characterCount: 10 },
  { id: 28, code: "S03E07", name: "The Ricklantis Mixup", airDate: "September 10, 2017", characterCount: 1 },
  { id: 29, code: "S03E08", name: "Morty's Mind Blowers", airDate: "September 17, 2017", characterCount: 20 },
];

const character = {
  id: 1,
  name: "Rick Sanchez",
  image: "https://upstream.test/avatar/1.jpeg",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  origin: "Earth (C-137)",
  location: "Citadel of Ricks",
};

function routeFetch(url: string) {
  if (url.endsWith("/health")) {
    return Promise.resolve(Response.json({ status: "ok", service: "damaged-code-api", uptime: 1, timestamp: "now" }));
  }
  if (url.endsWith("/v1/episodes/28/characters")) {
    return Promise.resolve(Response.json({ data: [character], meta: { total: 1, episodeId: 28 } }));
  }
  if (url.endsWith("/v1/episodes/28")) {
    return Promise.resolve(Response.json({ data: episodes[1] }));
  }
  return Promise.resolve(Response.json({ data: episodes, meta: { total: 3 } }));
}

function missingEpisodeFetch(url: string) {
  if (url.endsWith("/v1/episodes/9999")) {
    return Promise.resolve(
      Response.json(
        { error: { code: "EPISODE_NOT_FOUND", message: "Episode 9999 does not exist." } },
        { status: 404 },
      ),
    );
  }

  return routeFetch(url);
}

afterEach(() => vi.unstubAllGlobals());

describe("EpisodeDetail", () => {
  it("renders direct episode metadata, character data, and sequence navigation", async () => {
    vi.stubGlobal("fetch", vi.fn(routeFetch));
    renderWithIntl(<EpisodeDetail episodeId={28} />);

    expect(await screen.findByRole("heading", { name: "The Ricklantis Mixup" })).toBeInTheDocument();
    expect(screen.getByText("September 10, 2017")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Rick Sanchez" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /previous: S03E06 Rest and Ricklaxation/i })).toHaveAttribute("href", "/episodes/27");
    expect(screen.getByRole("link", { name: /next: S03E08 Morty's Mind Blowers/i })).toHaveAttribute("href", "/episodes/29");

    const current = screen.getByRole("link", { name: /open S03E07 The Ricklantis Mixup/i });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(within(current).getByText("Current")).toBeInTheDocument();
  });

  it("uses only project BFF routes for application data", async () => {
    const fetchMock = vi.fn(routeFetch);
    vi.stubGlobal("fetch", fetchMock);
    renderWithIntl(<EpisodeDetail episodeId={28} />);

    await screen.findByRole("heading", { name: "Rick Sanchez" });
    for (const [url] of fetchMock.mock.calls) {
      expect(String(url)).toContain("http://localhost:4000/");
      expect(String(url)).not.toContain("rickandmortyapi.com");
    }
  });

  it("renders a stable archive return path for an unknown episode", async () => {
    vi.stubGlobal("fetch", vi.fn(missingEpisodeFetch));
    renderWithIntl(<EpisodeDetail episodeId={9999} />);

    expect(await screen.findByText("That episode does not exist in the archive.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Episode archive" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });
});
