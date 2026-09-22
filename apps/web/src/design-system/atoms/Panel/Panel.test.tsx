import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Panel } from "./Panel";

describe("Panel", () => {
  it("exposes its title at the requested heading level", () => {
    render(
      <Panel title="Episode browser" headingLevel={3}>
        <p>Content</p>
      </Panel>,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Episode browser" }),
    ).toBeInTheDocument();
  });

  it("renders without a header when no title or action is given", () => {
    render(
      <Panel>
        <p>Content</p>
      </Panel>,
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("keeps decorative hardware away from assistive technology", () => {
    const { container } = render(
      <Panel withScrews title="Machine">
        <p>Content</p>
      </Panel>,
    );

    const decorations = container.querySelectorAll('[aria-hidden="true"]');

    expect(decorations).toHaveLength(4);
  });
});
