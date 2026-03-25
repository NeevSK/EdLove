/**
 * PrincipalDashboard Component (Enhanced Dashboard)
 * 
 * School Overview Dashboard for Principals
 * Features:
 * - School statistics (students, teachers, classrooms)
 * - Quick actions (Add Section, Invite Staff)
 * - Access to hierarchy builder and invite manager
 * 
 * Mission 04: Principal's Office
 */

import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore, ClassroomStackParamList, useCapabilities } from '@repo/core';
import { useAIAgent } from '@repo/ai';
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
    MessageSquare,
    Wind,
    Edit3,
    QrCode
} from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { useTranslation } from 'react-i18next';

// L2 Protocols (Untangled via Intents)
import { useSchoolStats } from '../hooks/useSchoolStats';
import CreateSchoolModal from '../components/CreateSchoolModal';
import ResourceNeedsDashboard from '../components/principal/ResourceNeedsDashboard';
import DashboardEcho from '../components/principal/DashboardEcho';
import PulseDashboard from '../components/principal/PulseDashboard';
import PrincipalObservationsSection from '../components/principal/PrincipalObservationsSection';
import ManagementStation from '../components/principal/ManagementStation';
import { QRCodeGenerator, QRBuilder } from '@repo/scanner-kit';
import PrincipalNotes from '../components/principal/PrincipalNotes';
import AcademicCycleManager from './AcademicCycleManager';
import AttendanceReportScreen from './AttendanceReportScreen';
import { useFeatureAccess } from '@repo/core';
import { useRegisterFAB } from '@repo/ui';
import { 
    MorningSituationalBrief, 
    TeacherCarousel, 
    LeaveApprovalSection, 
    InstitutionalCalendarSection 
} from '../components/principal';

interface PrincipalDashboardProps {
    schoolId: string;
    userId: string;
    forceDemo?: boolean;
    onRefresh?: () => void;
}

export default function PrincipalDashboard({ schoolId, userId, forceDemo, onRefresh }: PrincipalDashboardProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { isDemoMode } = useStore();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();

    // Resilient Hook
    const { school, stats, isLoading, error, refreshData } = useSchoolStats(schoolId);
    const { generateTimetable, isThinking, lastTimetableDraft } = useAIAgent();
    const { isGuest } = useFeatureAccess();
    const { policy } = useCapabilities();
    const { setBreathingOpen } = useStore();
    const isDemoExperience = isDemoMode || forceDemo === true;

    const [activeView, setActiveView] = useState<any>('main');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [linkedGroupId, setLinkedGroupId] = useState<string | null>(null);
    const canManageSchool = policy.can('manage', 'School' as any);
    const canManageStaff = policy.can('manage', 'Staff' as any);

    const navigatePrincipalView = (view: any) => {
        if (view === 'main') {
            setActiveView('main');
            return;
        }
        setActiveView(view);
    };

    useEffect(() => {
        if (!canManageSchool && activeView !== 'main') {
            setActiveView('main');
        }
    }, [activeView, canManageSchool]);

    // Register FAB actions globally
    useRegisterFAB({
        tabType: 'principal',
        visible: !isGuest && !isDemoExperience && schoolId !== 'demo-school' && activeView === 'main',
        actions: [
            ...(canManageSchool ? [{
                label: t('principal.actions.hierarchy') || 'Manage Hierarchy',
                onPress: () => navigatePrincipalView('hierarchy'),
                icon: Users
            }] : []),
            ...(canManageStaff ? [{
                label: t('principal.actions.invites') || 'Manage Invites',
                onPress: () => navigatePrincipalView('invites'),
                icon: FileText
            }] : []),
            {
                label: t('principal.actions.notes') || 'School Logbook',
                onPress: () => navigatePrincipalView('notes'),
                icon: NotebookPen
            }
        ]
    });

    const renderWorkspaceView = (view: any) => {
        if (view === 'notes') {
            return (
                <PrincipalNotes
                    schoolId={schoolId}
                    onBack={() => setActiveView('main')}
                />
            );
        }

        if (view === 'cycles') {
            return (
                <AcademicCycleManager
                    schoolId={schoolId}
                    onBack={() => setActiveView('main')}
                />
            );
        }

        if (view === 'attendance_report') {
            return (
                <AttendanceReportScreen
                    schoolId={schoolId}
                    onBack={() => setActiveView('main')}
                />
            );
        }

        return null;
    };

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
                    {value}{(isDemoExperience || isGuest) && '*'}
                </Text>
            </VStack>
            {(isDemoExperience || isGuest) && (
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
            {(schoolId === 'demo-school' || isDemoExperience) && <SandboxBanner />}
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

                    {/* Morning Brief — direct rendering */}
                    <MorningSituationalBrief schoolId={schoolId} />

                    {/* Top-level Topological Organization */}
                    <Animated.View entering={FadeInDown.delay(100)}>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <Heading color={colors.text} sx={{ fontSize: Theme.typography.fontSize.lg }}>
                                {t('principal.school.commandCenter') || 'Command Center'} 🏛️
                            </Heading>
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                {canManageSchool && (
                                    <QuickAction
                                        icon={Users}
                                        label={t('principal.actions.hierarchy') || 'Hierarchy'}
                                        onPress={() => setActiveView('hierarchy')}
                                    />
                                )}
                                {canManageStaff && (
                                    <QuickAction
                                        icon={FileText}
                                        label={t('principal.actions.invites') || 'Invites'}
                                        onBack={() => setActiveView('main')}
                                        onPress={() => setActiveView('invites')}
                                        color={Theme.colors.sageGreen}
                                    />
                                )}
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
                                {canManageSchool && (
                                    <QuickAction
                                        icon={Edit3}
                                        label="Edit Details"
                                        onPress={() => setIsCreateModalOpen(true)}
                                        color={Theme.colors.gurudeviBlue}
                                    />
                                )}
                                <QuickAction
                                    icon={QrCode}
                                    label="School QR"
                                    onPress={() => setIsQrModalOpen(true)}
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
                                            // Community Link handled via Protocol or L3 routing
                                            // @ts-ignore
                                            navigation.navigate('CommunityStack');
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
                    <TeacherCarousel schoolId={schoolId} />

                    {/* Student Pulse */}
                    <PulseDashboard schoolId={schoolId} />

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
        </ScreenWrapper >
    );
}
