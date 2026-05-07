import { useThemedColors } from "@repo/ui/hooks";
import { Box, HStack, Pressable, Text, VStack } from "@repo/ui/primitives";
import { Theme } from "@repo/ui/theme";
import { hapticLight } from "@repo/ui/utils/haptics";
import {
	ArrowRight,
	LayoutGrid,
	Milestone,
	NotebookPen,
	UserPlus,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

interface ManagementStationProps {
	onAction: (action: "hierarchy" | "invites" | "notes" | "cycles") => void;
}
export default function ManagementStation({
	onAction,
}: ManagementStationProps) {
	const { t } = useTranslation();
	const colors = useThemedColors();
	const ActionItem = ({
		icon: LucideIcon,
		label,
		description,
		target,
	}: any) => (
		<Pressable
			onPress={() => {
				hapticLight();
				onAction(target);
			}}
			sx={{
				flex: 1,
				backgroundColor: colors.secondary,
				padding: Theme.spacing.md,
				borderRadius: Theme.corners.comfortable,
				borderWidth: 1,
				borderColor: colors.border,
			}}
		>
			<HStack sx={{ justifyContent: "space-between", alignItems: "center" }}>
				<HStack space="md" alignItems="center">
					<Box
						sx={{
							padding: Theme.spacing.sm,
							borderRadius: Theme.corners.medium,
							backgroundColor: `${colors.action}11`,
						}}
					>
						<LucideIcon size={20} color={colors.action} />
					</Box>
					<VStack>
						<Text color={colors.text} sx={{ fontSize: 13, fontWeight: "700" }}>
							{label}
						</Text>
						<Text color={colors.textSecondary} sx={{ fontSize: 10 }}>
							{description}
						</Text>
					</VStack>
				</HStack>
				<ArrowRight size={14} color={colors.textTertiary} />
			</HStack>
		</Pressable>
	);
	return (
		<Box
			sx={{
				padding: Theme.spacing.lg,
				backgroundColor: `${Theme.colors.twilightBlue}08`,
				borderRadius: Theme.corners.generous,
				borderWidth: 1,
				borderColor: `${Theme.colors.twilightBlue}22`,
				borderStyle: "dashed",
			}}
		>
			<VStack space="md">
				<HStack sx={{ justifyContent: "space-between", alignItems: "center" }}>
					<Text
						color={Theme.colors.twilightBlue}
						sx={{
							fontSize: 12,
							fontWeight: "800",
							textTransform: "uppercase",
							letterSpacing: 1.5,
						}}
					>
						{t("principal.management.station") ||
							"Principal's Management Station"}{" "}
						👔
					</Text>
				</HStack>

				<VStack space="sm">
					<ActionItem
						icon={LayoutGrid}
						label={t("principal.management.hierarchy") || "System Hierarchy"}
						description={
							t("principal.management.hierarchyDesc") ||
							"Grades, Sections & Structure"
						}
						target="hierarchy"
					/>
					<ActionItem
						icon={UserPlus}
						label={t("principal.management.invites") || "Governance Invites"}
						description={
							t("principal.management.invitesDesc") ||
							"Invite Principals & Teachers"
						}
						target="invites"
					/>
					<ActionItem
						icon={NotebookPen}
						label={t("principal.management.notes") || "Institutional Log"}
						description={
							t("principal.management.notesDesc") ||
							"Daily operational observations"
						}
						target="notes"
					/>
					<ActionItem
						icon={Milestone}
						label={t("principal.management.cycles") || "Academic Cycles"}
						description={
							t("principal.management.cyclesDesc") || "Define terms & semesters"
						}
						target="cycles"
					/>
				</VStack>
			</VStack>
		</Box>
	);
}
