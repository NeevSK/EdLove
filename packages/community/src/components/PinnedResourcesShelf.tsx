import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { Box, HStack, VStack, Text, Theme } from '@repo/ui';
import { BookOpen, FileText, Link as LinkIcon, Film, Bookmark } from 'lucide-react-native';

// Import correctly from the source if possible, or define type locally if it's just a ref
// Assuming LibraryResource might be needed for types
export interface PinnedResourcesShelfProps {
    resources: any[]; // Decoupling from @repo/library for this heal to avoid circular/dependency issues
    onResourcePress?: (resource: any) => void;
}

function getResourceIcon(type: string): React.ReactElement {
    switch (type) {
        case 'video': return <Film size={18} color="#3498DB" />;
        case 'pdf': return <FileText size={18} color="#E74C3C" />;
        case 'doc': return <FileText size={18} color="#3498DB" />;
        case 'link': return <LinkIcon size={18} color="#2ECC71" />;
        case 'lesson': return <BookOpen size={18} color="#E67E22" />;
        default: return <Bookmark size={18} color="rgba(255,255,255,0.4)" />;
    }
}

export const PinnedResourcesShelf: React.FC<PinnedResourcesShelfProps> = ({
    resources,
    onResourcePress,
}) => {
    if (!resources || resources.length === 0) return null;

    return (
        <Box className="mb-3">
            <Text className="text-[10px] font-extrabold text-muted-foreground px-1 mb-2 tracking-widest uppercase">
                PINNED RESOURCES
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}
                accessibilityLabel="Pinned resources"
                accessibilityRole="scrollbar"
            >
                <HStack className="gap-2">
                    {resources.map((resource) => (
                        <Pressable
                            key={resource.id}
                            onPress={() => onResourcePress?.(resource)}
                        >
                            <Box className="w-[140px] bg-surface-lowest rounded-xl p-3 border border-outline-variant active:bg-white/5">
                                <VStack className="gap-1">
                                    <HStack className="items-center gap-1.5">
                                        {getResourceIcon(resource.type)}
                                        <Text className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            {resource.type}
                                        </Text>
                                    </HStack>
                                    <Text
                                        numberOfLines={2}
                                        className="text-sm font-bold text-foreground"
                                    >
                                        {resource.title}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        className="text-[11px] text-muted-foreground"
                                    >
                                        {resource.subjects?.[0] || ''}
                                    </Text>
                                </VStack>
                            </Box>
                        </Pressable>
                    ))}
                </HStack>
            </ScrollView>
        </Box>
    );
};

export default PinnedResourcesShelf;
