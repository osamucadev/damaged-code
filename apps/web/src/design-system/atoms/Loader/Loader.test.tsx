import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Loader } from "./Loader";

describe("Loader", () => {
  it("announces what is loading through a live region", () => {
    render(<Loader label="Loading episodes" />);

    const status = screen.getByRole("status");

    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Loading episodes");
  });

  it("can show the label visually as well", () => {
    render(<Loader label="Loading episodes" showLabel />);

    expect(screen.getByText("Loading episodes")).toBeVisible();
  });
});
