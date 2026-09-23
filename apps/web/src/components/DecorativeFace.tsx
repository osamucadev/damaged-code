import Image, { type StaticImageData } from "next/image";

import face01 from "../../../../assets/decorative/faces/face_01.png";
import face02 from "../../../../assets/decorative/faces/face_02.png";
import face03 from "../../../../assets/decorative/faces/face_03.png";
import face04 from "../../../../assets/decorative/faces/face_04.png";
import face05 from "../../../../assets/decorative/faces/face_05.png";
import face06 from "../../../../assets/decorative/faces/face_06.png";
import face07 from "../../../../assets/decorative/faces/face_07.png";
import face08 from "../../../../assets/decorative/faces/face_08.png";
import face09 from "../../../../assets/decorative/faces/face_09.png";
import face10 from "../../../../assets/decorative/faces/face_10.png";
import face11 from "../../../../assets/decorative/faces/face_11.png";
import face12 from "../../../../assets/decorative/faces/face_12.png";
import face13 from "../../../../assets/decorative/faces/face_13.png";
import face14 from "../../../../assets/decorative/faces/face_14.png";
import face15 from "../../../../assets/decorative/faces/face_15.png";
import face16 from "../../../../assets/decorative/faces/face_16.png";
import face17 from "../../../../assets/decorative/faces/face_17.png";
import face18 from "../../../../assets/decorative/faces/face_18.png";
import face19 from "../../../../assets/decorative/faces/face_19.png";
import face20 from "../../../../assets/decorative/faces/face_20.png";
import face21 from "../../../../assets/decorative/faces/face_21.png";
import face22 from "../../../../assets/decorative/faces/face_22.png";
import face23 from "../../../../assets/decorative/faces/face_23.png";
import face24 from "../../../../assets/decorative/faces/face_24.png";
import face25 from "../../../../assets/decorative/faces/face_25.png";
import face26 from "../../../../assets/decorative/faces/face_26.png";
import face27 from "../../../../assets/decorative/faces/face_27.png";
import face28 from "../../../../assets/decorative/faces/face_28.png";
import face29 from "../../../../assets/decorative/faces/face_29.png";
import face30 from "../../../../assets/decorative/faces/face_30.png";
import face31 from "../../../../assets/decorative/faces/face_31.png";
import face32 from "../../../../assets/decorative/faces/face_32.png";
import face33 from "../../../../assets/decorative/faces/face_33.png";
import face34 from "../../../../assets/decorative/faces/face_34.png";
import face35 from "../../../../assets/decorative/faces/face_35.png";
import face36 from "../../../../assets/decorative/faces/face_36.png";
import face37 from "../../../../assets/decorative/faces/face_37.png";
import face38 from "../../../../assets/decorative/faces/face_38.png";
import face39 from "../../../../assets/decorative/faces/face_39.png";
import face40 from "../../../../assets/decorative/faces/face_40.png";
import face41 from "../../../../assets/decorative/faces/face_41.png";
import face42 from "../../../../assets/decorative/faces/face_42.png";

import styles from "./DecorativeFace.module.css";

const faces: readonly StaticImageData[] = [
  face01, face02, face03, face04, face05, face06, face07, face08, face09, face10, face11,
  face12, face13, face14, face15, face16, face17, face18, face19, face20, face21, face22,
  face23, face24, face25, face26, face27, face28, face29, face30, face31, face32, face33,
  face34, face35, face36, face37, face38, face39, face40, face41, face42,
];

export const decorativeFaceCount = faces.length;

export function selectDecorativeFace(seed: number | string, salt = "default") {
  const source = `${salt}:${seed}`;
  let hash = 2166136261;

  for (const character of source) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return (Math.abs(hash) % decorativeFaceCount) + 1;
}

export interface DecorativeFaceProps {
  face: number;
  className?: string;
  size?: "small" | "medium" | "large";
}

/**
 * A decorative view over the canonical assets stored at the repository root.
 * The files never represent API characters and remain hidden from assistive technology.
 */
export function DecorativeFace({ face, className, size = "medium" }: DecorativeFaceProps) {
  const source = faces[face - 1] ?? face01;

  return (
    <span aria-hidden="true" className={`${styles.face} ${styles[size]} ${className ?? ""}`}>
      <Image alt="" fill sizes="160px" src={source} />
    </span>
  );
}
