import type { WorkspaceSurfaceDefinition } from "@repo/core/types";

export type ClassroomWorkspaceSurfaceId =
	| "principal"
	| "section-head"
	| "grade-head"
	| "teacher"
	| "student";

export type ClassroomWorkspaceCapabilityKey =
	| "PrincipalDashboard"
	| "SectionHeadDashboard"
	| "GradeHeadDashboard"
	| "TeacherDashboard"
	| "StudentDashboard";

export type ClassroomWorkspaceSurface = WorkspaceSurfaceDefinition<
	ClassroomWorkspaceSurfaceId,
	ClassroomWorkspaceCapabilityKey
> & {
	content: React.ReactNode;
	title: string;
	subtitle?: string;
	summary?: string;
	temporalLabel?: string;
	metadata?: string[];
};

export type PrincipalInsight = Partial<
	Record<
		ClassroomWorkspaceSurfaceId,
		{
			summary?: string;
			temporalLabel?: string;
			metadata?: string[];
		}
	>
>;
