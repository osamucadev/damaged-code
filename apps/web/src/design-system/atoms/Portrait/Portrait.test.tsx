import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Portrait, type PortraitProps } from "./Portrait";

function advanceByTime(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

function renderPortrait(props: Partial<PortraitProps> = {}) {
  return render(
    <Portrait
      key={props.src ?? "https://upstream.test/avatar/1.jpeg"}
      alt="Portrait of Rick Sanchez"
      attemptLabel={(attempt, maxAttempts) => `Attempt ${attempt} of ${maxAttempts}`}
      loadingLabel="Scanning portrait"
      lostLabel="Image signal lost"
      manualRecoveryLabel="Manual recovery required"
      recoveringLabel={(seconds) => `Recovering signal in ${seconds}...`}
      retryLabel="Retry signal"
      src="https://upstream.test/avatar/1.jpeg"
      unavailableLabel="Image signal unavailable"
      {...props}
    />,
  );
}

function image() {
  return screen.getByRole("img", { name: "Portrait of Rick Sanchez" });
}

describe("Portrait", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the loading scanner, then the loaded portrait, on a normal successful load", () => {
    renderPortrait();

    expect(screen.getByText("Scanning portrait")).toBeInTheDocument();

    fireEvent.load(image());

    expect(screen.queryByText("Scanning portrait")).not.toBeInTheDocument();
    expect(screen.queryByText("Image signal lost")).not.toBeInTheDocument();
  });

  it("enters recovery with a three second countdown when the initial load fails", () => {
    renderPortrait();

    fireEvent.error(image());

    expect(screen.getByText("Image signal lost")).toBeInTheDocument();
    expect(screen.getByText("Recovering signal in 3...")).toBeInTheDocument();
    expect(screen.getByText("Attempt 1 of 2")).toBeInTheDocument();
  });

  it("counts the recovery countdown down and retries the image once it reaches zero", () => {
    renderPortrait();
    fireEvent.error(image());

    advanceByTime(1000);
    expect(screen.getByText("Recovering signal in 2...")).toBeInTheDocument();

    advanceByTime(1000);
    expect(screen.getByText("Recovering signal in 1...")).toBeInTheDocument();

    advanceByTime(1000);

    // The retry is in flight: back to the plain loading scanner, no recovery copy.
    expect(screen.getByText("Scanning portrait")).toBeInTheDocument();
    expect(screen.queryByText("Image signal lost")).not.toBeInTheDocument();
  });

  it("moves to attempt 2 when the first automatic retry also fails", () => {
    renderPortrait();
    fireEvent.error(image());
    advanceByTime(3000);

    fireEvent.error(image());

    expect(screen.getByText("Attempt 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Recovering signal in 3...")).toBeInTheDocument();
  });

  it("settles on the manual recovery state once the second automatic retry also fails", () => {
    renderPortrait();
    fireEvent.error(image());
    advanceByTime(3000);
    fireEvent.error(image());
    advanceByTime(3000);

    fireEvent.error(image());

    expect(screen.getByText("Image signal unavailable")).toBeInTheDocument();
    expect(screen.getByText("Manual recovery required")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry signal" })).toBeInTheDocument();
    expect(screen.queryByText(/attempt/i)).not.toBeInTheDocument();
  });

  it("starts a fresh recovery cycle when the manual retry control is activated", () => {
    renderPortrait();
    fireEvent.error(image());
    advanceByTime(3000);
    fireEvent.error(image());
    advanceByTime(3000);
    fireEvent.error(image());

    fireEvent.click(screen.getByRole("button", { name: "Retry signal" }));

    expect(screen.getByText("Scanning portrait")).toBeInTheDocument();

    fireEvent.error(image());

    // A fresh cycle: back to attempt 1, not a continuation of the exhausted cycle.
    expect(screen.getByText("Attempt 1 of 2")).toBeInTheDocument();
  });

  it("cancels the remaining recovery work when a retry succeeds", () => {
    renderPortrait();
    fireEvent.error(image());
    advanceByTime(3000);

    fireEvent.load(image());

    expect(screen.queryByText("Image signal lost")).not.toBeInTheDocument();
    expect(screen.queryByText("Scanning portrait")).not.toBeInTheDocument();

    // No further ticks should resurrect the countdown.
    advanceByTime(5000);
    expect(screen.queryByText(/recovering signal/i)).not.toBeInTheDocument();
  });

  it("stops pending recovery timers on unmount without warning", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { unmount } = renderPortrait();

    fireEvent.error(image());
    unmount();

    expect(() => advanceByTime(10000)).not.toThrow();
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("resets the recovery lifecycle when the caller remounts with a new image source", () => {
    const { rerender } = renderPortrait({ src: "https://upstream.test/avatar/1.jpeg" });
    fireEvent.error(image());
    expect(screen.getByText("Attempt 1 of 2")).toBeInTheDocument();

    rerender(
      <Portrait
        key="https://upstream.test/avatar/2.jpeg"
        alt="Portrait of Morty Smith"
        attemptLabel={(attempt, maxAttempts) => `Attempt ${attempt} of ${maxAttempts}`}
        loadingLabel="Scanning portrait"
        lostLabel="Image signal lost"
        manualRecoveryLabel="Manual recovery required"
        recoveringLabel={(seconds) => `Recovering signal in ${seconds}...`}
        retryLabel="Retry signal"
        src="https://upstream.test/avatar/2.jpeg"
        unavailableLabel="Image signal unavailable"
      />,
    );

    expect(screen.getByText("Scanning portrait")).toBeInTheDocument();
    expect(screen.queryByText(/attempt/i)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Portrait of Morty Smith" })).toBeInTheDocument();
  });

  it("keeps the real image invisible until it loads, instead of exposing the browser's broken image state", () => {
    renderPortrait();

    expect(image()).not.toHaveClass("imageLoaded");

    fireEvent.error(image());

    // The failed image stays out of view; the themed fallback is what is shown.
    expect(image()).not.toHaveClass("imageLoaded");
    const recovering = screen.getByText("Image signal lost").closest("div");
    expect(recovering).toHaveAttribute("aria-hidden", "true");
  });

  it("never schedules a third automatic retry beyond the two allowed attempts", () => {
    renderPortrait();
    fireEvent.error(image());
    advanceByTime(3000);
    fireEvent.error(image());
    advanceByTime(3000);
    fireEvent.error(image());

    expect(screen.getByText("Image signal unavailable")).toBeInTheDocument();

    // Advancing time from the unavailable state must not start another countdown.
    advanceByTime(10000);
    expect(screen.getByText("Image signal unavailable")).toBeInTheDocument();
    expect(screen.queryByText(/recovering signal/i)).not.toBeInTheDocument();
  });

  it("throttles the accessible announcement to real transitions, not every countdown tick", () => {
    renderPortrait();
    fireEvent.error(image());

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Image signal lost Attempt 1 of 2");

    advanceByTime(1000);
    // Same attempt, still ticking: the announcement text does not change.
    expect(within(status).getByText("Image signal lost Attempt 1 of 2")).toBeInTheDocument();
  });

  it("ignores real image events while a preview state is controlling the display", () => {
    renderPortrait({ previewState: "loaded" });

    fireEvent.error(image());

    expect(screen.queryByText("Image signal lost")).not.toBeInTheDocument();
  });
});
