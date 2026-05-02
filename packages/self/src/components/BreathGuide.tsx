/**
 * BREATH GUIDE COMPONENT
 * Petal-guided breathing companion
 * 1-minute breathing exercise with visual and haptic rhythm
 * EROI 60:1 (1 min → calm for hour)
 */

import {
	Box,
	Button,
	ButtonText,
	Icon,
	Pressable,
	Text,
	VStack,
} from "@repo/ui/primitives";

import * as Haptics from "expo-haptics";
import { Wind } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import Animated, {
	type AnimatedStyle,
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

interface BreathGuideProps {
	onComplete?: () => void;
}

type BreathPhase = "inhale" | "hold" | "exhale" | "rest";
const TOTAL_CYCLES = 4; // ~1 minute total

export default function BreathGuide({ onComplete }: BreathGuideProps) {
	const { t } = useTranslation();
	const [isActive, setIsActive] = useState(false);
	const [currentCycle, setCurrentCycle] = useState(0);
	const [phaseIndex, setPhaseIndex] = useState(0);

	const BREATH_CYCLE = React.useMemo(
		() => [
			{
				phase: "inhale" as BreathPhase,
				duration: 4000,
				instruction: t("self.inhale") || "Inhale",
			},
			{
				phase: "hold" as BreathPhase,
				duration: 2000,
				instruction: t("self.hold") || "Hold",
			},
			{
				phase: "exhale" as BreathPhase,
				duration: 6000,
				instruction: t("self.exhale") || "Exhale",
			},
			{
				phase: "rest" as BreathPhase,
				duration: 2000,
				instruction: t("self.rest") || "Rest",
			},
		],
		[t],
	);

	// Animation values
	const petalScale = useSharedValue(0.8);
	const petalOpacity = useSharedValue(0.5);
	const petalRotation = useSharedValue(0);

	const animatePetal = useCallback(
		(phase: BreathPhase, duration: number) => {
			switch (phase) {
				case "inhale":
					petalScale.value = withTiming(1.4, {
						duration,
						easing: Easing.inOut(Easing.ease),
					});
					petalOpacity.value = withTiming(1, {
						duration,
						easing: Easing.linear,
					});
					break;

				case "hold":
					petalScale.value = withTiming(1.4, {
						duration,
						easing: Easing.linear,
					});
					break;

				case "exhale":
					petalScale.value = withTiming(0.8, {
						duration,
						easing: Easing.inOut(Easing.ease),
					});
					petalOpacity.value = withTiming(0.5, {
						duration,
						easing: Easing.inOut(Easing.ease),
					});
					petalRotation.value = withTiming(petalRotation.value + 45, {
						duration,
						easing: Easing.linear,
					});
					break;

				case "rest":
					petalScale.value = withTiming(0.9, {
						duration: duration / 2,
						easing: Easing.inOut(Easing.ease),
					});
					break;
			}
		},
		[petalScale, petalOpacity, petalRotation],
	);

	const triggerHaptic = (phase: BreathPhase) => {
		if (Platform.OS === "web") return;

		switch (phase) {
			case "inhale":
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				break;
			case "hold":
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
				break;
			case "exhale":
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				break;
			case "rest":
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				break;
		}
	};

	const completeSession = useCallback(() => {
		setIsActive(false);
		if (Platform.OS !== "web") {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		}
		onComplete?.();
	}, [onComplete]);

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout> | undefined;
		if (isActive && currentCycle < TOTAL_CYCLES) {
			const currentStep = BREATH_CYCLE[phaseIndex];
			if (currentStep) {
				triggerHaptic(currentStep.phase);
				animatePetal(currentStep.phase, currentStep.duration);

				timeout = setTimeout(() => {
					const nextIndex = (phaseIndex + 1) % BREATH_CYCLE.length;
					if (nextIndex === 0) {
						setCurrentCycle((c) => c + 1);
					}
					setPhaseIndex(nextIndex);
				}, currentStep.duration);
			}
		} else if (currentCycle >= TOTAL_CYCLES) {
			completeSession();
		}
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	}, [
		isActive,
		currentCycle,
		phaseIndex,
		BREATH_CYCLE,
		animatePetal,
		completeSession,
		triggerHaptic,
	]);

	const startSession = () => {
		setIsActive(true);
		setCurrentCycle(0);
		setPhaseIndex(0);

		if (Platform.OS !== "web") {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		}
	};

	const stopSession = () => {
		setIsActive(false);
		setCurrentCycle(0);
		setPhaseIndex(0);
		petalScale.value = withTiming(0.8);
		petalOpacity.value = withTiming(0.5);
	};

	const petalStyle = useAnimatedStyle<AnimatedStyle<any>>(() => ({
		transform: [
			{ scale: petalScale.value },
			{ rotate: `${petalRotation.value}deg` },
		],
		opacity: petalOpacity.value,
	}));

	const currentInstruction =
		BREATH_CYCLE[phaseIndex]?.instruction || "Begin...";

	return (
		<VStack className="items-center p-lg gap-lg">
			{/* Breath visualization - Lotus Petal */}
			<Box className="items-center justify-center min-h-[250px]">
				<Animated.View style={petalStyle}>
					<Box
						className="w-[150px] h-[150px] rounded-full bg-gurudeviViolet items-center justify-center shadow-xl shadow-gurudeviViolet/60"
						style={{ elevation: 10 }}
					>
						<Text className="text-5xl">🌸</Text>
					</Box>
				</Animated.View>
			</Box>

			{/* Instruction text */}
			{isActive && (
				<VStack className="items-center gap-1">
					<Text className="text-ink text-2xl font-semibold text-center">
						{currentInstruction}
					</Text>
					<Text className="text-mistGray text-sm">
						{t("self.cycleCount", {
							current: currentCycle + 1,
							total: TOTAL_CYCLES,
						}) || `Cycle ${currentCycle + 1} of ${TOTAL_CYCLES}`}
					</Text>
				</VStack>
			)}

			{/* Controls */}
			<Box className="mt-lg">
				{!isActive ? (
					<Button
						size="lg"
						onPress={startSession}
						className="rounded-full bg-gurudeviViolet px-xl flex-row items-center justify-center"
					>
						<Icon as={Wind} className="text-white mr-2" size={20} />
						<ButtonText className="text-white">
							{t("self.startBreathing") || "Start Breathing"}
						</ButtonText>
					</Button>
				) : (
					<Pressable onPress={stopSession}>
						<Text className="text-mistGray text-sm underline">
							{t("self.stop") || "Stop"}
						</Text>
					</Pressable>
				)}
			</Box>

			{/* Info */}
			{!isActive && (
				<Box className="mt-md p-md bg-black/5 rounded-comfortable items-center">
					<Text className="text-mistGray text-xs text-center italic">
						{t("self.breathHero") ||
							"One minute of breathing, an hour of calm."}
					</Text>
				</Box>
			)}
		</VStack>
	);
}
