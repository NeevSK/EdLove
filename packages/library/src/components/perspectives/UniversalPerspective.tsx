import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { 
    Theme, 
    useThemedColors, 
    Text, 
    HStack, 
    VStack, 
    Box,
    GlassCard
} from '@repo/ui';
import { 
    PerspectiveId, 
    KnowledgeTopology, 
    PerspectiveViewProps 
} from '@repo/graphics';
import { AstroView } from './AstroView';
import { VastuView } from './VastuView';
import { DharmaView } from './DharmaView';
import { TerraView } from './TerraView';
import { VatyaView } from './VatyaView';
import { JyotiView } from './JyotiView';
import { usePerspectiveLayout } from '../../hooks/usePerspectiveLayout';
import { 
    mappingAPI,
    echoAPI
} from '@repo/core';
import { 
    Network, 
    Share2, 
    GitBranch, 
    ArrowRightLeft, 
    Map as MapIcon, 
    LayoutGrid,
    Target,
    Activity
} from 'lucide-react-native';

interface UniversalPerspectiveProps {
    topology: KnowledgeTopology;
    topologyId?: string; // Optional ID for sharing and peering
    initialPerspective?: PerspectiveId;
    onNodePress?: (node: any) => void;
    selectedNodeId?: string;
    showToggle?: boolean;
    title?: string;
}

/**
 * UniversalPerspective  The "Versatile Toolkit" Shell.
 * 
 * Allows any role (Student, Teacher, Founder) to render any topology
 * through any decoupled "lens" (Mind-map, Flowchart, Constellation, etc).
 */
export const UniversalPerspective: React.FC<UniversalPerspectiveProps> = ({
    topology,
    topologyId,
    initialPerspective = 'astro',
    onNodePress,
    selectedNodeId,
    showToggle = true,
    title
}) => {
    const colors = useThemedColors();
    const [perspective, setPerspective] = useState<PerspectiveId>(initialPerspective);
    const [isSharing, setIsSharing] = useState(false);
    
    // Auto-calculate layout based on chosen perspective lens
    const layout = usePerspectiveLayout(topology, {
        width: 1000, // Virtual coordinates for @repo/graphics
        height: 1000,
        perspective
    });

    const handleShare = async () => {
        if (!topologyId) return;
        setIsSharing(true);
        try {
            const link = await mappingAPI.createShareLink(topologyId);
            console.log('Generated Peer-to-Peer Link:', link);
            // In a real app, use Share.share({ message: link })
            
            // Emit an Echo signal for "Sharing"
            await echoAPI.sendEcho({
                content: `Shared perspective "${perspective}" for topology "${title || topologyId}"`,
                is_anonymous: true,
                classroom_id: 'global', // Generic scope for ecological pulses
            });
        } catch (err) {
            console.error('Sharing failed:', err);
        } finally {
            setIsSharing(false);
        }
    };

    const handleNodePress = (node: any) => {
        onNodePress?.(node);
        // Peering: Interaction resonance
        if (topologyId) {
            echoAPI.sendEcho({
                content: `Interacted with node "${node.label}" in "${perspective}" view`,
                is_anonymous: true,
                classroom_id: 'global', 
            }).catch(() => {});
        }
    };

    const renderPerspective = () => {
        const props: PerspectiveViewProps = {
            data: topology,
            layout: layout!,
            onNodePress: handleNodePress,
            selectedNode: topology.nodes.find(n => n.id === selectedNodeId),
            width: 1000,
            height: 1000
        };

        switch (perspective) {
            case 'astro': return <AstroView {...props} />;
            case 'vastu': return <VastuView {...props} />;
            case 'dharma': return <DharmaView {...props} />;
            case 'terra': return <TerraView {...props} />;
            case 'vatya': return <VatyaView {...props} />;
            case 'jyoti': return <JyotiView {...props} />;
            default: return <AstroView {...props} />;
        }
    };

    if (!layout) return null;

    return (
        <View style={styles.container}
            <View style={styles.header}
                {title && <Text style={styles.title}>{title}</Text>}
                {topologyId && (
                    <TouchableOpacity 
                        onPress={handleShare} 
                        style={[styles.shareBtn, isSharing && { opacity: 0.5 }]}
                        disabled={isSharing}
                    
                        <Share2 size={18} color="white" /
                    </TouchableOpacity
                )}
            </View

            <View style={styles.viewer}
                {renderPerspective()}
            </View

            {showToggle && (
                <GlassCard style={styles.toggleBar}
                    <HStack space="md" justifyContent="center"
                        <LensButton 
                            active={perspective === 'astro'} 
                            icon={Network} 
                            onPress={() => setPerspective('astro')} 
                            label="Constellation"
                        /
                        <LensButton 
                            active={perspective === 'vastu'} 
                            icon={GitBranch} 
                            onPress={() => setPerspective('vastu')} 
                            label="Mindmap"
                        /
                        <LensButton 
                            active={perspective === 'dharma'} 
                            icon={ArrowRightLeft} 
                            onPress={() => setPerspective('dharma')} 
                            label="Flow"
                        /
                        <LensButton 
                            active={perspective === 'vatya'} 
                            icon={Target} 
                            onPress={() => setPerspective('vatya')} 
                            label="Analysis"
                        /
                         <LensButton 
                            active={perspective === 'terra'} 
                            icon={MapIcon} 
                            onPress={() => setPerspective('terra')} 
                            label="Ecology"
                        /
                    </HStack
                </GlassCard
            )}
        </View
    );
};

const LensButton = ({ active, icon: Icon, onPress, label }: any) => {
    const colors = useThemedColors();
    return (
        <TouchableOpacity 
            onPress={onPress} 
            style={[styles.lensBtn, active && styles.lensBtnActive]}
        
            <Icon size={18} color={active ? Theme.colors.sanctuarySaffron : colors.textSecondary} /
            {active && <Text style={styles.lensLabel}>{label}</Text>}
        </TouchableOpacity
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    shareBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        letterSpacing: 0.5,
    },
    viewer: {
        flex: 1,
    },
    toggleBar: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        paddingVertical: 12,
        borderRadius: 20,
    },
    lensBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 8,
    },
    lensBtnActive: {
        backgroundColor: 'rgba(255, 179, 0, 0.15)',
    },
    lensLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Theme.colors.sanctuarySaffron,
    }
});
