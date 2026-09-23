import { fireEvent, render, screen } from "@testing-library/react";
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
        loadingLabel="Scanning portrait"
        errorLabel="Image signal lost"
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

  it("replaces the loading scanner when the portrait loads", () => {
    renderCard();

    expect(screen.getByText("Scanning portrait")).toBeInTheDocument();
    fireEvent.load(screen.getByRole("img", { name: "Portrait of Rick Sanchez" }));
    expect(screen.queryByText("Scanning portrait")).not.toBeInTheDocument();
  });

  it("shows a distinct signal loss treatment when the portrait fails", () => {
    renderCard();

    fireEvent.error(screen.getByRole("img", { name: "Portrait of Rick Sanchez" }));
    expect(screen.getByText("Image signal lost")).toBeInTheDocument();
    expect(screen.queryByText("Scanning portrait")).not.toBeInTheDocument();
  });
});
