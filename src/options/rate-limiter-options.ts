import { Timespan } from './timespan';

/**
 * Interface for options to limit the rate of action execution.
 * Defines parameters used to control the frequency of certain operations.
 */
export interface IRateLimiterOptions {
  /**
   * The limit on the number of times an action can be performed within a given timespan.
   */
  tokensPerTimespan: number;
  /**
   * The timespan during which the rate limit is applied.
   *
   * @property unit The unit of time measurement (second, millisecond, minute, hour).
   * @property term The duration of the timespan in the chosen units of measurement.
   */
  timespan: Timespan;
}
