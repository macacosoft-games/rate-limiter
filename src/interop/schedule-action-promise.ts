import { IRateLimiter } from '../rate-limiter';

/**
 * Schedules an action to be executed as a promise, respecting the rate limits imposed by the provided rate limiter.
 *
 * @param actionAsync - A function that returns a promise representing the action to be executed.
 * @param actionTokens - The number of tokens required from the rate limiter to execute the action.
 * @param rateLimiter - An instance of IRateLimiter to manage the rate limiting of actions.
 * @returns A promise that resolves to the result of the action if it is successfully executed within the rate limits.
 *          If the rate limit is exceeded or if an error occurs, the promise is rejected.
 *
 * @example
 * const resultPromise = scheduleActionAsPromise(
 *   () => fetchData(), // The action to perform
 *   1,                // Number of tokens required
 *   myRateLimiter     // The rate limiter instance
 * );
 * resultPromise.then(result => {
 *   console.log('Action executed:', result);
 * }).catch(error => {
 *   console.error('Error executing action:', error);
 * });
 */
export function scheduleActionAsPromise<T>(
  actionAsync: () => Promise<T>,
  actionTokens: number,
  rateLimiter: IRateLimiter,
): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    try {
      // Attempt to acquire the necessary tokens for the action
      const rateLimitAction = await rateLimiter.getActionAsync(actionTokens);

      try {
        // Execute the action
        const result = await actionAsync();
        resolve(result);
      } finally {
        // Release the tokens back to the rate limiter
        await rateLimiter.releaseActionAsync(rateLimitAction);
      }
    } catch (error) {
      // Handle any errors, such as failing to acquire tokens
      reject(error);
    }
  });
}
