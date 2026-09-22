import { getTranslations } from "next-intl/server";

import { ApiHealthStatus } from "@/components/ApiHealthStatus";
import { EpisodeExplorer } from "@/features/episodes/EpisodeExplorer";

import styles from "./page.module.css";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </header>

      <ApiHealthStatus />
      <EpisodeExplorer />
    </main>
  );
}
