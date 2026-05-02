import { FeatureGuard } from "@repo/core/logic";
import { Box, Heading, Icon, Text, Theme, VStack } from "@repo/ui/primitives";
import { Hammer, Users2 } from "lucide-react-native";

export default function WorkforceShell() {
	return (
		<FeatureGuard feature="isDevelopingWorkforce">
			<VStack
				className="flex-1 justify-center items-center p-10 bg-phase-canvas"
				space="xl"
			>
				<Box className="w-[100px] h-[100px] rounded-full justify-center items-center bg-sanctuarySaffron/10">
					<Icon as={Users2} size={48} color={Theme.colors.sanctuarySaffron} />
				</Box>

				<VStack space="sm" className="items-center">
					<Heading size="xl" className="text-center">
						Workforce Management
					</Heading>
					<Text className="text-phaseText-secondary text-center max-w-[320px]">
						Streamline institutional human capital with digital dignity.
					</Text>
				</VStack>

				<Box className="flex-row items-center gap-2 p-3 bg-black/5 rounded-2xl">
					<Icon as={Hammer} size={16} color={Theme.colors.sanctuarySaffron} />
					<Text size="xs" className="font-bold text-sanctuarySaffron">
						UNDER ACTIVE CONSTRUCTION
					</Text>
				</Box>
			</VStack>
		</FeatureGuard>
	);
}
