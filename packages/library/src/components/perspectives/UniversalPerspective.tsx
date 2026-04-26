import React, { useState } from 'react';
import { 
    Theme, 
    useThemedColors, 
    Text, 
    HStack, 
    VStack, 
    Box,
    GlassCard,
    Pressable
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
    topologyId?: string;
    initialPerspective?: PerspectiveId;
    onNodePress?: (node: any) => void;
    selectedNodeId?: string;
    showToggle?: boolean;
    title?: string;
}

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
    
    const layout = usePerspectiveLayout(topology, {
        width: 1000,
        height: 1000,
        perspective
    });

    const handleShare = async () => {
        if (!topologyId) return;
        setIsSharing(true);
        try {
            const link = await mappingAPI.createShareLink(topologyId);
            await echoAPI.sendEcho({
                content: `Shared perspective "${perspective}" for topology "${title || topologyId}"`,
                is_anonymous: true,
                classroom_id: 'global',
            });
        } catch (err) {
            console.error('Sharing failed:', err);
        } finally {
            setIsSharing(false);
        }
    };

    const handleNodePress = (node: any) => {
        onNodePress?.(node);
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
        <Box className="flex-1">
            <Box className="absolute top-0 left-0 right-0 z-10 p-4 flex-row justify-between items-center">
                {title && <Text className="text-lg font-bold text-white tracking-widest">{title}</Text>}
                {topologyId && (
                    <Pressable 
                        onPress={handleShare} 
                        className={`w-9 h-9 rounded-full bg-white/10 items-center justify-center ${isSharing ? 'opacity-50' : ''}`}
                        disabled={isSharing}
                    >
                        <Share2 size={18} color="white" />
                    </Pressable>
                )}
            </Box>

            <Box className="flex-1">
                {renderPerspective()}
            </Box>

            {showToggle && (
                <GlassCard className="absolute bottom-6 left-5 right-5 py-3 px-4 rounded-[20px]">
                    <HStack className="justify-center gap-3">
                        <LensButton 
                            active={perspective === 'astro'} 
                            icon={Network} 
                            onPress={() => setPerspective('astro')} 
                            label="Constellation"
                        />
                        <LensButton 
                            active={perspective === 'vastu'} 
                            icon={GitBranch} 
                            onPress={() => setPerspective('vastu')} 
                            label="Mindmap"
                        />
                        <LensButton 
                            active={perspective === 'dharma'} 
                            icon={ArrowRightLeft} 
                            onPress={() => setPerspective('dharma')} 
                            label="Flow"
                        />
                        <LensButton 
                            active={perspective === 'vatya'} 
                            icon={Target} 
                            onPress={() => setPerspective('vatya')} 
                            label="Analysis"
                        />
                        <LensButton 
                            active={perspective === 'terra'} 
                            icon={MapIcon} 
                            onPress={() => setPerspective('terra')} 
                            label="Ecology"
                        />
                    </HStack>
                </GlassCard>
            )}
        </Box>
    );
};

const LensButton = ({ active, icon: Icon, onPress, label }: any) => {
    const colors = useThemedColors();
    return (
        <Pressable 
            onPress={onPress} 
            className={`flex-row items-center px-3 py-2 rounded-xl ${active ? 'bg-[#FFB30026]' : ''}`}
        >
            <Icon size={18} color={active ? Theme.colors.sanctuarySaffron : colors.textSecondary} />
            {active && <Text className="text-xs font-semibold ml-2" style={{ color: Theme.colors.sanctuarySaffron }}>{label}</Text>}
        </Pressable>
    );
};


