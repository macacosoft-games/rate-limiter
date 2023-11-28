import { IRateLimiter } from '../rate-limiter';
import { RateLimitError } from '../error/rate-limit-error';
import { IRateLimitAction } from '../rate-limit-action';

/**
 * Executes an action as a promise if there are enough tokens available in the rate limiter.
 * If not enough tokens are available, it throws an error.
 *
 * @param actionAsync - A function that returns a promise representing the action to be executed.
 * @param actionTokens - The number of tokens required from the rate limiter to execute the action.
 * @param rateLimiter - An instance of IRateLimiter to manage the rate limiting of actions.
 * @returns A promise that resolves to the result of the action if it is successfully executed within the rate limits.
 * @throws An `RateLimitError` if the rate limit is exceeded or if an error occurs during the execution of the action.
 *
 * @example
 * executeActionAsPromise(
 *   () => fetchData(), // The action to perform
 *   1,                // Number of tokens required
 *   myRateLimiter     // The rate limiter instance
 * ).then(result => {
 *   console.log('Action executed:', result);
 * }).catch(error => {
 *   console.error('Error executing action:', error);
 * });
 */
export async function executeActionAsPromise<T>(
  actionAsync: () => Promise<T>,
  actionTokens: number,
  rateLimiter: IRateLimiter,
): Promise<T> {
  // Check if enough tokens are available
  const tokensLeft = await rateLimiter.getTokensLeftAsync();
  if (tokensLeft < actionTokens) {
    throw RateLimitError.fromUnknownReason('not enough tokens');
  }
  let action: IRateLimitAction | null = null;
  try {
    // Lock tokens for action executing
    action = await rateLimiter.getActionAsync(actionTokens);

    // Execute the action and returns result
    return await actionAsync();
  } catch (error) {
    throw RateLimitError.fromUnknownReason(error);
  } finally {
    // Handle token release
    if (action) {
      await rateLimiter.releaseActionAsync(action);
    }
  }
}
