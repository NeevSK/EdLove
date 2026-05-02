import { GlassCard } from "@repo/ui/components/GlassCard";
import {
	AnimatedView,
	Heading,
	HStack,
	Icon,
	Pressable,
	Text,
	VStack,
} from "@repo/ui/primitives";

import { CloudRain, Flower2, Sun, Wind, Zap } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";

/**
 * MOOD LOTUS COMPONENT
 * Daily mood check-in with lotus visual metaphor
 *
 * Visual States:
 * 1 = Closed Bud (Dark) - Heavy/Struggling
 * 2 = Slight Opening (Dim) - Challenging
 * 3 = Half Bloom (Medium) - Neutral/Okay
 * 4 = Full Bloom (Bright) - Good/Positive
 * 5 = Radiant (Glow) - Inspired/Joyful
 */
interface MoodLotusProps {
	userId?: string;
	onMoodChange?: (mood: number) => void;
	disabled?: boolean;
}

export const MoodLotus: React.FC<MoodLotusProps> = ({
	onMoodChange,
	disabled,
}) => {
	const { t } = useTranslation();
	const [selectedMood, setSelectedMood] = useState<number | null>(null);
	const rotation = useSharedValue(0);

	const moodOptions = [
		{
			level: 1,
			icon: CloudRain,
			label: t("self.moodHeavy") || "Heavy",
			colorClass: "text-dimGray",
			bgClass: "bg-dimGray/10",
		},
		{
			level: 2,
			icon: Wind,
			label: t("self.moodChallenging") || "Challenging",
			colorClass: "text-skyBlue",
			bgClass: "bg-skyBlue/10",
		},
		{
			level: 3,
			icon: Flower2,
			label: t("self.moodNeutral") || "Neutral",
			colorClass: "text-emeraldGreen",
			bgClass: "bg-emeraldGreen/10",
		},
		{
			level: 4,
			icon: Sun,
			label: t("self.moodPositive") || "Positive",
			colorClass: "text-goldenApricot",
			bgClass: "bg-goldenApricot/10",
		},
		{
			level: 5,
			icon: Zap,
			label: t("self.moodRadiant") || "Radiant",
			colorClass: "text-sanctuarySaffron",
			bgClass: "bg-sanctuarySaffron/10",
		},
	];

	const handleMoodSelect = (level: number) => {
		if (disabled) return;
		setSelectedMood(level);
		rotation.value = withSpring(rotation.value + 360);
		onMoodChange?.(level);
	};

	const lotusStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value}deg` }],
	}));

	const selectedOption =
		selectedMood !== null ? moodOptions[selectedMood - 1] : null;

	return (
		<GlassCard className="p-xl rounded-[32px]">
			<VStack className="items-center gap-xl">
				<Heading size="md" className="text-sacredWhite font-bold text-center">
					{t("self.moodHowAreYou") || "How is your inner lotus today?"}
				</Heading>

				<AnimatedView
					style={[lotusStyle]}
					className="items-center justify-center w-[120px] h-[120px]"
				>
					<Icon
						as={Flower2}
						size={80}
						className={
							selectedOption ? selectedOption.colorClass : "text-mistGray"
						}
						strokeWidth={1.5}
					/>
				</AnimatedView>

				<HStack className="justify-center gap-4">
					{moodOptions.map((option) => {
						const isSelected = selectedMood === option.level;
						return (
							<VStack key={option.level} className="items-center gap-2">
								<Pressable
									onPress={() => handleMoodSelect(option.level)}
									disabled={disabled}
									className={`w-12 h-12 rounded-full items-center justify-center border-2 transition-all ${
										isSelected
											? `${option.bgClass} border-sanctuarySaffron`
											: "bg-white/5 border-transparent"
									}`}
								>
									<Icon
										as={option.icon}
										size={24}
										className={isSelected ? option.colorClass : "text-mistGray"}
									/>
								</Pressable>
								<Text
									className={`text-[10px] text-center ${isSelected ? "text-sacredWhite font-semibold" : "text-mistGray font-normal"}`}
								>
									{option.label}
								</Text>
							</VStack>
						);
					})}
				</HStack>
			</VStack>
		</GlassCard>
	);
};

export default MoodLotus;
