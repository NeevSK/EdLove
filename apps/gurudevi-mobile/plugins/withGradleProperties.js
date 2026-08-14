const {
  withGradleProperties,
  withAppBuildGradle,
  createRunOncePlugin,
} = require('@expo/config-plugins');
const { ensureAndroidBlockSnippets, replaceIfFound } = require('./lib/buildGradleBlock');

/**
 * Combined plugin that addresses three concerns:
 *
 * 1. gradle.properties — memory limits, parallel=false, architecture selection
 * 2. app/build.gradle — lintVital disabled for release stability
 * 3. app/build.gradle — bridgeless mode forced on (safety net)
 *
 * All android{} block mutations use the shared `buildGradleBlock` helper
 * for idempotency and ordering.  gradle.properties mutations use the
 * built-in `withGradleProperties` mod.
 *
 * ARCHITECTURE SELECTION:
 * Default: `arm64-v8a` (fastest build, matches committed CI intent).
 * Override: set `GRADLE_ABI` env var (e.g. `x86_64` for emulators, or
 * `x86_64,arm64-v8a` for multi-ABI).  This is documented in
 * `docs/Learning/EXPO_BUILD_RUNBOOK.md`.
 */

const withCustomGradleProperties = (config) => {
  return withGradleProperties(config, (cfg) => {
    const arch = process.env.GRADLE_ABI || 'arm64-v8a';

    const updateProperty = (key, value) => {
      const prop = cfg.modResults.find((p) => p.type === 'property' && p.key === key);
      if (prop) {
        prop.value = value;
      } else {
        cfg.modResults.push({ type: 'property', key, value });
      }
    };

    const gradleHeap = process.env.GRADLE_MAX_HEAP || '3072m';
    const gradleMetaspace = process.env.GRADLE_MAX_METASPACE || '384m';
    const gradleWorkers = process.env.GRADLE_MAX_WORKERS || '1';
    updateProperty(
      'org.gradle.jvmargs',
      `-Xmx${gradleHeap} -XX:MaxMetaspaceSize=${gradleMetaspace} -XX:+UseG1GC`,
    );
    updateProperty('org.gradle.parallel', 'false');
    updateProperty('org.gradle.workers.max', gradleWorkers);
    updateProperty('org.gradle.daemon', 'false');
    updateProperty('kotlin.daemon.jvm.options', '-Xmx1024m');
    updateProperty('reactNativeArchitectures', arch);

    return cfg;
  });
};

const withLintOptionsDisabled = (config) => {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language === 'groovy') {
      cfg.modResults.contents = ensureAndroidBlockSnippets(cfg.modResults.contents, [
        {
          breadcrumb: 'lintOptions',
          code: [
            '    lintOptions {',
            '        checkReleaseBuilds false',
            '        abortOnError false',
            '    }',
          ].join('\n'),
        },
      ]);
    }
    return cfg;
  });
};

const withBridgelessEnabled = (config) => {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language === 'groovy') {
      cfg.modResults.contents = replaceIfFound(
        cfg.modResults.contents,
        'bridgeless = false',
        'bridgeless = true',
      );
    }
    return cfg;
  });
};

const withCombinedGradleFixes = (config) => {
  return withBridgelessEnabled(withLintOptionsDisabled(withCustomGradleProperties(config)));
};

module.exports = createRunOncePlugin(
  withCombinedGradleFixes,
  'withCustomGradleProperties',
  '1.0.0',
);
