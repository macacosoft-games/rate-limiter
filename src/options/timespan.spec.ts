import { timespanToMilliseconds, Timespan } from './timespan';

describe('Timespan', () => {
  describe('timespanToMilliseconds', () => {
    it('converts number directly to milliseconds', () => {
      expect(timespanToMilliseconds(5000)).toBe(5000);
    });

    it('converts simple string units to milliseconds', () => {
      expect(timespanToMilliseconds('second')).toBe(1000);
      expect(timespanToMilliseconds('minute')).toBe(60000);
      expect(timespanToMilliseconds('hour')).toBe(3600000);
      expect(timespanToMilliseconds('millisecond')).toBe(1);
    });

    it('converts complex timespan objects to milliseconds', () => {
      const timespans: Timespan[] = [
        { unit: 'second', term: 2 },
        { unit: 'minute', term: 3 },
        { unit: 'hour', term: 1 },
        { unit: 'millisecond', term: 1500 },
      ];

      expect(timespanToMilliseconds(timespans[0])).toBe(2000); // 2 seconds
      expect(timespanToMilliseconds(timespans[1])).toBe(180000); // 3 minutes
      expect(timespanToMilliseconds(timespans[2])).toBe(3600000); // 1 hour
      expect(timespanToMilliseconds(timespans[3])).toBe(1500); // 1500 milliseconds
    });
  });
});
