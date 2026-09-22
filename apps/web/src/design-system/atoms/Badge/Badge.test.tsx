import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("shows its content as readable text", () => {
    render(<Badge>S01E01</Badge>);

    expect(screen.getByText("S01E01")).toBeInTheDocument();
  });

  it("forwards accessibility attributes to the caller's markup", () => {
    render(<Badge aria-label="Episode code S01E01">S01E01</Badge>);

    expect(screen.getByLabelText("Episode code S01E01")).toBeInTheDocument();
  });
});
