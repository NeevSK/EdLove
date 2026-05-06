import { Compass, DoorOpen, School, Users } from "@repo/ui/icons";
import {
	Box,
	Button,
	ButtonText,
	Heading,
	HStack,
	Icon,
	Text,
	VStack,
} from "@repo/ui/primitives";
import { hapticLight } from "@repo/ui/utils/haptics";

interface PrincipalOnboardingViewProps {
	isGuest: boolean;
	onTryDemo: () => void;
	onCreateSchool: () => void;
	onJoinSchool: () => void;
}

export default function PrincipalOnboardingView({
	isGuest,
	onTryDemo,
	onCreateSchool,
	onJoinSchool,
}: PrincipalOnboardingViewProps) {
	const highlights = [
		{
			icon: Compass,
			title: "Experience Leadership",
			copy: "Step into a principal workspace that feels alive with institutional signal and leadership flow.",
			color: "text-phase-warning",
			bg: "bg-phase-warning/10",
		},
		{
			icon: School,
			title: "Found the Institution",
			copy: "Establish the profile and let the system prepare the first governance runway.",
			color: "text-phase-success",
			bg: "bg-phase-success/10",
		},
		{
			icon: Users,
			title: "Coordinated Community",
			copy: "Invite staff so the school starts as a coordinated, data-rich community.",
			color: "text-phase-interactive",
			bg: "bg-phase-interactive/10",
		},
	];

	return (
		<VStack className="gap-6">
			<Box className="rounded-[32px] p-8 bg-phase-surface border border-phase-border shadow-sm">
				<VStack className="gap-2 mb-10">
					<Text className="text-[11px] font-black tracking-[2px] uppercase text-phase-interactive">
						Principal Sanctuary
					</Text>
					<Heading className="text-[32px] leading-[40px] font-black text-phaseText-primary tracking-tight">
						Leadership begins with institutional clarity.
					</Heading>
					<Text className="text-[15px] font-bold text-phaseText-secondary leading-[24px] mt-4 opacity-80">
						Start with a faithful demo experience, or found your institution if
						it does not exist yet. Move from chaos to governance rhythm.
					</Text>
				</VStack>

				<VStack className="gap-5 mb-10">
					{highlights.map((item) => (
						<HStack
							key={item.title}
							className="gap-5 items-start p-5 rounded-[24px] bg-phase-canvas border border-phase-border"
						>
							<Box
								className={`w-12 h-12 rounded-2xl items-center justify-center ${item.bg}`}
							>
								<Icon as={item.icon} size="sm" className={item.color} />
							</Box>
							<VStack className="flex-1 gap-1">
								<Text className="text-[15px] font-black text-phaseText-primary">
									{item.title}
								</Text>
								<Text className="text-[13px] font-bold text-phaseText-secondary leading-[20px] opacity-70">
									{item.copy}
								</Text>
							</VStack>
						</HStack>
					))}
				</VStack>

				<VStack className="gap-4">
					<Button
						onPress={() => {
							hapticLight();
							onTryDemo();
						}}
						className="bg-phase-interactive h-16 rounded-[20px] shadow-md border-0 active:scale-95 transition-all"
					>
						<ButtonText className="text-white font-black uppercase tracking-[2px] text-[13px]">
							Enter Demo Workspace
						</ButtonText>
					</Button>

					{!isGuest && (
						<Button
							variant="outline"
							onPress={() => {
								hapticLight();
								onCreateSchool();
							}}
							className="border-phase-border h-16 rounded-[20px] bg-phase-canvas active:scale-95 transition-all"
						>
							<ButtonText className="text-phaseText-primary font-black uppercase tracking-[2px] text-[13px]">
								Found New School
							</ButtonText>
						</Button>
					)}

					<Button
						variant="ghost"
						onPress={() => {
							hapticLight();
							onJoinSchool();
						}}
						className="mt-4 active:opacity-60"
					>
						<HStack className="items-center gap-2">
							<Icon
								as={DoorOpen}
								size="sm"
								className="text-phase-interactive"
							/>
							<ButtonText className="text-phase-interactive font-black uppercase tracking-wider text-[12px]">
								Join Institutional Group
							</ButtonText>
						</HStack>
					</Button>
				</VStack>
			</Box>
		</VStack>
	);
}
