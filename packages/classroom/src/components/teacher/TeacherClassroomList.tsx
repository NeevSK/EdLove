import React from 'react';
import { Box, Text, VStack, HStack, Pressable, Heading, Icon, Badge, BadgeText } from '@repo/ui';
import { Calendar, ChevronRight } from 'lucide-react-native';

interface Classroom {
    id: string;
    name: string;
    subject: string;
    studentCount: number;
    nextSession: string;
}

interface TeacherClassroomListProps {
    classrooms: Classroom[];
    onClassroomPress: (classroom: Classroom) => void;
}

export const TeacherClassroomList: React.FC<TeacherClassroomListProps> = ({
    classrooms,
    onClassroomPress
}) => {
    if (classrooms.length === 0) {
        return (
            <Box className="rounded-[40px] border border-sanctuary-border/10 bg-sanctuary-surface-secondary/40 p-12 shadow-sm">
                <VStack className="max-w-md gap-5">
                    <Text className="text-[10px] font-bold uppercase tracking-[0.25em] text-sanctuary-text-muted">
                        Classroom Registry
                    </Text>
                    <Heading size="md" className="text-sanctuary-text font-bold tracking-tight">
                        Your sanctuaries will gather here.
                    </Heading>
                    <Text className="text-sm leading-7 text-sanctuary-text-muted">
                        Create or join a classroom to begin the teacher workspace flow. All your teaching signals will be centralized here.
                    </Text>
                </VStack>
            </Box>
        );
    }

    return (
        <HStack className="flex-wrap gap-6">
            {classrooms.map((classroom) => (
                <Pressable
                    key={classroom.id}
                    onPress={() => onClassroomPress(classroom)}
                    className="w-full lg:w-[calc(50%-12px)] active:scale-[0.99] transition-all duration-300"
                >
                    <Box className="rounded-[40px] border border-sanctuary-border/10 bg-sanctuary-surface p-7 shadow-sm overflow-hidden relative">
                        {/* Decorative background glow */}
                        <Box className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sanctuarySaffron/5" />
                        
                        <VStack className="gap-8">
                            <HStack className="items-start justify-between">
                                <VStack className="flex-1 gap-2.5">
                                    <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-sanctuary-text-muted">
                                        {classroom.subject}
                                    </Text>
                                    <Heading size="sm" className="text-sanctuary-text font-bold tracking-tight">
                                        {classroom.name}
                                    </Heading>
                                </VStack>
                                <Badge className="rounded-full bg-sanctuarySaffron/10 border-0 px-4 py-1.5 h-auto">
                                    <BadgeText className="text-[10px] font-bold text-sanctuarySaffron uppercase tracking-tight">
                                        {classroom.studentCount} students
                                    </BadgeText>
                                </Badge>
                            </HStack>

                            <Box className="border-t border-sanctuary-border/5 pt-6">
                                <HStack className="items-center justify-between">
                                    <VStack className="gap-1.5">
                                        <Text className="text-[10px] font-bold uppercase tracking-[0.15em] text-sanctuary-text-muted">
                                            Next Session
                                        </Text>
                                        <HStack className="items-center gap-2">
                                            <Icon as={Calendar} size="xs" className="text-sanctuarySaffron" />
                                            <Text className="text-xs font-bold text-sanctuary-text">
                                                {classroom.nextSession}
                                            </Text>
                                        </HStack>
                                    </VStack>
                                    <HStack className="items-center gap-1.5">
                                        <Text className="text-[10px] font-bold uppercase tracking-widest text-sanctuarySaffron">
                                            Workspace
                                        </Text>
                                        <Icon as={ChevronRight} size="xs" className="text-sanctuarySaffron" />
                                    </HStack>
                                </HStack>
                            </Box>
                        </VStack>
                    </Box>
                </Pressable>
            ))}
        </HStack>
    );
};
