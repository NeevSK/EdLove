import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const classroomRoot = path.join(repoRoot, "packages", "classroom", "src");

const allowedSupabaseFiles = new Set([
	"packages/classroom/src/components/ClaimInviteModal.tsx",
	"packages/classroom/src/components/ClassroomEchoSection.tsx",
	"packages/classroom/src/components/ClassroomList.tsx",
	"packages/classroom/src/components/CreateClassroomModal.tsx",
	"packages/classroom/src/hooks/useClassroomRoleData.ts",
	"packages/classroom/src/hooks/useSchoolSections.ts",
	"packages/classroom/src/hooks/useStudentDashboardHooks.ts",
	"packages/classroom/src/logic/reportGenerator.ts",
]);

const allowedAdminBridgeFiles = new Set([
	"packages/classroom/src/components/GlobalCreateModal.tsx",
	"packages/classroom/src/components/GlobalCreateModal.web.tsx",
	"packages/classroom/src/screens/FounderDashboard.tsx",
	"packages/classroom/src/screens/FounderSchoolDashboard.tsx",
	"packages/classroom/src/hooks/useEcosystemStats.ts",
	"packages/classroom/src/hooks/usePrincipalObservations.ts",
	"packages/classroom/src/hooks/useSchoolInvites.ts",
	"packages/classroom/src/screens/AttendanceReportScreen.tsx",
	"packages/classroom/src/screens/principal/DashboardContent.tsx",
	"packages/classroom/src/screens/principal/types.ts",
	"packages/classroom/src/screens/PrincipalDashboard.tsx",
	"packages/classroom/src/screens/PrincipalDashboard.web.tsx",
	"packages/classroom/src/workspace/usePrincipalWorkspaceSurfaces.tsx",
]);

const violations = [];
let checkedFiles = 0;

function normalize(filePath) {
	return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(fullPath);
			continue;
		}
		if (!/\.(ts|tsx)$/.test(entry.name)) continue;

		checkedFiles += 1;
		const source = fs.readFileSync(fullPath, "utf8");
		const relativePath = normalize(fullPath);

		if (
			source.includes("packages/core/src") ||
			source.includes("packages/admin/src") ||
			source.includes("packages/workforce/src") ||
			/@repo\/[a-z-]+\/src\//.test(source)
		) {
			violations.push({
				file: relativePath,
				reason: "Cross-package deep import into another package internals.",
			});
		}

		const hasDirectSupabase =
			/\bsupabase\s*\.\s*(from|channel|storage)\b/m.test(source);
		if (hasDirectSupabase && !allowedSupabaseFiles.has(relativePath)) {
			violations.push({
				file: relativePath,
				reason:
					"Direct Supabase usage outside the classroom Phase 1 exception list. Move persistence behind a core/admin API or repository adapter.",
			});
		}

		const hasAdminOrWorkforceBridge = /@repo\/(admin|workforce)\b/.test(source);
		if (
			hasAdminOrWorkforceBridge &&
			!allowedAdminBridgeFiles.has(relativePath)
		) {
			violations.push({
				file: relativePath,
				reason:
					"New classroom -> admin/workforce coupling outside the Phase 1 exception list. Route it through an approved public bridge or move ownership.",
			});
		}
	}
}

walk(classroomRoot);

if (violations.length > 0) {
	console.error(
		JSON.stringify(
			{
				ok: false,
				checkedFiles,
				exceptionBaselines: {
					allowedSupabaseFiles: allowedSupabaseFiles.size,
					allowedAdminBridgeFiles: allowedAdminBridgeFiles.size,
				},
				violations,
			},
			null,
			2,
		),
	);
	process.exitCode = 1;
} else {
	console.log(
		JSON.stringify(
			{
				ok: true,
				checkedFiles,
				exceptionBaselines: {
					allowedSupabaseFiles: allowedSupabaseFiles.size,
					allowedAdminBridgeFiles: allowedAdminBridgeFiles.size,
				},
			},
			null,
			2,
		),
	);
}
