import React from 'react';
import { 
    useTheme, 
    Box, 
    VStack, 
    HStack, 
    Text, 
    ScrollView 
} from '@repo/ui';
import { Svg, Path, Circle } from 'react-native-svg';
import { CheckCircle2, Circle as CircleIcon, Lock } from 'lucide-react-native';
import { PerspectiveViewProps } from '@repo/graphics';

/**
 * DharmaView  The "Pathways / Sequential" Perspective (Native).
 * 
 * visualizes the knowledge graph as a learning journey. 
 * Provides a vertical timeline of 'milestones' derived from the node connectivity.
 */
export const DharmaView: React.FC<PerspectiveViewProps> = ({
    data,
}) => {
    const theme = useTheme();

    const actionColor = theme.accent.action;
    const textPrimary = theme.text.primary;
    const textSecondary = theme.text.secondary;

    // Derived logic for Dharma (Sequential Learning)
    // In a real knowledge graph, this would use topological sorting or PR rankings.
    // For the UI, we visualize it as a stepped pathway.
    const steps = data.nodes.map((node, index) => ({
        id: node.id,
        label: node.label,
        type: node.type,
        completed: index < 2, // Mock progress
        locked: index > 5,
        resonance: (node.val || 10) * 10,
    }));

    return (
        <ScrollView 
            className="flex-1"
            contentContainerStyle={{ padding: 24, paddingTop: 100, paddingBottom: 100 }}
        >
            <VStack className="gap-0">
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;
                    
                    return (
                        <HStack key={step.id} className="items-start gap-4">
                            {/* Visual Pathway Element */}
                            <VStack className="items-center w-8">
                                <Box 
                                    className="w-8 h-8 rounded-full items-center justify-center z-10"
                                    style={{ 
                                        backgroundColor: step.completed ? actionColor : (step.locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'),
                                        borderColor: step.completed ? actionColor : 'rgba(255,255,255,0.2)',
                                        borderWidth: 1
                                    }}
                                >
                                    {step.completed ? (
                                        <CheckCircle2 size={16} color="white" />
                                    ) : step.locked ? (
                                        <Lock size={14} color="rgba(255,255,255,0.3)" />
                                    ) : (
                                        <CircleIcon size={14} color={textSecondary} />
                                    )}
                                </Box>
                                
                                {!isLast && (
                                    <Box 
                                        className="w-1 flex-1 -my-1" 
                                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} 
                                    />
                                )}
                            </VStack>

                            {/* Step Description */}
                            <Box className="flex-1 pb-8">
                                <VStack className="gap-1">
                                    <HStack className="items-center justify-between">
                                        <Text 
                                            className={`text-md font-bold ${step.completed ? 'text-phaseText-primary' : 'text-phaseText-secondary'}`}
                                        >
                                            {step.label}
                                        </Text>
                                        <Text className="text-xs text-phaseText-muted font-mono uppercase tracking-wider">
                                            {step.type}
                                        </Text>
                                    </HStack>
                                    
                                    <Text className="text-sm text-phaseText-tertiary">
                                        Connecting to {step.resonance}% resonance in the topology.
                                    </Text>

                                    {/* Mini SVG Connection Visualizer */}
                                    <Box className="mt-2 h-10 w-full rounded-xl overflow-hidden bg-white/5 border border-white/5">
                                        <Svg height="40" width="100%">
                                            <Path 
                                                d="M0 20 Q 50 10, 100 25 T 200 20" 
                                                fill="none" 
                                                stroke={step.completed ? actionColor : 'rgba(255,255,255,0.1)'} 
                                                strokeWidth="2" 
                                            />
                                            <Circle cx="50" cy="15" r="3" fill={step.completed ? actionColor : 'transparent'} />
                                            <Circle cx="150" cy="22" r="3" fill={step.completed ? actionColor : 'transparent'} />
                                        </Svg>
                                    </Box>
                                </VStack>
                            </Box>
                        </HStack>
                    );
                })}
            </VStack>
        </ScrollView>
    );
};
