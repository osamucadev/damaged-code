import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { defaultLocale, isSupportedLocale, LOCALE_COOKIE } from "./config";

/*
 * Locale resolution for the App Router.
 *
 * There is no locale prefixed routing yet. The reader's locale comes from a
 * cookie and falls back to English. The language selector and the full
 * localization work belong to the internationalization checkpoint. What exists
 * here is enough for every new product string to live in a message catalog
 * instead of being hardcoded in a component.
 */
export default getRequestConfig(async () => {
  const store = await cookies();
  const requested = store.get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
