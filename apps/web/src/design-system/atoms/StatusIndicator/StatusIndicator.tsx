import type { HTMLAttributes, ReactNode } from "react";

import styles from "./StatusIndicator.module.css";

export type StatusTone = "ok" | "info" | "warning" | "danger" | "neutral";

export interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  tone: StatusTone;
  /**
   * Visible status text. It is required because color alone must never be the
   * only carrier of meaning, and because the caller owns the localized string.
   */
  children: ReactNode;
}

export function StatusIndicator({
  tone,
  className,
  children,
  ...rest
}: StatusIndicatorProps) {
  const classes = [styles.indicator, className].filter(Boolean).join(" ");

  return (
    <span {...rest} className={classes}>
      <span aria-hidden="true" className={`${styles.lamp} ${styles[tone]}`} />
      <span className={styles.label}>{children}</span>
    </span>
  );
}
