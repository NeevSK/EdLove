import React from 'react';
import { Box, VStack, HStack, Text, Heading, Pressable, Center, Button, ButtonText } from '@repo/ui';
import {
    BookOpen,
    Plus,
    Users,
    School,
    Compass,
    Shield,
    ArrowRight,
    Star,
    Zap,
    Globe,
    Heart,
    Flower,
    LayoutGrid,
    Activity,
    Search
} from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { hapticLight } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { useStore } from '@repo/core';

interface SampleItem {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    color?: string;
}

interface RoleInitialStateProps {
    role: string;
    onCreatePress?: () => void;
    onJoinPress?: () => void;
    onSamplePress?: (item: SampleItem) => void;
}

export default function RoleInitialState({ role, onCreatePress, onJoinPress, onSamplePress }: RoleInitialStateProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const setDemoMode = useStore((state) => state.setDemoMode);
    const setUserRole = useStore((state) => state.setUserRole);

    console.log('[RoleInitialState] Received role:', role);

    const getRoleContent = () => {
        switch (role) {
            case 'teacher':
                return {
                    title: t('classroom.teacherInitialTitle') || "Welcome to Your Workbench",
                    description: t('classroom.teacherInitialDesc') || "Create your first classroom to start your journey.",
                    icon: School,
                    primaryAction: t('classroom.createFirstClass') || "Create My First Class",
                    actionType: 'create',
                    samples: [
                        { id: 'demo', title: t('classroom.exploreSampleSchool') || "Explore Sample Sanctuary", subtitle: t('classroom.seeFullFeatureDemo') || "See a full school in action", icon: Zap, color: Theme.colors.sanctuarySaffron },
                        { id: 's1', title: "Sample: Grade 10 Math", subtitle: "32 Students • 4 Lessons", icon: BookOpen },
                        { id: 's2', title: "How to Invite Students", subtitle: "Quick Guide", icon: Users, color: Theme.colors.amberGlow },
                    ]
                };
            case 'student':
                return {
                    title: t('classroom.studentInitialTitle') || "Your Learning Sanctuary",
                    description: t('classroom.studentInitialDesc') || "Join a class using a code or explore your potential path.",
                    icon: Flower,
                    primaryAction: t('classroom.joinClass') || "Join a Class",
                    actionType: 'join',
                    samples: [
                        { id: 'demo', title: t('classroom.exploreSampleSchool') || "Explore Sample Sanctuary", subtitle: t('classroom.seeFullFeatureDemo') || "See a full school in action", icon: Zap, color: Theme.colors.sanctuarySaffron },
                        { id: 's1', title: "Sample: Science Exploration", subtitle: "Your first lesson awaits", icon: Star, color: Theme.colors.sageGreen },
                        { id: 's2', title: "Student Handbook", subtitle: "Learning with Gurudevi", icon: BookOpen },
                    ]
                };
            case 'principal':
                return {
                    title: t('classroom.principalInitialTitle') || "School Dashboard",
                    description: t('classroom.principalInitialDesc') || "Initialize your school hierarchy to see institutional patterns.",
                    icon: Compass,
                    primaryAction: t('principal.setupHierarchy') || "Setup School Hierarchy",
                    actionType: 'setup',
                    samples: [
                        { id: 'demo', title: t('classroom.exploreSampleSchool') || "Explore Sample Sanctuary", subtitle: t('classroom.seeFullFeatureDemo') || "See a full school in action", icon: Zap, color: Theme.colors.sanctuarySaffron },
                        { id: 's1', title: "Health Pattern Sample", subtitle: "Attendance Trends", icon: Zap, color: Theme.colors.amberGlow },
                        { id: 's2', title: "Staff Directory Guide", subtitle: "Managing Invites", icon: Globe },
                    ]
                };
            case 'section_head':
                return {
                    title: t('classroom.sectionHeadInitialTitle') || "Section Ecology",
                    description: t('classroom.sectionHeadInitialDesc') || "Monitor wellbeing and academic trends across your section.",
                    icon: LayoutGrid,
                    primaryAction: t('principal.setupHierarchy') || "Manage Section",
                    actionType: 'setup',
                    samples: [
                        { id: 'demo', title: t('classroom.exploreSampleSchool') || "Explore Sample Sanctuary", subtitle: t('classroom.seeFullFeatureDemo') || "See a full school in action", icon: Zap, color: Theme.colors.sanctuarySaffron },
                        { id: 's1', title: "Section Wellness Report", subtitle: "Aggregate insights", icon: Heart, color: Theme.colors.emberRed },
                    ]
                };
            case 'grade_head':
                return {
                    title: t('classroom.gradeHeadInitialTitle') || "Grade Overview",
                    description: t('classroom.gradeHeadInitialDesc') || "Coordinate classes and track progress for your assigned grade.",
                    icon: Users,
                    primaryAction: t('classroom.createClass') || "Manage Grade",
                    actionType: 'setup',
                    samples: [
                        { id: 'demo', title: t('classroom.exploreSampleSchool') || "Explore Sample Sanctuary", subtitle: t('classroom.seeFullFeatureDemo') || "See a full school in action", icon: Zap, color: Theme.colors.sanctuarySaffron },
                        { id: 's1', title: "Grade-wide Analytics", subtitle: "Compare class performance", icon: Activity, color: colors.action },
                    ]
                };
            case 'founder':
                return {
                    title: t('classroom.founderInitialTitle') || "Ecology Oversight",
                    description: t('classroom.founderInitialDesc') || "Visionary metrics will appear here once the ecology evolves.",
                    icon: Compass,
                    primaryAction: t('founder.publishVision') || "Publish First Announcement",
                    actionType: 'setup',
                    samples: [
                        { id: 's1', title: "Vision Manifesto", subtitle: "Philosophy of Care", icon: Heart, color: Theme.colors.emberRed },
                    ]
                };
            default:
                return {
                    title: t('classroom.teacherInitialTitle') || "Welcome to Your Workbench",
                    description: t('classroom.teacherInitialDesc') || "Create your first classroom to start your journey.",
                    icon: School,
                    primaryAction: t('classroom.createFirstClass') || "Create My First Class",
                    actionType: 'create',
                    samples: [
                        { id: 'demo', title: t('classroom.exploreSampleSchool') || "Explore Sample Sanctuary", subtitle: t('classroom.seeFullFeatureDemo') || "See a full school in action", icon: Zap, color: Theme.colors.sanctuarySaffron },
                        { id: 's1', title: "Sample: Grade 10 Math", subtitle: "32 Students • 4 Lessons", icon: BookOpen },
                        { id: 's2', title: "How to Invite Students", subtitle: "Quick Guide", icon: Users, color: Theme.colors.amberGlow },
                    ]
                };
        }
    };

    const content = getRoleContent();

    return (
        <VStack space="xl" sx={{ flex: 1, padding: Theme.spacing.lg }}>
            <Center p="$8">
                <Box
                    sx={{
                        padding: Theme.spacing.xl,
                        borderRadius: Theme.corners.full,
                        backgroundColor: colors.tertiary,
                        marginBottom: Theme.spacing.lg
                    }}
                >
                    <content.icon size={48} color={Theme.colors.sanctuarySaffron} />
                </Box>
                <Heading textAlign="center" color={colors.text} size="xl">{content.title}</Heading>
                <Text textAlign="center" color={colors.textSecondary} mt="$2">{content.description}</Text>
            </Center>

            <Button
                size="lg"
                onPress={() => {
                    hapticLight();
                    if ((content as any).actionType === 'create') {
                        onCreatePress?.();
                    } else if ((content as any).actionType === 'join') {
                        onJoinPress?.();
                    } else {
                        // Fallback: onboarding or setup
                        onCreatePress?.();
                    }
                }}
                sx={{
                    backgroundColor: Theme.colors.sanctuarySaffron,
                    borderRadius: Theme.corners.comfortable
                }}
            >
                <HStack space="sm" alignItems="center" justifyContent="center" sx={{ height: 48 }}>
                    <Plus size={20} color="white" />
                    <ButtonText color="white" sx={{ fontWeight: '600' }}>{content.primaryAction}</ButtonText>
                </HStack>
            </Button>

            {content.samples.length > 0 && (
                <VStack space="md" mt="$4">
                    <Text color={colors.textSecondary} size="xs" bold sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t('common.guidesAndSamples') || "Guides & Samples"}
                    </Text>
                    {content.samples.map((item) => (
                        <Pressable
                            key={item.id}
                            onPress={() => {
                                hapticLight();
                                if (item.id === 'demo') {
                                    setDemoMode(true);
                                } else {
                                    onSamplePress?.(item);
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    padding: Theme.spacing.md,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.secondary,
                                    borderWidth: 1,
                                    borderColor: colors.border
                                }}
                            >
                                <HStack space="md" alignItems="center">
                                    <Box
                                        sx={{
                                            padding: Theme.spacing.sm,
                                            borderRadius: Theme.corners.comfortable,
                                            backgroundColor: colors.tertiary
                                        }}
                                    >
                                        <item.icon size={20} color={item.color || colors.action} />
                                    </Box>
                                    <VStack flex={1}>
                                        <Text color={colors.text} bold size="sm">{item.title}</Text>
                                        <Text color={colors.textSecondary} size="xs">{item.subtitle}</Text>
                                    </VStack>
                                    <ArrowRight size={16} color={colors.textTertiary} />
                                </HStack>
                            </Box>
                        </Pressable>
                    ))}
                </VStack>
            )
            }
        </VStack >
    );
}
