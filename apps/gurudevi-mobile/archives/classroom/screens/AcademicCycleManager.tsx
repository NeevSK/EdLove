import { api } from "@repo/core/api";
import type { AcademicCycle } from "@repo/core/types";
import { GlobalHeader } from "@repo/ui";
import { SkeletonCard } from "@repo/ui/components";
import { useThemedColors } from "@repo/ui/hooks";
import {
	Box,
	Button,
	ButtonText,
	HStack,
	Input,
	InputField,
	Pressable,
	ScrollView,
	Text,
	VStack,
} from "@repo/ui/primitives";
import { Theme } from "@repo/ui/theme";
import { hapticLight, hapticSuccess } from "@repo/ui/utils/haptics";
import {
	Calendar,
	CheckCircle2,
	Circle,
	Clock,
	Plus,
	Trash2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

interface AcademicCycleManagerProps {
	schoolId: string;
	onBack: () => void;
}
export default function AcademicCycleManager({
	schoolId,
	onBack,
}: AcademicCycleManagerProps) {
	const { t } = useTranslation();
	const colors = useThemedColors();
	const [cycles, setCycles] = useState<AcademicCycle[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddForm, setShowAddForm] = useState(false);
	// Form State
	const [name, setName] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [isCurrent, setIsCurrent] = useState(false);
	const [saving, setSaving] = useState(false);
	const fetchCycles = async () => {
		try {
			const data = await api.academicCycles.getAll(schoolId);
			setCycles(data);
		} catch (error) {
			console.error("Failed to fetch cycles:", error);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchCycles();
	}, [fetchCycles]);
	const handleCreate = async () => {
		if (!name || !startDate || !endDate) {
			Alert.alert("Missing Info", "Please fill in all fields");
			return;
		}
		setSaving(true);
		try {
			await api.academicCycles.create({
				school_id: schoolId,
				name,
				start_date: startDate,
				end_date: endDate,
				is_current: isCurrent,
			});
			hapticSuccess();
			setName("");
			setStartDate("");
			setEndDate("");
			setIsCurrent(false);
			setShowAddForm(false);
			fetchCycles();
		} catch (_error) {
			Alert.alert("Error", "Failed to create academic cycle");
		} finally {
			setSaving(false);
		}
	};
	const handleSetCurrent = async (cycleId: string) => {
		try {
			await api.academicCycles.update(cycleId, schoolId, { is_current: true });
			hapticLight();
			fetchCycles();
		} catch (_error) {
			Alert.alert("Error", "Failed to update cycle");
		}
	};
	const handleDelete = (cycleId: string) => {
		Alert.alert(
			"Delete Cycle",
			"Are you sure you want to delete this academic cycle?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await api.academicCycles.delete(cycleId);
							hapticLight();
							fetchCycles();
						} catch (_error) {
							Alert.alert("Error", "Failed to delete cycle");
						}
					},
				},
			],
		);
	};
	if (loading) {
		return (
			<Box sx={{ flex: 1, backgroundColor: colors.primary }}>
				<GlobalHeader title="Academic Cycles" onBack={onBack} />
				<VStack sx={{ padding: Theme.spacing.lg, gap: Theme.spacing.md }}>
					<SkeletonCard height={100} />
					<SkeletonCard height={100} />
					<SkeletonCard height={100} />
				</VStack>
			</Box>
		);
	}
	return (
		<Box sx={{ flex: 1, backgroundColor: colors.primary }}>
			<GlobalHeader
				title={t("principal.cycles.title") || "Academic Cycles"}
				onBack={onBack}
				rightAction={
					<Pressable onPress={() => setShowAddForm(!showAddForm)}>
						<Plus size={24} color={colors.action} />
					</Pressable>
				}
			/>

			<ScrollView contentContainerStyle={{ padding: Theme.spacing.lg }}>
				<VStack sx={{ gap: Theme.spacing.xl }}>
					<Box>
						<Text
							color={colors.textSecondary}
							sx={{ fontSize: 13, marginBottom: Theme.spacing.xs }}
						>
							{t("principal.cycles.description") ||
								"Define your terms and semesters to synchronize syllabus progress and attendance reports."}
						</Text>
					</Box>

					{showAddForm && (
						<Box
							sx={{
								backgroundColor: colors.surface,
								padding: Theme.spacing.lg,
								borderRadius: Theme.corners.comfortable,
								borderWidth: 1,
								borderColor: colors.border,
							}}
						>
							<VStack sx={{ gap: Theme.spacing.md }}>
								<Text
									sx={{ fontSize: 15, fontWeight: "700", color: colors.text }}
								>
									New Cycle
								</Text>

								<VStack sx={{ gap: Theme.spacing.xs }}>
									<Text sx={{ fontSize: 12, color: colors.textSecondary }}>
										Name (e.g. Term 1 2026)
									</Text>
									<Input variant="underlined">
										<InputField
											value={name}
											onChangeText={setName}
											placeholder="Cycle Name"
											sx={{ color: colors.text }}
										/>
									</Input>
								</VStack>

								<HStack sx={{ gap: Theme.spacing.md }}>
									<VStack sx={{ flex: 1, gap: Theme.spacing.xs }}>
										<Text sx={{ fontSize: 12, color: colors.textSecondary }}>
											Start Date
										</Text>
										<Input variant="underlined">
											<InputField
												value={startDate}
												onChangeText={setStartDate}
												placeholder="YYYY-MM-DD"
												sx={{ color: colors.text }}
											/>
										</Input>
									</VStack>
									<VStack sx={{ flex: 1, gap: Theme.spacing.xs }}>
										<Text sx={{ fontSize: 12, color: colors.textSecondary }}>
											End Date
										</Text>
										<Input variant="underlined">
											<InputField
												value={endDate}
												onChangeText={setEndDate}
												placeholder="YYYY-MM-DD"
												sx={{ color: colors.text }}
											/>
										</Input>
									</VStack>
								</HStack>

								<HStack sx={{ gap: Theme.spacing.md, alignItems: "center" }}>
									<Pressable onPress={() => setIsCurrent(!isCurrent)}>
										<HStack
											sx={{ gap: Theme.spacing.sm, alignItems: "center" }}
										>
											{isCurrent ? (
												<CheckCircle2 size={18} color={colors.success} />
											) : (
												<Circle size={18} color={colors.textSecondary} />
											)}
											<Text sx={{ fontSize: 13, color: colors.text }}>
												Set as Current Cycle
											</Text>
										</HStack>
									</Pressable>
								</HStack>

								<Button
									onPress={handleCreate}
									disabled={saving}
									sx={{
										backgroundColor: colors.action,
										borderRadius: Theme.corners.medium,
										marginTop: Theme.spacing.sm,
									}}
								>
									<ButtonText color={Theme.colors.sacredWhite}>
										{saving ? "Saving..." : "Create Cycle"}
									</ButtonText>
								</Button>
							</VStack>
						</Box>
					)}

					<VStack sx={{ gap: Theme.spacing.md }}>
						{cycles.length === 0 ? (
							<Box sx={{ alignItems: "center", padding: Theme.spacing.xl }}>
								<Calendar
									size={48}
									color={colors.textSecondary}
									strokeWidth={1}
								/>
								<Text
									sx={{
										marginTop: Theme.spacing.md,
										color: colors.textSecondary,
									}}
								>
									No cycles defined yet.
								</Text>
							</Box>
						) : (
							cycles.map((cycle) => (
								<Box
									key={cycle.id}
									sx={{
										backgroundColor: colors.surface,
										padding: Theme.spacing.md,
										borderRadius: Theme.corners.comfortable,
										borderWidth: 1,
										borderColor: cycle.is_current
											? colors.success
											: colors.border,
									}}
								>
									<HStack
										sx={{
											justifyContent: "space-between",
											alignItems: "flex-start",
										}}
									>
										<VStack sx={{ gap: Theme.spacing.xs }}>
											<HStack
												sx={{ gap: Theme.spacing.sm, alignItems: "center" }}
											>
												<Text
													sx={{
														fontSize: 16,
														fontWeight: "700",
														color: colors.text,
													}}
												>
													{cycle.name}
												</Text>
												{cycle.is_current && (
													<Box
														sx={{
															backgroundColor: `${colors.success}22`,
															paddingHorizontal: 8,
															paddingVertical: 2,
															borderRadius: 10,
														}}
													>
														<Text
															sx={{
																fontSize: 10,
																fontWeight: "800",
																color: colors.success,
															}}
														>
															CURRENT
														</Text>
													</Box>
												)}
											</HStack>
											<HStack
												sx={{ gap: Theme.spacing.xs, alignItems: "center" }}
											>
												<Clock size={12} color={colors.textSecondary} />
												<Text
													sx={{ fontSize: 12, color: colors.textSecondary }}
												>
													{cycle.start_date} to {cycle.end_date}
												</Text>
											</HStack>
										</VStack>

										<HStack sx={{ gap: Theme.spacing.md }}>
											{!cycle.is_current && (
												<TouchableOpacity
													onPress={() => handleSetCurrent(cycle.id)}
												>
													<CheckCircle2
														size={20}
														color={colors.textSecondary}
													/>
												</TouchableOpacity>
											)}
											<TouchableOpacity onPress={() => handleDelete(cycle.id)}>
												<Trash2 size={20} color={Theme.colors.emberRed} />
											</TouchableOpacity>
										</HStack>
									</HStack>
								</Box>
							))
						)}
					</VStack>
				</VStack>
			</ScrollView>
		</Box>
	);
}
const _styles = StyleSheet.create({});
