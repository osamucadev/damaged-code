import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchApiHealth, getApiBaseUrl } from "./api";

describe("getApiBaseUrl", () => {
  const originalValue = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalValue;
  });

  it("falls back to the documented local API address", () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    expect(getApiBaseUrl()).toBe("http://localhost:4000");
  });

  it("removes a trailing slash so paths are not doubled", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://api.example.com/";

    expect(getApiBaseUrl()).toBe("http://api.example.com");
  });
});

describe("fetchApiHealth", () => {
  it("rejects when the API answers with an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("boom", { status: 503 })),
    );

    await expect(fetchApiHealth()).rejects.toThrow("503");

    vi.unstubAllGlobals();
  });
});
