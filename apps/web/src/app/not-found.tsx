import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { DisplaySurface } from "@/design-system";

import styles from "./not-found.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");

  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const home = await getTranslations("home");

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.wordmark} href="/" aria-label={home("title")}>
          <span className={styles.wordmarkIcon}>DC</span>
          <span>{home("title")}</span>
        </Link>
      </header>

      <div className={styles.statePage}>
        <DisplaySurface className={styles.state} tone="danger">
          <p aria-hidden="true" className={styles.code}>
            404
          </p>
          <h1 className={styles.heading}>{t("title")}</h1>
          <p className={styles.description}>{t("description")}</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/">
              {t("returnHome")}
            </Link>
            <a
              className={styles.secondary}
              href="https://github.com/osamucadev/damaged-code"
              rel="noreferrer"
              target="_blank"
            >
              {t("github")}
            </a>
          </div>
        </DisplaySurface>
      </div>
    </main>
  );
}
