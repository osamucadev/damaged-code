import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EpisodeBoundaryCard } from "./EpisodeBoundaryCard";

describe("EpisodeBoundaryCard", () => {
  it("presents an informational boundary without pretending to be a link", () => {
    render(
      <EpisodeBoundaryCard
        label="Beginning of transmission"
        side="previous"
        title="First episode file"
      />,
    );

    expect(screen.getByText("Beginning of transmission")).toBeInTheDocument();
    expect(screen.getByText("First episode file")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
