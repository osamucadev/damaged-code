import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EpisodeListItem } from "./EpisodeListItem";

function renderItem(props: Partial<React.ComponentProps<typeof EpisodeListItem>> = {}) {
  return render(
    <ul>
      <EpisodeListItem
        code="S01E01"
        name="Pilot"
        airDate="Aired December 2, 2013"
        characters="19 characters"
        {...props}
      />
    </ul>,
  );
}

describe("EpisodeListItem", () => {
  it("presents the episode as a list item", () => {
    renderItem();

    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });

  it("shows the code, the name, and the caller's localized details", () => {
    renderItem();

    expect(screen.getByText("S01E01")).toBeInTheDocument();
    expect(screen.getByText("Pilot")).toBeInTheDocument();
    expect(screen.getByText("Aired December 2, 2013")).toBeInTheDocument();
    expect(screen.getByText("19 characters")).toBeInTheDocument();
  });

  it("keeps long titles and translated details readable", () => {
    renderItem({
      name: "The Rickshank Rickdemption and every other word of a very long title",
      airDate: "Exibido em 2 de dezembro de 2013",
      characters: "19 personagens",
    });

    expect(
      screen.getByText("The Rickshank Rickdemption and every other word of a very long title"),
    ).toBeInTheDocument();
    expect(screen.getByText("Exibido em 2 de dezembro de 2013")).toBeInTheDocument();
  });
});
