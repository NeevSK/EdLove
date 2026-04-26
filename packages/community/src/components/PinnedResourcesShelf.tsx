import { Box, HStack, Icon, Pressable, ScrollView, Text, VStack } from '@repo/ui';
import { Bookmark, BookOpen, FileText, Film, Link as LinkIcon } from 'lucide-react-native';
import type React from 'react';

export interface PinnedResourcesShelfProps {
  resources: any[];
  onResourcePress?: (resource: any) => void;
}

function getResourceIcon(type: string) {
  switch (type) {
    case 'video':
      return { icon: Film, className: 'text-phase-interactive' };
    case 'pdf':
      return { icon: FileText, className: 'text-phase-interactive' };
    case 'doc':
      return { icon: FileText, className: 'text-phase-interactive' };
    case 'link':
      return { icon: LinkIcon, className: 'text-phase-interactive' };
    case 'lesson':
      return { icon: BookOpen, className: 'text-phase-interactive' };
    default:
      return { icon: Bookmark, className: 'text-ink/40' };
  }
}

export const PinnedResourcesShelf: React.FC<PinnedResourcesShelfProps> = ({
  resources,
  onResourcePress,
}) => {
  if (!resources || resources.length === 0) return null;

  return (
    <Box className="mb-4">
      <Text className="text-[10px] font-bold text-ink/40 px-1 mb-3 tracking-[2px] uppercase">
        Pinned Resources
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        accessibilityLabel="Pinned resources"
        accessibilityRole="scrollbar"
      >
        <HStack className="gap-3">
          {resources.map((resource) => {
            const { icon, className } = getResourceIcon(resource.type);
            return (
              <Pressable
                key={resource.id}
                onPress={() => onResourcePress?.(resource)}
                className="w-[150px] bg-phase-surface rounded-2xl p-4 border border-border active:bg-ink/5 transition-all shadow-sm"
              >
                <VStack className="gap-2.5">
                  <HStack className="items-center justify-between">
                    <Icon as={icon} size="xs" className={className} />
                    <Box className="px-1.5 py-0.5 rounded-md bg-ink/5">
                      <Text className="text-[9px] text-ink/40 font-bold uppercase tracking-wider">
                        {resource.type}
                      </Text>
                    </Box>
                  </HStack>
                  <VStack className="gap-0.5">
                    <Text numberOfLines={2} className="text-sm font-bold text-ink leading-tight">
                      {resource.title}
                    </Text>
                    <Text numberOfLines={1} className="text-[11px] font-medium text-ink/40">
                      {resource.subjects?.[0] || 'Resource'}
                    </Text>
                  </VStack>
                </VStack>
              </Pressable>
            );
          })}
        </HStack>
      </ScrollView>
    </Box>
  );
};

export default PinnedResourcesShelf;
