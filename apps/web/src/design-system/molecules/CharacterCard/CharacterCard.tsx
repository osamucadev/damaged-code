import type { HTMLAttributes, ReactNode } from "react";

import { Portrait, type PortraitPreviewState } from "../../atoms/Portrait/Portrait";

import styles from "./CharacterCard.module.css";

export interface CharacterCardProps extends HTMLAttributes<HTMLLIElement> {
  /** Character name. Domain data, not translated. */
  name: string;
  /** Absolute portrait URL, as published by the project API. */
  image: string;
  /** Localized alternative text. The caller owns the wording. */
  imageAlt: string;
  /** Localized label shown while the official portrait is loading. */
  loadingLabel: string;
  /** Localized headline shown as soon as a portrait load attempt fails. */
  lostLabel: string;
  /** Builds the localized countdown line from the seconds remaining. */
  recoveringLabel: (secondsRemaining: number) => string;
  /** Builds the localized attempt line from the attempt number and the max. */
  attemptLabel: (attempt: number, maxAttempts: number) => string;
  /** Localized headline shown once both automatic retries are exhausted. */
  unavailableLabel: string;
  /** Localized subtitle under the unavailable headline. */
  manualRecoveryLabel: string;
  /** Localized label and accessible name of the manual retry control. */
  retryLabel: string;
  /** Controlled portrait state for documentation and deterministic previews. */
  previewState?: PortraitPreviewState;
  /**
   * Makes the whole card open something. Without it the card is static.
   *
   * Receives the control that was activated, so a caller can visually connect
   * whatever opens to this card's position, such as a dossier growing out of
   * it.
   */
  onOpen?: (origin: HTMLButtonElement) => void;
  /** Localized accessible name of the card control. Required with onOpen. */
  selectLabel?: string;
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
  loadingLabel,
  lostLabel,
  recoveringLabel,
  attemptLabel,
  unavailableLabel,
  manualRecoveryLabel,
  retryLabel,
  previewState,
  onOpen,
  selectLabel,
  status,
  className,
  children,
  ...rest
}: CharacterCardProps) {
  const classes = [styles.card, onOpen === undefined ? undefined : styles.selectable, className]
    .filter(Boolean)
    .join(" ");

  return (
    <li {...rest} className={classes}>
      {/*
        The control covers the card instead of wrapping it, so the whole card
        stays one large target while the description list below stays outside
        the button, where a description list is allowed to live.
      */}
      {onOpen === undefined ? null : (
        <button
          aria-label={selectLabel}
          className={styles.trigger}
          onClick={(event) => {
            onOpen(event.currentTarget);
          }}
          type="button"
        />
      )}
      <Portrait
        key={image}
        alt={imageAlt}
        attemptLabel={attemptLabel}
        className={styles.portrait}
        loadingLabel={loadingLabel}
        lostLabel={lostLabel}
        manualRecoveryLabel={manualRecoveryLabel}
        previewState={previewState}
        recoveringLabel={recoveringLabel}
        retryLabel={retryLabel}
        src={image}
        unavailableLabel={unavailableLabel}
      />
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        {status}
        {children === undefined ? null : <dl className={styles.details}>{children}</dl>}
      </div>
    </li>
  );
}
