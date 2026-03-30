import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, TouchableOpacity, FlatList, ActivityIndicator, ScrollView, Alert } from 'react-native';
import {
    ScreenWrapper,
    GlobalHeader,
    useThemedColors,
    Theme,
    Box,
    Text,
    HorizontalChipRow,
    HStack,
    VStack,
} from '@repo/ui';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    FadeIn,
    FadeOut,
    FadeInDown
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import {
    X,
    Globe,
    Orbit,
    Route,
    Network,
    BarChart3,
    Wind,
    FileCheck,
    Compass,
    Search
} from 'lucide-react-native';
import { libraryAPI } from '../api/library';
import { usePermissions } from '@repo/core';
import { SRI_LANKAN_PROVINCES, SRI_LANKAN_DISTRICTS } from '@repo/core';
import { KnowledgeTopology, KnowledgeNode } from '../types/Library';
import { AstroView } from '../components/perspectives/AstroView';
import { VastuView } from '../components/perspectives/VastuView';
import { JyotiView } from '../components/perspectives/JyotiView';
import { TerraView } from '../components/perspectives/TerraView';
import { DharmaView } from '../components/perspectives/DharmaView';
import { VatyaView } from '../components/perspectives/VatyaView'; // Added VatyaView import
import { usePerspectiveLayout } from '../hooks/usePerspectiveLayout';
import { getAvailablePerspectives as getEnginePerspectives, KnowledgeParser, CaptureEngine } from '@repo/graphics';

type PerspectiveId = 'astro' | 'terra' | 'dharma' | 'vastu' | 'jyoti' | 'vatya'; // Added 'vatya'

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
    { id: 'vatya', label: 'Vatya', icon: Wind, description: 'Dynamic flow of knowledge' }, // Added Vatya perspective
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
    const colors = useThemedColors();
    const { can } = usePermissions();
    const navigation = useNavigation();
    const { width, height } = useWindowDimensions();
    
    const [activePerspective, setActivePerspective] = useState<PerspectiveId>('astro');
    const [isExporting, setIsExporting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<KnowledgeTopology | null>(null);
    const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
    const [geoData, setGeoData] = useState<any[] | null>(null);
    const [geoQueryLoading, setGeoQueryLoading] = useState(false);

    // Zoom and Pan state
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

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

        const fetchGeoData = async () => {
            if (geoData) return;
            setGeoQueryLoading(true);
            try {
                const schools = await libraryAPI.getGeoTopology();
                setGeoData(schools);
            } catch (err) {
                console.error('Failed to load geo data', err);
            } finally {
                setGeoQueryLoading(false);
            }
        };

        fetchData();
        if (activePerspective === 'terra') fetchGeoData();
    }, [activePerspective]);

    // Simulation: Load Mermaid data if AI mode is active
    const activeData = useMemo(() => {
        if (activePerspective === 'astro' && !data?.nodes.length) {
            // Demonstration of Mermaid Parsing
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
            // In native, we demonstrate the isomorphic intent with the layout data
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
            
            savedTranslateX.value = width / 2 - pos.x;
            savedTranslateY.value = height / 2.5 - pos.y;
            savedScale.value = 2;
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Theme.colors.sanctuarySaffron} />
                ></Box>
            );
        }

        if (activePerspective === 'astro' && data && layout) {
            return (
                <AstroView />
                    data={data as any} 
                    layout={layout} 
                    onNodePress={handleNodePress as any}
                    selectedNode={selectedNode as any}
                    width={width}
                    height={height}
                />
            >);
        }

        if (activePerspective === 'jyoti' && data) {
            return (
                <JyotiView />
                    data={data as any} 
                    layout={layout!} 
                    width={width}
                    height={height}
                />
            >);
        }

        if (activePerspective === 'terra' && data) {
            return (
                <TerraView />
                    data={data as any} 
                    layout={layout!} 
                    width={width}
                    height={height}
                />
            >);
        }

        if (activePerspective === 'dharma' && data) {
            return (
                <DharmaView />
                    data={data as any} 
                    layout={layout!} 
                    width={width}
                    height={height}
                />
            >);
        }

        if (activePerspective === 'vastu' && data && layout) {
            return (
                <VastuView >
                    data={data as any} 
                    layout={layout} 
                    onNodePress={handleNodePress as any}
                    selectedNode={selectedNode as any}
                    width={width}
                    height={height}
                />
            >);
        }

        return (
            <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
            ></Box>
        );
    };

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader>
                title="Knowledge Cosmos"
                subtitle="Isomorphic Visualization Engine"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={
                    <TouchableOpacity >
                        onPress={handleExport}
                        disabled={isExporting}
                        style={{ 
                            paddingHorizontal: 16, 
                            paddingVertical: 8, 
                            borderRadius: 12, 
                            backgroundColor: colors.action + '20',
                            flexDirection: 'row',
                            alignItems: 'center',
                            opacity: isExporting ? 0.5 : 1,
                            marginRight: 12
                        }}
                    
                        <FileCheck size={18} color={colors.action} style={{ marginRight: 8 }} /
                        ><Text sx={{ color: colors.action, fontSize: 13, fontWeight: '700' }}>
                            {isExporting ? '...' : 'EXPORT'}
                        </Text>
                    </TouchableOpacity>
                }
            /

            ><Box sx={{ p: 12, backgroundColor: colors.backgroundDark }}
                <View style={styles.perspectiveSwitcherContainer}>
                    <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 6 }}>
                            {getAvailablePerspectives(data).map((p) => {
                                const isActive = activePerspective === p.id;
                                const isDisabled = p.disabled;
                                const Icon = p.icon;
                                return (
                                    <TouchableOpacity >
                                        key={p.id}
                                        onPress={() => !isDisabled && setActivePerspective(p.id)}
                                        disabled={isDisabled}
                                        style={[
                                            styles.perspectiveButton,
                                            isActive && styles.activePerspectiveButton,
                                            isDisabled && { opacity: 0.3 }
                                        ]}
                                    
                                        <Icon >
                                            size={18} 
                                            color={isActive ? Theme.colors.sanctuarySaffron : Theme.colors.starlightGray} 
                                        />
                                        ><Text style={[
                                            styles.perspectiveLabel,
                                            isActive && styles.activePerspectiveLabel>
                                        ]}
                                            {p.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </BlurView>
                </View>
            </Box>

            <GestureHandlerRootView style={{ flex: 1 }}>
                <Box sx={{ 
                    flex: 1, 
                    backgroundColor: colors.obsidian || colors.black,
                    overflow: 'hidden'
                }}>
                    {renderContent()}

                    {selectedNode && (
                        <Animated.View >
                            entering={FadeInDown}
                            style={styles.nodeSheetContainer}>
                        
                            <BlurView intensity={30} tint="dark" style={styles.blurSheet}>
                                <VStack spacing={12}>
                                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <VStack>
                                            <Text >sx={{ fontSize: 20, fontWeight: '900', color: Theme.colors.sacredWhite }}
                                                {selectedNode.label}>
                                            </Text>
                                            <Text sx={{ fontSize: 12, fontWeight: '700', color: Theme.colors.sanctuarySaffron, textTransform: 'uppercase' }}>
                                                {selectedNode.type} " {selectedNode.group}>
                                            </Text>
                                        </VStack>
                                        <TouchableOpacity onPress={() => setSelectedNode(null)}
                                            <Box sx={{ p: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                <X size={20} color={colors.textPrimary} />
                                            ></Box>
                                        </TouchableOpacity>
                                    </HStack>

                                    {selectedNode.metadata?.description && (
                                        <Text sx={{ fontSize: 14, color: Theme.colors.starlightGray, lineHeight: 20 }}>
                                            {selectedNode.metadata.description}>
                                        </Text>
                                    )}

                                    <TouchableOpacity >
                                        style={[styles.actionButton, { backgroundColor: Theme.colors.sanctuarySaffron }]}
                                        onPress={() => {
                                            // @ts-ignore
                                            if (selectedNode.type === 'resource') {
                                                // @ts-ignore
                                                navigation.navigate('ResourceDetail', { id: selectedNode.id });
                                            }
                                        }}
                                    
                                        <Text sx={{ color: colors.obsidian || '#000', fontWeight: '800' }}>
                                            {selectedNode.type === 'topic' ? 'Explore Knowledge' : 'Begin Learning'}
                                        </Text>
                                    </TouchableOpacity>
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
    blurContainer: {
        flexDirection: 'row',
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
    },
    blurSheet: {
        padding: 24,
    },
    actionButton: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8
    }
});

function StatCardNative({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
    return (
        <Box sx={{ 
            flex: 1, 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: 16, 
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        }}>
            <Icon size={20} color={Theme.colors.sanctuarySaffron} /
            ><VStack>
                <Text >sx={{ fontSize: 10, color: Theme.colors.starlightGray }}>{label}</Text
                ><Text sx={{ fontSize: 18, fontWeight: '900', color: Theme.colors.sacredWhite }}>{value}</Text
            ></VStack>
        </Box>
    );
}

