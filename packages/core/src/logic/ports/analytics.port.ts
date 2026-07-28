export interface IAnalyticsPort {
  identify(userId: string, properties?: Record<string, unknown>): void;
  capture(event: string, properties?: Record<string, unknown>): void;
  screen(screenName: string, properties?: Record<string, unknown>): void;
  reset(): void;
  flush?(): Promise<void>;
}
