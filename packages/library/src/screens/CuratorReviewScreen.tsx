import { useNavigation } from "@react-navigation/native";
import { supabase } from "@repo/core/api";
import { usePermissions, useStore } from "@repo/core/logic";

import GlobalHeader from "@repo/ui/components/GlobalHeader";
import ScreenWrapper from "@repo/ui/components/ScreenWrapper";
import {
	Box,
	HStack,
	Pressable,
	Icon as SanctuaryIcon,
	Spinner,
	Text,
	useTheme,
	VStack,
} from "@repo/ui/primitives";
import SanctuaryFlashList from "@repo/ui/components/SanctuaryFlashList";

import { Check, RefreshCw, Trash2, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useReducer } from "react";

// --- Types & State Machine (Pillar 2: Reducer Pattern) ---

type CuratorTab = "staging" | "broken";

interface CuratorState {
	stagingItems: any[];
	brokenItems: any[];
	loading: boolean;
	activeTab: CuratorTab;
}

type CuratorAction =
	| { type: "START_LOADING" }
	| { type: "SET_STAGING"; payload: any[] }
	| { type: "SET_BROKEN"; payload: any[] }
	| { type: "SET_TAB"; payload: CuratorTab }
	| { type: "FINISH_LOADING" };

const curatorReducer = (
	state: CuratorState,
	action: CuratorAction,
): CuratorState => {
	switch (action.type) {
		case "START_LOADING":
			return { ...state, loading: true };
		case "SET_STAGING":
			return { ...state, stagingItems: action.payload, loading: false };
		case "SET_BROKEN":
			return { ...state, brokenItems: action.payload, loading: false };
		case "SET_TAB":
			return { ...state, activeTab: action.payload };
		case "FINISH_LOADING":
			return { ...state, loading: false };
		default:
			return state;
	}
};

const initialState: CuratorState = {
	stagingItems: [],
	brokenItems: [],
	loading: true,
	activeTab: "staging",
};

/**
 * CuratorReviewScreen
 * 2026 Sovereign Refactor: Zero-Legacy State & Memory Engineering.
 */
export default function CuratorReviewScreen() {
	const { can, flags } = usePermissions();
	const navigation = useNavigation<any>();
	const theme = useTheme();
	const showToast = useStore((state) => state.showToast);

	const [state, dispatch] = useReducer(curatorReducer, initialState);

	// --- Permissions Stability ---
	const isLibraryEnabled = flags.isLibraryManagementEnabled;
	const canManage = can("manage", "LibraryCuratorDashboard");

	// --- Action Logic (Pillar 2: Stabilized Callbacks) ---

	const fetchStaging = useCallback(async () => {
		dispatch({ type: "START_LOADING" });
		const { data, error } = await supabase
			.from("staging")
			.select("*")
			.order("created_at", { ascending: false });

		if (!error) dispatch({ type: "SET_STAGING", payload: data || [] });
		else dispatch({ type: "FINISH_LOADING" });
	}, []);

	const fetchBroken = useCallback(async () => {
		dispatch({ type: "START_LOADING" });
		const { data, error } = await supabase
			.from("library_resources")
			.select("*")
			.or("link_status.eq.broken,fail_count.gt.0")
			.order("fail_count", { ascending: false });

		if (!error) dispatch({ type: "SET_BROKEN", payload: data || [] });
		else dispatch({ type: "FINISH_LOADING" });
	}, []);

	const handlePublish = useCallback(
		async (id: string) => {
			try {
				const { error: updateError } = await supabase
					.from("staging")
					.update({ status: "approved" })
					.eq("id", id);

				if (updateError) throw updateError;

				const { error } = await supabase.functions.invoke("publish-resource", {
					body: { staging_id: id },
				});

				if (error) throw error;

				showToast("Resource published to the Cosmos!", "success");
				fetchStaging();
			} catch (err: any) {
				showToast(err.message, "error");
			}
		},
		[fetchStaging, showToast],
	);

	const handleRepair = useCallback(
		(_id: string) => {
			showToast(
				"Repair Link feature (Input) will be integrated in the next UI pass.",
				"info",
			);
		},
		[showToast],
	);

	const handleDeleteResource = useCallback(
		async (id: string) => {
			const { error } = await supabase
				.from("library_resources")
				.delete()
				.eq("id", id);
			if (!error) {
				showToast("Resource removed.", "success");
				fetchBroken();
			}
		},
		[fetchBroken, showToast],
	);

	const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
	const setStagingTab = useCallback(
		() => dispatch({ type: "SET_TAB", payload: "staging" }),
		[],
	);
	const setBrokenTab = useCallback(
		() => dispatch({ type: "SET_TAB", payload: "broken" }),
		[],
	);

	// --- Lifecycle ---
	useEffect(() => {
		if (state.activeTab === "staging") fetchStaging();
		else fetchBroken();
	}, [state.activeTab, fetchStaging, fetchBroken]);

	// --- Item Renderers (Pillar 2: Zero-Allocation Optimization) ---
	// Using useCallback to ensure these functions are referentially stable

	const renderItem = useCallback(
		({ item }: { item: any }) => (
			<Box className="p-4 mb-3 rounded-2xl bg-white dark:bg-phase-surface border border-phase-border shadow-sm">
				<VStack className="gap-2">
					<HStack className="justify-between items-center">
						<Text className="text-base font-bold text-phaseText-primary flex-1">
							{item.title}
						</Text>
						<Box
							className="px-2 py-0.5 rounded"
							style={{ backgroundColor: `${theme.accent.action}22` }}
						>
							<Text
								className="text-[10px] font-bold"
								style={{ color: theme.accent.action }}
							>
								{item.content_type?.toUpperCase() || "EXTERNAL"}
							</Text>
						</Box>
					</HStack>

					<Text
						className="text-[13px] text-phaseText-secondary"
						numberOfLines={2}
					>
						{item.description}
					</Text>

					<HStack className="gap-3 mt-2">
						<Pressable
							className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-phase-accent active:opacity-80"
							onPress={() => handlePublish(item.id)}
						>
							<SanctuaryIcon as={Check} size={16} color="white" />
							<Text className="text-white font-bold text-xs">Publish</Text>
						</Pressable>

						<Pressable
							className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-phase-surface/80 border border-phase-border active:opacity-80"
							onPress={() => {
								/* TODO */
							}}
						>
							<SanctuaryIcon as={X} size={16} color={theme.text.secondary} />
							<Text className="text-phaseText-secondary text-xs font-bold">
								Reject
							</Text>
						</Pressable>
					</HStack>
				</VStack>
			</Box>
		),
		[theme.accent.action, theme.text.secondary, handlePublish],
	);

	const renderBrokenItem = useCallback(
		({ item }: { item: any }) => (
			<Box className="p-4 mb-3 rounded-2xl bg-phase-danger/5 border border-phase-danger/10">
				<VStack className="gap-2">
					<HStack className="justify-between items-center">
						<Text className="text-base font-bold text-phaseText-primary flex-1">
							{item.title}
						</Text>
						<Box className="px-2 py-0.5 rounded bg-phase-danger/20">
							<Text className="text-[10px] text-phase-danger font-bold">
								{item.fail_count || 0} REPORTS
							</Text>
						</Box>
					</HStack>
					<Text
						className="text-[12px] text-phaseText-secondary"
						numberOfLines={1}
					>
						{item.url}
					</Text>
					<HStack className="gap-3 mt-2">
						<Pressable
							className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-phase-accent active:opacity-80"
							onPress={() => handleRepair(item.id)}
						>
							<SanctuaryIcon as={RefreshCw} size={14} color="white" />
							<Text className="text-white text-xs font-bold">Fix Link</Text>
						</Pressable>
						<Pressable
							className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-phase-danger/10 active:opacity-80"
							onPress={() => handleDeleteResource(item.id)}
						>
							<SanctuaryIcon
								as={Trash2}
								size={14}
								color={theme.accent.danger}
							/>
							<Text className="text-phase-danger text-xs font-bold">
								Remove
							</Text>
						</Pressable>
					</HStack>
				</VStack>
			</Box>
		),
		[theme.accent.danger, handleRepair, handleDeleteResource],
	);

	// --- Derived Config ---
	const activeData = useMemo(
		() =>
			state.activeTab === "staging" ? state.stagingItems : state.brokenItems,
		[state.activeTab, state.stagingItems, state.brokenItems],
	);

	const activeRenderer = useMemo(
		() => (state.activeTab === "staging" ? renderItem : renderBrokenItem),
		[state.activeTab, renderItem, renderBrokenItem],
	);

	// Handle initial access check
	if (!isLibraryEnabled || !canManage) {
		return (
			<ScreenWrapper>
				<GlobalHeader title="Curator Review" showBack onBack={handleGoBack} />
				<Box className="flex-1 justify-center items-center p-10">
					<Text className="text-phaseText-secondary text-center">
						Access Denied. Curation features are currently restricted.
					</Text>
				</Box>
			</ScreenWrapper>
		);
	}

	return (
		<ScreenWrapper>
			<GlobalHeader
				title="Curator Dashboard"
				subtitle="Review incoming knowledge streams"
				onBack={handleGoBack}
			/>

			<HStack className="px-4 mb-4 border-b border-phase-border">
				<Pressable
					onPress={setStagingTab}
					className={`py-3 px-5 ${state.activeTab === "staging" ? "border-b-2 border-phase-accent" : ""}`}
				>
					<Text
						className="font-bold"
						style={{
							color:
								state.activeTab === "staging"
									? theme.text.primary
									: theme.text.secondary,
						}}
					>
						Staged
					</Text>
				</Pressable>
				<Pressable
					onPress={setBrokenTab}
					className={`py-3 px-5 ${state.activeTab === "broken" ? "border-b-2 border-phase-danger" : ""}`}
				>
					<Text
						className="font-bold"
						style={{
							color:
								state.activeTab === "broken"
									? theme.accent.danger
									: theme.text.secondary,
						}}
					>
						Broken Links
					</Text>
				</Pressable>
			</HStack>

			{state.loading ? (
				<Box className="mt-10 items-center">
					<Spinner size="large" color={theme.accent.action} />
				</Box>
			) : (
				<SanctuaryFlashList
					data={activeData}
					keyExtractor={(item) => item.id}
					renderItem={activeRenderer}
					contentContainerStyle={{ padding: 16 }}
					estimatedItemSize={120}
					ListEmptyComponent={
						<Box className="mt-20 items-center">
							<Text className="text-phaseText-secondary text-center">
								The wisdom stream is quiet today.
							</Text>
						</Box>
					}
				/>
			)}
		</ScreenWrapper>
	);
}
