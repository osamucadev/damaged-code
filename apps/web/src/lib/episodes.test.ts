import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, fetchEpisodes } from "./episodes";

const episode = {
  id: 1,
  code: "S01E01",
  name: "Pilot",
  airDate: "December 2, 2013",
  characterCount: 19,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchEpisodes", () => {
  it("requests the episode list from the project BFF", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ data: [episode], meta: { total: 1 } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchEpisodes()).resolves.toEqual([episode]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/v1/episodes",
      expect.objectContaining({ headers: { accept: "application/json" } }),
    );
  });

  it("surfaces the stable error code from the project error envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({ error: { code: "UPSTREAM_UNAVAILABLE", message: "down" } }, { status: 502 }),
      ),
    );

    await expect(fetchEpisodes()).rejects.toMatchObject({ code: "UPSTREAM_UNAVAILABLE" });
  });

  it("falls back to a generic code when the error body is not the project envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("gateway timeout", { status: 504 })),
    );

    await expect(fetchEpisodes()).rejects.toMatchObject({ code: "REQUEST_FAILED" });
  });

  it("rejects a payload that does not match the contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ data: [{ id: 1, name: "Pilot" }] })),
    );

    await expect(fetchEpisodes()).rejects.toBeInstanceOf(ApiError);
  });
});
