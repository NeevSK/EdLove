import { useNavigation } from "@react-navigation/native";
import PositiveInvitation from "@repo/ui/components/PositiveInvitation";
import { SkeletonCard } from "@repo/ui/components/SkeletonLoader";
import { BookOpen } from "@repo/ui/icons";
import {
	Box,
	HStack,
	Icon,
	Pressable,
	Text,
	VStack,
} from "@repo/ui/primitives";

interface Classroom {
	id: string;
	name: string;
	subject?: string;
	color_theme?: string;
}

interface StudentClassroomListProps {
	classrooms: Classroom[];
	loading: boolean;
	isDemo: boolean;
}

export const StudentClassroomList = ({
	classrooms,
	loading,
	isDemo,
}: StudentClassroomListProps) => {
	const navigation = useNavigation<any>();

	if (loading) {
		return (
			<VStack className="gap-4">
				{[1, 2, 3].map((i) => (
					<SkeletonCard key={i} className="h-[120px] rounded-[32px]" />
				))}
			</VStack>
		);
	}

	if (classrooms.length === 0) {
		return (
			<Box className="py-10 items-center">
				<PositiveInvitation
					type="empty"
					title={isDemo ? "Join Your First Sanctuary" : "No Classrooms found"}
					description={
						isDemo
							? "Welcome to the student sanctuary. Ready to officially join your classes and begin your quest? Connect with your teachers to get started."
							: "You haven't joined any classrooms yet. Reach out to your teacher for an invite code or search for a sanctuary."
					}
					actionLabel="Join a Classroom"
					onAction={() => navigation.navigate("Main", { screen: "Community" })}
				/>
			</Box>
		);
	}

	return (
		<HStack className="flex-wrap gap-6">
			{classrooms.map((cls) => (
				<Pressable
					key={cls.id}
					onPress={() =>
						navigation.navigate("StudentClassroomDashboard", {
							classroomId: cls.id,
							classroomName: cls.name,
						})
					}
					className="w-full max-w-[320px] bg-sanctuary-surface rounded-[32px] overflow-hidden border border-sanctuary-border/60"
				>
					<Box
						className="h-24 p-6 flex-row justify-between items-start opacity-90"
						style={{ backgroundColor: cls.color_theme || "#34C7DB" }}
					>
						<Box className="w-10 h-10 rounded-xl bg-white/95 items-center justify-center border border-white/20">
							<Icon as={BookOpen} size="sm" className="text-sanctuary-info" />
						</Box>
						<Box className="px-2.5 py-1 bg-white/95 rounded-lg border border-white/20 shadow-sm">
							<Text className="text-[10px] font-black text-sanctuary-text uppercase tracking-widest">
								Active
							</Text>
						</Box>
					</Box>

					<VStack className="p-6 gap-5">
						<VStack className="gap-1.5">
							<Text className="text-xl font-black text-sanctuary-text tracking-tight leading-tight">
								{cls.name}
							</Text>
							{cls.subject && (
								<Text className="text-xs font-bold text-sanctuary-text-tertiary">
									{cls.subject}
								</Text>
							)}
						</VStack>

						<HStack className="gap-2.5">
							<Box className="px-3 py-2 bg-sanctuary-surface-secondary border border-sanctuary-border/40 rounded-xl">
								<Text className="text-[11px] font-black text-sanctuary-text-tertiary uppercase tracking-wider">
									📖 Lessons
								</Text>
							</Box>
							<Box className="px-3 py-2 bg-sanctuary-surface-secondary border border-sanctuary-border/40 rounded-xl">
								<Text className="text-[11px] font-black text-sanctuary-text-tertiary uppercase tracking-wider">
									📋 Tasks
								</Text>
							</Box>
						</HStack>
					</VStack>
				</Pressable>
			))}
		</HStack>
	);
};
