import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "../../atoms/Badge/Badge";

import styles from "./EpisodeLinkCard.module.css";

export interface EpisodeLinkCardProps {
  href: string;
  code: string;
  name: string;
  meta: ReactNode;
  current?: boolean;
  currentLabel?: string;
  label: string;
}

export function EpisodeLinkCard({
  href,
  code,
  name,
  meta,
  current = false,
  currentLabel,
  label,
}: EpisodeLinkCardProps) {
  return (
    <li className={styles.item}>
      <Link
        aria-current={current ? "page" : undefined}
        aria-label={label}
        className={`${styles.link} ${current ? styles.current : ""}`}
        href={href}
      >
        <span className={styles.topline}>
          <Badge tone={current ? "accent" : "display"}>{code}</Badge>
          {current && currentLabel !== undefined ? (
            <span className={styles.currentLabel}>{currentLabel}</span>
          ) : null}
        </span>
        <strong className={styles.name}>{name}</strong>
        <span className={styles.meta}>{meta}</span>
      </Link>
    </li>
  );
}
