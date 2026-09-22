import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DisplaySurface } from "./DisplaySurface";

describe("DisplaySurface", () => {
  it("renders its content and forwards accessibility attributes", () => {
    render(
      <DisplaySurface aria-label="Episode readout" tone="warning">
        <p>C-137</p>
      </DisplaySurface>,
    );

    const surface = screen.getByLabelText("Episode readout");

    expect(surface).toBeInTheDocument();
    expect(screen.getByText("C-137")).toBeInTheDocument();
  });
});
