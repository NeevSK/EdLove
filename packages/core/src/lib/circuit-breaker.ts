/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascade failures by stopping calls to failing services
 * after a threshold of failures is reached.
 * 
 * States:
 * - closed: Normal operation, requests go through
 * - open: Short-circuiting, requests fail fast
 * - half-open: Testing if service recovered, limited requests allowed
 */

export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  /** Number of failures before opening the circuit */
  failureThreshold?: number;
  /** Time in ms before attempting to close the circuit */
  resetTimeout?: number;
  /** Number of successful requests in half-open before closing */
  successThreshold?: number;
  /** Callback when circuit opens */
  onOpen?: () => void;
  /** Callback when circuit closes */
  onClose?: () => void;
  /** Callback when circuit enters half-open */
  onHalfOpen?: () => void;
  /** Custom function to determine if an error should count as failure */
  isFailure?: (error: unknown) => boolean;
}

const DEFAULT_CONFIG: Required<CircuitBreakerConfig> = {
  failureThreshold: 5,
  resetTimeout: 30_000,
  successThreshold: 2,
  onOpen: () => {},
  onClose: () => {},
  onHalfOpen: () => {},
  isFailure: (error: unknown) => error instanceof Error,
};

export class CircuitBreaker {
  private state: CircuitBreakerState = 'closed';
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private readonly config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getState(): CircuitBreakerState {
    if (this.state === 'open' && Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
      this.transitionToHalfOpen();
    }
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const state = this.getState();
    
    if (state === 'open') {
      throw new CircuitBreakerOpenError('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    
    if (this.state === 'half-open') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.transitionToClosed();
      }
    }
  }

  private onFailure(error: unknown): void {
    this.successes = 0;
    
    if (this.config.isFailure(error)) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.state === 'half-open') {
        this.transitionToOpen();
      } else if (this.state === 'closed' && this.failures >= this.config.failureThreshold) {
        this.transitionToOpen();
      }
    }
  }

  private transitionToOpen(): void {
    this.state = 'open';
    this.config.onOpen();
  }

  private transitionToHalfOpen(): void {
    this.state = 'half-open';
    this.successes = 0;
    this.config.onHalfOpen();
  }

  private transitionToClosed(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.config.onClose();
  }

  /** Manually reset the circuit breaker */
  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = 0;
  }

  /** Force open the circuit (for maintenance) */
  forceOpen(): void {
    this.transitionToOpen();
  }

  /** Force close the circuit (after manual fix) */
  forceClose(): void {
    this.transitionToClosed();
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

/**
 * Registry for managing multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  getOrCreate(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(config));
    }
    return this.breakers.get(name)!;
  }

  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  remove(name: string): boolean {
    return this.breakers.delete(name);
  }

  clear(): void {
    this.breakers.clear();
  }

  getAllStates(): Record<string, CircuitBreakerState> {
    const states: Record<string, CircuitBreakerState> = {};
    for (const [name, breaker] of this.breakers) {
      states[name] = breaker.getState();
    }
    return states;
  }
}

/** Global registry instance */
export const circuitBreakerRegistry = new CircuitBreakerRegistry();