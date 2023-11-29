import { WithoutRateLimiter } from './without-rate-limiter-factory';

describe('WithoutRateLimiter', () => {
  let rateLimiter: WithoutRateLimiter;

  beforeEach(() => {
    rateLimiter = new WithoutRateLimiter();
  });

  test('getActionAsync should resolve immediately', async () => {
    const action = await rateLimiter.getActionAsync(1);
    expect(action.tokens).toEqual(1);
    expect(action.started).not.toBeNull();
  });

  test('getPendingActionsAsync should return an empty array', async () => {
    const actions = await rateLimiter.getPendingActionsAsync();
    expect(actions).toEqual([]);
  });

  test('getTokensLeftAsync should return maximum safe integer', async () => {
    const tokens = await rateLimiter.getTokensLeftAsync();
    expect(tokens).toBe(Number.MAX_SAFE_INTEGER);
  });

  test('releaseActionAsync should resolve immediately', async () => {
    const action = await rateLimiter.getActionAsync(1);
    await expect(rateLimiter.releaseActionAsync(action)).resolves.toBeUndefined();
  });
});
