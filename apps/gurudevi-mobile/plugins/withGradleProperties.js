const { withGradleProperties, createRunOncePlugin } = require('@expo/config-plugins');

const withCustomGradleProperties = (config) => {
    return withGradleProperties(config, (config) => {
        // Increase memory for the Gradle daemon to avoid Metaspace OOM errors
        const jvmArgs = '-Xmx4g -XX:MaxMetaspaceSize=1g';

        // Check if org.gradle.jvmargs already exists
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

module.exports = createRunOncePlugin(withCustomGradleProperties, 'withCustomGradleProperties', '1.0.0');
