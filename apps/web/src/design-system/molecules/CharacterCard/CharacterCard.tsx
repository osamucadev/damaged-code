import { useState, type HTMLAttributes, type ReactNode } from "react";

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
  /** Localized label shown if the official portrait cannot be loaded. */
  errorLabel: string;
  /** Controlled portrait state for documentation and deterministic previews. */
  portraitState?: "loading" | "loaded" | "error";
  /** Makes the whole card open something. Without it the card is static. */
  onSelect?: () => void;
  /** Localized accessible name of the card control. Required with onSelect. */
  selectLabel?: string;
  /** Optional status presentation, such as a StatusIndicator. */
  status?: ReactNode;
  /** Property rows describing the character. Rendered inside a description list. */
  children?: ReactNode;
}

interface CharacterPortraitProps {
  image: string;
  imageAlt: string;
  loadingLabel: string;
  errorLabel: string;
  portraitState?: "loading" | "loaded" | "error";
}

/**
 * The portrait and its loading lifecycle.
 *
 * It owns its own "loading" versus "loaded" versus "error" state instead of
 * resetting it from an effect. The parent mounts this with `key={image}`, so a
 * change of portrait source remounts the component and the state naturally
 * starts fresh at "loading", the same outcome an effect would have forced but
 * without synchronizing state from inside an effect body.
 */
function CharacterPortrait({
  image,
  imageAlt,
  loadingLabel,
  errorLabel,
  portraitState,
}: CharacterPortraitProps) {
  const [internalPortraitState, setInternalPortraitState] = useState<
    "loading" | "loaded" | "error"
  >("loading");
  const currentPortraitState = portraitState ?? internalPortraitState;

  return (
    <div className={styles.portrait}>
      {/*
        A plain image element is used on purpose. The portrait URL is part of the
        project contract, and the Next image pipeline would add a server side
        media proxy that this checkpoint does not need.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={imageAlt}
        className={`${styles.image} ${currentPortraitState === "loaded" ? styles.imageLoaded : ""}`}
        height={300}
        loading="lazy"
        onError={() => {
          if (portraitState === undefined) setInternalPortraitState("error");
        }}
        onLoad={() => {
          if (portraitState === undefined) setInternalPortraitState("loaded");
        }}
        src={image}
        width={300}
      />
      {currentPortraitState === "loading" ? (
        <div aria-hidden="true" className={styles.skeleton}>
          <span>{loadingLabel}</span>
        </div>
      ) : null}
      {currentPortraitState === "error" ? (
        <div aria-hidden="true" className={styles.imageError}>
          <span className={styles.signalLost}>×</span>
          <span>{errorLabel}</span>
        </div>
      ) : null}
    </div>
  );
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
  errorLabel,
  portraitState,
  onSelect,
  selectLabel,
  status,
  className,
  children,
  ...rest
}: CharacterCardProps) {
  const classes = [styles.card, onSelect === undefined ? undefined : styles.selectable, className]
    .filter(Boolean)
    .join(" ");

  return (
    <li {...rest} className={classes}>
      {/*
        The control covers the card instead of wrapping it, so the whole card
        stays one large target while the description list below stays outside
        the button, where a description list is allowed to live.
      */}
      {onSelect === undefined ? null : (
        <button aria-label={selectLabel} className={styles.trigger} onClick={onSelect} type="button" />
      )}
      <CharacterPortrait
        key={image}
        errorLabel={errorLabel}
        image={image}
        imageAlt={imageAlt}
        loadingLabel={loadingLabel}
        portraitState={portraitState}
      />
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        {status}
        {children === undefined ? null : <dl className={styles.details}>{children}</dl>}
      </div>
    </li>
  );
}
