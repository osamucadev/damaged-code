import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement, ReactNode } from "react";

import enMessages from "../../messages/en.json";
import ptMessages from "../../messages/pt-BR.json";
import type { Locale } from "@/i18n/config";

const messagesByLocale: Record<Locale, typeof enMessages> = {
  en: enMessages,
  "pt-BR": ptMessages,
};

export interface RenderWithIntlOptions extends Omit<RenderOptions, "wrapper"> {
  locale?: Locale;
}

/**
 * Renders a component with the real message catalogs, so tests exercise the
 * strings the product ships instead of invented fixtures.
 */
export function renderWithIntl(
  ui: ReactElement,
  { locale = "en", ...options }: RenderWithIntlOptions = {},
): RenderResult {
  /*
   * Retries are disabled so a failing request reaches the error state
   * immediately instead of making tests wait for a retry schedule.
   */
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={messagesByLocale[locale]}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NextIntlClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
