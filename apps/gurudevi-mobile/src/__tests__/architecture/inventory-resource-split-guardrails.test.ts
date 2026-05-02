const fs = require("node:fs");
const path = require("node:path");

const APP_ROOT = path.resolve(__dirname, "../../..");
const PACKAGES_ROOT = path.resolve(APP_ROOT, "..", "..");

describe("Inventory/Resource split boundary guardrails", () => {
	// Test 1: Classroom components should use CLASSROOM_RESOURCE_SCOPE
	it("ensures classroom components use proper resource scope", () => {
		const classroomFiles = [
			path.join(PACKAGES_ROOT, "classroom/src/components/ResourcesView.tsx"),
			path.join(PACKAGES_ROOT, "classroom/src/components/InventoryView.tsx"),
		];

		classroomFiles.forEach((file) => {
			if (fs.existsSync(file)) {
				const source = fs.readFileSync(file, "utf8");
				// Should use CLASSROOM_RESOURCE_SCOPE for classroom operations
				expect(source).toMatch(/CLASSROOM_RESOURCE_SCOPE/);
				// Should not use institutional scope in classroom context
				expect(source).not.toMatch(/INSTITUTIONAL_RESOURCE_SCOPE/);
			}
		});
	});

	// Test 2: Admin components should use institutional scope for school-wide assets
	it("ensures admin components use institutional resource scope", () => {
		const adminFiles = [
			path.join(PACKAGES_ROOT, "admin/src/screens/SchoolForestScreen.web.tsx"),
			path.join(PACKAGES_ROOT, "admin/src/components/InventoryManagement.tsx"),
		];

		adminFiles.forEach((file) => {
			if (fs.existsSync(file)) {
				const source = fs.readFileSync(file, "utf8");
				// Should use institutional scope for school-wide operations
				expect(source).toMatch(/INSTITUTIONAL_RESOURCE_SCOPE|institutional/);
			}
		});
	});

	// Test 3: Resource classification helper should be used consistently
	it("ensures resource classification helpers are imported where needed", () => {
		const resourceFiles = [
			path.join(PACKAGES_ROOT, "classroom/src/components/ResourcesView.tsx"),
			path.join(PACKAGES_ROOT, "classroom/src/components/InventoryView.tsx"),
			path.join(PACKAGES_ROOT, "admin/src/screens/SchoolForestScreen.web.tsx"),
		];

		resourceFiles.forEach((file) => {
			if (fs.existsSync(file)) {
				const source = fs.readFileSync(file, "utf8");
				// Should import resource scope helpers from @repo/core
				expect(source).toMatch(
					/CLASSROOM_RESOURCE_SCOPE|INSTITUTIONAL_RESOURCE_SCOPE|resolveResourceOwnerContext/,
				);
			}
		});
	});

	// Test 4: Prevent classroom resources from landing in institutional inventory APIs
	it("prevents classroom resources in institutional inventory APIs", () => {
		const classroomFiles = [
			path.join(PACKAGES_ROOT, "classroom/src/components/ResourcesView.tsx"),
			path.join(PACKAGES_ROOT, "classroom/src/components/InventoryView.tsx"),
		];

		classroomFiles.forEach((file) => {
			if (fs.existsSync(file)) {
				const source = fs.readFileSync(file, "utf8");
				// Should not call institutional inventory APIs directly
				expect(source).not.toMatch(/adminInventoryAPI|admin\.inventory/);
				// Should use classroom-scoped resource APIs
				expect(source).toMatch(/api\.resources\.create|api\.inventory\.update/);
			}
		});
	});

	// Test 5: Institutional assets should not route to classroom resource APIs
	it("prevents institutional assets from using classroom resource APIs", () => {
		const adminFiles = [
			path.join(PACKAGES_ROOT, "admin/src/screens/SchoolForestScreen.web.tsx"),
		];

		adminFiles.forEach((file) => {
			if (fs.existsSync(file)) {
				const source = fs.readFileSync(file, "utf8");
				// Should not use classroom resource APIs for institutional assets
				expect(source).not.toMatch(/api\.resources\.create.*classroom_id/);
				// Should use admin inventory APIs for institutional assets
				expect(source).toMatch(/adminInventoryAPI|reportingAPI|inventoryAPI/);
			}
		});
	});
});
