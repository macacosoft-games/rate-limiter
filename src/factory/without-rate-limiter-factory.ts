import { IRateLimiterOptions } from '../options/rate-limiter-options';
import { IRateLimiter } from '../rate-limiter';
import { IRateLimiterFactory } from './rate-limiter-factory';
import { IRateLimitAction, IRateLimitCancellableAction, RateLimitCancellableAction } from '../rate-limit-action';
import { ILogObj, Logger } from 'tslog';

/**
 * A class representing a rate limiter that effectively imposes no limits.
 * This can be used in contexts where rate limiting is optional or can be bypassed.
 */
export class WithoutRateLimiter implements IRateLimiter {
  private static kMAX_TOKENS_COUNT: number = Number.MAX_SAFE_INTEGER;
  private readonly logger: Logger<ILogObj>;
  readonly options: IRateLimiterOptions;
  private idGenerator: number = 0;

  /**
   * Constructs a new instance of WithoutRateLimiter.
   */
  constructor() {
    this.logger = new Logger({ name: 'WithoutRateLimiter' });
    this.logger.debug(`Instantiate a new rate limiter with no limit options`);
    this.options = { tokensPerTimespan: WithoutRateLimiter.kMAX_TOKENS_COUNT, timespan: 1000 };
  }

  async getActionAsync(tokens: number): Promise<IRateLimitAction> {
    const action = new RateLimitCancellableAction(
      this.generateActionId(),
      tokens,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (action: RateLimitCancellableAction) => {},
    );
    action.startAction(new Date());
    return action;
  }

  async getPendingActionsAsync(): Promise<IRateLimitCancellableAction[]> {
    return [];
  }

  async getTokensLeftAsync(): Promise<number> {
    return WithoutRateLimiter.kMAX_TOKENS_COUNT;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async releaseActionAsync(action: IRateLimitAction): Promise<void> {}

  private generateActionId(): string {
    return (++this.idGenerator).toString();
  }
}

/**
 * Factory class for creating without limit rate limiters.
 */
export class WithoutRateLimiterFactory implements IRateLimiterFactory {
  private readonly logger: Logger<ILogObj>;
  private readonly rateLimiter: IRateLimiter;

  constructor() {
    this.logger = new Logger({ name: 'WithoutRateLimiterFactory' });
    this.rateLimiter = new WithoutRateLimiter();
  }

  create(resourceId: string, options: IRateLimiterOptions): IRateLimiter;
  create(options: IRateLimiterOptions): IRateLimiter;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(resourceId: string | IRateLimiterOptions, options?: IRateLimiterOptions): IRateLimiter {
    this.logger.debug(`Returns an existing instance of rate limiter for resourceId '${resourceId}`);
    return this.rateLimiter;
  }
}
