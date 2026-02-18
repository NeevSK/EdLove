const { withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

const withAndroidCruncherDisabled = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = disableCruncher(config.modResults.contents);
        }
        return config;
    });
};

function disableCruncher(buildGradle) {
    if (buildGradle.includes('cruncherEnabled = false')) {
        return buildGradle;
    }

    // It's safer to just look for the android block start
    const pattern = /android\s*\{/;
    if (pattern.test(buildGradle)) {
        return buildGradle.replace(pattern, 'android {\n    aaptOptions {\n        cruncherEnabled = false\n    }\n');
    }
    return buildGradle;
}

module.exports = createRunOncePlugin(withAndroidCruncherDisabled, 'withAndroidCruncherDisabled', '1.0.0');
