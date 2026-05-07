const {
	withGradleProperties,
	withAppBuildGradle,
	createRunOncePlugin,
} = require("@expo/config-plugins");

const withCustomGradleProperties = (config) => {
	// 1. Set safe memory limits and optimize build speed for CI
	// - Heap: 3GB (leaves ~4GB for system + Node + C++ compiler)
	// - Metaspace: 512MB
	// - Parallel: False (reduces peak memory usage)
	// - Architectures: arm64-v8a only (saves 75% compilation time on CI)
	return withGradleProperties(config, (config) => {
		const jvmArgs = "-Xmx3072m -XX:MaxMetaspaceSize=512m";

		const updateProperty = (key, value) => {
			const prop = config.modResults.find(
				(p) => p.type === "property" && p.key === key,
			);
			if (prop) {
				prop.value = value;
			} else {
				config.modResults.push({ type: "property", key, value });
			}
		};

		updateProperty("org.gradle.jvmargs", jvmArgs);
		updateProperty("org.gradle.parallel", "false");
		updateProperty("reactNativeArchitectures", "arm64-v8a");

		return config;
	});
};

const withLintOptionsDisabled = (config) => {
	// 2. Disable the memory-intensive 'lintVital' check during release builds
	// This is where the last build crashed.
	return withAppBuildGradle(config, (config) => {
		if (config.modResults.language === "groovy") {
			const lintOptions = `
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
    }
`;
			// Check if lintOptions already exists to avoid duplication
			if (!config.modResults.contents.includes("lintOptions")) {
				config.modResults.contents = config.modResults.contents.replace(
					/android\s*\{/,
					`android {${lintOptions}`,
				);
			}
		}
		return config;
	});
};

const withBridgelessEnabled = (config) => {
	// 3. Ensure Bridgeless Mode is ENABLED (Default in RN 0.83+).
	// We are fixing JSI issues proactively by refactoring JS code,
	// NOT by disabling the modern architecture.
	return withAppBuildGradle(config, (config) => {
		if (config.modResults.language === "groovy") {
			// Remove any legacy 'bridgeless = false' if we added it before.
			// RN 0.83.2 defaults to true, so we just ensure we don't force it to false.
			if (config.modResults.contents.includes("bridgeless = false")) {
				config.modResults.contents = config.modResults.contents.replace(
					/bridgeless = false/g,
					"bridgeless = true",
				);
			}
		}
		return config;
	});
};

const withCombinedFixes = (config) => {
	// Chain all fixes: memory limits, lint skipping, AND ensuring bridgeless is enabled.
	return withBridgelessEnabled(
		withCustomGradleProperties(withLintOptionsDisabled(config)),
	);
};

module.exports = createRunOncePlugin(
	withCombinedFixes,
	"withCustomGradleProperties",
	"1.0.0",
);
