const { withProjectBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');
const { EXPO_MAVEN_URL } = require('./lib/buildGradleBlock');

/**
 * Optional custom Maven repository hook.
 *
 * This plugin is intentionally not registered by default. Register it only
 * after verifying that EXPO_MAVEN_URL serves valid Maven XML/POM responses.
 */
const withMavenRepos = (config) => {
  return withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') return cfg;
    const marker = `url '${EXPO_MAVEN_URL}'`;
    if (cfg.modResults.contents.includes(marker)) return cfg;
    const bs = cfg.modResults.contents.indexOf('buildscript {');
    const repos = cfg.modResults.contents.indexOf('repositories {', bs);
    const mc = cfg.modResults.contents.indexOf('mavenCentral()', repos);
    if (bs === -1 || repos === -1 || mc === -1) return cfg;
    const eol = cfg.modResults.contents.indexOf('\n', mc);
    if (eol === -1) return cfg;
    cfg.modResults.contents =
      cfg.modResults.contents.slice(0, eol) +
      `\n        maven { url '${EXPO_MAVEN_URL}' }` +
      cfg.modResults.contents.slice(eol);
    return cfg;
  });
};

module.exports = createRunOncePlugin(withMavenRepos, 'withMavenRepos', '1.0.0');
