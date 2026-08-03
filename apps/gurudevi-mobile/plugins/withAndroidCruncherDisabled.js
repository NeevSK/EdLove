const { withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');
const { ensureAndroidBlockSnippets } = require('./lib/buildGradleBlock');

/**
 * Disable AAPT PNG crunching in android/app/build.gradle.
 *
 * The cruncher inflates PNGs during release builds, which can cause
 * double-compression artifacts when images are already optimized.
 * Injects an `aaptOptions { cruncherEnabled = false }` block into
 * the `android {}` block via the shared idempotent helper.
 */
const withAndroidCruncherDisabled = (config) => {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language === 'groovy') {
      cfg.modResults.contents = ensureAndroidBlockSnippets(cfg.modResults.contents, [
        {
          breadcrumb: 'cruncherEnabled = false',
          code: ['    aaptOptions {', '        cruncherEnabled = false', '    }'].join('\n'),
        },
      ]);
    }
    return cfg;
  });
};

module.exports = createRunOncePlugin(
  withAndroidCruncherDisabled,
  'withAndroidCruncherDisabled',
  '1.0.0',
);
