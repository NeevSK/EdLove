const { withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

const withSentryGradleDisabled = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            const contents = config.modResults.contents;
            // The line we're looking for is usually:
            // apply from: "../../node_modules/@sentry/react-native/sentry.gradle"
            // We'll use a regex to find it and comment it out or remove it.
            const sentryApplyRegex = /apply from:.*sentry\.gradle.*/g;

            if (sentryApplyRegex.test(contents)) {
                console.log('[withSentryGradleDisabled] Detected sentry.gradle application. Removing it.');
                config.modResults.contents = contents.replace(sentryApplyRegex, (match) => {
                    return `// Removed by withSentryGradleDisabled: ${match}`;
                });
            } else {
                console.log('[withSentryGradleDisabled] No sentry.gradle application found to remove.');
            }
        }
        return config;
    });
};

module.exports = createRunOncePlugin(withSentryGradleDisabled, 'withSentryGradleDisabled', '1.0.0');
