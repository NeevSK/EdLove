import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Theme, useThemedColors, SanctuaryFlashList, Text, Box } from '@repo/ui';
import { Lock, CheckCircle2, Circle } from 'lucide-react-native';
import type { 
    PerspectiveViewProps, 
    GraphNode 
} from '@repo/graphics';

/**
 * DharmaView  The "Path / Sequential" Perspective (Native).
 * 
 * Renders nodes in a scrollable vertical pathway (Kinnu/Duolingo style).
 * Features an SVG "spine" that connects the nodes visually.
 */
export const DharmaView: React.FC<PerspectiveViewProps> = ({
    data,
    onNodePress,
}) => {
    const colors = useThemedColors();
    const { width: windowWidth } = useWindowDimensions();

    // The pathLayout in @repo/graphics provides the sort order
    // But since Dharma is a list, we primarily care about the ordered nodes.
    const orderedNodes = useMemo(() => {
        return [...data.nodes]
            .filter(n => n.path?.order !== undefined)
            .sort((a, b) => (a.path!.order || 0) - (b.path!.order || 0));
    }, [data.nodes]);

    const renderItem = ({ item, index }: { item: GraphNode, index: number }) => {
        const isLast = index === orderedNodes.length - 1;
        const isEven = index % 2 === 0;
        const xOffset = isEven ? -40 : 40;

        return (
            <Box sx={{ height: 160, alignItems: 'center', justifyContent: 'center' }}
                {/* Connecting Spine Segment */}
                {!isLast && (
                    <View style={styles.spineContainer}
                        <Svg width={windowWidth} height={160} viewBox={`0 0 ${windowWidth} 160`}
                            <Path
                                d={`M ${windowWidth/2 + xOffset} 80 
                                   C ${windowWidth/2 + xOffset} 120, 
                                     ${windowWidth/2 - xOffset} 120, 
                                     ${windowWidth/2 - xOffset} 240`}
                                stroke={colors.action}
                                strokeWidth={4}
                                strokeDasharray="8 8"
                                fill="none"
                                opacity={0.3}
                            /
                        </Svg
                    </View
                )}

                {/* Node Button */}
                <Animated.View 
                    entering={FadeInDown.delay(index * 100)}
                    style={{
                        transform: [{ translateX: xOffset }]
                    }}
                
                    <TouchableOpacity 
                        onPress={() => onNodePress?.(item)}
                        style={[
                            styles.nodeCircle, 
                            { 
                                backgroundColor: colors.secondary,
                                borderColor: colors.action,
                                shadowColor: colors.action
                            }
                        ]}
                    
                        {item.type === 'topic' ? (
                            <CheckCircle2 size={32} color={Theme.colors.sanctuarySaffron} /
                        ) : (
                            <Circle size={32} color={colors.textSecondary} /
                        )}
                    </TouchableOpacity
                    
                    <View style={[styles.labelContainer, { transform: [{ translateX: isEven ? 80 : -140 }] }]}
                        <Text {...({ color: colors.text, bold: true, size: "sm" } as any)} numberOfLines={2}
                            {item.label}
                        </Text
                        <Text {...({ color: colors.textTertiary, size: "xxs" } as any)}
                            {item.type.toUpperCase()}
                        </Text
                    </View
                </Animated.View
            </Box
        );
    };

    return (
        <View style={styles.container}
            <SanctuaryFlashList
                data={orderedNodes}
                renderItem={renderItem}
                estimatedItemSize={160}
                contentContainerStyle={{ paddingTop: 120, paddingBottom: 150 }}
            /
        </View
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    nodeCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    spineContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    labelContainer: {
        position: 'absolute',
        width: 120,
        top: 20,
    }
});
