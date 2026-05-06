import { FeatureGuard } from "@repo/core/logic";
import { ClipboardList, MessageCircle } from "@repo/ui/icons";
import { Button, ButtonText, HStack, Icon } from "@repo/ui/primitives";
import { hapticLight } from "@repo/ui/utils/haptics";
import { useTranslation } from "react-i18next";

export function TeacherEchoActions() {
	const { t } = useTranslation();

	return (
		<HStack className="gap-4 flex-wrap items-center">
			<FeatureGuard action="read" subject="School">
				<Button
					variant="outline"
					onPress={hapticLight}
					className="rounded-full px-8 h-14 border-emberRed/40 shadow-sm bg-phase-surface active:bg-emberRed/5"
				>
					<HStack className="items-center gap-2.5">
						<Icon as={MessageCircle} size="sm" className="text-emberRed" />
						<ButtonText className="text-emberRed font-black uppercase text-[10px] tracking-[0.2em]">
							{t("teacher.actions.principalEcho") || "Principal Echo"}
						</ButtonText>
					</HStack>
				</Button>
			</FeatureGuard>
			<FeatureGuard action="read" subject="School">
				<Button
					variant="outline"
					onPress={hapticLight}
					className="rounded-full px-8 h-14 border-phase-canvas bg-phase-surface/50 shadow-sm active:bg-phase-canvas/20"
				>
					<HStack className="items-center gap-2.5">
						<Icon
							as={ClipboardList}
							size="sm"
							className="text-phaseText-primary"
						/>
						<ButtonText className="text-phaseText-primary font-black uppercase text-[10px] tracking-[0.2em]">
							My Echoes
						</ButtonText>
					</HStack>
				</Button>
			</FeatureGuard>
		</HStack>
	);
}
