const fs = require("node:fs");
const path = require("node:path");

const APP_ROOT = path.resolve(__dirname, "../../..");
const PACKAGES_ROOT = path.resolve(APP_ROOT, "..", "..");

describe("Principal governance boundary guardrails", () => {
	// Test 1: Principal web views should not import supabase directly
	it("prevents direct supabase imports in principal web views", () => {
		const principalFiles = [
			path.join(PACKAGES_ROOT, "admin/src/screens/PrincipalDashboard.web.tsx"),
			path.join(
				PACKAGES_ROOT,
				"classroom/src/screens/PrincipalDashboard.web.tsx",
			),
		];

		principalFiles.forEach((file) => {
			if (fs.existsSync(file)) {
				const source = fs.readFileSync(file, "utf8");
				// Should not contain direct supabase imports
				expect(source).not.toMatch(
					/import.*supabase.*from.*['"]@repo\/core['"]/,
				);
				expect(source).not.toMatch(
					/import.*supabase.*from.*['"].*supabase['"]/,
				);
			}
		});
	});

	// Test 2: Classroom package should not import admin governance orchestrators
	it("prevents classroom package from importing admin governance orchestrators", () => {
		const classroomFiles = [
			path.join(
				PACKAGES_ROOT,
				"classroom/src/screens/PrincipalDashboard.web.tsx",
			),
			path.join(PACKAGES_ROOT, "classroom/src/screens/PrincipalDashboard.tsx"),
		];

		classroomFiles.forEach((file) => {
			if (fs.existsSync(file)) {
				const source = fs.readFileSync(file, "utf8");
				// Should import from @repo/admin, not internal admin files
				expect(source).not.toMatch(/import.*from.*['"]\.\.\/admin\//);
				expect(source).not.toMatch(/import.*from.*['"]\.\/admin\//);
			}
		});
	});

	// Test 3: Principal-only actions should have capability checks
	it("ensures principal-only actions have school.manage capability checks", () => {
		const adminFiles = [
			path.join(PACKAGES_ROOT, "admin/src/screens/PrincipalDashboard.web.tsx"),
			path.join(
				PACKAGES_ROOT,
				"admin/src/screens/PrincipalNativeWorkspace.tsx",
			),
		];

		adminFiles.forEach((file) => {
			if (fs.existsSync(file)) {
				const source = fs.readFileSync(file, "utf8");
				// Should use capabilities for principal actions
				if (
					source.includes("createSchool") ||
					source.includes("deleteSchool") ||
					source.includes("manageUsers")
				) {
					expect(source).toMatch(/policy\.can\(|useCapabilities\(\)/);
				}
			}
		});
	});

	// Test 4: App-level principal screens should be thin adapters only
	it("ensures app-level principal screens remain thin adapters", () => {
		const appPrincipalFiles = [
			path.join(APP_ROOT, "src/screens/PrincipalDashboard.web.tsx"),
			path.join(
				APP_ROOT,
				"src/screens/classroom/views/PrincipalSchoolView.web.tsx",
			),
		];

		appPrincipalFiles.forEach((file) => {
			if (fs.existsSync(file)) {
				const source = fs.readFileSync(file, "utf8").trim();
				// Should be thin adapters (under 50 lines, just exports)
				const lines = source
					.split("\n")
					.filter((line) => line.trim() && !line.trim().startsWith("//"));
				expect(lines.length).toBeLessThanOrEqual(10);
				expect(source).toMatch(/export.*from.*@repo/);
			}
		});
	});
});
