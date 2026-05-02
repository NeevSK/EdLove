import { api } from "@repo/core/api";
import { SkeletonCard } from "@repo/ui/components/SkeletonLoader";
import { ArrowLeft, Calendar, Plus } from "@repo/ui/icons";
import {
	Box,
	Button,
	ButtonIcon,
	ButtonText,
	FormControl,
	FormControlLabel,
	FormControlLabelText,
	Heading,
	HStack,
	Icon,
	Input,
	InputField,
	Pressable,
	ScrollView,
	Text,
	VStack,
} from "@repo/ui/primitives";
import { hapticLight, hapticMedium } from "@repo/ui/utils/haptics";

import type React from "react";
import { useEffect, useState } from "react";

interface CyclesDashboardProps {
	schoolId: string;
	isPastView: boolean;
	onBack: () => void;
}

export const CyclesDashboard: React.FC<CyclesDashboardProps> = ({
	schoolId,
	isPastView,
	onBack,
}) => {
	const [academicCycles, setAcademicCycles] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [newName, setNewName] = useState("");
	const [newStart, setNewStart] = useState("");
	const [newEnd, setNewEnd] = useState("");
	const [saving, setSaving] = useState(false);

	const loadAcademicCycles = async () => {
		if (!schoolId) return;
		setLoading(true);
		try {
			const data = await api.academicCycles.getAll(schoolId);
			setAcademicCycles(data || []);
		} catch (err) {
			console.error("Failed to load academic cycles:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAcademicCycles();
	}, [loadAcademicCycles]);

	const handleCreateCycle = async () => {
		if (!newName.trim() || !newStart || !schoolId) return;
		setSaving(true);
		try {
			const cycle = await api.academicCycles.create({
				name: newName.trim(),
				school_id: schoolId,
				start_date: newStart,
				end_date: newEnd || undefined,
				status: "upcoming",
			} as any);
			setAcademicCycles((prev) => [cycle, ...prev]);
			setNewName("");
			setNewStart("");
			setNewEnd("");
		} catch (err) {
			console.error("Failed to create academic cycle:", err);
		} finally {
			setSaving(false);
		}
	};

	return (
		<ScrollView
			className="flex-1 bg-phase-canvas"
			showsVerticalScrollIndicator={false}
		>
			<VStack className="gap-8 p-5">
				<Pressable
					onPress={() => {
						hapticLight();
						onBack();
					}}
				>
					<HStack className="items-center gap-2 bg-phase-surface self-start px-4 py-2.5 rounded-2xl border border-phase-border shadow-sm active:scale-95 transition-all">
						<Icon as={ArrowLeft} size="sm" className="text-phaseText-primary" />
						<Text className="text-[13px] font-black text-phaseText-primary uppercase tracking-wider">
							Back to Dashboard
						</Text>
					</HStack>
				</Pressable>

				<VStack className="gap-1.5 px-1">
					<Heading className="text-[26px] font-black text-phaseText-primary tracking-tight">
						Academic Cycles
					</Heading>
					<Text className="text-[14px] text-phaseText-secondary font-medium leading-relaxed">
						Designate terms, semesters, and cyclical academic intervals for
						system synchronization.
					</Text>
				</VStack>

				<Box
					className={`bg-phase-surface p-6 rounded-[32px] border border-phase-border gap-5 shadow-sm ${isPastView ? "opacity-50" : ""}`}
				>
					<Heading className="text-[11px] font-black uppercase tracking-[0.2em] text-phaseText-muted">
						Initialize Cycle
					</Heading>

					<FormControl className="w-full">
						<Input className="h-14 rounded-2xl bg-phase-canvas/50 border-phase-border active:border-phase-interactive transition-all">
							<InputField
								className="text-[15px] font-bold text-phaseText-primary"
								value={newName}
								onChangeText={setNewName}
								readOnly={isPastView}
								placeholder="e.g. Autumn Semester 2026"
								placeholderTextColor="#94a3b8"
							/>
						</Input>
					</FormControl>

					<HStack className="gap-4">
						<FormControl className="flex-1">
							<FormControlLabel>
								<FormControlLabelText className="text-[10px] font-black uppercase tracking-widest text-phaseText-muted ml-1">
									Start Date
								</FormControlLabelText>
							</FormControlLabel>
							<Input className="h-14 rounded-2xl bg-phase-canvas/50 border-phase-border">
								<InputField
									className="text-[14px] font-bold text-phaseText-primary"
									value={newStart}
									onChangeText={setNewStart}
									readOnly={isPastView}
									placeholder="YYYY-MM-DD"
									placeholderTextColor="#94a3b8"
								/>
							</Input>
						</FormControl>

						<FormControl className="flex-1">
							<FormControlLabel>
								<FormControlLabelText className="text-[10px] font-black uppercase tracking-widest text-phaseText-muted ml-1">
									End Date
								</FormControlLabelText>
							</FormControlLabel>
							<Input className="h-14 rounded-2xl bg-phase-canvas/50 border-phase-border">
								<InputField
									className="text-[14px] font-bold text-phaseText-primary"
									value={newEnd}
									onChangeText={setNewEnd}
									readOnly={isPastView}
									placeholder="YYYY-MM-DD"
									placeholderTextColor="#94a3b8"
								/>
							</Input>
						</FormControl>
					</HStack>

					<Button
						size="lg"
						onPress={() => {
							hapticMedium();
							handleCreateCycle();
						}}
						isDisabled={!newName.trim() || !newStart || saving || isPastView}
						className="bg-phase-interactive rounded-2xl self-start h-12 px-8 shadow-sm active:scale-95 transition-all"
					>
						{saving ? (
							<ButtonText className="text-white font-black uppercase tracking-widest text-[11px]">
								Syncing...
							</ButtonText>
						) : (
							<HStack className="items-center gap-2">
								<ButtonIcon as={Plus} className="text-white" />
								<ButtonText className="text-white font-black uppercase tracking-widest text-[11px]">
									Create Cycle
								</ButtonText>
							</HStack>
						)}
					</Button>
				</Box>

				{loading ? (
					<VStack className="gap-4">
						<SkeletonCard height={80} className="rounded-3xl" />
						<SkeletonCard height={80} className="rounded-3xl" />
					</VStack>
				) : academicCycles.length === 0 ? (
					<Box className="p-12 items-center justify-center bg-phase-surface/50 rounded-[32px] border border-dashed border-phase-border">
						<Text className="text-phaseText-muted text-[13px] font-black uppercase tracking-widest">
							No Active Records
						</Text>
					</Box>
				) : (
					<VStack className="gap-4">
						{academicCycles.map((c) => (
							<Box
								key={c.id}
								className={`bg-phase-surface p-6 rounded-[24px] border-l-[6px] shadow-sm border-y border-r border-phase-border ${
									c.status === "active"
										? "border-l-phase-success"
										: c.status === "upcoming"
											? "border-l-phase-interactive"
											: "border-l-phaseText-muted"
								}`}
							>
								<HStack className="justify-between items-center">
									<VStack className="gap-1.5 flex-1">
										<Text className="font-black text-[17px] text-phaseText-primary tracking-tight">
											{c.name}
										</Text>
										<HStack className="items-center gap-2">
											<Icon
												as={Calendar}
												size={14}
												className="text-phaseText-muted"
											/>
											<Text className="text-[12px] font-bold text-phaseText-secondary">
												{c.start_date} — {c.end_date ?? "Present"}
											</Text>
										</HStack>
									</VStack>
									<Box
										className={`px-4 py-1.5 rounded-full border border-phase-border/20 ${
											c.status === "active"
												? "bg-phase-success"
												: "bg-phase-interactive"
										}`}
									>
										<Text className="text-[10px] font-black uppercase tracking-widest text-white">
											{c.status}
										</Text>
									</Box>
								</HStack>
							</Box>
						))}
					</VStack>
				)}
			</VStack>
		</ScrollView>
	);
};

export type { CyclesDashboardProps };
