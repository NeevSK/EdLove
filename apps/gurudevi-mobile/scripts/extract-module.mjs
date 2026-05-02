import fs from "node:fs";

const bundlePath =
	"dist/_expo/static/js/web/index-dcca9963fe14c16a710fc863093064c8.js";
const bundleInfo = fs.statSync(bundlePath);
console.log(
	`Analyzing bundle: ${bundlePath} (${(bundleInfo.size / 1024 / 1024).toFixed(2)} MB)`,
);

const bundleCode = fs.readFileSync(bundlePath, "utf8");

[3620, 5614, 5615].forEach((id) => {
	// Find where the module is defined. Usually: __d(function(...) {...}, 3620, [deps], "filename")
	// Let's do a simple indexOf and substring to avoid complex regex
	const searchString = `},${id},[`;
	const searchString2 = `},${id}, [`;

	let index = bundleCode.indexOf(searchString);
	if (index === -1) {
		index = bundleCode.indexOf(searchString2);
	}

	if (index !== -1) {
		console.log(`\n--- Found Module ${id} ---`);
		// Find the start of the __d call for this module.
		// It's going to be somewhere before `index`. We can scan backwards for '__d('
		const start = bundleCode.lastIndexOf("__d(", index);
		if (start !== -1) {
			// Find the end of this module definition. Roughly after `index`, look for the closing of `__d(...)`
			// Instead of perfect parsing, just grab 500 chars around `index`
			const end = Math.min(bundleCode.length, index + 200);
			console.log("Definition Context:");
			console.log(bundleCode.substring(start, end));

			// Also let's find the filename. It's usually the argument after deps array.
			const depsEnd = bundleCode.indexOf("]", index);
			if (depsEnd !== -1) {
				const afterDeps = bundleCode.substring(depsEnd + 1, depsEnd + 200);
				const fileMatch = afterDeps.match(/,"([^"]+)"/);
				if (fileMatch) {
					console.log(`Filename: ${fileMatch[1]}`);
				}
			}
		}
	} else {
		console.log(
			`\n--- Module ${id} not found with standard Metro __d pattern. ---`,
		);
	}
});
