import { useNavigation } from "@react-navigation/native";
import { Sparkles, ArrowRight } from "@repo/ui/icons";
import { Box, HStack, Icon, Pressable, Text, VStack } from "@repo/ui/primitives";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * SanctuarySignal: A premium, non-intrusive conversion prompt
 * for guest users to join the sanctuary.
 */
export const SanctuarySignal = () => {
	const { t } = useTranslation();
	const navigation = useNavigation<any>();

	return (
		<Box className="m-4">
			<Pressable
				onPress={() => navigation.navigate("Auth")}
				className="group p-5 rounded-[24px] bg-white/5 border border-white/10 hover:border-phase-accent/30 transition-all duration-500 overflow-hidden relative shadow-xl"
				style={{
					backdropFilter: 'blur(10px)',
					background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
				} as any}
			>
				{/* Background Decoration */}
				<Box 
					className="absolute -top-10 -right-10 w-32 h-32 bg-phase-accent/10 rounded-full blur-3xl group-hover:bg-phase-accent/20 transition-all duration-700"
				/>

				<VStack space="md">
					<HStack space="md" className="items-center">
						<Box 
							className="w-10 h-10 rounded-xl bg-phase-accent/15 items-center justify-center shadow-inner"
							style={{ transform: 'rotate(-5deg)' }}
						>
							<Icon as={Sparkles} size={20} className="text-phase-accent animate-pulse" />
						</Box>
						<VStack>
							<Text className="text-[10px] font-black text-phase-accent uppercase tracking-[2px]">
								{t("common.guestInvitation") || "Invitation"}
							</Text>
							<Text className="text-sm font-black text-ink uppercase tracking-tight">
								{t("common.joinSanctuary") || "Join Sanctuary"}
							</Text>
						</VStack>
					</HStack>

					<Text className="text-sm text-ink/60 font-medium leading-relaxed">
						{t("common.joinSanctuaryDescription") ||
							"Step into the heart of the community. Contribution before utility."}
					</Text>

					<HStack className="items-center gap-2 mt-1">
						<Box className="h-0.5 flex-1 bg-ink/5" />
						<HStack className="items-center gap-1.5">
							<Text className="text-xs font-black text-phase-accent uppercase tracking-wider">
								{t("common.claimYourSpace") || "Claim Space"}
							</Text>
							<Icon as={ArrowRight} size={14} className="text-phase-accent group-hover:translate-x-1 transition-transform duration-300" />
						</HStack>
					</HStack>
				</VStack>
			</Pressable>
		</Box>
	);
};
