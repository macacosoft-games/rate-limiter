/**
 * Represents a rate-limited action.
 */
export interface IRateLimitAction {
  /**
   * The number of tokens required for the action.
   */
  readonly tokens: number;
  /**
   * The date and time when the action started, or null if it hasn't started yet.
   */
  readonly started: Date | null;
  /**
   * The date and time when the action was performed, or null if it hasn't been performed yet.
   */
  readonly performed: Date | null;
}
/**
 * Extends {@link IRateLimitAction} to include the ability to cancel the action.
 */
export interface IRateLimitCancellableAction extends IRateLimitAction {
  /**
   * Cancels the action.
   * @returns A promise that resolves when the action has been successfully cancelled.
   * @throws RateLimitError
   */
  cancel(): Promise<void>;
}
