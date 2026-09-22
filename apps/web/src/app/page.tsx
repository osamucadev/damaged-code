import { ApiHealthStatus } from "@/components/ApiHealthStatus";

import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Damaged Code</h1>
        <p className={styles.subtitle}>A Rick and Morty coding challenge.</p>
      </header>

      <ApiHealthStatus />
    </main>
  );
}
