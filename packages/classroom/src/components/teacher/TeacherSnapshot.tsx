import React from 'react';
import { 
    Box, 
    VStack, 
    HStack, 
    Text,
    Icon
} from '@repo/ui';
import { MapPin } from 'lucide-react-native';

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
            <Box className="rounded-[32px] border border-sanctuary-border/10 bg-sanctuary-surface-secondary/50 p-8 shadow-sm">
                <VStack className="gap-2">
                    <Text className="text-sm font-bold text-sanctuary-text">
                        No temporal moments are surfaced yet.
                    </Text>
                    <Text className="text-xs leading-5 text-sanctuary-text-muted">
                        Snapshot context will appear here as the day gathers more classroom signal.
                    </Text>
                </VStack>
            </Box>
        );
    }

    return (
        <VStack className="gap-5">
            {items.map((item, index) => (
                <HStack key={`${item.time}-${index}`} className="gap-4 items-start">
                    <Box className="rounded-full bg-sanctuarySaffron/10 border border-sanctuarySaffron/20 px-3 py-2 shrink-0 min-w-[70px] items-center">
                        <Text className="text-[10px] font-bold uppercase tracking-[0.1em] text-sanctuarySaffron">
                            {item.time}
                        </Text>
                    </Box>
                    <Box className="flex-1 rounded-[28px] border border-sanctuary-border/10 bg-sanctuary-surface-secondary/80 p-5 shadow-sm">
                        <VStack className="gap-2">
                            <Text className="text-sm font-bold text-sanctuary-text">
                                {item.activity}
                            </Text>
                            <HStack className="items-center gap-2">
                                <Icon as={MapPin} size="xs" className="text-sanctuary-text-muted" />
                                <Text className="text-[10px] font-bold uppercase tracking-[0.15em] text-sanctuary-text-muted">
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

