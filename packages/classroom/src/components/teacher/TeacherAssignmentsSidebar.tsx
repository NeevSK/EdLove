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
                className="rounded-[22px] border border-phase-border p-5 bg-phase-surface/90"
            >
                <Text className="text-sm font-semibold text-phaseText-onSurface">
                    No active assignments need attention.
                </Text>
                <Text className="mt-2 text-xs leading-5 text-phaseText-secondary">
                    This sidebar stays ready for submissions and due-date pressure when the rhythm changes.
                </Text>
            </Box>
        );
    }

    return (
        <VStack className="gap-3">
            {assignments.map((assignment) => {
                const totalCount = assignment.totalCount || 0;
                const ratio = totalCount > 0 ? (assignment.submittedCount / totalCount) * 100 : 0;

                return (
                    <Pressable
                        key={assignment.id}
                        onPress={() => onAssignmentPress(assignment)}
                        className="w-full rounded-[20px] border border-phase-border p-4 bg-phase-surface/80"
                    >
                        <Heading className="text-sm font-bold text-phaseText-onSurface leading-5">
                            {assignment.title}
                        </Heading>

                        <HStack className="mt-3 items-center justify-between gap-2">
                            <Text className="text-[11px] font-medium text-phaseText-secondary tracking-widest uppercase">
                                Due {new Date(assignment.dueDate).toLocaleDateString()}
                            </Text>
                            <Text className="text-[11px] font-medium text-phaseText-secondary tracking-widest uppercase">
                                {assignment.submittedCount}/{assignment.totalCount} turned in
                            </Text>
                        </HStack>

                        {/* Progress Bar */}
                        <Box className="mt-3 h-1.5 overflow-hidden rounded-[3px] bg-phase-elevated/20">
                            <Box 
                                className="h-full rounded-[3px] bg-templeGold" 
                                style={{ width: `${ratio}%` }} 
                            />
                        </Box>
                    </Pressable>
                );
            })}
        </VStack>
    );
};
