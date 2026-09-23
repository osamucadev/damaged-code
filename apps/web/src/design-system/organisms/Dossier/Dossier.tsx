"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
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
  children?: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A panel that opens over the page as a modal dialog.
 *
 * It is rendered in a portal because the originating card clips its own
 * overflow, and it implements the dialog behavior explicitly rather than using
 * the native element, so the same code runs everywhere the project is tested.
 *
 * It owns no product data and no copy. Every string arrives from the caller.
 */
export function Dossier({ title, closeLabel, onClose, eyebrow, children }: DossierProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    panel?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();

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
      // Focus returns to whatever opened the dialog, normally the card.
      previouslyFocused?.focus();
    };
  }, [onClose]);

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
        onClick={onClose}
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
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
