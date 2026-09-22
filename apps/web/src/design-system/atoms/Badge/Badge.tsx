import type { HTMLAttributes } from "react";

import styles from "./Badge.module.css";

export type BadgeTone = "display" | "accent" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** Short stamped label, such as an episode production code. */
export function Badge({ tone = "display", className, children, ...rest }: BadgeProps) {
  const classes = [styles.badge, styles[tone], className].filter(Boolean).join(" ");

  return (
    <span {...rest} className={classes}>
      {children}
    </span>
  );
}
