import { ResourceType } from '@repo/core/types';
import { File, FileText, Heart, Info, Link, Map, Plus, Video } from 'lucide-react-native';
import { Box, HStack, Text, VStack } from '../../primitives';
import { SanctuaryButton } from '../SanctuaryButton';
import { SanctuaryCard } from '../SanctuaryCard';

interface ResourceCardProps {
  title: string;
  description?: string;
  type: ResourceType;
  isPublic?: boolean;
  onPress: () => void;
  href?: string;
  onAddToDesk?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
}

const TYPE_CONFIG: Record<string, { icon: any; label: string }> = {
  pdf: { icon: File, label: 'PDF' },
  video: { icon: Video, label: 'Video' },
  link: { icon: Link, label: 'Link' },
  reading: { icon: FileText, label: 'Article' },
  doc: { icon: FileText, label: 'Document' },
  note: { icon: FileText, label: 'Note' },
  lesson: { icon: FileText, label: 'Lesson' },
  map: { icon: Map, label: 'Map' },
  infographic: { icon: Info, label: 'Visual' },
};

/**
 * ResourceCard - Universal platform card for digital assets.
 * Promoted from @repo/library to @repo/ui for shared consumption.
 */
export function ResourceCard({
  title,
  description,
  type,
  isPublic,
  onPress,
  href,
  onAddToDesk,
  onLike,
  isLiked,
}: ResourceCardProps) {
  const config = TYPE_CONFIG[type] || {
    icon: FileText,
    label: 'Resource',
  };
  const Icon = config.icon;

  const renderFooter = () => (
    <HStack className="justify-between items-center mt-2">
      <HStack className="gap-2">
        {onLike && (
          <SanctuaryButton
            onPress={onLike}
            variant="ghost"
            size="xs"
            leftIcon={Heart}
            iconProps={{ fill: isLiked ? 'currentColor' : 'none' }}
          >
            {isLiked ? 'Liked' : 'Like'}
          </SanctuaryButton>
        )}
        {onAddToDesk && (
          <SanctuaryButton onPress={onAddToDesk} variant="ghost" size="xs" leftIcon={Plus}>
            Add to Desk
          </SanctuaryButton>
        )}
      </HStack>
    </HStack>
  );

  return (
    <SanctuaryCard onPress={onPress} href={href} footer={renderFooter()} elevated>
      <HStack className="gap-3 items-center">
        <Box className="w-14 h-14 bg-phase-surface rounded-xl items-center justify-center border border-phase-border">
          <Icon className="text-phase-accent" size={24} />
          <Text className="text-[10px] font-bold text-phaseText-primary text-center mt-1">
            {config.label}
          </Text>
        </Box>
        <VStack className="flex-1">
          <Text className="text-base font-semibold text-phaseText-primary" numberOfLines={2}>
            {title}
          </Text>
          {description && (
            <Text className="text-sm text-phaseText-secondary" numberOfLines={2}>
              {description}
            </Text>
          )}
          {isPublic && (
            <Box className="self-start bg-phase-accent/5 px-1.5 py-0.5 rounded border border-phase-accent/20 mt-1">
              <Text className="text-[10px] font-semibold text-phase-accent">Public Resource</Text>
            </Box>
          )}
        </VStack>
      </HStack>
    </SanctuaryCard>
  );
}

export { ResourceCard as SharedResourceCard };
export default ResourceCard;
