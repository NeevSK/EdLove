import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore, ClassroomStackParamList, School, handleAPIError } from '@repo/core';
import {
    Box,
    Text,
    VStack,
    HStack,
    Heading,
    ScreenWrapper,
    GlobalHeader,
    useThemedColors,
    Theme,
    LotusPetalFAB,
    SkeletonCard,
    useTheme,
    SanctuaryButton
} from '@repo/ui';
import {
    Activity,
    ArrowUpRight,
    Zap,
    Users,
    Layers,
    Building,
    LayoutGrid,
    PlusCircle
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useClassroomRoleData } from '../hooks/useClassroomRoleData';
import { useEcosystemStats } from '../hooks/useEcosystemStats';
import GlobalCreateModal from '../components/GlobalCreateModal.web';

export default function FounderDashboard() {
    const { t } = useTranslation();
    const { user } = useStore();
    const colors = useThemedColors();
    const { glass, text, accent } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();

    const { stats, schools, isLoading, error, refreshData } = useEcosystemStats();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleCreateSuccess = () => {
        refreshData();
    };

    return (
        <ScreenWrapper>
            <GlobalHeader
                title="Ecosystem Command"
                subtitle={`Welcome, ${user?.full_name || 'Founder'}`}
                rightAction={
                    <HStack sx={{ gap: 12 }}>
                        <SanctuaryButton
                            onPress={() => setIsCreateModalOpen(true)}
                            size="sm"
                            action="primary"
                            // @ts-ignore
                            sx={{ borderRadius: 12 }}
                        >
                            <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                <PlusCircle size={16} color="#fff" />
                                <Text sx={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Initialize New</Text>
                            </HStack>
                        </SanctuaryButton>
                    </HStack>
                }
            />

            <ScrollView
                contentContainerStyle={{ padding: 32 }}
                showsVerticalScrollIndicator={false}
            >
                <VStack sx={{ gap: 32 }}>
                    {/* Ecosystem Pulse - Large Screen Optimization */}
                    <Box sx={{
                        padding: 32,
                        borderRadius: 24,
                        backgroundColor: glass.surface.bg,
                        borderWidth: 1,
                        borderColor: glass.surface.border,
                        // @ts-ignore
                        backdropFilter: `blur(${glass.surface.blur}px)`
                    }}>
                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <VStack sx={{ gap: 4 }}>
                                <Heading sx={{ fontSize: 24, fontWeight: '900', color: text.primary }}>Ecosystem Pulse</Heading>
                                <Text sx={{ color: text.secondary }}>Real-time institutional resonance across Gurudevi</Text>
                            </VStack>
                            <Box sx={{
                                padding: 12,
                                borderRadius: 16,
                                backgroundColor: Theme.colors.sanctuarySaffron + '15'
                            }}>
                                <Activity size={24} color={Theme.colors.sanctuarySaffron} />
                            </Box>
                        </HStack>

                        <HStack sx={{ gap: 24, flexWrap: 'wrap' }}>
                            <PulseStat
                                label="Total Institutions"
                                value={stats?.total_schools || 0}
                                icon={<Building size={20} />}
                                accent={Theme.colors.sanctuarySaffron}
                            />
                            <PulseStat
                                label="Active Classrooms"
                                value={stats?.total_classrooms || 0}
                                icon={<LayoutGrid size={20} />}
                                accent={Theme.colors.gurudeviBlue}
                            />
                            <PulseStat
                                label="Lives Empowered"
                                value={stats?.total_users || 0}
                                icon={<Users size={20} />}
                                accent="#10b981"
                            />
                            <PulseStat
                                label="Knowledge Units"
                                value={642} // Placeholder for now
                                icon={<Layers size={20} />}
                                accent="#8b5cf6"
                            />
                        </HStack>
                    </Box>

                    {/* Institutions Gallery - Desktop Grid */}
                    <VStack sx={{ gap: 20 }}>
                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Heading sx={{ fontSize: 20, fontWeight: '800', color: text.primary }}>Institutional Gallery</Heading>
                            <Text sx={{ color: text.secondary, fontSize: 13 }}>{schools.length} Institutions Tracked</Text>
                        </HStack>

                        {isLoading ? (
                            <HStack sx={{ gap: 20, flexWrap: 'wrap' }}>
                                <SkeletonCard style={{ width: '31%', height: 280 }} />
                                <SkeletonCard style={{ width: '31%', height: 280 }} />
                                <SkeletonCard style={{ width: '31%', height: 280 }} />
                            </HStack>
                        ) : (
                            <View style={webStyles.grid}>
                                {schools.map((school) => (
                                    <SchoolGalleryItem
                                        key={school.id}
                                        school={school}
                                        onPress={() => navigation.navigate('FounderSchoolView', { schoolId: school.id })}
                                    />
                                ))}
                            </View>
                        )}
                    </VStack>
                </VStack>
            </ScrollView>

            <GlobalCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                availableSchools={schools}
                onSuccess={handleCreateSuccess}
            />

            <LotusPetalFAB
                // @ts-ignore
                currentTab="founder"
                onPress={() => setIsCreateModalOpen(true)}
            />
        </ScreenWrapper>
    );
}

function PulseStat({ label, value, icon, accent }: { label: string, value: number, icon: any, accent: string }) {
    const { text, glass } = useTheme();
    return (
        <Box sx={{
            flex: 1,
            minWidth: 200,
            padding: 24,
            borderRadius: 20,
            backgroundColor: glass.surface.bg,
            borderWidth: 1,
            borderColor: glass.surface.border,
            transition: 'all 0.2s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: accent + '60',
                backgroundColor: glass.interact.bg
            }
        }}>
            <HStack sx={{ gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <Box sx={{
                    padding: 8,
                    borderRadius: 12,
                    backgroundColor: accent + '10'
                }}>
                    {React.cloneElement(icon, { color: accent })}
                </Box>
                <Text sx={{ fontSize: 13, color: text.secondary, fontWeight: '600' }}>{label}</Text>
            </HStack>
            <Text sx={{ fontSize: 32, fontWeight: '900', color: text.primary }}>{value.toLocaleString()}</Text>
        </Box>
    );
}

function SchoolGalleryItem({ school, onPress }: { school: School, onPress: () => void }) {
    const { text, glass } = useTheme();
    const colors = useThemedColors();

    return (
        <View style={webStyles.gridItem}>
            <Box
                // @ts-ignore
                onPress={onPress}
                sx={{
                    padding: 24,
                    height: '100%',
                    borderRadius: 24,
                    backgroundColor: glass.surface.bg,
                    borderWidth: 1,
                    borderColor: glass.surface.border,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'scale(1.02) translateY(-4px)',
                        borderColor: Theme.colors.sanctuarySaffron + '80',
                        backgroundColor: glass.interact.bg,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    },
                    cursor: 'pointer'
                }}
            >
                <VStack sx={{ justifyContent: 'space-between', height: '100%' }}>
                    <VStack sx={{ gap: 12 }}>
                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 16,
                                backgroundColor: Theme.colors.sanctuarySaffron + '10',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Building size={28} color={Theme.colors.sanctuarySaffron} />
                            </Box>
                            <ArrowUpRight size={20} color={text.secondary} />
                        </HStack>

                        <VStack sx={{ gap: 4 }}>
                            <Text sx={{ fontSize: 18, fontWeight: '900', color: text.primary }} numberOfLines={2}>
                                {school.name}
                            </Text>
                            <Box sx={{
                                alignSelf: 'flex-start',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 8,
                                // @ts-ignore
                                backgroundColor: colors.accent + '15'
                            }}>
                                <Text sx={{
                                    fontSize: 11,
                                    // @ts-ignore
                                    color: colors.accent,
                                    fontWeight: '800',
                                    textTransform: 'uppercase'
                                }}>
                                    {school.type || 'Institutional'}
                                </Text>
                            </Box>
                        </VStack>
                    </VStack>

                    <HStack sx={{ gap: 16, borderTopWidth: 1, borderTopColor: glass.surface.border, paddingTop: 16 }}>
                        <VStack sx={{ gap: 2 }}>
                            <Text sx={{ fontSize: 11, color: text.secondary, fontWeight: '700' }}>CLASSROOMS</Text>
                            <Text sx={{ fontSize: 16, fontWeight: '800', color: text.primary }}>12</Text>
                        </VStack>
                        <VStack sx={{ gap: 2 }}>
                            <Text sx={{ fontSize: 11, color: text.secondary, fontWeight: '700' }}>MEMBERS</Text>
                            <Text sx={{ fontSize: 16, fontWeight: '800', color: text.primary }}>482</Text>
                        </VStack>
                    </HStack>
                </VStack>
            </Box>
        </View>
    );
}

const webStyles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -10, // Compensation for grid item margin
    },
    gridItem: {
        width: '33.333%',
        padding: 10,
        aspectRatio: 1.2,
    }
});
