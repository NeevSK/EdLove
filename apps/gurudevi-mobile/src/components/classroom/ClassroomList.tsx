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
import { BookOpen, Users, ChevronRight, ClipboardCheck, Plus, Zap, Trash2, Edit2 } from 'lucide-react-native';
import { Theme, typography } from '../../constants/Theme';
import { api, Classroom } from '../../lib/api';
import { useUserRole } from '../../hooks/useUserRole';
import { useStore } from '../../store/useStore';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/ui';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useThemedColors } from '../../hooks/useThemedColors';
import RoleInitialState from './RoleInitialState';
import CreateClassroomModal from './CreateClassroomModal';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';

interface ClassroomListProps {
    onClassroomPress?: (classroom: Classroom) => void;
    onDataLoaded?: (classrooms: Classroom[]) => void;
    isNested?: boolean;
    refreshTrigger?: number;
    emptyContent?: React.ReactNode;
}

export default function ClassroomList({
    onClassroomPress,
    onDataLoaded,
    isNested = false,
    refreshTrigger: externalRefreshTrigger = 0,
    emptyContent
}: ClassroomListProps) {
    const { role } = useUserRole();
    const { isGuest, canCreateClassroom } = useFeatureAccess();
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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [pendingInitialData, setPendingInitialData] = useState<any>(null);
    const toast = useToast();
    const { isExplorerMode, dismissedSampleIds } = useStore();


    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                setLoading(true);
                setError(null);

                let data: Classroom[] = [];

                // Handle guest users - they have no classrooms, so we'll show sample only
                if (isGuest) {
                    // Inject Sample Classroom/School for guests
                    if (role === 'teacher') {
                        const sampleId = 'sample-c1';
                        if (!dismissedSampleIds.includes(sampleId)) {
                            const { MOCK_CLASSROOMS } = require('../../lib/api/mockData');
                            const sample = MOCK_CLASSROOMS.find((c: any) => c.id === sampleId);
                            if (sample) {
                                (sample as any).is_sample = true;
                                data = [sample];
                            }
                        }
                    } else if (role === 'principal') {
                        // For principal, check if there's a sample school
                        const sampleSchoolId = 'sample-school-1';
                        if (!dismissedSampleIds.includes(sampleSchoolId)) {
                            const { MOCK_CLASSROOMS } = require('../../lib/api/mockData');
                            const sampleSchool = MOCK_CLASSROOMS.find((c: any) => c.id === sampleSchoolId);
                            if (sampleSchool) {
                                (sampleSchool as any).is_sample = true;
                                data = [sampleSchool];
                            }
                        }
                    }
                } else {
                    // Authenticated users - fetch their actual classrooms
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        throw new Error('No authenticated user');
                    }

                    // Fetch classrooms based on role
                    if (role === 'teacher') {
                        data = await api.classrooms.getByTeacher(user.id);
                    } else if (role === 'student') {
                        data = await api.classrooms.getByStudent(user.id);
                        data.sort((a, b) => a.name.localeCompare(b.name));
                    } else if (role === 'principal') {
                        // Fetch schools for principal (if there's an API method)
                        // For now, using classrooms - you may need to create api.schools.getByPrincipal
                        data = await api.classrooms.getByTeacher(user.id); // Placeholder
                    }

                    // Inject Sample Classroom/School if newly created user (no classrooms yet) and not dismissed
                    if (role === 'teacher' && data.length === 0) {
                        const sampleId = 'sample-c1';
                        if (!dismissedSampleIds.includes(sampleId)) {
                            const { MOCK_CLASSROOMS } = require('../../lib/api/mockData');
                            const sample = MOCK_CLASSROOMS.find((c: any) => c.id === sampleId);
                            if (sample) {
                                (sample as any).is_sample = true;
                                data = [sample];
                            }
                        }
                    } else if (role === 'principal' && data.length === 0) {
                        const sampleSchoolId = 'sample-school-1';
                        if (!dismissedSampleIds.includes(sampleSchoolId)) {
                            const { MOCK_CLASSROOMS } = require('../../lib/api/mockData');
                            const sampleSchool = MOCK_CLASSROOMS.find((c: any) => c.id === sampleSchoolId);
                            if (sampleSchool) {
                                (sampleSchool as any).is_sample = true;
                                data = [sampleSchool];
                            }
                        }
                    }
                }

                console.log(`[ClassroomList] Loaded ${data.length} classrooms for role: ${role}, isGuest: ${isGuest}`);
                setClassrooms(data);

                if (onDataLoaded) onDataLoaded(data);
            } catch (err: any) {
                console.error('[ClassroomList] Error fetching classrooms:', err);
                setError(err.message || 'Failed to load classrooms');
            } finally {
                setLoading(false);
            }
        };

        fetchClassrooms();
    }, [role, internalRefreshTrigger, externalRefreshTrigger, isGuest]);

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
                onClassroomPress={onClassroomPress} // Pass onClassroomPress for edit action
                studentCount={studentCount}
                colors={colors}
                setPendingInitialData={setPendingInitialData}
                setIsCreateModalOpen={setIsCreateModalOpen}
                toast={toast}
                t={t}
            />
        );
    }, [handleClassroomPress, onClassroomPress, colors, setPendingInitialData, setIsCreateModalOpen, toast, t]);

    // Key extractor for FlatList
    const keyExtractor = useCallback((item: Classroom) => item.id, []);

    // Item separator
    const ItemSeparator = useCallback(() => <View style={{ height: Theme.spacing.md }} />, []);

    // Loading state
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Theme.colors.sanctuarySaffron} />
                <Text style={styles.loadingText}>{t('classroom.loading')}</Text>
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
                    <Text style={styles.retryButtonText}>{t('classroom.retry')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // For nested use (e.g. inside TeacherDashboard ScrollView), we use VStack
    if (isNested) {
        return (
            <VStack space="md" sx={{ width: '100%' }}>
                {classrooms.length === 0 ? (
                    emptyContent || (
                        <RoleInitialState
                            role={role}
                            onCreatePress={() => {
                                hapticLight();
                                setPendingInitialData(null);
                                setIsCreateModalOpen(true);
                            }}
                            onJoinPress={() => {
                                hapticLight();
                                // If student, this would ideally open a Join Modal or Code Entry
                                // For now, let's keep it minimal or navigate to library
                                console.log('[ClassroomList] onJoinPress triggered for role:', role);
                            }}
                        />
                    )
                ) : (
                    classrooms.map((classroom) => (
                        <ClassroomCard
                            key={classroom.id}
                            classroom={classroom}
                            onPress={handleClassroomPress}
                            onClassroomPress={onClassroomPress}
                            studentCount={(classroom as any).student_count || 0}
                            colors={colors}
                            setPendingInitialData={setPendingInitialData}
                            setIsCreateModalOpen={setIsCreateModalOpen}
                            toast={toast}
                            t={t}
                        />
                    ))
                )}

                <CreateClassroomModal
                    isOpen={isCreateModalOpen}
                    initialData={pendingInitialData}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setPendingInitialData(null);
                    }}
                    onSuccess={() => {
                        hapticSuccess();
                        setInternalRefreshTrigger(prev => prev + 1);
                    }}
                />
            </VStack>
        );
    }

    // Standard view (using FlatList)

    const content = (
        <Box flex={1} sx={{ backgroundColor: colors.primary }}>
            {classrooms.length === 0 ? (
                <RoleInitialState
                    role={role}
                    onCreatePress={() => {
                        console.log('[ClassroomList] Standard empty onCreatePress');
                        hapticLight();
                        setPendingInitialData(null);
                        setIsCreateModalOpen(true);
                    }}
                    onJoinPress={() => {
                        console.log('[ClassroomList] Standard empty onJoinPress');
                        hapticLight();
                        // For generic/unknown role, maybe redirect to profile to set role
                    }}
                    onSamplePress={(item) => {
                        console.log('[ClassroomList] Sample guide pressed:', item.id);
                    }}
                />
            ) : (
                <>
                    <FlatList
                        data={classrooms}
                        renderItem={renderClassroomCard}
                        keyExtractor={keyExtractor}
                        ItemSeparatorComponent={ItemSeparator}
                        style={styles.container}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}
                    />

                    {!isGuest && (
                        <TouchableOpacity
                            onPress={() => {
                                console.log('[ClassroomList] FAB pressed');
                                setPendingInitialData(null);
                                setIsCreateModalOpen(true);
                            }}
                            style={{
                                position: 'absolute',
                                bottom: 20,
                                right: 20,
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                justifyContent: 'center',
                                alignItems: 'center',
                                ...Theme.shadows.md,
                                zIndex: 10
                            }}
                        >
                            <Plus size={24} color="white" />
                        </TouchableOpacity>
                    )}
                </>
            )}

            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                initialData={pendingInitialData}
                onClose={() => {
                    console.log('[ClassroomList] Closing standard modal');
                    setIsCreateModalOpen(false);
                    setPendingInitialData(null);
                }}
                onSuccess={() => {
                    console.log('[ClassroomList] Standard create success');
                    hapticSuccess();
                    setInternalRefreshTrigger(prev => prev + 1);
                }}
            />
        </Box>
    );

    return content;
}

// Memoized ClassroomCard component for better performance
interface ClassroomCardProps {
    classroom: Classroom;
    onPress: (classroom: Classroom) => void;
    onClassroomPress?: (classroom: Classroom) => void; // Added for edit action
    studentCount: number;
    colors: any;
    setPendingInitialData: (data: any) => void;
    setIsCreateModalOpen: (isOpen: boolean) => void;
    toast: ReturnType<typeof useToast>;
    t: (key: string) => string;
}

const ClassroomCard = React.memo(({ classroom, onPress, onClassroomPress, studentCount, colors, setPendingInitialData, setIsCreateModalOpen, toast, t }: ClassroomCardProps) => {
    const handlePress = useCallback(() => {
        hapticLight();
        onPress(classroom);
    }, [classroom, onPress]);

    const dismissSample = useStore(state => state.dismissSample);

    const handleAttendancePress = useCallback((e: GestureResponderEvent) => {
        e.stopPropagation();
        hapticLight();

        if ((classroom as any).is_sample) {
            // Re-using this area for info or specific sample action
            console.log('Sample info requested:', classroom.id);
            return;
        }

        // TODO: Navigate to Attendance for this class
        console.log('Open attendance for:', classroom.id);
    }, [classroom.id, (classroom as any).is_sample]);

    const handleDismiss = useCallback((e: GestureResponderEvent) => {
        e.stopPropagation();
        hapticLight();
        dismissSample(classroom.id);

        toast.show({
            placement: "top",
            render: ({ id }) => {
                const toastId = "toast-" + id;
                return (
                    <Toast nativeID={toastId} action="success" variant="solid">
                        <VStack space="xs">
                            <ToastTitle>{t('common.sampleDismissed') || 'Sample Dismissed'}</ToastTitle>
                            <ToastDescription>
                                {t('common.sampleDismissedDesc') || 'This sample sanctuary has been removed from your view.'}
                            </ToastDescription>
                        </VStack>
                    </Toast>
                );
            },
        });
    }, [classroom.id, dismissSample, toast, t]);

    const handleEdit = useCallback((e: GestureResponderEvent) => {
        e.stopPropagation();
        hapticLight();
        // Set data and open modal
        setPendingInitialData({
            name: classroom.name,
            subject: classroom.subject
        });
        setIsCreateModalOpen(true);
    }, [classroom, setPendingInitialData, setIsCreateModalOpen]);

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
                        <HStack space="sm" alignItems="center">
                            <Text color={colors.text} size="lg" bold>
                                {classroom.name}
                            </Text>
                            {(classroom as any).is_sample && (
                                <Box sx={{
                                    backgroundColor: Theme.colors.amberGlow + '22',
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.amberGlow,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Zap size={10} color={Theme.colors.amberGlow} fill={Theme.colors.amberGlow} />
                                    <Text sx={{ fontSize: 10, color: Theme.colors.amberGlow, fontWeight: '700' }}>{t('classroom.sample')}</Text>
                                </Box>
                            )}
                        </HStack>
                        <HStack space="sm" alignItems="center">
                            <Text color={Theme.colors.sanctuarySaffron} size="sm" bold>
                                {classroom.subject || t('classroom.noSubject')}
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


