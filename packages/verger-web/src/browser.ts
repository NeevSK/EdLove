/**
 * The browser APIs verger reads that TypeScript's DOM library does not describe yet, each
 * optional: most are Chromium-only, so every use is feature-detected.
 * - Network Information: `navigator.connection` (`effectiveType`, `downlink` in Mbps rounded to
 *   25 kbps, `saveData`, `type`), with a `change` event.
 * - Device Memory: `navigator.deviceMemory`, GiB rounded to a power of two, clamped to
 *   browser-specific bounds.
 * - Battery Status: `navigator.getBattery()`, secure contexts only.
 */
export interface BrowserConnection extends EventTarget {
  readonly type?: string;
  readonly effectiveType?: string;
  readonly downlink?: number;
  readonly saveData?: boolean;
}

export interface BrowserBattery extends EventTarget {
  readonly level: number;
  readonly charging: boolean;
}

export interface BrowserNavigator {
  readonly onLine: boolean;
  readonly hardwareConcurrency?: number;
  readonly deviceMemory?: number;
  readonly connection?: BrowserConnection;
  getBattery?(): Promise<BrowserBattery>;
}
