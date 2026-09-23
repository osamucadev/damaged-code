import type { HTMLAttributes, ReactNode } from "react";

import styles from "./EpisodeBoundaryCard.module.css";

export interface EpisodeBoundaryCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  title: string;
  side: "previous" | "next";
  decoration?: ReactNode;
}

export function EpisodeBoundaryCard({
  label,
  title,
  side,
  decoration,
  className,
  ...rest
}: EpisodeBoundaryCardProps) {
  const classes = [styles.boundary, styles[side], className].filter(Boolean).join(" ");

  return (
    <div {...rest} className={classes}>
      <span className={styles.label}>{label}</span>
      <strong>{title}</strong>
      {decoration === undefined ? null : <span className={styles.decoration}>{decoration}</span>}
    </div>
  );
}
