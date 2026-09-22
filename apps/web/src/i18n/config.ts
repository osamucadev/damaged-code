export const locales = ["en", "pt-BR"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that carries the reader's choice once the language selector exists. */
export const LOCALE_COOKIE = "damaged-code-locale";

export function isSupportedLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}
