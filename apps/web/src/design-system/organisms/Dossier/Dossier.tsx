"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import styles from "./Dossier.module.css";

export interface DossierProps {
  /** Visible title. It also names the dialog for assistive technology. */
  title: ReactNode;
  /** Localized accessible name of the close control. */
  closeLabel: string;
  onClose: () => void;
  /** Optional line under the title, such as a code or a status. */
  eyebrow?: ReactNode;
  /**
   * The control that opened this dossier, when known.
   *
   * When present and motion is allowed, the dialog grows out of this
   * element's position and shrinks back into it on close, so the card visibly
   * becomes the dossier. Without it, or under prefers-reduced-motion, the
   * dialog only fades in and out and closes immediately.
   */
  originElement?: HTMLElement | null;
  children?: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const REQUEST_CLOSE_CONTEXT = createContext<(() => void) | null>(null);

/**
 * Lets content inside a Dossier trigger its animated close, instead of an
 * ancestor's plain onClose. An episode appearance that points at the episode
 * page already open uses this to close the dossier the same way Escape or the
 * close button would, rather than skipping the closing transition.
 */
export function useDossierClose(): () => void {
  const requestClose = useContext(REQUEST_CLOSE_CONTEXT);

  if (requestClose === null) {
    throw new Error("useDossierClose must be called from inside a Dossier");
  }

  return requestClose;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Reads a motion token so JS timing stays in sync with the CSS duration, including its reduced-motion override. */
function readMotionDurationMs(propertyName: string): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = getComputedStyle(document.documentElement).getPropertyValue(propertyName).trim();
  const parsed = Number.parseFloat(raw);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return raw.endsWith("ms") ? parsed : parsed * 1000;
}

function connectedRect(element: HTMLElement | null | undefined): DOMRect | null {
  if (element === null || element === undefined || !element.isConnected) {
    return null;
  }

  return element.getBoundingClientRect();
}

/** A transform that maps target back onto origin, center to center. */
function flipTransform(origin: DOMRect, target: DOMRect): string {
  const dx = origin.left + origin.width / 2 - (target.left + target.width / 2);
  const dy = origin.top + origin.height / 2 - (target.top + target.height / 2);
  const scaleX = target.width === 0 ? 1 : origin.width / target.width;
  const scaleY = target.height === 0 ? 1 : origin.height / target.height;

  return `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
}

/**
 * A panel that opens over the page as a modal dialog.
 *
 * It is rendered in a portal because the originating card clips its own
 * overflow, and it implements the dialog behavior explicitly rather than using
 * the native element, so the same code runs everywhere the project is tested.
 *
 * It owns no product data and no copy. Every string arrives from the caller.
 */
export function Dossier({
  title,
  closeLabel,
  onClose,
  eyebrow,
  originElement,
  children,
}: DossierProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closingRef = useRef(false);

  /*
   * Grows the panel out of the origin element instead of the plain CSS
   * keyframe entrance, when a real origin is known and motion is allowed.
   * Runs once, against whatever the dossier looks like on first paint, which
   * is the loading skeleton while character detail is still pending.
   */
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const origin = connectedRect(originElement);

    if (panel === null || backdrop === null || origin === null || prefersReducedMotion()) {
      return;
    }

    const target = panel.getBoundingClientRect();

    panel.style.animation = "none";
    backdrop.style.animation = "none";
    panel.style.transition = "none";
    backdrop.style.transition = "none";
    panel.style.transform = flipTransform(origin, target);
    panel.style.opacity = "0";
    backdrop.style.opacity = "0";

    // Forces the browser to commit the start values above before they animate away from.
    panel.getBoundingClientRect();

    const frame = requestAnimationFrame(() => {
      const transition = `transform var(--dc-motion-card) var(--dc-ease-pop), opacity var(--dc-motion-normal) var(--dc-ease-mechanical)`;

      panel.style.transition = transition;
      backdrop.style.transition = `opacity var(--dc-motion-normal) var(--dc-ease-mechanical)`;
      panel.style.transform = "";
      panel.style.opacity = "";
      backdrop.style.opacity = "";
    });

    return () => {
      cancelAnimationFrame(frame);
      // Undoes the synchronous start-state mutations too, not just the frame.
      // React Strict Mode double-invokes layout effects in development, and
      // without this the second invocation would measure the panel's already
      // transformed position instead of its true resting one, computing a
      // near-identity transform and leaving the dialog stuck invisible.
      //
      // The animation override is deliberately left in place. Clearing it
      // would let the CSS keyframe fallback restart for an instant before the
      // next invocation measures the panel, and that keyframe's own transform
      // would corrupt the very measurement this cleanup exists to protect.
      panel.style.transition = "";
      backdrop.style.transition = "";
      panel.style.transform = "";
      panel.style.opacity = "";
      backdrop.style.opacity = "";
    };
    // Intentionally runs once: later re-renders swap the body content (skeleton
    // to loaded), not the opening transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestClose = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const origin = connectedRect(originElement);

    if (panel === null || backdrop === null || origin === null || prefersReducedMotion()) {
      onClose();

      return;
    }

    closingRef.current = true;

    const target = panel.getBoundingClientRect();

    panel.style.transform = flipTransform(origin, target);
    panel.style.opacity = "0";
    backdrop.style.opacity = "0";

    window.setTimeout(onClose, readMotionDurationMs("--dc-motion-card"));
  }, [onClose, originElement]);

  useEffect(() => {
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    panel?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        requestClose();

        return;
      }

      if (event.key !== "Tab" || panel === null) {
        return;
      }

      // Focus stays inside the dialog while it is open.
      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );

      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();

        return;
      }

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }

      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Focus returns to whatever opened the dialog, normally the card. This
      // only runs once the dossier actually unmounts, which for an animated
      // close is after the closing transition finishes, not when it starts.
      previouslyFocused?.focus();
    };
  }, [requestClose]);

  return createPortal(
    <div className={styles.backdrop}>
      {/*
        The backdrop closes the dialog on click. It is not a control on its own,
        because the dialog already has an explicit and visible close button.
      */}
      <div
        aria-hidden="true"
        className={styles.backdropSurface}
        data-testid="dossier-backdrop"
        onClick={requestClose}
        ref={backdropRef}
      />
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.panel}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div className={styles.heading}>
            {eyebrow === undefined ? null : <p className={styles.eyebrow}>{eyebrow}</p>}
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>
          </div>
          <button
            aria-label={closeLabel}
            className={styles.close}
            onClick={requestClose}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className={styles.body}>
          <REQUEST_CLOSE_CONTEXT.Provider value={requestClose}>
            {children}
          </REQUEST_CLOSE_CONTEXT.Provider>
        </div>
      </div>
    </div>,
    document.body,
  );
}
