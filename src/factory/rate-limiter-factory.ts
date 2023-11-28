import { IRateLimiterOptions } from '../options/rate-limiter-options';
import { IRateLimiter } from '../rate-limiter';

/**
 * Interface for a factory that creates rate limiter instances.
 */
export interface IRateLimiterFactory {
  /**
   * Creates a rate limiter instance for a specific resource.
   *
   * If a rate limiter with the same `resourceId` already exists,
   * it will not create a new one but will return the existing instance, even if the options are different.
   *
   * @param resourceId - A unique identifier for the resource that the rate limiter will manage.
   *                     This could be an API endpoint, a user ID, or any other string that
   *                     uniquely identifies the resource.
   * @param options - Configuration options for the rate limiter. This includes settings like
   *                  the number of tokens to be allowed per timespan and the length of that
   *                  timespan.
   * @returns An instance of a rate limiter configured for the specified resource.
   */
  create(resourceId: string, options: IRateLimiterOptions): IRateLimiter;

  /**
   * Creates a rate limiter instance with the provided configuration options.
   *
   * If a rate limiter was already created, just returns a created instance.
   *
   * @param options - Configuration options for the rate limiter. This includes settings like
   *                  the number of tokens to be allowed per timespan and the length of that
   *                  timespan.
   * @returns An instance of a rate limiter configured with the specified options.
   */
  create(options: IRateLimiterOptions): IRateLimiter;
}
