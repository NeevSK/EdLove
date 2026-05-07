/**
 * PrincipalObservationsSection
 *
 * Compact observation notes widget:
 *  - Last 5 observations with type badge, content, date
 *  - Inline new-observation form
 */

import { supabase } from "@repo/core/api";

import {
	Box,
	Heading,
	HStack,
	Icon,
	Input,
	InputField,
	Pressable,
	Spinner,
	Text,
	VStack,
} from "@repo/ui/primitives";
import { hapticLight } from "@repo/ui/utils/haptics";

import { Plus } from "lucide-react-native";
import { useEffect, useReducer } from "react";

interface Observation {
	id: string;
	type: string;
	content: string;
	created_at: string;
}

interface PrincipalObservationsSectionProps {
	schoolId: string;
	principalId: string;
}

const OBS_TYPE_OPTIONS = ["walkthrough", "note", "concern", "praise"];

type State = {
	observations: Observation[];
	isLoading: boolean;
	isAddFormVisible: boolean;
	form: {
		content: string;
		obsType: string;
		isSaving: boolean;
	};
};

type Action =
	| { type: "SET_OBSERVATIONS"; observations: Observation[] }
	| { type: "SET_LOADING"; isLoading: boolean }
	| { type: "TOGGLE_FORM" }
	| { type: "UPDATE_FORM_CONTENT"; content: string }
	| { type: "SET_OBS_TYPE"; obsType: string }
	| { type: "SET_SAVING"; isSaving: boolean }
	| { type: "RESET_FORM" };

const obsReducer = (state: State, action: Action): State => {
	switch (action.type) {
		case "SET_OBSERVATIONS":
			return { ...state, observations: action.observations, isLoading: false };
		case "SET_LOADING":
			return { ...state, isLoading: action.isLoading };
		case "TOGGLE_FORM":
			return { ...state, isAddFormVisible: !state.isAddFormVisible };
		case "UPDATE_FORM_CONTENT":
			return { ...state, form: { ...state.form, content: action.content } };
		case "SET_OBS_TYPE":
			return { ...state, form: { ...state.form, obsType: action.obsType } };
		case "SET_SAVING":
			return { ...state, form: { ...state.form, isSaving: action.isSaving } };
		case "RESET_FORM":
			return {
				...state,
				form: { content: "", obsType: "note", isSaving: false },
				isAddFormVisible: false,
			};
		default:
			return state;
	}
};

export default function PrincipalObservationsSection({
	schoolId,
	principalId,
}: PrincipalObservationsSectionProps) {
	const [state, dispatch] = useReducer(obsReducer, {
		observations: [],
		isLoading: true,
		isAddFormVisible: false,
		form: {
			content: "",
			obsType: "note",
			isSaving: false,
		},
	});

	const getObsStyles = (type: string) => {
		switch (type) {
			case "walkthrough":
				return { bg: "bg-phase-interactive", text: "text-white" };
			case "concern":
				return { bg: "bg-phase-danger", text: "text-white" };
			case "praise":
				return { bg: "bg-phase-success", text: "text-white" };
			case "note":
				return {
					bg: "bg-phase-interactive/20",
					text: "text-phase-interactive",
				};
			default:
				return { bg: "bg-phaseText-muted/10", text: "text-phaseText-muted" };
		}
	};

	async function fetchObservations() {
		try {
			const { data } = await supabase
				.from("principal_observations")
				.select("*")
				.eq("principal_id", principalId)
				.order("created_at", { ascending: false })
				.limit(5);
			dispatch({
				type: "SET_OBSERVATIONS",
				observations: (data ?? []) as Observation[],
			});
		} catch (err) {
			console.error("PrincipalObservations: fetch error", err);
			dispatch({ type: "SET_LOADING", isLoading: false });
		}
	}

	useEffect(() => {
		dispatch({ type: "SET_LOADING", isLoading: true });
		fetchObservations();
	}, [fetchObservations]);

	async function handleSave() {
		const { content, obsType } = state.form;
		if (!content.trim()) return;
		dispatch({ type: "SET_SAVING", isSaving: true });
		try {
			const { error } = await supabase.from("principal_observations").insert({
				school_id: schoolId,
				principal_id: principalId,
				type: obsType,
				content: content.trim(),
			});
			if (!error) {
				hapticLight();
				dispatch({ type: "RESET_FORM" });
				await fetchObservations();
			}
		} catch (err) {
			console.error("PrincipalObservations: save error", err);
			dispatch({ type: "SET_SAVING", isSaving: false });
		}
	}

	return (
		<Box className="bg-phase-surface rounded-[32px] border border-phase-border p-6 shadow-sm">
			<HStack className="justify-between items-center mb-6">
				<VStack className="gap-0.5">
					<Heading className="text-[20px] font-black text-phaseText-primary tracking-tight">
						Observations
					</Heading>
					<Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">
						Institutional Logs
					</Text>
				</VStack>
				<Pressable
					onPress={() => {
						hapticLight();
						dispatch({ type: "TOGGLE_FORM" });
					}}
					className={`rounded-[18px] px-4 py-2.5 flex-row items-center gap-2 active:scale-95 transition-all shadow-sm ${state.isAddFormVisible ? "bg-phase-canvas border border-phase-border" : "bg-phase-interactive"}`}
					accessibilityLabel={
						state.isAddFormVisible
							? "Hide observation form"
							: "Create new observation"
					}
					accessibilityHint="Toggles the form to record a new institutional observation"
				>
					<Icon
						as={Plus}
						size="xs"
						className={
							state.isAddFormVisible ? "text-phaseText-primary" : "text-white"
						}
					/>
					<Text
						className={`text-[11px] font-black uppercase tracking-widest ${state.isAddFormVisible ? "text-phaseText-primary" : "text-white"}`}
					>
						{state.isAddFormVisible ? "Hide" : "New Entry"}
					</Text>
				</Pressable>
			</HStack>

			{state.isLoading && (
				<Box className="h-[120px] items-center justify-center bg-phase-canvas rounded-[24px] border border-phase-border opacity-50">
					<Spinner className="text-phase-interactive" />
				</Box>
			)}

			{!state.isLoading &&
				state.observations.length === 0 &&
				!state.isAddFormVisible && (
					<Box className="bg-phase-canvas rounded-[24px] border border-dashed border-phase-border py-12 px-6 items-center">
						<Text className="text-[12px] font-black text-phaseText-muted text-center leading-relaxed uppercase tracking-[2px] opacity-40">
							Institutional memory current.
						</Text>
					</Box>
				)}

			{!state.isLoading &&
				state.observations.map((obs, index) => {
					const styles = getObsStyles(obs.type);
					return (
						<VStack
							key={obs.id}
							className={`py-5 ${index !== state.observations.length - 1 ? "border-b border-phase-border/50" : ""} gap-3`}
						>
							<HStack className="items-center justify-between">
								<Box
									className={`rounded-lg px-2.5 py-1 ${styles.bg} border border-transparent`}
								>
									<Text
										className={`text-[9px] font-black uppercase tracking-widest ${styles.text}`}
									>
										{obs.type}
									</Text>
								</Box>
								<Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest opacity-60">
									{new Date(obs.created_at).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									})}
								</Text>
							</HStack>
							<Text
								className="text-[14px] leading-[22px] text-phaseText-primary font-bold opacity-90"
								numberOfLines={3}
							>
								{obs.content}
							</Text>
						</VStack>
					);
				})}

			{state.isAddFormVisible && (
				<VStack className="mt-4 gap-6 border-t border-phase-border pt-8">
					<VStack className="gap-1.5">
						<Text className="text-[11px] font-black text-phaseText-primary uppercase tracking-[2px]">
							Capture Observation
						</Text>
						<Input className="min-h-[140px] bg-phase-canvas border border-phase-border rounded-[24px] p-5 shadow-inner">
							<InputField
								placeholder="Record high-level institutional signal..."
								placeholderTextColor="rgba(0,0,0,0.3)"
								value={state.form.content}
								onChangeText={(val) =>
									dispatch({ type: "UPDATE_FORM_CONTENT", content: val })
								}
								multiline
								className="text-[15px] font-bold text-phaseText-primary"
								accessibilityLabel="Observation content"
								accessibilityHint="Enter the details of your institutional observation"
							/>
						</Input>
					</VStack>

					<HStack className="gap-2.5 flex-wrap">
						{OBS_TYPE_OPTIONS.map((t) => {
							const isSelected = state.form.obsType === t;
							const styles = getObsStyles(t);
							return (
								<Pressable
									key={t}
									onPress={() => {
										hapticLight();
										dispatch({ type: "SET_OBS_TYPE", obsType: t });
									}}
									accessibilityLabel={`Type: ${t}`}
									accessibilityHint={`Categorizes this observation as ${t}`}
									accessibilityState={{ selected: isSelected }}
								>
									<Box
										className={`rounded-full px-5 py-2.5 border transition-all ${isSelected ? `${styles.bg} border-transparent` : "bg-phase-canvas border-phase-border"}`}
									>
										<Text
											className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-white" : "text-phaseText-muted"}`}
										>
											{t}
										</Text>
									</Box>
								</Pressable>
							);
						})}
					</HStack>

					<Pressable
						onPress={() => {
							hapticLight();
							handleSave();
						}}
						disabled={state.form.isSaving || !state.form.content.trim()}
						className={`bg-phase-interactive rounded-[20px] h-16 items-center justify-center shadow-md active:scale-95 transition-all ${state.form.isSaving || !state.form.content.trim() ? "opacity-50" : ""}`}
						accessibilityLabel="Commit to Record"
						accessibilityHint="Saves this observation to the permanent institutional record"
					>
						<HStack className="gap-3 items-center">
							{state.form.isSaving && <Spinner size="small" color="#FFFFFF" />}
							<Text className="text-[12px] font-black text-white uppercase tracking-[3px]">
								{state.form.isSaving ? "Recording..." : "Commit to Record"}
							</Text>
						</HStack>
					</Pressable>
				</VStack>
			)}
		</Box>
	);
}
