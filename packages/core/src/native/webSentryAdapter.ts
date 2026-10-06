// Vitest/Vite does not apply React Native's `.web` platform resolution to a
// dynamic import. Metro still selects the platform-specific sibling files.
export { BrowserSentryTelemetryAdapter } from '../adapters/web/SentryTelemetryAdapter';
