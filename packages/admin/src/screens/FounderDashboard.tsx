import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    useStore,
    FounderStackParamList,
    School
} from '@repo/core';
import { useFounderEcosystemStats } from '../bridge/founderWorkspace';
import {
    Box,
    Text,
    Heading,
    VStack,
    HStack,
    ScrollView,
    ScreenWrapper,
    GlobalHeader,
    Icon,
    useRegisterFAB,
    Pressable,
    Spinner
} from '@repo/ui';
import {
    Users,
    School as SchoolIcon,
    ChevronRight,
    LayoutGrid,
    HeartPulse,
    Plus,
    Wind,
    Zap
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { GlobalCreateModal } from '../components';

export default function FounderDashboard() {
    const { t } = useTranslation();
    const { isDemoMode, user, setBreathingOpen } = useStore();
    const navigation = useNavigation<NativeStackNavigationProp<FounderStackParamList>>();

    const { stats, schools, isLoading, refreshData } = useFounderEcosystemStats();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredSchools = (schools || []).filter(s =>
        s?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateSuccess = (type: string, data: any) => {
        console.log(`Successfully created ${type}:`, data);
        refreshData();
    };

    // Register FAB globally
    useRegisterFAB({
        tabType: 'founder',
        onPress: () => setIsCreateModalOpen(true),
        icon: <Icon as={Plus} size={24} color="#FFF" />,
        visible: true
    });

    return (
        <ScreenWrapper>
            <GlobalHeader
                title={t('founder.platformDashboard') || 'Platform Dashboard'}
                subtitle={t('founder.ecosystemTitle') || 'The Gurudevi Ecology'}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <VStack className="p-5 gap-8">
                    {/* 1. Ecosystem Pulse */}
                    <VStack className="gap-4">
                        <HStack className="justify-between items-center">
                            <Heading className="text-xl font-bold text-ink">
                                Ecosystem Pulse
                            </Heading>
                            <Box className="flex-row items-center gap-2 bg-phase-warning/10 px-3 py-1.5 rounded-full">
                                <Icon as={HeartPulse} size={16} className="text-primary" />
                                <Text className="text-xs font-black text-primary">
                                    Health: {stats?.ecosystem_health || 0}%
                                </Text>
                            </Box>
                        </HStack>

                        {/* Quick Access to Main School */}
                        {schools.find(s => s.id === user?.school_id) && (
                            <Pressable
                                onPress={() => {
                                    const schoolId = user?.school_id;
                                    if (schoolId) {
                                        navigation.navigate('FounderSchoolDashboard', {
                                            schoolId: schoolId,
                                            userId: user?.id || 'founder-id'
                                        });
                                    }
                                }}>
                                <Box className="p-4 bg-primary/5 rounded-3xl border border-primary/20">
                                    <HStack className="justify-between items-center">
                                        <HStack className="gap-4 items-center flex-1">
                                            <Box className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center">
                                                <Icon as={SchoolIcon} size={24} className="text-primary" />
                                            </Box>
                                            <VStack className="flex-1">
                                                <Text className="font-bold text-ink">Manage My Institution</Text>
                                                <Text className="text-xs text-ink/60">Full principal oversight for your school</Text>
                                            </VStack>
                                        </HStack>
                                        <Icon as={ChevronRight} size={20} className="text-ink/30" />
                                    </HStack>
                                </Box>
                            </Pressable>
                        )}

                        {isLoading ? (
                            <HStack className="gap-4">
                                <Box className="flex-1 h-24 bg-ink/5 rounded-3xl animate-pulse items-center justify-center">
                                    <Spinner />
                                </Box>
                                <Box className="flex-1 h-24 bg-ink/5 rounded-3xl animate-pulse items-center justify-center">
                                    <Spinner />
                                </Box>
                            </HStack>
                        ) : (
                            <VStack className="gap-4">
                                <HStack className="gap-4">
                                    <StatCard
                                        label="Total Schools"
                                        value={stats?.total_schools || 0}
                                        icon={<Icon as={SchoolIcon} size={20} />}
                                        variant="primary"
                                    />
                                    <StatCard
                                        label="Total Souls"
                                        value={stats?.total_users || 0}
                                        icon={<Icon as={Users} size={20} />}
                                        variant="success"
                                    />
                                </HStack>
                                <HStack className="gap-4">
                                    <StatCard
                                        label="Classrooms"
                                        value={stats?.total_classrooms || 0}
                                        icon={<Icon as={LayoutGrid} size={20} />}
                                        variant="warning"
                                    />
                                    <StatCard
                                        label="Teachers"
                                        value={stats?.total_teachers || 0}
                                        icon={<Icon as={Zap} size={20} />}
                                        variant="accent"
                                    />
                                </HStack>
                            </VStack>
                        )}

                        {/* Quick Actions */}
                        <HStack className="gap-4 mt-2">
                            <QuickAction
                                icon={Wind}
                                label={t('founder.breathing') || 'Breathing Reset'}
                                onPress={() => setBreathingOpen(true)}
                                color="#D4843A"
                            />
                            <Box className="flex-1" />
                            <Box className="flex-1" />
                        </HStack>
                    </VStack>

                    {/* 2. School Gallery */}
                    <VStack className="gap-4">
                        <HStack className="justify-between items-center">
                            <Heading className="text-xl font-bold text-ink">
                                Institutions
                            </Heading>
                            <Box className="px-3 py-1 bg-ink/5 rounded-full">
                                <Text className="text-xs text-ink/60 font-bold">
                                    {filteredSchools.length} Registered
                                </Text>
                            </Box>
                        </HStack>

                        {isLoading ? (
                            <VStack className="gap-4">
                                <Box className="w-full h-24 bg-ink/5 rounded-3xl animate-pulse items-center justify-center">
                                    <Spinner />
                                </Box>
                                <Box className="w-full h-24 bg-ink/5 rounded-3xl animate-pulse items-center justify-center">
                                    <Spinner />
                                </Box>
                            </VStack>
                        ) : (
                            <VStack className="gap-3">
                                {filteredSchools.map((school) => (
                                    <SchoolGalleryItem
                                        key={school.id}
                                        school={school}
                                        onPress={() => {
                                            navigation.navigate('FounderSchoolDashboard', {
                                                schoolId: school.id,
                                                userId: 'founder-id'
                                            });
                                        }}
                                    />
                                ))}

                                {filteredSchools.length === 0 && (
                                    <Box className="p-10 items-center justify-center bg-ink/5 rounded-3xl border border-dashed border-border">
                                        <Text className="text-ink/40 font-bold">No institutions found</Text>
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

function QuickAction({ icon, label, onPress, color }: { icon: any, label: string, onPress: () => void, color: string }) {
    return (
        <VStack className="flex-1 gap-2 items-center">
            <Pressable
                onPress={onPress}
                className="w-16 h-16 rounded-[20px] bg-white border border-border items-center justify-center shadow-sm active:scale-95">
                <Icon as={icon} color={color} size={28} />
            </Pressable>
            <Text className="text-center text-[11px] font-bold text-ink">
                {label}
            </Text>
        </VStack>
    );
}

function StatCard({ label, value, icon, variant }: { label: string, value: number, icon: React.ReactNode, variant: 'primary' | 'success' | 'warning' | 'accent' }) {
    const variantClasses = {
        primary: 'border-primary/30 text-primary bg-primary/5',
        success: 'border-green-500/30 text-green-600 bg-green-500/5',
        warning: 'border-amber-500/30 text-amber-600 bg-amber-500/5',
        accent: 'border-orange-500/30 text-orange-600 bg-orange-500/5'
    };

    return (
        <Box className={`flex-1 p-5 rounded-3xl border ${variantClasses[variant]}`}>
            <Box className="mb-2 opacity-60">
                {icon}
            </Box>
            <Text className="text-2xl font-black text-ink">
                {value.toLocaleString()}
            </Text>
            <Text className="text-[10px] font-extrabold uppercase tracking-widest text-ink/40 mt-1">
                {label}
            </Text>
        </Box>
    );
}

function SchoolGalleryItem({ school, onPress }: { school: School, onPress: () => void }) {
    return (
        <Pressable onPress={onPress}>
            <Box className="p-4 bg-white rounded-3xl border border-border flex-row items-center gap-4 active:bg-ink/5">
                <Box className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center">
                    <Icon as={SchoolIcon} size={24} className="text-primary" />
                </Box>
                <VStack className="flex-1">
                    <Text className="font-bold text-base text-ink">
                        {school.name}
                    </Text>
                    <Text className="text-xs text-ink/60">
                        {school.type} • {school.id.substring(0, 8)}...
                    </Text>
                </VStack>
                <Icon as={ChevronRight} size={20} className="text-ink/30" />
            </Box>
        </Pressable>
    );
}

