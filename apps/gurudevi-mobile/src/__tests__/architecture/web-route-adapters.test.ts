const fs = require("node:fs");
const path = require("node:path");

const APP_ROOT = path.resolve(__dirname, "../../..");

const ADAPTERS = [
	{
		file: path.join(APP_ROOT, "src", "screens", "SelfScreen.web.tsx"),
		expected: "export { SelfScreen as default } from '@repo/self';",
	},
	{
		file: path.join(APP_ROOT, "src", "screens", "LibraryScreen.web.tsx"),
		expected: "export { LibraryScreen as default } from '@repo/library';",
	},
	{
		file: path.join(APP_ROOT, "src", "screens", "ProfileScreen.web.tsx"),
		expected: "export { ProfileScreenWeb as default } from '@repo/profile';",
	},
	{
		file: path.join(APP_ROOT, "src", "screens", "PublicProfileScreen.web.tsx"),
		expected:
			"export { PublicProfileScreenWeb as default } from '@repo/profile';",
	},
	{
		file: path.join(
			APP_ROOT,
			"src",
			"screens",
			"profile",
			"FullProfileScreen.web.tsx",
		),
		expected:
			"export { FullProfileScreenWeb as default } from '@repo/profile';",
	},
	{
		file: path.join(
			APP_ROOT,
			"src",
			"screens",
			"classroom",
			"FormBuilderScreen.web.tsx",
		),
		expected:
			"export { FormBuilderScreenWeb as default } from '@repo/form-builder';",
	},
	{
		file: path.join(
			APP_ROOT,
			"src",
			"screens",
			"classroom",
			"PublicFormScreen.web.tsx",
		),
		expected:
			"export { PublicFormScreenWeb as default } from '@repo/form-builder';",
	},
	{
		file: path.join(
			APP_ROOT,
			"src",
			"screens",
			"library",
			"CollectionDetailScreen.web.tsx",
		),
		expected:
			"export { CollectionDetailScreenWeb as default } from '@repo/library';",
	},
	{
		file: path.join(APP_ROOT, "src", "screens", "AttendanceScreen.web.tsx"),
		expected:
			"export { AttendanceScreenWeb as default } from '@repo/classroom';",
	},
	{
		file: path.join(APP_ROOT, "src", "screens", "GradebookScreen.web.tsx"),
		expected:
			"export { GradebookScreenWeb as default } from '@repo/classroom';",
	},
	{
		file: path.join(
			APP_ROOT,
			"src",
			"screens",
			"ClassroomDetailScreen.web.tsx",
		),
		expected:
			'/**\n * ClassroomDetailScreen (Web Adapter)\n * \n * Thin adapter pointing to @repo/classroom implementation.\n * Follows the "Library First" and "Thin App Layer" architectural rules.\n */\nexport { ClassroomDetailScreenWeb as default } from \'@repo/classroom\';',
	},
	{
		file: path.join(APP_ROOT, "src", "screens", "AuthScreen.web.tsx"),
		expected:
			'/**\n * AuthScreen (Web Adapter)\n * \n * Thin adapter pointing to @repo/core implementation.\n * Follows the "Library First" and "Thin App Layer" architectural rules.\n */\nexport { AuthScreenWeb as default } from \'@repo/core\';',
	},
	{
		file: path.join(
			APP_ROOT,
			"src",
			"screens",
			"classroom",
			"NoSchoolView.web.tsx",
		),
		expected:
			'/**\n * NoSchoolView (Web Adapter)\n * \n * Thin adapter pointing to @repo/classroom implementation.\n * Follows the "Library First" and "Thin App Layer" architectural rules.\n */\nexport { default } from \'@repo/classroom/screens/NoSchoolView.web\';',
	},
	{
		file: path.join(
			APP_ROOT,
			"src",
			"screens",
			"InvitationWelcomeScreen.web.tsx",
		),
		expected:
			'/**\n * InvitationWelcomeScreen (Web Adapter)\n * \n * Thin adapter pointing to @repo/core implementation.\n * Follows the "Library First" and "Thin App Layer" architectural rules.\n */\nexport { default } from \'@repo/core/screens/InvitationWelcomeScreen\';',
	},
];

describe("Web route adapters", () => {
	it.each(ADAPTERS)("%s remains a thin package adapter", ({
		file,
		expected,
	}) => {
		const source = fs.readFileSync(file, "utf8").trim();
		expect(source).toBe(expected);
	});
});
