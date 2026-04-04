import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react-native';
import {
    useThemedColors,
    Box,
    HStack,
    VStack,
    Text,
    Button,
    ButtonText,
    Theme
} from '@repo/ui';

interface Assignment {
    id: string;
    title: string;
    submitted: boolean;
    due_date: string | Date;
    classroom?: string;
    classrooms?: { name: string };
}

interface StudentUpcomingAssignmentsProps {
    assignments: Assignment[];
    onOpenSubmission: (assignment: Assignment) => void;
    isPastView: boolean;
}

export const StudentUpcomingAssignments = ({
    assignments,
    onOpenSubmission,
    isPastView
}: StudentUpcomingAssignmentsProps) => {
    const colors = useThemedColors();
    const pendingAssignments = assignments.filter((a) => !a.submitted);

    if (assignments.length === 0) return null;

    return (
        <VStack sx={{ marginTop: 40, gap: Theme.spacing.md }}>
            <HStack sx={{ alignItems: 'center', gap: Theme.spacing.sm }}>
                <CheckCircle2 size={18} color={Theme.colors.sageGreen} />
                <Text sx={{
                    fontSize: Theme.typography.fontSize.md,
                    fontWeight: '800',
                    color: colors.text
                }}>
                    Upcoming Assignments
                </Text>
                {pendingAssignments.length > 0 && (
                    <Box sx={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: 6,
                    }}>
                        <Text sx={{
                            fontSize: 11,
                            color: Theme.colors.emberRed,
                            fontWeight: '700'
                        }}>
                            {pendingAssignments.length} pending
                        </Text>
                    </Box>
                )}
            </HStack>

            <VStack sx={{ gap: Theme.spacing.sm }}>
                {assignments.map((a) => (
                    <HStack
                        key={a.id}
                        sx={{
                            alignItems: 'center',
                            gap: Theme.spacing.md,
                            padding: Theme.spacing.md,
                            borderRadius: Theme.corners.comfortable,
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: a.submitted ? Theme.colors.sageGreen : colors.border
                        }}
                    >
                        <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: a.submitted ? Theme.colors.sageGreen : Theme.colors.emberRed
                        }} />

                        <VStack sx={{ flex: 1 }}>
                            <Text sx={{
                                fontSize: Theme.typography.fontSize.sm,
                                fontWeight: '700',
                                color: colors.text
                            }}>
                                {a.title}
                            </Text>
                            <HStack sx={{ alignItems: 'center', gap: 6, marginTop: 2 }}>
                                <Text sx={{ fontSize: 11, color: colors.textSecondary }}>
                                    {a.classroom ?? a.classrooms?.name ?? ''}
                                </Text>
                                <Text sx={{ fontSize: 11, color: colors.textSecondary }}>•</Text>
                                <Clock size={10} color={colors.textSecondary} />
                                <Text sx={{ fontSize: 11, color: colors.textSecondary }}>
                                    Due {typeof a.due_date === 'string' ? a.due_date : new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </Text>
                            </HStack>
                        </VStack>

                        {!a.submitted && !isPastView && (
                            <Button
                                size="xs"
                                variant="outline"
                                onPress={() => onOpenSubmission(a)}
                                sx={{
                                    borderColor: Theme.colors.templeGold,
                                    borderRadius: Theme.corners.tight
                                }}
                            >
                                <ButtonText color={Theme.colors.templeGold}>
                                    Submit
                                </ButtonText>
                            </Button>
                        )}

                        {a.submitted && (
                            <HStack sx={{ alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={13} color={Theme.colors.sageGreen} />
                                <Text sx={{
                                    fontSize: 11,
                                    fontWeight: '700',
                                    color: Theme.colors.sageGreen
                                }}>
                                    Submitted
                                </Text>
                            </HStack>
                        )}
                    </HStack>
                ))}
            </VStack>
        </VStack>
    );
};
