import { describe, expect, it, vi } from "vitest";

import { createEpisodeService } from "./episodes.js";

function episode(id: number) {
  return {
    id,
    code: `S01E0${id}`,
    name: `Episode ${id}`,
    airDate: "December 2, 2013",
    characterCount: 1,
  };
}

describe("createEpisodeService", () => {
  it("returns episodes in contract order regardless of upstream order", async () => {
    const client = {
      fetchAllEpisodes: vi.fn().mockResolvedValue([episode(3), episode(1), episode(2)]),
    };

    const episodes = await createEpisodeService(client).listEpisodes();

    expect(episodes.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it("passes upstream failures through so the route can map them", async () => {
    const client = {
      fetchAllEpisodes: vi.fn().mockRejectedValue(new Error("upstream down")),
    };

    await expect(createEpisodeService(client).listEpisodes()).rejects.toThrow("upstream down");
  });
});
