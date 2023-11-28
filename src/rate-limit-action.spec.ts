import { RateLimitCancellableAction } from './rate-limit-action';

describe('RateLimitCancellableAction', () => {
  let onCancelMock: jest.Mock;
  let action: RateLimitCancellableAction;

  beforeEach(() => {
    onCancelMock = jest.fn().mockResolvedValue(undefined);
    action = new RateLimitCancellableAction('', 5, onCancelMock);
  });

  test('should initialize with correct token count and null dates', () => {
    expect(action.tokens).toBe(5);
    expect(action.started).toBeNull();
    expect(action.performed).toBeNull();
  });

  test('should set started date', () => {
    const startDate = new Date();
    action.startAction(startDate);
    expect(action.started).toEqual(startDate);
  });

  test('should not allow started date to be set more than once', () => {
    const startDate = new Date();
    action.startAction(startDate);

    const newStartDate = new Date();
    action.startAction(newStartDate); // Attempt to set a different start date
    expect(action.started).toEqual(startDate); // The start date should not change
  });

  test('should set performed date', () => {
    const performedDate = new Date();
    action.completeAction(performedDate);
    expect(action.performed).toEqual(performedDate);
  });

  test('should not allow performed date to be set more than once', () => {
    const performedDate = new Date();
    action.completeAction(performedDate);

    const newPerformedDate = new Date();
    action.completeAction(newPerformedDate); // Attempt to set a different performed date
    expect(action.performed).toEqual(performedDate); // The performed date should not change
  });

  test('should call onCancel function when cancelled', async () => {
    await action.cancel();
    expect(onCancelMock).toHaveBeenCalled();
  });
});
