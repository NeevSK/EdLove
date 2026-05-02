import { MapPin } from "@repo/ui/icons";
import { Box, HStack, Icon, Text, VStack } from "@repo/ui/primitives";
import type React from "react";

interface SnapshotItem {
	time: string;
	activity: string;
	location: string;
}

interface TeacherSnapshotProps {
	items: SnapshotItem[];
}

export const TeacherSnapshot: React.FC<TeacherSnapshotProps> = ({ items }) => {
	if (items.length === 0) {
		return (
			<Box className="rounded-[32px] border border-sanctuary-border bg-sanctuary-surface-secondary/30 p-8">
				<VStack className="gap-2">
					<Text className="text-sm font-black text-sanctuary-text tracking-tight">
						No temporal moments are surfaced yet.
					</Text>
					<Text className="text-xs leading-relaxed text-sanctuary-text-tertiary">
						Snapshot context will appear here as the day gathers more classroom
						signal.
					</Text>
				</VStack>
			</Box>
		);
	}

	return (
		<VStack className="gap-6">
			{items.map((item, index) => (
				<HStack key={`${item.time}-${index}`} className="gap-4 items-start">
					<Box className="rounded-2xl bg-sanctuarySaffron/10 border border-sanctuarySaffron/20 px-3 py-2.5 shrink-0 min-w-[70px] items-center">
						<Text className="text-[10px] font-black uppercase tracking-[0.2em] text-sanctuarySaffron">
							{item.time}
						</Text>
					</Box>
					<Box className="flex-1 rounded-[32px] border border-sanctuary-border bg-sanctuary-surface p-6">
						<VStack className="gap-3">
							<Text className="text-sm font-black text-sanctuary-text tracking-tight">
								{item.activity}
							</Text>
							<HStack className="items-center gap-2">
								<Icon
									as={MapPin}
									size="xs"
									className="text-sanctuary-text-tertiary"
								/>
								<Text className="text-[10px] font-black uppercase tracking-[0.25em] text-sanctuary-text-tertiary">
									{item.location}
								</Text>
							</HStack>
						</VStack>
					</Box>
				</HStack>
			))}
		</VStack>
	);
};
