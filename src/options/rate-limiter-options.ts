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
  /**
   * Optional timespan after which an action is automatically released.
   * If not specified, it defaults to the value of `timespan`.
   * This property defines the duration after which an acquired token
   * for an action is automatically released, making it available for other actions.
   * This can be useful to ensure that tokens are not indefinitely consumed by actions
   * that fail to release them.
   *
   * @property unit The unit of time measurement (second, millisecond, minute, hour).
   * @property term The duration of the timespan in the chosen units of measurement.
   */
  actionAutoReleaseTimespan?: Timespan;
}
