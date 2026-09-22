import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

describe("EpisodeListItem selection", () => {
  it("is static content when no selection handler is given", () => {
    renderItem();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("becomes a real button when it can be selected", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderItem({ onSelect, selectLabel: "Show characters of Pilot" });

    const control = screen.getByRole("button", { name: "Show characters of Pilot" });

    await user.click(control);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("can be operated with the keyboard", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderItem({ onSelect });

    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();

    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("exposes the selected state to assistive technology", () => {
    renderItem({ onSelect: vi.fn(), isSelected: true });

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("reports an unselected row as not pressed", () => {
    renderItem({ onSelect: vi.fn() });

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });
});
