import { RateLimitError } from './rate-limit-error';

describe('RateLimitError', () => {
  it('should create an error with the correct message', () => {
    const errorMessage = 'Rate limit exceeded';
    const error = new RateLimitError(errorMessage);
    expect(error.message).toBe(errorMessage);
  });

  it('should have the correct name', () => {
    const error = new RateLimitError('Error');
    expect(error.name).toBe('RateLimitError');
  });

  it('should capture the cause if provided', () => {
    const cause = new Error('Underlying error');
    const error = new RateLimitError('Error with cause', cause);
    expect(error.cause).toBe(cause);
  });

  it('should have no cause if none is provided', () => {
    const error = new RateLimitError('Error without cause');
    expect(error.cause).toBeNull();
  });

  it('should support stack trace capturing', () => {
    const error = new RateLimitError('Error for stack trace');
    expect(error.stack).toBeDefined();
  });

  describe('fromUnknownReason', () => {
    it('should handle Error instances', () => {
      const originalError = new Error('Original error message');
      const rateLimitError = RateLimitError.fromUnknownReason(originalError);

      expect(rateLimitError).toBeInstanceOf(RateLimitError);
      expect(rateLimitError.message).toBe('Rate limit error occurred because of: Original error message');
      expect(rateLimitError.cause).toBe(originalError);
    });

    it('should handle non-Error objects', () => {
      const reason = { message: 'Some reason' };
      const rateLimitError = RateLimitError.fromUnknownReason(reason);

      expect(rateLimitError).toBeInstanceOf(RateLimitError);
      expect(rateLimitError.message).toBe('Rate limit error occurred because of: [object Object]');
      expect(rateLimitError.cause).toBeNull();
    });

    it('should handle primitive types', () => {
      const reason = 'A string reason';
      const rateLimitError = RateLimitError.fromUnknownReason(reason);

      expect(rateLimitError).toBeInstanceOf(RateLimitError);
      expect(rateLimitError.message).toBe('Rate limit error occurred because of: A string reason');
      expect(rateLimitError.cause).toBeNull();
    });

    it('should handle null and undefined', () => {
      let reason = null;
      let rateLimitError = RateLimitError.fromUnknownReason(reason);

      expect(rateLimitError).toBeInstanceOf(RateLimitError);
      expect(rateLimitError.message).toBe('Rate limit error occurred');
      expect(rateLimitError.cause).toBeNull();

      reason = undefined;
      rateLimitError = RateLimitError.fromUnknownReason(reason);

      expect(rateLimitError).toBeInstanceOf(RateLimitError);
      expect(rateLimitError.message).toBe('Rate limit error occurred');
      expect(rateLimitError.cause).toBeNull();
    });
  });
});
