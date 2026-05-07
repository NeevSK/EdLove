import SanctuaryModal from "@repo/ui/components/SanctuaryModal";
import { Box, ScrollView, Text } from "@repo/ui/primitives";

import TeacherAdminWidget from "./TeacherAdminWidget";

interface TeacherAdminPortalModalProps {
	visible: boolean;
	onClose: () => void;
	onAction?: (action: string) => void;
	title?: string;
}

/**
 * TEACHER ADMIN PORTAL MODAL
 * Sanctuary V3 standard for full-screen administrative access.
 * Features premium glassmorphism and standardized Sanctuary primitives.
 */
export default function TeacherAdminPortalModal({
	visible,
	onClose,
	onAction,
	title = "Administrative Portal",
}: TeacherAdminPortalModalProps) {
	return (
		<SanctuaryModal
			isOpen={visible}
			onClose={onClose}
			title={title}
			subtitle="SOVEREIGN MANAGEMENT"
		>
			<Box className="flex-1">
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ padding: 0, paddingBottom: 60 }}
				>
					<TeacherAdminWidget onAction={onAction} />

					<Box className="mt-12 p-6 bg-phase-surface/30 rounded-[32px] border border-phase-surface/50">
						<Text className="text-xs text-phase-text-tertiary leading-5 font-medium italic text-center">
							This portal is secured by the Gurudevi Sanctuary Governance
							protocols. All administrative actions are logged in the sovereign
							record.
						</Text>
					</Box>
				</ScrollView>
			</Box>
		</SanctuaryModal>
	);
}
