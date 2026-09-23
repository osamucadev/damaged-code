/**
 * Stable error codes for upstream failures.
 *
 * Clients branch on the code. They never parse the message.
 */
export type UpstreamErrorCode =
  | "UPSTREAM_UNAVAILABLE"
  | "UPSTREAM_INVALID_RESPONSE"
  | "EPISODE_NOT_FOUND"
  | "CHARACTER_NOT_FOUND";

/** HTTP status each upstream failure maps to in the project contract. */
const statusByCode: Record<UpstreamErrorCode, number> = {
  UPSTREAM_UNAVAILABLE: 502,
  UPSTREAM_INVALID_RESPONSE: 502,
  EPISODE_NOT_FOUND: 404,
  CHARACTER_NOT_FOUND: 404,
};

/*
 * What the client is allowed to read.
 *
 * The thrown message carries diagnostic context such as the upstream URL and
 * the failing status, which belongs in the server log only. These messages are
 * the public half: provider agnostic, stable, and safe to show to anyone.
 */
const publicMessageByCode: Record<UpstreamErrorCode, string> = {
  UPSTREAM_UNAVAILABLE: "The data source is temporarily unavailable. Please try again.",
  UPSTREAM_INVALID_RESPONSE: "The data source returned an unexpected response.",
  EPISODE_NOT_FOUND: "The requested episode does not exist.",
  CHARACTER_NOT_FOUND: "The requested character does not exist.",
};

export class UpstreamError extends Error {
  public readonly code: UpstreamErrorCode;
  public readonly status: number;
  /** Safe to send to a client. The `message` property stays server side. */
  public readonly publicMessage: string;

  constructor(code: UpstreamErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "UpstreamError";
    this.code = code;
    this.status = statusByCode[code];
    this.publicMessage = publicMessageByCode[code];
  }
}
