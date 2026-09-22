import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/intl";

import { EpisodeExplorer } from "./EpisodeExplorer";

const episodes = [
  { id: 1, code: "S01E01", name: "Pilot", airDate: "December 2, 2013", characterCount: 2 },
  {
    id: 2,
    code: "S01E02",
    name: "Lawnmower Dog",
    airDate: "December 9, 2013",
    characterCount: 1,
  },
];

function character(id: number, name: string, status = "Alive") {
  return {
    id,
    name,
    image: `https://upstream.test/avatar/${id}.jpeg`,
    status,
    species: "Human",
    type: "",
    gender: "Male",
    origin: "Earth (C-137)",
    location: "Citadel of Ricks",
  };
}

/** Characters arrive already alphabetical, because the BFF owns that rule. */
const charactersForEpisodeOne = [
  character(3, "Abradolf Lincler"),
  character(2, "Morty Smith", "unknown"),
  character(1, "Rick Sanchez"),
];

function routeFetch(handlers: {
  episodes?: () => Response | Promise<Response>;
  characters?: (episodeId: string) => Response | Promise<Response>;
}) {
  return vi.fn((url: string) => {
    const charactersMatch = /\/v1\/episodes\/(\d+)\/characters$/.exec(url);

    if (charactersMatch) {
      const handler =
        handlers.characters ??
        (() => Response.json({ data: charactersForEpisodeOne, meta: { total: 3, episodeId: 1 } }));

      return Promise.resolve(handler(charactersMatch[1] as string));
    }

    const handler =
      handlers.episodes ??
      (() => Response.json({ data: episodes, meta: { total: episodes.length } }));

    return Promise.resolve(handler());
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("EpisodeExplorer", () => {
  it("invites the reader to choose an episode before anything is selected", async () => {
    vi.stubGlobal("fetch", routeFetch({}));

    renderWithIntl(<EpisodeExplorer />);

    expect(await screen.findByText("Pilot")).toBeInTheDocument();
    expect(
      screen.getByText("Select an episode to see the characters who appear in it."),
    ).toBeInTheDocument();
  });

  it("does not request characters until an episode is selected", async () => {
    const fetchMock = routeFetch({});
    vi.stubGlobal("fetch", fetchMock);

    renderWithIntl(<EpisodeExplorer />);

    await screen.findByText("Pilot");

    expect(fetchMock.mock.calls.every(([url]) => !String(url).includes("/characters"))).toBe(true);
  });

  it("loads and renders the characters of the selected episode", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", routeFetch({}));

    renderWithIntl(<EpisodeExplorer />);

    await user.click(await screen.findByRole("button", { name: /show the characters of Pilot/i }));

    expect(await screen.findByRole("heading", { name: "Rick Sanchez" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Abradolf Lincler" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Portrait of Rick Sanchez" })).toHaveAttribute(
      "src",
      "https://upstream.test/avatar/1.jpeg",
    );
  });

  it("presents characters in the order the contract returned, without sorting them again", async () => {
    const user = userEvent.setup();
    // Deliberately not alphabetical, to prove the client does not reorder.
    vi.stubGlobal(
      "fetch",
      routeFetch({
        characters: () =>
          Response.json({
            data: [character(1, "Zephyr"), character(2, "Alpha")],
            meta: { total: 2, episodeId: 1 },
          }),
      }),
    );

    renderWithIntl(<EpisodeExplorer />);

    await user.click(await screen.findByRole("button", { name: /show the characters of Pilot/i }));

    await screen.findByRole("heading", { name: "Zephyr" });

    const names = screen.getAllByRole("heading", { level: 3 }).map((node) => node.textContent);

    expect(names).toEqual(["Zephyr", "Alpha"]);
  });

  it("shows a loading state while the characters are requested", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", routeFetch({ characters: () => new Promise(() => {}) as never }));

    renderWithIntl(<EpisodeExplorer />);

    await user.click(await screen.findByRole("button", { name: /show the characters of Pilot/i }));

    expect(await screen.findByText("Loading characters...")).toBeInTheDocument();
  });

  it("marks the selected episode for assistive technology", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", routeFetch({}));

    renderWithIntl(<EpisodeExplorer />);

    const pilot = await screen.findByRole("button", { name: /show the characters of Pilot/i });

    expect(pilot).toHaveAttribute("aria-pressed", "false");

    await user.click(pilot);

    await waitFor(() => {
      expect(pilot).toHaveAttribute("aria-pressed", "true");
    });
    expect(
      screen.getByRole("button", { name: /show the characters of Lawnmower Dog/i }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("requests the characters of the episode the reader selected", async () => {
    const user = userEvent.setup();
    const fetchMock = routeFetch({});
    vi.stubGlobal("fetch", fetchMock);

    renderWithIntl(<EpisodeExplorer />);

    await user.click(
      await screen.findByRole("button", { name: /show the characters of Lawnmower Dog/i }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:4000/v1/episodes/2/characters",
        expect.objectContaining({ headers: { accept: "application/json" } }),
      );
    });
  });

  it("talks only to the project BFF", async () => {
    const user = userEvent.setup();
    const fetchMock = routeFetch({});
    vi.stubGlobal("fetch", fetchMock);

    renderWithIntl(<EpisodeExplorer />);

    await user.click(await screen.findByRole("button", { name: /show the characters of Pilot/i }));
    await screen.findByRole("heading", { name: "Rick Sanchez" });

    for (const [url] of fetchMock.mock.calls) {
      expect(String(url)).toContain("http://localhost:4000/");
      expect(String(url)).not.toContain("rickandmortyapi.com");
    }
  });

  it("shows an empty state when the episode has no characters", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      routeFetch({
        characters: () => Response.json({ data: [], meta: { total: 0, episodeId: 1 } }),
      }),
    );

    renderWithIntl(<EpisodeExplorer />);

    await user.click(await screen.findByRole("button", { name: /show the characters of Pilot/i }));

    expect(
      await screen.findByText("This episode has no characters in the project API."),
    ).toBeInTheDocument();
  });

  it("shows an error state and recovers through retry", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    vi.stubGlobal(
      "fetch",
      routeFetch({
        characters: () => {
          attempt += 1;

          if (attempt === 1) {
            return Response.json(
              { error: { code: "UPSTREAM_UNAVAILABLE", message: "down" } },
              { status: 502 },
            );
          }

          return Response.json({ data: charactersForEpisodeOne, meta: { total: 3, episodeId: 1 } });
        },
      }),
    );

    renderWithIntl(<EpisodeExplorer />);

    await user.click(await screen.findByRole("button", { name: /show the characters of Pilot/i }));

    expect(await screen.findByText("The characters could not be loaded.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(await screen.findByRole("heading", { name: "Rick Sanchez" })).toBeInTheDocument();
  });

  it("explains a missing episode with its own message", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      routeFetch({
        characters: () =>
          Response.json(
            { error: { code: "EPISODE_NOT_FOUND", message: "Episode 1 does not exist." } },
            { status: 404 },
          ),
      }),
    );

    renderWithIntl(<EpisodeExplorer />);

    await user.click(await screen.findByRole("button", { name: /show the characters of Pilot/i }));

    expect(await screen.findByText("That episode does not exist.")).toBeInTheDocument();
  });

  it("localizes its own copy while leaving character data untranslated", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", routeFetch({}));

    renderWithIntl(<EpisodeExplorer />, { locale: "pt-BR" });

    await user.click(
      await screen.findByRole("button", { name: /mostrar os personagens de Pilot/i }),
    );

    const card = (await screen.findByRole("heading", { name: "Rick Sanchez" })).closest("li");

    expect(screen.getByText("Personagens")).toBeInTheDocument();
    expect(within(card as HTMLElement).getByText("Espécie")).toBeInTheDocument();
    expect(within(card as HTMLElement).getByText("Human")).toBeInTheDocument();
  });
});
