import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { ApiHealthStatus } from "@/components/ApiHealthStatus";
import { DecorativeFace } from "@/components/DecorativeFace";
import { EpisodeBrowser } from "@/features/episodes/EpisodeBrowser";

import styles from "./page.module.css";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.wordmark} href="/" aria-label={t("title")}>
          <span className={styles.wordmarkIcon}>DC</span>
          <span>{t("title")}</span>
        </Link>
        <ApiHealthStatus />
      </header>

      <section className={styles.hero}>
        <DecorativeFace className={styles.faceLeft} face={1} size="large" />
        <DecorativeFace className={styles.faceRight} face={12} size="medium" />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
          <p className={styles.intro}>{t("intro")}</p>
          <div className={styles.ctaRow}>
            <a
              className={styles.github}
              href="https://github.com/osamucadev/damaged-code"
              rel="noreferrer"
              target="_blank"
            >
              <span aria-hidden="true" className={styles.githubMark}>↗</span>
              <span>
                <strong>{t("github")}</strong>
                <small>{t("githubHint")}</small>
              </span>
            </a>
            <a
              className={styles.android}
              href="https://github.com/osamucadev/damaged-code/releases/download/v0.1.0/damaged-code-android-v0.1.0.apk"
              rel="noreferrer"
              target="_blank"
            >
              <span aria-hidden="true" className={styles.androidMark}>↓</span>
              <span>
                <strong>{t("android")}</strong>
                <small>{t("androidHint")}</small>
              </span>
            </a>
          </div>
          <div className={styles.technicalResources}>
            <span className={styles.technicalLabel}>{t("technicalResources")}</span>
            <a
              className={styles.technicalLink}
              href="https://sb.zrp.samuelcaetite.dev"
              rel="noreferrer"
              target="_blank"
            >
              {t("storybook")}
            </a>
            <a
              className={styles.technicalLink}
              href="https://us-central1-samuelcaetitedev.cloudfunctions.net/damagedCodeApi/docs/#/"
              rel="noreferrer"
              target="_blank"
            >
              {t("swagger")}
            </a>
          </div>
        </div>
        <div aria-hidden="true" className={styles.monitor}>
          <span className={styles.scanline} />
          <span className={styles.monitorLabel}>ARCHIVE // 51</span>
          <span className={styles.signal}>SIGNAL LOCKED</span>
        </div>
      </section>

      <EpisodeBrowser />
    </main>
  );
}
