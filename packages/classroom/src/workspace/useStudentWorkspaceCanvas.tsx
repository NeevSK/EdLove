import { WORKSPACE_CANVAS_ZONES } from "@repo/core/logic";
import { useWorkspaceLayoutSync } from "@repo/core/native";
import type {
	ResolvedWorkspaceSurface,
	WorkspaceLayout,
	WorkspaceZoneId,
} from "@repo/core/types";

import { WorkspaceCanvas } from "@repo/ui/components/workspace";
import { Box, HStack, Pressable, Text } from "@repo/ui/primitives";

import { useMemo } from "react";
import type {
	StudentDashboardCapabilityKey,
	StudentDashboardSurface,
	StudentDashboardSurfaceId,
} from "./useStudentDashboardSurfaces";

type StudentResolvedSurface = StudentDashboardSurface &
	ResolvedWorkspaceSurface<
		StudentDashboardSurfaceId,
		StudentDashboardCapabilityKey
	>;

const LEGACY_STUDENT_SURFACE_ID_MAP: Partial<
	Record<
		"assignment-queue" | "growth-goals" | StudentDashboardSurfaceId,
		StudentDashboardSurfaceId
	>
> = {
	"assignment-queue": "demo-assignments",
	"growth-goals": "demo-goals",
};

function migrateStudentSurfaceId(
	surfaceId: StudentDashboardSurfaceId | "assignment-queue" | "growth-goals",
): StudentDashboardSurfaceId {
	return (
		LEGACY_STUDENT_SURFACE_ID_MAP[surfaceId] ??
		(surfaceId as StudentDashboardSurfaceId)
	);
}

function migrateStudentWorkspaceLayout(
	layout: WorkspaceLayout<StudentDashboardSurfaceId>,
): WorkspaceLayout<StudentDashboardSurfaceId> {
	return {
		...layout,
		order: layout.order.map((surfaceId) => migrateStudentSurfaceId(surfaceId)),
		hidden: layout.hidden.map((surfaceId) =>
			migrateStudentSurfaceId(surfaceId),
		),
		pinned: layout.pinned.map((surfaceId) =>
			migrateStudentSurfaceId(surfaceId),
		),
		zoneBySurface: Object.fromEntries(
			Object.entries(layout.zoneBySurface).map(([surfaceId, zone]) => [
				migrateStudentSurfaceId(
					surfaceId as
						| StudentDashboardSurfaceId
						| "assignment-queue"
						| "growth-goals",
				),
				zone,
			]),
		) as Partial<Record<StudentDashboardSurfaceId, WorkspaceZoneId>>,
	};
}

function getNextZone(zone: WorkspaceZoneId): WorkspaceZoneId {
	const currentIndex = WORKSPACE_CANVAS_ZONES.indexOf(zone);
	const nextIndex = (currentIndex + 1) % WORKSPACE_CANVAS_ZONES.length;
	return WORKSPACE_CANVAS_ZONES[nextIndex] as WorkspaceZoneId;
}

export function useStudentWorkspaceLayout(
	userId: string | null | undefined,
	surfaces: StudentDashboardSurface[],
) {
	const workspace = useWorkspaceLayoutSync<
		StudentDashboardSurfaceId,
		StudentDashboardCapabilityKey,
		StudentDashboardSurface
	>({
		workspaceId: "student-dashboard",
		userId,
		surfaces,
		enableRemoteSync: false,
	});

	const migratedLayout = useMemo(
		() =>
			workspace.layout ? migrateStudentWorkspaceLayout(workspace.layout) : null,
		[workspace.layout],
	);

	const resolvedSurfaceMap = useMemo(
		() =>
			new Map(
				workspace.surfaces.map(
					(surface) => [surface.surfaceId, surface] as const,
				),
			),
		[workspace.surfaces],
	);

	const enrichedSurfaces = useMemo(
		() =>
			surfaces
				.map((surface) => {
					const resolved = resolvedSurfaceMap.get(surface.surfaceId);
					if (!resolved) return null;

					return {
						...surface,
						...resolved,
					} as StudentResolvedSurface;
				})
				.filter(Boolean) as StudentResolvedSurface[],
		[surfaces, resolvedSurfaceMap],
	);

	return {
		...workspace,
		layout: migratedLayout,
		surfaces: enrichedSurfaces,
	};
}

export function StudentWorkspaceCanvas({
	layout,
	surfaces,
	onToggleHidden,
	onTogglePinned,
	onMoveToNextZone,
}: {
	layout: {
		order: StudentDashboardSurfaceId[];
		hidden: StudentDashboardSurfaceId[];
		pinned: StudentDashboardSurfaceId[];
		zoneBySurface: Partial<Record<StudentDashboardSurfaceId, WorkspaceZoneId>>;
		workspaceId: string;
		userId: string;
		updatedAt: string;
	} | null;
	surfaces: StudentResolvedSurface[];
	onToggleHidden: (id: StudentDashboardSurfaceId, hidden: boolean) => void;
	onTogglePinned: (id: StudentDashboardSurfaceId, pinned: boolean) => void;
	onMoveToNextZone: (
		id: StudentDashboardSurfaceId,
		zone: WorkspaceZoneId,
	) => void;
}) {
	if (!layout) return null;

	return (
		<WorkspaceCanvas
			surfaces={surfaces}
			layout={layout as any}
			title="Student Workspace Canvas"
			subtitle="Daily learning flow arranged as a shared canvas, with room to pin, hide, and move surfaces around real study rhythms."
			emptyMessage="No student surfaces are available yet for this workspace."
			renderSurfaceContent={(surface) => (
				<Box className="flex-1">
					{(surface as StudentResolvedSurface).content}
				</Box>
			)}
			getSurfaceTitle={(surface) => (surface as StudentResolvedSurface).title}
			getSurfaceSubtitle={(surface) =>
				(surface as StudentResolvedSurface).subtitle
			}
			getSurfaceSummary={(surface) =>
				(surface as StudentResolvedSurface).summary
			}
			getSurfaceTemporalLabel={(surface) =>
				(surface as StudentResolvedSurface).temporalLabel
			}
			getSurfaceMetadata={(surface) =>
				(surface as StudentResolvedSurface).metadata
			}
			renderSurfaceActions={(surface) => {
				const typedSurface = surface as StudentResolvedSurface;
				const nextZone = getNextZone(typedSurface.zone);

				return (
					<HStack className="gap-3 flex-wrap">
						<Pressable
							onPress={() =>
								onTogglePinned(typedSurface.surfaceId, !typedSurface.pinned)
							}
							className="active:opacity-80"
						>
							<Box className="rounded-full px-4 py-2 bg-phase-primary/5 border border-starlightGray/10">
								<Text className="text-[12px] font-bold text-phaseText-primary">
									{typedSurface.pinned ? "Unpin" : "Pin"}
								</Text>
							</Box>
						</Pressable>
						<Pressable
							onPress={() => onMoveToNextZone(typedSurface.surfaceId, nextZone)}
							className="active:opacity-80"
						>
							<Box className="rounded-full px-4 py-2 bg-phase-primary/5 border border-starlightGray/10">
								<Text className="text-[12px] font-bold text-phaseText-primary">
									Move to {nextZone}
								</Text>
							</Box>
						</Pressable>
					</HStack>
				);
			}}
			onToggleHidden={(surface) =>
				onToggleHidden(
					surface.surfaceId as StudentDashboardSurfaceId,
					!surface.hidden,
				)
			}
		/>
	);
}
