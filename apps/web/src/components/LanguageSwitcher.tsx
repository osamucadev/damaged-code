"use client";

import { useLocale, useTranslations } from "next-intl";

import { LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";

import styles from "./LanguageSwitcher.module.css";

const labelKeyByLocale: Record<Locale, "english" | "portuguese"> = {
  en: "english",
  "pt-BR": "portuguese",
};

const codeByLocale: Record<Locale, string> = {
  en: "EN",
  "pt-BR": "PT",
};

function setLocale(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  window.location.reload();
}

export function LanguageSwitcher() {
  const t = useTranslations("language");
  const active = useLocale() as Locale;

  return (
    <div aria-label={t("label")} className={styles.switcher} role="group">
      {locales.map((locale) => {
        const isActive = locale === active;

        return (
          <button
            aria-current={isActive ? "true" : undefined}
            aria-label={t("switchTo", { language: t(labelKeyByLocale[locale]) })}
            className={styles.option}
            disabled={isActive}
            key={locale}
            onClick={() => setLocale(locale)}
            type="button"
          >
            {codeByLocale[locale]}
          </button>
        );
      })}
    </div>
  );
}
