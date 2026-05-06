import { api } from "@repo/core/api";

import { useEffect, useMemo, useState } from "react";
import { useSchoolStats } from "../hooks/useSchoolStats";
import type { ClassroomWorkspaceSurfaceId } from "../types/workspace";
import { useStudentWorkspaceData } from "./useStudentWorkspaceData";

type SurfaceInsight = {
	summary?: string;
	temporalLabel?: string;
	metadata?: string[];
};

type UseClassroomWorkspaceInsightsArgs = {
	userId?: string | null;
	schoolId?: string | null;
	can: (action: any, subject: any, field?: string) => boolean;
};

export function useClassroomWorkspaceInsights({
	userId,
	schoolId,
	can,
}: UseClassroomWorkspaceInsightsArgs) {
	const studentWorkspace = useStudentWorkspaceData();
	const { school, stats: schoolStats } = useSchoolStats(schoolId ?? "");
	const [teacherStats, setTeacherStats] = useState<{
		activeClasses: number;
	} | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadTeacherStats = async () => {
			if (!userId || !can("manage", "TeacherDashboard")) {
				if (isMounted) setTeacherStats(null);
				return;
			}

			try {
				const classrooms = await api["classrooms"].getByTeacher(userId);
				if (!isMounted) return;

				setTeacherStats({
					activeClasses: classrooms.length,
				});
			} catch (error) {
				console.warn("Failed to load teacher workspace insights", error);
				if (isMounted) {
					setTeacherStats({
						activeClasses: 0,
					});
				}
			}
		};

		void loadTeacherStats();

		return () => {
			isMounted = false;
		};
	}, [userId, can]);

	return useMemo<
		Partial<Record<ClassroomWorkspaceSurfaceId, SurfaceInsight>>
	>(() => {
		const insights: Partial<
			Record<ClassroomWorkspaceSurfaceId, SurfaceInsight>
		> = {};

		if (teacherStats) {
			insights.teacher = {
				summary:
					teacherStats.activeClasses > 0
						? `You are actively guiding ${teacherStats.activeClasses} classroom${teacherStats.activeClasses === 1 ? "" : "s"} from this workspace.`
						: "No active classroom is linked yet, so onboarding and setup remain the next teacher move.",
				temporalLabel: teacherStats.activeClasses > 0 ? "Active" : "Setup",
				metadata: [
					`Classes ${teacherStats.activeClasses}`,
					"Academic",
					"Write owner",
				],
			};
		}

		if (can("manage", "StudentDashboard")) {
			insights.student = {
				summary:
					studentWorkspace.stats.enrolledClasses > 0
						? `Learning is live across ${studentWorkspace.stats.enrolledClasses} class${studentWorkspace.stats.enrolledClasses === 1 ? "" : "es"} with ${studentWorkspace.stats.pendingAssignments} pending assignment${studentWorkspace.stats.pendingAssignments === 1 ? "" : "s"}.`
						: "No enrolled class is active yet, so the next step is joining the first learning sanctuary.",
				temporalLabel:
					studentWorkspace.stats.pendingAssignments > 0
						? "Due soon"
						: "On track",
				metadata: [
					`Classes ${studentWorkspace.stats.enrolledClasses}`,
					`Pending ${studentWorkspace.stats.pendingAssignments}`,
					`Growth ${studentWorkspace.stats.growthPoints}`,
				],
			};
		}

		if (schoolStats && can("manage", "PrincipalDashboard")) {
			insights.principal = {
				summary: school?.name
					? `${school.name} currently spans ${schoolStats.total_classrooms ?? 0} classrooms, ${schoolStats.total_teachers ?? 0} teachers, and ${schoolStats.total_students ?? 0} students.`
					: `Institutional oversight across ${schoolStats.total_classrooms ?? 0} classrooms, ${schoolStats.total_teachers ?? 0} teachers, and ${schoolStats.total_students ?? 0} students.`,
				temporalLabel: "Institution",
				metadata: [
					`Students ${schoolStats.total_students ?? 0}`,
					`Teachers ${schoolStats.total_teachers ?? 0}`,
					`Classrooms ${schoolStats.total_classrooms ?? 0}`,
				],
			};
		}

		return insights;
	}, [teacherStats, can, studentWorkspace.stats, schoolStats, school?.name]);
}
