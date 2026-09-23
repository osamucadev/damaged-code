import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/intl";

import { LanguageSwitcher } from "./LanguageSwitcher";

function clearLocaleCookie(): void {
  document.cookie = "damaged-code-locale=; max-age=0; path=/";
}

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    clearLocaleCookie();
  });

  afterEach(() => {
    clearLocaleCookie();
    vi.unstubAllGlobals();
  });

  it("marks English as the active locale and Portuguese as available", () => {
    renderWithIntl(<LanguageSwitcher />, { locale: "en" });

    expect(screen.getByRole("button", { name: /switch to english/i })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(
      screen.getByRole("button", { name: /switch to portuguese, brazil/i }),
    ).not.toHaveAttribute("aria-current");
  });

  it("marks Portuguese as the active locale when it is selected", () => {
    renderWithIntl(<LanguageSwitcher />, { locale: "pt-BR" });

    expect(
      screen.getByRole("button", { name: /mudar para português do brasil/i }),
    ).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: /mudar para inglês/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders locale specific accessible labels, proving the switch itself is localized", () => {
    renderWithIntl(<LanguageSwitcher />, { locale: "pt-BR" });

    expect(screen.getByRole("group", { name: "Idioma" })).toBeInTheDocument();
  });

  it("writes the locale cookie when switching language", () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });

    renderWithIntl(<LanguageSwitcher />, { locale: "en" });
    fireEvent.click(screen.getByRole("button", { name: /switch to portuguese, brazil/i }));

    expect(document.cookie).toContain("damaged-code-locale=pt-BR");
  });

  it("reloads the current route in place instead of navigating elsewhere", () => {
    const reload = vi.fn();
    const currentHref = window.location.href;
    vi.stubGlobal("location", { ...window.location, reload });

    renderWithIntl(<LanguageSwitcher />, { locale: "en" });
    fireEvent.click(screen.getByRole("button", { name: /switch to portuguese, brazil/i }));

    expect(reload).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe(currentHref);
  });
});
