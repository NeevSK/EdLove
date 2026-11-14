/**
 * The browser APIs verger reads that TypeScript's DOM library does not describe yet, each
 * optional: most are Chromium-only, so every use is feature-detected.
 * - Network Information: `navigator.connection` (`effectiveType`, `downlink` in Mbps rounded to
 *   25 kbps, `saveData`, `type`), with a `change` event.
 * - Device Memory: `navigator.deviceMemory`, GiB rounded to a power of two, clamped to
 *   browser-specific bounds.
 * - Battery Status: `navigator.getBattery()`, secure contexts only.
 * - Storage: `navigator.storage.estimate()` (StorageManager, secure contexts): the origin's
 *   quota and usage, not the disk; either may be missing.
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
  readonly storage?: { estimate(): Promise<BrowserStorageEstimate> };
}

/**
 * Compute Pressure (W3C Compute Pressure Level 1, IDL read from the spec source on 2026-10-25):
 * `new PressureObserver(callback)`, `observe(source, { sampleInterval })` returning a promise that
 * rejects where the source or the permissions policy (`compute-pressure`) is unavailable,
 * `disconnect()`. Records carry `source`, `state` and `time`. Chromium only, secure contexts.
 */
export type BrowserPressureState = 'nominal' | 'fair' | 'serious' | 'critical';
export interface BrowserPressureRecord {
  readonly source: string;
  readonly state: BrowserPressureState;
  readonly time: number;
}
export interface BrowserPressureObserver {
  observe(source: 'cpu', options?: { readonly sampleInterval?: number }): Promise<void>;
  disconnect(): void;
}
export type BrowserPressureObserverConstructor = new (
  callback: (records: readonly BrowserPressureRecord[]) => void,
) => BrowserPressureObserver;

export interface BrowserStorageEstimate {
  readonly quota?: number;
  readonly usage?: number;
}
