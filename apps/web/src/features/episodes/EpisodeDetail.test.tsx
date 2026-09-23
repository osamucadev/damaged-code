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

const firstEpisodes = [
  { id: 1, code: "S01E01", name: "Pilot", airDate: "December 2, 2013", characterCount: 0 },
  { id: 2, code: "S01E02", name: "Lawnmower Dog", airDate: "December 9, 2013", characterCount: 0 },
];

const lastEpisodes = [
  { id: 50, code: "S05E09", name: "Forgetting Sarick Mortshall", airDate: "September 5, 2021", characterCount: 0 },
  { id: 51, code: "S05E10", name: "Rickmurai Jack", airDate: "September 5, 2021", characterCount: 0 },
];

function boundaryFetch(currentId: 1 | 51) {
  const collection = currentId === 1 ? firstEpisodes : lastEpisodes;

  return (url: string) => {
    if (url.endsWith("/health")) {
      return Promise.resolve(Response.json({ status: "ok", service: "damaged-code-api", uptime: 1, timestamp: "now" }));
    }
    if (url.endsWith(`/v1/episodes/${currentId}/characters`)) {
      return Promise.resolve(Response.json({ data: [], meta: { total: 0, episodeId: currentId } }));
    }
    if (url.endsWith(`/v1/episodes/${currentId}`)) {
      return Promise.resolve(Response.json({ data: collection.find((episode) => episode.id === currentId) }));
    }
    return Promise.resolve(Response.json({ data: collection, meta: { total: collection.length } }));
  };
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

  it("uses a non-interactive boundary panel before the first episode", async () => {
    vi.stubGlobal("fetch", vi.fn(boundaryFetch(1)));
    renderWithIntl(<EpisodeDetail episodeId={1} />);

    expect(await screen.findByText("Beginning of transmission")).toBeInTheDocument();
    expect(screen.getByText("First episode file")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /previous:/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /next: S01E02 Lawnmower Dog/i })).toBeInTheDocument();
  });

  it("uses a non-interactive boundary panel after the last episode", async () => {
    vi.stubGlobal("fetch", vi.fn(boundaryFetch(51)));
    renderWithIntl(<EpisodeDetail episodeId={51} />);

    expect(await screen.findByText("End of transmission")).toBeInTheDocument();
    expect(screen.getByText("No further episode files")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /next:/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /previous: S05E09 Forgetting Sarick Mortshall/i })).toBeInTheDocument();
  });
});
