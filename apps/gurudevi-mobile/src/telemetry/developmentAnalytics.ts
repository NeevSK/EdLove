import { injectPostHog, sanitizeTelemetryData } from '@repo/core/monitoring';
import { AppState, Platform } from 'react-native';
import { recordDevelopmentTrace } from '@/boot/startupTelemetry';
import { writeDevelopmentTelemetrySessionManifest } from './developmentTelemetryDatabase';
import {
  flushDevelopmentTelemetry,
  getDevelopmentTelemetryStatus,
  saveDevelopmentTelemetry,
  setDevelopmentTelemetrySource,
} from './localDevelopmentTelemetry';

declare global {
  var __GURUDEVI_EARLY_BOOT_MARK__:
    | { readonly wallTimeMs: number; readonly monotonicTimeMs: number | null }
    | null
    | undefined;
}

function readEarlyBootstrapMark(): { readonly atMs: number; readonly wallTimeMs: number } | null {
  const mark = globalThis.__GURUDEVI_EARLY_BOOT_MARK__;
  if (!mark) return null;
  if (typeof mark.monotonicTimeMs === 'number' && Number.isFinite(mark.monotonicTimeMs)) {
    return { atMs: mark.monotonicTimeMs, wallTimeMs: mark.wallTimeMs };
  }
  return {
    atMs: Math.max(0, performance.now() - Math.max(0, Date.now() - mark.wallTimeMs)),
    wallTimeMs: mark.wallTimeMs,
  };
}

function scheduleDevelopmentSessionManifest(): void {
  const startedAtMs = performance.now();
  const persistManifest = () => {
    void Promise.all([
      import('expo-constants'),
      import('expo-device'),
      import('expo-application'),
      import('expo-observe'),
    ])
      .then(([constantsModule, device, application, observe]) =>
        writeDevelopmentTelemetrySessionManifest(getDevelopmentTelemetryStatus().session, {
          captureMode: 'development-local-detail',
          startedAtMs,
          timeOriginMs: Date.now() - performance.now(),
          platform: Platform.OS,
          appVersion: constantsModule.default.expoConfig?.version ?? null,
          nativeBuildVersion: application.nativeBuildVersion,
          deviceModel: device.modelName,
          osVersion: device.osVersion,
          vergerMode: process.env.EXPO_PUBLIC_GURUDEVI_RUNTIME ?? 'unset',
          easClientId: observe.Observe.clientId,
        }),
      )
      .then(() =>
        setDevelopmentTelemetrySource(
          'session-metadata',
          'complete',
          'Safe app, build, platform, model, and OS metadata recorded.',
        ),
      )
      .catch(() =>
        setDevelopmentTelemetrySource(
          'session-metadata',
          'failed',
          'App or device metadata could not be recorded.',
        ),
      );
  };

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => setTimeout(persistManifest, 0));
  } else {
    setTimeout(persistManifest, 0);
  }
}

if (__DEV__) {
  scheduleDevelopmentSessionManifest();
  const earlyBootstrap = readEarlyBootstrapMark();
  if (earlyBootstrap) {
    recordDevelopmentTrace({
      category: 'process-bootstrap',
      task: 'early-bootstrap-shim',
      state: 'complete',
      at_ms: earlyBootstrap.atMs,
      wall_time_ms: earlyBootstrap.wallTimeMs,
    });
    setDevelopmentTelemetrySource(
      'early-bootstrap-marker',
      'complete',
      'Captured by the no-import shim before the app dependency graph evaluates.',
    );
  } else {
    setDevelopmentTelemetrySource(
      'early-bootstrap-marker',
      'failed',
      'The early bootstrap shim did not expose its timestamp.',
    );
  }
  saveDevelopmentTelemetry({
    source: 'runtime',
    name: 'development-telemetry-started',
    attributes: {
      transport: 'local-sqlite-and-jsonl',
      posthog_build_enabled: process.env.EXPO_PUBLIC_POSTHOG_ENABLED === 'true',
      posthog_key_configured: Boolean(process.env.EXPO_PUBLIC_POSTHOG_API_KEY),
      sentry_dsn_configured: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN),
      verger_build_mode: process.env.EXPO_PUBLIC_GURUDEVI_RUNTIME ?? 'unset',
    },
  });
  setDevelopmentTelemetrySource(
    'app-runtime',
    'recording',
    'Fixed-field app runtime and analytics events.',
  );
  setDevelopmentTelemetrySource(
    'route-readiness',
    'recording',
    'Event-driven bootstrap gate transitions with route buckets and state booleans only.',
  );
  setDevelopmentTelemetrySource(
    'startup-boundaries',
    'recording',
    'Fixed-clock markers separate entry module evaluation, root effect and essential startup.',
  );
  setDevelopmentTelemetrySource(
    'screen-readiness',
    'recording',
    'Local screen-ready markers after the first usable Self or welcome content commits.',
  );
  setDevelopmentTelemetrySource(
    'rn-devtools-profile',
    'disabled',
    'Capture manually in RN DevTools and link the original profile.',
  );
  setDevelopmentTelemetrySource(
    'hermes-heap-profile',
    'disabled',
    'Heap snapshots are manual, opt-in artifacts.',
  );
  setDevelopmentTelemetrySource(
    'android-native-profile',
    'disabled',
    'Capture manually with Android Studio or Perfetto.',
  );
  // This development transport is local only. Cloud analytics remains a separate,
  // explicit configuration; the port's existing opt-out and sanitizer still apply.
  injectPostHog({
    capture: (name, attributes) =>
      saveDevelopmentTelemetry({
        source: 'analytics',
        name,
        attributes: sanitizeTelemetryData(attributes),
      }),
    identify: (_principal, attributes) =>
      saveDevelopmentTelemetry({
        source: 'analytics',
        name: 'identity-context-changed',
        attributes: sanitizeTelemetryData(attributes),
      }),
    screen: (name, attributes) =>
      saveDevelopmentTelemetry({
        source: 'analytics',
        name: 'screen-view',
        attributes: { screen: name, ...sanitizeTelemetryData(attributes) },
      }),
    reset: () =>
      saveDevelopmentTelemetry({ source: 'analytics', name: 'analytics-reset', attributes: {} }),
    flush: flushDevelopmentTelemetry,
  });
  AppState.addEventListener('change', (state) => {
    if (state !== 'active') void flushDevelopmentTelemetry();
  });
}
