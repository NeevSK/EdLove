import type { VergerTelemetrySink } from '@repo/core/verger';
import { trackProductEvent } from '@repo/core/monitoring';

/**
 * Verger's telemetry into the app's analytics port: one typed envelope, `verger_telemetry`. It
 * goes wherever the app sends product analytics, under the same opt-out and sanitizer, and
 * nowhere while no provider is injected. Volume is bounded per launch by the host's config
 * (`telemetryMaxEvents`, `telemetryMaxSummaries`, `telemetrySummaryEveryMs`).
 */
export const vergerTelemetrySink: VergerTelemetrySink = (name, attributes) => {
  // The sanitizer drops every `*_id` key (identity protection); the policy's id is a catalog name.
  const { policy_id: policyName, ...rest } = attributes;
  trackProductEvent('verger_telemetry', {
    verger_event: name,
    ...rest,
    ...(policyName === undefined ? {} : { policy_name: policyName }),
  });
};
