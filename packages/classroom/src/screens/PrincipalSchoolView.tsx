/**
 * PrincipalSchoolView Component (Enhanced Dashboard)
 * 
 * School Overview Dashboard for Principals
 * Features:
 * - School statistics (students, teachers, classrooms)
 * - Quick actions (Add Section, Invite Staff)
 * - Access to hierarchy builder and invite manager
 * 
 * Mission 04: Principal's Office
 */

import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore, ClassroomStackParamList, useAIAgent } from '@repo/core';
import {
    Box,
    Text,
    Heading,
    VStack,
    HStack,
    SanctuaryButton,
    Button,
    ButtonText,
    ScrollView,
    Icon,
    ScreenWrapper,
    SandboxBanner,
    SkeletonCard,
    GlobalHeader,
    useThemedColors,
    PositiveInvitation,
    hapticLight,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from '@repo/ui';
import {
    Users,
    Zap,
    FileText,
    CalendarCheck,
    AlertCircle,
    NotebookPen,
    School,
    MessageSquare,
    Wind,
    Edit3,
    QrCode
} from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { useGradebook } from '../hooks/useGradebook';
import { useSchoolStats } from '../hooks/useSchoolStats';
import {
    HierarchyBuilder,
    InviteManager,
    ResourceNeedsDashboard,
    DashboardEcho,
    CurriculumPulse,
    PulseDashboard,
    PrincipalAdminWidget,
    MorningSituationalBrief,
    TeacherCarousel,
    StudentPulseSection,
    LeaveApprovalSection,
    InstitutionalCalendarSection,
    PrincipalObservationsSection,
    ManagementStation,
    CreateSchoolModal,
} from '../components';
import { QRCodeGenerator, QRBuilder } from '@repo/scanner-kit';
import PrincipalNotes from '../components/principal/PrincipalNotes';
import AcademicCycleManager from './AcademicCycleManager';
import AttendanceReportScreen from './AttendanceReportScreen';
import RoleInitialState from '../components/RoleInitialState';
import {
    api,
    supabase,
    useUserRole,
    SchoolStats,
    StudentAttendancePulse,
    useFeatureAccess
} from '@repo/core';
import { useRegisterFAB } from '@repo/ui';

interface PrincipalSchoolViewProps {
    schoolId: string;
    userId: string;
    onRefresh?: () => void;
}

export default function PrincipalSchoolView({ schoolId, userId, onRefresh }: PrincipalSchoolViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { isDemoMode } = useStore();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();

    // Resilient Hook
    const { school, stats, isLoading, error, refreshData } = useSchoolStats(schoolId);
    const { generateTimetable, isThinking, lastTimetableDraft } = useAIAgent();
    const { isGuest } = useFeatureAccess();
    const { setBreathingOpen } = useStore();

    const [activeView, setActiveView] = useState<
        'main' | 'hierarchy' | 'invites' | 'notes' | 'cycles' | 'attendance_report'
    >('main');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [linkedGroupId, setLinkedGroupId] = useState<string | null>(null);

    // Register FAB actions globally
    useRegisterFAB({
        tabType: 'principal',
        visible: !isGuest && schoolId !== 'demo-school' && activeView === 'main',
        actions: [
            {
                label: t('principal.actions.hierarchy') || 'Manage Hierarchy',
                onPress: () => setActiveView('hierarchy'),
                icon: Users
            },
            {
                label: t('principal.actions.invites') || 'Manage Invites',
                onPress: () => setActiveView('invites'),
                icon: FileText
            },
            {
                label: t('principal.actions.notes') || 'School Logbook',
                onPress: () => setActiveView('notes'),
                icon: NotebookPen
            }
        ]
    });

    if (activeView === 'hierarchy') {
        return (
            <ScreenWrapper>
                <HierarchyBuilder
                    schoolId={schoolId}
                    onBack={() => setActiveView('main')}
                />
            </ScreenWrapper>
        );
    }

    if (activeView === 'invites') {
        return (
            <ScreenWrapper>
                <InviteManager
                    schoolId={schoolId}
                    userId={userId}
                    onBack={() => setActiveView('main')}
                />
            </ScreenWrapper>
        );
    }

    if (activeView === 'notes') {
        return (
            <PrincipalNotes
                schoolId={schoolId}
                onBack={() => setActiveView('main')}
            />
        );
    }

    if (activeView === 'cycles') {
        return (
            <AcademicCycleManager
                schoolId={schoolId}
                onBack={() => setActiveView('main')}
            />
        );
    }

    if (activeView === 'attendance_report') {
        return (
            <AttendanceReportScreen
                schoolId={schoolId}
                onBack={() => setActiveView('main')}
            />
        );
    }

    const QuickAction = ({ icon: LucideIcon, label, onPress, color, isAgentic }: any) => (
        <TouchableOpacity
            onPress={() => {
                hapticLight();
                onPress();
            }}
            style={{ flex: 1 }}
        >
            <Box
                sx={{
                    alignItems: 'center',
                    backgroundColor: colors.secondary,
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.generous,
                    borderWidth: 1,
                    borderColor: colors.border,
                }}
            >
                <Box
                    sx={{
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                        backgroundColor: colors.tertiary,
                        marginBottom: Theme.spacing.sm,
                        position: 'relative'
                    }}
                >
                    <LucideIcon color={color || Theme.colors.sanctuarySaffron} size={24} />
                    {isAgentic && (
                        <Box sx={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            padding: 2,
                            borderRadius: 10,
                            backgroundColor: Theme.colors.gurudeviBlue
                        }}>
                            <Zap size={8} color="white" fill="white" />
                        </Box>
                    )}
                </Box>
                <Text color={colors.text} sx={{ textAlign: 'center', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
                    {label}
                </Text>
            </Box>
        </TouchableOpacity>
    );

    const StatCard = ({ icon: LucideIcon, label, value, color }: any) => (
        <Box
            sx={{
                flex: 1,
                backgroundColor: colors.secondary,
                padding: Theme.spacing.lg,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <VStack sx={{ zIndex: 1, gap: Theme.spacing.xs }}>
                <Text color={colors.textSecondary} sx={{ fontSize: 12, fontWeight: '700' }}>
                    {label}
                </Text>
                <Text color={colors.text} sx={{ fontSize: 32, fontWeight: '700' }}>
                    {value}{(isDemoMode || isGuest) && '*'}
                </Text>
            </VStack>
            {(isDemoMode || isGuest) && (
                <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                    <Zap size={12} color={Theme.colors.sanctuarySaffron} fill={Theme.colors.sanctuarySaffron} />
                </Box>
            )}
            <Box
                sx={{
                    position: 'absolute',
                    right: -10,
                    bottom: -10,
                    opacity: 0.1
                }}
            >
                <LucideIcon color={colors.text} size={80} />
            </Box>
        </Box>
    );

    return (
        <ScreenWrapper scroll={false} noTopInset={true}>
            {schoolId === 'demo-school' && <SandboxBanner />}
            <GlobalHeader
                title={t('classroom.schoolManagement') || 'School Management'}
                subtitle={school?.name}
            />
            <ScrollView>
                <VStack sx={{ gap: Theme.spacing.lg, padding: Theme.spacing.lg }}>
                    {/* Loading State */}
                    {isLoading && (
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <SkeletonCard height={100} />
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <SkeletonCard height={120} style={{ flex: 1 }} />
                                <SkeletonCard height={120} style={{ flex: 1 }} />
                            </HStack>
                        </VStack>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <Box
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: colors.error,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: colors.border,
                            }}
                        >
                            <Text color={colors.text}>{error}</Text>
                        </Box>
                    )}

                    {/* Morning Brief — first thing principal sees */}
                    <MorningSituationalBrief
                        schoolId={schoolId}
                    />

                    {/* Top-level Topological Organization (Matching Teacher View) */}
                    <Animated.View entering={FadeInDown.delay(100)}>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <Heading color={colors.text} sx={{ fontSize: Theme.typography.fontSize.lg }}>
                                {t('principal.school.commandCenter') || 'Command Center'} 🏛️
                            </Heading>
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <QuickAction
                                    icon={Users}
                                    label={t('principal.actions.hierarchy') || 'Hierarchy'}
                                    onPress={() => setActiveView('hierarchy')}
                                />
                                <QuickAction
                                    icon={FileText}
                                    label={t('principal.actions.invites') || 'Invites'}
                                    onBack={() => setActiveView('main')}
                                    onPress={() => setActiveView('invites')}
                                    color={Theme.colors.sageGreen}
                                />
                                <QuickAction
                                    icon={Wind}
                                    label={t('principal.actions.breathing') || 'Breathing'}
                                    onPress={() => setBreathingOpen(true)}
                                    color={Theme.colors.lotusDeepPink}
                                />
                                <QuickAction
                                    icon={CalendarCheck}
                                    label={t('principal.actions.timetable') || 'Timetable'}
                                    onPress={() => { }} // Timetable logic below
                                    color={Theme.colors.gurudeviBlue}
                                    isAgentic
                                />
                                <QuickAction
                                    icon={NotebookPen}
                                    label={t('principal.actions.notes') || 'Logbook'}
                                    onPress={() => setActiveView('notes')}
                                    color={Theme.colors.sanctuarySaffron}
                                />
                                <QuickAction
                                    icon={Edit3}
                                    label="Edit Details"
                                    onPress={() => setIsCreateModalOpen(true)}
                                    color={Theme.colors.gurudeviBlue}
                                />
                                <QuickAction
                                    icon={QrCode}
                                    label="School QR"
                                    onPress={async () => {
                                        if (!linkedGroupId) {
                                            const { data: groups } = await supabase
                                                .from('community_groups')
                                                .select('id')
                                                .eq('school_id', schoolId)
                                                .limit(1);
                                            
                                            if (groups?.[0]?.id) {
                                                setLinkedGroupId(groups[0].id);
                                            }
                                        }
                                        setIsQrModalOpen(true);
                                    }}
                                    color={Theme.colors.amberGlow}
                                />
                            </HStack>
                        </VStack>
                    </Animated.View>

                    {/* Community HQ Quick Link - Only for real schools */}
                    {schoolId !== 'demo-school' && !isGuest && (
                        <Animated.View entering={FadeInDown.delay(150)}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.lg,
                                    backgroundColor: colors.secondary,
                                    borderRadius: Theme.corners.generous,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    marginBottom: Theme.spacing.md
                                }}
                            >
                                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <VStack sx={{ gap: 4, flex: 1 }}>
                                        <Heading size="sm" color={colors.text}>Community HQ</Heading>
                                        <Text sx={{ fontSize: 13, color: colors.textSecondary }}>
                                            Visit the official community group for your sanctuary.
                                        </Text>
                                    </VStack>
                                    <Button
                                        onPress={async () => {
                                            try {
                                                const { data: groups } = await supabase
                                                    .from('community_groups')
                                                    .select('id')
                                                    .eq('school_id', schoolId)
                                                    .limit(1);
                                                
                                                const groupId = groups?.[0]?.id;
                                                if (groupId) {
                                                    // @ts-ignore
                                                    navigation.navigate('CommunityStack', {
                                                        screen: 'GroupDetails',
                                                        params: { groupId }
                                                    });
                                                } else {
                                                    // @ts-ignore
                                                    navigation.navigate('CommunityStack');
                                                }
                                            } catch (err) {
                                                // @ts-ignore
                                                navigation.navigate('CommunityStack');
                                            }
                                        }}
                                        variant="outline"
                                        size="sm"
                                        sx={{ borderColor: colors.border }}
                                    >
                                        <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                            <Icon as={MessageSquare} size="sm" color={colors.textSecondary} />
                                            <ButtonText color={colors.textSecondary}>Visit HQ</ButtonText>
                                        </HStack>
                                    </Button>
                                </HStack>
                            </Box>
                        </Animated.View>
                    )}

                    {/* Stats Dashboard */}
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <StatCard
                                    icon={Users}
                                    label={t('principal.stats.totalStudents') || 'Students'}
                                    value={stats?.total_students || 0}
                                />
                                <StatCard
                                    icon={Zap}
                                    label={t('principal.stats.totalTeachers') || 'Teachers'}
                                    value={stats?.total_teachers || 0}
                                />
                            </HStack>
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <StatCard
                                    icon={Zap}
                                    label={t('principal.stats.activeClassrooms') || 'Classes'}
                                    value={stats?.total_classrooms || 0}
                                />
                                <StatCard
                                    icon={AlertCircle}
                                    label={t('principal.stats.totalSections') || 'Sections'}
                                    value={stats?.total_sections || 0}
                                />
                            </HStack>
                        </VStack>
                    </Animated.View>

                    {/* Operational Command Center (The Principal's Office) - Existing ManagementStation */}
                    <ManagementStation
                        onAction={(action) => setActiveView(action as any)}
                    />

                    {/* Teacher Faculty Carousel */}
                    <TeacherCarousel
                        schoolId={schoolId}
                    />

                    {/* Student Pulse */}
                    <StudentPulseSection
                        schoolId={schoolId}
                        onViewFullReport={() => setActiveView('attendance_report')}
                    />

                    {/* Leave Approvals */}
                    <LeaveApprovalSection schoolId={schoolId} principalId={userId} />

                    {/* Institutional Calendar */}
                    <InstitutionalCalendarSection schoolId={schoolId} principalId={userId} />

                    {/* Observation Notes */}
                    <PrincipalObservationsSection schoolId={schoolId} principalId={userId} />

                    {/* Timetable Drafting Section */}
                    {stats && (
                        <Box sx={{
                            marginTop: Theme.spacing.md,
                            padding: Theme.spacing.lg,
                            backgroundColor: 'rgba(59, 130, 246, 0.05)',
                            borderRadius: Theme.corners.generous,
                            borderWidth: 1,
                            borderColor: 'rgba(59, 130, 246, 0.2)',
                        }}>
                            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.sm }}>
                                <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                    <CalendarCheck size={20} color={Theme.colors.gurudeviBlue} />
                                    <Text sx={{ fontWeight: '700', color: colors.text }}>Timetable Completion</Text>
                                </HStack>
                                <Box sx={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 12,
                                    backgroundColor: Theme.colors.gurudeviBlue + '33'
                                }}>
                                    <Text sx={{ fontSize: 10, color: Theme.colors.gurudeviBlue, fontWeight: '700' }}>AGENTIC</Text>
                                </Box>
                            </HStack>

                            {lastTimetableDraft ? (
                                <VStack sx={{ gap: 8 }}>
                                    <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                        <AlertCircle size={16} color={Theme.colors.amberGlow} />
                                        <Text sx={{ fontSize: 13, color: colors.text }}>
                                            Draft generated with {lastTimetableDraft.conflicts} conflicts.
                                        </Text>
                                    </HStack>
                                    <SanctuaryButton
                                        onPress={() => console.log('Reviewing draft')}
                                        variant="solid"
                                        size="sm"
                                    >
                                        Review Draft Schedule
                                    </SanctuaryButton>
                                </VStack>
                            ) : (
                                <VStack sx={{ gap: Theme.spacing.md }}>
                                    <Text sx={{ fontSize: 13, color: colors.textSecondary }}>
                                        The annual schedule is incomplete. Your Agent can draft a balanced timetable based on current preferences.
                                    </Text>
                                    <SanctuaryButton
                                        onPress={() => generateTimetable(schoolId)}
                                        action="primary"
                                        size="md"
                                        isLoading={isThinking}
                                    >
                                        {isThinking ? 'Creating Draft...' : 'Draft Annual Timetable'}
                                    </SanctuaryButton>
                                </VStack>
                            )}
                        </Box>
                    )}

                    {/* Institutional Resonance Dashboard */}
                    <PulseDashboard schoolId={schoolId} />

                    {/* Resource Needs Section */}
                    <Box sx={{ marginTop: Theme.spacing.md }}>
                        <ResourceNeedsDashboard schoolId={schoolId} />
                    </Box>

                    {/* School Echo (Feedback Loop) */}
                    <Box sx={{ marginTop: Theme.spacing.lg }}>
                        <DashboardEcho schoolId={schoolId} />
                    </Box>

                    {/* School Creation Invitation - Only for guests or those explicitly in demo school */}
                    {(isGuest || (schoolId === 'demo-school' && !school)) && (
                        <Box sx={{ marginTop: Theme.spacing.xl, marginBottom: Theme.spacing.xl }}>
                            <PositiveInvitation
                                type={isGuest ? 'guest' : 'empty'}
                                title={isGuest ? 'Ready to lead your own institution? 🏫' : 'Establish your own Sanctuary 🌿'}
                                description={isGuest 
                                    ? 'Sign up to create your own school, manage staff, and track student growth with AI-powered insights.'
                                    : 'You are currently exploring a demo. Ready to build your own digital foundations?'
                                }
                                actionLabel={isGuest ? 'Create Your School' : 'Start Creation Flow'}
                                onAction={() => {
                                    hapticLight();
                                    if (isGuest) {
                                        navigation.navigate('Auth' as any);
                                    } else {
                                        setIsCreateModalOpen(true);
                                    }
                                }}
                            />
                        </Box>
                    )}

                    {/* Footer Info */}
                    <HStack sx={{ justifyContent: 'center', gap: Theme.spacing.md, padding: Theme.spacing.lg, paddingBottom: 100 }}>
                        <Icon as={Users as any} color={colors.textTertiary} />
                        <Icon as={FileText as any} color={colors.textTertiary} />
                    </HStack>
                </VStack>
            </ScrollView>

            <CreateSchoolModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                initialData={school ? {
                    id: school.id,
                    name: school.name,
                    handle: school.handle ?? undefined,
                    type: school.type as any
                } : undefined}
                onSuccess={(updatedSchool) => {
                    if (onRefresh) onRefresh();
                    refreshData();
                }}
            />

            {/* School QR Modal */}
            <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.secondary, borderRadius: Theme.corners.generous }}>
                    <ModalHeader>
                        <Heading color={colors.text} sx={{ fontSize: 18 }}>School QR Code</Heading>
                    </ModalHeader>
                    <ModalBody sx={{ alignItems: 'center', paddingVertical: 20 }}>
                        <Box sx={{ padding: 16, backgroundColor: 'white', borderRadius: 16 }}>
                            <QRCodeGenerator
                                value={QRBuilder.school(schoolId, linkedGroupId || '', school?.handle ?? undefined)}
                                size={220}
                            />
                        </Box>
                        <Text color={colors.textSecondary} sx={{ marginTop: 20, textAlign: 'center' }}>
                            Scan to join the <Text color={colors.text} sx={{ fontWeight: 'bold' }}>{school?.name}</Text> sanctuary.
                        </Text>
                        {school?.handle && (
                            <Text color={colors.textTertiary} sx={{ marginTop: 8, fontSize: 12 }}>
                                @{school.handle}
                            </Text>
                        )}
                        {!linkedGroupId && (
                            <Text sx={{ color: Theme.colors.amberGlow, fontSize: 10, marginTop: 4 }}>
                                * Loading community link...
                            </Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button action="primary" onPress={() => setIsQrModalOpen(false)} sx={{ width: '100%', backgroundColor: Theme.colors.sanctuarySaffron }}>
                            <ButtonText color="white">Close</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* School creation is handled via CreateSchoolModal for robust cross-platform experience */}
        </ScreenWrapper >
    );
}
