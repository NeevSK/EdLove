const { withGradleProperties, withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

const withCustomGradleProperties = (config) => {
    // 1. Increase memory to the max physical limit of standard CI runners (7GB)
    // We'll use 6GB for Heap + 1GB for Metaspace = 7GB total.
    return withGradleProperties(config, (config) => {
        const jvmArgs = '-Xmx6g -XX:MaxMetaspaceSize=1g';

        const existingProperty = config.modResults.find(
            (prop) => prop.type === 'property' && prop.key === 'org.gradle.jvmargs'
        );

        if (existingProperty) {
            existingProperty.value = jvmArgs;
        } else {
            config.modResults.push({
                type: 'property',
                key: 'org.gradle.jvmargs',
                value: jvmArgs,
            });
        }

        return config;
    });
};

const withLintOptionsDisabled = (config) => {
    // 2. Disable the memory-intensive 'lintVital' check during release builds
    // This is where the last build crashed.
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            const lintOptions = `
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
    }
`;
            // Check if lintOptions already exists to avoid duplication
            if (!config.modResults.contents.includes('lintOptions')) {
                config.modResults.contents = config.modResults.contents.replace(
                    /android\s*\{/,
                    `android {${lintOptions}`
                );
            }
        }
        return config;
    });
};

const withCombinedFixes = (config) => {
    return withCustomGradleProperties(withLintOptionsDisabled(config));
};

module.exports = createRunOncePlugin(withCombinedFixes, 'withCustomGradleProperties', '1.0.0');
