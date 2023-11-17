/**
 * A type representing a time span.
 *
 * This type can be represented in several forms:
 * - An object specifying the unit of time ('second', 'millisecond', 'minute', 'hour') and the quantity of these units.
 * - A number representing the number of milliseconds.
 * - A string indicating the unit of time ('second', 'millisecond', 'minute', 'hour').
 *
 * Examples:
 * - { unit: 'second', term: 30 } - 30 seconds.
 * - { unit: 'minute', term: 5 } - 5 minutes.
 * - 1000 - 1000 milliseconds (1 second).
 * - 'hour' - 1 hour.
 */
export type Timespan =
  | {
      unit: 'second' | 'millisecond' | 'minute' | 'hour';
      term: number;
    }
  | number
  | 'second'
  | 'millisecond'
  | 'minute'
  | 'hour';

/**
 * Converts a timespan value (Timespan) to milliseconds.
 *
 * @param timespan - The timespan, which can be represented as a number (the number of milliseconds),
 *                   a string ('second', 'millisecond', 'minute', 'hour'), or an object specifying the unit and quantity.
 * @returns The number of milliseconds corresponding to the given timespan.
 */
export function timespanToMilliseconds(timespan: Timespan): number {
  if (typeof timespan === 'number') {
    return timespan;
  }

  if (typeof timespan === 'string') {
    switch (timespan) {
      case 'second':
        return 1000;
      case 'minute':
        return 60000;
      case 'hour':
        return 3600000;
      default:
        return 1; // millisecond
    }
  }

  switch (timespan.unit) {
    case 'second':
      return timespan.term * 1000;
    case 'minute':
      return timespan.term * 60000;
    case 'hour':
      return timespan.term * 3600000;
    default:
      return timespan.term; // millisecond
  }
}
