import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PropertyRow } from "../PropertyRow/PropertyRow";

import { CharacterCard } from "./CharacterCard";

function renderCard(props: Partial<React.ComponentProps<typeof CharacterCard>> = {}) {
  return render(
    <ul>
      <CharacterCard
        name="Rick Sanchez"
        image="https://upstream.test/avatar/1.jpeg"
        imageAlt="Portrait of Rick Sanchez"
        {...props}
      />
    </ul>,
  );
}

describe("CharacterCard", () => {
  it("presents the character as a list item", () => {
    renderCard();

    expect(screen.getByRole("listitem")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rick Sanchez" })).toBeInTheDocument();
  });

  it("gives the portrait alternative text from the caller", () => {
    renderCard();

    const image = screen.getByRole("img", { name: "Portrait of Rick Sanchez" });

    expect(image).toHaveAttribute("src", "https://upstream.test/avatar/1.jpeg");
  });

  it("renders caller supplied details as a description list", () => {
    renderCard({
      children: <PropertyRow label="Species">Human</PropertyRow>,
    });

    expect(screen.getByText("Species")).toBeInTheDocument();
    expect(screen.getByText("Human")).toBeInTheDocument();
  });
});
