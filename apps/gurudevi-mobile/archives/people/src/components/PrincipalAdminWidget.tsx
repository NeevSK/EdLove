import { useThemedColors } from "@repo/ui/hooks";
import { Box, HStack, Pressable, Text, VStack } from "@repo/ui/primitives";
import { Theme } from "@repo/ui/theme";
import { hapticLight } from "@repo/ui/utils/haptics";
import {
	Banknote,
	CalendarDays,
	TrendingUp,
	UserCheck,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

interface PrincipalAdminWidgetProps {
	onAction?: (action: string) => void;
}
export default function PrincipalAdminWidget({
	onAction,
}: PrincipalAdminWidgetProps) {
	const { t } = useTranslation();
	const colors = useThemedColors();
	const ActionCard = ({
		icon: LucideIcon,
		label,
		description,
		color,
		onPress,
	}: any) => (
		<Pressable
			onPress={() => {
				hapticLight();
				if (onPress) onPress();
				if (onAction) onAction(label);
			}}
			sx={{
				flex: 1,
				backgroundColor: colors?.secondary || Theme.colors.ink,
				padding: Theme.spacing.lg,
				borderRadius: Theme.corners.generous,
				borderWidth: 1,
				borderColor: colors?.border || "rgba(255,255,255,0.1)",
			}}
		>
			<VStack sx={{ gap: Theme.spacing.sm }}>
				<HStack sx={{ justifyContent: "space-between", alignItems: "center" }}>
					<Box
						sx={{
							padding: Theme.spacing.sm,
							borderRadius: Theme.corners.medium,
							backgroundColor: `${color || Theme.colors.sanctuarySaffron}22`,
						}}
					>
						<LucideIcon
							size={24}
							color={color || Theme.colors.sanctuarySaffron}
						/>
					</Box>
					<TrendingUp
						size={16}
						color={colors?.textTertiary || "#666"}
						style={{ opacity: 0.3 }}
					/>
				</HStack>
				<VStack>
					<Text
						sx={{
							color: colors?.text || "#fff",
							fontSize: 14,
							fontWeight: "700",
						}}
					>
						{label}
					</Text>
					<Text sx={{ color: colors?.textSecondary || "#aaa", fontSize: 11 }}>
						{description}
					</Text>
				</VStack>
			</VStack>
		</Pressable>
	);
	return (
		<VStack sx={{ gap: Theme.spacing.md }}>
			<Text
				sx={{
					color: colors?.textSecondary || "#aaa",
					fontSize: 13,
					fontWeight: "700",
					textTransform: "uppercase",
					letterSpacing: 1,
				}}
			>
				{t("principal.admin.title") || "Governance Dashboard"}
			</Text>

			<VStack sx={{ gap: Theme.spacing.md }}>
				<HStack sx={{ gap: Theme.spacing.md }}>
					<ActionCard
						icon={Banknote}
						label={t("principal.admin.finance") || "Financials"}
						description={
							t("principal.admin.financeDesc") || "Fees & Dues Summary"
						}
						color={Theme.colors.sageGreen}
					/>
					<ActionCard
						icon={CalendarDays}
						label={t("principal.admin.events") || "Event Approvals"}
						description={
							t("principal.admin.eventsDesc") || "Approve school events"
						}
						color={Theme.colors.amberGlow}
					/>
				</HStack>

				{/* Staff Leave Requests Wide Card */}
				<Box
					sx={{
						backgroundColor: colors?.secondary || Theme.colors.ink,
						padding: Theme.spacing.lg,
						borderRadius: Theme.corners.generous,
						borderWidth: 1,
						borderColor: colors?.border || "rgba(255,255,255,0.1)",
					}}
				>
					<HStack
						sx={{ justifyContent: "space-between", alignItems: "center" }}
					>
						<HStack sx={{ gap: Theme.spacing.md, alignItems: "center" }}>
							<Box
								sx={{
									padding: Theme.spacing.sm,
									borderRadius: Theme.corners.medium,
									backgroundColor: `${colors?.action || "#2196f3"}22`,
								}}
							>
								<UserCheck size={24} color={colors?.action || "#2196f3"} />
							</Box>
							<VStack>
								<Text
									sx={{
										color: colors?.text || "#fff",
										fontSize: 14,
										fontWeight: "700",
									}}
								>
									{t("principal.admin.leaves") || "Staff Leave Requests"}
								</Text>
								<Text
									sx={{ color: colors?.textSecondary || "#aaa", fontSize: 11 }}
								>
									{t("principal.admin.leavesDesc") ||
										"Review and approve staff absences"}
								</Text>
							</VStack>
						</HStack>

						<Pressable
							onPress={() => {
								hapticLight();
								if (onAction) onAction("Leaves");
							}}
							sx={{
								backgroundColor: colors?.tertiary || "rgba(255,255,255,0.05)",
								paddingHorizontal: Theme.spacing.md,
								paddingVertical: Theme.spacing.xs,
								borderRadius: 20,
							}}
						>
							<Text
								sx={{
									color: colors?.action || "#2196f3",
									fontSize: 12,
									fontWeight: "700",
								}}
							>
								View All
							</Text>
						</Pressable>
					</HStack>
				</Box>
			</VStack>
		</VStack>
	);
}
