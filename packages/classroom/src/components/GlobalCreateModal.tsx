import { communityAPI } from "@repo/community";
import { api, growthSignalsAPI, identityAPI } from "@repo/core/api";
import { handleAPIError } from "@repo/core/logic";
import type { School } from "@repo/core/types";

import SanctuaryModal from "@repo/ui/components/SanctuaryModal";
import {
	ChevronDown,
	LayoutGrid,
	School as SchoolIcon,
	Users,
} from "@repo/ui/icons";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetItem,
	ActionsheetItemText,
	Box,
	Button,
	ButtonText,
	FormControl,
	FormControlLabel,
	FormControlLabelText,
	HStack,
	Icon,
	Input,
	InputField,
	Spinner,
	Text,
	Textarea,
	TextareaInput,
	VStack,
} from "@repo/ui/primitives";
import { hapticLight, hapticSuccess } from "@repo/ui/utils/haptics";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "@repo/ui/icons";

interface GlobalCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (type: "school" | "classroom" | "group", data: any) => void;
	availableSchools: School[];
}

type CreateType = "school" | "classroom" | "group";

/**
 * GlobalCreateModal
 *
 * A unified modal for Founders to create any ecosystem entity.
 */
export default function GlobalCreateModal({
	isOpen,
	onClose,
	onSuccess,
	availableSchools,
}: GlobalCreateModalProps) {
	const { t } = useTranslation();

	const [type, setType] = useState<CreateType>("school");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
	const [schoolType, setSchoolType] = useState<
		"primary" | "secondary" | "mixed"
	>("mixed");

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showSchoolPicker, setShowSchoolPicker] = useState(false);

	const resetForm = () => {
		setName("");
		setDescription("");
		setSelectedSchoolId("");
		setSchoolType("mixed");
		setError(null);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const handleSubmit = async () => {
		if (!name.trim()) {
			setError("Name is required");
			return;
		}

		if (type !== "school" && !selectedSchoolId) {
			setError("Please select a target school");
			return;
		}

		setIsSubmitting(true);
		setError(null);
		hapticLight();

		try {
			const userId = await identityAPI.getMyInternalId();
			if (!userId) throw new Error("Not authenticated");

			let result;
			if (type === "school") {
				// 1. Create the school
				result = await api["founder"].createSchool({
					name: name.trim(),
					type: schoolType,
					created_by: userId,
				});

				// 2. Create the Primary Sanctuary Group for this school
				if (result) {
					await communityAPI.createGroupWithOwner(
						{
							name: `${name.trim()} Sanctuary`,
							description: `The primary sanctuary for ${name.trim()} members to share and resonate.`,
							group_type: "school",
							join_policy: "open",
							school_id: result.id,
						},
						userId,
					);
				}
			} else if (type === "classroom") {
				// 1. Create the classroom
				result = await api["founder"].createClassroom({
					school_id: selectedSchoolId,
					name: name.trim(),
					grade_number: 1, // Default to 1
					created_by: userId,
				});

				// 2. Create the Class Sanctuary Group
				if (result) {
					await communityAPI.createGroupWithOwner(
						{
							name: `${name.trim()} Sanctuary`,
							description: `A sacred space for the ${name.trim()} classroom discussions and heart-sharing.`,
							group_type: "class",
							join_policy: "restricted",
							school_id: selectedSchoolId,
							classroom_id: result.id,
						},
						userId,
					);
				}
			} else if (type === "group") {
				// Use standard community logic to ensure owner assignment
				result = await communityAPI.createGroupWithOwner(
					{
						name: name.trim(),
						description: description.trim(),
						school_id: selectedSchoolId,
						group_type: "general",
						join_policy: "open",
					},
					userId,
				);
			}

			hapticSuccess();
			// Growth signals — fire-and-forget
			if (type === "classroom" && result) {
				growthSignalsAPI.emitSilent({
					user_id: userId,
					event_type: "classroom_created",
					event_metadata: {
						classroom_id: result.id,
						school_id: selectedSchoolId,
					},
				});
			}
			onSuccess(type, result);
			handleClose();
		} catch (err: unknown) {
			const apiError = handleAPIError(err, true);
			setError(apiError.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const selectedSchool = availableSchools.find(
		(s) => s.id === selectedSchoolId,
	);

	return (
		<>
			<SanctuaryModal
				isOpen={isOpen}
				onClose={handleClose}
				title="Ecosystem Creation"
				footer={
					<HStack className="gap-4 w-full">
						<Button
							variant="outline"
							onPress={handleClose}
							className="flex-1 h-14 rounded-[24px] border-sanctuary-border bg-sanctuary-surface-secondary active:opacity-70"
							isDisabled={isSubmitting}
						>
							<ButtonText className="text-sanctuary-text-secondary font-bold">
								Cancel
							</ButtonText>
						</Button>
						<Button
							onPress={handleSubmit}
							className="flex-1 h-14 rounded-[24px] bg-sanctuarySaffron shadow-lg shadow-sanctuarySaffron/20 active:opacity-90"
							isDisabled={isSubmitting || !name.trim()}
						>
							{isSubmitting ? (
								<Spinner color="#fff" size="small" />
							) : (
								<ButtonText className="text-sanctuary-ink font-bold">
									Initialize
								</ButtonText>
							)}
						</Button>
					</HStack>
				}
			>
				<VStack className="gap-8">
					{/* Entity Type Selector */}
					<Box className="flex-row gap-2 bg-sanctuary-border/10 p-1.5 rounded-[24px]">
						<TypeButton
							active={type === "school"}
							onPress={() => setType("school")}
							label="School"
							icon={SchoolIcon}
						/>
						<TypeButton
							active={type === "classroom"}
							onPress={() => setType("classroom")}
							label="Class"
							icon={LayoutGrid}
						/>
						<TypeButton
							active={type === "group"}
							onPress={() => setType("group")}
							label="Group"
							icon={Users}
						/>
					</Box>

					{error && (
						<Box className="p-4 bg-sanctuary-error/10 rounded-[20px] border border-sanctuary-error/20">
							<Text className="text-sanctuary-error text-sm font-medium">
								{error}
							</Text>
						</Box>
					)}

					<VStack className="gap-6">
						{/* Target School Picker for non-school entities */}
						{type !== "school" && (
							<FormControl isRequired className="gap-2">
								<FormControlLabel>
									<FormControlLabelText className="text-sanctuary-text-secondary font-bold ml-1">
										Target Institution
									</FormControlLabelText>
								</FormControlLabel>
								<Button
									variant="outline"
									onPress={() => setShowSchoolPicker(true)}
									className="justify-between h-16 rounded-[24px] border-sanctuary-border bg-sanctuary-surface-secondary shadow-sm active:bg-sanctuary-border/10"
								>
									<ButtonText
										className={`font-bold ${selectedSchoolId ? "text-sanctuary-text" : "text-sanctuary-text-tertiary"}`}
									>
										{selectedSchool ? selectedSchool.name : "Select School..."}
									</ButtonText>
									<Icon
										as={ChevronDown}
										size="sm"
										className="text-sanctuary-text-secondary"
									/>
								</Button>
							</FormControl>
						)}

						<FormControl isRequired className="gap-2">
							<FormControlLabel>
								<FormControlLabelText className="text-sanctuary-text-secondary font-bold ml-1">
									{type === "school"
										? "Institution Name"
										: type === "classroom"
											? "Class Name/ID"
											: "Group Name"}
								</FormControlLabelText>
							</FormControlLabel>
							<Input className="h-16 rounded-[24px] border-sanctuary-border bg-sanctuary-surface shadow-sm">
								<InputField
									value={name}
									onChangeText={setName}
									className="text-sanctuary-text font-bold"
									placeholder="e.g., Royal Academy"
									placeholderTextColor="rgba(0,0,0,0.3)"
								/>
							</Input>
						</FormControl>

						{type === "school" && (
							<FormControl className="gap-2">
								<FormControlLabel>
									<FormControlLabelText className="text-sanctuary-text-secondary font-bold ml-1">
										Category
									</FormControlLabelText>
								</FormControlLabel>
								<HStack className="gap-3">
									{(["primary", "secondary", "mixed"] as const).map((t) => (
										<Button
											key={t}
											onPress={() => setSchoolType(t)}
											className={`flex-1 h-14 rounded-[20px] shadow-sm ${schoolType === t ? "bg-sanctuarySaffron shadow-sanctuarySaffron/20" : "bg-sanctuary-surface border border-sanctuary-border active:bg-sanctuary-border/10"}`}
											size="sm"
										>
											<ButtonText
												className={`font-bold ${schoolType === t ? "text-sanctuary-ink" : "text-sanctuary-text-secondary"}`}
											>
												{t.charAt(0).toUpperCase() + t.slice(1)}
											</ButtonText>
										</Button>
									))}
								</HStack>
							</FormControl>
						)}

						{type === "group" && (
							<FormControl className="gap-2">
								<FormControlLabel>
									<FormControlLabelText className="text-sanctuary-text-secondary font-bold ml-1">
										Purpose / Description
									</FormControlLabelText>
								</FormControlLabel>
								<Textarea className="min-h-[100px] rounded-[24px] border-sanctuary-border bg-sanctuary-surface shadow-sm">
									<TextareaInput
										value={description}
										onChangeText={setDescription}
										className="text-sanctuary-text font-medium p-4"
										placeholder="Briefly describe this community space..."
										placeholderTextColor="rgba(0,0,0,0.3)"
									/>
								</Textarea>
							</FormControl>
						)}
					</VStack>
				</VStack>
			</SanctuaryModal>

			{/* School Picker Sheet */}
			<Actionsheet
				isOpen={showSchoolPicker}
				onClose={() => setShowSchoolPicker(false)}
			>
				<ActionsheetBackdrop />
				<ActionsheetContent className="bg-sanctuary-surface-secondary pb-10">
					<ActionsheetDragIndicatorWrapper>
						<ActionsheetDragIndicator />
					</ActionsheetDragIndicatorWrapper>
					<VStack className="p-4 gap-2 w-full">
						{availableSchools.map((school) => (
							<ActionsheetItem
								key={school.id}
								onPress={() => {
									setSelectedSchoolId(school.id);
									setShowSchoolPicker(false);
								}}
								className="rounded-[20px] active:bg-sanctuary-border/10 h-16"
							>
								<ActionsheetItemText className="text-sanctuary-text font-bold">
									{school.name}
								</ActionsheetItemText>
							</ActionsheetItem>
						))}
					</VStack>
				</ActionsheetContent>
			</Actionsheet>
		</>
	);
}

function TypeButton({
	active,
	onPress,
	label,
	icon,
}: {
	active: boolean;
	onPress: () => void;
	label: string;
	icon: LucideIcon;
}) {
	return (
		<Button
			onPress={onPress}
			className={`flex-1 h-12 rounded-[18px] gap-2 ${active ? "bg-sanctuarySaffron shadow-md shadow-sanctuarySaffron/30" : "bg-transparent active:bg-sanctuary-border/10"}`}
			size="sm"
		>
			<Icon
				as={icon}
				size="xs"
				className={
					active ? "text-sanctuary-ink" : "text-sanctuary-text-secondary"
				}
			/>
			<ButtonText
				className={`font-bold ${active ? "text-sanctuary-ink" : "text-sanctuary-text-secondary"}`}
			>
				{label}
			</ButtonText>
		</Button>
	);
}
