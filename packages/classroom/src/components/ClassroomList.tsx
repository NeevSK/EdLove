import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Text, Heading, VStack, HStack, Pressable, Spinner, useToast, SanctuaryToast, SkeletonCard, PositiveInvitation, Icon, FlatList } from '@repo/ui';
import { BookOpen, Users, ChevronRight, ClipboardCheck, Plus, Zap } from 'lucide-react-native';
import { api, MOCK_CLASSROOMS, identityAPI, useStore, usePermissions, useFeatureAccess } from '@repo/core';
import { useTranslation } from 'react-i18next';
import CreateClassroomModal from './CreateClassroomModal';
import { hapticLight, hapticSuccess } from '@repo/ui';

interface ClassroomListProps {
    onClassroomPress?: (classroom: WorkspaceClassroom) => void;
    onDataLoaded?: (classrooms: WorkspaceClassroom[]) => void;
    isNested?: boolean;
    refreshTrigger?: number;
    emptyContent?: React.ReactNode;
}

type WorkspaceClassroom = Awaited<ReturnType<typeof api.classrooms.getByTeacher>>[number];

async function getSchoolScopedClassroomsForPrincipal(userId: string, pagination: { limit: number; offset: number }) {
    const summary = await api.identity.getClassroomRoleSummary(userId);
    if (!summary.schoolId) {
        return [];
    }

    return api.classrooms.getBySchool(summary.schoolId, pagination);
}

export default function ClassroomList({
    onClassroomPress,
    onDataLoaded,
    isNested = false,
    refreshTrigger: externalRefreshTrigger = 0,
    emptyContent
}: ClassroomListProps) {
    const { can, context } = usePermissions();
    const role = context.roles[0];
    const { isGuest } = useFeatureAccess();
    
    // Capability-based check for classroom creation
    const canCreateClassroom = can('create', 'Classroom');
    const [classrooms, setClassrooms] = useState<WorkspaceClassroom[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [pendingInitialData, setPendingInitialData] = useState<any>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const PAGE_SIZE = 10;
    const toast = useToast();
    const { dismissedSampleIds } = useStore();

    useEffect(() => {
        let isMounted = true;
        const fetchClassrooms = async () => {
            try {
                if (isMounted) {
                    setLoading(true);
                    setError(null);
                }

                let data: WorkspaceClassroom[] = [];

                if (isGuest) {
                    if (can('manage', 'TeacherDashboard')) {
                        const sampleId = 'sample-c1';
                        const sample = MOCK_CLASSROOMS.find((c: any) => c.id === sampleId);
                        if (sample && !dismissedSampleIds.includes(sampleId)) {
                            (sample as any).is_sample = true;
                            data = [sample];
                        }
                    } else if (can('manage', 'PrincipalDashboard')) {
                        const sampleSchoolId = 'sample-school-1';
                        const sampleSchool = MOCK_CLASSROOMS.find((c: any) => c.id === sampleSchoolId);
                        if (sampleSchool && !dismissedSampleIds.includes(sampleSchoolId)) {
                            (sampleSchool as any).is_sample = true;
                            data = [sampleSchool];
                        }
                    } else if (can('manage', 'StudentDashboard') || !role) {
                        const sampleId = 'sample-c1';
                        const sample = MOCK_CLASSROOMS.find((c: any) => c.id === sampleId);
                        if (sample && !dismissedSampleIds.includes(sampleId)) {
                            (sample as any).is_sample = true;
                            data = [sample];
                        }
                    }
                    setHasMore(false);
                } else {
                    const userId = await identityAPI.getMyInternalId();
                    if (!userId) {
                        throw new Error('No internal identity found');
                    }

                    const pagination = { limit: PAGE_SIZE, offset: 0 };
                    let realData: WorkspaceClassroom[] = [];

                    if (can('manage', 'TeacherDashboard')) {
                        realData = await api.classrooms.getByTeacher(userId, pagination);
                    } else if (can('manage', 'StudentDashboard')) {
                        realData = await api.classrooms.getByStudent(userId, pagination);
                    } else if (can('manage', 'PrincipalDashboard')) {
                        realData = await getSchoolScopedClassroomsForPrincipal(userId, pagination);
                    }

                    // If real data exists, use it and ignore samples
                    if (realData.length > 0) {
                        data = realData;
                        setHasMore(realData.length === PAGE_SIZE);
                    } else {
                        // If no real data, try to show sample if not dismissed
                        let sampleToShow: any = null;
                        if (can('manage', 'TeacherDashboard') || can('manage', 'StudentDashboard') || !role) {
                            sampleToShow = MOCK_CLASSROOMS.find((c: any) => c.id === 'sample-c1');
                        } else if (can('manage', 'PrincipalDashboard')) {
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
            const userId = await identityAPI.getMyInternalId();
            if (!userId) return;

            const pagination = { limit: PAGE_SIZE, offset: page * PAGE_SIZE };
            let newData: WorkspaceClassroom[] = [];

            if (can('manage', 'TeacherDashboard')) {
                newData = await api.classrooms.getByTeacher(userId, pagination);
            } else if (can('manage', 'StudentDashboard')) {
                newData = await api.classrooms.getByStudent(userId, pagination);
            } else if (can('manage', 'PrincipalDashboard')) {
                newData = await getSchoolScopedClassroomsForPrincipal(userId, pagination);
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

    const handleClassroomPress = useCallback((classroom: WorkspaceClassroom) => {
        if (onClassroomPress) {
            onClassroomPress(classroom);
        }
    }, [onClassroomPress]);

    const renderClassroomCard = useCallback(({ item: classroom }: { item: WorkspaceClassroom }) => {
        const studentCount = (classroom as any).student_count || 0;

        return (
            <ClassroomCard
                classroom={classroom}
                onPress={handleClassroomPress}
                studentCount={studentCount}
                setIsCreateModalOpen={setIsCreateModalOpen}
                setPendingInitialData={setPendingInitialData}
                toast={toast}
                t={t}
            />
        );
    }, [handleClassroomPress, toast, t]);

    const keyExtractor = useCallback((item: WorkspaceClassroom) => item.id, []);
    const ItemSeparator = useCallback(() => <Box className="h-4" />, []);

    if (loading) {
        return (
            <VStack className={`w-full gap-4 ${isNested ? '' : 'p-4'}`}>
                <SkeletonCard height={90} className="rounded-generous" />
                <SkeletonCard height={90} className="rounded-generous" />
                <SkeletonCard height={90} className="rounded-generous" />
            </VStack>
        );
    }

    if (error) {
        return (
            <Box className="flex-1 justify-center items-center p-8 gap-5">
                <Box className="w-16 h-16 rounded-full bg-emberRed/10 items-center justify-center">
                    <Text className="text-2xl">⚠️</Text>
                </Box>
                <VStack className="gap-2 items-center">
                    <Heading size="xs" className="text-phaseText-primary font-bold">Signal Interrupted</Heading>
                    <Text className="text-phaseText-secondary text-center max-w-[240px] text-xs leading-5">{error}</Text>
                </VStack>
                <Pressable
                    className="bg-templeGold py-3 px-8 rounded-2xl shadow-sm active:opacity-80"
                    onPress={handleRetry}>
                    <Text className="text-white font-bold text-sm">{t('classroom.retry') || 'Retry Sync'}</Text>
                </Pressable>
            </Box>
        );
    }

    if (isNested) {
        return (
            <VStack className="w-full gap-4">
                {classrooms.length === 0 ? (
                    emptyContent || (
                        <PositiveInvitation
                            context="classroom"
                            onAction={() => {
                                hapticLight();
                                if (canCreateClassroom) {
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
                            studentCount={(classroom as any).student_count || 0}
                            setIsCreateModalOpen={setIsCreateModalOpen}
                            setPendingInitialData={setPendingInitialData}
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
        <Box className="flex-1 bg-phase-world">
            {classrooms.length === 0 ? (
                <Box className="flex-1 p-4">
                    <PositiveInvitation
                        context="classroom"
                        onAction={() => {
                            hapticLight();
                            if (canCreateClassroom) {
                                setPendingInitialData(null);
                                setIsCreateModalOpen(true);
                            }
                        }}
                    />
                </Box>
            ) : (
                <>
                    <FlatList
                        data={classrooms}
                        renderItem={renderClassroomCard}
                        keyExtractor={keyExtractor}
                        ItemSeparatorComponent={ItemSeparator}
                        className="flex-1"
                        contentContainerStyle={{ padding: 16 }}
                        showsVerticalScrollIndicator={false}
                        onEndReached={fetchMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={isFetchingMore ? <Spinner className="p-4" /> : <Box className="h-20" />}
                    />

                    {canCreateClassroom && (
                        <Pressable
                            onPress={() => {
                                hapticLight();
                                setPendingInitialData(null);
                                setIsCreateModalOpen(true);
                            }}
                            className="absolute bottom-10 right-6 w-16 h-16 rounded-[24px] bg-templeGold justify-center items-center shadow-lg z-10 active:scale-95"
                        >
                            <Icon as={Plus} size="sm" className="text-white" />
                        </Pressable>
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
    classroom: WorkspaceClassroom;
    onPress: (classroom: WorkspaceClassroom) => void;
    studentCount: number;
    setPendingInitialData: (data: any) => void;
    setIsCreateModalOpen: (isOpen: boolean) => void;
    toast: any;
    t: (key: string) => string;
}

const ClassroomCard = React.memo(({ 
    classroom, 
    onPress, 
    studentCount, 
    setPendingInitialData, 
    setIsCreateModalOpen, 
    toast, 
    t 
}: ClassroomCardProps) => {
    const handlePress = useCallback(() => {
        hapticLight();
        onPress(classroom);
    }, [classroom, onPress]);

    const handleAttendancePress = useCallback((e: any) => {
        e.stopPropagation();
        hapticLight();
    }, []);

    return (
        <Pressable
            onPress={handlePress}
            className="active:opacity-80 transition-all"
        >
            <Box
                className="rounded-generous p-5 border border-phase-canvas/20 bg-phase-surface shadow-sm overflow-hidden relative"
            >
                <HStack className="items-center gap-5">
                    <Box className="w-[60px] h-[60px] rounded-2xl justify-center items-center bg-templeGold/10 border border-templeGold/5">
                        <Icon as={BookOpen} size="sm" className="text-templeGold" />
                    </Box>
 
                    <VStack className="flex-1 gap-1.5">
                        <HStack className="items-center gap-2">
                            <Text className="text-base font-black text-phaseText-primary tracking-tight">
                                {classroom.name}
                            </Text>
                            {(classroom as any).is_sample && (
                                <Box className="bg-templeGold/10 px-2 py-0.5 rounded-full border border-templeGold/20 flex-row items-center gap-1">
                                    <Icon as={Zap} size={8} className="text-templeGold" />
                                    <Text className="text-[9px] text-templeGold font-black uppercase tracking-tighter">
                                        {t('classroom.sample') || 'Sample'}
                                    </Text>
                                </Box>
                            )}
                        </HStack>
                        <HStack className="items-center gap-3">
                            <Text className="text-xs font-black text-templeGold uppercase tracking-widest">
                                {classroom.subject || t('classroom.noSubject') || 'General'}
                            </Text>
                            <Box className="w-1 h-1 rounded-full bg-phaseText-secondary/40" />
                            <HStack className="items-center gap-1.5">
                                <Icon as={Users} size={10} className="text-phaseText-secondary" />
                                <Text className="text-xs font-medium text-phaseText-secondary">
                                    {studentCount}
                                </Text>
                            </HStack>
                        </HStack>
                    </VStack>
 
                    <HStack className="gap-3 items-center">
                        <Pressable onPress={handleAttendancePress} className="active:scale-90">
                            <Box className="p-3 rounded-2xl bg-phase-canvas">
                                <Icon as={ClipboardCheck} size="xs" className="text-sageGreen" />
                            </Box>
                        </Pressable>
    
                        <Icon as={ChevronRight} size="xs" className="text-phaseText-secondary/40" />
                    </HStack>
                </HStack>
            </Box>
        </Pressable>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.classroom.id === nextProps.classroom.id &&
        prevProps.classroom.updated_at === nextProps.classroom.updated_at &&
        prevProps.studentCount === nextProps.studentCount
    );
});
