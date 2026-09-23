export const locales = ["en", "pt-BR"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/*
 * Cookie that carries the reader's locale choice.
 *
 * Named __session rather than a project specific name because Firebase
 * Hosting's rewrite to the Cloud Run web service only forwards that one
 * cookie name to the origin; every other cookie is stripped at the edge.
 * That is documented Firebase Hosting behavior for dynamic content, not
 * something reserved for authentication, so a small per-viewer preference
 * like locale is a legitimate use. Local Docker and a direct Cloud Run
 * request are unaffected either way, since neither goes through that edge.
 */
export const LOCALE_COOKIE = "__session";

export function isSupportedLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}
