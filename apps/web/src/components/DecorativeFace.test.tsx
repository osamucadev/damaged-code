import { describe, expect, it } from "vitest";

import { decorativeFaceCount, selectDecorativeFace } from "./DecorativeFace";

describe("selectDecorativeFace", () => {
  it("returns the same face for the same stable context", () => {
    expect(selectDecorativeFace(28, "episode-hero")).toBe(selectDecorativeFace(28, "episode-hero"));
  });

  it("keeps every selection inside the canonical asset range", () => {
    for (let episodeId = 1; episodeId <= 51; episodeId += 1) {
      expect(selectDecorativeFace(episodeId, "episode-hero")).toBeGreaterThanOrEqual(1);
      expect(selectDecorativeFace(episodeId, "episode-hero")).toBeLessThanOrEqual(decorativeFaceCount);
    }
  });

  it("varies faces across episode ids and contexts", () => {
    const episodeFaces = new Set(
      Array.from({ length: 12 }, (_, index) => selectDecorativeFace(index + 1, "episode-hero")),
    );

    expect(episodeFaces.size).toBeGreaterThan(6);
    expect(selectDecorativeFace(1, "episode-hero")).not.toBe(selectDecorativeFace(1, "sequence-start"));
  });
});
