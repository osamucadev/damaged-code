import type { HTMLAttributes, ReactNode } from "react";

import { Badge } from "../../atoms/Badge/Badge";

import styles from "./EpisodeListItem.module.css";

export interface EpisodeListItemProps extends HTMLAttributes<HTMLLIElement> {
  /** Production code, such as S01E01. Domain data, not translated. */
  code: string;
  /** Episode title. Domain data, not translated. */
  name: string;
  /** Localized air date text. The caller owns the wording. */
  airDate: ReactNode;
  /** Localized character count text. The caller owns the wording. */
  characters: ReactNode;
}

/**
 * One episode in a list.
 *
 * It renders a list item, so it must be placed inside a `ul` or `ol`. Selection
 * behavior is deliberately absent: it arrives with the character slice.
 */
export function EpisodeListItem({
  code,
  name,
  airDate,
  characters,
  className,
  ...rest
}: EpisodeListItemProps) {
  const classes = [styles.item, className].filter(Boolean).join(" ");

  return (
    <li {...rest} className={classes}>
      <div className={styles.identity}>
        <Badge>{code}</Badge>
        <p className={styles.name}>{name}</p>
      </div>
      <div className={styles.meta}>
        <span>{airDate}</span>
        <span>{characters}</span>
      </div>
    </li>
  );
}
