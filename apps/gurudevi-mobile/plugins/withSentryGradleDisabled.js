const { withDangerousMod, withAppBuildGradle, createRunOncePlugin } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function stripSentryGradle(contents) {
  return contents
    .split('\n')
    .filter((line) => !line.includes('@sentry/react-native') && !line.includes('sentry.gradle'))
    .join('\n');
}

const withSentryGradleDisabled = (config) => {
  config = withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language === 'groovy') {
      cfg.modResults.contents = stripSentryGradle(cfg.modResults.contents);
    }
    return cfg;
  });

  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const appBuildGradlePath = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'build.gradle'
      );
      if (fs.existsSync(appBuildGradlePath)) {
        let content = fs.readFileSync(appBuildGradlePath, 'utf8');
        content = stripSentryGradle(content);
        fs.writeFileSync(appBuildGradlePath, content, 'utf8');
      }
      return cfg;
    },
  ]);
};

module.exports = createRunOncePlugin(withSentryGradleDisabled, 'withSentryGradleDisabled', '1.0.0');
