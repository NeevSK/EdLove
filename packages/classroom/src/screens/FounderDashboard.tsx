import React, { useState } from 'react';
import { TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    useStore,
    ClassroomStackParamList,
    School
} from '@repo/core';
import {
    Box,
    Text,
    Heading,
    VStack,
    HStack,
    ScrollView,
    ScreenWrapper,
    GlobalHeader,
    SkeletonCard,
    useThemedColors,
    Theme,
    Icon,
    SandboxBanner
} from '@repo/ui';
import {
    Globe,
    Zap,
    Users,
    School as SchoolIcon,
    ChevronRight,
    Search,
    LayoutGrid,
    TrendingUp,
    HeartPulse,
    Plus
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useClassroomRoleData } from '../hooks/useClassroomRoleData';
import { useEcosystemStats } from '../hooks/useEcosystemStats';
import { GlobalCreateModal } from '../components';
import { hapticLight, useRegisterFAB } from '@repo/ui';
import { Wind } from 'lucide-react-native';

const { width } = Dimensions.get('window');

/**
 * FounderDashboard Component
 * 
 * High-level platform overview for Founders/Admins.
 * Features:
 * - Ecosystem Pulse (Aggregate Stats)
 * - School Gallery (Cross-school navigation)
 * - Executive Insights
 */
export default function FounderDashboard() {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { isDemoMode } = useStore();
    const user = useStore(state => state.user);
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();

    const { stats, schools, isLoading, error, refreshData } = useEcosystemStats();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredSchools = schools.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateSuccess = (type: string, data: any) => {
        console.log(`Successfully created ${type}:`, data);
        refreshData();
    };

    // Register FAB globally
    useRegisterFAB({
        tabType: 'founder',
        onPress: () => setIsCreateModalOpen(true),
        icon: <Plus size={24} color="#FFF" />,
        visible: true
    });

    return (
        <ScreenWrapper>
            {isDemoMode && <SandboxBanner />}
            <GlobalHeader
                title={t('founder.platformDashboard') || 'Platform Dashboard'}
                subtitle={t('founder.ecosystemTitle') || 'The Gurudevi Ecology'}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <VStack sx={{ padding: Theme.spacing.lg, gap: Theme.spacing.xl }}>

                    {/* 1. Ecosystem Pulse (Aggregate Stats) */}
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Heading sx={{ fontSize: 18, fontWeight: '700' }} color={colors.text}>
                                Ecosystem Pulse
                            </Heading>
                            <HStack sx={{ gap: 4, alignItems: 'center' }}>
                                <HeartPulse size={16} color={colors.success} />
                                <Text sx={{ fontSize: 12, fontWeight: '600' }} color={colors.success}>
                                    Health: {stats?.ecosystem_health || 0}%
                                </Text>
                            </HStack>
                        </HStack>

                        {/* Quick Access to Main School */}
                        {schools.find(s => s.id === user?.school_id) && (
                            <TouchableOpacity
                                onPress={() => {
                                    const schoolId = user?.school_id || schools.find(s => s.id === user?.school_id)?.id;

                                    if (schoolId) {
                                        navigation.navigate('FounderSchoolView', {
                                            schoolId: schoolId,
                                            userId: user?.id || 'founder-id'
                                        });
                                    }

                                }}
                            >
                                <Box sx={{
                                    padding: Theme.spacing.md,
                                    backgroundColor: Theme.colors.sanctuarySaffron + '11',
                                    borderRadius: Theme.corners.comfortable,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.sanctuarySaffron,
                                    marginBottom: Theme.spacing.md
                                }}>
                                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center' }}>
                                            <SchoolIcon size={24} color={Theme.colors.sanctuarySaffron} />
                                            <VStack>
                                                <Text sx={{ fontWeight: '700' }} color={colors.text}>Manage My Institution</Text>
                                                <Text sx={{ fontSize: 12 }} color={colors.textSecondary}>Full principal oversight for your school</Text>
                                            </VStack>
                                        </HStack>
                                        <ChevronRight size={20} color={colors.textTertiary} />
                                    </HStack>
                                </Box>
                            </TouchableOpacity>
                        )}


                        {isLoading ? (
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <SkeletonCard height={80} style={{ flex: 1 }} />
                                <SkeletonCard height={80} style={{ flex: 1 }} />
                            </HStack>
                        ) : (
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <StatCard
                                    label="Total Schools"
                                    value={stats?.total_schools || 0}
                                    icon={<SchoolIcon size={20} color={colors.action} />}
                                    color={colors.action}
                                />
                                <StatCard
                                    label="Total Souls"
                                    value={stats?.total_users || 0}
                                    icon={<Users size={20} color={colors.success} />}
                                    color={colors.success}
                                />
                            </HStack>
                        )}

                        {!isLoading && (
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <StatCard
                                    label="Classrooms"
                                    value={stats?.total_classrooms || 0}
                                    icon={<LayoutGrid size={20} color={colors.warning} />}
                                    color={colors.warning}
                                />
                                <StatCard
                                    label="Teachers"
                                    value={stats?.total_teachers || 0}
                                    icon={<Zap size={20} color={Theme.colors.sanctuarySaffron} />}
                                    color={Theme.colors.sanctuarySaffron}
                                />
                            </HStack>
                        )}

                        {/* Quick Actions */}
                        <HStack sx={{ gap: Theme.spacing.md, marginTop: Theme.spacing.sm }}>
                            <QuickAction
                                icon={Wind}
                                label={t('founder.breathing') || 'Breathing Reset'}
                                onPress={() => {
                                    const { setBreathingOpen } = useStore.getState();
                                    setBreathingOpen(true);
                                }}
                                color={Theme.colors.lotusDeepPink}
                            />
                            {/* Placeholder for future founder quick actions */}
                            <Box sx={{ flex: 1 }} />
                            <Box sx={{ flex: 1 }} />
                        </HStack>
                    </VStack>

                    {/* 2. School Gallery */}
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Heading sx={{ fontSize: 18, fontWeight: '700' }} color={colors.text}>
                                Institutions
                            </Heading>
                            <Box sx={{
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 12,
                                backgroundColor: colors.secondary
                            }}>
                                <Text sx={{ fontSize: 12 }} color={colors.textSecondary}>
                                    {filteredSchools.length} Registered
                                </Text>
                            </Box>
                        </HStack>

                        {isLoading ? (
                            <VStack sx={{ gap: Theme.spacing.md }}>
                                <SkeletonCard height={100} />
                                <SkeletonCard height={100} />
                            </VStack>
                        ) : (
                            <VStack sx={{ gap: Theme.spacing.md }}>
                                {filteredSchools.map((school) => (
                                    <SchoolGalleryItem
                                        key={school.id}
                                        school={school}
                                        onPress={() => {
                                            navigation.navigate('FounderSchoolView', {
                                                schoolId: school.id,
                                                userId: stats?.total_users ? 'founder-id' : 'founder-id' // Ideally pass real user id from store
                                            });
                                        }}
                                    />
                                ))}

                                {filteredSchools.length === 0 && (
                                    <Box sx={{
                                        padding: Theme.spacing.xl,
                                        alignItems: 'center',
                                        backgroundColor: colors.secondary,
                                        borderRadius: Theme.corners.comfortable,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        borderStyle: 'dashed'
                                    }}>
                                        <Text color={colors.textTertiary}>No institutions found</Text>
                                    </Box>
                                )}
                            </VStack>
                        )}
                    </VStack>

                </VStack>
            </ScrollView>

            <GlobalCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
                availableSchools={schools}
            />

        </ScreenWrapper>
    );
}

/**
 * QuickAction Sub-component
 */
function QuickAction({ icon: LucideIcon, label, onPress, color }: { icon: any, label: string, onPress: () => void, color: string }) {
    const colors = useThemedColors();
    return (
        <VStack alignItems="center" sx={{ flex: 1, gap: Theme.spacing.xs }}>
            <TouchableOpacity
                onPress={() => {
                    hapticLight();
                    onPress();
                }}
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: Theme.corners.comfortable,
                    backgroundColor: colors.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border
                }}
            >
                <LucideIcon color={color} size={28} />
            </TouchableOpacity>
            <Text color={colors.text} sx={{ textAlign: 'center', fontSize: 11, fontWeight: '700' }}>
                {label}
            </Text>
        </VStack>
    );
}

/**
 * StatCard Sub-component
 */
function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
    const colors = useThemedColors();
    return (
        <Box sx={{
            flex: 1,
            padding: Theme.spacing.lg,
            backgroundColor: colors.secondary,
            borderRadius: Theme.corners.comfortable,
            borderLeftWidth: 4,
            borderLeftColor: color
        }}>
            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                {icon}
            </HStack>
            <Text sx={{ fontSize: 24, fontWeight: '800' }} color={colors.text}>
                {value.toLocaleString()}
            </Text>
            <Text sx={{ fontSize: 11, fontWeight: '600' }} color={colors.textTertiary}>
                {label.toUpperCase()}
            </Text>
        </Box>
    );
}

/**
 * SchoolGalleryItem Sub-component
 */
function SchoolGalleryItem({ school, onPress }: { school: School, onPress: () => void }) {
    const colors = useThemedColors();
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Box sx={{
                padding: Theme.spacing.md,
                backgroundColor: colors.secondary,
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: colors.border
            }}>
                <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center' }}>
                    <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: colors.action + '22',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <SchoolIcon size={24} color={colors.action} />
                    </Box>
                    <VStack sx={{ flex: 1 }}>
                        <Text sx={{ fontWeight: '700', fontSize: 16 }} color={colors.text}>
                            {school.name}
                        </Text>
                        <Text sx={{ fontSize: 12 }} color={colors.textSecondary}>
                            {school.type} • {school.id.substring(0, 8)}...
                        </Text>
                    </VStack>
                    <ChevronRight size={20} color={colors.textTertiary} />
                </HStack>
            </Box>
        </TouchableOpacity>
    );
}
