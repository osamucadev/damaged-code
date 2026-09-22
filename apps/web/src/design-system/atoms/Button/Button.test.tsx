import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("activates on click and on keyboard use", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Open portal</Button>);

    const button = screen.getByRole("button", { name: "Open portal" });

    await user.click(button);
    button.focus();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("defaults to a non submitting button so it is safe inside forms", () => {
    render(<Button>Open portal</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("cannot be activated while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Open portal
      </Button>,
    );

    await user.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("announces the busy state and blocks activation while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button isLoading loadingLabel="Loading episodes" onClick={onClick}>
        Open portal
      </Button>,
    );

    const button = screen.getByRole("button", { name: /open portal/i });

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Loading episodes");
  });

  it("is not marked busy when it is idle", () => {
    render(<Button>Open portal</Button>);

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
  });
});
