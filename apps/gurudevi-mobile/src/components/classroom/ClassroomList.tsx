/**
 * ClassroomList Component
 * 
 * Displays a list of classrooms based on user role:
 * - Teachers: Shows classrooms they teach
 * - Students: Shows classrooms they're enrolled in
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ListRenderItemInfo,
    GestureResponderEvent,
} from 'react-native';
import { Box, Text, Heading, VStack, HStack } from '@/ui';
import { BookOpen, Users, ChevronRight, ClipboardCheck, Plus } from 'lucide-react-native';
import { Theme, typography } from '../../constants/Theme';
import { api, Classroom } from '../../lib/api';
import { useUserRole } from '../../hooks/useUserRole';
import { hapticLight } from '../../utils/haptics';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useThemedColors } from '../../hooks/useThemedColors';

interface ClassroomListProps {
    onClassroomPress?: (classroom: Classroom) => void;
    onDataLoaded?: (classrooms: Classroom[]) => void;
    isNested?: boolean;
    refreshTrigger?: number;
}

export default function ClassroomList({
    onClassroomPress,
    onDataLoaded,
    isNested = false,
    refreshTrigger: externalRefreshTrigger = 0
}: ClassroomListProps) {
    const { role } = useUserRole();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const colors = useThemedColors();
    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.primary,
        },
        contentContainer: {
            padding: Theme.spacing.md,
        },
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: Theme.spacing.lg,
        },
        loadingText: {
            fontSize: Theme.typography.fontSize.md,
            color: colors.text,
            marginTop: Theme.spacing.sm,
        },
        errorText: {
            fontSize: Theme.typography.fontSize.md,
            color: Theme.colors.emberRed,
            textAlign: 'center',
            marginBottom: Theme.spacing.md,
        },
        retryButton: {
            backgroundColor: Theme.colors.sanctuarySaffron,
            paddingVertical: Theme.spacing.sm,
            paddingHorizontal: Theme.spacing.lg,
            borderRadius: Theme.corners.comfortable,
        },
        retryButtonText: {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: '600',
            color: Theme.colors.white,
        },
        emptyIcon: {
            marginBottom: Theme.spacing.md,
        },
        emptyTitle: {
            fontSize: Theme.typography.h3.fontSize,
            fontWeight: '600',
            color: colors.text,
            marginBottom: Theme.spacing.sm,
        },
        emptyDescription: {
            fontSize: Theme.typography.fontSize.md,
            color: colors.textSecondary,
            textAlign: 'center',
            paddingHorizontal: Theme.spacing.lg,
        },
        classroomCard: {
            backgroundColor: Theme.colors.midnightBlue,
            borderRadius: Theme.corners.generous,
            padding: Theme.spacing.md,
            shadowColor: Theme.colors.shadowDark,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        cardContent: {
            alignItems: 'center',
        },
        iconContainer: {
            backgroundColor: Theme.colors.deepIndigo, // sapphireGlow not found, use deepIndigo or amberGlow?
            // Actually, let's use a valid one.
            borderRadius: Theme.corners.full,
            padding: Theme.spacing.sm,
        },
        classroomName: {
            fontSize: Theme.typography.fontSize.lg,
            fontWeight: '600',
            color: colors.text,
        },
        classroomSubject: {
            fontSize: Theme.typography.fontSize.sm,
            color: colors.textSecondary,
            marginTop: Theme.spacing.xs,
        },
        classroomDescription: {
            fontSize: Theme.typography.fontSize.xs,
            color: colors.textTertiary,
            marginTop: Theme.spacing.xs,
        },
    }), []);
    const [error, setError] = useState<string | null>(null);
    const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0);

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
    }, [role, internalRefreshTrigger, externalRefreshTrigger]);

    const handleRetry = () => {
        setInternalRefreshTrigger(prev => prev + 1);
    };

    const handleClassroomPress = useCallback((classroom: Classroom) => {
        if (onClassroomPress) {
            onClassroomPress(classroom);
        }
    }, [onClassroomPress]);

    // Memoized classroom card renderer
    const renderClassroomCard = useCallback(({ item: classroom }: ListRenderItemInfo<Classroom>) => {
        const studentCount = (classroom as any).student_count || 0;

        return (
            <ClassroomCard
                classroom={classroom}
                onPress={handleClassroomPress}
                studentCount={studentCount}
                colors={colors}
            />
        );
    }, [handleClassroomPress, colors]);

    // Key extractor for FlatList
    const keyExtractor = useCallback((item: Classroom) => item.id, []);

    // Item separator
    const ItemSeparator = useCallback(() => <View style={{ height: Theme.spacing.md }} />, []);

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
                    color={colors.action}
                    style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>
                    {t('classroom.peacefulSpace') || "This is your peaceful working space."}
                </Text>
                <Text style={styles.emptyDescription}>
                    {t('classroom.startWorking') || "Let's start working."}
                </Text>

                {/* Role-neutral Add action */}
                <TouchableOpacity
                    style={[styles.retryButton, { marginTop: Theme.spacing.xl }]}
                    onPress={() => {
                        hapticLight();
                        // If teacher, open create modal. For others, maybe a generic "Join" or info?
                        // For now, let's keep it consistent if onClassroomPress is available or show a placeholder
                        console.log('Add pressed in empty state');
                    }}
                >
                    <HStack space="xs" alignItems="center">
                        <Plus size={20} color={Theme.colors.white} />
                        <Text style={styles.retryButtonText}>
                            {t('common.add') || 'Add'}
                        </Text>
                    </HStack>
                </TouchableOpacity>
            </View>
        );
    }

    // Classroom list with FlatList
    if (isNested) {
        // For nested use, return VStack for compatibility
        return (
            <VStack space="md">
                {classrooms.map((classroom) => (
                    <ClassroomCard
                        key={classroom.id}
                        classroom={classroom}
                        onPress={handleClassroomPress}
                        studentCount={(classroom as any).student_count || 0}
                        colors={colors}
                    />
                ))}
            </VStack>
        );
    }

    return (
        <FlatList
            data={classrooms}
            renderItem={renderClassroomCard}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={ItemSeparator}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            // Performance optimizations
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
        />
    );
}

// Memoized ClassroomCard component for better performance
interface ClassroomCardProps {
    classroom: Classroom;
    onPress: (classroom: Classroom) => void;
    studentCount: number;
    colors: any;
}

const ClassroomCard = React.memo(({ classroom, onPress, studentCount, colors }: ClassroomCardProps) => {
    const handlePress = useCallback(() => {
        hapticLight();
        onPress(classroom);
    }, [classroom, onPress]);

    const handleAttendancePress = useCallback((e: GestureResponderEvent) => {
        e.stopPropagation();
        hapticLight();
        // TODO: Navigate to Attendance for this class
        console.log('Open attendance for:', classroom.id);
    }, [classroom.id]);

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Box
                sx={{
                    ...richStyles.classroomCard,
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                    ...Theme.shadows.md,
                }}
            >
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
                        <Text color={colors.text} size="lg" bold>
                            {classroom.name}
                        </Text>
                        <HStack space="sm" alignItems="center">
                            <Text color={Theme.colors.sanctuarySaffron} size="sm" bold>
                                {classroom.subject || 'No Subject'}
                            </Text>
                            <Box
                                sx={{
                                    ...richStyles.dot,
                                    backgroundColor: colors.textTertiary,
                                }}
                            />
                            <HStack space="xs" alignItems="center">
                                <Users size={14} color={colors.textSecondary} />
                                <Text color={colors.textSecondary} size="sm">
                                    {studentCount}
                                </Text>
                            </HStack>
                        </HStack>
                    </VStack>

                    {/* Quick Record Attendance Button */}
                    <TouchableOpacity onPress={handleAttendancePress}>
                        <Box sx={{
                            ...richStyles.attendanceAction,
                            backgroundColor: colors.tertiary,
                        }}>
                            <ClipboardCheck size={20} color={Theme.colors.sageGreen} />
                        </Box>
                    </TouchableOpacity>

                    {/* Arrow */}
                    <ChevronRight
                        size={20}
                        color={colors.textSecondary}
                    />
                </HStack>
            </Box>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
        prevProps.classroom.id === nextProps.classroom.id &&
        prevProps.classroom.updated_at === nextProps.classroom.updated_at &&
        prevProps.studentCount === nextProps.studentCount
    );
});

const richStyles = {
    classroomCard: {
        borderRadius: Theme.corners.generous,
        padding: Theme.spacing.md,
        borderWidth: 1,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: Theme.corners.comfortable,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    attendanceAction: {
        padding: Theme.spacing.sm,
        borderRadius: Theme.corners.comfortable,
        marginRight: Theme.spacing.xs,
    }
};


