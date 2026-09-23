import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/intl";

import { EpisodeCharacters } from "./EpisodeCharacters";

const episode = {
  id: 1,
  code: "S01E01",
  name: "Pilot",
  airDate: "December 2, 2013",
  characterCount: 2,
};

const rick = {
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

const morty = { ...rick, id: 2, name: "Morty Smith" };

const detail = {
  ...rick,
  episodes: [
    { id: 1, code: "S01E01", name: "Pilot" },
    { id: 3, code: "S01E03", name: "Anatomy Park" },
  ],
};

function routeFetch(overrides: { detail?: () => Response | Promise<Response> } = {}) {
  return vi.fn((url: string) => {
    if (String(url).includes("/v1/characters/")) {
      const handler = overrides.detail ?? (() => Response.json({ data: detail }));

      return Promise.resolve(handler());
    }

    return Promise.resolve(
      Response.json({ data: [rick, morty], meta: { total: 2, episodeId: 1 } }),
    );
  });
}

async function openDossier() {
  const user = userEvent.setup();

  renderWithIntl(<EpisodeCharacters episode={episode} />);

  const card = await screen.findByRole("button", { name: /open the dossier of Rick Sanchez/i });
  await user.click(card);

  return { user, card };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("character dossier", () => {
  it("does not request character detail until a dossier is opened", async () => {
    const fetchMock = routeFetch();
    vi.stubGlobal("fetch", fetchMock);

    renderWithIntl(<EpisodeCharacters episode={episode} />);

    await screen.findByRole("heading", { name: "Rick Sanchez" });

    expect(
      fetchMock.mock.calls.every(([url]) => !String(url).includes("/v1/characters/")),
    ).toBe(true);
  });

  it("opens a dialog for the chosen character", async () => {
    vi.stubGlobal("fetch", routeFetch());

    await openDossier();

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByRole("heading", { name: "Rick Sanchez" })).toBeInTheDocument();
  });

  it("requests the detail of exactly that character", async () => {
    const fetchMock = routeFetch();
    vi.stubGlobal("fetch", fetchMock);

    await openDossier();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:4000/v1/characters/1",
        expect.objectContaining({ headers: { accept: "application/json" } }),
      );
    });
  });

  it("shows a structural skeleton with an accessible status while the detail is read", async () => {
    vi.stubGlobal("fetch", routeFetch({ detail: () => new Promise(() => {}) as never }));

    const { card } = await openDossier();
    const dialog = await screen.findByRole("dialog");

    // The header already knows the name from the card that opened it.
    expect(within(dialog).getByRole("heading", { name: "Rick Sanchez" })).toBeInTheDocument();
    expect(within(dialog).getByRole("status")).toHaveTextContent("Reading character file...");
    // Nothing from the actual character detail has arrived yet.
    expect(within(dialog).queryByText("Citadel of Ricks")).not.toBeInTheDocument();
    expect(card).toBeInTheDocument();
  });

  it("replaces the skeleton once character data arrives", async () => {
    vi.stubGlobal("fetch", routeFetch());

    await openDossier();

    const dialog = await screen.findByRole("dialog");

    await waitFor(() => {
      expect(within(dialog).getByText("Citadel of Ricks")).toBeInTheDocument();
    });
    expect(within(dialog).queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the character facts once the detail arrives", async () => {
    vi.stubGlobal("fetch", routeFetch());

    await openDossier();

    const dialog = await screen.findByRole("dialog");

    await waitFor(() => {
      expect(within(dialog).getByText("Citadel of Ricks")).toBeInTheDocument();
    });
    expect(within(dialog).getByText("Earth (C-137)")).toBeInTheDocument();
    expect(within(dialog).getByRole("img", { name: /portrait of Rick Sanchez/i })).toBeInTheDocument();
  });

  it("links a different episode appearance to the project episode page", async () => {
    vi.stubGlobal("fetch", routeFetch());

    await openDossier();

    const link = await screen.findByRole("link", { name: /Anatomy Park/ });

    expect(link).toHaveAttribute("href", "/episodes/3");
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("marks the appearance the reader is already viewing as current, without a link", async () => {
    vi.stubGlobal("fetch", routeFetch());

    await openDossier();

    const current = await screen.findByRole("button", { name: /Pilot/i });

    expect(current).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: /Pilot/ })).not.toBeInTheDocument();
  });

  it("shows an error state and recovers through retry", async () => {
    let attempt = 0;
    vi.stubGlobal(
      "fetch",
      routeFetch({
        detail: () => {
          attempt += 1;

          if (attempt === 1) {
            return Response.json(
              { error: { code: "UPSTREAM_UNAVAILABLE", message: "unavailable" } },
              { status: 502 },
            );
          }

          return Response.json({ data: detail });
        },
      }),
    );

    const { user } = await openDossier();

    expect(await screen.findByText("The character file could not be loaded.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(await screen.findByRole("link", { name: /Anatomy Park/ })).toBeInTheDocument();
  });

  it("explains a missing character with its own message", async () => {
    vi.stubGlobal(
      "fetch",
      routeFetch({
        detail: () =>
          Response.json(
            { error: { code: "CHARACTER_NOT_FOUND", message: "missing" } },
            { status: 404 },
          ),
      }),
    );

    await openDossier();

    expect(await screen.findByText("That character does not exist.")).toBeInTheDocument();
  });

  it("closes through the explicit close control and returns focus to the card", async () => {
    vi.stubGlobal("fetch", routeFetch());

    const { user, card } = await openDossier();

    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: /close the dossier/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(card).toHaveFocus();
  });

  it("closes the dossier when the current episode appearance is activated, instead of navigating", async () => {
    vi.stubGlobal("fetch", routeFetch());

    const { user, card } = await openDossier();
    await screen.findByRole("dialog");

    const current = await screen.findByRole("button", { name: /Pilot/i });

    await user.click(current);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(card).toHaveFocus();
  });

  it("closes when Escape is pressed", async () => {
    vi.stubGlobal("fetch", routeFetch());

    const { user } = await openDossier();

    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes when the backdrop is used", async () => {
    vi.stubGlobal("fetch", routeFetch());

    const { user } = await openDossier();

    await screen.findByRole("dialog");
    await user.click(screen.getByTestId("dossier-backdrop"));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("names the dialog so assistive technology announces the character", async () => {
    vi.stubGlobal("fetch", routeFetch());

    await openDossier();

    const dialog = await screen.findByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Rick Sanchez");
  });

  it("reports an empty appearance list instead of showing nothing", async () => {
    vi.stubGlobal(
      "fetch",
      routeFetch({ detail: () => Response.json({ data: { ...detail, episodes: [] } }) }),
    );

    await openDossier();

    expect(
      await screen.findByText("No episode appearances were returned for this character."),
    ).toBeInTheDocument();
  });

  it("still closes and restores focus under reduced motion, with no spatial transition", async () => {
    // A stub matchMedia is required here: jsdom has none by default, which is
    // also why the implementation treats a missing matchMedia as motion
    // allowed rather than throwing.
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    vi.stubGlobal("fetch", routeFetch());

    const { user, card } = await openDossier();
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: /close the dossier/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(card).toHaveFocus();
  });

  it("renders its own copy in Portuguese while leaving character data untranslated", async () => {
    vi.stubGlobal("fetch", routeFetch());

    const user = userEvent.setup();
    renderWithIntl(<EpisodeCharacters episode={episode} />, { locale: "pt-BR" });

    await user.click(await screen.findByRole("button", { name: /abrir o dossiê de Rick Sanchez/i }));

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText("Aparições em episódios")).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: "Rick Sanchez" })).toBeInTheDocument();
    expect(within(dialog).getByText("Citadel of Ricks")).toBeInTheDocument();
  });
});
