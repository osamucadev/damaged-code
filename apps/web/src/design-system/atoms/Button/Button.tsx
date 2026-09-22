import type { ButtonHTMLAttributes } from "react";

import { Loader } from "../Loader/Loader";

import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "small" | "medium";
  fullWidth?: boolean;
  /** Shows a busy indicator and stops the control from being activated. */
  isLoading?: boolean;
  /** Accessible description of the busy state. Required while loading. */
  loadingLabel?: string;
}

export function Button({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  isLoading = false,
  loadingLabel,
  disabled = false,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...rest}
      aria-busy={isLoading || undefined}
      className={classes}
      disabled={disabled || isLoading}
      type={type}
    >
      {isLoading ? <Loader label={loadingLabel ?? ""} size="small" /> : null}
      {children}
    </button>
  );
}
