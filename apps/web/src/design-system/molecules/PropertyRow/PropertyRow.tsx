import type { HTMLAttributes, ReactNode } from "react";

import styles from "./PropertyRow.module.css";

export interface PropertyRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Name of the property. The caller owns the localized text. */
  label: ReactNode;
  /** Value of the property. */
  children: ReactNode;
}

/**
 * One labelled property of an object, such as a character species or an origin.
 *
 * It renders a description list pair, so it must be placed inside a `dl`.
 */
export function PropertyRow({ label, className, children, ...rest }: PropertyRowProps) {
  const classes = [styles.row, className].filter(Boolean).join(" ");

  return (
    <div {...rest} className={classes}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  );
}
