// Initialize Rozenite DevTools plugins during development environment builds
if (__DEV__) {
  try {
    // Dynamically require Rozenite performance monitoring setup if in development mode
    const { registerPlugin } = require('rozenite');
    const PerformanceMonitorPlugin = require('@rozenite/performance-monitor-plugin');

    registerPlugin(PerformanceMonitorPlugin, {
      enableProfiling: true,
      traceNetwork: true,
      cpuMonitoringIntervalMs: 500,
    });

    console.log('[DevTools] Rozenite Performance Monitor Plugin Registered successfully.');
  } catch (e) {
    console.warn('[DevTools] Failed to load Rozenite DevTools plugins:', e.message);
  }
}
