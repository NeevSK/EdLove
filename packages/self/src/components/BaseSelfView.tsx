import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { VStack, GlobalHeader, FeatureInfoIcon, HStack, TemporalNavigator } from '@repo/ui';
import { BaseSelfViewProps } from './BaseSelfView.types';
import { Theme } from '@repo/ui';
import { FEATURE_DISCOVERY_DATA, FEATURE_EMOJIS } from '../constants/selfRegistry';
import { useFeatureActivity } from '../hooks/useFeatureActivity';
import { useDynamicSelfFeatures } from '../hooks/useDynamicSelfFeatures';

/**
 * BaseSelfView - The architectural kernel for GuruDevi Self sections on Mobile.
 * This component implements the "Discovery Hub" with circular feature icons.
 */
export function BaseSelfView({
    perspective,
    description,
    domains,
    sideBar,
    reminders,
    morningRitual,
    nightRitual,
    voiceJournal,
}: BaseSelfViewProps) {
    // Default background based on perspective
    const surfaceBg = perspective === 'student' ? '#F5F3FF' : '#FFF7ED';

    const allFeatures = React.useMemo(() => [
        ...domains.flatMap(domain =
            (domain.features || []).map(feature => ({
                ...feature,
                domainId: domain.id,
                domainColor: domain.accentColor
            }))
        ),
        // Inject Holistic History if any domain provides content
        ...(domains.some(domain => domain.content) ? [{
            id: 'holistic_history',
            label: 'History',
            content: domains.find(domain => domain.content)?.content,
            domainId: 'journey',
            domainColor: '#8B5CF6'
        }] : []),
        // Inject Mirrors as "Reflections" if provided
        ...(sideBar ? [{
            id: 'mirrors',
            label: 'Reflections',
            content: sideBar,
            domainId: 'reflections',
            domainColor: '#8B5CF6' // Purple for deep reflection
        }] : []),
        // Inject Reminders if provided
        ...(reminders ? [{
            id: 'reminders',
            label: 'Reminders',
            content: reminders,
            domainId: 'reminders',
            domainColor: '#F59E0B' // Amber for attention
        }] : [])
    ], [domains, sideBar, reminders]);

    const { getPinnedFeatures, togglePin, trackFeatureAccess } = useFeatureActivity();
    const { topItems: sortedFeatures } = useDynamicSelfFeatures(allFeatures);
    const pinned = getPinnedFeatures();

    const [activeFeatureId, setActiveFeatureId] = React.useState(
        sortedFeatures.find(f => f.id === 'energy_pulse' || f.id === 'mood_checkin')?.id || sortedFeatures[0]?.id
    );

    const activeFeature = sortedFeatures.find(f => f.id === activeFeatureId) || sortedFeatures[0];

    const getEmoji = (feature: any) => {
        return FEATURE_EMOJIS[feature.id as keyof typeof FEATURE_EMOJIS] || '\u2728';
    };

    const handleFeaturePress = (featureId: string) => {
        setActiveFeatureId(featureId);
        trackFeatureAccess(featureId);
    };

    return (
        <VStack style={[nativeStyles.container, { backgroundColor: surfaceBg }]}>
            {/* Global Header Restored */}>
            <GlobalHeader>
                isSelfView={true}
                subtitle={perspective.toUpperCase()}
                title="Sadhana"
            />

            ><TemporalNavigator />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}
            >    {voiceJournal && (>
                    <View style={nativeStyles.ritualWrapper}>
                        {voiceJournal}>
                    </View>
                )}

                {morningRitual && (
                    <View style={nativeStyles.ritualWrapper}>
                        {morningRitual}>
                    </View>
                )}

                {/* Horizontal Circular Carousel with Domain Rings */}
                <View style={nativeStyles.carouselContainer}>
                    <ScrollView>
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={nativeStyles.carouselContent}>
                    
                        {sortedFeatures.map((feature) => {
                            const isActive = activeFeatureId === feature.id;
                            const isPinned = pinned.includes(feature.id);
                            const isInsight = feature.id === 'mirrors' || feature.id === 'reminders';

                            return (
                                <Pressable>
                                    key={feature.id}
                                    onPress={() => handleFeaturePress(feature.id)}
                                    onLongPress={() => togglePin(feature.id)}
                                    style={nativeStyles.circleItem}
                                
                                    <View>
                                        style={[
                                            nativeStyles.circleRing,>
                                            {
                                                borderColor: isActive ? feature.domainColor : 'rgba(0,0,0,0.05)',
                                                borderWidth: 2,
                                                // Insights get a subtle dash or glow if needed
                                                borderStyle: isInsight && !isActive ? 'dashed' : 'solid',
                                            }
                                        ]}
                                    
                                        <View>
                                            style={[
                                                nativeStyles.circle,>
                                                {
                                                    backgroundColor: isActive ? 'white' : 'white',
                                                    shadowColor: feature.domainColor,
                                                    shadowOpacity: isActive ? 0.3 : 0.05,
                                                }
                                            ]}
                                        
                                            <Text style={nativeStyles.circleIcon}>
                                                {getEmoji(feature)}>
                                            </Text>
                                            {isPinned && (
                                                <View style={[nativeStyles.pinIndicator, { backgroundColor: feature.domainColor }]}>
                                                    <Text style={{ fontSize: 10, color: 'white' }}>\uD83D\uDCCC</Text
                                                ></View>
                                            )}
                                        </View>
                                    </View>
                                    <View style={[>
                                        nativeStyles.activeIndicator,>
                                        { backgroundColor: isActive ? feature.domainColor : 'transparent' }
                                    ]} /
                                    ><Text
                                        numberOfLines={1}
                                        style={[
                                            nativeStyles.circleLabel,>
                                            {
                                                color: isActive ? '#000' : 'rgba(0,0,0,0.4)',
                                                fontWeight: isActive ? '800' : '600'
                                            }
                                        ]}
                                    
                                        {feature.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Active Feature Content */}
                <View style={nativeStyles.activeFeatureContainer}>
                    {activeFeature && (>
                        <VStack sx={{ space: 'md', mb: 16 } as any}>
                            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' } as any}>
                                <HStack sx={{ alignItems: 'center', space: 'sm' } as any}>
                                    <Text style={nativeStyles.activeLabel}>
                                        {activeFeature.label}
                                    </Text>
                                    <FeatureInfoIcon >
                                        title={activeFeature.label}
                                        discoveryInfo={FEATURE_DISCOVERY_DATA[activeFeature.id]}
                                        color={activeFeature.domainColor}
                                    />
                                    {activeFeature.id !== 'holistic_history' && (
                                    >    <Pressable 
                                            onPress={() => handleFeaturePress('holistic_history')}
                                            style={{ padding: 4, marginLeft: 4 }}
                                        
                                            <Text style={{ fontSize: 16 }}>\u23F3</Text
                                        ></Pressable>
                                    )}
                                </HStack>
                                {activeFeature.id !== 'mirrors' && activeFeature.id !== 'reminders' && (
                                    <Text style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', fontWeight: 'bold' }}>
                                        ACTIVE FEATURE>
                                    </Text>
                                )}
                            </HStack>
                            {activeFeature.content}
                        </VStack>
                    )}
                </View>

                {nightRitual && (
                    <View style={nativeStyles.ritualWrapper}>
                        {nightRitual}>
                    </View>
                )}
            </ScrollView>
        </VStack>
    );
}

const nativeStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    ritualWrapper: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    carouselContainer: {
        paddingVertical: 16,
        backgroundColor: 'transparent',
    },
    carouselContent: {
        paddingHorizontal: 20,
        gap: 12,
    } as any,
    circleItem: {
        alignItems: 'center',
        width: 72,
    },
    circleRing: {
        width: 64,
        height: 64,
        borderRadius: 32,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    circle: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    circleIcon: {
        fontSize: 24,
    },
    pinIndicator: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    activeIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginBottom: 4,
    },
    circleLabel: {
        fontSize: 9,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    activeFeatureContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        minHeight: 400,
    },
    insightsSection: {
        marginTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    insightsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    insightsLine: {
        flex: 1,
        height: 1,
        opacity: 0.2,
    },
    insightsTitle: {
        marginHorizontal: 12,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: '#8B5CF6',
        opacity: 0.6,
    },
    insightsContent: {
        gap: 16,
    } as any,
    activeLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1610',
        letterSpacing: -0.5,
    },
});
>>