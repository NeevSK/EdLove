import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Theme, useThemedColors, Text, Box } from '@repo/ui';
import { CheckCircle2, Circle } from 'lucide-react-native';
import type { 
    PerspectiveViewProps, 
    GraphNode 
} from '@repo/graphics';

/**
 * DharmaView.web  The "Path" Perspective (Web).
 * 
 * Renders nodes in a scrollable vertical pathway.
 * Uses standard div/flex for the list and SVG for the spine.
 */
export const DharmaView: React.FC<PerspectiveViewProps> = ({
    data,
    onNodePress,
}) => {
    const colors = useThemedColors();
    const { width: windowWidth } = useWindowDimensions();

    const orderedNodes = useMemo(() => {
        return [...data.nodes]
            .filter(n => n.path?.order !== undefined)
            .sort((a, b) => (a.path!.order || 0) - (b.path!.order || 0));
    }, [data.nodes]);

    return (
        <View style={styles.container}>
            <div style={{ 
                height: '100%', 
                overflowY: 'auto', 
                paddingBottom: 150, 
                paddingTop: 120,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {orderedNodes.map((item, index) => {
                    const isLast = index === orderedNodes.length - 1;
                    const isEven = index % 2 === 0;
                    const xOffset = isEven ? -40 : 40;

                    return (
                        <Box key={item.id} className="h-[160px] w-full items-center justify-center relative">
                            {/* Connecting Spine Segment */}
                            {!isLast && (
                                <div style={{ position: 'absolute', top: 80, left: 0, right: 0, bottom: -80, zIndex: -1 }}>
                                    <svg width="100%" height="160" viewBox={`0 0 ${windowWidth} 160`} preserveAspectRatio="none">
                                        <path
                                            d={`M ${windowWidth/2 + xOffset} 0 
                                               C ${windowWidth/2 + xOffset} 40, 
                                                 ${windowWidth/2 - xOffset} 40, 
                                                 ${windowWidth/2 - xOffset} 160`}
                                            stroke={colors.action}
                                            strokeWidth={4}
                                            strokeDasharray="8 8"
                                            fill="none"
                                            opacity={0.3}
                                        />
                                    </svg>
                                </div>
                            )}

                            {/* Node Button */}
                            <div style={{ transform: `translateX(${xOffset}px)` }}>
                                <TouchableOpacity 
                                    onPress={() => onNodePress?.(item)}
                                    style={[
                                        styles.nodeCircle, 
                                        { 
                                            backgroundColor: colors.secondary,
                                            borderColor: colors.action,
                                        }
                                    ]}
                                >
                                    {item.type === 'topic' ? (
                                        <CheckCircle2 size={32} color={colors.action} />
                                    ) : (
                                        <Circle size={32} color={colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                                
                                <div style={{ 
                                    position: 'absolute', 
                                    width: 120, 
                                    left: isEven ? 90 : -130, 
                                    top: 20,
                                    textAlign: isEven ? 'left' : 'right'
                                }}>
                                    <Text className="font-bold text-sm text-phaseText-primary" numberOfLines={2}>
                                        {item.label}
                                    </Text>
                                    <Text className="text-[10px] text-phaseText-tertiary">
                                        {item.type.toUpperCase()}
                                    </Text>
                                </div>
                            </div>
                        </Box>
                    );
                })}
            </div>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    nodeCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
