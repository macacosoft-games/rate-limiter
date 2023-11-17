import { IRateLimiterOptions } from './options/rate-limiter-options';
import { IRateLimitAction, IRateLimitCancellableAction } from './rate-limit-action';

/**
 * Interface for a rate limiter that controls the frequency of certain operations.
 */
export interface IRateLimiter {
  /**
   * The current configuration options of the rate limiter.
   */
  readonly options: IRateLimiterOptions;
  /**
   * Retrieves the number of tokens currently available in the rate limiter.
   * @throws RateLimitError
   */
  getTokensLeftAsync(): Promise<number>;
  /**
   * Retrieves a list of actions that are pending execution due to rate limiting.
   * This actions can be cancelled.
   */
  getPendingActionsAsync(): Promise<IRateLimitCancellableAction[]>;
  /**
   * Retrieves an action from the rate limiter, consuming the specified number of tokens.
   * If sufficient tokens are not available, the action is queued until tokens become available.
   *
   * @param tokens The number of tokens required to execute the action.
   * @returns A promise that resolves to the action when it can be executed.
   */
  getActionAsync(tokens: number): Promise<IRateLimitAction>;
  /**
   * Releases an action back to the rate limiter, potentially freeing up tokens or resources.
   * This is typically called after an action has been executed.
   *
   * @param action The action to be released.
   * @returns A promise that resolves once the action has been successfully released.
   */
  releaseActionAsync(action: IRateLimitAction): Promise<void>;
}
