import React, { useEffect, useState, useMemo } from 'react';
import { useWindowDimensions, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import {
    ScreenWrapper,
    GlobalHeader,
    useTheme,
    Theme,
    Box,
    Text,
    HStack,
    VStack,
    Pressable,
    ScrollView,
    Icon as SanctuaryIcon,
    View,
} from '@repo/ui';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    FadeInDown
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
// @ts-ignore - nativewind is added to package.json but may not be indexed yet
import { cssInterop } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import {
    X,
    Globe,
    Orbit,
    Route,
    Network,
    BarChart3,
    Wind,
    FileCheck
} from 'lucide-react-native';
import { libraryAPI } from '../api/library';
import { usePermissions } from '@repo/core';
import { KnowledgeTopology, KnowledgeNode } from '../types/Library';
import { AstroView } from '../components/perspectives/AstroView';
import { VastuView } from '../components/perspectives/VastuView';
import { JyotiView } from '../components/perspectives/JyotiView';
import { TerraView } from '../components/perspectives/TerraView';
import { DharmaView } from '../components/perspectives/DharmaView';
import { VatyaView } from '../components/perspectives/VatyaView';
import { usePerspectiveLayout } from '../hooks/usePerspectiveLayout';
import { getAvailablePerspectives as getEnginePerspectives, KnowledgeParser, CaptureEngine } from '@repo/graphics';

cssInterop(BlurView, { className: 'style' });

type PerspectiveId = 'astro' | 'terra' | 'dharma' | 'vastu' | 'jyoti' | 'vatya';

interface Perspective {
    id: PerspectiveId;
    label: string;
    icon: any;
    description: string;
    disabled?: boolean;
}

const PERSPECTIVES: Perspective[] = [
    { id: 'astro', label: 'Cosmos', icon: Orbit, description: 'Interconnected topology of wisdom' },
    { id: 'terra', label: 'Geo', icon: Globe, description: 'Geographical maps of knowledge' },
    { id: 'dharma', label: 'Path', icon: Route, description: 'Sequential learning pathways' },
    { id: 'vastu', label: 'Structure', icon: Network, description: 'Mind maps & hierarchies' },
    { id: 'jyoti', label: 'Insight', icon: BarChart3, description: 'Analytic charts & metrics' },
    { id: 'vatya', label: 'Vatya', icon: Wind, description: 'Dynamic flow of knowledge' },
];

const getAvailablePerspectives = (topology: any) => {
    if (!topology) return PERSPECTIVES;
    const engineIds = getEnginePerspectives(topology);
    return PERSPECTIVES.map(p => ({
        ...p,
        disabled: !engineIds.includes(p.id)
    }));
};

export default function MapScreen() {
    const theme = useTheme();
    const { can } = usePermissions();
    const navigation = useNavigation();
    const { width, height } = useWindowDimensions();
    
    const [activePerspective, setActivePerspective] = useState<PerspectiveId>('astro');
    const [isExporting, setIsExporting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<KnowledgeTopology | null>(null);
    const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

    // Zoom and Pan state for layout reference (though views handle their own state)
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const topology = await libraryAPI.getMapTopology();
                setData(topology);
            } catch (err) {
                console.error('Failed to fetch map topology:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const activeData = useMemo(() => {
        if (activePerspective === 'astro' && !data?.nodes?.length) {
            return KnowledgeParser.fromMermaid(`
                graph TD
                A[Retina Engine] --> B[Astro View]
                A --> C[Vastu View]
                A --> D[Terra View]
                B --> E[High Performance]
                C --> F[Hierarchical]
                D --> G[Geographical]
            `);
        }
        return data;
    }, [data, activePerspective]);

    const layout = usePerspectiveLayout(activeData as any, { 
        width: width * 3, 
        height: height * 3, 
        perspective: activePerspective 
    });

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const snapshot = CaptureEngine.prepareForCapture(activeData as any);
            console.log('--- NATIVE VISUALIZATION CAPTURED ---');
            console.log('Snapshot Nodes:', snapshot.nodes.length);
            
            Alert.alert(
                "Export Successful",
                "Visualization logic captured for the Student Report.",
                [{ text: "OK" }]
            );
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleNodePress = (node: KnowledgeNode) => {
        setSelectedNode(node);
        const pos = layout?.positions.get(node.id);
        if (pos) {
            translateX.value = withSpring(width / 2 - pos.x);
            translateY.value = withSpring(height / 2.5 - pos.y);
            scale.value = withSpring(2);
        }
    };

    const renderTodayZone = () => {
        if (loading) {
            return (
                <Box className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={Theme.colors.sanctuarySaffron} />
                </Box>
            );
        }

        if (activePerspective === 'astro' && data && layout) {
            return (
                <AstroView 
                    data={data as any} 
                    layout={layout} 
                    onNodePress={handleNodePress as any}
                    selectedNode={selectedNode as any}
                    width={width}
                    height={height}
                />
            );
        }

        if (activePerspective === 'jyoti' && data) {
            return (
                <JyotiView 
                    data={data as any} 
                    layout={layout!} 
                    width={width}
                    height={height}
                />
            );
        }

        if (activePerspective === 'terra' && data) {
            return (
                <TerraView 
                    data={data as any} 
                    layout={layout!} 
                    width={width}
                    height={height}
                />
            );
        }

        if (activePerspective === 'dharma' && data) {
            return (
                <DharmaView 
                    data={data as any} 
                    layout={layout!} 
                    width={width}
                    height={height}
                />
            );
        }

        if (activePerspective === 'vastu' && data && layout) {
            return (
                <VastuView 
                    data={data as any} 
                    layout={layout} 
                    onNodePress={handleNodePress as any}
                    selectedNode={selectedNode as any}
                    width={width}
                    height={height}
                />
            );
        }

        if (activePerspective === 'vatya' && data && layout) {
            return (
                <VatyaView 
                    data={data as any} 
                    layout={layout} 
                    width={width}
                    height={height}
                />
            );
        }

        return (
            <Box className="flex-1 justify-center items-center">
                <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
            </Box>
        );
    };

    const accentColor = theme.accent.action;

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title="Knowledge Cosmos"
                subtitle="Isomorphic Visualization Engine"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={
                    <Pressable 
                        onPress={handleExport}
                        disabled={isExporting}
                        className="flex-row items-center px-4 py-2 rounded-xl mr-3"
                        style={({ pressed }) => ({ 
                            backgroundColor: `${accentColor}20`,
                            opacity: (isExporting || pressed) ? 0.5 : 1,
                        })}
                    >
                        <SanctuaryIcon as={FileCheck} size={18} color={accentColor} className="mr-2" />
                        <Text className="text-xs font-bold" style={{ color: accentColor }}>
                            {isExporting ? '...' : 'EXPORT'}
                        </Text>
                    </Pressable>
                }
            />

            <Box className="p-3 bg-phase-surface">
                <View style={styles.perspectiveSwitcherContainer}>
                    {/* @ts-ignore - className resolved via cssInterop */}
                    <BlurView intensity={30} tint="dark" className="flex-row">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 6 }}>
                            {getAvailablePerspectives(data).map((p) => {
                                const isActive = activePerspective === p.id;
                                const isDisabled = p.disabled;
                                const Icon = p.icon;
                                return (
                                    <Pressable 
                                        key={p.id}
                                        onPress={() => !isDisabled && setActivePerspective(p.id)}
                                        disabled={isDisabled}
                                        style={({ pressed }) => [
                                            styles.perspectiveButton,
                                            isActive && styles.activePerspectiveButton,
                                            isDisabled && { opacity: 0.3 },
                                            pressed && { opacity: 0.8 }
                                        ]}
                                    >
                                        <SanctuaryIcon 
                                            as={Icon}
                                            size={18} 
                                            color={isActive ? Theme.colors.sanctuarySaffron : Theme.colors.starlightGray} 
                                        />
                                        <Text style={[
                                            styles.perspectiveLabel,
                                            isActive && styles.activePerspectiveLabel
                                        ]}>
                                            {p.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </BlurView>
                </View>
            </Box>

            <GestureHandlerRootView style={{ flex: 1 }}>
                <Box className="flex-1 bg-phase-surface overflow-hidden">
                    {renderTodayZone()}

                    {selectedNode && (
                        <Animated.View 
                            entering={FadeInDown}
                            style={styles.nodeSheetContainer}
                        >
                            {/* @ts-ignore - className resolved via cssInterop */}
                            <BlurView intensity={25} tint="dark" className="p-4 rounded-3xl border border-white/5">
                                <VStack className="gap-3">
                                    <HStack className="justify-between items-center">
                                        <VStack>
                                            <Text className="text-xl font-black text-white">
                                                {selectedNode.label}
                                            </Text>
                                            <Text className="text-xs font-bold text-phase-accent uppercase">
                                                {selectedNode.type} \u00B7 {selectedNode.group}
                                            </Text>
                                        </VStack>
                                        <Pressable onPress={() => setSelectedNode(null)}>
                                            <Box className="p-2 rounded-full bg-white/10">
                                                <SanctuaryIcon as={X} size={20} color={theme.text.primary} />
                                            </Box>
                                        </Pressable>
                                    </HStack>

                                    {selectedNode.metadata?.description && (
                                        <Text className="text-sm text-phaseText-secondary leading-5">
                                            {selectedNode.metadata.description}
                                        </Text>
                                    )}

                                    <Pressable 
                                        className="h-14 rounded-[28px] justify-center items-center mt-2 bg-phase-accent active:opacity-90"
                                        onPress={() => {
                                            if (selectedNode.type === 'resource') {
                                                (navigation as any).navigate('ResourceDetail', { id: selectedNode.id });
                                            }
                                        }}
                                    >
                                        <Text className="text-phase-surface font-extrabold">
                                            {selectedNode.type === 'topic' ? 'Explore Knowledge' : 'Begin Learning'}
                                        </Text>
                                    </Pressable>
                                </VStack>
                            </BlurView>
                        </Animated.View>
                    )}
                </Box>
            </GestureHandlerRootView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    perspectiveSwitcherContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    perspectiveButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 4,
        gap: 8,
    },
    activePerspectiveButton: {
        backgroundColor: 'rgba(255, 153, 0, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 153, 0, 0.3)',
    },
    perspectiveLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Theme.colors.starlightGray,
    },
    activePerspectiveLabel: {
        fontWeight: '800',
        color: Theme.colors.sanctuarySaffron,
    },
    nodeSheetContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    }
});

function StatCardNative({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
    return (
        <Box className="flex-1 bg-white/5 p-4 rounded-3xl flex-row items-center gap-3">
            <SanctuaryIcon as={Icon} size={20} color={Theme.colors.sanctuarySaffron} />
            <VStack>
                <Text className="text-[10px] text-phaseText-tertiary">{label}</Text>
                <Text className="text-lg font-black text-white">{value}</Text>
            </VStack>
        </Box>
    );
}
