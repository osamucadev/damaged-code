import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HomePage from "./page";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        status: "ok",
        service: "damaged-code-api",
        uptime: 1,
        timestamp: "2026-09-22T20:00:00.000Z",
      }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HomePage", () => {
  it("renders the product heading", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "Damaged Code" })).toBeInTheDocument();
  });

  it("shows the API status area", async () => {
    render(<HomePage />);

    expect(
      await screen.findByRole("heading", { name: "API status" }),
    ).toBeInTheDocument();
  });
});
