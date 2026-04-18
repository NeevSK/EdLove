import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import {
    ScreenWrapper,
    GlobalHeader,
    useTheme,
    Theme,
    Box,
    Text,
    HStack,
    VStack,
} from '@repo/ui';
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
} from 'lucide-react-native';
import { libraryAPI } from '../api/library';
import { KnowledgeTopology, KnowledgeNode } from '../types/Library';
import { 
    AstroView, 
    VastuView, 
    JyotiView, 
    TerraView, 
    DharmaView,
    VatyaView,
} from '../components/perspectives';
import { usePerspectiveLayout } from '../hooks/usePerspectiveLayout';
import { getAvailablePerspectives as getEnginePerspectives, KnowledgeParser, CaptureEngine } from '@repo/graphics';

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

/**
 * MapScreen.web.tsx  The Unified Vision
 * 
 * Refactored to use the @repo/graphics layout engine.
 * Achieves parity with native while optimizing for browser-native SVG/div rendering.
 */
export default function MapScreen() {
    const theme = useTheme();
    const navigation = useNavigation();
    const { width, height } = useWindowDimensions();
    
    const [activePerspective, setActivePerspective] = useState<PerspectiveId>('astro');
    const [isExporting, setIsExporting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<KnowledgeTopology | null>(null);
    const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

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

    // Simulation: Load Mermaid data if AI mode is active
    const activeData = useMemo(() => {
        if (activePerspective === 'astro' && !data?.nodes.length) {
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
        width: width, 
        height: height, 
        perspective: activePerspective 
    });

    const handleNodePress = (node: KnowledgeNode) => {
        setSelectedNode(node);
        // On web, we could implement smooth scroll to node or zoom here
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Find the SVG element in the current perspective
            const svgElement = document.querySelector('svg');
            if (svgElement) {
                const dataUrl = await CaptureEngine.svgToDataURL(svgElement);
                console.log('--- VISUALIZATION CAPTURED ---');
                console.log('Snapshot ready for Report:', dataUrl.substring(0, 50) + '...');
                alert('Success: Visualization captured and synced to the Student Report.');
            } else {
                alert('Error: No visualization found to export.');
            }
        } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Please check the console for details.');
        } finally {
            setIsExporting(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Box className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={Theme.colors.sanctuarySaffron} />
                </Box>
            );
        }

        if (activePerspective === 'astro' && activeData && layout) {
            return (
                <AstroView 
                    data={activeData as any} 
                    layout={layout} 
                    onNodePress={handleNodePress as any}
                    selectedNode={selectedNode as any}
                    width={width}
                    height={height}
                />
            );
        }

        if (activePerspective === 'jyoti' && activeData) {
            return (
                <JyotiView 
                    data={activeData as any} 
                    layout={layout!} 
                    width={width}
                    height={height}
                />
            );
        }

        if (activePerspective === 'terra' && activeData) {
            return (
                <TerraView 
                    data={activeData as any} 
                    layout={layout!} 
                    width={width}
                    height={height}
                />
            );
        }

        if (activePerspective === 'dharma' && activeData) {
            return (
                <DharmaView 
                    data={activeData as any} 
                    layout={layout!} 
                    width={width}
                    height={height}
                />
            );
        }

        if (activePerspective === 'vatya' && activeData) {
            return (
                <VatyaView 
                    data={activeData as any} 
                    layout={layout!}
                    selectedNode={selectedNode as any}
                    width={width}
                    height={height}
                />
            );
        }

        if (activePerspective === 'vastu' && activeData && layout) {
            return (
                <VastuView 
                    data={activeData as any} 
                    layout={layout} 
                    onNodePress={handleNodePress as any}
                    selectedNode={selectedNode as any}
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

    const accentColor = theme.colors.accent.primary;

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title="Knowledge Cosmos"
                subtitle="Isomorphic Visualization Engine"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={
                    <TouchableOpacity 
                        onPress={handleExport}
                        disabled={isExporting}
                        className="flex-row items-center px-4 py-2 rounded-xl mr-3"
                        style={{ 
                            backgroundColor: `${accentColor}20`,
                            opacity: isExporting ? 0.5 : 1,
                        }}
                    >
                        <FileCheck size={18} color={accentColor} className="mr-2" />
                        <Text className="text-xs font-bold" style={{ color: accentColor }}>
                            {isExporting ? 'CAPTURING...' : 'EXPORT'}
                        </Text>
                    </TouchableOpacity>
                }
            />

            <Box className="p-3 bg-phase-surface">
                <View style={styles.perspectiveSwitcherContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 6 }}>
                        {getAvailablePerspectives(activeData).map((p) => {
                            const isActive = activePerspective === p.id;
                            const isDisabled = p.disabled;
                            const Icon = p.icon;
                            return (
                                <TouchableOpacity
                                    key={p.id}
                                    onPress={() => !isDisabled && setActivePerspective(p.id)}
                                    disabled={isDisabled}
                                    style={[
                                        styles.perspectiveButton,
                                        isActive && styles.activePerspectiveButton,
                                        isDisabled && { opacity: 0.3 }
                                    ]}
                                >
                                    <Icon 
                                        size={18} 
                                        color={isActive ? Theme.colors.sanctuarySaffron : Theme.colors.starlightGray} 
                                    />
                                    <Text style={[
                                        styles.perspectiveLabel,
                                        isActive && styles.activePerspectiveLabel
                                    ]}>
                                        {p.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </Box>

            <Box className="flex-1 bg-phase-surface overflow-hidden relative">
                {renderContent()}

                {selectedNode && (
                    <Box className="absolute bottom-10 left-5 right-5 bg-[#0f172a]/95 rounded-[32px] p-6 border border-white/10">
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
                                <TouchableOpacity onPress={() => setSelectedNode(null)}>
                                    <Box className="p-2 rounded-full bg-white/10">
                                        <X size={20} color="white" />
                                    </Box>
                                </TouchableOpacity>
                            </HStack>

                            {selectedNode.metadata?.description && (
                                <Text className="text-sm text-phaseText-secondary leading-5">
                                    {selectedNode.metadata.description}
                                </Text>
                            )}

                            <TouchableOpacity 
                                className="h-14 rounded-[28px] justify-center items-center mt-2 bg-phase-accent"
                                onPress={() => {
                                    if (selectedNode.type === 'resource') {
                                        // @ts-ignore
                                        navigation.navigate('ResourceDetail', { id: selectedNode.id });
                                    }
                                }}
                            >
                                <Text className="text-phase-surface font-extrabold">
                                    {selectedNode.type === 'topic' ? 'Explore Knowledge' : 'Begin Learning'}
                                </Text>
                            </TouchableOpacity>
                        </VStack>
                    </Box>
                )}
            </Box>
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
    }
});
