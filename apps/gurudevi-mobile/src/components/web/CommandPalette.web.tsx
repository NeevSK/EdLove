/**
 * CommandPalette — Web-exclusive Cmd+K power feature (Zero-Legacy Ready)
 *
 * Brings the "developer god mode" experience to Gurudevi on web.
 * Includes Sovereign Web decoupling by removing react-native UI dependencies.
 */

import {
	AnimatedView,
	Box,
	Pressable,
	ScrollView,
	Text,
	useTheme,
	VStack,
} from "@repo/ui/primitives";
import { colors } from "@repo/ui/theme";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";

const { shroud, sanctuarySaffron, mistGray, willow } = colors;

import { navigationRef } from "../../navigation/navigationRef";

// ─── Icons (inline SVG paths) ──────────────────────────────────────────────────
const GLYPHS: Record<string, string> = {
	Self: "♥",
	Classroom: "🏫",
	Community: "🤝",
	Library: "📚",
	Profile: "👤",
	AIAssistant: "✦",
	QRScanner: "⊞",
};

// ─── Command definitions ───────────────────────────────────────────────────────
interface Command {
	id: string;
	label: string;
	subtitle?: string;
	glyph: string;
	section: string;
	shortcut?: string;
	action: () => void;
}

// ─── Custom Web Hooks ────────────────────────────────────────────────────────
function useWebDimensions() {
	const [dims, setDims] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useEffect(() => {
		const handler = () =>
			setDims({ width: window.innerWidth, height: window.innerHeight });
		window.addEventListener("resize", handler);
		return () => window.removeEventListener("resize", handler);
	}, []);

	return dims;
}

// ─── Component ─────────────────────────────────────────────────────────────────
interface CommandPaletteProps {
	onOpenAI?: () => void;
	onOpenScanner?: () => void;
}

export default function CommandPalette({
	onOpenAI,
	onOpenScanner,
}: CommandPaletteProps) {
	const [visible, setVisible] = useState(false);
	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [searchFocused, setSearchFocused] = useState(false);
	const { isDark } = useTheme();
	const { width } = useWebDimensions();
	// Using generic HTMLInputElement ref for Sovereign Web purity
	const inputRef = useRef<HTMLInputElement>(null);

	// Animation values
	const opacity = useSharedValue(0);
	const scale = useSharedValue(0.94);
	const backdropOpacity = useSharedValue(0);

	const open = useCallback(() => {
		setVisible(true);
		setQuery("");
		setSelectedIndex(0);
		opacity.value = withSpring(1, { damping: 20, stiffness: 300 });
		scale.value = withSpring(1, { damping: 20, stiffness: 300 });
		backdropOpacity.value = withTiming(1, { duration: 180 });
		setTimeout(() => inputRef.current?.focus(), 80);
	}, [opacity, scale, backdropOpacity]);

	const close = useCallback(() => {
		opacity.value = withTiming(0, { duration: 140 });
		scale.value = withTiming(0.94, { duration: 140 });
		backdropOpacity.value = withTiming(0, { duration: 140 });
		setTimeout(() => setVisible(false), 150);
	}, [opacity, scale, backdropOpacity]);

	const navigate = useCallback(
		(screen: string, params?: Record<string, unknown>) => {
			if (navigationRef.isReady()) {
				(
					navigationRef as unknown as {
						navigate: (s: string, p?: Record<string, unknown>) => void;
					}
				).navigate(screen, params);
			}
		},
		[],
	);

	const goToTab = useCallback(
		(tabName: string) => {
			if (!navigationRef.isReady()) return;
			const state = navigationRef.getState() as
				| { routes?: Array<{ name: string }> }
				| undefined;
			const hasMain = state?.routes?.some((r) => r.name === "Main");
			if (hasMain) {
				navigate("Main", { screen: tabName });
			}
			close();
		},
		[navigate, close],
	);

	const commands: Command[] = useMemo(
		() => [
			{
				id: "self",
				label: "Self",
				subtitle: "Your sanctuary & wellbeing",
				glyph: GLYPHS["Self"] ?? "",
				section: "Navigate",
				shortcut: "⌘3",
				action: () => goToTab("Self"),
			},
			{
				id: "classroom",
				label: "Classroom",
				subtitle: "Lessons, students & teaching",
				glyph: GLYPHS["Classroom"] ?? "",
				section: "Navigate",
				shortcut: "⌘2",
				action: () => goToTab("Classroom"),
			},
			{
				id: "community",
				label: "Community",
				subtitle: "Teachers sharing wisdom",
				glyph: GLYPHS["Community"] ?? "",
				section: "Navigate",
				shortcut: "⌘4",
				action: () => goToTab("Community"),
			},
			{
				id: "library",
				label: "Library",
				subtitle: "Resources & knowledge",
				glyph: GLYPHS["Library"] ?? "",
				section: "Navigate",
				shortcut: "⌘5",
				action: () => goToTab("Library"),
			},
			{
				id: "profile",
				label: "Profile",
				subtitle: "Your identity & settings",
				glyph: GLYPHS["Profile"] ?? "",
				section: "Navigate",
				shortcut: "⌘1",
				action: () => goToTab("Profile"),
			},
			{
				id: "ai",
				label: "AI Assistant",
				subtitle: "Ask anything about teaching",
				glyph: GLYPHS["AIAssistant"] ?? "",
				section: "Tools",
				shortcut: "⌘.",
				action: () => {
					onOpenAI?.();
					navigate("AIAssistant");
					close();
				},
			},
			{
				id: "qr",
				label: "Scan QR Code",
				subtitle: "Join a class or redeem Thuthimal",
				glyph: GLYPHS["QRScanner"] ?? "",
				section: "Tools",
				action: () => {
					onOpenScanner?.();
					close();
				},
			},
		],
		[goToTab, navigate, close, onOpenAI, onOpenScanner],
	);

	const filtered = useMemo(
		() =>
			query.trim()
				? commands.filter(
						(c) =>
							c.label.toLowerCase().includes(query.toLowerCase()) ||
							(c.subtitle ?? "").toLowerCase().includes(query.toLowerCase()),
					)
				: commands,
		[query, commands],
	);

	const sections = useMemo(
		() =>
			filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
				const bucket = acc[cmd.section] ?? (acc[cmd.section] = []);
				bucket.push(cmd);
				return acc;
			}, {}),
		[filtered],
	);

	useEffect(() => {
		const TAB_MAP: Record<string, string> = {
			"1": "Profile",
			"2": "Classroom",
			"3": "Self",
			"4": "Community",
			"5": "Library",
		};

		const handler = (e: KeyboardEvent) => {
			const meta = e.metaKey || e.ctrlKey;
			if (meta && e.key === "k") {
				e.preventDefault();
				if (visible) close();
				else open();
				return;
			}
			if (meta && e.key === ".") {
				e.preventDefault();
				navigate("AIAssistant");
				return;
			}
			const tab = TAB_MAP[e.key];
			if (meta && tab) {
				e.preventDefault();
				goToTab(tab);
				return;
			}
			if (!visible) return;
			if (e.key === "Escape") {
				close();
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((i) => Math.max(i - 1, 0));
			}
			if (e.key === "Enter") {
				e.preventDefault();
				filtered[selectedIndex]?.action();
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [visible, filtered, selectedIndex, open, close, goToTab, navigate]);

	useEffect(() => {
		setSelectedIndex(0);
	}, []);

	const cardStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: scale.value }],
	}));
	const backdropStyle = useAnimatedStyle(() => ({
		opacity: backdropOpacity.value,
	}));

	if (!visible) return null;

	const bg = isDark ? shroud : "#FFFDF7";
	const border = isDark ? "rgba(252,249,242,0.10)" : "rgba(42,35,24,0.08)";
	const sectionColor = isDark ? "#A0A0A0" : "#4B4B4B";
	const inputColor = isDark ? "#FFFFFF" : "#000000";

	let globalIndex = 0;

	return (
		<Box
			className="absolute inset-0 z-[1000]"
			style={{ pointerEvents: "box-none" }}
		>
			{/* Backdrop */}
			<AnimatedView
				style={backdropStyle}
				className="absolute inset-0 bg-black/40"
			>
				<Pressable
					className="absolute inset-0"
					onPress={close}
					accessibilityLabel="Close command palette"
				/>
			</AnimatedView>

			<Box
				className="flex-1 items-center pt-[12%]"
				style={{ pointerEvents: "box-none" }}
			>
				<AnimatedView
					accessibilityViewIsModal
					style={[
						cardStyle,
						{
							backgroundColor: bg,
							borderColor: border,
							width: Math.min(580, width - 48),
						},
					]}
					className="rounded-[20px] border elevation-24 overflow-hidden max-h-[520px]"
				>
					{/* Search input */}
					<Box
						className="flex-row items-center px-5 py-4 border-b gap-3"
						style={{
							borderBottomColor: searchFocused ? "#D4843A" : border,
							borderBottomWidth: searchFocused ? 1.5 : 1,
						}}
					>
						<Text
							className="text-xl w-[22px] text-center"
							style={{ color: sanctuarySaffron }}
						>
							⌕
						</Text>
						{/* Standard HTML input for Sovereign Web purity */}
						<input
							ref={inputRef as any}
							className="flex-1 bg-transparent border-none outline-none text-[17px] py-0"
							style={{ color: inputColor }}
							placeholder="Navigate anywhere…"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onFocus={() => setSearchFocused(true)}
							onBlur={() => setSearchFocused(false)}
							autoCorrect="off"
							autoCapitalize="none"
							spellCheck="false"
						/>
						<Box className="px-2 py-0.75 rounded-md border border-lotusDeepPink/20">
							<Text
								className="text-[11px] font-bold tracking-wider"
								style={{ color: sectionColor }}
							>
								ESC
							</Text>
						</Box>
					</Box>

					{/* Commands */}
					<ScrollView
						className="max-h-[380px] py-2"
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="always"
					>
						{Object.entries(sections).map(([sectionName, cmds]) => (
							<Box key={sectionName}>
								<Text
									className="text-[10px] font-bold tracking-[1px] px-5 pt-3.5 pb-1"
									style={{ color: sectionColor }}
								>
									{sectionName.toUpperCase()}
								</Text>

								{cmds.map((cmd) => {
									const idx = globalIndex++;
									const isSelected = idx === selectedIndex;
									return (
										<Pressable
											accessibilityRole="button"
											key={cmd.id}
											onPress={cmd.action}
											onHoverIn={() => setSelectedIndex(idx)}
											className="flex-row items-center mx-2 px-3 py-2.5 rounded-xl gap-3 relative"
											style={
												isSelected
													? {
															backgroundColor: isDark
																? "rgba(212,132,58,0.12)"
																: "rgba(212,132,58,0.08)",
														}
													: undefined
											}
										>
											{/* Active bar */}
											<Box
												className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-sm bg-sanctuarySaffron"
												style={{ opacity: isSelected ? 1 : 0 }}
											/>

											<Box
												className="w-9 h-9 rounded-xl items-center justify-center flex-shrink-0"
												style={{
													backgroundColor: isSelected
														? `${sanctuarySaffron}1A`
														: isDark
															? "rgba(252,249,242,0.06)"
															: "rgba(42,35,24,0.05)",
												}}
											>
												<Text className="text-[17px]">{cmd.glyph}</Text>
											</Box>

											<VStack className="flex-1 gap-px">
												<Text
													className="text-[15px] tracking-tight"
													style={{
														color: isSelected ? "#D4843A" : inputColor,
														fontWeight: isSelected ? "700" : "500",
													}}
												>
													{cmd.label}
												</Text>
												{cmd.subtitle && (
													<Text
														className="text-xs leading-4"
														style={{ color: sectionColor }}
													>
														{cmd.subtitle}
													</Text>
												)}
											</VStack>

											{cmd.shortcut && (
												<Box
													className="px-2 py-0.75 rounded-md border"
													style={{
														backgroundColor: isSelected
															? "#D4843A20"
															: isDark
																? "rgba(252,249,242,0.08)"
																: "rgba(42,35,24,0.06)",
														borderColor: isSelected ? "#D4843A40" : border,
													}}
												>
													<Text
														className="text-xs font-bold tracking-tight"
														style={{
															color: isSelected ? "#D4843A" : sectionColor,
														}}
													>
														{cmd.shortcut}
													</Text>
												</Box>
											)}
										</Pressable>
									);
								})}
							</Box>
						))}

						{filtered.length === 0 && (
							<Box className="items-center py-8 gap-2">
								<Text className="text-3xl opacity-50">🪷</Text>
								<Text
									className="text-sm italic"
									style={{ color: sectionColor }}
								>
									No results for "{query}"
								</Text>
							</Box>
						)}
					</ScrollView>

					{/* Footer hint */}
					<Box
						className="border-t px-5 py-2.5 items-center"
						style={{ borderTopColor: border }}
					>
						<Text
							className="text-[11px] tracking-tight font-bold"
							style={{ color: sectionColor }}
						>
							↑↓ navigate · ↵ open · ⌘K close
						</Text>
					</Box>
				</AnimatedView>
			</Box>
		</Box>
	);
}
