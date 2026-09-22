/**
 * Stable error codes for upstream failures.
 *
 * Clients translate these codes. The message is for developers and logs, not
 * for end users.
 */
export type UpstreamErrorCode = "UPSTREAM_UNAVAILABLE" | "UPSTREAM_INVALID_RESPONSE";

export class UpstreamError extends Error {
  public readonly code: UpstreamErrorCode;

  constructor(code: UpstreamErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "UpstreamError";
    this.code = code;
  }
}
