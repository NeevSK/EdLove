import { Briefcase, ChevronRight, User } from "@repo/ui/icons";
import {
	Box,
	Heading,
	HStack,
	Icon,
	Pressable,
	ScrollView,
	Text,
	VStack,
} from "@repo/ui/primitives";
import { hapticLight } from "@repo/ui/utils/haptics";

interface StaffMember {
	id: string;
	name: string;
	role: string;
	email?: string;
	phone?: string;
}

interface StaffDirectoryProps {
	staff: StaffMember[];
	onSelect?: (staff: StaffMember) => void;
}

export default function StaffDirectory({
	staff,
	onSelect,
}: StaffDirectoryProps) {
	if (!staff?.length)
		return (
			<Box className="p-12 items-center justify-center bg-phase-canvas rounded-[32px] border border-dashed border-phase-border">
				<Text className="text-[14px] font-bold text-phaseText-muted italic opacity-60">
					Institutional directory is empty.
				</Text>
			</Box>
		);

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ paddingBottom: 40 }}
		>
			<VStack className="gap-4">
				{staff.map((member) => (
					<Pressable
						key={member.id}
						onPress={() => {
							hapticLight();
							onSelect?.(member);
						}}
						className="active:scale-[0.98] transition-all"
					>
						<Box className="p-5 bg-phase-surface rounded-[24px] border border-phase-border shadow-sm">
							<HStack className="items-center gap-5">
								<Box className="w-14 h-14 rounded-[18px] bg-phase-canvas border border-phase-border items-center justify-center">
									<Icon
										as={User}
										size="sm"
										className="text-phaseText-primary"
									/>
								</Box>
								<VStack className="flex-1 gap-1">
									<Heading className="text-[17px] font-black text-phaseText-primary tracking-tight">
										{member.name}
									</Heading>
									<HStack className="items-center gap-2">
										<Icon
											as={Briefcase}
											size="xs"
											className="text-phase-interactive"
										/>
										<Text className="text-[11px] font-black text-phase-interactive uppercase tracking-widest">
											{member.role}
										</Text>
									</HStack>
								</VStack>
								<Icon
									as={ChevronRight}
									size="xs"
									className="text-phaseText-muted/20"
								/>
							</HStack>
						</Box>
					</Pressable>
				))}
			</VStack>
		</ScrollView>
	);
}
