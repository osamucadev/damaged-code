"use client";

import { useEffect, useState } from "react";

import { Button } from "../Button/Button";

import styles from "./Portrait.module.css";

const MAX_AUTOMATIC_ATTEMPTS = 2;
const RECOVERY_COUNTDOWN_SECONDS = 3;

type PortraitStatus = "loading" | "recovering" | "loaded" | "unavailable";

interface PortraitState {
  status: PortraitStatus;
  /** Automatic retries already used in the current recovery cycle: 0, 1, or 2. */
  attempt: number;
  /** Seconds left before the next automatic retry. Meaningful only while recovering. */
  secondsRemaining: number;
  /** Bumped on every fresh load attempt so the <img> remounts and the browser issues a new request for the same URL. */
  loadKey: number;
}

function initialPortraitState(): PortraitState {
  return { status: "loading", attempt: 0, secondsRemaining: 0, loadKey: 0 };
}

/** Deterministic states for documentation and Storybook, bypassing the real image and timers. */
export type PortraitPreviewState =
  | "loading"
  | "loaded"
  | "recovering-1"
  | "recovering-2"
  | "unavailable";

function previewToState(preview: PortraitPreviewState): PortraitState {
  switch (preview) {
    case "loaded":
      return { status: "loaded", attempt: 0, secondsRemaining: 0, loadKey: 0 };
    case "recovering-1":
      return {
        status: "recovering",
        attempt: 1,
        secondsRemaining: RECOVERY_COUNTDOWN_SECONDS,
        loadKey: 0,
      };
    case "recovering-2":
      return {
        status: "recovering",
        attempt: 2,
        secondsRemaining: RECOVERY_COUNTDOWN_SECONDS,
        loadKey: 0,
      };
    case "unavailable":
      return { status: "unavailable", attempt: MAX_AUTOMATIC_ATTEMPTS, secondsRemaining: 0, loadKey: 0 };
    case "loading":
    default:
      return initialPortraitState();
  }
}

export interface PortraitProps {
  /** Absolute portrait URL, as published by the project API. Retries never rewrite this identity. */
  src: string;
  /** Localized alternative text for the real image. */
  alt: string;
  /** Localized label shown while the portrait is loading normally. */
  loadingLabel: string;
  /** Localized headline shown as soon as a load attempt fails, such as Image signal lost. */
  lostLabel: string;
  /** Builds the localized countdown line from the seconds remaining, such as Recovering signal in {n}... */
  recoveringLabel: (secondsRemaining: number) => string;
  /** Builds the localized attempt line, such as Attempt {attempt} of {maxAttempts}. */
  attemptLabel: (attempt: number, maxAttempts: number) => string;
  /** Localized headline shown once both automatic retries are exhausted. */
  unavailableLabel: string;
  /** Localized subtitle under the unavailable headline. */
  manualRecoveryLabel: string;
  /** Localized label and accessible name of the manual retry control. */
  retryLabel: string;
  /** Controlled state for documentation and deterministic previews, bypassing the real image and timers. */
  previewState?: PortraitPreviewState;
  className?: string;
}

/**
 * The portrait and its failure recovery lifecycle.
 *
 * State is self-contained per instance: there is no shared registry or
 * global recovery state, so CharacterCard and CharacterDossier each run
 * their own recovery cycle for the same character and never synchronize with
 * each other. A caller that wants a fresh lifecycle for a new image mounts
 * this with `key={src}`, the same approach the design system already used
 * for the portrait before this was extracted, which naturally cancels any
 * pending recovery work for the previous image and starts clean.
 *
 * A failed load enters a short automatic recovery cycle: up to two retries,
 * each preceded by a three second countdown. If both retries also fail, the
 * portrait settles on a manual retry control instead of retrying forever.
 */
export function Portrait({
  src,
  alt,
  loadingLabel,
  lostLabel,
  recoveringLabel,
  attemptLabel,
  unavailableLabel,
  manualRecoveryLabel,
  retryLabel,
  previewState,
  className,
}: PortraitProps) {
  const isControlled = previewState !== undefined;
  const [state, setState] = useState<PortraitState>(() =>
    previewState === undefined ? initialPortraitState() : previewToState(previewState),
  );

  function handleLoad() {
    if (isControlled) return;

    setState((previous) => ({ ...previous, status: "loaded" }));
  }

  function handleError() {
    if (isControlled) return;

    setState((previous) => {
      if (previous.attempt >= MAX_AUTOMATIC_ATTEMPTS) {
        return { ...previous, status: "unavailable" };
      }

      return {
        ...previous,
        status: "recovering",
        attempt: previous.attempt + 1,
        secondsRemaining: RECOVERY_COUNTDOWN_SECONDS,
      };
    });
  }

  function handleManualRetry() {
    if (isControlled) return;

    setState((previous) => ({
      status: "loading",
      attempt: 0,
      secondsRemaining: 0,
      loadKey: previous.loadKey + 1,
    }));
  }

  /*
   * Ticks the recovery countdown down by one second, then triggers the retry
   * once it reaches zero. A fresh timer is scheduled per tick rather than
   * using a single interval, so a state change (success, unmount, or a new
   * image source through the caller's key) only ever needs to cancel one
   * pending timer instead of tracking an interval id separately.
   */
  useEffect(() => {
    if (isControlled || state.status !== "recovering") return;

    const timer = window.setTimeout(() => {
      setState((previous) => {
        if (previous.status !== "recovering") return previous;

        if (previous.secondsRemaining > 1) {
          return { ...previous, secondsRemaining: previous.secondsRemaining - 1 };
        }

        return { ...previous, status: "loading", loadKey: previous.loadKey + 1 };
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isControlled, state]);

  /*
   * A single announcement, throttled to real transitions rather than the
   * ticking countdown: it only changes when the status or the attempt number
   * changes, never once a second, so assistive technology hears "attempt 1
   * of 2" once instead of three, two, one.
   */
  const announcement =
    state.status === "recovering"
      ? `${lostLabel} ${attemptLabel(state.attempt, MAX_AUTOMATIC_ATTEMPTS)}`
      : state.status === "unavailable"
        ? `${unavailableLabel} ${manualRecoveryLabel}`
        : "";

  const classes = [styles.portrait, className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {/*
        A plain image element is used on purpose. The portrait URL is part of the
        project contract, and the Next image pipeline would add a server side
        media proxy that this checkpoint does not need. It stays in the document
        at every status so its alt text remains the portrait's accessible name,
        but only becomes visible once it actually loads: the browser's own
        broken image presentation never has a chance to show through.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        className={`${styles.image} ${state.status === "loaded" ? styles.imageLoaded : ""}`}
        height={300}
        key={state.loadKey}
        loading="lazy"
        onError={handleError}
        onLoad={handleLoad}
        src={src}
        width={300}
      />
      {state.status === "loading" ? (
        <div aria-hidden="true" className={styles.skeleton}>
          <span>{loadingLabel}</span>
        </div>
      ) : null}
      {state.status === "recovering" ? (
        <div aria-hidden="true" className={styles.recovering}>
          <span className={styles.signalLost}>{"×"}</span>
          <span className={styles.recoveringHeadline}>{lostLabel}</span>
          <span className={styles.recoveringCountdown}>
            {recoveringLabel(state.secondsRemaining)}
          </span>
          <span className={styles.recoveringAttempt}>
            {attemptLabel(state.attempt, MAX_AUTOMATIC_ATTEMPTS)}
          </span>
        </div>
      ) : null}
      {state.status === "unavailable" ? (
        <div className={styles.unavailable}>
          <span aria-hidden="true" className={styles.signalLost}>
            {"×"}
          </span>
          <span className={styles.unavailableHeadline}>{unavailableLabel}</span>
          <span className={styles.unavailableSubtitle}>{manualRecoveryLabel}</span>
          <Button
            className={styles.retryButton}
            onClick={handleManualRetry}
            size="small"
            type="button"
            variant="secondary"
          >
            {retryLabel}
          </Button>
        </div>
      ) : null}
      {announcement === "" ? null : (
        <span aria-live="polite" className={styles.srOnly} role="status">
          {announcement}
        </span>
      )}
    </div>
  );
}
