import React from 'react';
import {
    useThemedColors,
    Box,
    HStack,
    VStack,
    Text,
    Pressable,
    Theme,
    Heading
} from '@repo/ui';

interface Assignment {
    id: string;
    title: string;
    dueDate: string;
    submittedCount: number;
    totalCount: number;
}

interface TeacherAssignmentsSidebarProps {
    assignments: Assignment[];
    onAssignmentPress: (assignment: Assignment) => void;
}

export const TeacherAssignmentsSidebar: React.FC<TeacherAssignmentsSidebarProps> = ({
    assignments,
    onAssignmentPress
}) => {
    const colors = useThemedColors();

    if (assignments.length === 0) {
        return (
            <Box
                sx={{
                    borderRadius: 22,
                    borderWidth: 1,
                    padding: 20,
                    backgroundColor: 'rgba(255, 249, 242, 0.9)',
                    borderColor: colors.border,
                }}
            >
                <Text sx={{
                    fontSize: Theme.typography.fontSize.sm,
                    fontWeight: '600',
                    color: colors.text
                }}>
                    No active assignments need attention.
                </Text>
                <Text sx={{
                    marginTop: 8,
                    fontSize: Theme.typography.fontSize.xs,
                    lineHeight: 20,
                    color: colors.textSecondary
                }}>
                    This sidebar stays ready for submissions and due-date pressure when the rhythm changes.
                </Text>
            </Box>
        );
    }

    return (
        <VStack sx={{ gap: 12 }}>
            {assignments.map((assignment) => {
                const totalCount = assignment.totalCount || 0;
                const ratio = totalCount > 0 ? (assignment.submittedCount / totalCount) * 100 : 0;

                return (
                    <Pressable
                        key={assignment.id}
                        onPress={() => onAssignmentPress(assignment)}
                        sx={{
                            width: '100%',
                            borderRadius: 20,
                            borderWidth: 1,
                            padding: 16,
                            borderColor: colors.border,
                            backgroundColor: 'rgba(250, 247, 237, 0.82)',
                        }}
                    >
                        <Heading sx={{
                            fontSize: Theme.typography.fontSize.sm,
                            fontWeight: '700',
                            color: colors.text,
                            lineHeight: 20
                        }}>
                            {assignment.title}
                        </Heading>

                        <HStack sx={{
                            marginTop: 12,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8
                        }}>
                            <Text sx={{
                                fontSize: 11,
                                fontWeight: '500',
                                color: colors.textSecondary,
                                letterSpacing: 1.4,
                                textTransform: 'uppercase'
                            }}>
                                Due {new Date(assignment.dueDate).toLocaleDateString()}
                            </Text>
                            <Text sx={{
                                fontSize: 11,
                                fontWeight: '500',
                                color: colors.textSecondary,
                                letterSpacing: 1.4,
                                textTransform: 'uppercase'
                            }}>
                                {assignment.submittedCount}/{assignment.totalCount} turned in
                            </Text>
                        </HStack>

                        {/* Progress Bar */}
                        <Box sx={{
                            marginTop: 12,
                            height: 6,
                            overflow: 'hidden',
                            borderRadius: 3,
                            backgroundColor: 'rgba(84, 74, 61, 0.08)'
                        }}>
                            <Box sx={{
                                height: '100%',
                                borderRadius: 3,
                                width: `${ratio}%`,
                                backgroundColor: Theme.colors.templeGold,
                            }} />
                        </Box>
                    </Pressable>
                );
            })}
        </VStack>
    );
};
