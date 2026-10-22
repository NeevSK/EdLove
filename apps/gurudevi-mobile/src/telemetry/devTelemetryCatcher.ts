/**
 * Dev Telemetry Catcher & Metro Terminal Inspector
 *
 * Intercepts Expo Observe TTI markers, route events, and governor decisions
 * during local development (__DEV__ = true).
 *
 * Features:
 * - Outputs clean, human-readable timing diagnostics to the Metro terminal
 * - Maintains an in-memory Ring Buffer of the last 50 events for on-device inspection
 * - Operates with zero cloud latency and zero vendor lock-in
 */

export interface TelemetryDevRecord {
  id: string;
  timestamp: number;
  category: 'observe' | 'governor' | 'sync' | 'error';
  name: string;
  durationMs?: number;
  attributes?: Record<string, unknown>;
}

class DevTelemetryCatcher {
  private static instance: DevTelemetryCatcher | null = null;
  private readonly buffer: TelemetryDevRecord[] = [];
  private readonly maxBufferSize = 50;

  static getInstance(): DevTelemetryCatcher {
    if (!DevTelemetryCatcher.instance) {
      DevTelemetryCatcher.instance = new DevTelemetryCatcher();
    }
    return DevTelemetryCatcher.instance;
  }

  record(event: Omit<TelemetryDevRecord, 'id' | 'timestamp'>) {
    const record: TelemetryDevRecord = {
      ...event,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };

    this.buffer.unshift(record);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.pop();
    }

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      this.printToConsole(record);
    }
  }

  getRecentEvents(): readonly TelemetryDevRecord[] {
    return this.buffer;
  }

  clear() {
    this.buffer.length = 0;
  }

  private printToConsole(record: TelemetryDevRecord) {
    const time = new Date(record.timestamp).toLocaleTimeString();
    switch (record.category) {
      case 'observe':
        console.log(
          `%c[Observe DEV] %c${time} | ⏱️ ${record.name} | TTI: ${record.durationMs ?? 'marker'}ms`,
          'color: #00D4BB; font-weight: bold;',
          'color: #888;',
          record.attributes ?? '',
        );
        break;
      case 'governor':
        console.log(
          `%c[Governor DEV] %c${time} | 🛡️ ${record.name}`,
          'color: #FFB020; font-weight: bold;',
          'color: #888;',
          record.attributes ?? '',
        );
        break;
      case 'sync':
        console.log(
          `%c[Sync DEV] %c${time} | 🔄 ${record.name}`,
          'color: #7B61FF; font-weight: bold;',
          'color: #888;',
          record.attributes ?? '',
        );
        break;
      default:
        console.log(`[Telemetry DEV] ${time} | ${record.name}`, record.attributes);
    }
  }
}

export const devTelemetryCatcher = DevTelemetryCatcher.getInstance();
