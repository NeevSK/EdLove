import type { DomainFeature } from "@repo/core/types";

export const CLASSROOM_REGISTRY: Record<string, DomainFeature> = {
	teacher_dashboard: {
		id: "teacher",
		surfaceId: "teacher",
		workspaceId: "classroom",
		capabilityKey: "TeacherDashboard",
		ownerPackage: "classroom",
		defaultZone: "work",
		defaultOrder: 40,
		label: "Teacher Studio",
		description: "Daily classroom authorship and student engagement",
		citizenshipRequired: 0, // Wanderers can use locally
		mobileSupport: true,
		webSupport: true,
	},
	student_dashboard: {
		id: "student",
		surfaceId: "student",
		workspaceId: "classroom",
		capabilityKey: "StudentDashboard",
		ownerPackage: "classroom",
		defaultZone: "work",
		defaultOrder: 50,
		label: "Student Journey",
		description: "Learning, submissions, and personal progress",
		citizenshipRequired: 0, // Wanderers can use locally
		mobileSupport: true,
		webSupport: true,
	},
};
