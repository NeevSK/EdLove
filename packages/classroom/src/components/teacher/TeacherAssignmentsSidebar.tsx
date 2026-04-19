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
                className="rounded-3xl border border-sanctuary-border/10 p-6 bg-sanctuary-surface shadow-sm"
            >
                <Text className="text-sm font-bold text-sanctuary-text">
                    No active assignments need attention.
                </Text>
                <Text className="mt-2 text-xs leading-5 text-sanctuary-text-muted">
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
                        className="w-full rounded-[24px] border border-sanctuary-border/10 p-5 bg-sanctuary-surface shadow-sm active:opacity-70"
                    >
                        <Heading size="xs" className="text-sanctuary-text font-bold leading-5">
                            {assignment.title}
                        </Heading>

                        <HStack className="mt-4 items-center justify-between gap-2">
                            <Text className="text-[10px] font-bold text-sanctuary-text-muted tracking-widest uppercase">
                                Due {new Date(assignment.dueDate).toLocaleDateString()}
                            </Text>
                            <Text className="text-[10px] font-bold text-sanctuary-text-muted tracking-widest uppercase">
                                {assignment.submittedCount}/{assignment.totalCount} turned in
                            </Text>
                        </HStack>

                        {/* Progress Bar Container */}
                        <Box className="mt-4 h-1.5 overflow-hidden rounded-full bg-sanctuary-surface-secondary">
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
