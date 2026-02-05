/**
 * ClassroomList Component
 * 
 * Displays a list of classrooms based on user role:
 * - Teachers: Shows classrooms they teach
 * - Students: Shows classrooms they're enrolled in
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { Box, Text, Heading, VStack, HStack } from '@gluestack-ui/themed';
import { BookOpen, Users, ChevronRight, ClipboardCheck } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { api, Classroom } from '../../lib/api';
import { useUserRole } from '../../hooks/useUserRole';
import { hapticLight } from '../../utils/haptics';
import { supabase } from '../../lib/supabase';

interface ClassroomListProps {
    onClassroomPress?: (classroom: Classroom) => void;
    onDataLoaded?: (classrooms: Classroom[]) => void;
    isNested?: boolean;
}

export default function ClassroomList({
    onClassroomPress,
    onDataLoaded,
    isNested = false
}: ClassroomListProps) {
    const { role } = useUserRole();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get current user ID
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    throw new Error('No authenticated user');
                }

                // Fetch classrooms based on role
                let data: Classroom[] = [];
                if (role === 'teacher') {
                    data = await api.classrooms.getByTeacher(user.id);
                } else if (role === 'student') {
                    data = await api.classrooms.getByStudent(user.id);
                    // Sort for student view since join query may not preserve ordering
                    data.sort((a, b) => a.name.localeCompare(b.name));
                }

                setClassrooms(data);
                if (onDataLoaded) onDataLoaded(data);
            } catch (err: any) {
                console.error('Error fetching classrooms:', err);
                setError(err.message || 'Failed to load classrooms');
            } finally {
                setLoading(false);
            }
        };

        fetchClassrooms();
    }, [role, refreshTrigger]);

    const handleRetry = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleClassroomPress = (classroom: Classroom) => {
        if (onClassroomPress) {
            onClassroomPress(classroom);
        }
    };

    // Loading state
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Theme.colors.sanctuarySaffron} />
                <Text style={styles.loadingText}>Loading classrooms...</Text>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleRetry}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Empty state
    if (classrooms.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <BookOpen
                    size={64}
                    color={Theme.colors.mistGray}
                    style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No Classrooms Yet</Text>
                <Text style={styles.emptyDescription}>
                    {role === 'teacher'
                        ? "You haven't been assigned to any classrooms yet."
                        : "You haven't enrolled in any classrooms yet."}
                </Text>
            </View>
        );
    }

    // Classroom list
    const content = (
        <VStack space="md">
            {classrooms.map((classroom) => {
                const subjectIcon = BookOpen; // Default
                const studentCount = (classroom as any).student_count || 0;

                return (
                    <TouchableOpacity
                        key={classroom.id}
                        onPress={() => handleClassroomPress(classroom)}
                        activeOpacity={0.7}
                    >
                        <Box sx={richStyles.classroomCard}>
                            <HStack space="md" alignItems="center">
                                {/* Icon Container */}
                                <Box sx={richStyles.iconContainer}>
                                    <BookOpen
                                        size={24}
                                        color={Theme.colors.sanctuarySaffron}
                                    />
                                </Box>

                                {/* Content */}
                                <VStack flex={1} space="xs">
                                    <Text color={Theme.colors.sacredWhite} size="lg" bold>
                                        {classroom.name}
                                    </Text>
                                    <HStack space="sm" alignItems="center">
                                        <Text color={Theme.colors.sanctuarySaffron} size="sm" bold>
                                            {classroom.subject || 'No Subject'}
                                        </Text>
                                        <Box sx={richStyles.dot} />
                                        <HStack space="xs" alignItems="center">
                                            <Users size={14} color={Theme.colors.pearlGray} />
                                            <Text color={Theme.colors.pearlGray} size="sm">
                                                {studentCount}
                                            </Text>
                                        </HStack>
                                    </HStack>
                                </VStack>

                                {/* Quick Record Attendance Button */}
                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        hapticLight();
                                        // TODO: Navigate to Attendance for this class
                                        console.log('Open attendance for:', classroom.id);
                                    }}
                                >
                                    <Box sx={richStyles.attendanceAction}>
                                        <ClipboardCheck size={20} color={Theme.colors.sageGreen} />
                                    </Box>
                                </TouchableOpacity>

                                {/* Arrow */}
                                <ChevronRight
                                    size={20}
                                    color={Theme.colors.mistGray}
                                />
                            </HStack>
                        </Box>
                    </TouchableOpacity>
                );
            })}
        </VStack>
    );

    if (isNested) return content;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {content}
        </ScrollView>
    );
}

const richStyles = {
    classroomCard: {
        backgroundColor: Theme.colors.midnightBlue,
        borderRadius: Theme.corners.generous,
        padding: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.deepIndigo,
        ...Theme.shadows.md,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: Theme.corners.comfortable,
        backgroundColor: Theme.colors.deepIndigo,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Theme.colors.dimGray,
    },
    attendanceAction: {
        padding: Theme.spacing.sm,
        backgroundColor: Theme.colors.deepIndigo,
        borderRadius: Theme.corners.comfortable,
        marginRight: Theme.spacing.xs,
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.voidIndigo,
    },
    contentContainer: {
        padding: Theme.spacing.lg,
    },
    heading: {
        fontSize: Theme.typography.fontSize['2xl'],
        fontWeight: Theme.typography.fontWeight.bold,
        color: Theme.colors.sanctuarySaffron,
        marginBottom: Theme.spacing.lg,
    },
    classroomCard: {
        backgroundColor: Theme.colors.midnightBlue,
        borderRadius: Theme.corners.comfortable,
        padding: Theme.spacing.md,
        ...Theme.shadows.md,
    },
    cardContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: Theme.corners.comfortable,
        backgroundColor: Theme.colors.deepIndigo,
        justifyContent: 'center',
        alignItems: 'center',
    },
    classroomName: {
        fontSize: Theme.typography.fontSize.lg,
        fontWeight: Theme.typography.fontWeight.semibold,
        color: Theme.colors.sacredWhite,
    },
    classroomSubject: {
        fontSize: Theme.typography.fontSize.md,
        color: Theme.colors.sanctuarySaffron,
    },
    classroomDescription: {
        fontSize: Theme.typography.fontSize.sm,
        color: Theme.colors.pearlGray,
        lineHeight: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.voidIndigo,
        padding: Theme.spacing.xl,
    },
    loadingText: {
        marginTop: Theme.spacing.md,
        fontSize: Theme.typography.fontSize.md,
        color: Theme.colors.pearlGray,
    },
    errorText: {
        fontSize: Theme.typography.fontSize.md,
        color: Theme.colors.emberRed,
        textAlign: 'center',
        marginBottom: Theme.spacing.lg,
    },
    retryButton: {
        backgroundColor: Theme.colors.sanctuarySaffron,
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.sm,
        borderRadius: Theme.corners.comfortable,
    },
    retryButtonText: {
        color: Theme.colors.sacredWhite,
        fontSize: Theme.typography.fontSize.md,
        fontWeight: Theme.typography.fontWeight.semibold,
    },
    emptyIcon: {
        marginBottom: Theme.spacing.lg,
    },
    emptyTitle: {
        fontSize: Theme.typography.fontSize.xl,
        fontWeight: Theme.typography.fontWeight.semibold,
        color: Theme.colors.sacredWhite,
        marginBottom: Theme.spacing.sm,
    },
    emptyDescription: {
        fontSize: Theme.typography.fontSize.md,
        color: Theme.colors.pearlGray,
        textAlign: 'center',
        lineHeight: 24,
    },
});
