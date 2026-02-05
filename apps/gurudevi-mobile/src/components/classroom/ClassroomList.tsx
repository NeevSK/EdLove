/**
 * ClassroomList Component
 * 
 * Displays a list of classrooms based on user role:
 * - Teachers: Shows classrooms they teach
 * - Students: Shows classrooms they're enrolled in
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { Box, Text, Heading, VStack, HStack } from '@gluestack-ui/themed';
import { BookOpen, Users, ChevronRight } from 'lucide-react-native';
import { Theme, typography } from '../../constants/Theme';
import { api, Classroom } from '../../lib/api';
import { useUserRole } from '../../hooks/useUserRole';
import { supabase } from '../../lib/supabase';

interface ClassroomListProps {
    onClassroomPress?: (classroom: Classroom) => void;
}

export default function ClassroomList({ onClassroomPress }: ClassroomListProps) {
    const { role } = useUserRole();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Theme.colors.voidIndigo,
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
            color: Theme.colors.sacredWhite,
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
            color: Theme.colors.sacredWhite,
            marginBottom: Theme.spacing.sm,
        },
        emptyDescription: {
            fontSize: Theme.typography.fontSize.md,
            color: Theme.colors.mistGray,
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
            color: Theme.colors.sacredWhite,
        },
        classroomSubject: {
            fontSize: Theme.typography.fontSize.sm,
            color: Theme.colors.mistGray,
            marginTop: Theme.spacing.xs,
        },
        classroomDescription: {
            fontSize: Theme.typography.fontSize.xs,
            color: Theme.colors.dimGray,
            marginTop: Theme.spacing.xs,
        },
    }), []);
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
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            <VStack space="md">
                {classrooms.map((classroom) => (
                    <TouchableOpacity
                        key={classroom.id}
                        onPress={() => handleClassroomPress(classroom)}
                        activeOpacity={0.7}
                    >
                        <Box style={styles.classroomCard}>
                            <HStack space="md" style={styles.cardContent}>
                                {/* Icon */}
                                <View style={styles.iconContainer}>
                                    <BookOpen
                                        size={24}
                                        color={Theme.colors.sanctuarySaffron}
                                    />
                                </View>

                                {/* Content */}
                                <VStack flex={1} space="xs">
                                    <Text style={styles.classroomName}>
                                        {classroom.name}
                                    </Text>
                                    {classroom.subject && (
                                        <Text style={styles.classroomSubject}>
                                            {classroom.subject}
                                        </Text>
                                    )}
                                    {classroom.description && (
                                        <Text
                                            style={styles.classroomDescription}
                                            numberOfLines={2}
                                        >
                                            {classroom.description}
                                        </Text>
                                    )}
                                </VStack>

                                {/* Arrow */}
                                <ChevronRight
                                    size={20}
                                    color={Theme.colors.mistGray}
                                />
                            </HStack>
                        </Box>
                    </TouchableOpacity>
                ))}
            </VStack>
        </ScrollView>
    );
}
