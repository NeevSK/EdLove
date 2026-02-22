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
import { Box, Text, Heading, VStack, HStack } from '@repo/ui';
import { BookOpen, Users, ChevronRight, ClipboardCheck, Plus, Zap, Trash2, Edit2 } from 'lucide-react-native';
import { Theme, typography } from '@repo/ui';
import { api, Classroom, MOCK_CLASSROOMS } from '@repo/core';
import { useUserRole, useStore, supabase } from '@repo/core';
import { useToast, Toast, ToastTitle, ToastDescription } from '@repo/ui';
import { hapticLight, hapticSuccess } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { useThemedColors } from '@repo/ui';
import RoleInitialState from './RoleInitialState';
import CreateClassroomModal from './CreateClassroomModal';
import { useFeatureAccess } from '@repo/core';
import { PositiveInvitation } from '@repo/ui';
import { SkeletonCard } from '@repo/ui';

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
    }), [colors]);
    const [error, setError] = useState<string | null>(null);
    const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [pendingInitialData, setPendingInitialData] = useState<any>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const PAGE_SIZE = 10;
    const toast = useToast();
    const { isExplorerMode, dismissedSampleIds } = useStore();


    useEffect(() => {
        let isMounted = true;
        const fetchClassrooms = async () => {
            try {
                if (isMounted) {
                    setLoading(true);
                    setError(null);
                }

                let data: Classroom[] = [];

                if (isGuest) {
                    if (role === 'teacher') {
                        const sampleId = 'sample-c1';
                        const sample = MOCK_CLASSROOMS.find((c: any) => c.id === sampleId);
                        if (sample && !dismissedSampleIds.includes(sampleId)) {
                            (sample as any).is_sample = true;
                            data = [sample];
                        }
                    } else if (role === 'principal') {
                        const sampleSchoolId = 'sample-school-1';
                        const sampleSchool = MOCK_CLASSROOMS.find((c: any) => c.id === sampleSchoolId);
                        if (sampleSchool && !dismissedSampleIds.includes(sampleSchoolId)) {
                            (sampleSchool as any).is_sample = true;
                            data = [sampleSchool];
                        }
                    } else if (role === 'student' || !role) {
                        const sampleId = 'sample-c1';
                        const sample = MOCK_CLASSROOMS.find((c: any) => c.id === sampleId);
                        if (sample && !dismissedSampleIds.includes(sampleId)) {
                            (sample as any).is_sample = true;
                            data = [sample];
                        }
                    }
                    setHasMore(false);
                } else {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        throw new Error('No authenticated user');
                    }

                    const pagination = { limit: PAGE_SIZE, offset: 0 };
                    let realData: Classroom[] = [];

                    if (role === 'teacher') {
                        realData = await api.classrooms.getByTeacher(user.id, pagination);
                    } else if (role === 'student') {
                        realData = await api.classrooms.getByStudent(user.id, pagination);
                    } else if (role === 'principal') {
                        realData = await api.classrooms.getBySchool(user.id, pagination);
                    }

                    // If real data exists, use it and ignore samples
                    if (realData.length > 0) {
                        data = realData;
                        setHasMore(realData.length === PAGE_SIZE);
                    } else {
                        // If no real data, try to show sample if not dismissed
                        let sampleToShow: any = null;
                        if (role === 'teacher' || role === 'student' || !role) {
                            sampleToShow = MOCK_CLASSROOMS.find((c: any) => c.id === 'sample-c1');
                        } else if (role === 'principal') {
                            sampleToShow = MOCK_CLASSROOMS.find((c: any) => c.id === 'sample-school-1');
                        }

                        if (sampleToShow && !dismissedSampleIds.includes(sampleToShow.id)) {
                            (sampleToShow as any).is_sample = true;
                            data = [sampleToShow];
                        }
                        setHasMore(false);
                    }

                    setPage(1);
                }

                if (isMounted) {
                    setClassrooms(data);
                    if (onDataLoaded) onDataLoaded(data);
                }
            } catch (err: any) {
                console.error('[ClassroomList] Error fetching classrooms:', err);
                if (isMounted) {
                    setError(err.message || 'Failed to load classrooms');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchClassrooms();

        return () => {
            isMounted = false;
        };
    }, [role, internalRefreshTrigger, externalRefreshTrigger, isGuest, dismissedSampleIds]);

    const handleRetry = () => {
        setInternalRefreshTrigger(prev => prev + 1);
    };

    const fetchMore = async () => {
        if (loading || isFetchingMore || !hasMore || isGuest) return;

        try {
            setIsFetchingMore(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const pagination = { limit: PAGE_SIZE, offset: page * PAGE_SIZE };
            let newData: Classroom[] = [];

            if (role === 'teacher') {
                newData = await api.classrooms.getByTeacher(user.id, pagination);
            } else if (role === 'student') {
                newData = await api.classrooms.getByStudent(user.id, pagination);
            } else if (role === 'principal') {
                newData = await api.classrooms.getBySchool(user.id, pagination);
            }

            if (newData.length > 0) {
                setClassrooms(prev => [...prev, ...newData]);
                setPage(prev => prev + 1);
            }
            setHasMore(newData.length === PAGE_SIZE);
        } catch (err) {
            console.error('[ClassroomList] Error fetching more:', err);
        } finally {
            setIsFetchingMore(false);
        }
    };

    const handleClassroomPress = useCallback((classroom: Classroom) => {
        if (onClassroomPress) {
            onClassroomPress(classroom);
        }
    }, [onClassroomPress]);

    const renderClassroomCard = useCallback(({ item: classroom }: ListRenderItemInfo<Classroom>) => {
        const studentCount = (classroom as any).student_count || 0;

        return (
            <ClassroomCard
                classroom={classroom}
                onPress={handleClassroomPress}
                onClassroomPress={onClassroomPress}
                studentCount={studentCount}
                colors={colors}
                setPendingInitialData={setPendingInitialData}
                setIsCreateModalOpen={setIsCreateModalOpen}
                toast={toast}
                t={t}
            />
        );
    }, [handleClassroomPress, onClassroomPress, colors, toast, t]);

    const keyExtractor = useCallback((item: Classroom) => item.id, []);
    const ItemSeparator = useCallback(() => <View style={{ height: Theme.spacing.md }} />, []);

    if (loading) {
        return (
            <VStack sx={{ width: '100%', padding: isNested ? 0 : Theme.spacing.md, gap: Theme.spacing.md }}>
                <SkeletonCard height={80} />
                <SkeletonCard height={80} />
                <SkeletonCard height={80} />
            </VStack>
        );
    }

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

    if (isNested) {
        return (
            <VStack sx={{ width: '100%', gap: Theme.spacing.md }}>
                {classrooms.length === 0 ? (
                    emptyContent || (
                        <PositiveInvitation
                            context="classroom"
                            onAction={() => {
                                hapticLight();
                                if (role !== 'student') {
                                    setPendingInitialData(null);
                                    setIsCreateModalOpen(true);
                                }
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

    return (
        <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
            {classrooms.length === 0 ? (
                <PositiveInvitation
                    context="classroom"
                    onAction={() => {
                        hapticLight();
                        setPendingInitialData(null);
                        setIsCreateModalOpen(true);
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
                        onEndReached={fetchMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={isFetchingMore ? <ActivityIndicator color={colors.action} style={{ padding: 10 }} /> : null}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}
                    />

                    {!isGuest && (
                        <TouchableOpacity
                            onPress={() => {
                                hapticLight();
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
                    setIsCreateModalOpen(false);
                    setPendingInitialData(null);
                }}
                onSuccess={() => {
                    hapticSuccess();
                    setInternalRefreshTrigger(prev => prev + 1);
                }}
            />
        </Box>
    );
}

// Memoized ClassroomCard component
interface ClassroomCardProps {
    classroom: Classroom;
    onPress: (classroom: Classroom) => void;
    onClassroomPress?: (classroom: Classroom) => void;
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
        console.log('Open attendance for:', classroom.id);
    }, [classroom.id]);

    const handleDismiss = useCallback((e: GestureResponderEvent) => {
        e.stopPropagation();
        hapticLight();
        dismissSample(classroom.id);

        toast.show({
            placement: "top",
            render: ({ id }: { id: string }) => (
                <Toast nativeID={"toast-" + id}>
                    <VStack sx={{ gap: 4 }}>
                        <ToastTitle>{t('common.sampleDismissed') || 'Sample Dismissed'}</ToastTitle>
                        <ToastDescription>
                            {t('common.sampleDismissedDesc') || 'This sample sanctuary has been removed from your view.'}
                        </ToastDescription>
                    </VStack>
                </Toast>
            ),
        });
    }, [classroom.id, dismissSample, toast, t]);

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Box
                sx={{
                    borderRadius: Theme.corners.generous,
                    padding: Theme.spacing.md,
                    borderWidth: 1,
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                }}
            >
                <HStack alignItems="center" sx={{ gap: Theme.spacing.md }}>
                    <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: Theme.corners.comfortable,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: colors.tertiary
                    }}>
                        <BookOpen
                            size={24}
                            color={Theme.colors.sanctuarySaffron}
                        />
                    </Box>

                    <VStack sx={{ flex: 1, gap: 4 }}>
                        <HStack alignItems="center" sx={{ gap: 8 }}>
                            <Text color={colors.text} sx={{ fontSize: 18, fontWeight: '700' }}>
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
                        <HStack alignItems="center" sx={{ gap: 8 }}>
                            <Text color={Theme.colors.sanctuarySaffron} sx={{ fontSize: 14, fontWeight: '700' }}>
                                {classroom.subject || t('classroom.noSubject')}
                            </Text>
                            <Box
                                sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: colors.textTertiary,
                                }}
                            />
                            <HStack alignItems="center" sx={{ gap: 4 }}>
                                <Users size={14} color={colors.textSecondary} />
                                <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>
                                    {studentCount}
                                </Text>
                            </HStack>
                        </HStack>
                    </VStack>

                    <TouchableOpacity onPress={handleAttendancePress}>
                        <Box sx={{
                            padding: Theme.spacing.sm,
                            borderRadius: Theme.corners.comfortable,
                            backgroundColor: colors.tertiary,
                        }}>
                            <ClipboardCheck size={20} color={Theme.colors.sageGreen} />
                        </Box>
                    </TouchableOpacity>

                    <ChevronRight
                        size={20}
                        color={colors.textSecondary}
                    />
                </HStack>
            </Box>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.classroom.id === nextProps.classroom.id &&
        prevProps.classroom.updated_at === nextProps.classroom.updated_at &&
        prevProps.studentCount === nextProps.studentCount
    );
});
