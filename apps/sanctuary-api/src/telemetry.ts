/**
 * Telemetry bootstrap for LLM observability.
 *
 * When AI_SDK=vercel, initializes Foglamp to instrument all Vercel AI SDK
 * streamText / generateText calls. No-op when AI_SDK=tanstack (default).
 */
import { initializeOtel } from './telemetry/otel';

await initializeOtel();

if (typeof process !== 'undefined' && process.env.AI_SDK === 'vercel') {
  const { registerTelemetry } = await import('ai');
  const { foglamp } = await import('foglamp');
  registerTelemetry(foglamp());
  console.log('[telemetry] Foglamp observability enabled (Vercel AI SDK)');
}
