import type { HTMLAttributes, ReactNode } from "react";

import styles from "./Panel.module.css";

/*
 * The native title attribute is omitted on purpose. The panel title is rendered
 * content, not a browser tooltip.
 */
export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Optional panel title. The caller owns the localized text. */
  title?: ReactNode;
  /** Heading level, so the panel fits the document outline of its page. */
  headingLevel?: 2 | 3 | 4;
  /** Optional content aligned to the end of the panel header. */
  headerAction?: ReactNode;
  tone?: "panel" | "raised";
  /** Decorative hardware detail. Purely visual. */
  withScrews?: boolean;
}

export function Panel({
  title,
  headingLevel = 2,
  headerAction,
  tone = "panel",
  withScrews = false,
  className,
  children,
  ...rest
}: PanelProps) {
  const Heading = `h${headingLevel}` as const;
  const classes = [styles.panel, tone === "raised" ? styles.raised : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <section {...rest} className={classes}>
      {withScrews ? (
        <>
          <span aria-hidden="true" className={`${styles.screw} ${styles.screwTopLeft}`} />
          <span aria-hidden="true" className={`${styles.screw} ${styles.screwTopRight}`} />
          <span
            aria-hidden="true"
            className={`${styles.screw} ${styles.screwBottomLeft}`}
          />
          <span
            aria-hidden="true"
            className={`${styles.screw} ${styles.screwBottomRight}`}
          />
        </>
      ) : null}

      {title !== undefined || headerAction !== undefined ? (
        <div className={styles.header}>
          {title !== undefined ? <Heading className={styles.title}>{title}</Heading> : null}
          {headerAction}
        </div>
      ) : null}

      {children}
    </section>
  );
}
