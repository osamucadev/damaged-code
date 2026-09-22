import type { HTMLAttributes, ReactNode } from "react";

import { Badge } from "../../atoms/Badge/Badge";

import styles from "./EpisodeListItem.module.css";

export interface EpisodeListItemProps extends HTMLAttributes<HTMLLIElement> {
  /** Makes the whole row a control. Without it the row is static content. */
  onSelect?: () => void;
  /** Whether this row is the selected one. Only meaningful with onSelect. */
  isSelected?: boolean;
  /** Accessible description of the control, provided localized by the caller. */
  selectLabel?: string;
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
  onSelect,
  isSelected = false,
  selectLabel,
  className,
  ...rest
}: EpisodeListItemProps) {
  const classes = [
    styles.item,
    onSelect !== undefined ? styles.selectable : undefined,
    isSelected ? styles.selected : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div className={styles.identity}>
        <Badge tone={isSelected ? "accent" : "display"}>{code}</Badge>
        <p className={styles.name}>{name}</p>
      </div>
      <div className={styles.meta}>
        <span>{airDate}</span>
        <span>{characters}</span>
      </div>
    </>
  );

  return (
    <li {...rest} className={classes}>
      {onSelect === undefined ? (
        content
      ) : (
        <button
          aria-label={selectLabel}
          aria-pressed={isSelected}
          className={styles.trigger}
          onClick={onSelect}
          type="button"
        >
          {content}
        </button>
      )}
    </li>
  );
}
