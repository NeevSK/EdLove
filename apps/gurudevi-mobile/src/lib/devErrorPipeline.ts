/**
 * Dev Error Pipeline — Aggregates and reports cascading mobile runtime errors.
 *
 * When a React Native render crash happens (such as a hook order violation),
 * React typically triggers 3-5 cascading errors (sibling unmount errors, null derefs).
 * In dev, this floods LogBox and terminal logs.
 *
 * This pipeline:
 * 1. Debounces incoming errors over a 350ms window.
 * 2. Identifies the primary root-cause error vs cascading fallout.
 * 3. Formats an actionable, single consolidated diagnostic report.
 * 4. Dispatches the batch to the local dev API (port 3000) so it's instantly
 *    available in `apps/gurudevi-mobile/scratch/latest_mobile_errors.json`.
 */

import { Platform } from 'react-native';

export interface DevErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  source: 'errorUtils' | 'promise' | 'console' | 'boundary';
  timestamp: string;
  isFatal?: boolean;
}

export interface DevErrorBatch {
  timestamp: string;
  count: number;
  primary: DevErrorInfo;
  cascades: DevErrorInfo[];
}

let errorBuffer: DevErrorInfo[] = [];
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 350;

async function sendDiagnosticReport(batch: DevErrorBatch): Promise<void> {
  // Print unified high-visibility banner in Metro console
  console.warn(
    `\n╔══════════════════════════════════════════════════════════════════════════════╗\n` +
      `║ 🚨 [DEV ERROR PIPELINE] Aggregated ${batch.count} cascading error(s)                      ║\n` +
      `║ ROOT CAUSE: ${batch.primary.message.slice(0, 60)}\n` +
      `║ SOURCE: ${batch.primary.source} | FATAL: ${Boolean(batch.primary.isFatal)}\n` +
      (batch.cascades.length > 0
        ? `║ CASCADE FALLOUT (${batch.cascades.length}):\n` +
          batch.cascades
            .map((c, i) => `║   [${i + 1}/${batch.cascades.length}] ${c.message.slice(0, 56)}`)
            .join('\n') +
          '\n'
        : '') +
      `╚══════════════════════════════════════════════════════════════════════════════╝\n`,
  );

  // Dispatch to local dev server over reversed port 3000
  try {
    const host = Platform.OS === 'android' ? 'localhost' : 'localhost';
    await fetch(`http://${host}:3000/dev/diagnostics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    }).catch(() => {
      // Dev server might be restarting or unreachable; silent catch
    });
  } catch {
    // Non-critical background dispatch
  }
}

function flushErrorBatch(): void {
  if (errorBuffer.length === 0) return;

  const currentBatch = [...errorBuffer];
  errorBuffer = [];

  const [primary, ...cascades] = currentBatch;
  if (!primary) return;

  const report: DevErrorBatch = {
    timestamp: new Date().toISOString(),
    count: currentBatch.length,
    primary,
    cascades,
  };

  void sendDiagnosticReport(report);
}

/**
 * Ingest an error into the dev batching pipeline.
 */
export function recordDevError(info: Omit<DevErrorInfo, 'timestamp'>): void {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return;
  }

  const enriched: DevErrorInfo = {
    ...info,
    timestamp: new Date().toISOString(),
  };

  errorBuffer.push(enriched);

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    flushErrorBatch();
  }, DEBOUNCE_MS);
}
