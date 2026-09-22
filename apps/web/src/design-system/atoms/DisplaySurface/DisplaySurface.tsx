import type { HTMLAttributes } from "react";

import styles from "./DisplaySurface.module.css";

export interface DisplaySurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** Reading tone of the surface. Meaning is still carried by the content. */
  tone?: "display" | "warning" | "danger";
}

export function DisplaySurface({
  tone = "display",
  className,
  children,
  ...rest
}: DisplaySurfaceProps) {
  const toneClass = tone === "display" ? undefined : styles[tone];
  const classes = [styles.display, toneClass, className].filter(Boolean).join(" ");

  return (
    <div {...rest} className={classes}>
      {children}
    </div>
  );
}
