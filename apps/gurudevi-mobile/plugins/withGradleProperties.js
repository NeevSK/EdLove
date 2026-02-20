const { withGradleProperties, withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

const withCustomGradleProperties = (config) => {
    // 1. Set safe memory limits for standard CI runners (7GB total)
    // - Heap: 3GB (leaves ~4GB for system + Node + C++ compiler)
    // - Metaspace: 512MB
    // - Parallel: False (reduces peak memory usage)
    return withGradleProperties(config, (config) => {
        const jvmArgs = '-Xmx3072m -XX:MaxMetaspaceSize=512m';

        const updateProperty = (key, value) => {
            const prop = config.modResults.find((p) => p.type === 'property' && p.key === key);
            if (prop) {
                prop.value = value;
            } else {
                config.modResults.push({ type: 'property', key, value });
            }
        };

        updateProperty('org.gradle.jvmargs', jvmArgs);
        updateProperty('org.gradle.parallel', 'false');

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
