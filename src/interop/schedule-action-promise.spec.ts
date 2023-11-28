import { scheduleActionAsPromise } from './schedule-action-promise';

describe('scheduleActionAsPromise', () => {
  let mockRateLimiter: any;
  let mockAction: any;

  beforeEach(() => {
    mockRateLimiter = {
      getActionAsync: jest.fn(),
      releaseActionAsync: jest.fn(),
    };

    mockAction = jest.fn();
  });

  test('should execute action when rate limiter allows', async () => {
    mockRateLimiter.getActionAsync.mockResolvedValue({});
    mockAction.mockResolvedValue('action result');

    const result = await scheduleActionAsPromise(mockAction, 1, mockRateLimiter);

    expect(result).toBe('action result');
    expect(mockRateLimiter.getActionAsync).toHaveBeenCalledWith(1);
    expect(mockRateLimiter.releaseActionAsync).toHaveBeenCalled();
  });

  test('should throw error when rate limiter denies action', async () => {
    const error = new Error('Rate limit exceeded');
    mockRateLimiter.getActionAsync.mockRejectedValue(error);

    await expect(scheduleActionAsPromise(mockAction, 1, mockRateLimiter)).rejects.toThrow('Rate limit exceeded');
    expect(mockRateLimiter.getActionAsync).toHaveBeenCalledWith(1);
    expect(mockRateLimiter.releaseActionAsync).not.toHaveBeenCalled();
  });

  test('should handle action execution error', async () => {
    const actionError = new Error('Action failed');
    mockRateLimiter.getActionAsync.mockResolvedValue({});
    mockAction.mockRejectedValue(actionError);

    await expect(scheduleActionAsPromise(mockAction, 1, mockRateLimiter)).rejects.toThrow('Action failed');
    expect(mockRateLimiter.getActionAsync).toHaveBeenCalledWith(1);
    expect(mockRateLimiter.releaseActionAsync).toHaveBeenCalled();
  });
});
