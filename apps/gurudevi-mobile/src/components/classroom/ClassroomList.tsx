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
import { BookOpen, Users, ChevronRight } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchClassrooms();
    }, [role]);

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
            }

            setClassrooms(data);
        } catch (err: any) {
            console.error('Error fetching classrooms:', err);
            setError(err.message || 'Failed to load classrooms');
        } finally {
            setLoading(false);
        }
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
                    onPress={fetchClassrooms}
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
            <Heading style={styles.heading}>
                {role === 'teacher' ? 'My Classes' : 'My Classrooms'}
            </Heading>
            
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
