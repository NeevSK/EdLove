import React from 'react';
import { BookOpen } from 'lucide-react-native';
import { VStack, HStack, Box, Text, Theme, SkeletonCard, PositiveInvitation, useThemedColors } from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, StyleSheet } from 'react-native';

interface Classroom {
    id: string;
    name: string;
    subject?: string;
    color_theme?: string;
}

interface StudentClassroomListProps {
    classrooms: Classroom[];
    loading: boolean;
    isDemo: boolean;
}

export const StudentClassroomList = ({ classrooms, loading, isDemo }: StudentClassroomListProps) => {
    const navigation = useNavigation<any>();
    const colors = useThemedColors();
    
    if (loading) {
        return (
            <VStack sx={{ gap: 12 }}>
                {[1, 2, 3].map(i => <SkeletonCard key={i} height={120} />)}
            </VStack>
        );
    }

    if (classrooms.length === 0) {
        return (
            <Box sx={{ paddingVertical: 40, alignItems: 'center' }}>
                <PositiveInvitation
                    type="empty"
                    title={isDemo ? "Join Your First Sanctuary" : "No Classrooms found"}
                    description={isDemo
                        ? "Welcome to the student sanctuary. Ready to officially join your classes and begin your quest? Connect with your teachers to get started."
                        : "You haven't joined any classrooms yet. Reach out to your teacher for an invite code or search for a sanctuary."
                    }
                    actionLabel="Join a Classroom"
                    onAction={() => navigation.navigate('Main', { screen: 'Community' })}
                />
            </Box>
        );
    }

    return (
        <HStack sx={{ flexWrap: 'wrap', gap: 24 }}>
            {classrooms.map(cls => (
                <TouchableOpacity
                    key={cls.id}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('StudentClassroomDashboard', { classroomId: cls.id, classroomName: cls.name })}
                    style={[styles.card, { backgroundColor: colors.surface }]}
                >
                    <Box sx={{ 
                        height: 80, 
                        backgroundColor: cls.color_theme || Theme.colors.gurudeviBlue, 
                        padding: 24, 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        opacity: 0.9 
                    }}>
                        <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: 12, 
                            backgroundColor: 'rgba(255,255,255,0.9)', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <BookOpen size={20} color={Theme.colors.gurudeviBlue} />
                        </Box>
                        <Box sx={{ 
                            paddingHorizontal: 8, 
                            paddingVertical: 4, 
                            backgroundColor: 'rgba(255,255,255,0.9)', 
                            borderRadius: 6 
                        }}>
                            <Text sx={{ fontSize: 10, fontWeight: '800', color: Theme.colors.ink }}>Active</Text>
                        </Box>
                    </Box>
                    <VStack sx={{ padding: 24, gap: 12 }}>
                        <VStack sx={{ gap: 4 }}>
                            <Text sx={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{cls.name}</Text>
                            {cls.subject && (
                                <Text sx={{ fontSize: 12, color: colors.textSecondary }}>{cls.subject}</Text>
                            )}
                        </VStack>
                        <HStack sx={{ gap: 8 }}>
                            <Box sx={{ 
                                paddingHorizontal: 8, 
                                paddingVertical: 4, 
                                backgroundColor: colors.primary, 
                                borderRadius: 6 
                            }}>
                                <Text sx={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>📖 Lessons</Text>
                            </Box>
                            <Box sx={{ 
                                paddingHorizontal: 8, 
                                paddingVertical: 4, 
                                backgroundColor: colors.primary, 
                                borderRadius: 6 
                            }}>
                                <Text sx={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>📋 Assignments</Text>
                            </Box>
                        </HStack>
                    </VStack>
                </TouchableOpacity>
            ))}
        </HStack>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
});
