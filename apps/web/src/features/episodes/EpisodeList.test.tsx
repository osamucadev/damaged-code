import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/intl";

import { EpisodeList } from "./EpisodeList";

const episodes = [
  { id: 1, code: "S01E01", name: "Pilot", airDate: "December 2, 2013", characterCount: 19 },
  {
    id: 2,
    code: "S01E02",
    name: "Lawnmower Dog",
    airDate: "December 9, 2013",
    characterCount: 21,
  },
];

function listResponse(data: typeof episodes) {
  return Response.json({ data, meta: { total: data.length } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("EpisodeList", () => {
  it("shows a loading state while the episodes are requested", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(new Promise(() => {})),
    );

    renderWithIntl(<EpisodeList />);

    expect(screen.getByText("Loading episodes...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading episodes");
  });

  it("renders every episode returned by the BFF", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(listResponse(episodes)));

    renderWithIntl(<EpisodeList />);

    expect(await screen.findByText("Pilot")).toBeInTheDocument();
    expect(screen.getByText("Lawnmower Dog")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("S01E01")).toBeInTheDocument();
    expect(screen.getByText("Aired December 2, 2013")).toBeInTheDocument();
    expect(screen.getByText("19 characters")).toBeInTheDocument();
    expect(screen.getByText("2 episodes")).toBeInTheDocument();
  });

  it("shows an empty state when the contract returns no episodes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(listResponse([])));

    renderWithIntl(<EpisodeList />);

    expect(
      await screen.findByText("No episodes were returned by the project API."),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("shows an error state when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    renderWithIntl(<EpisodeList />);

    expect(
      await screen.findByText("The episode list could not be loaded."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("loads the episodes again when the reader retries", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValue(listResponse(episodes));
    vi.stubGlobal("fetch", fetchMock);

    renderWithIntl(<EpisodeList />);

    const retry = await screen.findByRole("button", { name: /try again/i });

    await user.click(retry);

    expect(await screen.findByText("Pilot")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByText("The episode list could not be loaded."),
      ).not.toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("consumes only the project BFF", async () => {
    const fetchMock = vi.fn().mockResolvedValue(listResponse(episodes));
    vi.stubGlobal("fetch", fetchMock);

    renderWithIntl(<EpisodeList />);

    await screen.findByText("Pilot");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://localhost:4000/v1/episodes");
    expect(fetchMock.mock.calls[0]?.[0]).not.toContain("rickandmortyapi.com");
  });

  it("renders its own strings in Portuguese while leaving episode data untranslated", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(listResponse(episodes)));

    renderWithIntl(<EpisodeList />, { locale: "pt-BR" });

    // Wait for loaded content, because the panel title is present while loading too.
    expect(await screen.findByText("Pilot")).toBeInTheDocument();
    expect(screen.getByText("Episódios")).toBeInTheDocument();
    expect(screen.getByText("2 episódios")).toBeInTheDocument();
    expect(screen.getByText("Exibido em December 2, 2013")).toBeInTheDocument();
    expect(screen.getByText("19 personagens")).toBeInTheDocument();
    // Domain data stays as published upstream.
    expect(screen.getByText("Pilot")).toBeInTheDocument();
  });

  it("stops showing the loading state once the episodes arrive", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(listResponse(episodes)));

    renderWithIntl(<EpisodeList />);

    await waitForElementToBeRemoved(() => screen.queryByText("Loading episodes..."));

    expect(screen.getByText("Pilot")).toBeInTheDocument();
  });
});
