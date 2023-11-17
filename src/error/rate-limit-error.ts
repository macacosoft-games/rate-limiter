/**
 * A class representing an error for exceeding the rate limit of action executions.
 * Extends the standard `Error` class.
 */
export class RateLimitError extends Error {
  /**
   * The cause of the error, if known.
   * It can be another error that led to this rate limit error.
   */
  readonly cause: Error | null;

  /**
   * Creates an instance of `RateLimitError`.
   *
   * @param message The error message.
   * @param cause The error that caused this rate limit error, if any.
   */
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'RateLimitError';
    this.cause = cause ?? null;

    // Supports proper stack trace for where our error was thrown (only available on V8).
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }

    // Explicitly set the prototype.
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }

  /**
   * Creates an instance of `RateLimitError` from an unknown reason.
   *
   * @param reason The reason for the error, which may be a non-standard error object.
   * @returns An instance of `RateLimitError` containing information about the cause.
   */
  static fromUnknownReason(reason: unknown): RateLimitError {
    if (!reason) {
      // For null and undefined reason just create error with predefined text.
      return new RateLimitError('Rate limit error occurred');
    } else if (reason instanceof Error) {
      return new RateLimitError('Rate limit error occurred because of: ' + reason.message, reason);
    } else {
      // Wrapping the unknown reason into a string.
      return new RateLimitError('Rate limit error occurred because of: ' + String(reason));
    }
  }
}
