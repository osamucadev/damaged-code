import Image, { type StaticImageData } from "next/image";

import face01 from "../../../../assets/decorative/faces/face_01.png";
import face12 from "../../../../assets/decorative/faces/face_12.png";
import face26 from "../../../../assets/decorative/faces/face_26.png";
import face42 from "../../../../assets/decorative/faces/face_42.png";

import styles from "./DecorativeFace.module.css";

const faces = {
  1: face01,
  12: face12,
  26: face26,
  42: face42,
} satisfies Record<number, StaticImageData>;

export interface DecorativeFaceProps {
  face: keyof typeof faces;
  className?: string;
  size?: "small" | "medium" | "large";
}

/**
 * A decorative view over the canonical assets stored at the repository root.
 * The files never represent API characters and remain hidden from assistive technology.
 */
export function DecorativeFace({ face, className, size = "medium" }: DecorativeFaceProps) {
  return (
    <span aria-hidden="true" className={`${styles.face} ${styles[size]} ${className ?? ""}`}>
      <Image alt="" fill sizes="160px" src={faces[face]} />
    </span>
  );
}
