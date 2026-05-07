const {
	withDangerousMod,
	createRunOncePlugin,
} = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

const withSentryProperties = (config) => {
	return withDangerousMod(config, [
		"android",
		async (config) => {
			const sentryPropsPath = path.join(
				config.modRequest.platformProjectRoot,
				"sentry.properties",
			);

			const org = process.env.SENTRY_ORG || "intuitui-labs";
			const project = process.env.SENTRY_PROJECT || "gurudevi-mobile";

			console.log(
				`[withSentryProperties] Injecting properties into ${sentryPropsPath}`,
			);
			console.log(`[withSentryProperties] Org: ${org}, Project: ${project}`);

			const content = [
				`defaults.org=${org}`,
				`defaults.project=${project}`,
				"",
			].join("\n");

			fs.writeFileSync(sentryPropsPath, content);

			return config;
		},
	]);
};

module.exports = createRunOncePlugin(
	withSentryProperties,
	"withSentryProperties",
	"1.0.0",
);
