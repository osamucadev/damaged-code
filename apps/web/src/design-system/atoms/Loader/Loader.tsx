import type { HTMLAttributes } from "react";

import styles from "./Loader.module.css";

export interface LoaderProps extends HTMLAttributes<HTMLSpanElement> {
  /** Accessible description of what is loading. The caller owns the localized text. */
  label: string;
  /** Whether the label is shown next to the indicator or only announced. */
  showLabel?: boolean;
  size?: "small" | "medium";
}

export function Loader({
  label,
  showLabel = false,
  size = "medium",
  className,
  ...rest
}: LoaderProps) {
  const classes = [styles.loader, className].filter(Boolean).join(" ");

  return (
    <span {...rest} className={classes} role="status" aria-live="polite">
      <span aria-hidden="true" className={`${styles.gear} ${styles[size]}`} />
      <span className={showLabel ? styles.label : styles.labelHidden}>{label}</span>
    </span>
  );
}
