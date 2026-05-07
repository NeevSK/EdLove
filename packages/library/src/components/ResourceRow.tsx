import { formatDuration, formatFileSize } from "@repo/core/lib";
import type { BaseResource } from "@repo/core/types";
import { SanctuaryButton } from "@repo/ui/components/SanctuaryButton";
import { SanctuaryCard } from "@repo/ui/components/SanctuaryCard";
import { Box, HStack, Text, useTheme, VStack } from "@repo/ui/primitives";
import { Theme } from "@repo/ui/theme";
import {
	ArrowLeftRight,
	BarChart2,
	BookMarked,
	Bookmark,
	BookOpen,
	Brain,
	Clapperboard,
	ClipboardCheck,
	Cpu,
	File,
	FileText,
	Link,
	Map,
	Play,
	Sparkles,
	StickyNote,
	Trash2,
	Video,
} from "lucide-react-native";
import type React from "react";
// ============================================================================
// CONFIG
// ============================================================================
export type DisplayResourceType =
	| "pdf"
	| "video"
	| "link"
	| "doc"
	| "note"
	| "other"
	| "map"
	| "infographic"
	| "story"
	| "circular"
	| "movie_trailer"
	| "tech_guide"
	| "form"
	| "graphic";
export const RESOURCE_TYPE_CONFIG: Record<
	DisplayResourceType,
	{
		icon: React.ComponentType<any>;
		color: string;
		label: string;
	}
> = {
	pdf: { icon: File, color: Theme.colors.emberRed, label: "PDF" },
	video: { icon: Video, color: Theme.colors.skyBlue, label: "Video" },
	link: { icon: Link, color: Theme.colors.sanctuarySaffron, label: "Link" },
	doc: { icon: FileText, color: Theme.colors.ink, label: "Doc" },
	note: { icon: StickyNote, color: Theme.colors.sageGreen, label: "Note" },
	map: { icon: Map, color: "#10B981", label: "Map" },
	infographic: { icon: BarChart2, color: "#F59E0B", label: "Visual" },
	story: {
		icon: BookMarked,
		color: Theme.colors.gurudeviViolet,
		label: "Story",
	},
	circular: { icon: FileText, color: "#EF4444", label: "Circular" },
	movie_trailer: { icon: Clapperboard, color: "#EC4899", label: "Film" },
	tech_guide: { icon: Cpu, color: Theme.colors.gurudeviBlue, label: "Tech" },
	form: {
		icon: ClipboardCheck,
		color: Theme.colors.sanctuarySaffron,
		label: "Form",
	},
	graphic: { icon: Brain, color: Theme.colors.gurudeviViolet, label: "Visual" },
	other: { icon: BookOpen, color: Theme.colors.starlightGray, label: "File" },
};
export function resolveResourceDisplayType(type: string): DisplayResourceType {
	if (type in RESOURCE_TYPE_CONFIG) return type as DisplayResourceType;
	if (["lesson", "reading", "guide", "worksheet", "pedagogy"].includes(type))
		return "doc";
	return "other";
}
// ============================================================================
// COMPONENT
// ============================================================================
export interface ResourceRowProps {
	resource: BaseResource & {
		subjects?: string[];
		verified?: boolean;
		is_community?: boolean;
		link_status?: string;
		format?: string;
		metadata?: {
			size?: number;
			duration?: number;
		};
	};
	onOpen: () => void;
	onOpenAnotherWay?: () => void;
	onFlashPlay?: () => void;
	onPullToDesk?: () => void;
	onDelete?: () => void;
	onAISparkle?: () => void;
	onGenerateQuiz?: () => void;
	onGenerateGraphic?: () => void;
}
export function ResourceRow({
	resource,
	onOpen,
	onOpenAnotherWay,
	onFlashPlay,
	onPullToDesk,
	onDelete,
	onAISparkle,
	onGenerateQuiz,
	onGenerateGraphic,
}: ResourceRowProps) {
	const _theme = useTheme();
	const displayType = resolveResourceDisplayType(resource.type || "");
	const config = RESOURCE_TYPE_CONFIG[displayType];
	const Icon = config.icon;
	const fileSize = resource.metadata?.size
		? formatFileSize(resource.metadata.size)
		: undefined;
	const duration = resource.metadata?.duration
		? formatDuration(resource.metadata.duration)
		: undefined;
	const metaParts = [resource.format?.toUpperCase(), fileSize, duration].filter(
		Boolean,
	);
	return (
		<Box className="mb-2">
			<SanctuaryCard onPress={onOpen}>
				<HStack className="gap-4 items-center p-2">
					{/* File Type Icon - Refined Glass Effect */}
					<Box
						className="w-12 h-12 rounded-xl items-center justify-center border"
						style={{
							backgroundColor: `${config.color}15`,
							borderColor: `${config.color}30`,
						}}
					>
						<Icon color={config.color} size={20} />
						<Text
							className="text-[10px] font-bold mt-1"
							style={{ color: config.color }}
						>
							{config.label}
						</Text>
					</Box>

					{/* Content */}
					<VStack className="flex-1 gap-0.5">
						<Text
							className="text-sm font-bold text-phaseText-primary"
							numberOfLines={1}
						>
							{resource.title}
						</Text>
						<HStack className="gap-1 items-center">
							<Text className="text-xs text-phaseText-secondary">
								{resource.subjects?.[0] || ""}
							</Text>
							{metaParts.length > 0 && (
								<HStack className="gap-1 items-center">
									<Box className="w-0.5 h-0.5 rounded-full bg-phase-border" />
									<Text className="text-xs text-phaseText-tertiary">
										{metaParts.join(" \u00B7 ")}
									</Text>
								</HStack>
							)}
						</HStack>
						<HStack className="gap-1 items-center">
							{resource.verified && (
								<Box className="bg-phase-success px-1 rounded">
									<Text className="text-[10px] text-white font-bold">
										VERIFIED
									</Text>
								</Box>
							)}
							{resource.is_community && (
								<Box className="bg-phase-accent px-1 rounded">
									<Text className="text-[10px] text-white font-bold">
										COMMUNITY
									</Text>
								</Box>
							)}
							{resource.link_status === "broken" && (
								<Box className="bg-phase-danger px-1 rounded">
									<Text className="text-[10px] text-white font-bold">
										BROKEN LINK
									</Text>
								</Box>
							)}
						</HStack>
					</VStack>

					{/* Actions */}
					<HStack className="gap-1 items-center">
						{onFlashPlay && (
							<SanctuaryButton
								onPress={onFlashPlay}
								variant="ghost"
								size="xs"
								leftIcon={Play}
							>
								{""}
							</SanctuaryButton>
						)}
						{onPullToDesk && (
							<SanctuaryButton
								onPress={onPullToDesk}
								variant="ghost"
								size="xs"
								leftIcon={Bookmark}
							>
								{""}
							</SanctuaryButton>
						)}
						{onOpenAnotherWay && (
							<SanctuaryButton
								onPress={onOpenAnotherWay}
								variant="ghost"
								size="xs"
								leftIcon={ArrowLeftRight}
							>
								{""}
							</SanctuaryButton>
						)}
						{onDelete && (
							<SanctuaryButton
								onPress={onDelete}
								variant="ghost"
								size="xs"
								leftIcon={Trash2}
							>
								{""}
							</SanctuaryButton>
						)}

						{onAISparkle && (
							<SanctuaryButton
								onPress={onAISparkle}
								variant="ghost"
								size="xs"
								leftIcon={Sparkles}
							>
								{""}
							</SanctuaryButton>
						)}

						{onGenerateQuiz && (
							<SanctuaryButton
								onPress={onGenerateQuiz}
								variant="ghost"
								size="xs"
								leftIcon={ClipboardCheck}
							>
								{""}
							</SanctuaryButton>
						)}

						{onGenerateGraphic && (
							<SanctuaryButton
								onPress={onGenerateGraphic}
								variant="ghost"
								size="xs"
								leftIcon={Brain}
							>
								{""}
							</SanctuaryButton>
						)}
					</HStack>
				</HStack>
			</SanctuaryCard>
		</Box>
	);
}
export default ResourceRow;
