const { withProjectBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');
const { EXPO_MAVEN_URL } = require('./lib/buildGradleBlock');

/**
 * Inject `https://packages.expo.dev/maven` into the `buildscript.repositories`
 * block of the ROOT android/build.gradle.  This covers Gradle classpath /
 * plugin-stage resolution where the expo Maven repo is needed.
 *
 * NOTE: the allprojects block is handled separately by `expo-build-properties`
 * via `android.extraMavenRepos` (flows through gradle.properties + the expo
 * autolinking plugin).  This plugin handles only the buildscript side because
 * no built-in Expo option injects there.
 *
 * Idempotency: if the URL is already present, no-op.
 */
const withMavenRepos = (config) => {
  return withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') return cfg;

    const marker = `url '${EXPO_MAVEN_URL}'`;
    if (cfg.modResults.contents.includes(marker)) return cfg;

    // Strategy: locate buildscript → repositories → mavenCentral() → insert
    // the expo Maven URL on the next line.  This is deliberately conservative:
    // it only touches buildscript.repositories and leaves allprojects alone.
    const bs = cfg.modResults.contents.indexOf('buildscript {');
    if (bs === -1) return cfg;

    const repos = cfg.modResults.contents.indexOf('repositories {', bs);
    if (repos === -1) return cfg;

    const mc = cfg.modResults.contents.indexOf('mavenCentral()', repos);
    if (mc === -1) return cfg;

    const insertAt = mc + 'mavenCentral()'.length;
    const eol = cfg.modResults.contents.indexOf('\n', insertAt);
    if (eol === -1) return cfg;

    cfg.modResults.contents =
      cfg.modResults.contents.slice(0, eol) +
      `\n        maven { url '${EXPO_MAVEN_URL}' }` +
      cfg.modResults.contents.slice(eol);

    return cfg;
  });
};

module.exports = createRunOncePlugin(withMavenRepos, 'withMavenRepos', '1.0.0');
