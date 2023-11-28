/**
 * Represents a rate-limited action.
 */
export interface IRateLimitAction {
  /**
   * A unique identifier for the action. This ID can be used to track or reference
   * the action within the rate limiting system.
   */
  readonly id: string;
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
/**
 * Represents a cancellable rate-limited action.
 */
export class RateLimitCancellableAction implements IRateLimitCancellableAction {
  readonly id: string;
  private _performed: Date | null;
  private _started: Date | null;
  readonly tokens: number;
  private readonly onCancel: (action: RateLimitCancellableAction) => Promise<void>;

  /**
   * Constructs a new RateLimitCancellableAction.
   *
   * @param id - A unique identifier for the action. This ID is used to track or reference the action within the rate limiting system.
   * @param tokens - The number of tokens required for the action.
   * @param onCancel - A callback function that is called when the action is cancelled.
   */
  constructor(id: string, tokens: number, onCancel: (action: RateLimitCancellableAction) => Promise<void>) {
    this.id = id;
    this.tokens = tokens;
    this.onCancel = onCancel;
    this._started = null;
    this._performed = null;
  }

  /**
   * Gets the date and time when the action started.
   */
  public get started(): Date | null {
    return this._started;
  }

  /**
   * Gets the date and time when the action was performed.
   */
  public get performed(): Date | null {
    return this._performed;
  }

  /**
   * Sets the start time of the action.
   *
   * @param date - The date and time when the action started.
   */
  public startAction(date: Date): void {
    if (!this._started) {
      this._started = date;
    }
  }

  /**
   * Marks the action as performed.
   *
   * @param date - The date and time when the action was performed.
   */
  public completeAction(date: Date): void {
    if (!this._performed) {
      this._performed = date;
    }
  }

  /**
   * Cancels the action.
   *
   * @returns A promise that resolves when the action has been successfully cancelled.
   */
  async cancel(): Promise<void> {
    await this.onCancel(this);
  }
}
