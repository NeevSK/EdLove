import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Box, HStack, VStack, Text, Theme } from '@repo/ui';
import { BookOpen, FileText, Link as LinkIcon, Film, Bookmark } from 'lucide-react-native';
import { LibraryResource } from '@repo/library';

export interface PinnedResourcesShelfProps {
    resources: LibraryResource[];
    onResourcePress?: (resource: LibraryResource) => void;
}

function getResourceIcon(type: string): React.ReactElement {
    switch (type) {
        case 'video': return <Film size={18} color={Theme.colors.skyBlue} />;
        case 'pdf': return <FileText size={18} color={Theme.colors.emberRed} />;
        case 'doc': return <FileText size={18} color={Theme.colors.gurudeviBlue} />;
        case 'link': return <LinkIcon size={18} color={Theme.colors.sageGreen} />;
        case 'lesson': return <BookOpen size={18} color={Theme.colors.sanctuarySaffron} />;
        default: return <Bookmark size={18} color={Theme.colors.mistGray} />;
    }
}

export const PinnedResourcesShelf: React.FC<PinnedResourcesShelfProps> = ({
    resources,
    onResourcePress,
}) => {
    if (!resources || resources.length === 0) return null;

    return (
        <Box mb="$3"
            <Text size="xs" bold color={Theme.colors.mistGray} px="$1" mb="$2" style={{ letterSpacing: 1 }}
                PINNED RESOURCES
            </Text
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}
                accessibilityLabel="Pinned resources"
                accessibilityRole="scrollbar"
            
                <HStack space="sm"
                    {resources.map((resource) => (
                        <TouchableOpacity
                            key={resource.id}
                            onPress={() => onResourcePress?.(resource)}
                            activeOpacity={0.75}
                        
                            <Box
                                sx={{
                                    width: 140,
                                    backgroundColor: Theme.colors.shroud,
                                    borderRadius: Theme.corners.comfortable,
                                    padding: Theme.spacing.sm,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.glass.dark.border,
                                }}
                            
                                <VStack space="xs"
                                    <HStack space="xs" alignItems="center"
                                        {getResourceIcon(resource.type)}
                                        <Text
                                            size="xs"
                                            color={Theme.colors.mistGray}
                                            style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                                        
                                            {resource.type}
                                        </Text
                                    </HStack
                                    <Text
                                        size="sm"
                                        bold
                                        color={Theme.colors.sacredWhite}
                                        numberOfLines={2}
                                    
                                        {resource.title}
                                    </Text
                                    <Text
                                        size="xs"
                                        color={Theme.colors.dimGray}
                                        numberOfLines={1}
                                    
                                        {resource.subjects?.[0] || ''}
                                    </Text
                                </VStack
                            </Box
                        </TouchableOpacity
                    ))}
                </HStack
            </ScrollView
        </Box
    );
};

export default PinnedResourcesShelf;
