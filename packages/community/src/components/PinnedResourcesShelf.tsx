import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
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
        case 'video': return <Film size={18} className="text-secondary-400" />;
        case 'pdf': return <FileText size={18} className="text-error-500" />;
        case 'doc': return <FileText size={18} className="text-info-500" />;
        case 'link': return <LinkIcon size={18} className="text-success-500" />;
        case 'lesson': return <BookOpen size={18} className="text-primary-500" />;
        default: return <Bookmark size={18} className="text-muted-foreground" />;
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
                <HStack space="sm">
                    {resources.map((resource) => (
                        <TouchableOpacity
                            key={resource.id}
                            onPress={() => onResourcePress?.(resource)}
                            activeOpacity={0.75}
                        >
                            <Box className="w-[140px] bg-surface-lowest rounded-comfortable p-3 border border-outline-variant">
                                <VStack space="xs">
                                    <HStack space="xs" className="items-center">
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
                        </TouchableOpacity>
                    ))}
                </HStack>
            </ScrollView>
        </Box>
    );
};

export default PinnedResourcesShelf;
