import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusIndicator } from "./StatusIndicator";

describe("StatusIndicator", () => {
  it("always exposes the status as text, never as color alone", () => {
    render(<StatusIndicator tone="danger">Unreachable</StatusIndicator>);

    expect(screen.getByText("Unreachable")).toBeInTheDocument();
  });

  it("hides the decorative lamp from assistive technology", () => {
    const { container } = render(<StatusIndicator tone="ok">Online</StatusIndicator>);

    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
    expect(screen.getByText("Online")).toBeInTheDocument();
  });
});
