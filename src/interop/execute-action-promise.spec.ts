import { executeActionAsPromise } from './execute-action-promise';

describe('executeActionAsPromise', () => {
  let mockRateLimiter: any;
  let mockAction: jest.Mock;

  beforeEach(() => {
    mockRateLimiter = {
      getTokensLeftAsync: jest.fn(),
      getActionAsync: jest.fn(),
      releaseActionAsync: jest.fn(),
    };

    mockAction = jest.fn();
  });

  test('executes action when enough tokens are available', async () => {
    mockRateLimiter.getTokensLeftAsync.mockResolvedValue(5); // Assume 5 tokens are available
    mockAction.mockResolvedValue('action result');

    const result = await executeActionAsPromise(mockAction, 3, mockRateLimiter);

    expect(mockAction).toHaveBeenCalled();
    expect(result).toBe('action result');
  });

  test('throws error when rate limit is exceeded', async () => {
    mockRateLimiter.getTokensLeftAsync.mockResolvedValue(1); // Only 1 token available

    await expect(executeActionAsPromise(mockAction, 3, mockRateLimiter)).rejects.toThrow();

    expect(mockAction).not.toHaveBeenCalled();
  });

  test('throws error when action execution fails', async () => {
    mockRateLimiter.getTokensLeftAsync.mockResolvedValue(5); // Assume 5 tokens are available
    const error = new Error('Action failed');
    mockAction.mockRejectedValue(error);

    await expect(executeActionAsPromise(mockAction, 3, mockRateLimiter)).rejects.toThrow('Action failed');

    expect(mockAction).toHaveBeenCalled();
  });
});
