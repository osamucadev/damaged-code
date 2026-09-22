import type { HTMLAttributes, ReactNode } from "react";

import styles from "./CharacterCard.module.css";

export interface CharacterCardProps extends HTMLAttributes<HTMLLIElement> {
  /** Character name. Domain data, not translated. */
  name: string;
  /** Absolute portrait URL, as published by the project API. */
  image: string;
  /** Localized alternative text. The caller owns the wording. */
  imageAlt: string;
  /** Optional status presentation, such as a StatusIndicator. */
  status?: ReactNode;
  /** Property rows describing the character. Rendered inside a description list. */
  children?: ReactNode;
}

/**
 * One character in a grid.
 *
 * It renders a list item, so it must be placed inside a `ul`.
 */
export function CharacterCard({
  name,
  image,
  imageAlt,
  status,
  className,
  children,
  ...rest
}: CharacterCardProps) {
  const classes = [styles.card, className].filter(Boolean).join(" ");

  return (
    <li {...rest} className={classes}>
      {/*
        A plain image element is used on purpose. The portrait URL is part of the
        project contract, and the Next image pipeline would add a server side
        media proxy that this checkpoint does not need.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={imageAlt} className={styles.image} height={300} loading="lazy" src={image} width={300} />
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        {status}
        {children === undefined ? null : <dl className={styles.details}>{children}</dl>}
      </div>
    </li>
  );
}
