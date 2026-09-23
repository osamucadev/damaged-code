import { getTranslations } from "next-intl/server";

import styles from "./SiteFooter.module.css";

export async function SiteFooter() {
  const t = await getTranslations("home");

  return (
    <footer className={styles.footer}>
      <span aria-hidden="true" className={styles.line} />
      <a href="https://samuelcaetite.dev" rel="author" target="_blank">
        {t("footer")}
      </a>
      <span aria-hidden="true" className={styles.line} />
    </footer>
  );
}
