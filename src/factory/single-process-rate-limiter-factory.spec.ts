import { SingleProcessRateLimiter } from './single-process-rate-limiter-factory';
import { IRateLimiterOptions } from '../options/rate-limiter-options';

jest.useFakeTimers();

describe('SingleProcessRateLimiter', () => {
  let rateLimiter: SingleProcessRateLimiter;
  let options: IRateLimiterOptions;

  beforeEach(() => {
    options = {
      tokensPerTimespan: 10,
      timespan: { unit: 'second', term: 1 },
      actionAutoReleaseTimespan: { unit: 'millisecond', term: 500 },
    };
    rateLimiter = new SingleProcessRateLimiter(options);
  });

  test('should initialize with correct token count', async () => {
    expect(await rateLimiter.getTokensLeftAsync()).toBe(options.tokensPerTimespan);
  });

  test('should allow action if tokens are available', async () => {
    const action = await rateLimiter.getActionAsync(5);
    expect(action).toBeDefined();
    expect(await rateLimiter.getTokensLeftAsync()).toBe(5);
  });

  test('should queue action if not enough tokens are available', async () => {
    await rateLimiter.getActionAsync(8); // Consumes 8 tokens, 2 left
    const action = rateLimiter.getActionAsync(5); // Not enough tokens, should queue

    expect(rateLimiter.getPendingActionsAsync()).resolves.toHaveLength(1);
    jest.advanceTimersByTime(1000); // Advance time to refill tokens
    await expect(action).resolves.toBeDefined();
  });

  test('should release tokens after action completion', async () => {
    const action = await rateLimiter.getActionAsync(5);
    await rateLimiter.releaseActionAsync(action);
    expect(action.performed).not.toBeNull();
    jest.advanceTimersByTime(1000);
    expect(await rateLimiter.getTokensLeftAsync()).toEqual(10);
  });
});
