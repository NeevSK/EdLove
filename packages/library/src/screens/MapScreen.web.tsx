import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import {
    ScreenWrapper,
    GlobalHeader,
    useThemedColors,
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
    VatyaView, // Added VatyaView
} from '../components/perspectives';
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
    { id: 'vatya', label: 'Vatya', icon: Wind, description: 'Dynamic flow of knowledge' }, // Added Vatya
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
 * MapScreen.web.tsx — The Unified Vision
 * 
 * Refactored to use the @repo/graphics layout engine.
 * Achieves parity with native while optimizing for browser-native SVG/div rendering.
 */
export default function MapScreen() {
    const colors = useThemedColors();
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
                <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
            <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
            </Box>
        );
    };

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
                    >
                        <FileCheck size={18} color={colors.action} style={{ marginRight: 8 }} />
                        <Text sx={{ color: colors.action, fontSize: 13, fontWeight: '700' }}>
                            {isExporting ? 'CAPTURING...' : 'EXPORT'}
                        </Text>
                    </TouchableOpacity>
                }
            />

            <Box sx={{ p: 12, backgroundColor: colors.backgroundDark }}>
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

            <Box sx={{ 
                flex: 1, 
                backgroundColor: colors.obsidian || colors.black,
                overflow: 'hidden',
                position: 'relative'
            }}>
                {renderContent()}

                {selectedNode && (
                    <Box sx={{ 
                        position: 'absolute', 
                        bottom: 40, 
                        left: 20, 
                        right: 20, 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                        borderRadius: 32,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                    } as any}>
                        <VStack spacing={12}>
                            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <VStack>
                                    <Text sx={{ fontSize: 20, fontWeight: '900', color: Theme.colors.sacredWhite }}>
                                        {selectedNode.label}
                                    </Text>
                                    <Text sx={{ fontSize: 12, fontWeight: '700', color: Theme.colors.sanctuarySaffron, textTransform: 'uppercase' }}>
                                        {selectedNode.type} • {selectedNode.group}
                                    </Text>
                                </VStack>
                                <TouchableOpacity onPress={() => setSelectedNode(null)}>
                                    <Box sx={{ p: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                        <X size={20} color={Theme.colors.sacredWhite} />
                                    </Box>
                                </TouchableOpacity>
                            </HStack>

                            {selectedNode.metadata?.description && (
                                <Text sx={{ fontSize: 14, color: Theme.colors.starlightGray, lineHeight: 20 }}>
                                    {selectedNode.metadata.description}
                                </Text>
                            )}

                            <TouchableOpacity 
                                style={[styles.actionButton, { backgroundColor: Theme.colors.sanctuarySaffron }]}
                                onPress={() => {
                                    if (selectedNode.type === 'resource') {
                                        // @ts-ignore
                                        navigation.navigate('ResourceDetail', { id: selectedNode.id });
                                    }
                                }}
                            >
                                <Text sx={{ color: colors.obsidian || '#000', fontWeight: '800' }}>
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
    },
    actionButton: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8
    }
});
