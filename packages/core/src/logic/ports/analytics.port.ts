export interface IAnalyticsPort {
  identify(userId: string, properties?: Record<string, any>): void;
  capture(event: string, properties?: Record<string, any>): void;
  screen(screenName: string, properties?: Record<string, any>): void;
  reset(): void;
  flush?(): Promise<void>;
}
