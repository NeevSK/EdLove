import {
	WORKSPACE_CANVAS_ZONES,
	type WorkspaceSwitcherTarget,
} from "@repo/core/logic";
import { useWorkspaceLayoutSync } from "@repo/core/native";
import type {
	ResolvedWorkspaceSurface,
	School,
	WorkspaceSurfaceDefinition,
	WorkspaceZoneId,
} from "@repo/core/types";
import { WorkspaceCanvas } from "@repo/ui/components/workspace/WorkspaceCanvas";
import {
	ArrowUpRight,
	BookOpen,
	Building2,
	FolderPlus,
	MessageSquareHeart,
	MoveRight,
	School as SchoolIcon,
} from "@repo/ui/icons";
import { Box, HStack, Pressable, Text, VStack } from "@repo/ui/primitives";

import type React from "react";
import { useMemo } from "react";
import {
	type FounderCapabilityId,
	getFounderCapabilityMeta,
} from "./workspace";

export type FounderWorkspaceSurfaceId =
	| "platform_pulse"
	| "stewardship_topology"
	| "learning_vitality"
	| "wellbeing_radar"
	| "workspace_switcher"
	| "institution_roster"
	| "creation_runway"
	| "institution_bridge"
	| "resource_ecology"
	| "knowledge_atlas"
	| "community_signal";

export type FounderWorkspaceSurface = WorkspaceSurfaceDefinition<
	FounderWorkspaceSurfaceId,
	FounderCapabilityId
> & {
	title: string;
	subtitle?: string;
	summary?: string;
	temporalLabel?: string;
	temporalTone?: "present" | "past" | "future" | "neutral";
	metadata?: string[];
	content: React.ReactNode;
};

type FounderEcosystemStats = {
	total_schools: number;
	total_users: number;
	total_students: number;
	total_teachers: number;
	total_principals: number;
	total_classrooms: number;
	active_communities: number;
	ecosystem_health: number;
	active_users_7d: number;
	mood_checkins_7d: number;
	avg_mood_score_7d: number | null;
	total_library_resources: number;
	verified_resources: number;
	total_bookmarks: number;
	total_community_posts: number;
	posts_7d: number;
	attendance_records: number;
	attendance_records_7d: number;
	growth_signals_7d: number;
	total_inventory_items: number;
	total_inventory_requests: number;
	pending_inventory_requests: number;
	total_echo_feedback: number;
	pending_echo_responses: number;
	avg_student_performance: number | null;
	total_submissions: number;
	submissions_7d: number;
} | null;

function getNextZone(zone: WorkspaceZoneId): WorkspaceZoneId {
	const currentIndex = WORKSPACE_CANVAS_ZONES.indexOf(zone);
	const nextIndex = (currentIndex + 1) % WORKSPACE_CANVAS_ZONES.length;
	return WORKSPACE_CANVAS_ZONES[nextIndex] as WorkspaceZoneId;
}

function StatPill({ label, value }: { label: string; value: string | number }) {
	return (
		<Box className="min-w-[47%] flex-1 rounded-2xl border border-starlightGray/20 bg-silk p-4">
			<Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
				{label}
			</Text>
			<Text className="mt-1 text-2xl font-bold text-phaseText-primary">
				{value}
			</Text>
		</Box>
	);
}

function SurfaceLauncher({
	icon: Icon,
	title,
	copy,
	actionLabel,
	onPress,
	disabled = false,
}: {
	icon: any;
	title: string;
	copy: string;
	actionLabel: string;
	onPress: () => void;
	disabled?: boolean;
}) {
	return (
		<VStack className="gap-4">
			<HStack className="items-center gap-3">
				<Box className="h-10 w-10 items-center justify-center rounded-xl bg-phase-warning/10">
					<Icon size={18} color="#2A2318" />
				</Box>
				<VStack className="flex-1 gap-0.5">
					<Text className="text-[15px] font-bold text-phaseText-primary">
						{title}
					</Text>
					<Text className="text-[12px] text-phaseText-secondary">{copy}</Text>
				</VStack>
			</HStack>
			<Pressable
				disabled={disabled}
				onPress={onPress}
				className="self-start active:opacity-80"
			>
				<Box
					className={`rounded-full border px-4 py-2 ${disabled ? "border-starlightGray/20 bg-phase-primary/5" : "border-starlightGray/30 bg-phase-primary"}`}
				>
					<HStack className="items-center gap-2">
						<Text
							className={`text-[12px] font-bold ${disabled ? "text-phaseText-secondary" : "text-white"}`}
						>
							{actionLabel}
						</Text>
						<MoveRight size={14} color={disabled ? "#7E7462" : "white"} />
					</HStack>
				</Box>
			</Pressable>
		</VStack>
	);
}

function PlatformPulseSurface({ stats }: { stats: FounderEcosystemStats }) {
	return (
		<VStack className="gap-4">
			<HStack className="flex-wrap gap-3">
				<StatPill label="Institutions" value={stats?.total_schools ?? 0} />
				<StatPill label="Total, souls" value={stats?.total_users ?? 0} />
				<StatPill
					label="Active, users (7d)"
					value={stats?.active_users_7d ?? 0}
				/>
				<StatPill
					label="Health"
					value={`${Math.round(stats?.ecosystem_health ?? 0)}%`}
				/>
			</HStack>
			<HStack className="flex-wrap gap-3">
				<StatPill label="Students" value={stats?.total_students ?? 0} />
				<StatPill label="Teachers" value={stats?.total_teachers ?? 0} />
			</HStack>
		</VStack>
	);
}

function StewardshipTopologySurface({
	stats,
}: {
	stats: FounderEcosystemStats;
}) {
	return (
		<VStack className="gap-3">
			<HStack className="gap-3">
				<StatPill label="Institutions" value={stats?.total_schools ?? 0} />
				<StatPill label="Principals" value={stats?.total_principals ?? 0} />
			</HStack>
			<HStack className="gap-3">
				<StatPill label="Teachers" value={stats?.total_teachers ?? 0} />
				<StatPill label="Classrooms" value={stats?.total_classrooms ?? 0} />
			</HStack>
			<Box className="rounded-2xl border border-starlightGray/20 bg-silk p-4">
				<Text className="text-[13px] font-bold text-phaseText-primary">
					Founder, read
				</Text>
				<Text className="mt-1 text-[12px] text-phaseText-secondary">
					This, is the, operating lattice for a, cross-tenant, founder:
					institutions, leadership, heads, teacher, coverage, and, classroom
					spread.
				</Text>
			</Box>
		</VStack>
	);
}

function LearningVitalitySurface({ stats }: { stats: FounderEcosystemStats }) {
	return (
		<VStack className="gap-3">
			<HStack className="gap-3">
				<StatPill
					label="Attendance (7d)"
					value={stats?.attendance_records_7d ?? 0}
				/>
				<StatPill label="Submissions (7d)" value={stats?.submissions_7d ?? 0} />
			</HStack>
			<HStack className="gap-3">
				<StatPill
					label="Growth, signals (7d)"
					value={stats?.growth_signals_7d ?? 0}
				/>
				<StatPill
					label="Avg, performance"
					value={
						stats?.avg_student_performance != null
							? `${Math.round(stats.avg_student_performance)}%`
							: "n/a"
					}
				/>
			</HStack>
			<Box className="rounded-2xl border border-starlightGray/20 bg-silk p-4">
				<Text className="text-[13px] font-bold text-phaseText-primary">
					Academic, motion
				</Text>
				<Text className="mt-1 text-[12px] text-phaseText-secondary">
					Founder, should see, whether learning, is actually, moving across, the
					network, not, only whether, institutions exist, on paper.
				</Text>
			</Box>
		</VStack>
	);
}

function WellbeingRadarSurface({ stats }: { stats: FounderEcosystemStats }) {
	return (
		<VStack className="gap-3">
			<HStack className="gap-3">
				<StatPill
					label="Mood, check-ins (7d)"
					value={stats?.mood_checkins_7d ?? 0}
				/>
				<StatPill
					label="Avg, mood"
					value={
						stats?.avg_mood_score_7d != null
							? stats.avg_mood_score_7d.toFixed(1)
							: "n/a"
					}
				/>
			</HStack>
			<HStack className="gap-3">
				<StatPill
					label="Health"
					value={`${Math.round(stats?.ecosystem_health ?? 0)}%`}
				/>
				<StatPill
					label="Active, communities"
					value={stats?.active_communities ?? 0}
				/>
			</HStack>
			<Box className="rounded-2xl border border-starlightGray/20 bg-silk p-4">
				<Text className="text-[13px] font-bold text-phaseText-primary">
					Ecology, tone
				</Text>
				<Text className="mt-1 text-[12px] text-phaseText-secondary">
					This, stays in, the founder, workspace because, ecosystem wellbeing,
					is governance, signal, not, just a, private reflection, surface.
				</Text>
			</Box>
		</VStack>
	);
}

function InstitutionRosterSurface({
	schools,
	onOpenInstitution,
}: {
	schools: School[];
	onOpenInstitution: (school: School) => void;
}) {
	return (
		<VStack className="gap-3">
			{schools.slice(0, 4).map((school) => (
				<Pressable
					key={school.id}
					onPress={() => onOpenInstitution(school)}
					className="active:opacity-80"
				>
					<Box className="rounded-2xl border border-starlightGray/20 bg-silk p-4">
						<HStack className="items-center gap-3">
							<Box className="h-10 w-10 items-center justify-center rounded-xl bg-templeGold/10">
								<SchoolIcon size={18} color="#D4843A" />
							</Box>
							<VStack className="flex-1 gap-0.5">
								<Text className="text-[14px] font-bold text-phaseText-primary">
									{school.name}
								</Text>
								<Text className="text-[11px] uppercase text-phaseText-secondary">
									{(
										school.official_type ||
										school.type ||
										"Institution"
									).toString()}
								</Text>
							</VStack>
							<ArrowUpRight size={16} color="#7E7462" />
						</HStack>
					</Box>
				</Pressable>
			))}
			{schools.length === 0 ? (
				<Box className="rounded-2xl border border-dashed border-starlightGray/30 bg-silk p-5">
					<Text className="text-[12px] text-phaseText-secondary">
						No, institutions, are, registered, yet. Use, the, creation, runway,
						to, begin, the, founder, workspace.
					</Text>
				</Box>
			) : null}
		</VStack>
	);
}

function WorkspaceSwitcherSurface({
	targets,
	onSelectTarget,
}: {
	targets: WorkspaceSwitcherTarget[];
	onSelectTarget: (target: WorkspaceSwitcherTarget) => void;
}) {
	return (
		<VStack className="gap-3">
			{targets.map((target) => (
				<Pressable
					key={target.id}
					disabled={!target.enabled}
					onPress={() => onSelectTarget(target)}
					className="active:opacity-80"
				>
					<Box
						className={`rounded-2xl border p-4 ${target.enabled ? "border-starlightGray/20 bg-silk" : "border-starlightGray/10 bg-phase-primary/5"}`}
					>
						<HStack className="items-center gap-3">
							<Box className="rounded-full bg-phase-warning/10 px-3 py-1">
								<Text className="text-[10px] font-bold uppercase text-phaseText-primary">
									{target.status.replace("_", " ")}
								</Text>
							</Box>
							<VStack className="flex-1 gap-0.5">
								<Text className="text-[14px] font-bold text-phaseText-primary">
									{target.title}
								</Text>
								<Text className="text-[12px] text-phaseText-secondary">
									{target.enabled
										? target.description
										: target.reason || target.description}
								</Text>
							</VStack>
							<ArrowUpRight
								size={16}
								color={target.enabled ? "#7E7462" : "#B3AA99"}
							/>
						</HStack>
					</Box>
				</Pressable>
			))}
		</VStack>
	);
}

function BridgeSurface({
	primarySchool,
	onOpenFounderSchool,
	onOpenPrincipalOps,
}: {
	primarySchool: School | null;
	onOpenFounderSchool: (school: School) => void;
	onOpenPrincipalOps: (school: School) => void;
}) {
	if (!primarySchool) {
		return (
			<SurfaceLauncher
				icon={Building2}
				title="No, institution selected, yet"
				copy="Once, at least, one school, exists, this, bridge becomes, the clean, founder path, into the, deeper operational, rooms."
				actionLabel="Create, an institution, first"
				onPress={() => undefined}
				disabled
			/>
		);
	}

	return (
		<VStack className="gap-3">
			<Box className="rounded-2xl border border-starlightGray/20 bg-silk p-4">
				<Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
					Primary, institution
				</Text>
				<Text className="mt-1 text-[18px] font-bold text-phaseText-primary">
					{primarySchool.name}
				</Text>
				<Text className="mt-1 text-[12px] text-phaseText-secondary">
					Enter, the founder, view for cross-institution, stewardship, or, drop
					into, principal operations, when you, need the, school room, itself.
				</Text>
			</Box>
			<HStack className="gap-3">
				<Pressable
					onPress={() => onOpenFounderSchool(primarySchool)}
					className="flex-1 active:opacity-80"
				>
					<Box className="rounded-2xl border border-starlightGray/20 bg-phase-primary px-4 py-3">
						<Text className="text-center text-[12px] font-bold text-white">
							Open, founder school, view
						</Text>
					</Box>
				</Pressable>
				<Pressable
					onPress={() => onOpenPrincipalOps(primarySchool)}
					className="flex-1 active:opacity-80"
				>
					<Box className="rounded-2xl border border-starlightGray/20 bg-phase-warning px-4 py-3">
						<Text className="text-center text-[12px] font-bold text-phaseText-primary">
							Open, principal ops
						</Text>
					</Box>
				</Pressable>
			</HStack>
		</VStack>
	);
}

function ResourceEcologySurface({ stats }: { stats: FounderEcosystemStats }) {
	return (
		<VStack className="gap-3">
			<HStack className="gap-3">
				<StatPill
					label="Inventory, items"
					value={stats?.total_inventory_items ?? 0}
				/>
				<StatPill
					label="Open, requests"
					value={stats?.pending_inventory_requests ?? 0}
				/>
			</HStack>
			<Box className="rounded-2xl border border-starlightGray/20 bg-silk p-4">
				<Text className="text-[13px] font-bold text-phaseText-primary">
					Founder, read
				</Text>
				<Text className="mt-1 text-[12px] text-phaseText-secondary">
					This, surface stays, in the, founder outlook, layer only, when the,
					inventory stack, is explicitly, enabled. It, is meant, to show,
					pressure and, readiness, not, replace the, deeper operational, ERP
					rooms.
				</Text>
			</Box>
		</VStack>
	);
}

function KnowledgeAtlasSurface({
	stats,
	onOpenLibrary,
}: {
	stats: FounderEcosystemStats;
	onOpenLibrary: () => void;
}) {
	return (
		<VStack className="gap-3">
			<HStack className="gap-3">
				<StatPill
					label="Resources"
					value={stats?.total_library_resources ?? 0}
				/>
				<StatPill label="Verified" value={stats?.verified_resources ?? 0} />
			</HStack>
			<SurfaceLauncher
				icon={BookOpen}
				title="Library, command"
				copy="Open, the library, stack to, steward curation, publishing, and, platform knowledge, flow."
				actionLabel="Open, library"
				onPress={onOpenLibrary}
			/>
		</VStack>
	);
}

function CommunitySignalSurface({
	stats,
	onOpenCommunity,
}: {
	stats: FounderEcosystemStats;
	onOpenCommunity: () => void;
}) {
	return (
		<VStack className="gap-3">
			<HStack className="gap-3">
				<StatPill
					label="Active, communities"
					value={stats?.active_communities ?? 0}
				/>
				<StatPill label="Posts (7d)" value={stats?.posts_7d ?? 0} />
			</HStack>
			<HStack className="gap-3">
				<StatPill
					label="Feedback, echoes"
					value={stats?.total_echo_feedback ?? 0}
				/>
				<StatPill
					label="Pending, responses"
					value={stats?.pending_echo_responses ?? 0}
				/>
			</HStack>
			<SurfaceLauncher
				icon={MessageSquareHeart}
				title="Community, commons"
				copy="Move, into the, shared community, layer when, the founder, needs to, read or, shape ecosystem, conversation."
				actionLabel="Open, community"
				onPress={onOpenCommunity}
			/>
		</VStack>
	);
}

function createFounderSurface(
	surfaceId: FounderWorkspaceSurfaceId,
	config: Omit<
		FounderWorkspaceSurface,
		"surfaceId" | "workspaceId" | "capabilityKey" | "ownerPackage" | "title"
	> & {
		title?: string;
	},
): FounderWorkspaceSurface {
	const meta = getFounderCapabilityMeta(surfaceId);

	return {
		surfaceId,
		workspaceId: "founder-workspace",
		capabilityKey: surfaceId,
		ownerPackage: "admin",
		defaultZone: config.defaultZone,
		defaultOrder: config.defaultOrder,
		hiddenByDefault: config.hiddenByDefault,
		mobileSupport: config.mobileSupport ?? true,
		webSupport: config.webSupport ?? true,
		title: config.title || meta?.title || surfaceId,
		subtitle: config.subtitle,
		summary: config.summary ?? meta?.description,
		temporalLabel: config.temporalLabel,
		temporalTone: config.temporalTone,
		metadata: config.metadata,
		content: config.content,
	};
}

export function useFounderWorkspaceCanvasSurfaces({
	stats,
	schools,
	primarySchool,
	workspaceTargets,
	flags,
	canCreateSchool,
	onCreateInstitution,
	onOpenInstitution,
	onOpenFounderSchool,
	onOpenPrincipalOps,
	onSelectWorkspaceTarget,
	onOpenCommunity,
	onOpenLibrary,
}: {
	stats: FounderEcosystemStats;
	schools: School[];
	primarySchool: School | null;
	workspaceTargets: WorkspaceSwitcherTarget[];
	flags: {
		isInventoryEnabled: boolean;
		isLibraryManagementEnabled: boolean;
	};
	canCreateSchool: boolean;
	onCreateInstitution: () => void;
	onOpenInstitution: (school: School) => void;
	onOpenFounderSchool: (school: School) => void;
	onOpenPrincipalOps: (school: School) => void;
	onSelectWorkspaceTarget: (target: WorkspaceSwitcherTarget) => void;
	onOpenCommunity: () => void;
	onOpenLibrary: () => void;
}) {
	return useMemo<FounderWorkspaceSurface[]>(() => {
		const nextSurfaces: FounderWorkspaceSurface[] = [
			createFounderSurface("platform_pulse", {
				defaultZone: "today",
				defaultOrder: 10,
				subtitle: "Scale, and, health",
				summary:
					"A, founder-facing, read, of, the, living, platform: institutions, people, and, active, movement, this, week.",
				temporalLabel: "Today",
				temporalTone: "present",
				metadata: ["Daily", "Platform"],
				content: <PlatformPulseSurface stats={stats} />,
			}),
			createFounderSurface("learning_vitality", {
				defaultZone: "today",
				defaultOrder: 15,
				subtitle: "Academic, movement",
				summary:
					"Cross-tenant, teaching, and, learning, motion, through, submissions, attendance, performance, and, growth, signal.",
				temporalLabel: "This, week",
				temporalTone: "present",
				metadata: ["Daily", "Academic"],
				content: <LearningVitalitySurface stats={stats} />,
			}),
			createFounderSurface("stewardship_topology", {
				defaultZone: "work",
				defaultOrder: 18,
				subtitle: "People, and, institution, coverage",
				summary:
					"A, founder, needs, visibility, into, the, operating, topology, not, just a, list, of, schools.",
				temporalLabel: "Weekly, structure",
				temporalTone: "neutral",
				metadata: ["Work", "Topology"],
				content: <StewardshipTopologySurface stats={stats} />,
			}),
			createFounderSurface("institution_roster", {
				defaultZone: "work",
				defaultOrder: 20,
				subtitle: "Institution, entry, points",
				summary:
					"Keep, the, active, institution, list, visible, so, founder, attention, can, move from platform-scale, stewardship, into, specific, schools, without, losing, orientation.",
				temporalLabel: `${schools.length} institutions`,
				temporalTone: "neutral",
				metadata: ["Work", "Institutional"],
				content: (
					<InstitutionRosterSurface
						schools={schools}
						onOpenInstitution={onOpenInstitution}
					/>
				),
			}),
			createFounderSurface("workspace_switcher", {
				defaultZone: "work",
				defaultOrder: 25,
				subtitle: "Mixed-role, entry",
				summary:
					"Switch, deliberately, between, founder, institutional, and, academic, workspaces, instead, of, collapsing, them, into, one, oversized, dashboard.",
				temporalLabel: "Capability-composed",
				temporalTone: "neutral",
				metadata: ["Work", "Mixed-role"],
				content: (
					<WorkspaceSwitcherSurface
						targets={workspaceTargets}
						onSelectTarget={onSelectWorkspaceTarget}
					/>
				),
			}),
			createFounderSurface("creation_runway", {
				defaultZone: "institution",
				defaultOrder: 30,
				subtitle: "Launch, and, seed",
				summary:
					"Use, this, runway, when, the, founder, is, creating new institutions, or, seeding, the, next, structural, unit, in, the, ecology.",
				temporalLabel: canCreateSchool ? "Launch, ready" : "Restricted",
				temporalTone: canCreateSchool ? "future" : "neutral",
				metadata: ["Periodic", "Platform, creation"],
				content: (
					<SurfaceLauncher
						icon={FolderPlus}
						title="Create, institution or, classroom"
						copy="Open, the founder, creation flow, without turning, the entire, workspace into a, permanent dashboard for setup, tasks."
						actionLabel={
							canCreateSchool ? "Open, creation, flow" : "Creation, unavailable"
						}
						onPress={onCreateInstitution}
						disabled={!canCreateSchool}
					/>
				),
			}),
			createFounderSurface("institution_bridge", {
				defaultZone: "work",
				defaultOrder: 40,
				subtitle: "Deeper, school, rooms",
				summary:
					"The, founder, canvas, should, stay, compact. Enter, founder, school, or, principal, operations, only, when, the, work, needs a, deeper, room.",
				temporalLabel: primarySchool
					? "Room, bridge"
					: "Awaiting, first, institution",
				temporalTone: primarySchool ? "neutral" : "future",
				metadata: ["Work", "Drill-in, path"],
				content: (
					<BridgeSurface
						primarySchool={primarySchool}
						onOpenFounderSchool={onOpenFounderSchool}
						onOpenPrincipalOps={onOpenPrincipalOps}
					/>
				),
			}),
			createFounderSurface("community_signal", {
				defaultZone: "outlook",
				defaultOrder: 50,
				subtitle: "Posts, echoes, and, movement",
				summary:
					"Read, the, shared, community, signal, at, founder, scale, without, collapsing, it, into, the, institutional, work, lane.",
				temporalLabel: "Weekly, read",
				temporalTone: "future",
				metadata: ["Outlook", "Commons"],
				content: (
					<CommunitySignalSurface
						stats={stats}
						onOpenCommunity={onOpenCommunity}
					/>
				),
			}),
			createFounderSurface("wellbeing_radar", {
				defaultZone: "outlook",
				defaultOrder: 55,
				subtitle: "Mood, and, ecosystem, tone",
				summary:
					"Founder-scale, wellbeing, belongs, in, the, workspace as governance, signal, distinct from personal, Self, surfaces.",
				temporalLabel: "Weekly, tone",
				temporalTone: "future",
				metadata: ["Outlook", "Wellbeing"],
				content: <WellbeingRadarSurface stats={stats} />,
			}),
		];

		if (flags.isInventoryEnabled) {
			nextSurfaces.push(
				createFounderSurface("resource_ecology", {
					defaultZone: "outlook",
					defaultOrder: 60,
					subtitle: "Stocks, and, requests",
					summary:
						"Expose, global, resource, pressure, only, when, the, inventory, capability, family, is, actually, enabled.",
					temporalLabel: "Flagged, live",
					temporalTone: "future",
					metadata: ["Outlook", "Feature-gated"],
					content: <ResourceEcologySurface stats={stats} />,
				}),
			);
		}

		if (flags.isLibraryManagementEnabled) {
			nextSurfaces.push(
				createFounderSurface("knowledge_atlas", {
					defaultZone: "outlook",
					defaultOrder: 70,
					subtitle: "Resources, and, verification",
					summary:
						"Show, the, knowledge, layer, only, when, the, library, management, capability, is, enabled for the, current, environment.",
					temporalLabel: "Flagged, live",
					temporalTone: "future",
					metadata: ["Outlook", "Feature-gated"],
					content: (
						<KnowledgeAtlasSurface
							stats={stats}
							onOpenLibrary={onOpenLibrary}
						/>
					),
				}),
			);
		}

		return nextSurfaces;
	}, [
		canCreateSchool,
		flags.isInventoryEnabled,
		flags.isLibraryManagementEnabled,
		onCreateInstitution,
		onOpenCommunity,
		onOpenFounderSchool,
		onOpenInstitution,
		onOpenLibrary,
		onOpenPrincipalOps,
		onSelectWorkspaceTarget,
		primarySchool,
		schools,
		stats,
		workspaceTargets,
	]);
}

export function useFounderWorkspaceLayout(
	userId: string | null | undefined,
	surfaces: FounderWorkspaceSurface[],
) {
	const workspace = useWorkspaceLayoutSync({
		workspaceId: "founder-workspace",
		userId,
		surfaces,
	});

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
						...resolved,
					} as FounderWorkspaceSurface &
						ResolvedWorkspaceSurface<
							FounderWorkspaceSurfaceId,
							FounderCapabilityId
						>;
				})
				.filter(Boolean) as Array<
				FounderWorkspaceSurface &
					ResolvedWorkspaceSurface<
						FounderWorkspaceSurfaceId,
						FounderCapabilityId
					>
			>,
		[resolvedSurfaceMap, surfaces],
	);

	return {
		...workspace,
		surfaces: enrichedSurfaces,
	};
}

type FounderResolvedSurface = FounderWorkspaceSurface &
	ResolvedWorkspaceSurface<FounderWorkspaceSurfaceId, FounderCapabilityId>;

export function FounderWorkspaceCanvas({
	layout,
	surfaces,
	onToggleHidden,
	onTogglePinned,
	onMoveToNextZone,
}: {
	layout: {
		order: FounderWorkspaceSurfaceId[];
		hidden: FounderWorkspaceSurfaceId[];
		pinned: FounderWorkspaceSurfaceId[];
		zoneBySurface: Partial<Record<FounderWorkspaceSurfaceId, WorkspaceZoneId>>;
		workspaceId: string;
		userId: string;
		updatedAt: string;
	} | null;
	surfaces: FounderResolvedSurface[];
	onToggleHidden: (id: FounderWorkspaceSurfaceId, hidden: boolean) => void;
	onTogglePinned: (id: FounderWorkspaceSurfaceId, pinned: boolean) => void;
	onMoveToNextZone: (
		id: FounderWorkspaceSurfaceId,
		zone: WorkspaceZoneId,
	) => void;
}) {
	if (!layout) return null;

	return (
		<WorkspaceCanvas
			surfaces={surfaces}
			layout={layout as any}
			title="Founder, Workspace Canvas"
			subtitle="A, shared founder, workspace built from real, capability surfaces, with, layout sync, and optional, families revealed, through the, feature flag, engine."
			emptyMessage="No, founder surfaces, are available, yet for this workspace."
			renderSurfaceContent={(surface) => (
				<Box className="flex-1">
					{(surface as FounderResolvedSurface).content}
				</Box>
			)}
			getSurfaceTitle={(surface) => (surface as FounderResolvedSurface).title}
			getSurfaceSubtitle={(surface) =>
				(surface as FounderResolvedSurface).subtitle
			}
			getSurfaceSummary={(surface) =>
				(surface as FounderResolvedSurface).summary
			}
			getSurfaceTemporalLabel={(surface) =>
				(surface as FounderResolvedSurface).temporalLabel
			}
			getSurfaceTemporalTone={(surface) =>
				(surface as FounderResolvedSurface).temporalTone
			}
			getSurfaceMetadata={(surface) =>
				(surface as FounderResolvedSurface).metadata
			}
			renderSurfaceActions={(surface) => {
				const typedSurface = surface as FounderResolvedSurface;
				const nextZone = getNextZone(typedSurface.zone);

				return (
					<HStack className="flex-wrap gap-3">
						<Pressable
							onPress={() =>
								onTogglePinned(typedSurface.surfaceId, !typedSurface.pinned)
							}
							className="active:opacity-80"
						>
							<Box className="rounded-full border border-starlightGray/10 bg-phase-primary/5 px-4 py-2">
								<Text className="text-[12px] font-bold text-phaseText-primary">
									{typedSurface.pinned ? "Unpin" : "Pin"}
								</Text>
							</Box>
						</Pressable>
						<Pressable
							onPress={() => onMoveToNextZone(typedSurface.surfaceId, nextZone)}
							className="active:opacity-80"
						>
							<Box className="rounded-full border border-starlightGray/10 bg-phase-primary/5 px-4 py-2">
								<Text className="text-[12px] font-bold text-phaseText-primary">
									Move, to {nextZone}
								</Text>
							</Box>
						</Pressable>
					</HStack>
				);
			}}
			onToggleHidden={(surface) =>
				onToggleHidden(
					surface.surfaceId as FounderWorkspaceSurfaceId,
					!surface.hidden,
				)
			}
		/>
	);
}
