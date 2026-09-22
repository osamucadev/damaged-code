/**
 * Stable error codes for upstream failures.
 *
 * Clients translate these codes. The message is for developers and logs, not
 * for end users.
 */
export type UpstreamErrorCode =
  | "UPSTREAM_UNAVAILABLE"
  | "UPSTREAM_INVALID_RESPONSE"
  | "EPISODE_NOT_FOUND";

/** HTTP status each upstream failure maps to in the project contract. */
const statusByCode: Record<UpstreamErrorCode, number> = {
  UPSTREAM_UNAVAILABLE: 502,
  UPSTREAM_INVALID_RESPONSE: 502,
  EPISODE_NOT_FOUND: 404,
};

export class UpstreamError extends Error {
  public readonly code: UpstreamErrorCode;
  public readonly status: number;

  constructor(code: UpstreamErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "UpstreamError";
    this.code = code;
    this.status = statusByCode[code];
  }
}
