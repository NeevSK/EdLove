import React from 'react';
import { 
    useThemedColors, 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Theme 
} from '@repo/ui';

interface SnapshotItem {
    time: string;
    activity: string;
    location: string;
}

interface TeacherSnapshotProps {
    items: SnapshotItem[];
}

export const TeacherSnapshot: React.FC<TeacherSnapshotProps> = ({ items }) => {
    const colors = useThemedColors();

    if (items.length === 0) {
        return (
            <Box
                sx={{
                    borderRadius: 22,
                    borderWidth: 1,
                    padding: 20,
                    backgroundColor: 'rgba(250, 247, 237, 0.82)',
                    borderColor: colors.border,
                }}
            >
                <Text sx={{ 
                    fontSize: Theme.typography.fontSize.sm, 
                    fontWeight: '600', 
                    color: colors.text 
                }}>
                    No temporal moments are surfaced yet.
                </Text>
                <Text sx={{ 
                    marginTop: 8, 
                    fontSize: Theme.typography.fontSize.xs, 
                    lineHeight: 20, 
                    color: colors.textSecondary 
                }}>
                    Snapshot context will appear here as the day gathers more classroom signal.
                </Text>
            </Box>
        );
    }

    return (
        <VStack sx={{ gap: 12 }}>
            {items.map((item, index) => (
                <HStack key={`${item.time}-${index}`} sx={{ gap: 12 }}>
                    <Box
                        sx={{
                            flexShrink: 0,
                            borderRadius: Theme.corners.full,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            backgroundColor: 'rgba(184, 169, 224, 0.14)',
                            alignSelf: 'flex-start',
                        }}
                    >
                        <Text sx={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: Theme.colors.gurudeviViolet,
                            letterSpacing: 1.8,
                            textTransform: 'uppercase'
                        }}>
                            {item.time}
                        </Text>
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            borderRadius: 18,
                            borderWidth: 1,
                            padding: 16,
                            backgroundColor: 'rgba(250, 247, 237, 0.82)',
                            borderColor: colors.border,
                        }}
                    >
                        <Text sx={{ 
                            fontSize: Theme.typography.fontSize.sm, 
                            fontWeight: '600', 
                            color: colors.text 
                        }}>
                            {item.activity}
                        </Text>
                        <Text sx={{ 
                            marginTop: 4, 
                            fontSize: 11, 
                            fontWeight: '500',
                            color: colors.textSecondary,
                            letterSpacing: 1.4,
                            textTransform: 'uppercase'
                        }}>
                            {item.location}
                        </Text>
                    </Box>
                </HStack>
            ))}
        </VStack>
    );
};
