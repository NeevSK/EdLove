import React from 'react';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Pressable, 
    Center, 
    Button, 
    ButtonText, 
    Icon,
    Theme,
    hapticLight,
    useThemedColors
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
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
    Search,
    ChevronDown
} from 'lucide-react-native';
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
    // Removed legacy setUserRole call as it's no longer in the store.
    // Authority is derived from the user object.

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
                        { id: 's1', title: "Sample: Grade 10 Math", subtitle: "32 Students, 4 Lessons", icon: BookOpen },
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
                    title: t('classroom.principalInitialTitle') || "Establish Your School",
                    description: t('classroom.principalInitialDesc') || "Create your school on Gurudevi to unlock institutional dashboards, teacher management, and wellbeing analytics.",
                    icon: Compass,
                    primaryAction: t('principal.createSchool') || "Create My School",
                    actionType: 'setup',
                    samples: [
                        { id: 'demo', title: t('classroom.exploreSampleSchool') || "Preview a Demo School", subtitle: t('classroom.seeFullSchoolDemo') || "See a full school dashboard in action", icon: Zap, color: Theme.colors.sanctuarySaffron },
                        { id: 's1', title: "School Health Patterns", subtitle: "Attendance & Wellbeing Trends", icon: Activity, color: Theme.colors.amberGlow },
                        { id: 's2', title: "Staff Management Guide", subtitle: "Inviting Teachers & Section Heads", icon: Users, color: Theme.colors.sageGreen },
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
            case 'platform_admin':
            case 'developer':
                return {
                    title: "Celestial Oversight",
                    description: "Administrative tools for monitoring the entire ecosystem.",
                    icon: Shield,
                    primaryAction: "Admin Dashboard",
                    actionType: 'setup',
                    samples: [
                        { id: 'demo', title: "System Health", subtitle: "Real-time metrics", icon: Activity, color: Theme.colors.sanctuarySaffron },
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
                        { id: 's1', title: "Sample: Grade 10 Math", subtitle: "32 Students, 4 Lessons", icon: BookOpen },
                        { id: 's2', title: "How to Invite Students", subtitle: "Quick Guide", icon: Users, color: Theme.colors.amberGlow },
                    ]
                };
        }
    };

    const content = getRoleContent();

    return (
        <VStack className="flex-1 p-6 gap-8">
            <Center className="p-8">
                <Box
                    className="p-8 rounded-full bg-phase-surface-tertiary mb-6"
                >
                    <Icon as={content.icon} size="lg" className="text-sanctuarySaffron" />
                </Box>
                <Heading className="text-center text-2xl text-phase-text-primary">{content.title}</Heading>
                <Text className="text-center mt-2 text-phase-text-secondary">{content.description}</Text>
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
                className="bg-sanctuarySaffron rounded-xl"
            >
                <HStack className="h-12 items-center justify-center gap-2">
                    <Icon as={Plus} size={20} className="text-white" />
                    <ButtonText className="text-white font-semibold">{content.primaryAction}</ButtonText>
                </HStack>
            </Button>

            {content.samples.length > 0 && (
                <VStack className="gap-4 mt-4">
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-phase-text-secondary">
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
                                className="p-4 rounded-xl bg-phase-surface-secondary border border-phase-border"
                            >
                                <HStack className="items-center gap-4">
                                    <Box
                                        className="p-3 rounded-xl bg-phase-surface-tertiary"
                                    >
                                        <Icon as={item.icon} size={20} className={item.color ? "" : "text-phase-text-primary"} style={item.color ? { color: item.color } : {}} />
                                    </Box>
                                    <VStack className="flex-1">
                                        <Text className="font-bold text-sm text-phase-text-primary">{item.title}</Text>
                                        <Text className="text-xs text-phase-text-secondary">{item.subtitle}</Text>
                                    </VStack>
                                    <Icon as={ArrowRight} size={16} className="text-phase-text-tertiary" />
                                </HStack>
                            </Box>
                        </Pressable>
                    ))}
                </VStack>
            )}
        </VStack>
    );
}
