import { IRateLimiterOptions } from '../options/rate-limiter-options';
import { IRateLimiter } from '../rate-limiter';
import { IRateLimiterFactory } from './rate-limiter-factory';
import { IRateLimitAction, IRateLimitCancellableAction, RateLimitCancellableAction } from '../rate-limit-action';
import { ILogObj, Logger } from 'tslog';
import assert from 'assert';
import { timespanToMilliseconds } from '../options/timespan';
import { clearTimeout } from 'timers';

/**
 * A single-process implementation of a rate limiter.
 * This rate limiter uses a token bucket algorithm to control access to a resource.
 */
export class SingleProcessRateLimiter implements IRateLimiter {
  private readonly logger: Logger<ILogObj>;
  readonly options: IRateLimiterOptions;
  private queue: RateLimitCancellableAction[];
  private readonly processing: Map<string, { autoReleaseTimeout: NodeJS.Timeout; action: RateLimitCancellableAction }>;
  private tokensLeft: number;
  private tokensIssuedFrom: Date | null;
  private idGenerator: number = 0;
  private readonly cachedOptionsTimespanMs: number;

  /**
   * Constructs a new SingleProcessRateLimiter.
   * @param options - Configuration options for the rate limiter.
   */
  constructor(options: IRateLimiterOptions) {
    this.logger = new Logger({ name: 'SingleProcessRateLimiter' });
    this.logger.debug(`Instantiate a new rate limiter with options: ${JSON.stringify(options)}`);
    this.options = options;
    this.queue = [];
    this.processing = new Map();
    this.tokensLeft = this.options.tokensPerTimespan;
    this.tokensIssuedFrom = null;
    this.cachedOptionsTimespanMs = timespanToMilliseconds(this.options.timespan);
  }

  async getActionAsync(tokens: number): Promise<IRateLimitAction> {
    let action: RateLimitCancellableAction;
    if (this.tokensLeft >= tokens) {
      action = this.createAction(tokens);
      this.processAction(action);
    } else {
      action = this.createAction(tokens);
      this.enqueueAction(action);
    }
    return action;
  }

  async getPendingActionsAsync(): Promise<IRateLimitCancellableAction[]> {
    return [...this.queue.values()];
  }

  async getTokensLeftAsync(): Promise<number> {
    return this.tokensLeft;
  }

  async releaseActionAsync(action: IRateLimitAction): Promise<void> {
    this.releaseAction(action, false);
  }

  /**
   * Determines whether the action has been completed based on the tokens expiration interval.
   * An action is considered completed if the time elapsed since the tokens were issued
   * is greater than or equal to the configured timespan of the rate limiter.
   *
   * @param action - The rate limit action to check for completion.
   * @returns A boolean indicating whether the action is completed.
   */
  protected areActionCompleted(action: IRateLimitAction): boolean {
    return !!action.performed;
  }

  private createAction(tokens: number): RateLimitCancellableAction {
    return new RateLimitCancellableAction(
      this.generateActionId(),
      tokens,
      async (action: RateLimitCancellableAction) => {
        this.logger.trace(`Cancel action '${action.id}'`);
        this.queue = this.queue.filter((queuedAction) => queuedAction.id === action.id);
      },
    );
  }

  private generateActionId(): string {
    return (++this.idGenerator).toString();
  }

  private enqueueAction(action: RateLimitCancellableAction) {
    this.logger.trace(`Enqueue action '${action.id}' of ${action.tokens} tokens`);
    this.queue.push(action);
  }

  private processAction(action: RateLimitCancellableAction) {
    this.logger.trace(`Get action '${action.id}' of ${action.tokens} tokens`);
    action.startAction(new Date());
    this.tokensLeft -= action.tokens;
    this.processing.set(action.id, {
      autoReleaseTimeout: setTimeout(
        () => {
          this.releaseAction(action, true);
        },
        timespanToMilliseconds(this.options.actionAutoReleaseTimespan ?? this.options.timespan),
      ),
      action,
    });
    this.scheduleRefillTokens();
  }

  private releaseAction(action: IRateLimitAction, autoRelease: boolean) {
    if (!this.processing.has(action.id)) {
      this.logger.error(`Can't find action '${action.id}'`);
      return;
    }
    const foundEntry = this.processing.get(action.id);
    assert(foundEntry);
    if (!autoRelease) {
      clearTimeout(foundEntry.autoReleaseTimeout);
    }
    this.logger.trace(`${autoRelease ? 'Auto-release' : 'Release'} action '${action.id}'`);
    foundEntry.action.completeAction(new Date());
  }

  private scheduleRefillTokens() {
    if (!this.tokensIssuedFrom) {
      this.tokensIssuedFrom = new Date();
      setTimeout(() => {
        this.processQueue();
      }, this.cachedOptionsTimespanMs);
    }
  }

  private processQueue() {
    const processedEntries = [...this.processing.values()].filter((it) => {
      return this.areActionCompleted(it.action);
    });
    processedEntries.forEach((it) => {
      this.processing.delete(it.action.id);
      this.tokensLeft += it.action.tokens;
    });
    while (this.queue.length > 0 && this.tokensLeft >= this.queue[0].tokens) {
      const action = this.queue.shift();
      assert(action);
      this.processAction(action);
    }
    this.tokensIssuedFrom = null;
    if (this.processing.size > 0) {
      this.scheduleRefillTokens();
    }
  }
}

/**
 * Factory class for creating single process rate limiters.
 */
export class SingleProcessRateLimiterFactory implements IRateLimiterFactory {
  private static kDEFAULT_RESOURCE_ID: string = '';
  private readonly logger: Logger<ILogObj>;
  private readonly rateLimiters: Map<string, IRateLimiter>;

  constructor() {
    this.logger = new Logger({ name: 'SingleProcessRateLimiterFactory' });
    this.rateLimiters = new Map();
  }

  create(resourceId: string, options: IRateLimiterOptions): IRateLimiter;
  create(options: IRateLimiterOptions): IRateLimiter;
  create(resourceId: string | IRateLimiterOptions, options?: IRateLimiterOptions): IRateLimiter {
    if (typeof resourceId === 'string') {
      assert(options);
      return this.createForResource(resourceId, options);
    }
    return this.createForResource(SingleProcessRateLimiterFactory.kDEFAULT_RESOURCE_ID, resourceId);
  }

  private createForResource(resourceId: string, options: IRateLimiterOptions): IRateLimiter {
    const existingLimiter = this.rateLimiters.get(resourceId);
    if (existingLimiter) {
      if (!this.areOptionsEqual(existingLimiter.options, options)) {
        this.logger.warn(
          `Rate limiter for resourceId '${resourceId}' already exists with different options. Existing limiter will be used.`,
        );
        this.logger.debug(`Returns an existing instance of rate limiter for resourceId '${resourceId}`);
        return existingLimiter;
      }
    }
    this.logger.debug(`Create a new instance of rate limiter for resourceId '${resourceId}`);
    const newLimiter = new SingleProcessRateLimiter(options);
    this.rateLimiters.set(resourceId, newLimiter);
    return newLimiter;
  }

  private areOptionsEqual(options1: IRateLimiterOptions, options2: IRateLimiterOptions): boolean {
    const t = timespanToMilliseconds(options1.timespan) / timespanToMilliseconds(options2.timespan);
    const c = options1.tokensPerTimespan / options2.tokensPerTimespan;
    return t === c;
  }
}
