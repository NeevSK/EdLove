import React from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    Pressable,
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
    if (assignments.length === 0) {
        return (
            <Box
                className="rounded-[32px] border border-sanctuary-border p-6 bg-sanctuary-surface-secondary/30"
            >
                <Text className="text-sm font-black text-sanctuary-text tracking-tight">
                    No active assignments need attention.
                </Text>
                <Text className="mt-2 text-xs leading-relaxed text-sanctuary-text-tertiary">
                    This sidebar stays ready for submissions and due-date pressure when the rhythm changes.
                </Text>
            </Box>
        );
    }

    return (
        <VStack className="gap-4">
            {assignments.map((assignment) => {
                const totalCount = assignment.totalCount || 0;
                const ratio = totalCount > 0 ? (assignment.submittedCount / totalCount) * 100 : 0;

                return (
                    <Pressable
                        key={assignment.id}
                        onPress={() => onAssignmentPress(assignment)}
                        className="w-full rounded-[24px] border border-sanctuary-border p-5 bg-sanctuary-surface active:opacity-80"
                    >
                        <Heading className="text-sm text-sanctuary-text font-black leading-tight tracking-tight uppercase">
                            {assignment.title}
                        </Heading>
 
                        <HStack className="mt-4 items-center justify-between gap-2">
                            <Text className="text-[10px] font-black text-sanctuary-text-tertiary tracking-[0.2em] uppercase">
                                Due {new Date(assignment.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </Text>
                            <Text className="text-[10px] font-black text-sanctuarySaffron tracking-[0.1em] uppercase">
                                {assignment.submittedCount}/{assignment.totalCount} Turned In
                            </Text>
                        </HStack>
 
                        {/* Progress Bar Container */}
                        <Box className="mt-4 h-2 overflow-hidden rounded-full bg-sanctuary-surface-secondary border border-sanctuary-border/20">
                            <Box 
                                className="h-full rounded-full bg-sanctuarySaffron" 
                                style={{ width: `${ratio}%` }} 
                            />
                        </Box>
                    </Pressable>
                );
            })}
        </VStack>
    );
};
